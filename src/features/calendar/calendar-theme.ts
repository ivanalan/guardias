import type { CalendarProps } from 'react-native-calendars';
import { Platform } from 'react-native';

import { INK_COLOR } from '../../theme/brand';
import { CALENDAR_WEEK_ROW_GAP, CELL_SIZE } from './calendar-day-marker';

const MONO_FONT = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

/** Shared calendar chrome — weights match app Text (regular / medium / semibold). */
export const CALENDAR_THEME = {
  calendarBackground: 'transparent',
  todayTextColor: INK_COLOR,
  todayBackgroundColor: 'transparent',
  arrowColor: INK_COLOR,
  selectedDayBackgroundColor: 'transparent',
  selectedDayTextColor: INK_COLOR,
  monthTextColor: INK_COLOR,
  textSectionTitleColor: '#49454F',
  dayTextColor: INK_COLOR,
  textDisabledColor: '#C4C4C4',
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
      color: INK_COLOR,
    },
  },
} as NonNullable<CalendarProps['theme']>;

/**
 * CalendarList's outer wrapper has no flex on native; without this the FlatList
 * collapses to 0 height. Not part of the public Theme type.
 */
export const CALENDAR_LIST_THEME = {
  ...CALENDAR_THEME,
  'stylesheet.calendar-list.main': {
    flatListContainer: {
      flex: 1,
    },
  },
} as NonNullable<CalendarProps['theme']>;

/** White card wrapper for month calendar blocks. */
export const CALENDAR_CARD_STYLE = {
  borderCurve: 'continuous' as const,
  borderRadius: 32,
  overflow: 'visible' as const,
};
