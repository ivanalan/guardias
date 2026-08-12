import { addDays, endOfMonth, format, startOfMonth } from 'date-fns';

import type { RotationPeriod } from '../rotations/types';
import { listShiftDatesInRange, parseCalendarDate } from '../../lib/shifts';
import { countFreeWeekends, listFreeWeekendDates } from './free-weekends';

/** Shared shift + free-weekend inputs for the visible calendar month. */
export type MonthMarkInputs = {
  shiftsInMonth: string[];
  freeWeekendDates: string[];
  shiftDayCount: number;
  freeWeekendCount: number;
};

/**
 * Shift dates and free weekends for the month containing `monthDate`
 * (`YYYY-MM-DD`). Pads ±6 days so weekends on the month edge are correct.
 */
export function getMonthMarkInputs(
  periods: readonly RotationPeriod[],
  monthDate: string,
): MonthMarkInputs {
  const monthStart = startOfMonth(parseCalendarDate(monthDate));
  const monthEnd = endOfMonth(monthStart);
  const from = format(monthStart, 'yyyy-MM-dd');
  const to = format(monthEnd, 'yyyy-MM-dd');

  const paddedFrom = format(addDays(monthStart, -6), 'yyyy-MM-dd');
  const paddedTo = format(addDays(monthEnd, 6), 'yyyy-MM-dd');

  const shiftDates = listShiftDatesInRange(periods, paddedFrom, paddedTo);
  const shiftSet = new Set(shiftDates);
  const freeWeekendDates = listFreeWeekendDates(shiftSet, from, to);

  const shiftsInMonth = shiftDates.filter(
    (date) => date >= from && date <= to,
  );

  return {
    shiftsInMonth,
    freeWeekendDates,
    shiftDayCount: shiftsInMonth.length,
    freeWeekendCount: countFreeWeekends(shiftSet, from, to),
  };
}

export type MonthLegendStats = {
  shiftDayCount: number;
  freeWeekendCount: number;
};

/** Per-month counts for the calendar legend. */
export function getMonthLegendStats(
  periods: readonly RotationPeriod[],
  monthDate: string,
): MonthLegendStats {
  const { shiftDayCount, freeWeekendCount } = getMonthMarkInputs(
    periods,
    monthDate,
  );
  return { shiftDayCount, freeWeekendCount };
}
