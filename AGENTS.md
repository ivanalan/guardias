# Guardias — Agent guide

## Product

- Full requirements: [docs/PRD.md](docs/PRD.md)
- MVP scope: PRD §3 (features F1–F6) and §4 (respect out-of-scope items)
- Primary users: Mexican medical residents on A/B/C/D guardia rotations
- MVP languages: English and Spanish — all user-facing strings must use i18n catalogs

## Stack

- Expo SDK 57 — read versioned docs: https://docs.expo.dev/versions/v57.0.0/
- TypeScript, react-native-calendars, AsyncStorage, date-fns
- Localization: expo-localization + i18n string catalogs (`src/i18n/en.json`, `src/i18n/es.json`)
- **Styling: [NativeWind](https://www.nativewind.dev/v5) v5** (Tailwind CSS v4 `className` via `react-native-css`). Prefer utility classes and CSS-wrapped components from `src/tw` over large `StyleSheet` blocks. Setup skill: `expo-tailwind-setup` (`.agents/skills/expo-tailwind-setup`).
- **UI controls: shared RN primitives.** One component tree for all platforms — no `.ios` / `.android` UI files, no `@expo/ui`. See `.cursor/rules/native-ui.mdc`.
- Develop in **Expo Go** (`expo start`). Do not introduce packages that require a custom native binary unless explicitly requested.
- Do **not** use Material Design 3 or `react-native-paper` as the design system.

## Conventions

- Offline-first: no backend or auth in v1.0
- Feature folders under `src/features/` should map to PRD features (calendar, dashboard, rotations, settings)
- Shift calculation logic lives in `src/lib/shifts/` — treat edge cases in PRD §7 as test priorities
- Do not hardcode user-visible strings; add keys to both `en.json` and `es.json`
- Default locale fallback is Spanish (`es`)

## Before implementing a feature

1. Read the relevant PRD section (e.g. F1 rotation setup, F2 calendar)
2. Check §4 out-of-scope — do not build deferred features
3. Match existing code style and keep changes surgical
