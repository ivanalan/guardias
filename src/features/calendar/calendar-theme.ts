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
  textMonthFontWeight: '500',
  textDayHeaderFontWeight: '500',
};
