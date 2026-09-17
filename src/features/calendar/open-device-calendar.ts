import * as Calendar from 'expo-calendar/legacy';
import { endOfDay } from 'date-fns';

import type { RotationPeriod } from '../rotations/types';
import { buildShift } from '../../lib/shifts/build-shift';
import { parseCalendarDate } from '../../lib/shifts/parse-calendar-date';

import { buildShiftExportEvent } from './build-shift-export-event';

export type OpenDeviceCalendarResult =
  | { ok: true }
  | { ok: false; reason: 'empty' | 'failed' };

export type OpenDeviceCalendarOptions = {
  /** Pre-translated vacation exception note for the event notes field. */
  notes?: string;
};

/**
 * Presents the iOS system "Add Event" UI (EventKit) prefilled with the
 * recurring shift series. The user saves into whichever calendar is selected
 * (Apple, Google, Outlook, … — whatever is configured on the device).
 */
export async function openDeviceCalendar(
  period: RotationPeriod,
  options: OpenDeviceCalendarOptions = {},
): Promise<OpenDeviceCalendarResult> {
  const event = buildShiftExportEvent(period);
  if (event == null) {
    return { ok: false, reason: 'empty' };
  }

  const firstShift = buildShift(period, event.firstShiftDate);
  if (firstShift == null) {
    return { ok: false, reason: 'empty' };
  }

  try {
    // Omit empty notes and location. expo-calendar maps a missing location to
    // "" (shows a clear X); patches/expo-calendar+*.patch sets empty → nil.
    await Calendar.createEventInCalendarAsync({
      title: event.summary,
      startDate: firstShift.startDateTime,
      endDate: firstShift.endDateTime,
      allDay: false,
      recurrenceRule: {
        frequency: Calendar.Frequency.DAILY,
        interval: event.interval,
        // Inclusive of a last-day morning start (midnight alone can drop it).
        endDate: endOfDay(parseCalendarDate(event.untilDate)),
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
