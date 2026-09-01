import { Ionicons } from '@expo/vector-icons';
import type XDate from 'xdate';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../../../theme/theme-context';
import { Pressable, Text, View } from '../../../tw';
import { CALENDAR_MONTH_TITLE_LINE_HEIGHT } from '../calendar-theme';
import { CalendarWeekdayRow } from './calendar-weekday-row';

type CalendarMonthHeaderProps = {
  date?: XDate;
  monthFormat?: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
};

/** Month title with prev/next controls grouped on the right (Calendar mock layout). */
export function CalendarMonthHeader({
  date,
  monthFormat = 'MMMM',
  onPreviousMonth,
  onNextMonth,
}: CalendarMonthHeaderProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View className="w-full">
      <View className="flex-row items-center justify-between">
        <Text
          className="font-serif text-4xl"
          style={{
            lineHeight: CALENDAR_MONTH_TITLE_LINE_HEIGHT,
            flexShrink: 0,
            color: colors.text,
          }}
        >
          {date?.toString(monthFormat) ?? ''}
        </Text>
        <View className="flex-row items-center">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('calendar.previousMonthA11y')}
            onPress={onPreviousMonth}
            className="px-1 active:opacity-60"
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={28} color={colors.brand} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('calendar.nextMonthA11y')}
            onPress={onNextMonth}
            className="px-1 active:opacity-60"
            hitSlop={8}
          >
            <Ionicons name="chevron-forward" size={28} color={colors.brand} />
          </Pressable>
        </View>
      </View>
      <CalendarWeekdayRow />
    </View>
  );
}
