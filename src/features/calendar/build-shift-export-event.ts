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
  /**
   * RRULE occurrences that are not actual shifts (vacation + skips).
   * ICS EXDATE; Google template note workaround.
   */
  exDates: string[];
  /** Actual shifts that are not on the RRULE grid (covers). ICS RDATE. */
  rDates: string[];
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

/** RRULE occurrence dates from `firstShiftDate` by `interval` through `untilDate`. */
export function listRruleDates(
  firstShiftDate: string,
  untilDate: string,
  interval: number,
): string[] {
  const dates: string[] = [];
  let cursor = parseCalendarDate(firstShiftDate);
  const end = parseCalendarDate(untilDate);
  while (cursor <= end) {
    dates.push(format(cursor, 'yyyy-MM-dd'));
    cursor = addDays(cursor, interval);
  }
  return dates;
}

/** RRULE days that are not actual shifts (vacation blocks + skippedDates). */
export function listExportExDates(
  period: RotationPeriod,
  firstShiftDate: string,
): string[] {
  const interval = period.pattern.cycleDays;
  return listRruleDates(firstShiftDate, period.endDate, interval).filter(
    (iso) => !isShiftDay(period, iso),
  );
}

/** Actual shifts not on the RRULE grid from `firstShiftDate` (covers). */
export function listExportRDates(
  period: RotationPeriod,
  firstShiftDate: string,
): string[] {
  const interval = period.pattern.cycleDays;
  const onRrule = new Set(
    listRruleDates(firstShiftDate, period.endDate, interval),
  );
  const dates: string[] = [];
  let cursor = parseCalendarDate(period.startDate);
  const end = parseCalendarDate(period.endDate);
  while (cursor <= end) {
    const iso = format(cursor, 'yyyy-MM-dd');
    if (isShiftDay(period, iso) && !onRrule.has(iso)) {
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
    exDates: listExportExDates(period, firstShiftDate),
    rDates: listExportRDates(period, firstShiftDate),
    rrule: `FREQ=DAILY;INTERVAL=${interval};UNTIL=${formatCompactDate(untilDate)}`,
  };
}
