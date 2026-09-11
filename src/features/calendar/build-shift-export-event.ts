import { addDays, format } from 'date-fns';

import type { RotationPeriod } from '../rotations/types';
import { buildShift } from '../../lib/shifts/build-shift';
import { isShiftDay } from '../../lib/shifts/is-shift-day';
import { parseCalendarDate } from '../../lib/shifts/parse-calendar-date';

/** Shared fields for ICS and Google Calendar export of one period. */
export type ShiftExportEvent = {
  /** First shift day `YYYY-MM-DD`. */
  firstShiftDate: string;
  /** Exclusive all-day end of the first instance `YYYY-MM-DD`. */
  firstExclusiveEnd: string;
  /** Period end date used as RRULE UNTIL (`YYYY-MM-DD`). */
  untilDate: string;
  interval: number;
  summary: string;
  /** Vacation pattern days that should be EXDATEs (`YYYY-MM-DD`). */
  vacationExDates: string[];
  /** RRULE body without the `RRULE:` prefix. */
  rrule: string;
};

/** Compact all-day calendar date `YYYYMMDD` from `YYYY-MM-DD`. */
export function formatCompactDate(isoDate: string): string {
  return isoDate.replace(/-/g, '');
}

function findFirstShiftDate(period: RotationPeriod): string | null {
  let cursor = parseCalendarDate(period.startDate);
  const end = parseCalendarDate(period.endDate);
  while (cursor <= end) {
    const iso = format(cursor, 'yyyy-MM-dd');
    if (buildShift(period, iso) != null) {
      return iso;
    }
    cursor = addDays(cursor, 1);
  }
  return null;
}

/**
 * Pattern days that fall inside the vacation block (would be shifts without leave).
 * These become EXDATE exceptions on the recurring series.
 */
export function listVacationExDates(period: RotationPeriod): string[] {
  const { vacationStartDate, vacationEndDate } = period;
  if (vacationStartDate == null || vacationEndDate == null) {
    return [];
  }

  const withoutVacation: RotationPeriod = {
    ...period,
    vacationStartDate: null,
    vacationEndDate: null,
  };

  const dates: string[] = [];
  let cursor = parseCalendarDate(vacationStartDate);
  const end = parseCalendarDate(vacationEndDate);
  while (cursor <= end) {
    const iso = format(cursor, 'yyyy-MM-dd');
    if (isShiftDay(withoutVacation, iso)) {
      dates.push(iso);
    }
    cursor = addDays(cursor, 1);
  }
  return dates;
}

/**
 * Builds the recurring all-day shift series for a period, or `null` when empty.
 */
export function buildShiftExportEvent(
  period: RotationPeriod,
): ShiftExportEvent | null {
  const firstShiftDate = findFirstShiftDate(period);
  if (firstShiftDate == null) {
    return null;
  }

  const firstExclusiveEnd = format(
    addDays(parseCalendarDate(firstShiftDate), 1),
    'yyyy-MM-dd',
  );
  const interval = period.pattern.cycleDays;
  const untilDate = period.endDate;
  // People emoji marks friend/secondary series in calendar apps (no Ionicons).
  const summary =
    period.role === 'secondary' ? `👥 ${period.label}` : period.label;

  return {
    firstShiftDate,
    firstExclusiveEnd,
    untilDate,
    interval,
    summary,
    vacationExDates: listVacationExDates(period),
    rrule: `FREQ=DAILY;INTERVAL=${interval};UNTIL=${formatCompactDate(untilDate)}`,
  };
}
