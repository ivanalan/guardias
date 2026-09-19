/**
 * Android home-screen widgets.
 *
 * Requires a custom native binary (dev client / store build / `expo run:android`).
 * Not available in Expo Go.
 */
export const TWO_WEEK_WIDGET_NAME = 'TwoWeekCalendar';
export const UPCOMING_SHIFTS_WIDGET_NAME = 'UpcomingShifts';

/** Max shifts shown in the upcoming-shifts home-screen widget (2×2). */
export const UPCOMING_SHIFTS_WIDGET_LIMIT = 4;

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

export type UpcomingShiftItemProps = {
  dayNumber: string;
  weekday: string;
  relativeLabel: string;
  /** Highlight the soonest upcoming shift (rail + weekday). */
  isNext: boolean;
};

export type UpcomingShiftsWidgetProps = {
  backgroundColor: HexColor;
  title: string;
  titleColor: HexColor;
  emptyCaption: string;
  emptyCaptionColor: HexColor;
  /** Up to four upcoming shifts for the 2×2 grid. */
  items: readonly UpcomingShiftItemProps[];
  accentColor: HexColor;
  railMutedColor: HexColor;
  onAccentColor: HexColor;
  weekdayColor: HexColor;
  relativeColor: HexColor;
};
