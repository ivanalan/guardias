import type XDate from 'xdate';

import { useTheme } from '../../../theme/theme-context';
import { Text, View } from '../../../tw';
import { CALENDAR_MONTH_TITLE_LINE_HEIGHT } from '../calendar-theme';
import { CalendarWeekdayRow } from './calendar-weekday-row';

/** Month title for react-native-calendars `renderHeader` (avoids serif clipping). */
export function CalendarMonthTitle({
  date,
  monthFormat = 'MMMM',
}: {
  date?: XDate;
  monthFormat?: string;
}) {
  const { colors } = useTheme();

  return (
    <View className="w-full">
      <Text
        className="font-serif text-4xl"
        style={{
          lineHeight: CALENDAR_MONTH_TITLE_LINE_HEIGHT,
          paddingRight: 8,
          flexShrink: 0,
          color: colors.text,
        }}
      >
        {date?.toString(monthFormat) ?? ''}
      </Text>
      <CalendarWeekdayRow />
    </View>
  );
}
