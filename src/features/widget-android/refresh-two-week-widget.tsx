import { NativeModules, Platform } from 'react-native';
import { requestWidgetUpdate } from 'react-native-android-widget';

import type { RotationPeriod } from '../rotations/types';

import { loadTwoWeekWidgetThemeBundle } from '../widgets/build-widget-props';
import { resolveTwoWeekLayout } from '../widgets/two-week-layout';
import { TWO_WEEK_WIDGET_NAME } from '../widgets/types';
import { TwoWeekCalendarWidget } from './two-week-calendar-widget';

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
    await requestWidgetUpdate({
      widgetName: TWO_WEEK_WIDGET_NAME,
      renderWidget: async (widgetInfo) => {
        const layout = resolveTwoWeekLayout(
          widgetInfo.height,
          widgetInfo.width,
        );
        const bundle = await loadTwoWeekWidgetThemeBundle(
          periodsOverride,
          new Date(),
          layout,
        );
        return {
          light: <TwoWeekCalendarWidget {...bundle.light} />,
          dark: <TwoWeekCalendarWidget {...bundle.dark} />,
        };
      },
    });
  } catch (error) {
    if (__DEV__) {
      console.warn('[TwoWeekWidget] refresh failed', error);
    }
  }
}
