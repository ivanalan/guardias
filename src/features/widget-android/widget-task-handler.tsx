import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

import {
  loadTwoWeekWidgetThemeBundle,
  loadUpcomingShiftsWidgetThemeBundle,
} from '../widgets/build-widget-props';
import { resolveTwoWeekLayout } from '../widgets/two-week-layout';
import { resolveUpcomingShiftsLayout } from '../widgets/upcoming-shifts-layout';
import {
  TWO_WEEK_WIDGET_NAME,
  UPCOMING_SHIFTS_WIDGET_NAME,
} from '../widgets/types';
import { TwoWeekCalendarWidget } from './two-week-calendar-widget';
import { UpcomingShiftsWidget } from './upcoming-shifts-widget';

/**
 * Headless task handler for Android App Widget lifecycle events.
 * Reads rotation + preference storage and redraws the matching widget.
 */
export async function widgetTaskHandler({
  widgetAction,
  widgetInfo,
  renderWidget,
}: WidgetTaskHandlerProps): Promise<void> {
  const { widgetName } = widgetInfo;

  if (
    widgetName !== TWO_WEEK_WIDGET_NAME &&
    widgetName !== UPCOMING_SHIFTS_WIDGET_NAME
  ) {
    return;
  }

  if (widgetAction === 'WIDGET_DELETED') {
    return;
  }

  if (widgetName === UPCOMING_SHIFTS_WIDGET_NAME) {
    const layout = resolveUpcomingShiftsLayout(widgetInfo.height);
    const bundle = await loadUpcomingShiftsWidgetThemeBundle(
      undefined,
      new Date(),
      layout,
    );
    renderWidget({
      light: <UpcomingShiftsWidget {...bundle.light} />,
      dark: <UpcomingShiftsWidget {...bundle.dark} />,
    });
    return;
  }

  const layout = resolveTwoWeekLayout(widgetInfo.height, widgetInfo.width);
  const bundle = await loadTwoWeekWidgetThemeBundle(
    undefined,
    new Date(),
    layout,
  );
  renderWidget({
    light: <TwoWeekCalendarWidget {...bundle.light} />,
    dark: <TwoWeekCalendarWidget {...bundle.dark} />,
  });
}
