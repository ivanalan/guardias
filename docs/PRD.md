# Guardias — Product Requirements Document

**Version:** MVP v1.0  
**Framework:** React Native + Expo  
**Platform:** Android-first, iOS-extensible  
**Languages:** English and Spanish (MVP)  
**Last updated:** July 2026

---

## 1. Overview

Guardias is a mobile app for tracking on-call medical rotation shifts. It is designed specifically for the Mexican medical system's guardia structure, where doctors rotate through repeating patterns (most commonly **A-D**, every 4 days). For MVP, all shifts are **24 hours**.

The app replaces bloated, ad-ridden alternatives with a clean, offline-first tool that respects the user's time.

### Problem statement

Existing apps like *On Calls / Guardias Médicas* are filled with ads and paywalled features. Mexican medical residents need a simple, reliable way to track their guardia schedule, see free weekends at a glance, and plan their personal life around their rotation.

### Target users

- **Primary:** Medical residents or doctors in Mexico following A-C or A-D guardia rotations
- **Secondary:** Close contacts (friends, family) who want to coordinate around the user's schedule

### Success metrics

- User can set up a full rotation cycle in under 3 minutes
- Calendar correctly renders shift boundaries for 3+ months with no manual corrections
- A friend can view a shared schedule without creating an account *(v1.2)*
- Zero crashes in core shift calculation logic across edge cases (year boundaries, leap years, DST)
- App UI is fully usable in English and Spanish with no untranslated strings in core flows
- Play Store listing is published with English and Spanish store metadata (title, description, screenshots captions)

---

## 2. Mexican Medical Rotation System

### Rotation types (guardia patterns)

Guardia rotations are named by how often a doctor is on call within a repeating cycle. The letter after the hyphen indicates the cycle length.

**MVP patterns:**


| Pattern | Cycle length | Meaning                                                               |
| ------- | ------------ | --------------------------------------------------------------------- |
| A-C     | 3 days       | On call every 3 days                                                  |
| **A-D** | **4 days**   | **On call every 4 days — standard in Mexican hospitals; MVP default** |


Other every-N named patterns (A-B, A-E, A-F, …) and custom rotations are deferred (see below).

Within a fixed-length cycle, the doctor is assigned a **letter** (A, B, C for A-C; A, B, C, D for A-D) that selects which days of the shared hospital calendar are their shift days.

**Calendar anchor:** January 1 of each calendar year is always **A**. Letters then advance one step per calendar day (A→B→C→D→A… for A-D; A→B→C→A… for A-C). The rotation period’s start/end dates only bound when the doctor is on that letter — they do **not** restart the cycle. After a leap day, counting continues; at each new year the cycle resets so Jan 1 is A again (so Dec 31 and Jan 1 can both be A).

**Optional first-shift override:** If the hospital calendar no longer matches the Jan 1 rule, the user can set a **first shift date** on the period. When set, that day is a shift and subsequent shifts fall every `cycleDays` afterward (continuous; no Jan 1 reset). The letter (A/B/C/D) is still stored as the user’s assignment identity. When unset, the year-anchored letter calendar applies.

**A-D example (4-day cycle, MVP standard) — days from Jan 1:**


| Letter | Shift days (0-based from Jan 1) |
| ------ | ------------------------------- |
| A      | Days 0, 4, 8, 12…                |
| B      | Days 1, 5, 9, 13…                |
| C      | Days 2, 6, 10, 14…               |
| D      | Days 3, 7, 11, 15…               |


**A-C example (3-day cycle) — days from Jan 1:**


| Letter | Shift days (0-based from Jan 1) |
| ------ | ------------------------------- |
| A      | Days 0, 3, 6, 9…                 |
| B      | Days 1, 4, 7, 10…                |
| C      | Days 2, 5, 8, 11…                |


### Custom rotation patterns (v3.0)

Custom patterns are **out of scope for MVP** and planned for **v3.0**:

1. **Every N days** — user-chosen N (e.g. every 5 days from the start date), including named presets beyond A-C/A-D such as A-B or A-E.
2. **Specific weekdays** — shift on selected days of the week regardless of cycle position (e.g. every Wednesday and Saturday).

### Shift duration

For MVP, **every shift is 24 hours**. Variable durations (e.g. 36-hour weekday guardias) and holiday-based overrides are out of scope for v1.0.

### Rotation periods

Each rotation typically lasts **3 months (one trimester)**. After 3 months, the doctor may be assigned a new pattern or offset (e.g. from A to B within an A-D cycle). In MVP the user manages **multiple sequential, non-overlapping** rotation periods via a rotation list (see F4); periods that intersect the visible month appear on the calendar.

---

## 3. MVP Features

