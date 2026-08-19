import type XDate from 'xdate';

import { Text } from '../../../tw';

/** Month title for react-native-calendars `renderHeader` (avoids serif clipping). */
export function CalendarMonthTitle({
  date,
  monthFormat = 'MMMM',
}: {
  date?: XDate;
  monthFormat?: string;
}) {
  return (
    <Text
      className="font-serif text-3xl text-ink"
      style={{ lineHeight: 38, paddingRight: 8, flexShrink: 0 }}
    >
      {date?.toString(monthFormat) ?? ''}
    </Text>
  );
}
