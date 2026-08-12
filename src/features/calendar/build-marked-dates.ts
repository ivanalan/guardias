import type { MarkedDates } from 'react-native-calendars/src/types';

import { CALENDAR_MARK_COLORS } from './calendar-mark-colors';

/** Active legend filter; `null` shows all marks at full opacity. */
export type CalendarLegendFilter = 'shifts' | 'freeWeekends' | null;

const DIM_OPACITY = 0.3;

function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function shiftMark(dimmed: boolean) {
  const bg = dimmed
    ? withAlpha(CALENDAR_MARK_COLORS.shiftBackground, DIM_OPACITY)
    : CALENDAR_MARK_COLORS.shiftBackground;
  const text = dimmed
    ? withAlpha(CALENDAR_MARK_COLORS.shiftText, DIM_OPACITY)
    : CALENDAR_MARK_COLORS.shiftText;

  return {
    customStyles: {
      container: {
        backgroundColor: bg,
        borderRadius: 16,
      },
      text: {
        color: text,
        fontWeight: '600' as const,
      },
    },
  };
}

function freeWeekendMark(dimmed: boolean) {
  const bg = dimmed
    ? withAlpha(CALENDAR_MARK_COLORS.freeWeekendBackground, DIM_OPACITY)
    : CALENDAR_MARK_COLORS.freeWeekendBackground;
  const text = dimmed
    ? withAlpha(CALENDAR_MARK_COLORS.freeWeekendText, DIM_OPACITY)
    : CALENDAR_MARK_COLORS.freeWeekendText;

  return {
    customStyles: {
      container: {
        backgroundColor: bg,
        borderRadius: 16,
      },
      text: {
        color: text,
        fontWeight: '500' as const,
      },
    },
  };
}

/**
 * Builds `react-native-calendars` markedDates. Shift marks win if a date
 * appears in both lists (should not happen for free weekends).
 * When `filter` is set, the other mark type is rendered at reduced opacity.
 */
export function buildMarkedDates(
  shiftDates: readonly string[],
  freeWeekendDates: readonly string[],
  filter: CalendarLegendFilter = null,
): MarkedDates {
  const marked: MarkedDates = {};
  const dimFreeWeekends = filter === 'shifts';
  const dimShifts = filter === 'freeWeekends';

  for (const date of freeWeekendDates) {
    marked[date] = freeWeekendMark(dimFreeWeekends);
  }
  for (const date of shiftDates) {
    marked[date] = shiftMark(dimShifts);
  }

  return marked;
}
