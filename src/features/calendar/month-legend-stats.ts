import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  startOfMonth,
} from 'date-fns';

import { isShiftDay, listShiftDatesInRange, parseCalendarDate } from '../../lib/shifts';
import type { RotationPeriod } from '../rotations/types';
import type { ShiftDateMark } from './build-marked-dates';
import { countFreeWeekends, listFreeWeekendDates } from './free-weekends';
import { listVacationDatesInRange } from './vacation-dates';

/** Shared shift / free-weekend / vacation inputs for the visible calendar month. */
export type MonthMarkInputs = {
  shiftMarks: ShiftDateMark[];
  freeWeekendDates: string[];
  vacationDates: string[];
  shiftDayCount: number;
  freeWeekendCount: number;
  vacationDayCount: number;
};

/**
 * Shift dates, free weekends, and vacation days for the month containing
 * `monthDate` (`YYYY-MM-DD`). Pads ±6 days so weekends on the month edge
 * are correct.
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
  const vacationDates = listVacationDatesInRange(periods, from, to);

  const shiftMarks: ShiftDateMark[] = [];
  for (const date of shiftDates) {
    if (date < from || date > to) {
      continue;
    }
    const period = periods.find((item) => isShiftDay(item, date));
    if (period != null) {
      shiftMarks.push({ date, color: period.color });
    }
  }

  return {
    shiftMarks,
    freeWeekendDates,
    vacationDates,
    shiftDayCount: shiftMarks.length,
    freeWeekendCount: countFreeWeekends(shiftSet, from, to),
    vacationDayCount: vacationDates.length,
  };
}

/**
 * Mark inputs for months around `centerMonthDate`, with legend counts from the
 * center month only. Prefetches adjacent months so Calendar next/prev paints
 * with marks before `onMonthChange` updates parent state.
 */
export function getMarkInputsForMonthWindow(
  periods: readonly RotationPeriod[],
  centerMonthDate: string,
  radiusMonths = 1,
): MonthMarkInputs {
  const center = getMonthMarkInputs(periods, centerMonthDate);
  if (radiusMonths <= 0) {
    return center;
  }

  const centerStart = startOfMonth(parseCalendarDate(centerMonthDate));
  const shiftByDate = new Map<string, ShiftDateMark>();
  const freeWeekendSet = new Set<string>();
  const vacationSet = new Set<string>();

  for (let offset = -radiusMonths; offset <= radiusMonths; offset += 1) {
    const monthDate = format(addMonths(centerStart, offset), 'yyyy-MM-dd');
    const inputs = getMonthMarkInputs(periods, monthDate);
    for (const mark of inputs.shiftMarks) {
      shiftByDate.set(mark.date, mark);
    }
    for (const date of inputs.freeWeekendDates) {
      freeWeekendSet.add(date);
    }
    for (const date of inputs.vacationDates) {
      vacationSet.add(date);
    }
  }

  return {
    shiftMarks: [...shiftByDate.values()],
    freeWeekendDates: [...freeWeekendSet],
    vacationDates: [...vacationSet],
    shiftDayCount: center.shiftDayCount,
    freeWeekendCount: center.freeWeekendCount,
    vacationDayCount: center.vacationDayCount,
  };
}

export type MonthLegendStats = {
  shiftDayCount: number;
  freeWeekendCount: number;
  vacationDayCount: number;
};

/** Per-month counts for the calendar legend. */
export function getMonthLegendStats(
  periods: readonly RotationPeriod[],
  monthDate: string,
): MonthLegendStats {
  const { shiftDayCount, freeWeekendCount, vacationDayCount } =
    getMonthMarkInputs(periods, monthDate);
  return { shiftDayCount, freeWeekendCount, vacationDayCount };
}
