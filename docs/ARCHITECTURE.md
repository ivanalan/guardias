# DeGuardia — Architecture & Codebase Guide

**A beginner-friendly tour of how this repository works, why it is built this way, and what each major piece does.**

Estimated reading length: about **30–50 pages** if printed (or a focused half-day of study). You do not need prior React Native experience, but it helps if you know a little JavaScript/TypeScript.

**How to use this doc:** Skim Parts I–II for the big picture, then work through the worked examples in Part III with a paper calendar. Parts IV–VI are reference when you change a specific area.

---

## Table of contents

### Part I — Big picture
1. [What this app is](#1-what-this-app-is)
2. [The most important idea: there is no traditional backend](#2-the-most-important-idea-there-is-no-traditional-backend)
3. [Beginner concepts you need](#3-beginner-concepts-you-need)
4. [Technology stack (and why each piece)](#4-technology-stack-and-why-each-piece)
5. [Repository map](#5-repository-map)

### Part II — Runtime architecture
6. [How the app starts](#6-how-the-app-starts)
7. [The domain: Mexican A/B/C/D guardias](#7-the-domain-mexican-abcd-guardias)
8. [The “backend”: shift calculation library](#8-the-backend-shift-calculation-library)
9. [Data model: a rotation period](#9-data-model-a-rotation-period)
10. [Persistence: AsyncStorage as the database](#10-persistence-asyncstorage-as-the-database)
11. [App state: React Context](#11-app-state-react-context)
12. [Navigation: tabs and stacks](#12-navigation-tabs-and-stacks)

### Part III — Features & domain deep dives
13. [Feature: Home (dashboard)](#13-feature-home-dashboard)
14. [Feature: Calendar](#14-feature-calendar)
15. [Feature: Shifts / rotations](#15-feature-shifts--rotations)
16. [Feature: Settings](#16-feature-settings)
17. [The calendar marking pipeline](#17-the-calendar-marking-pipeline)
18. [Free weekends (a domain rule, not a UI trick)](#18-free-weekends-a-domain-rule-not-a-ui-trick)
19. [Worked examples: reading the schedule by hand](#19-worked-examples-reading-the-schedule-by-hand)
20. [File-by-file tour of `src/lib/shifts`](#20-file-by-file-tour-of-srclibshifts)
20a. [Lifecycle of one rotation period (narrative)](#20a-lifecycle-of-one-rotation-period-narrative)

### Part IV — Cross-cutting systems
21. [Internationalization (English & Spanish)](#21-internationalization-english--spanish)
22. [Styling: NativeWind and theme](#22-styling-nativewind-and-theme)
23. [Home-screen widgets](#23-home-screen-widgets)
24. [Sharing rotations via links](#24-sharing-rotations-via-links)
25. [Exporting to calendars (ICS & Google)](#25-exporting-to-calendars-ics--google)
26. [React patterns used in this codebase](#26-react-patterns-used-in-this-codebase)

### Part V — Quality, shipping, learning
27. [Testing philosophy](#27-testing-philosophy)
28. [Builds, Expo Go, and store releases](#28-builds-expo-go-and-store-releases)
29. [End-to-end data flow](#29-end-to-end-data-flow)
30. [Screen-by-screen UI tour](#30-screen-by-screen-ui-tour)
31. [Common pitfalls and “why did they do it that way?”](#31-common-pitfalls-and-why-did-they-do-it-that-way)
32. [FAQ for beginners](#32-faq-for-beginners)
33. [How to explore the code as a beginner](#33-how-to-explore-the-code-as-a-beginner)
34. [Glossary](#34-glossary)

---

## 1. What this app is

**DeGuardia** (`guardias` in the repo) is a mobile app for **Mexican medical residents** who work on-call shifts called **guardias**.

In many Mexican hospitals, residents are assigned a letter in an **A / B / C / D** (or A / B / C) rotation. That letter decides which days of the year you work a long shift (typically ~24 hours). The app helps you:

- Define your rotation periods (date range + letter + cycle length)
- See which days are guardias on a calendar
- Track “am I on shift right now?” and “when is my next guardia?”
- Mark vacations so those days are not counted as shifts
- Optionally overlay a friend’s/spouse’s schedule as dots
- Put a summary on the phone’s home screen (widgets)
- Share a rotation with someone else via a link
- Export shifts into Apple/Google Calendar

The product language is **Spanish first**, with English supported. The default fallback locale is Spanish (`es`) because that is the primary market.

---

## 2. The most important idea: there is no traditional backend

If you come from web development, you may expect:

```
Phone app  →  HTTP API server  →  Database (Postgres, etc.)
```

**This project deliberately does not do that.**

From `AGENTS.md`:

> Offline-first: no backend or auth unless explicitly requested

That means:

| Traditional web app | DeGuardia |
|---|---|
| User accounts / login | None |
| Server API | None |
| Cloud database | None |
| Sync across devices | Not built (data lives on the device) |

So what *is* the “backend”?

In this codebase, treat these pieces as the backend:

1. **Domain logic** in `src/lib/shifts/` — pure functions that answer “is this day a shift?”, “what’s the next shift?”, etc.
2. **Local storage** via AsyncStorage — JSON saved on the phone.
3. **Optional OS integrations** — calendar export, share sheet, home-screen widgets.

The **frontend** is everything the user sees: React Native screens, navigation, buttons, calendars, widgets UI.

### Why offline-first?

For this product it is a good fit:

- Residents often need their schedule **without reliable hospital Wi‑Fi**.
- The schedule is **computable**: once you know start date, end date, letter, and cycle, every shift day can be calculated. You do not need a server to “look up” each day.
- There is no social network or multi-user ledger that requires a central source of truth.
- Shipping without auth/backend is simpler, cheaper, and private (data stays on the device).

**Tradeoff:** if you uninstall the app or lose the phone without a backup, the data is gone. There is no cloud account restoring it.

---

## 3. Beginner concepts you need

This section explains vocabulary used everywhere in the repo.

### 3.1 TypeScript

The app is written in **TypeScript**, which is JavaScript plus **types**. Types are labels that describe what a value is (string, number, object shape, etc.).

Example from the domain:

```ts
export type CycleDays = 3 | 4;
```

That means a cycle length can only be `3` or `4`, not `5` or `"hello"`. The editor and compiler catch mistakes early.

### 3.2 React and components

**React** is a UI library. You build screens from **components** — functions that return UI (JSX).

```tsx
function Greeting({ name }: { name: string }) {
  return <Text>Hello, {name}</Text>;
}
```

When data changes, React re-renders the affected components.

### 3.3 React Native vs a website

A **website** draws HTML/CSS in a browser.

**React Native** draws native mobile UI (UIKit on iOS, Android Views on Android) using a similar React programming model. You write `<View>` and `<Text>` instead of `<div>` and `<span>`.

### 3.4 Expo

**Expo** is a toolchain around React Native. It provides:

- A managed way to run the app (`expo start`)
- Libraries for fonts, localization, sharing, splash screen, etc.
- **EAS** (Expo Application Services) for store builds

Think of Expo as “batteries included” React Native.

### 3.5 Pure functions vs side effects

Much of the “smart” code in this repo is **pure**:

- Same inputs → same outputs
- No reading the network
- No writing to disk inside the function

Example: `isShiftDay(period, "2026-03-15")` either returns `true` or `false`. That makes it easy to test.

**Side effects** (saving storage, refreshing widgets) live in contexts and refresh helpers, not in the math.

### 3.6 Feature folders

Instead of dumping everything into `components/` and `utils/`, the code is grouped by **product feature**:

- `src/features/dashboard/` — Home tab
- `src/features/calendar/` — Calendar tab
- `src/features/rotations/` — Shifts tab + period types/storage
- `src/features/settings/` — Preferences
- `src/features/widgets/` — Shared widget prop builders
- `src/features/widget-ios/` / `widget-android/` — Platform widget UIs

Shared non-UI logic that many features need goes under `src/lib/` (especially `src/lib/shifts/`).

### 3.7 Offline-first (again, in beginner terms)

Imagine a notebook you carry in your pocket:

- You write schedules in the notebook (AsyncStorage).
- You calculate “which days am I on?” with a pencil using rules (shift library).
- You do **not** call a librarian in another city for every question.

That is offline-first. Pros: works in the basement of a hospital. Cons: no automatic backup to the cloud.

### 3.8 What “architecture” means here

Architecture is not a buzzword folder named `architecture/`. It means:

- **Where truth lives** (period records on disk)
- **Where decisions are made** (pure shift functions)
- **Where pixels are painted** (feature screens + widgets)
- **How those layers talk** (Context, imports, refresh helpers)

If you can sketch that on a napkin, you understand the architecture.

### 3.9 JavaScript modules and imports

Each `.ts` / `.tsx` file is a **module**. It `export`s functions/types and `import`s others.

```ts
import { isShiftDay } from '../../lib/shifts/is-shift-day';
```

The `@/` alias (see `tsconfig.json`) can point at `src/` so imports stay shorter in some files. Relative paths (`../../`) are also common. Both mean “use this other file’s code.”

### 3.10 Async / await

Saving to disk and reading preferences take time. JavaScript uses `async` functions:

```ts
async function hydrate() {
  const stored = await loadRotationPeriods();
  // …use stored
}
```

`await` pauses that function until the promise finishes, without freezing the whole phone UI (the JS engine can still schedule other work).

---

## 4. Technology stack (and why each piece)

| Piece | Role | Why it is here |
|---|---|---|
| **Expo SDK 57** | App runtime + tooling | Faster mobile development, good docs, store builds |
| **React 19 + React Native** | UI framework | Cross-platform iOS/Android (and web preview) |
| **TypeScript** | Typed JavaScript | Safer refactors around dates and period shapes |
| **React Navigation** | Tabs + stacks | Standard navigation for Expo apps |
| **AsyncStorage** | Key/value persistence | Simple offline database for JSON |
| **date-fns** | Date math | Reliable calendar-day differences, formatting |
| **react-native-calendars** | Month calendar grid | Mature calendar UI without reinventing grids |
| **i18next + expo-localization** | Translations | EN/ES catalogs; device language detection |
| **NativeWind v5** | Tailwind-style styling | Utility classes via `className` |
| **react-native-android-widget** | Android home widgets | Native App Widgets |
| **expo-widgets + @expo/ui** | iOS home widgets | WidgetKit layouts (widgets only, not main app UI) |
| **Jest** | Unit tests | Protects shift math and parsers |

### What you will *not* find

- No Express/Nest/FastAPI server in this repo
- No Prisma/SQL migrations
- No Firebase Auth / Supabase by default
- No Redux/Zustand store (state is React Context + AsyncStorage)
- No Material Design 3 / `react-native-paper` design system

---

## 5. Repository map

High-level layout:

```
guardias/
├── App.tsx                 # Root React tree: providers + tabs
├── index.ts                # Entry: register app + Android widget handler
├── app.json                # Expo config (name, plugins, widgets, IDs)
├── package.json            # Dependencies and scripts
├── AGENTS.md               # Conventions for humans and AI agents
├── docs/
│   ├── ARCHITECTURE.md     # This guide
│   └── store/              # App Store / Play release docs
├── scripts/                # Version gates, Android widget XML sync
├── assets/                 # Icons, widget previews
└── src/
    ├── components/         # Small shared UI (e.g. screen titles)
    ├── features/           # Product features (main app code)
    ├── i18n/               # en.json / es.json + i18n setup
    ├── lib/shifts/         # Shift calculation “brain”
    ├── navigation/         # Tab bar, deep links, nav types
    ├── theme/              # Colors, theme context
    ├── tw/                 # NativeWind-enabled RN primitives
    └── global.css          # Tailwind theme tokens
```

### Mental model of `src/`

```
┌─────────────────────────────────────────────┐
│                 App.tsx                      │
│  Providers (i18n, preferences, rotations)    │
│  + Tab navigator                             │
└───────────────────┬─────────────────────────┘
                    │
     ┌──────────────┼──────────────┐
     ▼              ▼              ▼
  Home tab     Calendar tab    Shifts tab
  dashboard/    calendar/      rotations/
     │              │              │
     └──────────────┼──────────────┘
                    ▼
           src/lib/shifts/   ← shared math
                    ▲
                    │
           AsyncStorage      ← saved periods & prefs
```

---

## 6. How the app starts

### 6.1 `index.ts` — the true entry point

`package.json` sets `"main": "index.ts"`. When the app launches:

1. Import `./src/i18n` so translations initialize early.
2. `registerRootComponent(App)` tells React Native to mount `App`.
3. On Android only, register `widgetTaskHandler` so the OS can ask the app to redraw home-screen widgets even when the UI is not open.

iOS widgets are **not** registered at startup on purpose: a widget registration failure must never block the main app from opening.

### 6.2 `App.tsx` — providers and the shell

`App` does a few jobs:

1. Load the **Instrument Serif** font; keep the splash screen until fonts are ready.
2. Wrap the tree in providers (outer → inner):
   - `I18nextProvider` — translations
   - `SafeAreaProvider` — notches / home indicator insets
   - `PreferencesProvider` — language + appearance (loads storage)
   - `RotationsProvider` — rotation periods (loads storage)
3. Render `RootNavigator`: bottom tabs (Home, Calendar, Shifts) with a custom floating tab bar.

While preferences or rotations are still loading from disk, those providers return `null` (blank) so screens never briefly flash “empty” with wrong defaults.

### 6.3 Development loop

Day-to-day UI work:

```bash
npm install
npm start
```

Then open **Expo Go** on a phone, or press `i` / `a` for simulators.

Home-screen widgets need a **custom native binary** (`expo run:ios` / `expo run:android` / EAS). Expo Go cannot host those native widget extensions.

---

## 7. The domain: Mexican A/B/C/D guardias

Understanding the product domain makes the code make sense.

### 7.1 The letter calendar

Many hospitals think of the year as a repeating letter cycle:

- **A–D** = cycle of **4** days (A, B, C, D, A, B, …)
- **A–C** = cycle of **3** days (A, B, C, A, B, …)

In this app, the **default year-anchored calendar** treats **January 1 as letter A**. Every later day advances the letter.

If you are letter **B** on a 4-day cycle, your shift days are every day whose year-calendar letter is B.

### 7.2 Why `firstShiftDate` exists

Real life is messy. Sometimes the hospital’s letter calendar does not match “Jan 1 = A,” or a resident starts mid-block. The app allows a **first shift date override**:

- If `firstShiftDate` is set: that day is a shift, then every `cycleDays` after that.
- If `firstShiftDate` is `null`: use the Jan‑1 letter calendar + the period’s `offset` letter.

This is implemented in `src/lib/shifts/is-shift-day.ts`.

### 7.3 Primary vs secondary roles

A period has a `role`:

- **`primary`** — *your* schedule. Drives Home stats, free weekends, and solid calendar fills. Primary date ranges must not overlap each other.
- **`secondary`** — friend/spouse. Shown as **dots** on the calendar (and read-only rows on day detail) only; does not drive Home “next shift” logic. Multiple secondaries are allowed (soft cap **8**); their date ranges **may overlap**, including the same calendar day. Day cells show up to **one** friend dot then `+N`. The month legend shows all named friend chips when there are ≤4; with 5+, it keeps **two** named chips plus a `+n friends` overflow chip that expands in place to all chips (expand state is ephemeral).

Helpers live in `src/features/rotations/period-role.ts`.

### 7.4 Vacations

A period can store an inclusive vacation range (`vacationStartDate` … `vacationEndDate`). Vacation days are **never** shift days, even if the letter cycle would have included them.

### 7.5 Shift length

Each period stores `shiftLengthHours` (default **24**, allowed **8…40** whole hours). Shifts start at a local `shiftStartTime` (default `07:00`). `buildShift` uses the period’s length for end time; `SHIFT_DURATION_HOURS` is the default constant.

---

## 8. The “backend”: shift calculation library

Folder: **`src/lib/shifts/`**

This is the most important non-UI code in the repo. Screens should call these functions instead of inventing their own date rules.

### 8.1 Core functions

| Function | Question it answers |
|---|---|
| `isShiftDay(period, isoDate)` | Is this calendar day a scheduled guardia? |
| `buildShift(period, isoDate)` | If yes, what are start/end Date objects? |
| `listShiftDatesInRange(periods, from, to)` | Which dates in a range are shifts? |
| `findPeriodForDate(periods, isoDate)` | Which period covers this date? |
| `getDayInfo(periods, isoDate)` | Free / vacation / shift for the day sheet |
| `getHomepageShiftStatus(periods, now)` | Idle / between shifts / currently in a shift |
| `listUpcomingShifts(period, now, limit)` | Next N upcoming starts |
| `countShiftsRemaining(period, now)` | How many starts left? |
| `getPeriodShiftProgress(period, now)` | Completed vs total shifts in the period |
| `getNextFreeWeekend(...)` | Next Fri–Sun recovery weekend |

### 8.2 How `isShiftDay` works (step by step)

File: `is-shift-day.ts`

Pseudo-logic:

1. If the date is outside `[startDate, endDate]` → **not** a shift.
2. If the date is inside the vacation range → **not** a shift.
3. If `firstShiftDate` is set → check whether the day distance from that anchor is a multiple of `cycleDays`.
4. Else → compute the year-anchored letter index from Jan 1 and compare to the period’s `offset` (A=0, B=1, C=2, D=3).

Because dates are stored as `YYYY-MM-DD` strings, range checks can use normal string comparison (`"2026-01-10" < "2026-02-01"` works for ISO dates).

### 8.3 Computed shifts are not stored

Important design choice:

> Individual shift days are **not** saved in AsyncStorage.

What is saved is the **period recipe** (range + pattern + vacation + start time). Shift days are **computed on demand**.

Why?

- Less storage
- No risk of the stored day list drifting from the rules
- Changing vacation dates automatically recalculates everything
- Easier to share a compact period definition

`ComputedShift` (from `build-shift.ts`) is an in-memory object: date, start/end DateTimes, duration, period id/label.

### 8.4 Homepage status machine

`getHomepageShiftStatus` returns a **discriminated union** (a TypeScript pattern where a `kind` field tells you which shape you have):

- `idle` — no active primary period / nothing useful to show
- `between_shifts` — next shift + countdown + remaining count
- `in_shift` — current shift + time left + optional next shift

The Home screen switches UI based on `status.kind`.

---

## 9. Data model: a rotation period

Type: `RotationPeriod` in `src/features/rotations/types.ts`

Think of one period as one “block” of residency schedule:

```ts
type RotationPeriod = {
  id: string;                 // unique id
  label: string;              // e.g. hospital / service name
  startDate: string;          // YYYY-MM-DD
  endDate: string;            // YYYY-MM-DD
  pattern: {
    cycleDays: 3 | 4;         // A-C or A-D
    offset: 'A' | 'B' | 'C' | 'D';
  };
  firstShiftDate: string | null;  // optional phase override
  vacationStartDate: string | null;
  vacationEndDate: string | null;
  shiftStartTime: string;     // HH:mm, e.g. "07:00"
  color: string;              // #RRGGBB for calendar marks
  role: 'primary' | 'secondary';
  createdAt: string;          // ISO datetime
};
```

### Defaults

- Default pattern: A–D with offset A (`DEFAULT_PATTERN`)
- Default shift start: `07:00` (`DEFAULT_SHIFT_START_TIME`)

### Why this shape?

It is the **minimum ground truth** needed to regenerate the whole calendar. Everything else (marks, widgets, ICS export, Home cards) is derived.

---

## 10. Persistence: AsyncStorage as the database

### 10.1 What AsyncStorage is

**AsyncStorage** is a simple key → string store on the device. The app stores JSON strings.

Rotation periods:

- Key: `guardias.rotationPeriods`
- Value: `JSON.stringify(RotationPeriod[])`

Preferences (language / appearance) have their own key in `src/features/settings/storage.ts`.

### 10.2 Load and save

`src/features/rotations/storage.ts`:

- `loadRotationPeriods()` — read, parse, normalize, return array or `null`
- `saveRotationPeriods(periods)` — write the full list
- `normalizePeriod(raw)` — migrate/repair older shapes (e.g. missing `role` or color)

Normalization matters because stored data survives app updates. Old installs may lack newer fields; loaders fill defaults instead of crashing.

### 10.3 “Database” operations in practice

There is no SQL. Updates replace the whole array:

1. Read current periods from React state.
2. Add / update / delete in memory.
3. Sort by `startDate`.
4. Save the entire array.
5. Refresh home-screen widgets.

That is simple and fine for small lists (a resident typically has a handful of periods, not millions of rows).

---

## 11. App state: React Context

Two main providers wrap the app.

### 11.1 `RotationsProvider`

File: `src/features/rotations/rotations-context.tsx`

Responsibilities:

- Hydrate periods from AsyncStorage on launch
- Expose `periods`, `addPeriod`, `updatePeriod`, `deletePeriod`
- Persist after every mutation
- Call `refreshHomeWidgets` so home-screen widgets stay in sync

Screens use:

```ts
const { periods, addPeriod } = useRotations();
```

### 11.2 `PreferencesProvider`

File: `src/features/settings/preferences-context.tsx`

Responsibilities:

- Hydrate locale + color scheme preference
- Apply language via `i18n.changeLanguage`
- Wrap children in `ThemeProvider`
- Refresh widgets when language or appearance changes (widgets show translated strings and light/dark colors)

### 11.3 Why Context instead of Redux?

For this app size, Context is enough:

- One list of periods
- A few preference fields
- No complex server cache

Adding Redux/Zustand would be extra machinery without a clear win yet.

### 11.4 Ground-truth rule

State stores **periods and preferences**, not “list of all shift days through 2030.” Derived values are computed in render or helper functions. That matches the project’s general rule: **state is ground truth; visuals and lists are derived.**

---

## 12. Navigation: tabs and stacks

### 12.1 Root tabs

Defined in `App.tsx` with React Navigation bottom tabs:

| Tab name | Stack | Purpose |
|---|---|---|
| `Home` | `DashboardStack` | Status, two-week preview, settings entry |
| `Calendar` | `CalendarStack` | Month calendar + day detail sheet |
| `Shifts` | `ShiftsStack` | List / add / edit / detail rotations |

The visible tab bar is custom: `FloatingTabBar` (not the default gray iOS tab bar).

Types live in `src/navigation/types.ts` (`TabParamList`).

### 12.2 Nested stacks

Each tab has its own **native stack** (slides screens on top of each other).

**Home stack**

- `HomeHome` — main dashboard
- `Settings` — language / appearance

**Calendar stack**

- `CalendarHome` — month view
- `DayDetail` — form sheet for one day (`presentation: 'formSheet'`)

**Shifts stack**

- `ShiftsList`
- `AddRotation` / `EditRotation` (same screen component, different route)
- `RotationDetail`

### 12.3 Deep links / share links

Scheme in `app.json`: `miguardia`.

`useShareLinkNavigation` watches incoming URLs (HTTPS share pages and `miguardia://…`) and navigates into **Add Rotation** with a parsed draft when someone opens a shared rotation.

---

## 13. Feature: Home (dashboard)

Folder: `src/features/dashboard/`

### What the user sees

When they have an active primary period:

- Countdown / in-shift status card
- Shifts remaining / progress
- Next free weekend banner
- A **two-week** mini calendar with the same mark colors as the main calendar

When they have no periods: an empty state that nudges them to add a rotation.

### How it stays fresh

Home refreshes time-sensitive status about every 60 seconds while focused (`REFRESH_MS`), because “hours left in shift” changes even if storage does not.

### Shared mark inputs

Home does **not** invent its own idea of which days are free weekends. It calls `getRangeMarkInputs` from the calendar feature — the same pipeline Calendar and widgets use. That consistency is intentional and documented in `AGENTS.md`.

---

## 14. Feature: Calendar

Folder: `src/features/calendar/`

### Responsibilities

- Month grid UI (`react-native-calendars` + custom day cells)
- Legend filters (shifts, secondary, free weekends, vacation)
- Day detail sheet (`getDayInfo`)
- Export / share flows (ICS, Google Calendar URL, rotation image)
- Locale configuration for weekday labels

### Day detail

Route param: `{ date: "YYYY-MM-DD" }`.

`getDayInfo` classifies the day for **primary** periods only:

- `free`
- `vacation` (+ label)
- `shift` (+ computed start/end)

### Why marks go through one pipeline

`AGENTS.md` rule:

> Calendar day marks (shift / vacation / free weekend) must go through `getRangeMarkInputs` / `getMonthMarkInputs` and `getDayMarkKind` — do not invent per-screen mark lists

If every screen built its own lists, free-weekend edge cases (Friday recovery, month boundaries) would quietly diverge. One pipeline keeps Home, Calendar, and widgets honest.

---

## 15. Feature: Shifts / rotations

Folder: `src/features/rotations/`

This is where users **create the ground truth**.

### Screens

- **List** — periods grouped by recency
- **Add / Edit** — form for dates, pattern, color, role, vacation, first shift
- **Detail** — summary + calendar preview for one period

### Validation

`validate-new-period.ts` checks that new/edited periods make sense (ranges, overlaps policies as implemented, etc.). Tests live beside the logic (`*.test.ts`).

### Colors

`rotation-colors.ts` defines allowed palette colors and normalization so a bad stored value still becomes a valid swatch.

### Ghost / empty previews

Empty states sometimes show a **ghost calendar** with sample data so the UI does not feel blank. That preview data is local fake content, not saved periods.

---

## 16. Feature: Settings

Folder: `src/features/settings/`

Reached from the Home stack.

Settings are intentionally small:

- **Language**: follow system, or force English / Spanish
- **Appearance**: follow system, or force light / dark

Stored as `AppPreferences`. Effective language resolves `null` → device language → fallback `es`.

---

## 17. The calendar marking pipeline

This section ties the domain math to colored squares on screen.

### 17.1 Step 1 — gather inputs for a date range

`getRangeMarkInputs(periods, from, to)` in `month-legend-stats.ts` returns:

- `shiftMarks` — primary shift days + colors
- `secondaryShiftMarks` — friend dots
- `freeWeekendDates` — Sat/Sun belonging to free weekends
- `vacationDates` — vacation days in range

It pads the shift lookup by a few days beyond the visible range so Friday/Sunday edge logic stays correct near month boundaries.

### 17.2 Step 2 — decide what a single day “is”

`getDayMarkKind(iso, ctx)` priority:

1. **shift** (primary fill)
2. **vacation**
3. **freeWeekend**
4. **none**

### 17.3 Step 3 — render

`calendar-day-marker.ts` and day cell components turn kinds into colors, opacity (past days fade; filtered days dim), and free-weekend “pills” that span Saturday–Sunday when both are free.

### 17.4 Filters

The legend can filter categories with AND logic (`dayMatchesActiveFilter`). Filtering dims non-matching days instead of removing them from the grid, so the calendar layout stays stable.

---

## 18. Free weekends (a domain rule, not a UI trick)

File: `src/features/calendar/free-weekends.ts`

A **free weekend** is not merely “Sat and Sun with no shift.”

Because a Friday guardia typically ends Saturday morning, the resident is still recovering on Saturday. So the rule is:

> Friday **and** Saturday **and** Sunday all have no shift.

Only **Saturday and Sunday** are marked on the calendar (Friday is checked but not painted as a free-weekend cell).

This is a great example of product knowledge living in code comments and pure functions — not only in designers’ heads.

---

## 19. Worked examples: reading the schedule by hand

These examples are the best way to *feel* what the code is doing. Grab paper if you can.

### Example A — Year-anchored A–D, offset B

Assume:

- `cycleDays = 4` (A B C D A B C D …)
- `offset = B`
- `firstShiftDate = null` (use Jan 1 letter calendar)
- Period covers all of January 2026
- No vacation

**Step 1.** January 1, 2026 is defined as letter **A** (day index 0).

**Step 2.** Letters for early January:

| Date | Days from Jan 1 | Index mod 4 | Letter |
|---|---|---|---|
| 2026-01-01 | 0 | 0 | A |
| 2026-01-02 | 1 | 1 | **B** ← shift |
| 2026-01-03 | 2 | 2 | C |
| 2026-01-04 | 3 | 3 | D |
| 2026-01-05 | 4 | 0 | A |
| 2026-01-06 | 5 | 1 | **B** ← shift |

So B works Jan 2, 6, 10, 14, … — every 4th day starting at the first B.

In code, `isShiftDay` does exactly this comparison: letter index === `OFFSET_INDEX['B']` which is `1`.

### Example B — First-shift override

Same period, but hospital math does not match Jan 1 = A. The resident knows their first guardia is **2026-01-03**.

Set `firstShiftDate = "2026-01-03"`.

Now the rule becomes: a day is a shift if the day distance from 2026-01-03 is a multiple of 4 (including 0).

| Date | Days from Jan 3 | Shift? |
|---|---|---|
| 2026-01-03 | 0 | yes |
| 2026-01-04 | 1 | no |
| 2026-01-07 | 4 | yes |
| 2026-01-11 | 8 | yes |

The `offset` letter is ignored while `firstShiftDate` is set. The cycle length still comes from `pattern.cycleDays`.

### Example C — Vacation punches a hole

Same as Example A (B every 4 days). Vacation: `2026-01-05` … `2026-01-08`.

Jan 6 would have been a B shift, but `isOnVacation` returns true → **not** a shift.

Home’s “shifts remaining” and calendar fills both skip that day because they all go through `isShiftDay` / `listShiftDatesInRange`.

### Example D — Free weekend check

Suppose primary shifts in a week fall on **Wednesday** only.

- Fri: free
- Sat: free
- Sun: free

→ That Sat/Sun pair is a **free weekend** (Friday also free, so recovery works).

If instead there is a **Friday** guardia:

- Fri: shift
- Sat: free
- Sun: free

→ **Not** a free weekend. The resident is still exiting a Friday 24h shift into Saturday morning.

### Example E — Primary vs secondary on one day

- You (primary): shift on March 10 (solid fill)
- Friend (secondary): also shift on March 10 (dot)

Home “next shift” ignores the friend. Calendar shows both. Free weekends use **only primary** shift dates.

---

## 20. File-by-file tour of `src/lib/shifts`

Think of this folder as a tiny library with a public API (`index.ts`) and focused modules.

### `parse-calendar-date.ts`

Converts `"YYYY-MM-DD"` into a local `Date` at a stable time-of-day so day math does not drift across time zones in surprising ways. Almost everything else that needs a `Date` goes through here.

### `is-shift-day.ts`

The gatekeeper. Also exports `getDefaultFirstShiftDate`, used when the add-rotation UI wants to suggest the first day that matches the letter calendar inside the chosen range.

### `build-shift.ts`

If `isShiftDay` is true, build a `ComputedShift`:

- Parse `isoDate` + `period.shiftStartTime` → `startDateTime`
- Add 24 hours → `endDateTime`
- Attach period id/label for UI copy

If not a shift day → `null`.

### `list-shift-dates-in-range.ts`

Brute-force but clear: walk each calendar day from `from` to `to`, keep dates where **any** of the given periods says `isShiftDay`. Used heavily by Home stats, marks, and exports.

For beginner intuition: this is O(days × periods). Fine for months of residency data; you would not use this approach to scan 100 years every frame.

### `find-period-for-date.ts`

Linear search: which period’s inclusive range contains this ISO date? Callers should pass **non-overlapping** subsets (usually `primaryPeriods(periods)`).

### `get-day-info.ts`

UI-oriented classifier for the day sheet. Returns a tagged object:

```ts
{ kind: 'free', date }
{ kind: 'vacation', date, rotationLabel }
{ kind: 'shift', date, shift: ComputedShift }
```

TypeScript then lets the screen `switch (info.kind)` safely.

### `get-homepage-shift-status.ts`

The Home “brain.” Important helpers inside:

- `formatDurationParts` — whole days + leftover hours between two instants
- `listUpcomingShifts` / `countShiftsRemaining` — future starts only (`startDateTime > now`)
- `getPeriodShiftProgress` — completed vs total for ring/progress UI
- `getHomepageShiftStatus` — idle / between / in_shift union
- `getPeriodDayProgress` — calendar-day progress through the period block

### `home-stats.ts`

Extra Home helpers such as time until next shift (depending on status) and next free weekend relative to “now.”

### `index.ts`

Re-exports the public surface so screens can `import { … } from '@/lib/shifts'` (or relative paths) without reaching into internals.

**Rule of thumb:** if you are about to write a `for` loop over dates in a screen, stop and check whether this library already exports what you need.

---

## 20a. Lifecycle of one rotation period (narrative)

Walk this story once; it connects every major subsystem.

### Day 0 — Create

You open **Shifts → Add**, enter:

- Label: “Pediatría”
- Dates: 2026-03-01 … 2026-05-31
- Pattern: A–D, letter C
- Start time: 07:00
- Color: a blue from the palette
- Role: primary

Validation runs. On save, the app generates an `id` and `createdAt`, then `addPeriod` updates Context, writes AsyncStorage, refreshes widgets.

### Day 1 — Home notices you

`getHomepageShiftStatus` finds this primary period covers “today,” computes whether you are between shifts or in one, and Home renders cards. The two-week strip calls `getRangeMarkInputs` so colors match Calendar.

### Day 2 — You open Calendar

Month marks include your C days. You tap a day → `getDayInfo` → form sheet explains the 24h window.

### Day 3 — Vacation appears

You edit the period, set vacation for a week. Storage updates. Those days disappear from shift lists automatically because `isShiftDay` checks vacation. ICS export will EXDATE them. Widgets refresh.

### Day 4 — Friend overlay

You add a secondary period for your partner. Calendar gains dots. Home still only uses your primary countdown. Free weekends still ignore the partner’s shifts (by design).

### Day 5 — Share

You tap share. A URL encodes the recipe. A classmate opens it, lands on Add Rotation with a draft, saves their own primary copy with a new `id`.

### Day 6 — Export

You export ICS into Apple Calendar. Recurrence + exceptions mirror the same math the in-app calendar uses.

### Day 7 — Widget glance

Without opening the app, the Upcoming Shifts widget lists the next guardias. Android may have woken `widgetTaskHandler` on a timer; it rebuilt props from storage using the same libraries.

### End — Delete

Deleting removes the recipe from the array, saves, refreshes widgets. Derived days vanish everywhere because nothing computes them anymore.

That entire lifecycle never required a server.

---

## 21. Internationalization (English & Spanish)

Folder: `src/i18n/`

### Catalogs

- `en.json` — English strings
- `es.json` — Spanish strings

Keys are nested, e.g. `tabs.home`, `settings.title`.

### Rules

- **Do not hardcode** user-visible English/Spanish in components.
- Always add keys to **both** catalogs.
- Default fallback language: **`es`**.

### Usage in components

```tsx
const { t } = useTranslation();
return <Text>{t('tabs.calendar')}</Text>;
```

Interpolation example (conceptually):

```tsx
t('home.shiftsLeft', { count: 3 })
```

(Exact key names live in the JSON files — always copy an existing pattern.)

### Device language

`resolveDeviceLanguage()` uses `expo-localization`. If the device is neither `en` nor `es`, the app falls back to Spanish.

### Why Spanish is the fallback

The product’s primary users are Mexican residents. An unrecognized device locale should still show a sensible language for that market, not English-by-default.

### Widgets and i18n

Widgets also need translated strings. Preference changes trigger widget refresh so home-screen text updates. Widget prop builders read the effective language (stored preference or device) when assembling titles like “Próximas guardias.”

### Adding a new string (checklist)

1. Add the key to `es.json` (source of truth for product tone).
2. Add the same key to `en.json`.
3. Use `t('your.key')` in the component.
4. If widgets show that text, confirm widget refresh paths still run after language change (they already do via preferences).

---

## 22. Styling: NativeWind and theme

### 22.1 NativeWind

The app uses **NativeWind v5** (Tailwind CSS v4 + `react-native-css`). Instead of large `StyleSheet` blocks, screens often write:

```tsx
<View className="flex-1 px-gutter gap-3">
  <Text className="font-serif text-5xl">…</Text>
</View>
```

Import primitives from `src/tw` when using `className`, so CSS-enabled components are used.

Theme tokens (spacing gutter, radii, serif font) live in `src/global.css`.

Custom tokens you will see:

- `--spacing-gutter` → `px-gutter` / padding helpers
- `--spacing-widget` → vertical padding shared with widget cards
- `--spacing-tab-clearance` → bottom space so content clears the floating tab bar
- `--font-serif` → Instrument Serif for display titles

### 22.2 Design system constraints

From project rules:

- One shared UI path for iOS/Android/web for **app screens**
- No `.ios.tsx` / `.android.tsx` UI splits for screens
- No `@expo/ui` in app screens (exception: **iOS widgets only**)
- No Material Design 3 / react-native-paper as the design system

### 22.3 Theme colors

`src/theme/colors.ts` + `theme-context.tsx`:

- Preference: light / dark / follow system
- `useTheme()` gives `{ scheme, colors, … }` for imperative cases (icons, nav chrome, mark color resolution)

Some calendar mark colors still need JS access (widget prop builders, SVG-adjacent cases). Theme tokens and `colors` objects cooperate rather than fighting each other.

### 22.4 Why both CSS utilities and a `colors` object?

Beginners often ask: “If we have Tailwind, why also `colors.text` in JS?”

Because some places cannot use `className` cleanly:

- React Navigation header tint options
- Vector icon `color` props
- Widget prop bundles that must be plain serializable values
- Alpha blending (`withAlpha`) for past/dimmed marks

So: layout and typography → NativeWind; dynamic brand/mark colors → theme object + helpers.

---

## 23. Home-screen widgets

Widgets show schedule info **without opening the app**. They are the most “native” part of the project.

### 23.1 Shared brain, two UIs

Shared (platform-agnostic) code: `src/features/widgets/`

- `build-widget-props.ts` — load periods/prefs, compute props
- `two-week-layout.ts` / `upcoming-shifts-layout.ts` — adapt content density to widget size
- `refresh-home-widgets.ts` — refresh Android + iOS together
- `types.ts` — prop shapes both platforms understand

Platform UIs:

- Android: `src/features/widget-android/` (`react-native-android-widget`)
- iOS: `src/features/widget-ios/` (`expo-widgets` + SwiftUI via `@expo/ui`, `'widget'` directive)

### 23.2 Why share a prop contract?

Imagine Android and iOS each reinvented “what is a day cell?” They would drift. Instead both consume shapes like:

```ts
type WidgetDayCellProps = {
  dayNumber: string;
  isToday: boolean;
  kind: 'shift' | 'vacation' | 'freeWeekend' | 'none';
  backgroundColor: HexColor | null;
  textColor: HexColor;
  borderColor: HexColor | null;
  secondaryDotColor: HexColor | null;
};
```

Android renders with `react-native-android-widget` components. iOS renders with SwiftUI widget views. Same data, different paintbrushes.

### 23.3 Two widget kinds

Configured in `app.json`:

1. **TwoWeekCalendar** — multi-week marks (layout grows with height)
2. **UpcomingShifts** — list of next guardias (item count depends on height)

`resolveTwoWeekLayout(height, width)` and `resolveUpcomingShiftsLayout(height)` choose how dense the content should be. That is **content adaptation**, not the Android launcher’s default cell size.

### 23.4 Android lifecycle

`widgetTaskHandler` runs when Android asks for an update (added, resized, periodic refresh). It:

1. Reads storage (or uses an override list after an in-app edit)
2. Resolves layout from width/height
3. Builds light + dark prop bundles
4. Calls `renderWidget`

Light and dark are both prepared so the system can flip appearance without re-running JS immediately.

### 23.5 iOS notes

iOS widgets live in a separate app extension process. They need:

- App Group storage / timeline updates via `expo-widgets`
- Lazy registration so a widget failure cannot block main UI startup (`index.ts` comments this explicitly)

### 23.6 When widgets refresh from the app

- After add/update/delete period
- After language or appearance change
- When the app returns to foreground (`useHomeWidgetForegroundRefresh`)

### 23.7 Expo Go limitation

Widgets require a **dev client / release binary**. Day-to-day screen work can stay in Expo Go; widget work needs `expo run:*` or EAS.

### 23.8 Android provider XML gotcha

Default picker cell sizes are baked into native XML under `android/`. After changing sizes in `app.json`, run:

```bash
node scripts/sync-android-widget-providers.mjs
```

(`npm run android` runs this automatically.)

---

## 24. Sharing rotations via links

File: `src/features/rotations/share-rotation-link.ts`

### Idea

Encode a rotation **draft** (no `id` / `createdAt`) as JSON → base64url → put it in a URL query param `d`.

HTTPS form (website landing):

`https://alanmatias.com/guardias/r/?d=…`

Custom scheme fallback:

`miguardia://guardias/r?d=…`

### What is in the payload?

`SharedRotationDraft` includes label, dates, pattern, first shift, vacation, start time, color — enough to recreate the recipe. It deliberately omits `id` and `createdAt` so the receiver gets a fresh local identity.

### Receive flow

1. OS opens the app with the URL (`expo-linking`).
2. `useShareLinkNavigation` checks the path looks like a share link.
3. `parseShareUrl` validates and returns a draft (or shows an invalid alert).
4. Navigation: `Shifts` → `AddRotation` with `{ draft }`.
5. Receiver always imports as a **primary** clone.

### Why a website URL and a custom scheme?

- HTTPS links work from WhatsApp/Messages even if the app is not installed (landing page can prompt install).
- Custom scheme `miguardia://` opens the app directly when installed.
- Both carry the same `d=` payload format.

This is peer-to-peer sharing **without a backend**: the link *is* the data.

Security note for beginners: anyone with the link can read the schedule fields inside it. Do not put secrets in share payloads (this app does not).

### Validation mindset

`parseShareDraft` is defensive: wrong types, bad dates, illegal offsets for a 3-day cycle, etc. return `null` instead of crashing. Untrusted URL data should always be treated as hostile/malformed.

---

## 25. Exporting to calendars (ICS & Google)

Folder pieces under `src/features/calendar/`:

| Mechanism | Files / idea |
|---|---|
| **ICS file** | `build-shifts-ics.ts` — RFC 5545 calendar text; share via OS share sheet |
| **Google Calendar URL** | `build-google-calendar-url.ts` — opens a prefilled Google template in the browser |
| **Rotation image** | capture a visual card (`share-rotation-image.ts`, view-shot) for WhatsApp/etc. |

### ICS in plain language

An `.ics` file is a text format calendars understand. DeGuardia builds one with:

- A recurring rule: every 3 or 4 days
- `EXDATE` lines for vacation days that would otherwise match the pattern

That is smaller and smarter than listing every shift as a separate event when the pattern is regular.

### Permissions

`app.json` configures `expo-calendar` write-only access copy (Spanish permission string for adding events) and media library save permission for calendar images.

### Why multiple export paths?

Residents live in different ecosystems:

- Some want Apple Calendar / Outlook via ICS
- Some live in Google Calendar
- Some just want a screenshot-like image for a group chat

The app meets them where they are without requiring an account.

---

## 26. React patterns used in this codebase

You do not need to master all of React to read this repo, but these patterns appear often.

### 26.1 Props down, events up

Parents pass data down (`periods`, `colors`). Children call callbacks or navigate when the user acts. Context is used when many distant screens need the same ground truth.

### 26.2 Discriminated unions

Instead of `shift: ComputedShift | null` plus separate booleans, status objects use `kind`:

```ts
status.kind === 'in_shift'
  ? status.currentShift
  : null
```

TypeScript narrows the type after you check `kind`.

### 26.3 Hooks you will see

| Hook | Role here |
|---|---|
| `useState` | Local UI state (filters, “now” tick, form fields) |
| `useEffect` | Hydrate storage, subscribe to links, apply appearance |
| `useCallback` | Stable function identities where lists/children care |
| `useMemo` | Derive maps/lists from periods + theme without redo work every tiny render |
| `useFocusEffect` | Refresh when a screen gains focus (Home time-sensitive UI) |
| `useTranslation` | `t('key')` |
| `useRotations` / `usePreferences` / `useTheme` | App-wide ground truth |

### 26.4 “Ready gates”

Providers return `null` until AsyncStorage hydration finishes. That avoids a flash of empty state that then pops into real data — which would also briefly refresh widgets with wrong empties.

### 26.5 Navigation typing

Param lists like `CalendarStackParamList` make `navigation.navigate('DayDetail', { date })` type-checked. If you forget `date`, TypeScript complains. This is a gift; lean on it.

### 26.6 Lists and performance notes

The app is not a gigantic social feed. Still, the project keeps agent skills for React Native list performance (avoid inline objects in hot lists, etc.). Prefer simple screens; optimize when a profiler says so.

### 26.7 Pressable, not TouchableOpacity

Modern RN guidance in the repo: use `Pressable`. Match existing screens.

---

## 27. Testing philosophy

Tests are mostly **Jest unit tests** next to the code (`*.test.ts`).

What gets tested heavily:

- Shift day math (`is-shift-day`, `build-shift`, homepage status)
- Free weekends
- Mark builders
- Share link encode/decode
- Storage normalization
- Widget layout helpers

What is *not* the focus:

- Full end-to-end Detox UI suites (not the primary safety net here)

### Why test pure functions first?

Because that is where a wrong Friday rule or off-by-one cycle would silently mis-schedule someone’s entire residency block. UI can look fine while the math is wrong — tests catch the math.

### How to read a test as a beginner

Open any `*.test.ts`. You will usually see:

1. Arrange — build a small `RotationPeriod` fixture
2. Act — call the function
3. Assert — `expect(…).toEqual(…)`

Those fixtures are executable documentation. If a comment in production code confuses you, the test often shows the intended edge case.

Run:

```bash
npm test
```

### When you change shift math

1. Add or adjust a failing test that describes the correct behavior.
2. Fix the implementation until green.
3. Manually smoke-test Home + Calendar once.

That loop is how this repo stays trustworthy without a backend QA environment.

---

## 28. Builds, Expo Go, and store releases

### 28.1 Three ways to run

| Mode | Command | Widgets? | Typical use |
|---|---|---|---|
| Expo Go | `npm start` | No | Daily UI development |
| Local native | `npm run ios` / `android` | Yes | Widget work, native modules |
| EAS cloud build | `eas build` (see store docs) | Yes | TestFlight / Play upload |

### 28.2 What `app.json` controls

- App display name **DeGuardia**
- Bundle IDs (`com.alanmatias.guardias`)
- URL scheme `miguardia`
- Plugins (localization, calendar, media library, Android/iOS widgets, splash, fonts, …)
- Widget labels/descriptions/sizes

Changing plugin config often requires a **new native build**, not just a JS reload.

### 28.3 Versioning & stores

- iOS: follow `docs/store/IOS_RELEASE.md` and the `ios-store-submit` skill; version gate scripts prevent uploading a marketing version ≤ last approved.
- Android: follow `docs/store/ANDROID_RELEASE.md`; owner typically downloads the `.aab` and uploads in Play Console (no Play service-account `eas submit` unless explicitly set up).

### 28.4 Patches

`patch-package` runs on `postinstall` for small dependency fixes checked into `patches/`. If a third-party bug blocks the app, a patch may exist — do not “upgrade away” a patch blindly without checking why it was added.

### 28.5 Web

`npm run web` exists for a limited preview. The product is mobile-first; treat web as a convenience, not feature parity with widgets or all native sheets.

---

## 29. End-to-end data flow

Here is the life of a schedule change, end to end.

```
User taps Save on Add Rotation
        │
        ▼
validate period fields
        │
        ▼
RotationsProvider.addPeriod(period)
        │
        ├─► setState(sorted periods)     // UI updates immediately
        │
        ├─► AsyncStorage.setItem(...)    // disk updated
        │
        └─► refreshHomeWidgets(periods)  // Android + iOS widgets redraw
                │
                ├─ build-widget-props (uses lib/shifts + mark pipeline)
                ├─ render Android widgets
                └─ update iOS widget timelines

Meanwhile, Home / Calendar screens re-render from Context
and call getHomepageShiftStatus / getRangeMarkInputs / …
```

Reading a day on the calendar:

```
User taps March 15
        │
        ▼
navigate to DayDetail { date: "2026-03-15" }
        │
        ▼
getDayInfo(periods, date)
        │
        ├─ find covering primary period
        ├─ vacation? → kind: vacation
        ├─ buildShift? → kind: shift (with start/end)
        └─ else → kind: free
        │
        ▼
Day detail UI shows the result
```

Opening a share link:

```
User taps https://alanmatias.com/guardias/r/?d=…
        │
        ▼
OS opens DeGuardia (scheme / universal link path)
        │
        ▼
useShareLinkNavigation → parseShareUrl
        │
        ├─ invalid → Alert
        └─ valid draft → navigate Shifts / AddRotation { draft }
```

No network round trip occurs for schedule math or storage. The only “network-shaped” pieces are optional exports (open Google in a browser) and fetching a share URL *into* the app.

---

## 30. Screen-by-screen UI tour

This section maps what the user sees to folders.

### Home tab — `HomeHome`

**File:** `src/features/dashboard/screens/home-screen.tsx`

Shows either empty state or active status derived from `getHomepageShiftStatus`. Child components:

- `NextShiftCard` — countdown / in-shift messaging
- `ShiftsLeftCard` — remaining / progress
- `WeekendBanner` — next free weekend
- `TwoWeekCalendar` — compact marks

Settings gear navigates to `Settings` in the same stack.

### Settings — `Settings`

**File:** `src/features/settings/screens/settings-screen.tsx`

Language + appearance. Writes preferences storage; triggers i18n + theme + widget refresh.

### Calendar — `CalendarHome`

**File:** `src/features/calendar/screens/calendar-screen.tsx`

Month pager, custom day cells, legend, filters, export entry points. Uses `getMonthMarkInputs` / mark context builders.

### Day detail — `DayDetail`

**File:** `src/features/calendar/screens/day-detail-screen.tsx`

Form sheet. Explains whether the day is free, vacation, or a 24h shift with times.

### Shifts list — `ShiftsList`

**File:** `src/features/rotations/screens/shifts-list-screen.tsx`

All periods, grouped (see `group-periods-by-recency.ts`). Entry to add/detail.

### Add / Edit rotation

**File:** `src/features/rotations/screens/add-rotation-screen.tsx` (shared)

Large form: dates, pattern, color, role, vacation, optional first shift, preview calendar. Save calls `addPeriod` or `updatePeriod`.

### Rotation detail

**File:** `src/features/rotations/screens/rotation-detail-screen.tsx`

Summary of one period, share actions, edit/delete affordances, detail calendar.

### Floating tab bar

**File:** `src/navigation/floating-tab-bar.tsx`

Custom chrome sitting above the system edge, wired as `tabBar={…}` on the root tab navigator.

---

## 31. Common pitfalls and “why did they do it that way?”

### Pitfall: storing every shift day

It feels natural to save an array of 200 dates. This app refuses that. Recipes stay small and consistent. If you add a feature that needs dates, **compute** them.

### Pitfall: inventing a second mark list on a new screen

You will get free-weekend bugs at month edges. Always call `getRangeMarkInputs` / `getMonthMarkInputs` and `getDayMarkKind`.

### Pitfall: treating secondary like primary on Home

Friend dots are social context, not “your next shift.” Filter with `primaryPeriods`.

### Pitfall: forgetting widgets after a data change

If you add a new persistence path that changes what widgets should show, call `refreshHomeWidgets` (or go through the existing context setters that already do).

### Pitfall: editing Android widget XML by hand only

Sizes drift from `app.json`. Use the sync script.

### Pitfall: hardcoding Spanish in a hurry

Even a one-off `Alert` string needs i18n keys in both catalogs.

### Pitfall: using Expo Go to “debug widgets”

They will not appear. Build a native binary.

### Why Context instead of a global store library?

Small state surface. Providers already hydrate and persist. Extra store libs would mainly add indirection.

### Why feature folders instead of `components/` + `utils/` soup?

Because “calendar marks” and “rotation storage” are product concepts. Newcomers find features faster than archeological layers of utils.

### Why NativeWind and also some StyleSheet/theme objects?

Pragmatism: utilities for layout; JS colors where APIs demand them.

---

## 32. FAQ for beginners

**Q: Where is the API server code?**  
A: There isn’t one. Offline-first client only.

**Q: Where do user accounts live?**  
A: Nowhere. No auth.

**Q: How does the app know my shifts after I reopen it?**  
A: `RotationsProvider` reads AsyncStorage key `guardias.rotationPeriods`.

**Q: Can two phones sync?**  
A: Not built-in. You can share a rotation link and re-import, but there is no live sync.

**Q: What is a “provider”?**  
A: A React component that holds state and makes it available to children via Context.

**Q: What is `YYYY-MM-DD` everywhere?**  
A: ISO calendar dates as strings. They sort correctly and avoid many timezone pitfalls when you only care about *days*.

**Q: Why 24-hour shifts from 07:00?**  
A: Domain default for many Mexican guardias; start time is configurable per period.

**Q: What does “discriminated union” mean?**  
A: An object with a tag field (`kind`) so TypeScript knows which other fields exist.

**Q: Why are there so many `*.test.ts` files?**  
A: To lock schedule math. Wrong math harms real people’ schedules.

**Q: Is `docs/ARCHITECTURE.md` the same as `AGENTS.md`?**  
A: No. `AGENTS.md` is a short convention sheet for contributors/agents. This doc is the long teaching guide.

**Q: Where do I change the app’s display name?**  
A: `app.json` (`expo.name`, iOS `CFBundleDisplayName`, Android package metadata via Expo config).

**Q: What is Metro?**  
A: The JavaScript bundler that packs your TS/JS for the device during development and builds.

---

## 33. How to explore the code as a beginner

A suggested learning path:

### Session A — run it and click around (30–60 min)

1. `npm install && npm start`
2. Add a rotation (A–D, letter B, a month range)
3. Watch Home, Calendar, and Shifts update
4. Change language in Settings

### Session B — follow one save (45 min)

1. Open `add-rotation-screen.tsx` (under rotations screens)
2. Find where it calls `addPeriod`
3. Open `rotations-context.tsx` and `storage.ts`
4. Open `refresh-home-widgets.ts`

### Session C — understand one day (60 min)

1. Read `types.ts` (`RotationPeriod`)
2. Read `is-shift-day.ts` slowly with a paper calendar
3. Work Example A in [§19](#19-worked-examples-reading-the-schedule-by-hand) by hand
4. Read `build-shift.ts` and `get-day-info.ts`
5. Open Calendar day detail screen

### Session D — marks & free weekends (45 min)

1. `month-legend-stats.ts` → `getRangeMarkInputs`
2. `free-weekends.ts`
3. `calendar-day-marker.ts` → `getDayMarkKind`

### Session E — widgets (optional, needs native build)

1. `build-widget-props.ts`
2. Android `widget-task-handler.tsx`
3. Skim iOS widget files under `widget-ios/`

### Session F — share + export (30 min)

1. `share-rotation-link.ts` encode/decode
2. `use-share-link-navigation.ts`
3. Skim `build-shifts-ics.ts`

### When reading unfamiliar files

Ask:

1. Is this **UI**, **state**, **storage**, or **pure math**?
2. Does it **derive** something or store **ground truth**?
3. Is there already a helper in `src/lib/shifts/` I should reuse?

### A tiny contribution exercise

1. Add a harmless i18n string used in Settings subtitle or similar.
2. Run the app in both languages.
3. Run `npm test` to ensure nothing broke.

That teaches catalogs + safe UI edits without touching schedule math.

---

## 34. Glossary

| Term | Meaning in this project |
|---|---|
| **Guardia** | On-call / shift day for a medical resident |
| **Rotation period** | A dated block with pattern, vacations, color, role |
| **Offset letter** | A/B/C/D identity in the hospital cycle |
| **Cycle days** | `3` (A–C) or `4` (A–D) |
| **Primary** | Your schedule (Home + fills + free weekends) |
| **Secondary** | Friend/spouse schedule (calendar dots only) |
| **Computed shift** | In-memory start/end for a day; not stored |
| **AsyncStorage** | On-device key/value JSON storage |
| **Provider / Context** | React pattern to share state down the tree |
| **Stack navigator** | Screens layered with back navigation |
| **Tab navigator** | Top-level Home / Calendar / Shifts switcher |
| **i18n** | Internationalization (EN/ES string catalogs) |
| **NativeWind** | Tailwind-style `className` styling for RN |
| **Expo Go** | Fast client for UI development; no custom widgets |
| **EAS** | Expo cloud builds for store binaries |
| **ICS** | Calendar file format for sharing events |
| **Widget** | Home-screen glanceable UI outside the app |
| **Offline-first** | Works without a server; device is source of truth |
| **Hydration** | Loading saved state from disk into React state on launch |
| **Form sheet** | Modal-style screen that slides up (day detail) |
| **Base64url** | URL-safe encoding used in share link payloads |
| **EXDATE** | ICS exception dates carved out of a recurrence rule |
| **Ground truth** | The minimal stored facts everything else derives from |
| **Metro** | Bundler that serves/packs JS during Expo development |

---

## Appendix A — “Backend” vs “frontend” cheat sheet

| Concern | Where it lives | Backend-like? |
|---|---|---|
| Is March 15 a shift? | `src/lib/shifts/` | Yes (domain) |
| Save periods | `rotations/storage.ts` | Yes (persistence) |
| Home countdown card | `dashboard/` | Frontend |
| Month grid painting | `calendar/` | Frontend (uses domain) |
| Widget redraw | `widgets/` + platform folders | Hybrid |
| Translations | `i18n/*.json` | Frontend content |
| App Store version gates | `scripts/` + `docs/store/` | Release ops |
| Share link parse | `share-rotation-link.ts` | Domain + transport |
| Deep link routing | `use-share-link-navigation.ts` | Frontend navigation |

---

## Appendix B — Key files to bookmark

| File | Why |
|---|---|
| `App.tsx` | Provider + tab shell |
| `index.ts` | Process entry + Android widget registration |
| `src/features/rotations/types.ts` | Core data model |
| `src/lib/shifts/is-shift-day.ts` | Heart of schedule math |
| `src/lib/shifts/get-homepage-shift-status.ts` | Home status engine |
| `src/features/rotations/rotations-context.tsx` | In-memory + persist periods |
| `src/features/calendar/month-legend-stats.ts` | Shared mark inputs |
| `src/features/calendar/free-weekends.ts` | Fri+Sat+Sun rule |
| `src/features/widgets/build-widget-props.ts` | Widget data assembly |
| `src/features/rotations/share-rotation-link.ts` | Backend-less sharing |
| `src/i18n/en.json` / `es.json` | All user-facing copy |
| `AGENTS.md` | Project rules of the road |
| `docs/ARCHITECTURE.md` | This teaching guide |

---

## Appendix C — Design principles worth copying

If you contribute to this repo (or build something similar), these principles explain *why* the architecture feels coherent:

1. **Compute, don’t catalog** — store recipes, derive days.
2. **One mark pipeline** — shared helpers beat per-screen special cases.
3. **Offline by default** — no auth tax for a personal schedule tool.
4. **Pure core, thin UI** — test the math; keep screens comparatively dumb.
5. **Feature folders** — navigate by product concept, not by file type alone.
6. **i18n from day one** — string catalogs, Spanish fallback.
7. **Widgets reuse app math** — do not reimplement A/B/C/D inside Swift/Kotlin.
8. **Surgical changes** — match existing patterns; avoid speculative abstractions.
9. **Defensive parsing at boundaries** — URL payloads and old storage get normalized or rejected.
10. **Same marks everywhere** — Home, Calendar, widgets tell one story.

---

## Appendix D — Metaphor map (for absolute beginners)

| Real-world metaphor | In DeGuardia |
|---|---|
| Recipe card for a cake | `RotationPeriod` (ingredients = dates, letter, cycle) |
| Baking the cake each time you want a slice | `isShiftDay` / `buildShift` |
| Pantry jar labeled with the recipe cards | AsyncStorage |
| Kitchen counter with cards laid out | `RotationsProvider` React state |
| Wall calendar with highlighter | Calendar feature + mark pipeline |
| Sticky note on the fridge | Home-screen widget |
| Photocopy of the recipe handed to a friend | Share link (`?d=…`) |
| Exporting dates into Google Calendar | ICS / Google URL export |
| Bilingual cookbook editions | `en.json` / `es.json` |

If you get lost in folders, return to this metaphor: **almost everything is either writing recipe cards, storing them, or baking days from them.**

---

## Appendix E — Dependency roles (one-liners)

| Package | One-liner |
|---|---|
| `expo` | App platform and APIs |
| `react` / `react-native` | UI runtime |
| `@react-navigation/*` | Tabs and stacks |
| `@react-native-async-storage/async-storage` | Disk key/value |
| `date-fns` | Date arithmetic |
| `react-native-calendars` | Month grid |
| `i18next` / `react-i18next` | Translations |
| `expo-localization` | Device language |
| `nativewind` / `react-native-css` / `tailwindcss` | Styling |
| `react-native-android-widget` | Android widgets |
| `expo-widgets` / `@expo/ui` | iOS widgets |
| `expo-linking` | Deep links |
| `expo-sharing` / `expo-file-system` | Share files |
| `react-native-view-shot` | Capture rotation image |
| `jest` / `ts-jest` | Unit tests |

---

## Appendix F — Suggested print / study plan (≈ half-day)

If you want a literal “course” through this doc:

| Block | Time | Sections |
|---|---|---|
| 1. Orientation | 45 min | §§1–6 |
| 2. Domain + math | 60 min | §§7–8, 19–20, paper examples |
| 3. State + navigation | 40 min | §§9–12 |
| 4. Features | 50 min | §§13–18, 30 |
| 5. Cross-cutting | 40 min | §§21–26 |
| 6. Ship + practice | 30 min | §§27–29, 31–33, try Session B in the app |

Total: roughly **4–5 hours** of deliberate study — comfortably in the 30–50 page teaching range when you include working the examples and clicking through the running app.

---

## Closing

DeGuardia is a **client-only** Expo app whose “backend” is really:

- a careful **domain model** for Mexican guardia rotations, and
- **device-local persistence**,

with a React Native **frontend** organized by features, shared shift math, consistent calendar marking, bilingual copy, and optional native home-screen widgets.

Once you can answer these four questions, you understand most of the repository:

1. What fields define a `RotationPeriod`?
2. How does `isShiftDay` decide yes/no?
3. Where does that period list live at runtime and on disk?
4. How do Home, Calendar, and widgets all ask for marks without inventing their own rules?

If you can walk those paths in the code — and work one paper example from [§19](#19-worked-examples-reading-the-schedule-by-hand) — you are no longer a beginner in *this* codebase. You are ready to change it safely.
