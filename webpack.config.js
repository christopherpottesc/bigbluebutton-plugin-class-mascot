/* eslint-disable @typescript-eslint/no-var-requires */
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
  entry: './src/index.tsx',
  output: {
    filename: 'ClassMascot.js',
    library: 'ClassMascot',
    libraryTarget: 'umd',
    publicPath: '/',
    globalObject: 'this',
  },
  devServer: {
    allowedHosts: 'all',
    port: 4701,
    host: '0.0.0.0',
    hot: false,
    liveReload: false,
    client: {
      overlay: false,
    },
    onBeforeSetupMiddleware: (devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      // State relay for servers that do not persist the
      // plugin's data channel, so moderators also POST the mascot state here and
      // viewers poll it. Kept in memory, one entry per meeting, no authentication.
      const relayStates = new Map();
      const MAX_RELAY_BODY_BYTES = 2048;
      devServer.app.use('/state', (req, res, next) => {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.set('Cache-Control', 'no-store');
        if (req.method === 'OPTIONS') {
          res.sendStatus(204);
          return;
        }
        next();
      });
      devServer.app.get('/state/:meetingId', (req, res) => {
        const state = relayStates.get(req.params.meetingId);
        if (!state) {
          res.sendStatus(204);
          return;
        }
        res.json(state);
      });
      devServer.app.post('/state/:meetingId', (req, res) => {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
          if (body.length > MAX_RELAY_BODY_BYTES) req.destroy();
        });
        req.on('end', () => {
          try {
            const state = JSON.parse(body);
            if (typeof state.model !== 'string' || typeof state.points !== 'number') {
              res.sendStatus(400);
              return;
            }
            relayStates.set(req.params.meetingId, state);
            res.sendStatus(204);
          } catch {
            res.sendStatus(400);
          }
        });
      });

      // Serve manifest.json from the project root when requested at /manifest.json
      devServer.app.get('/manifest.json', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'manifest.json'));
      });
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.tsx', '.ts'],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'manifest.json', to: './' }, // Copy manifest.json to static/ in the output folder
        { from: 'public/assets/mascots', to: './assets/mascots', noErrorOnMissing: true },
        { from: 'public/assets/mascot_panel.svg', to: './assets/', noErrorOnMissing: true },
      ],
    }),
  ],
};