### F1 — Rotation period setup

The user creates a rotation period by specifying:

- **Required label** (e.g. "Internal medicine", "Pediatrics – Jan 2025")
- **Rotation pattern:**
  - **A-D (every 4 days)** — MVP default; user picks letter A, B, C, or D on the year calendar
  - **A-C (every 3 days)** — user picks letter A, B, or C
- Start date (first day of rotation)
- End date (last day of rotation)
- **First shift date** — defaults to the first day on/after the start date that matches the chosen letter on the Jan 1 calendar; user may edit it to re-phase the every-N pattern when the hospital calendar differs
- **Calendar color** — preset swatch used to highlight that period’s shift days on the calendar (default brand blue)
- **Optional vacation period** — start and end dates during which no shifts are scheduled, even if the rotation pattern would otherwise assign one (e.g. approved leave mid-trimester)
- **Optional shift start time** — time of day each shift begins (default **07:00**)

All shifts are **24 hours**. By default the app calculates shift dates from the year-anchored letter calendar (Jan 1 = A) and the chosen letter, within the period’s start/end dates and excluding any vacation dates. If the user overrides the first shift date, shifts are that date and every cycle length afterward instead. Users manage periods from the rotation list (see F4).

### F2 — Calendar view

A monthly calendar shows:

- Shift days highlighted
- Free weekends visually distinguished (Friday, Saturday, and Sunday all free — a Friday shift ends Saturday morning, so that weekend is not free)
- Navigate forward/backward by month

**Day detail sheet**

Tapping any day opens a **bottom sheet** with details for that day (e.g. free day, or shift start/end/duration). From a shift day sheet, the user can navigate to the full **Shift detail** screen (see F6).

**Month legend and filter**

Below the calendar, a legend shows counts for the visible month:

- **X shift days** (guardias)
- **X free weekends**

Tapping a legend item filters the calendar: the selected type stays full opacity; all other mark types are reduced in opacity. Tapping again (or tapping another item) updates the filter accordingly.

### F3 — Homepage

The app's default landing screen. It surfaces at-a-glance statistics for the current (or upcoming) rotation period:

- Time until the next shift starts (days and hours)
- Number of shifts remaining in the current rotation period
- Number of shifts already worked in the current rotation period
- If currently in a shift: time remaining in the current shift

**Planned beyond MVP (v1.1):** cumulative career stats on the homepage — total hours worked and total shifts completed across all past rotation periods.

### F4 — Rotation period management

The **Shifts** tab shows a **list of rotation periods** (label + date range). From the list the user can:

- Add a new period (FAB → add form)
- Open a period's **rotation detail** (tap a list row)
- Edit or delete a period from detail / edit flows

The add/edit form collects all F1 fields (required label, A-C or A-D pattern + offset, start/end date, calendar color from presets, optional vacation, optional shift start time). Shift duration is fixed at 24 hours and is not user-editable in MVP.

**MVP scope:** multiple sequential, non-overlapping rotation periods. Periods that intersect the visible month are shown on the calendar (F2). Overlapping date ranges are rejected with validation.

### F5 — Bilingual UI (English & Spanish)

The MVP ships with full in-app localization for English (`en`) and Spanish (`es`).

**Behavior**

- Default language follows the device locale when it is `en` or `es`
- Fallback language is Spanish (primary market)
- User can override language in Settings; choice persists across app restarts
- All user-facing copy in MVP screens uses translation keys — no hardcoded strings in components
- Dates and times respect the active locale (e.g. month names, 12/24-hour display via locale conventions)
- Schedule labels (A/B/C/D) remain universal; explanatory text around them is translated

**Publishing**

- Google Play listing includes both `en-US` (or `en`) and `es-MX` store listings
- In-app language matches store locale where possible; user override always wins

**In scope for v1.0**

- UI strings for all MVP screens (F1–F4, F6, Settings)
- Error and validation messages
- Empty states and onboarding hints

**Out of scope for v1.0**

- Additional locales beyond English and Spanish
- Translating user-created rotation labels (stored as entered)

### F6 — Shift detail

Opened from the calendar day sheet (F2) when the user opens details for a past or future shift day.

**Future shifts**

- Date, start time, end time, duration (24 hours), rotation label

**Past shifts**

- Date (primary emphasis)
- Hours worked (computed from scheduled start/end; 24 hours in MVP)
- Step count *(planned v2.0 — requires health device integration)*

---

## 4. Out of Scope for MVP


