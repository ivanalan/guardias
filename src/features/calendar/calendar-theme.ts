import type { CalendarProps } from 'react-native-calendars';
import { Platform } from 'react-native';

import type { ThemeColors } from '../../theme/colors';
import { WIDGET_CARD_PADDING_X, WIDGET_CARD_PADDING_Y } from '../../theme/layout';
import {
  WIDGET_RADIUS,
} from '../../theme/widget-radius';
import {
  CALENDAR_WEEK_ROW_GAP,
  CELL_SIZE,
  SECONDARY_DOT_STACK_HEIGHT,
} from './calendar-day-marker';

const MONO_FONT = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

/** Shared calendar chrome — weights match app Text (regular / medium / semibold). */
export function calendarThemeFor(
  colors: ThemeColors,
): NonNullable<CalendarProps['theme']> {
  return {
    calendarBackground: 'transparent',
    todayTextColor: colors.brand,
    todayBackgroundColor: 'transparent',
    arrowColor: colors.brand,
    selectedDayBackgroundColor: 'transparent',
    selectedDayTextColor: colors.brand,
    monthTextColor: colors.brand,
    textSectionTitleColor: colors.textMuted,
    dayTextColor: colors.brand,
    textDisabledColor: colors.textDisabled,
    textDayFontWeight: '400',
    textMonthFontSize: 30,
    textMonthFontWeight: '400',
    textMonthFontFamily: 'InstrumentSerif_400Regular',
    textDayFontFamily: MONO_FONT,
    textDayHeaderFontFamily: MONO_FONT,
    textDayHeaderFontWeight: '400',
    textDayFontSize: 14,
    textDayHeaderFontSize: 14,
    weekVerticalMargin: 0,
    'stylesheet.calendar.main': {
      monthView: {
        gap: CALENDAR_WEEK_ROW_GAP,
      },
      week: {
        marginVertical: 0,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        overflow: 'visible',
      },
      dayContainer: {
        flex: 1,
        alignItems: 'stretch',
        overflow: 'visible',
      },
      container: {
        paddingLeft: 0,
        paddingRight: 0,
      },
    },
    'stylesheet.day.basic': {
      base: {
        width: CELL_SIZE,
        height: CELL_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
      },
      today: {
        backgroundColor: 'transparent',
        borderRadius: 0,
      },
      selected: {
        backgroundColor: 'transparent',
        borderRadius: 0,
      },
    },
    'stylesheet.calendar.header': {
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 4,
        paddingRight: 4,
        marginTop: 0,
        marginBottom: 8,
      },
      headerContainer: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        overflow: 'visible',
        alignSelf: 'stretch',
      },
      monthText: {
        margin: 0,
        lineHeight: 38,
        flexShrink: 0,
      },
      arrow: {
        padding: 6,
      },
    },
  } as NonNullable<CalendarProps['theme']>;
}

/**
 * CalendarList's outer wrapper has no flex on native; without this the FlatList
 * collapses to 0 height. Not part of the public Theme type.
 */
export function calendarListThemeFor(
  colors: ThemeColors,
): NonNullable<CalendarProps['theme']> {
  return {
    ...calendarThemeFor(colors),
    'stylesheet.calendar-list.main': {
      flatListContainer: {
        flex: 1,
      },
      // Default list item padding is 15px; card inset uses CALENDAR_CARD_PADDING_HORIZONTAL.
      calendar: {
        paddingLeft: 0,
        paddingRight: 0,
      },
    },
  } as NonNullable<CalendarProps['theme']>;
}

/** Inner horizontal padding of month cards — same as home widget cards. */
export const CALENDAR_CARD_PADDING_HORIZONTAL = WIDGET_CARD_PADDING_X;
/** Inner vertical padding of month cards — same as home widget cards. */
export const CALENDAR_CARD_PADDING_VERTICAL = WIDGET_CARD_PADDING_Y;

