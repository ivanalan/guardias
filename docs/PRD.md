# Guardias — Product Requirements Document

**Version:** MVP v1.0  
**Framework:** React Native + Expo  
**Platform:** Android-first, iOS-extensible  
**Languages:** English and Spanish (MVP)  
**Last updated:** July 2026

---

## 1. Overview

Guardias is a mobile app for tracking on-call medical rotation shifts. It is designed specifically for the Mexican medical system's guardia structure, where doctors rotate through repeating patterns (most commonly **A-D**, every 4 days) with 36-hour weekday shifts and 24-hour weekend shifts.

The app replaces bloated, ad-ridden alternatives with a clean, offline-first tool that respects the user's time.

### Problem statement

Existing apps like *On Calls / Guardias Médicas* are filled with ads and paywalled features. Mexican medical residents need a simple, reliable way to track their guardia schedule, see free weekends at a glance, and plan their personal life around their rotation.

### Target users

- **Primary:** Medical residents or doctors in Mexico following guardia rotations (A-D standard, or custom patterns)
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

Guardia rotations are named by how often a doctor is on call within a repeating cycle. The letter after the hyphen indicates the cycle length:

| Pattern | Cycle length | Meaning |
|---|---|---|
| A | 1 day | On call every day |
| A-B | 2 days | On call every 2 days |
| A-C | 3 days | On call every 3 days |
| **A-D** | **4 days** | **On call every 4 days — standard in Mexican hospitals; MVP default** |
| A-E, A-F, … | N days | On call every N days (general case) |

Within a fixed-length cycle, the doctor is assigned a **starting offset** (A, B, C, D in a 4-day cycle) that determines which days in the cycle are shift days.

**A-D example (4-day cycle, MVP standard):**

| Starting offset | Shift days in cycle |
|---|---|
| A | Days 1, 5, 9, 13… |
| B | Days 2, 6, 10, 14… |
| C | Days 3, 7, 11, 15… |
| D | Days 4, 8, 12, 16… |

### Custom rotation patterns (MVP)

In addition to preset cycles (A-D and other every-N-day patterns), the user can define a **custom** pattern in either of two modes:

1. **Every N days** — same as A-N naming, but with a user-chosen N (e.g. every 5 days from the start date).
2. **Specific weekdays** — shift on selected days of the week regardless of cycle position (e.g. every Wednesday and Saturday).

Custom patterns do not use A/B/C/D offsets; shift days are computed directly from the chosen interval or weekday set.

### Shift duration rules

| Condition | Duration | Notes |
|---|---|---|
| Shift ends on a weekday (Mon–Fri) | 36 hours | Standard guardia |
| Shift ends on Saturday or Sunday | 24 hours | Weekend guardia |
| Shift ends on a public holiday | 24 hours | Planned for v1.1 |

### Rotation periods

Each rotation typically lasts **3 months (one trimester)**. After 3 months, the doctor may be assigned a new pattern or offset (e.g. from A to B within an A-D cycle). In MVP the user manages one rotation period at a time; multiple sequential periods are planned for v1.1.

---

## 3. MVP Features

### F1 — Rotation period setup

The user creates a rotation period by specifying:

- **Rotation pattern:**
  - **A-D (every 4 days)** — MVP default; user picks starting offset A, B, C, or D
  - **Other every-N presets** — A (daily), A-B (every 2 days), A-C (every 3 days), etc.
  - **Custom** — every N days from start date, or specific weekdays (e.g. Wednesday + Saturday)
- Start date (first day of rotation)
- End date (last day of rotation)
- Optional label (e.g. "Pediatrics – Jan 2025")
- **Optional vacation period** — start and end dates during which no shifts are scheduled, even if the rotation pattern would otherwise assign one (e.g. approved leave mid-trimester)
- **Optional shift start time** — time of day each shift begins (default **07:00**)
- **Optional shift duration** — how long each shift lasts in hours (default **24**)

The app automatically calculates all shift dates from the pattern and start date, excluding any vacation dates. In MVP, the user manages a single rotation period (see F5).

### F2 — Shift rules engine

When a rotation period does not use a fixed `shiftDurationHours` (see F1), rules determine shift duration per shift:

- If shift end day is Saturday or Sunday → 24 hours
- Otherwise → 36 hours

MVP stores the F1 default of **24 hours** for all shifts; the weekend/weekday rules above apply only when the user clears the fixed duration to use rule-based scheduling. Rules are stored per rotation period and **displayed on the rotation details page** (read-only in MVP). Custom or user-editable rules (e.g. holiday overrides, custom durations) are planned for v1.1.

### F3 — Calendar view

