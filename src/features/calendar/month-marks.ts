import { addDays, endOfMonth, format, startOfMonth } from 'date-fns';
import type { MarkedDates } from 'react-native-calendars/src/types';

import type { RotationPeriod } from '../rotations/types';
import { listShiftDatesInRange, parseCalendarDate } from '../../lib/shifts';
import { buildMarkedDates } from './build-marked-dates';
import { listFreeWeekendDates } from './free-weekends';

/**
 * Shift + free-weekend marks for the month containing `monthDate`
 * (`YYYY-MM-DD`). Pads ±6 days so weekends on the month edge are correct.
 */
export function buildMonthMarkedDates(
  periods: readonly RotationPeriod[],
  monthDate: string,
): MarkedDates {
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

  return buildMarkedDates(shiftsInMonth, freeWeekendDates);
}
