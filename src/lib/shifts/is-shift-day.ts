import { addDays, differenceInCalendarDays, format } from 'date-fns';

import type {
  OffsetLetter,
  RotationPattern,
  RotationPeriod,
} from '@/features/rotations/types';

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

function matchesYearCalendarLetter(
  isoDate: string,
  cycleDays: number,
  offset: OffsetLetter,
): boolean {
  return calendarLetterIndex(isoDate, cycleDays) === OFFSET_INDEX[offset];
}

function matchesFirstShiftCycle(
  isoDate: string,
  firstShiftDate: string,
  cycleDays: number,
): boolean {
  const days = differenceInCalendarDays(
    parseCalendarDate(isoDate),
    parseCalendarDate(firstShiftDate),
  );
  return ((days % cycleDays) + cycleDays) % cycleDays === 0;
}

/** Whether `isoDate` falls on the period's cycle (ignores vacation / exceptions). */
export function matchesShiftPattern(
  period: RotationPeriod,
  isoDate: string,
): boolean {
  if (isoDate < period.startDate || isoDate > period.endDate) {
    return false;
  }

  if (period.firstShiftDate != null) {
    return matchesFirstShiftCycle(
      isoDate,
      period.firstShiftDate,
      period.pattern.cycleDays,
    );
  }

  return matchesYearCalendarLetter(
    isoDate,
    period.pattern.cycleDays,
    period.pattern.offset,
  );
}

/**
 * First shift day on/after `startDate` within `[startDate, endDate]` under the
 * Jan 1 = A letter calendar (ignores any first-shift override).
 */
export function getDefaultFirstShiftDate(
  startDate: string,
  endDate: string,
  pattern: Pick<RotationPattern, 'cycleDays' | 'offset'>,
): string | null {
  if (endDate < startDate) {
    return null;
  }

  let cursor = startDate;
  while (cursor <= endDate) {
    if (
      matchesYearCalendarLetter(cursor, pattern.cycleDays, pattern.offset)
    ) {
      return cursor;
    }
    cursor = format(addDays(parseCalendarDate(cursor), 1), 'yyyy-MM-dd');
  }

  return null;
}

/**
 * Whether `isoDate` (`YYYY-MM-DD`) is a scheduled shift day for this period.
 * Order: bounds → skip → cover (wins over vacation) → vacation → pattern.
 */
export function isShiftDay(period: RotationPeriod, isoDate: string): boolean {
  if (isoDate < period.startDate || isoDate > period.endDate) {
    return false;
  }
  if (period.skippedDates.includes(isoDate)) {
    return false;
  }
  if (period.coveredDates.includes(isoDate)) {
    return true;
  }
  if (isOnVacation(period, isoDate)) {
    return false;
  }

  return matchesShiftPattern(period, isoDate);
}

/**
 * Skipped pattern day (strikethrough on calendar): in `skippedDates` and still
 * on the underlying cycle.
 */
export function isSkippedPatternDay(
  period: RotationPeriod,
  isoDate: string,
): boolean {
  return (
    period.skippedDates.includes(isoDate) &&
    matchesShiftPattern(period, isoDate)
  );
}
