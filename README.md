# 🎨 Luna Drawing

A super simple drawing and coloring app for kids 3+, for **iOS and Android**.

- **No accounts, no ads, no internet, no tracking.** Nothing leaves the device.
- **No reading needed.** Every button is a big picture.
- **Magic brushes:** crayon 🖍️, rainbow 🌈, glowing neon 💡, sparkles ✨, stamps ⭐ ❤️ 🌸 🫧, paint bucket 🪣, eraser 🧽.
- **Mirror 🦋 and kaleidoscope ❄️ modes:** one scribble becomes a butterfly or a snowflake.
- **Coloring pages** that fill like a real bucket: tap the cat's face and the eyes stay white.
- **Night paper 🌙:** a dark page where the neon brush glows.
- **Undo everything**, even the trash can, so an accidental tap never loses a picture.
- **Save to Photos 📸** with a little celebration.

Built with [Expo](https://expo.dev) (React Native) and [React Native Skia](https://shopify.github.io/react-native-skia/): one TypeScript codebase for both stores.

## Run it on your phone (5 minutes)

You need [Node.js](https://nodejs.org) 20+.

```bash
npm install
npm start
```

Then scan the QR code with the **Expo Go** app ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)).
The project uses **Expo SDK 58**, so Expo Go needs to support SDK 58.

You can also try it in a browser with `npm run web` (handy for quick checks; the phone is the real thing).

## Add a new drawing (the easy part)

Coloring pages are plain SVG files in [`drawings/`](drawings/).

1. Draw a picture in any vector editor (Figma, Inkscape, Illustrator…) or by hand, using **closed shapes**.
2. Save it as `drawings/<name>.svg`. Put a `<title>` in it for the name.
3. Run:
   ```bash
   npm run drawings
   ```
4. Done. It shows up on the home screen.

SVG rules:

| Rule | Why |
| --- | --- |
| The `<svg>` needs a `viewBox` | so the picture can be scaled to any screen |
| Use `path`, `circle`, `ellipse`, `rect`, `polygon`, `polyline`, `line` | the supported shapes |
| Every shape gets a black outline | |
| A shape with `fill="none"` is just a line (whiskers, smiles) | everything else can be tapped to fill |
| Later shapes sit on top of earlier ones | like normal SVG; a filled face won't paint over its eyes |
| No `transform` attributes | flatten them first (Inkscape: *Path → Object to Path*; Figma: *Flatten*) |
| Thick lines (`stroke-width="8"` on a 400×400 viewBox) | easy for small fingers to color inside |

Look at [`drawings/cat.svg`](drawings/cat.svg) for an example. `npm test` checks that every drawing parses and that `src/drawings/generated.ts` is up to date.

## Project layout

```
drawings/              SVG coloring pages (add yours here)
scripts/build-drawings.js  SVG → src/drawings/generated.ts
src/
  engine/              drawing logic, no UI
    brushes.ts         how each brush paints (crayon, rainbow, neon, sparkle, stamps, eraser) + symmetry
    stamps.ts          stamp shapes
    page.ts            coloring pages: shapes, fill regions, tap → region
    render.ts          turns the list of actions into Skia pictures
    history.ts         undo / clear
  screens/             HomeScreen (pick a page) and DrawScreen (draw!)
  components/          big round buttons, color palette, thumbnails, celebration
  theme.ts             colors, tools, sizes: tweak the look here
```

How drawing works: every stroke and fill is stored as a small action (`{ brush, color, points… }`).
The screen re-paints the actions into a Skia picture, so undo is just "drop the last action",
and each brush is one function in `brushes.ts`. Adding a brush = add an id in `engine/types.ts`,
a painter in `brushes.ts`, and a button in `theme.ts`.

## Checks

```bash
npm test            # engine + drawings tests (runs real Skia in Node)
npm run typecheck
```

## Install from the web (PWA)

The web version is a Progressive Web App: open it in Chrome on Android (or Safari on iPad),
then **⋮ → Add to Home screen** / **Install app** (Safari: **Share → Add to Home Screen**).
It gets its own icon, opens full screen with no browser bars, and works offline after the first visit.
On the web, 📸 downloads the picture instead of saving to Photos, and there's no vibration.

Hosting: [`.github/workflows/deploy-web.yml`](.github/workflows/deploy-web.yml) publishes it to
GitHub Pages at `https://<user>.github.io/LunaDrawing/` on every push.
One-time setup: repo **Settings → Pages → Source: GitHub Actions**.
(GitHub Pages needs a public repo or a paid GitHub plan. Any static host works too:
run `npx setup-skia-web public && npx expo export --platform web` and upload the `dist` folder, e.g. to Netlify Drop.
Set `EXPO_BASE_URL=/some/path` when the site doesn't live at the domain root.)

PWA files: `public/index.html` (page template), `public/manifest.json`, `public/sw.js` (offline cache),
icons in `public/` (regenerate with `python3 scripts/make-icons.py`).

## Install on an Android tablet or phone (APK)

Builds run on Expo's servers (EAS), so you don't need Android Studio. You need a free account at [expo.dev](https://expo.dev/signup).

```bash
npx eas-cli@latest login
npx eas-cli@latest init        # first time only: links this folder to an Expo project
npx eas-cli@latest build --platform android --profile preview
```

The build takes about 10–15 minutes. When it's done, the terminal shows a **QR code**: scan it with the tablet,
download the APK and open it (Android asks once to allow installing apps from your browser).
The same link is on your build page at expo.dev, and you can share it with other testers.

Profiles live in [`eas.json`](eas.json): `preview` makes an installable APK, `production` makes the bundle Google Play wants.

## Publishing to the App Store and Google Play

Use [EAS Build](https://docs.expo.dev/build/introduction/): no Mac needed for iOS.

```bash
npx eas-cli@latest login
npx eas-cli@latest build --platform all
npx eas-cli@latest submit --platform all
```

Before the first release:

- Replace the placeholder icon and splash in `assets/`.
- Check the app ids in `app.json` (`com.cmazzon.lunadrawing`).
- App Store: choose the **Kids** category (ages 5 and under). The app has no ads, analytics or links, which the Kids rules require.
- Google Play: fill in the **Families / Designed for Families** form and the photo permission declaration (the app only *saves* pictures).
- Privacy policy: "We don't collect any data" is enough, but both stores need a URL.

More ideas for what to build next: [docs/IDEAS.md](docs/IDEAS.md).
