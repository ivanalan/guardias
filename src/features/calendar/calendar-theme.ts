import type { CalendarProps } from 'react-native-calendars';

import { CALENDAR_MARK_COLORS } from './calendar-mark-colors';

/** Shared calendar chrome — weights match app Text (regular / medium / semibold). */
export const CALENDAR_THEME: NonNullable<CalendarProps['theme']> = {
  calendarBackground: 'transparent',
  todayTextColor: CALENDAR_MARK_COLORS.shiftBackground,
  arrowColor: CALENDAR_MARK_COLORS.shiftBackground,
  selectedDayBackgroundColor: CALENDAR_MARK_COLORS.shiftBackground,
  selectedDayTextColor: '#ffffff',
  monthTextColor: '#1C1B1F',
  textSectionTitleColor: '#49454F',
  dayTextColor: '#1C1B1F',
  textDisabledColor: '#C4C4C4',
  textDayFontWeight: '400',
  textMonthFontSize: 24,
  textMonthFontWeight: '500',
  textDayHeaderFontWeight: '500',
};

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
