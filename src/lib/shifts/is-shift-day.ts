import { differenceInCalendarDays } from 'date-fns';

import type { OffsetLetter, RotationPeriod } from '@/features/rotations/types';

import { parseCalendarDate } from './parse-calendar-date';

/** Cycle position for each letter: A = day 0 of the cycle, B = 1, … */
const OFFSET_INDEX: Record<OffsetLetter, number> = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
};

function isOnVacation(period: RotationPeriod, isoDate: string): boolean {
  const { vacationStartDate, vacationEndDate } = period;
  if (vacationStartDate == null || vacationEndDate == null) {
    return false;
  }
  return isoDate >= vacationStartDate && isoDate <= vacationEndDate;
}

/**
 * Whether `isoDate` (`YYYY-MM-DD`) is a scheduled shift day for this period.
 * Uses cycle math from `startDate` + pattern offset; vacation days are never shifts.
 */
export function isShiftDay(period: RotationPeriod, isoDate: string): boolean {
  if (isoDate < period.startDate || isoDate > period.endDate) {
    return false;
  }
  if (isOnVacation(period, isoDate)) {
    return false;
  }

  const daysFromStart = differenceInCalendarDays(
    parseCalendarDate(isoDate),
    parseCalendarDate(period.startDate),
  );

  return (
    daysFromStart % period.pattern.cycleDays ===
    OFFSET_INDEX[period.pattern.offset]
  );
}
