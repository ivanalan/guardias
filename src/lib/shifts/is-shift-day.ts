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
 * Calendar letter for `isoDate`, anchored to January 1 of that date's year (A).
 * Rotation `startDate` does not move the cycle — only bounds and vacation do.
 */
function calendarLetterIndex(isoDate: string, cycleDays: number): number {
  const date = parseCalendarDate(isoDate);
  const jan1 = new Date(date.getFullYear(), 0, 1);
  const daysFromJan1 = differenceInCalendarDays(date, jan1);
  return ((daysFromJan1 % cycleDays) + cycleDays) % cycleDays;
}

/**
 * Whether `isoDate` (`YYYY-MM-DD`) is a scheduled shift day for this period.
 * Uses the year-anchored A/B/C/D calendar + pattern offset; vacation days are never shifts.
 */
export function isShiftDay(period: RotationPeriod, isoDate: string): boolean {
  if (isoDate < period.startDate || isoDate > period.endDate) {
    return false;
  }
  if (isOnVacation(period, isoDate)) {
    return false;
  }

  return (
    calendarLetterIndex(isoDate, period.pattern.cycleDays) ===
    OFFSET_INDEX[period.pattern.offset]
  );
}
