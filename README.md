# Guardias

Mobile app for tracking on-call medical rotation shifts (guardias) in the Mexican A/B/C/D schedule system.

## Documentation

- [Product Requirements (PRD)](docs/PRD.md) — scope, features, data model, roadmap

## Requirements

- Node.js 18+
- npm
- [Expo Go](https://expo.dev/go) on a physical device, or Android emulator

## Getting started

```bash
npm install
npm start
```

Then press `a` for Android emulator, or scan the QR code with Expo Go.

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start Expo dev server |
| `npm run android` | Start with Android |
| `npm run ios` | Start with iOS *(planned v1.1)* |
| `npm run web` | Start web preview |

## Project structure

```
guardias/
├── docs/
│   └── PRD.md          # Product requirements
├── src/                # Application code (to be added)
├── App.tsx             # Root component
├── AGENTS.md           # AI agent conventions
└── app.json            # Expo config
```

## Localization

MVP targets **English** and **Spanish**. See [PRD §3 F6](docs/PRD.md#f6--bilingual-ui-english--spanish) for requirements.

## License

See [LICENSE](LICENSE).
