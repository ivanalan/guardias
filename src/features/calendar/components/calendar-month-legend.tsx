import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../../../theme/theme-context';
import type { ThemeColors } from '../../../theme/colors';
import { Pressable, Text, View } from '../../../tw';
import {
  toggleLegendFilter,
  type CalendarLegendFilterKey,
  type CalendarLegendFilterState,
} from '../build-marked-dates';

type IconName = ComponentProps<typeof Ionicons>['name'];

type Props = {
  shiftDayCount: number;
  secondaryShiftDayCount: number;
  freeWeekendCount: number;
  vacationDayCount: number;
  /** Period color for the shifts chip (border + selected fill). */
  shiftColor: string;
  /** Primary period label for the shifts pill. */
  primaryLabel: string | null;
  /** Friend period color; null hides the secondary pill. */
  secondaryShiftColor: string | null;
  /** Friend period label for the secondary pill. */
  secondaryLabel: string | null;
  filter: CalendarLegendFilterState;
  onFilterChange: (filter: CalendarLegendFilterState) => void;
};

/** Summary pills: month counts + multi-select calendar filters. */
export function CalendarMonthLegend({
  shiftDayCount,
  secondaryShiftDayCount,
  freeWeekendCount,
  vacationDayCount,
  shiftColor,
  primaryLabel,
  secondaryShiftColor,
  secondaryLabel,
  filter,
  onFilterChange,
}: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const filterActive = filter.size > 0;

  const toggle = (kind: CalendarLegendFilterKey) => {
    onFilterChange(toggleLegendFilter(filter, kind));
  };

  const trimmedPrimary =
    primaryLabel != null && primaryLabel.trim() !== ''
      ? primaryLabel.trim()
      : null;
  const showSecondary =
    secondaryShiftDayCount > 0 &&
    secondaryShiftColor != null &&
    secondaryLabel != null &&
    secondaryLabel.trim() !== '';

  return (
    <View className="mt-4 flex-row flex-wrap gap-3">
      {shiftDayCount > 0 ? (
        <LegendPill
          label={
            trimmedPrimary != null
              ? t('calendar.legend.periodShiftsSummary', {
                  name: trimmedPrimary,
                  count: shiftDayCount,
                })
              : t('calendar.legend.myShiftsSummary', { count: shiftDayCount })
          }
          accessibilityHint={t('calendar.legend.filterShiftsHint')}
          borderColor={shiftColor}
          selected={filter.has('shifts')}
          muted={filterActive && !filter.has('shifts')}
          onPress={() => toggle('shifts')}
          colors={colors}
          icon="heart"
        />
      ) : null}
      {showSecondary ? (
        <LegendPill
          label={t('calendar.legend.periodShiftsSummary', {
            name: secondaryLabel,
            count: secondaryShiftDayCount,
          })}
          accessibilityHint={t('calendar.legend.filterFriendShiftsHint')}
          borderColor={secondaryShiftColor}
          selected={filter.has('secondaryShifts')}
          muted={filterActive && !filter.has('secondaryShifts')}
          onPress={() => toggle('secondaryShifts')}
          colors={colors}
          icon="people"
        />
      ) : null}
      <LegendPill
        label={t('calendar.legend.freeWeekendsSummary', {
          count: freeWeekendCount,
        })}
        accessibilityHint={t('calendar.legend.filterFreeWeekendsHint')}
        borderColor={colors.bgWeekend}
        selected={filter.has('freeWeekends')}
        muted={filterActive && !filter.has('freeWeekends')}
        onPress={() => toggle('freeWeekends')}
        colors={colors}
        icon="leaf"
      />
      {vacationDayCount > 0 ? (
        <LegendPill
          label={t('calendar.legend.vacationSummary', {
            count: vacationDayCount,
          })}
          accessibilityHint={t('calendar.legend.filterVacationHint')}
          borderColor={colors.bgVacation}
          selected={filter.has('vacation')}
          muted={filterActive && !filter.has('vacation')}
          onPress={() => toggle('vacation')}
          colors={colors}
        />
      ) : null}
    </View>
  );
}

type LegendPillProps = {
  label: string;
  accessibilityHint: string;
  borderColor: string;
  selected: boolean;
  muted: boolean;
  onPress: () => void;
  colors: ThemeColors;
  icon?: IconName;
};

function LegendPill({
  label,
  accessibilityHint,
  borderColor,
  selected,
  muted,
  onPress,
  colors,
  icon,
}: LegendPillProps) {
  const accent = selected ? colors.onColor : borderColor;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      className="active:opacity-70"
      style={{
        borderCurve: 'continuous',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor,
        backgroundColor: selected ? borderColor : colors.bg1,
        paddingHorizontal: 16,
        paddingVertical: 10,
        opacity: muted ? 0.45 : 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {icon != null ? <Ionicons name={icon} size={14} color={accent} /> : null}
      <Text
        className="font-mono text-sm"
        style={{ color: selected ? colors.onColor : colors.text }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
