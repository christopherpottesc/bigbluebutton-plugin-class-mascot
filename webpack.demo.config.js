/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

// Local demo: runs the plugin outside BBB, with the SDK replaced by demo/sdk-mock.ts.
module.exports = {
  entry: './demo/index.tsx',
  output: {
    filename: 'demo.js',
    path: path.resolve(__dirname, 'dist-demo'),
    publicPath: '/',
  },
  devServer: {
    port: 4702,
    host: 'localhost',
    static: [
      { directory: path.resolve(__dirname, 'demo/static') },
      { directory: path.resolve(__dirname, 'public') },
    ],
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.tsx?$/,
        use: { loader: 'ts-loader', options: { transpileOnly: true } },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.tsx', '.ts'],
    alias: {
      'bigbluebutton-html-plugin-sdk$': path.resolve(__dirname, 'demo/sdk-mock.ts'),
    },
  },
};
