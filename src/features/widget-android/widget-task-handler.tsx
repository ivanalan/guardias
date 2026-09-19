import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

import {
  loadTwoWeekWidgetThemeBundle,
  loadUpcomingShiftsWidgetThemeBundle,
} from './build-widget-props';
import { TwoWeekCalendarWidget } from './two-week-calendar-widget';
import { UpcomingShiftsWidget } from './upcoming-shifts-widget';
import { TWO_WEEK_WIDGET_NAME, UPCOMING_SHIFTS_WIDGET_NAME } from './types';

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
    const bundle = await loadUpcomingShiftsWidgetThemeBundle();
    renderWidget({
      light: <UpcomingShiftsWidget {...bundle.light} />,
      dark: <UpcomingShiftsWidget {...bundle.dark} />,
    });
    return;
  }

  const bundle = await loadTwoWeekWidgetThemeBundle();
  renderWidget({
    light: <TwoWeekCalendarWidget {...bundle.light} />,
    dark: <TwoWeekCalendarWidget {...bundle.dark} />,
  });
}
