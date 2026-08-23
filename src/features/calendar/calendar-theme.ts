import type { CalendarProps } from 'react-native-calendars';
import { Platform } from 'react-native';

import type { ThemeColors } from '../../theme/colors';
import { CALENDAR_WEEK_ROW_GAP, CELL_SIZE } from './calendar-day-marker';

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
        alignItems: 'center',
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
      week: {
        marginTop: 4,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-around',
      },
      dayHeader: {
        marginTop: 2,
        marginBottom: 7,
        width: 32,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '400',
        color: colors.text,
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
    },
  } as NonNullable<CalendarProps['theme']>;
}

/** White card wrapper for month calendar blocks. */
export const CALENDAR_CARD_STYLE = {
  borderCurve: 'continuous' as const,
  borderRadius: 32,
  overflow: 'visible' as const,
};

/** Inner padding of month cards in month + year views. */
export const CALENDAR_CARD_PADDING_VERTICAL = 20;
/** Canvas gap between year-view month cards. */
export const CALENDAR_LIST_ITEM_GAP = 12;

const MONTH_TITLE_LINE_HEIGHT = 38;
const HEADER_MARGIN_BOTTOM = 8;
const WEEKDAY_ROW_MARGIN_TOP = 4;
const WEEKDAY_ROW_MARGIN_BOTTOM = 8;
const DAY_HEADER_MARGIN_TOP = 2;
const DAY_HEADER_FONT_SIZE = 14;
const DAY_HEADER_MARGIN_BOTTOM = 7;
const WEEK_COUNT = 6;
const WEEK_ROW_HEIGHT = CELL_SIZE + CALENDAR_WEEK_ROW_GAP;

const listHeaderHeight = MONTH_TITLE_LINE_HEIGHT + HEADER_MARGIN_BOTTOM;
const listWeekdayRowHeight =
  WEEKDAY_ROW_MARGIN_TOP +
  DAY_HEADER_MARGIN_TOP +
  DAY_HEADER_FONT_SIZE +
  DAY_HEADER_MARGIN_BOTTOM +
  WEEKDAY_ROW_MARGIN_BOTTOM;
const listMonthGridHeight =
  WEEK_COUNT * WEEK_ROW_HEIGHT + (WEEK_COUNT - 1) * CALENDAR_WEEK_ROW_GAP;

/** White card minHeight (6-week grid + padding). List pitch adds the canvas gap. */
export const CALENDAR_LIST_CARD_HEIGHT =
  listHeaderHeight +
  listWeekdayRowHeight +
  listMonthGridHeight +
  CALENDAR_CARD_PADDING_VERTICAL * 2;

/**
 * CalendarList getItemLayout pitch. Must match card height + gap or the list
 * opens scrolled past the current month.
 */
export const CALENDAR_LIST_ITEM_HEIGHT =
  CALENDAR_LIST_CARD_HEIGHT + CALENDAR_LIST_ITEM_GAP;