A monthly calendar shows:

- Shift days highlighted
- Free weekends visually distinguished (both Saturday and Sunday free)
- Tap a shift day to open the **Shift detail** page (see F7)
- Navigate forward/backward by month

### F4 — Homepage

The app's default landing screen. It surfaces at-a-glance statistics for the current rotation period:

- Time until the next shift starts (days and hours)
- Number of shifts remaining in the current rotation period
- If currently in a shift: time remaining in the current shift
- Quick access to edit the rotation period (F5) or open the calendar (F3)

**Planned beyond MVP (v1.1):** cumulative career stats on the homepage — total hours worked and total shifts completed across all past rotation periods.

### F5 — Rotation period management

The user creates, edits, or replaces their rotation period configuration. The add/edit form collects all F1 fields (pattern, dates, vacation, shift start time, shift duration, label).

**MVP scope:** one active rotation period at a time. If the user needs a new trimester, they edit the existing period or replace it — there is no rotation list or multi-period calendar in v1.0.

**Planned beyond MVP (v1.1):** multiple non-overlapping rotation periods stored sequentially; each visible on the same calendar, differentiated by color or label, with individual edit/delete actions.

### F6 — Bilingual UI (English & Spanish)

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

- UI strings for all MVP screens (F1–F5, F7, Settings)
- Error and validation messages
- Empty states and onboarding hints

**Out of scope for v1.0**

- Additional locales beyond English and Spanish
- Translating user-created rotation labels (stored as entered)

### F7 — Shift detail

Opened from the calendar (F3) when the user taps a past or future shift day.

**Future shifts**

- Date, start time, end time, duration, rotation label

**Past shifts**

- Date (primary emphasis)
- Hours worked (computed from scheduled start/end)
- Step count *(planned v2.0 — requires health device integration)*

---

## 4. Out of Scope for MVP

| Feature | Target version |
|---|---|
| Multiple rotation periods on one calendar | v1.1 |
| Cumulative stats (total hours worked, total shifts completed) | v1.1 |
| Google Calendar sync | v1.1 |
| iOS support | v1.1 |
| Push notifications for upcoming shifts | v1.1 |
| Editable shift rules (beyond default weekend/weekday) | v1.1 |
| Holiday rule overrides | v1.1 |
| Friend schedule comparison | v1.2 |
| Shareable schedule link | v1.2 |
| User accounts / cloud sync | v1.2 |
| Step count on past shift detail | v2.0 |
| Health device integration (steps, sleep) | v2.0 |
| Locales beyond English and Spanish | v1.1+ |

---

## 5. Data Model

All data is stored locally on-device using AsyncStorage. No backend or authentication is required for v1.0.

### RotationPeriod

| Field | Type | Description |
|---|---|---|
| id | string | UUID |
| label | string | e.g. "Pediatrics – Jan 2025" |
| pattern | RotationPattern | How shift days are determined (see below) |
| startDate | ISO date string | First day of rotation |
| endDate | ISO date string | Last day of rotation |
| vacationStartDate | ISO date string \| null | Optional vacation block start (inclusive) |
| vacationEndDate | ISO date string \| null | Optional vacation block end (inclusive) |
| shiftStartTime | string | Local time each shift starts, `HH:mm` (default `07:00`) |
| shiftDurationHours | number \| null | Fixed shift length in hours (default `24`); `null` = use F2 rules engine |
| rules | ShiftRule[] | Array of duration rules (read-only in MVP UI) |
| createdAt | ISO datetime | When the period was created |

### RotationPattern

| Field | Type | Description |
|---|---|---|
| type | `PRESET` \| `CUSTOM` | Preset every-N cycle or custom pattern |
| cycleDays | number \| null | For `PRESET`: cycle length (4 = A-D, MVP default) |
| offset | A \| B \| C \| D \| … \| null | Starting position within the cycle; letter maps to offset index (A=1, B=2, …) |
| customMode | `INTERVAL` \| `WEEKDAYS` \| null | For `CUSTOM` only |
| intervalDays | number \| null | For `CUSTOM` + `INTERVAL`: shift every N days from start date |
| weekdays | number[] \| null | For `CUSTOM` + `WEEKDAYS`: ISO weekday indices (1=Mon … 7=Sun), e.g. `[3, 6]` for Wed + Sat |

### ShiftRule

| Field | Type | Description |
|---|---|---|
| condition | WEEKEND_END \| WEEKDAY_END \| HOLIDAY_END | When this rule applies |
| durationHours | number | Shift length in hours (24 or 36) |

### Shift (computed, not stored)

