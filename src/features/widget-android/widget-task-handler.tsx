import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

import { loadTwoWeekWidgetThemeBundle } from './build-widget-props';
import { TwoWeekCalendarWidget } from './two-week-calendar-widget';
import { TWO_WEEK_WIDGET_NAME } from './types';

/**
 * Headless task handler for Android App Widget lifecycle events.
 * Reads rotation + preference storage and redraws the two-week grid.
 */
export async function widgetTaskHandler({
  widgetAction,
  widgetInfo,
  renderWidget,
}: WidgetTaskHandlerProps): Promise<void> {
  if (widgetInfo.widgetName !== TWO_WEEK_WIDGET_NAME) {
    return;
  }

  if (widgetAction === 'WIDGET_DELETED') {
    return;
  }

  const bundle = await loadTwoWeekWidgetThemeBundle();
  renderWidget({
    light: <TwoWeekCalendarWidget {...bundle.light} />,
    dark: <TwoWeekCalendarWidget {...bundle.dark} />,
  });
}
