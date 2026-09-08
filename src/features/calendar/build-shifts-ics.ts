import { addDays, format } from 'date-fns';

import type { RotationPeriod } from '../rotations/types';
import { buildShift } from '../../lib/shifts/build-shift';
import { isShiftDay } from '../../lib/shifts/is-shift-day';
import { parseCalendarDate } from '../../lib/shifts/parse-calendar-date';

export type BuildShiftsIcsResult = {
  ics: string;
  /** 1 when the period has at least one shift day; otherwise 0. */
  eventCount: number;
};

/** All-day ICS date `YYYYMMDD` from `YYYY-MM-DD`. */
function formatIcsDate(isoDate: string): string {
  return isoDate.replace(/-/g, '');
}

/** UTC `YYYYMMDDTHHMMSSZ` for ICS DTSTAMP. */
function formatIcsUtcDateTime(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

/** Escape TEXT values per RFC 5545. */
function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
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
function listVacationExDates(period: RotationPeriod): string[] {
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
 * Builds an RFC 5545 calendar with one all-day recurring VEVENT for a period
 * (`FREQ=DAILY;INTERVAL=3|4`). Vacation pattern days are EXDATE exceptions.
 */
export function buildShiftsIcs(
  period: RotationPeriod,
  now: Date = new Date(),
): BuildShiftsIcsResult {
  const stamp = formatIcsUtcDateTime(now);
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mi Guardia//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  const firstShift = findFirstShiftDate(period);
  if (firstShift == null) {
    lines.push('END:VCALENDAR');
    return { ics: `${lines.join('\r\n')}\r\n`, eventCount: 0 };
  }

  const firstExclusiveEnd = format(
    addDays(parseCalendarDate(firstShift), 1),
    'yyyy-MM-dd',
  );
  const interval = period.pattern.cycleDays;
  const exDates = listVacationExDates(period);
  // People emoji marks friend/secondary series in calendar apps (no Ionicons).
  const summary =
    period.role === 'secondary' ? `👥 ${period.label}` : period.label;

  lines.push(
    'BEGIN:VEVENT',
    `UID:guardias-${period.id}@guardias.app`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${formatIcsDate(firstShift)}`,
    `DTEND;VALUE=DATE:${formatIcsDate(firstExclusiveEnd)}`,
    `RRULE:FREQ=DAILY;INTERVAL=${interval};UNTIL=${formatIcsDate(period.endDate)}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    'ORGANIZER:MAILTO:noreply@guardias.app',
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
  );

  if (exDates.length > 0) {
    lines.push(
      `EXDATE;VALUE=DATE:${exDates.map(formatIcsDate).join(',')}`,
    );
  }

  lines.push('END:VEVENT', 'END:VCALENDAR');

  return {
    ics: `${lines.join('\r\n')}\r\n`,
    eventCount: 1,
  };
}
