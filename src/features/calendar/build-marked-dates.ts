import type { MarkedDates } from 'react-native-calendars/src/types';

export const SECONDARY_FILTER_PREFIX = 'secondary:' as const;

export type CalendarLegendFilterKey =
  | 'shifts'
  | 'freeWeekends'
  | 'vacation'
  | `${typeof SECONDARY_FILTER_PREFIX}${string}`;

/** Empty set = show all marks at full opacity. */
export type CalendarLegendFilterState = ReadonlySet<CalendarLegendFilterKey>;

export const EMPTY_CALENDAR_FILTER: CalendarLegendFilterState = new Set();

/** Legend filter key for one friend (secondary) period. */
export function secondaryFilterKey(periodId: string): CalendarLegendFilterKey {
  return `${SECONDARY_FILTER_PREFIX}${periodId}`;
}

export function isSecondaryFilterKey(
  key: string,
): key is `${typeof SECONDARY_FILTER_PREFIX}${string}` {
  return key.startsWith(SECONDARY_FILTER_PREFIX);
}

export function secondaryPeriodIdFromFilterKey(key: string): string | null {
  if (!isSecondaryFilterKey(key)) {
    return null;
  }
  return key.slice(SECONDARY_FILTER_PREFIX.length);
}

/** Friend period ids currently selected in the legend filter. */
export function selectedSecondaryPeriodIds(
  filter: CalendarLegendFilterState,
): string[] {
  const ids: string[] = [];
  for (const key of filter) {
    const id = secondaryPeriodIdFromFilterKey(key);
    if (id != null) {
      ids.push(id);
    }
  }
  return ids;
}

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
  freeWeekendCount: number;
  vacationDayCount: number;
  /** Friend period ids with ≥1 shift day in the visible month. */
  secondaryPeriodIds: readonly string[];
};

/** Drop selected categories whose visible-month count is 0. */
export function pruneLegendFilterForMonthCounts(
  current: CalendarLegendFilterState,
  counts: LegendFilterMonthCounts,
): CalendarLegendFilterState {
  let next = current;
  if (counts.shiftDayCount === 0) {
    next = removeLegendFilter(next, 'shifts');
  }
  if (counts.freeWeekendCount === 0) {
    next = removeLegendFilter(next, 'freeWeekends');
  }
  if (counts.vacationDayCount === 0) {
    next = removeLegendFilter(next, 'vacation');
  }
  const validSecondary = new Set(counts.secondaryPeriodIds);
  for (const key of next) {
    const id = secondaryPeriodIdFromFilterKey(key);
    if (id != null && !validSecondary.has(id)) {
      next = removeLegendFilter(next, key);
    }
  }
  return next;
}

/** Shift day mark with the rotation’s calendar color. */
export type ShiftDateMark = {
  date: string;
  color: string;
  periodId: string;
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
