# Guardias — Agent guide

## Product

- Primary users: Mexican medical residents on A/B/C/D guardia rotations
- Languages: English and Spanish — all user-facing strings must use i18n catalogs

## Stack

- Expo SDK 57 — read versioned docs: https://docs.expo.dev/versions/v57.0.0/
- TypeScript, react-native-calendars, AsyncStorage, date-fns
- Localization: expo-localization + i18n string catalogs (`src/i18n/en.json`, `src/i18n/es.json`)
- **Styling: [NativeWind](https://www.nativewind.dev/v5) v5** (Tailwind CSS v4 `className` via `react-native-css`). Prefer utility classes and CSS-wrapped components from `src/tw` over large `StyleSheet` blocks. Setup skill: `expo-tailwind-setup` (`.agents/skills/expo-tailwind-setup`).
- **UI controls: shared RN primitives.** One component tree for all platforms — no `.ios` / `.android` UI files, no `@expo/ui` in app screens. See `.cursor/rules/native-ui.mdc`.
- Develop in **Expo Go** (`expo start`) for day-to-day app UI. Home-screen widgets require a **custom native binary** (`expo run:ios` / `expo run:android` / EAS).
- Do **not** use Material Design 3 or `react-native-paper` as the design system.
- **Android home-screen widgets:** `react-native-android-widget` under `src/features/widget-android/`. Default picker size lives in `app.json` but is baked into sticky local `android/.../widgetprovider_*.xml`. After changing `targetCell*` / `minWidth` / `minHeight`, run `node scripts/sync-android-widget-providers.mjs`. See `.cursor/rules/android-widget-providers.mdc`.
- **iOS home-screen widgets:** `expo-widgets` + `@expo/ui` SwiftUI under `src/features/widget-ios/` only (widget-directive components). Shared props live in `src/features/widgets/`. Not available in Expo Go.

## Conventions

- Offline-first: no backend or auth unless explicitly requested
- Feature folders under `src/features/` (calendar, dashboard, rotations, settings)
- Shift calculation logic lives in `src/lib/shifts/`
- Calendar day marks (shift / vacation / free weekend) must go through `getRangeMarkInputs` / `getMonthMarkInputs` and `getDayMarkKind` — do not invent per-screen mark lists
- Do not hardcode user-visible strings; add keys to both `en.json` and `es.json`
- Default locale fallback is Spanish (`es`)

## Store releases

- **iOS:** Every production build or App Store Connect upload must follow **`ios-store-submit`** (`.agents/skills/ios-store-submit`). Run `node scripts/ios-version-gate.mjs check` (and `check --ipa <appVersion>` before `eas submit`). Never upload a marketing version ≤ `docs/store/ios-release-state.json` `lastApprovedMarketingVersion`. First-time Apple setup: `docs/store/IOS_RELEASE.md`.
- **Android:** Follow **`android-store-submit`** (`.agents/skills/android-store-submit`). Owner downloads the EAS `.aab` and uploads in Play Console — do **not** use `eas submit` or set up Play service-account credentials unless explicitly requested. First-time Play setup: `docs/store/ANDROID_RELEASE.md`.

## Before implementing a feature

1. Match existing code style and keep changes surgical
2. Prefer extending current patterns over introducing new abstractions
