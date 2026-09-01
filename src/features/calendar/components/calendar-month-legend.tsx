import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../../../theme/theme-context';
import type { ThemeColors } from '../../../theme/colors';
import { Pressable, Text, View } from '../../../tw';
import {
  toggleLegendFilter,
  type CalendarLegendFilterKey,
  type CalendarLegendFilterState,
} from '../build-marked-dates';

type Props = {
  shiftDayCount: number;
  secondaryShiftDayCount: number;
  freeWeekendCount: number;
  vacationDayCount: number;
  /** Period color for the shifts chip (dot + selected fill). */
  shiftColor: string;
  /** Primary period label for the shifts chip. */
  primaryLabel: string | null;
  /** Friend period color; null hides the secondary chip. */
  secondaryShiftColor: string | null;
  /** Friend period label for the secondary chip. */
  secondaryLabel: string | null;
  filter: CalendarLegendFilterState;
  onFilterChange: (filter: CalendarLegendFilterState) => void;
};

/** Summary chips: month counts + multi-select calendar filters. */
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
        <LegendChip
          label={trimmedPrimary ?? t('calendar.legend.myShiftsLabel')}
          count={shiftDayCount}
          accessibilityLabel={
            trimmedPrimary != null
              ? t('calendar.legend.periodShiftsSummary', {
                  name: trimmedPrimary,
                  count: shiftDayCount,
                })
              : t('calendar.legend.myShiftsSummary', { count: shiftDayCount })
          }
          accessibilityHint={t('calendar.legend.filterShiftsHint')}
          color={shiftColor}
          selected={filter.has('shifts')}
          onPress={() => toggle('shifts')}
          colors={colors}
        />
      ) : null}
      {showSecondary ? (
        <LegendChip
          label={secondaryLabel.trim()}
          count={secondaryShiftDayCount}
          accessibilityLabel={t('calendar.legend.periodShiftsSummary', {
            name: secondaryLabel,
            count: secondaryShiftDayCount,
          })}
          accessibilityHint={t('calendar.legend.filterFriendShiftsHint')}
          color={secondaryShiftColor}
          selected={filter.has('secondaryShifts')}
          onPress={() => toggle('secondaryShifts')}
          colors={colors}
        />
      ) : null}
      <LegendChip
        label={t('calendar.legend.freeWeekendsLabel')}
        count={freeWeekendCount}
        accessibilityLabel={t('calendar.legend.freeWeekendsSummary', {
          count: freeWeekendCount,
        })}
        accessibilityHint={t('calendar.legend.filterFreeWeekendsHint')}
        color={colors.bgWeekend}
        selected={filter.has('freeWeekends')}
        onPress={() => toggle('freeWeekends')}
        colors={colors}
      />
      {vacationDayCount > 0 ? (
        <LegendChip
          label={t('calendar.legend.vacationLabel')}
          count={vacationDayCount}
          accessibilityLabel={t('calendar.legend.vacationSummary', {
            count: vacationDayCount,
          })}
          accessibilityHint={t('calendar.legend.filterVacationHint')}
          color={colors.bgVacation}
          selected={filter.has('vacation')}
          onPress={() => toggle('vacation')}
          colors={colors}
        />
      ) : null}
    </View>
  );
}

/** Fixed leading-graphic box so the dot and the close icon occupy equal space. */
const LEADING_SLOT_SIZE = 14;

type LegendChipProps = {
  label: string;
  count: number;
  accessibilityLabel: string;
  accessibilityHint: string;
  color: string;
  selected: boolean;
  onPress: () => void;
  colors: ThemeColors;
};

function LegendChip({
  label,
  count,
  accessibilityLabel,
  accessibilityHint,
  color,
  selected,
  onPress,
  colors,
}: LegendChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      className="flex-row items-center gap-2 active:opacity-70"
      style={{
        borderCurve: 'continuous',
        borderRadius: 999,
        backgroundColor: selected ? color : colors.bg1,
        paddingHorizontal: 14,
        paddingVertical: 9,
      }}
    >
      <View
        className="items-center justify-center"
        style={{ width: LEADING_SLOT_SIZE, height: LEADING_SLOT_SIZE }}
      >
        {selected ? (
          <Ionicons
            name="close"
            size={LEADING_SLOT_SIZE}
            color={colors.onColor}
          />
        ) : (
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: color,
            }}
          />
        )}
      </View>
      <Text
        className="font-mono text-sm"
        style={{ color: selected ? colors.onColor : colors.text }}
      >
        {label}
      </Text>
      <Text
        className="font-mono text-sm"
        style={{
          color: selected ? colors.onColor : colors.textMuted,
          opacity: selected ? 0.75 : 1,
        }}
      >
        {count}
      </Text>
    </Pressable>
  );
}
