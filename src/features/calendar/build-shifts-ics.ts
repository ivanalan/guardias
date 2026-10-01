import type { RotationPeriod } from '../rotations/types';

import {
  buildShiftExportEvent,
  formatCompactDate,
} from './build-shift-export-event';

export type BuildShiftsIcsResult = {
  ics: string;
  /** 1 when the period has at least one shift day; otherwise 0. */
  eventCount: number;
};

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
    'PRODID:-//Interdía//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  const event = buildShiftExportEvent(period);
  if (event == null) {
    lines.push('END:VCALENDAR');
    return { ics: `${lines.join('\r\n')}\r\n`, eventCount: 0 };
  }

  lines.push(
    'BEGIN:VEVENT',
    `UID:guardias-${period.id}@guardias.app`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${formatCompactDate(event.firstShiftDate)}`,
    `DTEND;VALUE=DATE:${formatCompactDate(event.firstExclusiveEnd)}`,
    `RRULE:${event.rrule}`,
    `SUMMARY:${escapeIcsText(event.summary)}`,
    'ORGANIZER:MAILTO:noreply@guardias.app',
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
  );

  if (event.vacationExDates.length > 0) {
    lines.push(
      `EXDATE;VALUE=DATE:${event.vacationExDates.map(formatCompactDate).join(',')}`,
    );
  }

  lines.push('END:VEVENT', 'END:VCALENDAR');

  return {
    ics: `${lines.join('\r\n')}\r\n`,
    eventCount: 1,
  };
}