| Field | Type | Description |
|---|---|---|
| startDateTime | ISO datetime | Computed from pattern + rotation start date + `shiftStartTime` |
| endDateTime | ISO datetime | Computed: startDateTime + durationHours |
| durationHours | number | 24 or 36 based on rule match |
| rotationPeriodId | string | Parent rotation period |

### AppPreferences (stored)

| Field | Type | Description |
|---|---|---|
| locale | `en` \| `es` \| null | User override; `null` = follow device locale |

---

## 6. Screen Inventory

| Screen | Key content |
|---|---|
| Homepage (F4) | Time to next shift, shifts remaining, current-shift countdown; edit rotation CTA |
| Calendar View (F3) | Monthly calendar with shift days highlighted, free weekends marked |
| Add / Edit Rotation (F5) | Form: pattern (A-D default, other presets, or custom), start/end date, optional vacation, shift start time (default 07:00), shift duration (default 24 h), label |
| Rotation Detail | Pattern summary, date range, vacation period, shift start time, duration, **read-only shift rules** (weekend 24 h / weekday 36 h when duration not fixed) |
| Shift Detail (F7) | Past shifts: date, hours worked; future shifts: start/end time, duration, label; step count *(v2.0)* |
| Settings (F6) | Language (English / Español / System default); future: notifications, theme |

---

## 7. Edge Cases & Risks

- Rotation periods that span a year boundary (Dec → Jan)
- Leap years affecting shift date calculations
- Schedules starting mid-cycle (user joins rotation on day 2 of a 4-day cycle)
- Custom weekday patterns (e.g. Wed + Sat) vs. every-N patterns producing different densities
- Vacation period overlapping scheduled shift days — those days must show as free
- Vacation period partially outside rotation bounds — validate or clamp to rotation dates
- Non-4-day preset cycles (A, A-B, A-C) with correct offset letter mapping
- Daylight saving time transitions in Mexico (April and October)
- Back-to-back rotation periods with no gap between them
- User device timezone differs from hospital timezone
- Device locale is neither `en` nor `es` — must fall back to Spanish cleanly
- User switches language mid-session — all visible screens update without restart
- Custom shift start time (e.g. 07:00) crossing midnight when combined with 24 h+ durations
- Fixed `shiftDurationHours` vs. F2 rule-based duration — ensure only one source applies per period

---

## 8. Version Roadmap

### v1.0 — MVP

Core shift tracking, homepage stats, calendar view, single rotation period (add/edit), shift detail for past and future shifts, bilingual UI (English & Spanish), bilingual Play Store listing.

### v1.1 — Quality of life

Multiple rotation periods on one calendar, cumulative homepage stats (total hours and shifts worked), Google Calendar sync, iOS support, push notifications, holiday rule overrides.

### v1.2 — Social

Friend schedule comparison, shareable schedule links, user accounts and cloud sync.

### v2.0 — Health

Health device integration (step counts, sleep tracking), step count on past shift detail, shift fatigue insights.

---

## 9. Technical Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React Native + Expo | Cross-platform, AI-friendly, no native config |
| Language | TypeScript | Catches bugs at compile time |
| Local storage | AsyncStorage | No backend needed for MVP |
| Calendar UI | react-native-calendars | Flexible marking, active community |
| UI components | react-native-paper | Material Design, native Android feel |
| Date math | date-fns | Reliable DST handling, tree-shakeable |
| Localization | expo-localization + i18next (or expo-localization + JSON catalogs) | Device locale detection, EN/ES string catalogs |
| Build & publish | EAS (Expo Application Services) | Handles Android signing and Play Store upload |

### Suggested repo layout (implementation)

```
src/
├── features/
│   ├── calendar/       # F3
│   ├── dashboard/      # F4 homepage
│   ├── rotations/      # F1, F5
│   ├── shifts/         # F7 shift detail
│   └── settings/       # F6 language picker
├── components/         # Shared UI
├── lib/
│   ├── shifts/         # F2 rules engine
│   └── storage/        # AsyncStorage helpers
├── i18n/
│   ├── en.json
│   └── es.json
└── types/              # Domain models
```

---

## 10. Changelog

| Date | Change |
|---|---|
| July 2026 | Initial MVP PRD |
| July 2026 | Added F6 bilingual UI (EN/ES) as MVP requirement |
| July 2026 | Rotation patterns: A-D MVP default, every-N presets, custom interval/weekdays; optional vacation period (F1); read-only rules on rotation detail (F2) |
| July 2026 | F1: optional shift start time (default 07:00) and duration (default 24 h); F4 reframed as homepage; F5 scoped to single-period management for MVP; F7 shift detail for past/future shifts; cumulative stats and multi-period deferred to v1.1 |
