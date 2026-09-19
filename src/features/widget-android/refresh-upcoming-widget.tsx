import { NativeModules, Platform } from 'react-native';
import { requestWidgetUpdate } from 'react-native-android-widget';

import type { RotationPeriod } from '../rotations/types';

import { loadUpcomingShiftsWidgetThemeBundle } from './build-widget-props';
import { UpcomingShiftsWidget } from './upcoming-shifts-widget';
import { UPCOMING_SHIFTS_WIDGET_NAME } from './types';

function isAndroidWidgetLinked(): boolean {
  return Platform.OS === 'android' && NativeModules.AndroidWidget != null;
}

/**
 * Redraw all UpcomingShifts home-screen widgets.
 * No-op on iOS, Expo Go, or when no widget is pinned.
 */
export async function refreshUpcomingShiftsWidget(
  periodsOverride?: readonly RotationPeriod[],
): Promise<void> {
  if (!isAndroidWidgetLinked()) {
    return;
  }

  try {
    const bundle = await loadUpcomingShiftsWidgetThemeBundle(periodsOverride);
    await requestWidgetUpdate({
      widgetName: UPCOMING_SHIFTS_WIDGET_NAME,
      renderWidget: () => ({
        light: <UpcomingShiftsWidget {...bundle.light} />,
        dark: <UpcomingShiftsWidget {...bundle.dark} />,
      }),
    });
  } catch (error) {
    if (__DEV__) {
      console.warn('[UpcomingShiftsWidget] refresh failed', error);
    }
  }
}
