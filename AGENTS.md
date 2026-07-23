# Guardias — Agent guide

## Product

- Full requirements: [docs/PRD.md](docs/PRD.md)
- MVP scope: PRD §3 (features F1–F6) and §4 (respect out-of-scope items)
- Primary users: Mexican medical residents on A/B/C/D guardia rotations
- MVP languages: English and Spanish — all user-facing strings must use i18n catalogs

## Stack

- Expo SDK 55 — read versioned docs: https://docs.expo.dev/versions/v55.0.0/
- TypeScript, react-native-calendars, AsyncStorage, date-fns
- Localization: expo-localization + i18n string catalogs (`src/i18n/en.json`, `src/i18n/es.json`)
- **Styling: [NativeWind](https://www.nativewind.dev/v5) v5** (Tailwind CSS v4 `className` via `react-native-css`). Prefer utility classes and CSS-wrapped components from `src/tw` over large `StyleSheet` blocks. Setup skill: `expo-tailwind-setup` (`.agents/skills/expo-tailwind-setup`).
- **UI controls: platform-native.** Prefer [`@expo/ui`](https://docs.expo.dev/versions/v55.0.0/sdk/ui/) — SwiftUI (`@expo/ui/swift-ui`) on iOS, Jetpack Compose / Material (`@expo/ui/jetpack-compose`) on Android. NativeWind styles layout/chrome; `@expo/ui` / RN primitives provide interactive controls. See `.cursor/rules/native-ui.mdc`.
- Do **not** use Material Design 3 as a **cross-platform** design system (no MD3 look on iOS). Do **not** use the `material-3` skill or expand `react-native-paper` usage. Platform Material on Android via Compose is encouraged.

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
