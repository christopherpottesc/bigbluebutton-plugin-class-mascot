# AGENTS.md

AI development guidelines for class-mascot.

## Project Overview

BigBlueButton plugin. The class has a mascot that grows from level 1 to 10 as students participate: the teacher confirms each participation (+1 point) and the mascot loses a point after a configurable time without participation. Everyone in the room sees the mascot in a floating window; only moderators can change it.

## Project Structure

```text
src/index.tsx                     # Entry point; derives assetsBaseUrl from the script URL
src/class-mascot/component.tsx    # SDK wiring (data channel, floating window, sidebar panel)
src/class-mascot/state.ts         # Points rules as pure functions (+1, reset, inactivity), tested
src/class-mascot/control-panel/   # Moderator settings, rendered in the sidebar panel
src/class-mascot/floating-mascot/ # Floating window content and its saved position
src/class-mascot/mascot-view/     # Mascot with level and progress bar; level change animation and announcement
src/class-mascot/mascot-image/    # Mascot picture (or emoji placeholder) in large and small sizes
src/class-mascot/relay.ts         # Temporary state relay client (see Pitfalls)
demo/                             # Runs the plugin outside BBB with a mocked SDK
public/assets/                    # Mascot images and the panel illustration
manifest.json                     # Plugin manifest, read by BBB when a room is created
```

## Technology Stack

- **Language**: TypeScript, React 18
- **Plugin SDK**: `bigbluebutton-html-plugin-sdk` 1.0.0-beta.3 (branch `v1.x`)
- **UI**: `@bigbluebutton/bbb-ui-components-react` with styled-components
- **Build**: webpack (`ts-loader`)
- **Linting**: ESLint (Airbnb + airbnb-typescript) and Prettier

## Common Commands

- `make help` - Show all available commands
- `make install` - Install dependencies
- `make run` - Serve manifest, bundle and state relay on http://localhost:4701
- `make demo` - Run the plugin outside BBB on http://localhost:4702
- `make lint` - ESLint, type-check and Prettier check
- `make test` - Unit tests (Jest) for the points rules
- `make format` - Format code
- `make build` - Production bundle in `dist/`

Unit tests cover the points rules in `state.ts`. Verify UI changes in the demo (`?role=moderator` and `?role=viewer` in two tabs share the same state) and in a BBB room.

## Testing in a BBB room

1. `make run`, then expose it with `cloudflared tunnel --url http://localhost:4701`. Do not use the free ngrok: its warning page replaces the JS bundle.
2. In the `create` API call, add `pluginManifests=[{"url":"https://<tunnel>/manifest.json"}]` (plural) with a new `meetingID`.
3. Join as moderator; open a second, private window as attendee to check what students see.

## Pitfalls

- **Inactivity is derived, not applied by a timer.** Every client computes the current level from `points`, `lastActivityAt` and `inactivityMinutes` (`normalize`), so it keeps decaying with no moderator in the room. Any change must go through the functions in `state.ts`, which fold the elapsed decay in before saving.
- **Manifest is read only when the room is created.** Changing `manifest.json` needs a new room; changing code only needs a page reload, since the bundle is fetched on join.
- **Some servers do not persist the data channel.** `pluginDataChannelPushEntry` can return `true` without storing anything. As a fallback, state also goes through a relay in the dev server (`webpack.config.js`, `src/class-mascot/relay.ts`): in memory, no authentication, only while `make run` is up. The data channel wins as soon as it has entries.
- **`pushEntry` starts undefined.** The SDK only sets it once BBB builds the data channel; always guard before calling it.
- **Floating window and sidebar panel render in roots the plugin creates once.** BBB calls `contentFunction` a single time per window/panel id, so content is updated by re-rendering the stored root (reading the latest values from a ref), and only while its element is still in the page (BBB unmounts the panel when it closes).
- **Keep the floating window id fixed.** A new id makes BBB mount a new window and lose where it was dragged. The position is read from react-draggable's `transform: translate(...)` and saved in `localStorage`.
- **Sidebar panels may already be listed in the apps gallery.** Do not add an `AppsGalleryEntry` too, or the plugin appears twice.
- **Respect reduced motion.** Level change animations are disabled under `prefers-reduced-motion`; keep it that way for new ones.
- **The client may use a dark theme.** Use the color tokens from `@bigbluebutton/bbb-ui-components-react`, not hard-coded colors, and transparent backgrounds in images.

## Assets

- Mascot images: `public/assets/mascots/<mconfito|caramelo|frajola>/<1..10>.png`, 200x200 PNG with transparent background, shown at 100x100. Missing images fall back to an emoji.
- Panel illustration: `public/assets/mascot_panel.svg` (16:9, 1920x1088); the current file is a placeholder.
