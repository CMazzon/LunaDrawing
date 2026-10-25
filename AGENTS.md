Luna Drawing: an Expo / React Native drawing app for kids 3+ (iOS + Android). See README.md.

## Product rules

- No accounts, ads, analytics, network calls or external links.
- Kid-facing UI is icon-only (no reading needed), with big touch targets.
- Everything must be undoable, including "clear".

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. Before writing code that touches an Expo, EAS, React Native or Skia API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. Check the installed typings in `node_modules` (e.g. Skia 2.x paths are immutable; build them with `Skia.PathBuilder`).

## Commands

```bash
npx expo install <package>  # ALWAYS use instead of npm add — resolves SDK-compatible versions
npm start                   # dev server (Expo Go)
npm run web                 # browser preview (copies Skia's wasm into public/)
npm run drawings            # regenerate src/drawings/generated.ts from drawings/*.svg
npm test                    # jest, runs real Skia (CanvasKit) in Node
npm run typecheck
```

Run tests and typecheck before declaring any task done.

## Architecture

- Navigation is a single `useState` in `App.tsx` (two screens). No router needed.
- `src/engine/` holds all drawing logic and has no React code. A picture is a list of `Action`s
  (strokes and fills); `render.ts` records them into Skia pictures.
- Touch input uses React Native's responder system on the paper `View` (no gesture library).
- On web, `src/start.web.ts` loads CanvasKit before requiring the app; any module that calls
  `Skia.*` at import time would break the web build, so build Skia objects lazily.

## Rules

- `ios/` and `android/` are generated (Continuous Native Generation). Never edit them by hand — configure native behavior in `app.json` and config plugins.
- Never edit `src/drawings/generated.ts` by hand.
