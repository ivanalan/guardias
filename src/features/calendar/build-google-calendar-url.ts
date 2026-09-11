import type { RotationPeriod } from '../rotations/types';

import {
  buildShiftExportEvent,
  formatCompactDate,
} from './build-shift-export-event';

export type BuildGoogleCalendarUrlOptions = {
  /**
   * Pre-translated event description (e.g. vacation exception note).
   * Google template URLs do not support EXDATE.
   */
  details?: string;
};

/**
 * Builds a Google Calendar "create event" TEMPLATE URL for one period, or
 * `null` when there are no shift days.
 */
export function buildGoogleCalendarUrl(
  period: RotationPeriod,
  options: BuildGoogleCalendarUrlOptions = {},
): string | null {
  const event = buildShiftExportEvent(period);
  if (event == null) {
    return null;
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.summary,
    dates: `${formatCompactDate(event.firstShiftDate)}/${formatCompactDate(event.firstExclusiveEnd)}`,
    recur: `RRULE:${event.rrule}`,
  });

  const details = options.details?.trim();
  if (details != null && details.length > 0) {
    params.set('details', details);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
