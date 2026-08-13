import type { MarkedDates } from 'react-native-calendars/src/types';

import type { RotationPeriod } from '../rotations/types';
import {
  buildMarkedDates,
  type CalendarLegendFilter,
} from './build-marked-dates';
import { getMonthMarkInputs } from './month-legend-stats';

/**
 * Shift, vacation, and free-weekend marks for the month containing
 * `monthDate` (`YYYY-MM-DD`). Optional `filter` dims non-selected mark types.
 */
export function buildMonthMarkedDates(
  periods: readonly RotationPeriod[],
  monthDate: string,
  filter: CalendarLegendFilter = null,
): MarkedDates {
  const { shiftMarks, freeWeekendDates, vacationDates } = getMonthMarkInputs(
    periods,
    monthDate,
  );
  return buildMarkedDates(
    shiftMarks,
    freeWeekendDates,
    vacationDates,
    filter,
  );
}
