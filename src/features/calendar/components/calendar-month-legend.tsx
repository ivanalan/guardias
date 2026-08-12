import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

import { BRAND_ACCENT_TINTS, BRAND_SELECTION } from '../../../theme/brand';
import { Pressable, Text, View } from '../../../tw';
import type { CalendarLegendFilter } from '../build-marked-dates';
import { CALENDAR_MARK_COLORS } from '../calendar-mark-colors';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type Props = {
  shiftDayCount: number;
  freeWeekendCount: number;
  filter: CalendarLegendFilter;
  onFilterChange: (filter: CalendarLegendFilter) => void;
};

type TileKind = 'shifts' | 'freeWeekends';

/** Dual summary tiles: month counts + tap-to-emphasize calendar filter. */
export function CalendarMonthLegend({
  shiftDayCount,
  freeWeekendCount,
  filter,
  onFilterChange,
}: Props) {
  const { t } = useTranslation();

  const toggle = (kind: TileKind) => {
    onFilterChange(filter === kind ? null : kind);
  };

  return (
    <View className="mt-4 flex-row gap-3">
      <LegendTile
        count={shiftDayCount}
        label={t('calendar.legend.shiftDays', { count: shiftDayCount })}
        accessibilityHint={t('calendar.legend.filterShiftsHint')}
        icon="clipboard-list-outline"
        iconColor={BRAND_ACCENT_TINTS.brand}
        selected={filter === 'shifts'}
        muted={filter === 'freeWeekends'}
        selectedBackground={BRAND_SELECTION.background}
        selectedBorder={BRAND_SELECTION.border}
        onPress={() => toggle('shifts')}
      />
      <LegendTile
        count={freeWeekendCount}
        label={t('calendar.legend.freeWeekends', { count: freeWeekendCount })}
        accessibilityHint={t('calendar.legend.filterFreeWeekendsHint')}
        icon="umbrella-beach"
        iconColor={BRAND_ACCENT_TINTS.teal}
        selected={filter === 'freeWeekends'}
        muted={filter === 'shifts'}
        selectedBackground={CALENDAR_MARK_COLORS.freeWeekendBackground}
        selectedBorder={CALENDAR_MARK_COLORS.freeWeekendText}
        onPress={() => toggle('freeWeekends')}
      />
    </View>
  );
}

type LegendTileProps = {
  count: number;
  label: string;
  accessibilityHint: string;
  icon: IconName;
  iconColor: string;
  selected: boolean;
  muted: boolean;
  selectedBackground: string;
  selectedBorder: string;
  onPress: () => void;
};

function LegendTile({
  count,
  label,
  accessibilityHint,
  icon,
  iconColor,
  selected,
  muted,
  selectedBackground,
  selectedBorder,
  onPress,
}: LegendTileProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${count} ${label}`}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      className="min-w-0 flex-1 gap-3 border p-4 active:opacity-70"
      style={{
        borderCurve: 'continuous',
        borderRadius: 24,
        borderColor: selected ? selectedBorder : '#E5E5E5',
        backgroundColor: selected ? selectedBackground : '#FFFFFF',
        boxShadow: selected
          ? '0 4px 12px rgba(0, 0, 0, 0.06)'
          : '0 2px 8px rgba(0, 0, 0, 0.04)',
        opacity: muted ? 0.45 : 1,
      }}
    >
      <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
      <View className="gap-1">
        <Text className="text-2xl font-bold tracking-tight">{count}</Text>
        <Text className="text-sm opacity-50">{label}</Text>
      </View>
    </Pressable>
  );
}
