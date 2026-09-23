import { refreshTwoWeekWidget } from '../widget-android/refresh-two-week-widget';
import { refreshUpcomingShiftsWidget } from '../widget-android/refresh-upcoming-widget';
import { refreshIosHomeWidgets } from '../widget-ios/refresh-ios-widgets';
import type { RotationPeriod } from '../rotations/types';

/** Refresh Android + iOS home-screen widgets after data changes. */
export async function refreshHomeWidgets(
  periodsOverride?: readonly RotationPeriod[],
): Promise<void> {
  await Promise.all([
    refreshTwoWeekWidget(periodsOverride),
    refreshUpcomingShiftsWidget(periodsOverride),
    refreshIosHomeWidgets(periodsOverride),
  ]);
}
