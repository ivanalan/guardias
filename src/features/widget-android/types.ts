/**
 * Android home-screen widget (two-week calendar).
 *
 * Requires a custom native binary (dev client / store build / `expo run:android`).
 * Not available in Expo Go.
 */
export const TWO_WEEK_WIDGET_NAME = 'TwoWeekCalendar';

export type HexColor = `#${string}`;

export type WidgetDayKind = 'shift' | 'vacation' | 'freeWeekend' | 'none';

export type WidgetDayCellProps = {
  dayNumber: string;
  isToday: boolean;
  kind: WidgetDayKind;
  /** Cell fill (shift / vacation / free weekend), or null for plain day. */
  backgroundColor: HexColor | null;
  textColor: HexColor;
  /** Today ring color; null when not today. */
  borderColor: HexColor | null;
  secondaryDotColor: HexColor | null;
};

export type TwoWeekWidgetProps = {
  backgroundColor: HexColor;
  /** Active primary rotation name (Home page title). */
  title: string;
  titleColor: HexColor;
  weekdayLabels: readonly string[];
  weekdayColor: HexColor;
  /** Two weeks of seven day cells (Mon–Sun). */
  weeks: readonly [
    readonly WidgetDayCellProps[],
    readonly WidgetDayCellProps[],
  ];
};
