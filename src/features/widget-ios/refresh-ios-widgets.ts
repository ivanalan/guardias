import type { RotationPeriod } from '../rotations/types';
import {
  loadTwoWeekWidgetThemeBundle,
  loadUpcomingShiftsWidgetThemeBundle,
} from '../widgets/build-widget-props';
import { resolveTwoWeekLayout } from '../widgets/two-week-layout';
import { resolveUpcomingShiftsLayout } from '../widgets/upcoming-shifts-layout';

import { isExpoWidgetsLinked } from './is-expo-widgets-linked';

/** Max data for family-based slicing inside the widget. */
const IOS_TWO_WEEK_LAYOUT = resolveTwoWeekLayout(340, 340);
const IOS_UPCOMING_LAYOUT = resolveUpcomingShiftsLayout(340);

function nextMidnight(now: Date): Date {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next;
}

/**
 * Push iOS widget timelines from the main app.
 * No-op in Expo Go / when ExpoWidgets is not in the binary.
 */
export async function refreshIosHomeWidgets(
  periodsOverride?: readonly RotationPeriod[],
): Promise<void> {
  if (!isExpoWidgetsLinked()) {
    return;
  }

  const now = new Date();

  let step = 'import';
  try {
    step = 'import';
    const [{ default: TwoWeekCalendarWidget }, { default: UpcomingShiftsWidget }] =
      await Promise.all([
        import('./two-week-calendar-widget'),
        import('./upcoming-shifts-widget'),
      ]);

    step = 'load-props';
    const [twoWeek, upcoming] = await Promise.all([
      loadTwoWeekWidgetThemeBundle(
        periodsOverride,
        now,
        IOS_TWO_WEEK_LAYOUT,
      ),
      loadUpcomingShiftsWidgetThemeBundle(
        periodsOverride,
        now,
        IOS_UPCOMING_LAYOUT,
      ),
    ]);

    const twoWeekProps = {
      light: twoWeek.light,
      dark: twoWeek.dark,
      forcedScheme: twoWeek.forcedScheme,
    };
    const upcomingProps = {
      light: upcoming.light,
      dark: upcoming.dark,
      forcedScheme: upcoming.forcedScheme,
    };

    const midnight = nextMidnight(now);

    step = 'update-two-week';
    TwoWeekCalendarWidget.updateTimeline([
      { date: now, props: twoWeekProps },
      { date: midnight, props: twoWeekProps },
    ]);

    step = 'update-upcoming';
    UpcomingShiftsWidget.updateTimeline([
      { date: now, props: upcomingProps },
      { date: midnight, props: upcomingProps },
    ]);
  } catch (error) {
    if (__DEV__) {
      console.warn(`[IosHomeWidgets] refresh failed at ${step}`, error);
    }
  }
}
