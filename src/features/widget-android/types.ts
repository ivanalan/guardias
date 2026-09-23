/**
 * Android home-screen widgets.
 *
 * Requires a custom native binary (dev client / store build / `expo run:android`).
 * Not available in Expo Go.
 */
export const TWO_WEEK_WIDGET_NAME = 'TwoWeekCalendar';
export const UPCOMING_SHIFTS_WIDGET_NAME = 'UpcomingShifts';

/** Max shifts fetched for the upcoming-shifts widget (tall layout). */
export const UPCOMING_SHIFTS_WIDGET_LIMIT = 6;

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
  weekdayLabels: readonly string[];
  weekdayColor: HexColor;
  /** 2–5 weeks of seven day cells (Mon–Sun), from height-driven layout. */
  weeks: readonly (readonly WidgetDayCellProps[])[];
  /** Fluid mark size (dp) — stretches with widget height. */
  cellSize: number;
  dayFontSize: number;
  weekdayFontSize: number;
  showWeekdayLetters: boolean;
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
  /** Upcoming shifts (sliced by maxItems in the widget). */
  items: readonly UpcomingShiftItemProps[];
  /** Height-driven visible count (from resolveUpcomingShiftsLayout). */
  maxItems: number;
  /** When false, hide relative captions (compact height). */
  showRelative: boolean;
  accentColor: HexColor;
  railMutedColor: HexColor;
  onAccentColor: HexColor;
  weekdayColor: HexColor;
  relativeColor: HexColor;
};
