import { Linking, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

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
 *
 * On iOS the Google Calendar app intercepts TEMPLATE Universal Links and drops
 * the `recur` RRULE (single event only). Opening the web create form in
 * SFSafariViewController / Chrome Custom Tabs keeps recurrence.
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
    if (Platform.OS === 'web') {
      await Linking.openURL(url);
      return { ok: true };
    }

    // In-app browser loads the web TEMPLATE editor (supports `recur`).
    // Linking.openURL often hands off to the Calendar app, which drops it.
    await WebBrowser.openBrowserAsync(url);
    return { ok: true };
  } catch {
    try {
      await Linking.openURL(url);
      return { ok: true };
    } catch {
      return { ok: false, reason: 'failed' };
    }
  }
}
