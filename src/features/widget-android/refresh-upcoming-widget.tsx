import { NativeModules, Platform } from 'react-native';
import { requestWidgetUpdate } from 'react-native-android-widget';

import type { RotationPeriod } from '../rotations/types';

import { loadUpcomingShiftsWidgetThemeBundle } from '../widgets/build-widget-props';
import { resolveUpcomingShiftsLayout } from '../widgets/upcoming-shifts-layout';
import { UPCOMING_SHIFTS_WIDGET_NAME } from '../widgets/types';
import { UpcomingShiftsWidget } from './upcoming-shifts-widget';

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
    await requestWidgetUpdate({
      widgetName: UPCOMING_SHIFTS_WIDGET_NAME,
      renderWidget: async (widgetInfo) => {
        const layout = resolveUpcomingShiftsLayout(widgetInfo.height);
        const bundle = await loadUpcomingShiftsWidgetThemeBundle(
          periodsOverride,
          new Date(),
          layout,
        );
        return {
          light: <UpcomingShiftsWidget {...bundle.light} />,
          dark: <UpcomingShiftsWidget {...bundle.dark} />,
        };
      },
    });
  } catch (error) {
    if (__DEV__) {
      console.warn('[UpcomingShiftsWidget] refresh failed', error);
    }
  }
}
