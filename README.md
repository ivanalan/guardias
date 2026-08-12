# Guardias

Mobile app for tracking on-call medical rotation shifts (guardias) in the Mexican A/B/C/D schedule system.

## Documentation

- [Product Requirements (PRD)](docs/PRD.md) — scope, features, data model, roadmap
- [AGENTS.md](AGENTS.md) — stack and conventions (Expo, NativeWind, i18n, feature folders)
- [Android release](docs/store/ANDROID_RELEASE.md) — Play Store checklist, legal URLs, EAS build
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
│   └── PRD.md          # Product requirements
├── src/                # Application code
├── App.tsx             # Root component
├── AGENTS.md           # AI agent conventions
└── app.json            # Expo config
```

## Localization

MVP targets **English** and **Spanish**. See [PRD §3 F6](docs/PRD.md#f6--bilingual-ui-english--spanish) for requirements.

## License

See [LICENSE](LICENSE).
