import type XDate from 'xdate';

import { useTheme } from '../../../theme/theme-context';
import { Text } from '../../../tw';

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
    <Text
      className="font-serif text-3xl"
      style={{
        lineHeight: 38,
        paddingRight: 8,
        flexShrink: 0,
        color: colors.text,
      }}
    >
      {date?.toString(monthFormat) ?? ''}
    </Text>
  );
}
