import { NativeModules, Platform } from 'react-native';
import { requestWidgetUpdate } from 'react-native-android-widget';

import type { RotationPeriod } from '../rotations/types';

import { loadTwoWeekWidgetThemeBundle } from './build-widget-props';
import { TwoWeekCalendarWidget } from './two-week-calendar-widget';
import { TWO_WEEK_WIDGET_NAME } from './types';

function isAndroidWidgetLinked(): boolean {
  return Platform.OS === 'android' && NativeModules.AndroidWidget != null;
}

/**
 * Redraw all TwoWeekCalendar home-screen widgets.
 * No-op on iOS, Expo Go, or when no widget is pinned.
 */
export async function refreshTwoWeekWidget(
  periodsOverride?: readonly RotationPeriod[],
): Promise<void> {
  if (!isAndroidWidgetLinked()) {
    return;
  }

  try {
    const bundle = await loadTwoWeekWidgetThemeBundle(periodsOverride);
    await requestWidgetUpdate({
      widgetName: TWO_WEEK_WIDGET_NAME,
      renderWidget: () => ({
        light: <TwoWeekCalendarWidget {...bundle.light} />,
        dark: <TwoWeekCalendarWidget {...bundle.dark} />,
      }),
    });
  } catch (error) {
    if (__DEV__) {
      console.warn('[TwoWeekWidget] refresh failed', error);
    }
  }
}
