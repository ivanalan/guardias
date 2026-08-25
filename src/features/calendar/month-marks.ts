import type { MarkedDates } from 'react-native-calendars/src/types';

import type { RotationPeriod } from '../rotations/types';
import { buildMarkedDates } from './build-marked-dates';
import { getMonthMarkInputs } from './month-legend-stats';

/**
 * Shift, vacation, free-weekend, and secondary marks for the month containing
 * `monthDate` (`YYYY-MM-DD`).
 */
export function buildMonthMarkedDates(
  periods: readonly RotationPeriod[],
  monthDate: string,
): MarkedDates {
  const {
    shiftMarks,
    freeWeekendDates,
    vacationDates,
    secondaryShiftMarks,
  } = getMonthMarkInputs(periods, monthDate);
  return buildMarkedDates(
    shiftMarks,
    freeWeekendDates,
    vacationDates,
    secondaryShiftMarks,
  );
}