/** Shared card chrome for single-month and list month blocks. */
export function calendarCardStyle(colors: ThemeColors, _height?: number) {
  return {
    backgroundColor: colors.bg1,
    paddingLeft: CALENDAR_CARD_PADDING_HORIZONTAL,
    paddingRight: CALENDAR_CARD_PADDING_HORIZONTAL,
    paddingTop: CALENDAR_CARD_PADDING_VERTICAL,
    paddingBottom: CALENDAR_CARD_PADDING_VERTICAL,
    borderCurve: 'continuous' as const,
    borderRadius: WIDGET_RADIUS,
    overflow: 'visible' as const,
  };
}
/** Canvas gap between year-view month cards. */
export const CALENDAR_LIST_ITEM_GAP = 12;

/** Month title line height — shared by the month header and the year-list title. */
export const CALENDAR_MONTH_TITLE_LINE_HEIGHT = 38;
/** Weekday label line height — pinned so the list item pitch stays exact. */
export const CALENDAR_WEEKDAY_LABEL_LINE_HEIGHT = 20;

/** Monday-first, matching `firstDay={1}` on calendar screens. */
export const CALENDAR_LIST_FIRST_DAY = 1;

const HEADER_MARGIN_BOTTOM = 8;
const WEEKDAY_ROW_MARGIN_TOP = 4;
const DAY_HEADER_MARGIN_TOP = 2;
const DAY_HEADER_MARGIN_BOTTOM = 7;
const WEEK_ROW_HEIGHT =
  CELL_SIZE + SECONDARY_DOT_STACK_HEIGHT + CALENDAR_WEEK_ROW_GAP;

/**
 * Weekday row sits inside our header (`hideDayNames`). marginTop includes the
 * old header-to-week gap so year-list item pitch stays exact.
 */
export const CALENDAR_WEEKDAY_ROW_MARGIN_TOP =
  HEADER_MARGIN_BOTTOM + WEEKDAY_ROW_MARGIN_TOP + DAY_HEADER_MARGIN_TOP;
export const CALENDAR_WEEKDAY_ROW_MARGIN_BOTTOM = DAY_HEADER_MARGIN_BOTTOM;

const listHeaderHeight =
  CALENDAR_MONTH_TITLE_LINE_HEIGHT + HEADER_MARGIN_BOTTOM;
const listWeekdayRowHeight =
  CALENDAR_WEEKDAY_ROW_MARGIN_TOP +
  CALENDAR_WEEKDAY_LABEL_LINE_HEIGHT +
  CALENDAR_WEEKDAY_ROW_MARGIN_BOTTOM;

/**
 * Week rows for a month with `hideExtraDays` (same grid as react-native-calendars
 * `page()` when `showSixWeeks` is false). `monthDate` is any day in the month.
 */
export function weeksInCalendarMonth(
  monthDate: string,
  firstDayOfWeek: number = CALENDAR_LIST_FIRST_DAY,
): number {
  const year = Number(monthDate.slice(0, 4));
  const monthIndex = Number(monthDate.slice(5, 7)) - 1;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const fdow = (7 + firstDayOfWeek) % 7 || 7;
  const daysBefore = (firstWeekday - fdow + 7) % 7;
  return Math.ceil((daysBefore + daysInMonth) / 7);
}

function monthGridHeight(weekCount: number): number {
  if (weekCount <= 0) {
    return 0;
  }
  return (
    weekCount * WEEK_ROW_HEIGHT + (weekCount - 1) * CALENDAR_WEEK_ROW_GAP
  );
}

/** White card height for a month with the given week-row count. */
export function calendarListCardHeight(weekCount: number): number {
  return (
    listHeaderHeight +
    listWeekdayRowHeight +
    monthGridHeight(weekCount) +
    CALENDAR_CARD_PADDING_VERTICAL * 2
  );
}

/** FlatList item pitch: card height + canvas gap below the card. */
export function calendarListItemHeight(weekCount: number): number {
  return calendarListCardHeight(weekCount) + CALENDAR_LIST_ITEM_GAP;
}

/** Max card height (6-week months). Prefer `calendarListCardHeight(weeks)`. */
export const CALENDAR_LIST_CARD_HEIGHT = calendarListCardHeight(6);

/**
 * Max list item pitch. Prefer `calendarListItemHeight(weeks)` so 4/5-week
 * months hug their grid instead of reserving empty 6th-week space.
 */
export const CALENDAR_LIST_ITEM_HEIGHT = calendarListItemHeight(6);
