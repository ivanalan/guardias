# Mi Guardia

Mobile app for tracking on-call medical rotation shifts (guardias) in the Mexican A/B/C/D schedule system.

## Documentation

- [Architecture guide](docs/ARCHITECTURE.md) — beginner-friendly tour of how the app works (offline “backend”, UI, shifts math, widgets)
- [AGENTS.md](AGENTS.md) — stack and conventions (Expo, NativeWind, i18n, feature folders)
- [Android release](docs/store/ANDROID_RELEASE.md) — Play Store checklist, legal URLs, EAS build
- [iOS release](docs/store/IOS_RELEASE.md) — App Store checklist and EAS build
- [Play listing copy](docs/store/play-listing.md) — EN/ES store text and data safety notes

## Requirements

- Node.js 18+
- npm
- [Expo Go](https://expo.dev/go) on a physical device, or an iOS/Android simulator/emulator

## Getting started

```bash
npm install
npm start
```

Then press `a` for Android, `i` for iOS, or scan the QR code with Expo Go.

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start Expo dev server |
| `npm run android` | Start Expo and open Android |
| `npm run ios` | Start Expo and open iOS |
| `npm run web` | Start web preview |

## Project structure

```
guardias/
├── docs/
│   └── store/          # Store listing and release docs
├── src/                # Application code
├── App.tsx             # Root component
├── AGENTS.md           # AI agent conventions
└── app.json            # Expo config
```

## Localization

The app supports **English** and **Spanish** via `src/i18n/en.json` and `src/i18n/es.json`.

## License

See [LICENSE](LICENSE).
