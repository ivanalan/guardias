import { MaterialCommunityIcons } from '@expo/vector-icons';
import type XDate from 'xdate';
import { useTranslation } from 'react-i18next';

import { INK_COLOR } from '../../../theme/brand';
import { Pressable, Text, View } from '../../../tw';

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

  return (
    <View className="w-full flex-row items-center justify-between">
      <Text
        className="font-serif text-3xl text-ink"
        style={{ lineHeight: 38, flexShrink: 0 }}
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
          <MaterialCommunityIcons
            name="chevron-left"
            size={28}
            color={INK_COLOR}
          />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('calendar.nextMonthA11y')}
          onPress={onNextMonth}
          className="px-1 active:opacity-60"
          hitSlop={8}
        >
          <MaterialCommunityIcons
            name="chevron-right"
            size={28}
            color={INK_COLOR}
          />
        </Pressable>
      </View>
    </View>
  );
}
