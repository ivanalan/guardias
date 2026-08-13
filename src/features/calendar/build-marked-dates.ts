import type { MarkedDates } from 'react-native-calendars/src/types';

import { CALENDAR_MARK_COLORS } from './calendar-mark-colors';

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

const DIM_OPACITY = 0.3;

function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function shiftMark(backgroundColor: string, dimmed: boolean) {
  const bg = dimmed
    ? withAlpha(backgroundColor, DIM_OPACITY)
    : backgroundColor;
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

function vacationMark(dimmed: boolean) {
  const bg = dimmed
    ? withAlpha(CALENDAR_MARK_COLORS.vacationBackground, DIM_OPACITY)
    : CALENDAR_MARK_COLORS.vacationBackground;
  const text = dimmed
    ? withAlpha(CALENDAR_MARK_COLORS.vacationText, DIM_OPACITY)
    : CALENDAR_MARK_COLORS.vacationText;

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
 * Builds `react-native-calendars` markedDates.
 * Priority when dates overlap: shift > vacation > free weekend.
 * When `filter` is set, non-selected mark types are rendered at reduced opacity.
 */
export function buildMarkedDates(
  shiftMarks: readonly ShiftDateMark[],
  freeWeekendDates: readonly string[],
  vacationDates: readonly string[] = [],
  filter: CalendarLegendFilter = null,
): MarkedDates {
  const marked: MarkedDates = {};
  const dimFreeWeekends = filter != null && filter !== 'freeWeekends';
  const dimVacations = filter != null && filter !== 'vacation';
  const dimShifts = filter != null && filter !== 'shifts';

  for (const date of freeWeekendDates) {
    marked[date] = freeWeekendMark(dimFreeWeekends);
  }
  for (const date of vacationDates) {
    marked[date] = vacationMark(dimVacations);
  }
  for (const { date, color } of shiftMarks) {
    marked[date] = shiftMark(color, dimShifts);
  }

  return marked;
}
