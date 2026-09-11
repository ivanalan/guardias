import { Linking } from 'react-native';

import type { RotationPeriod } from '../rotations/types';

import { buildGoogleCalendarUrl } from './build-google-calendar-url';

export type OpenGoogleCalendarResult =
  | { ok: true }
  | { ok: false; reason: 'empty' | 'failed' };

export type OpenGoogleCalendarOptions = {
  /** Pre-translated vacation exception note for the event details field. */
  details?: string;
};

/**
 * Opens Google Calendar with a prefilled recurring all-day shift series.
 */
export async function openGoogleCalendar(
  period: RotationPeriod,
  options: OpenGoogleCalendarOptions = {},
): Promise<OpenGoogleCalendarResult> {
  const url = buildGoogleCalendarUrl(period, { details: options.details });
  if (url == null) {
    return { ok: false, reason: 'empty' };
  }

  try {
    await Linking.openURL(url);
    return { ok: true };
  } catch {
    return { ok: false, reason: 'failed' };
  }
}
