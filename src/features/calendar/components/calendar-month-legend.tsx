import { useTranslation } from 'react-i18next';

import { useTheme } from '../../../theme/theme-context';
import type { ThemeColors } from '../../../theme/colors';
import { Pressable, Text, View } from '../../../tw';
import type { CalendarLegendFilter } from '../build-marked-dates';

type Props = {
  shiftDayCount: number;
  freeWeekendCount: number;
  vacationDayCount: number;
  /** Period color for the shifts chip (border + selected fill). */
  shiftColor: string;
  filter: CalendarLegendFilter;
  onFilterChange: (filter: CalendarLegendFilter) => void;
};

type PillKind = 'shifts' | 'freeWeekends' | 'vacation';

/** Summary pills: month counts + tap-to-emphasize calendar filter. */
export function CalendarMonthLegend({
  shiftDayCount,
  freeWeekendCount,
  vacationDayCount,
  shiftColor,
  filter,
  onFilterChange,
}: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const toggle = (kind: PillKind) => {
    onFilterChange(filter === kind ? null : kind);
  };

  return (
    <View className="mt-4 flex-row flex-wrap gap-3">
      <LegendPill
        label={t('calendar.legend.shiftsSummary', { count: shiftDayCount })}
        accessibilityHint={t('calendar.legend.filterShiftsHint')}
        borderColor={shiftColor}
        selected={filter === 'shifts'}
        muted={filter != null && filter !== 'shifts'}
        onPress={() => toggle('shifts')}
        colors={colors}
      />
      <LegendPill
        label={t('calendar.legend.freeWeekendsSummary', {
          count: freeWeekendCount,
        })}
        accessibilityHint={t('calendar.legend.filterFreeWeekendsHint')}
        borderColor={colors.bgWeekend}
        selected={filter === 'freeWeekends'}
        muted={filter != null && filter !== 'freeWeekends'}
        onPress={() => toggle('freeWeekends')}
        colors={colors}
      />
      {vacationDayCount > 0 ? (
        <LegendPill
          label={t('calendar.legend.vacationSummary', {
            count: vacationDayCount,
          })}
          accessibilityHint={t('calendar.legend.filterVacationHint')}
          borderColor={colors.bgVacation}
          selected={filter === 'vacation'}
          muted={filter != null && filter !== 'vacation'}
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
};

function LegendPill({
  label,
  accessibilityHint,
  borderColor,
  selected,
  muted,
  onPress,
  colors,
}: LegendPillProps) {
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
      }}
    >
      <Text
        className="font-mono text-sm"
        style={{ color: selected ? colors.onColor : colors.text }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
