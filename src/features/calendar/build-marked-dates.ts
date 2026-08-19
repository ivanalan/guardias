import type { MarkedDates } from 'react-native-calendars/src/types';

/** Active legend filter; `null` shows all marks at full opacity. */
export type CalendarLegendFilter =
  | 'shifts'
  | 'freeWeekends'
  | 'vacation'
  | null;

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
  _filter: CalendarLegendFilter = null,
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

  return marked;
}
