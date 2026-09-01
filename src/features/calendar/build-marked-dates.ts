import type { MarkedDates } from 'react-native-calendars/src/types';

export type CalendarLegendFilterKey =
  | 'shifts'
  | 'secondaryShifts'
  | 'freeWeekends'
  | 'vacation';

/** Empty set = show all marks at full opacity. */
export type CalendarLegendFilterState = ReadonlySet<CalendarLegendFilterKey>;

export const EMPTY_CALENDAR_FILTER: CalendarLegendFilterState = new Set();

export function toggleLegendFilter(
  current: CalendarLegendFilterState,
  key: CalendarLegendFilterKey,
): CalendarLegendFilterState {
  const next = new Set(current);
  if (next.has(key)) {
    next.delete(key);
  } else {
    next.add(key);
  }
  return next;
}

export function removeLegendFilter(
  current: CalendarLegendFilterState,
  key: CalendarLegendFilterKey,
): CalendarLegendFilterState {
  if (!current.has(key)) {
    return current;
  }
  const next = new Set(current);
  next.delete(key);
  return next;
}

/** Center-month legend counts used to drop filters that no longer apply. */
export type LegendFilterMonthCounts = {
  shiftDayCount: number;
  secondaryShiftDayCount: number;
  freeWeekendCount: number;
  vacationDayCount: number;
};

const FILTER_COUNT_KEYS: readonly [
  CalendarLegendFilterKey,
  keyof LegendFilterMonthCounts,
][] = [
  ['shifts', 'shiftDayCount'],
  ['secondaryShifts', 'secondaryShiftDayCount'],
  ['freeWeekends', 'freeWeekendCount'],
  ['vacation', 'vacationDayCount'],
];

/** Drop selected categories whose visible-month count is 0. */
export function pruneLegendFilterForMonthCounts(
  current: CalendarLegendFilterState,
  counts: LegendFilterMonthCounts,
): CalendarLegendFilterState {
  let next = current;
  for (const [key, countKey] of FILTER_COUNT_KEYS) {
    if (counts[countKey] === 0) {
      next = removeLegendFilter(next, key);
    }
  }
  return next;
}

/** Shift day mark with the rotation’s calendar color. */
export type ShiftDateMark = {
  date: string;
  color: string;
};

/**
 * Builds minimal `react-native-calendars` markedDates entries.
 * Visual marks are rendered by the custom day component; entries here
 * keep marked-day metadata for the library only.
 */
export function buildMarkedDates(
  shiftMarks: readonly ShiftDateMark[],
  freeWeekendDates: readonly string[],
  vacationDates: readonly string[] = [],
  secondaryShiftMarks: readonly ShiftDateMark[] = [],
): MarkedDates {
  const marked: MarkedDates = {};

  for (const date of freeWeekendDates) {
    marked[date] = { marked: true };
  }
  for (const date of vacationDates) {
    marked[date] = { marked: true };
  }
  for (const { date } of shiftMarks) {
    marked[date] = { marked: true };
  }
  for (const { date } of secondaryShiftMarks) {
    marked[date] = { marked: true };
  }

  return marked;
}
