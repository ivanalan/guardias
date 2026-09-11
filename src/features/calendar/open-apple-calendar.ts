import * as Calendar from 'expo-calendar/legacy';

import type { RotationPeriod } from '../rotations/types';
import { parseCalendarDate } from '../../lib/shifts/parse-calendar-date';

import { buildShiftExportEvent } from './build-shift-export-event';

export type OpenAppleCalendarResult =
  | { ok: true }
  | { ok: false; reason: 'empty' | 'failed' };

export type OpenAppleCalendarOptions = {
  /** Pre-translated vacation exception note for the event notes field. */
  notes?: string;
};

/**
 * Presents the iOS system "Add Event" UI (EventKit) prefilled with the
 * recurring all-day shift series. No share sheet — user saves into Calendar.
 */
export async function openAppleCalendar(
  period: RotationPeriod,
  options: OpenAppleCalendarOptions = {},
): Promise<OpenAppleCalendarResult> {
  const event = buildShiftExportEvent(period);
  if (event == null) {
    return { ok: false, reason: 'empty' };
  }

  try {
    // Omit empty notes. Do not set location — expo-calendar still defaults it to
    // "" natively (shows a clear X in iOS Calendar); that is an Expo quirk, not us.
    await Calendar.createEventInCalendarAsync({
      title: event.summary,
      startDate: parseCalendarDate(event.firstShiftDate),
      endDate: parseCalendarDate(event.firstExclusiveEnd),
      allDay: true,
      recurrenceRule: {
        frequency: Calendar.Frequency.DAILY,
        interval: event.interval,
        endDate: parseCalendarDate(event.untilDate),
      },
      ...(options.notes != null && options.notes.length > 0
        ? { notes: options.notes }
        : {}),
    });

    return { ok: true };
  } catch {
    return { ok: false, reason: 'failed' };
  }
}
