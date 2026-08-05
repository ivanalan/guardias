import type { MarkedDates } from 'react-native-calendars/src/types';

import { CALENDAR_MARK_COLORS } from './calendar-mark-colors';

const shiftMark = {
  customStyles: {
    container: {
      backgroundColor: CALENDAR_MARK_COLORS.shiftBackground,
      borderRadius: 16,
    },
    text: {
      color: CALENDAR_MARK_COLORS.shiftText,
      fontWeight: '600' as const,
    },
  },
};

const freeWeekendMark = {
  customStyles: {
    container: {
      backgroundColor: CALENDAR_MARK_COLORS.freeWeekendBackground,
      borderRadius: 16,
    },
    text: {
      color: CALENDAR_MARK_COLORS.freeWeekendText,
      fontWeight: '500' as const,
    },
  },
};

/**
 * Builds `react-native-calendars` markedDates. Shift marks win if a date
 * appears in both lists (should not happen for free weekends).
 */
export function buildMarkedDates(
  shiftDates: readonly string[],
  freeWeekendDates: readonly string[],
): MarkedDates {
  const marked: MarkedDates = {};

  for (const date of freeWeekendDates) {
    marked[date] = freeWeekendMark;
  }
  for (const date of shiftDates) {
    marked[date] = shiftMark;
  }

  return marked;
}