| Feature                                                       | Target version |
| ------------------------------------------------------------- | -------------- |
| Cumulative stats (total hours worked, total shifts completed) | v1.1           |
| Google Calendar sync                                          | v1.1           |
| iOS support                                                   | v1.1           |
| Push notifications for upcoming shifts                        | v1.1           |
| Variable / rule-based shift durations (e.g. 36 h weekdays)    | v1.1+          |
| Holiday rule overrides                                        | v1.1           |
| Friend schedule comparison                                    | v1.2           |
| Shareable schedule link                                       | v1.2           |
| User accounts / cloud sync                                    | v1.2           |
| Step count on past shift detail                               | v2.0           |
| Health device integration (steps, sleep)                      | v2.0           |
| Custom rotation (every N days / specific weekdays)            | v3.0           |
| Named presets beyond A-C / A-D (A-B, A-E, …)                  | v3.0           |
| Locales beyond English and Spanish                            | v1.1+          |


---

## 5. Data Model

All data is stored locally on-device using AsyncStorage. No backend or authentication is required for v1.0.

### RotationPeriod


| Field             | Type                   | Description                                             |
| ----------------- | ---------------------- | ------------------------------------------------------- |
| id                | string                 | UUID                                                    |
| label             | string                 | Required; e.g. "Internal medicine"                      |
| pattern           | RotationPattern        | How shift days are determined (see below)               |
| startDate         | ISO date string        | First day of rotation                                   |
| endDate           | ISO date string        | Last day of rotation                                    |
| firstShiftDate    | ISO date string \| null | Phase override: `null` = Jan 1 letter calendar; set = that day is a shift, then every `cycleDays` |
| vacationStartDate | ISO date string \| null | Optional vacation block start (inclusive)              |
| vacationEndDate   | ISO date string \| null | Optional vacation block end (inclusive)                |
| shiftStartTime    | string                 | Local time each shift starts, `HH:mm` (default `07:00`) |
| color             | string                 | Calendar mark color `#RRGGBB` (preset palette; default brand blue) |
| createdAt         | ISO datetime           | When the period was created                             |


Shift duration is not stored: all MVP shifts are **24 hours**.

### RotationPattern


| Field     | Type                 | Description                                                                                          |
| --------- | -------------------- | ---------------------------------------------------------------------------------------------------- |
| cycleDays | `3` \| `4`           | Cycle length: `3` = A-C, `4` = A-D (MVP default)                                                     |
| offset    | `A` \| `B` \| `C` \| `D` | Letter on the year-anchored calendar (Jan 1 = A). Index A=0, B=1, C=2, D=3. `D` only for A-D |


Custom pattern fields (`type: CUSTOM`, `customMode`, `intervalDays`, `weekdays`) are deferred to **v3.0**.

### Shift (computed, not stored)


| Field            | Type         | Description                                                    |
| ---------------- | ------------ | -------------------------------------------------------------- |
| startDateTime    | ISO datetime | Computed from year calendar letter + `shiftStartTime`          |
| endDateTime      | ISO datetime | Computed: startDateTime + 24 hours                             |
| durationHours    | `24`         | Fixed for MVP                                                  |
| rotationPeriodId | string       | Parent rotation period                                         |


### AppPreferences (stored)


| Field  | Type               | Description                                  |
| ------ | ------------------ | -------------------------------------------- |
| locale | `en` \| `es` \| null | User override; `null` = follow device locale |


---

## 6. Screen Inventory


| Screen              | Key content                                                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Homepage (F3)       | Time to next shift, shifts remaining, shifts worked, current-shift countdown; Settings entry (language)                                      |
| Calendar View (F2)  | Monthly calendar; day-tap bottom sheet; legend (shift days + free weekends) with opacity filter                                             |
| Shifts list (F4)    | List of rotation periods (label + date range); FAB to add                                                                                   |
| Add / Edit Rotation | Form: required label, A-C or A-D + offset, start/end date, first shift date (default from Jan 1 letter), optional vacation, shift start time (default 07:00); duration fixed at 24 h |
| Rotation Detail     | Label, hours worked / next shift summary, date range, shifts completed / remaining; edit action                                             |
| Shift Detail (F6)   | Past shifts: date, hours worked; future shifts: start/end time, duration (24 h), label; step count *(v2.0)*                                 |
| Settings (F5)       | Language (English / Español / System default); future: notifications, theme                                                               |


---

## 7. Edge Cases & Risks

- Rotation periods that span a year boundary (Dec → Jan) — Jan 1 resets to A when using the default letter calendar (Dec 31 and Jan 1 may both be A); with a first-shift override, the every-N cycle continues across the year boundary
- Leap years affecting shift date calculations (leap day advances the letter)
- Schedules starting mid-cycle (user joins on a non-A calendar day; start date only bounds the period)
- First-shift override that does not match the Jan 1 letter for the stored offset (letter remains identity; dates follow the override)
- A-C vs A-D offset letter mapping (A–C only for 3-day cycles)
- Vacation period overlapping scheduled shift days — those days must show as free
- Vacation period partially outside rotation bounds — validate or clamp to rotation dates
- Overlapping rotation period date ranges — reject with validation
- Daylight saving time transitions in Mexico (April and October)
- Back-to-back rotation periods with no gap between them
- User device timezone differs from hospital timezone
- Device locale is neither `en` nor `es` — must fall back to Spanish cleanly
- User switches language mid-session — all visible screens update without restart
- Custom shift start time (e.g. 07:00) crossing midnight when combined with 24 h duration
- Calendar legend filter: only one category emphasized at a time; empty months (0 shift days / 0 free weekends) still render counts correctly

---

## 8. Version Roadmap

### v1.0 — MVP

Core shift tracking (A-C / A-D, fixed 24 h shifts), homepage stats, calendar with day sheet and legend filter, rotation list with multiple sequential periods, shift detail for past and future shifts, bilingual UI (English & Spanish), bilingual Play Store listing.

### v1.1 — Quality of life

Cumulative homepage stats (total hours and shifts worked), Google Calendar sync, iOS support, push notifications, variable / rule-based shift durations, holiday rule overrides.

### v1.2 — Social

Friend schedule comparison, shareable schedule links, user accounts and cloud sync.

### v2.0 — Health

Health device integration (step counts, sleep tracking), step count on past shift detail, shift fatigue insights.

### v3.0 — Flexible schedules

Custom rotation patterns (every N days, specific weekdays), named presets beyond A-C / A-D (A-B, A-E, …).

---

## 9. Technical Stack


| Layer           | Choice                                                             | Reason                                         |
| --------------- | ------------------------------------------------------------------ | ---------------------------------------------- |
| Framework       | React Native + Expo                                                | Cross-platform, AI-friendly, no native config  |
| Language        | TypeScript                                                         | Catches bugs at compile time                   |
| Local storage   | AsyncStorage                                                       | No backend needed for MVP                      |
| Calendar UI     | react-native-calendars                                             | Flexible marking, active community             |
| Styling         | NativeWind (Tailwind CSS `className`)                              | Utility-first styling shared with web mental model |
| UI components   | React Native primitives + NativeWind                               | One shared UI path; Expo Go–first               |
| Date math       | date-fns                                                           | Reliable DST handling, tree-shakeable          |
| Localization    | expo-localization + i18next (or expo-localization + JSON catalogs) | Device locale detection, EN/ES string catalogs |
| Build & publish | EAS (Expo Application Services)                                    | Handles Android signing and Play Store upload  |


### Suggested repo layout (implementation)

```
src/
├── features/
│   ├── calendar/       # F2
│   ├── dashboard/      # F3 homepage
│   ├── rotations/      # F1, F4
│   ├── shifts/         # F6 shift detail
│   └── settings/       # F5 language picker
├── components/         # Shared UI
├── lib/
│   ├── shifts/         # Shift date calculator (fixed 24 h)
│   └── storage/        # AsyncStorage helpers
├── i18n/
│   ├── en.json
│   └── es.json
└── types/              # Domain models
```

---

## 10. Changelog


| Date      | Change                                                                                                                                                                                                                                        |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| July 2026 | Initial MVP PRD                                                                                                                                                                                                                               |
| July 2026 | Added F6 bilingual UI (EN/ES) as MVP requirement                                                                                                                                                                                              |
| July 2026 | UI direction: NativeWind + shared RN primitives; Expo Go–first; no `@expo/ui` / platform UI splits; do not use Material Design 3 / react-native-paper                                                                                           |
| July 2026 | Styling: NativeWind (Tailwind CSS) for layout/colors with shared RN controls on all platforms                                                                                                                                                   |
| July 2026 | Rotation patterns: A-D MVP default, every-N presets, custom interval/weekdays; optional vacation period (F1); read-only rules on rotation detail (F2)                                                                                         |
| July 2026 | F1: optional shift start time (default 07:00) and duration (default 24 h); F4 reframed as homepage; F5 scoped to single-period management for MVP; F7 shift detail for past/future shifts; cumulative stats and multi-period deferred to v1.1 |
| July 2026 | MVP scope revision: A-C/A-D only; fixed 24 h shifts; required label; removed shift rules engine; calendar day sheet + two-item legend filter; multi-period rotation list; custom every-N/weekday patterns deferred to v3.0; features renumbered F1–F6 |
| August 2026 | F5 Settings: language override (System / English / Español) persisted in AsyncStorage; device locale with Spanish fallback                                               |
| August 2026 | F1: per-rotation calendar color from curated preset swatches; shift day marks use that color on the month calendar                                                     |


