import { useTranslation } from 'react-i18next';

import { WEEKEND_COLOR } from '../../../theme/brand';
import { Pressable, Text, View } from '../../../tw';
import type { CalendarLegendFilter } from '../build-marked-dates';
import { CALENDAR_MARK_COLORS } from '../calendar-mark-colors';

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
      />
      <LegendPill
        label={t('calendar.legend.freeWeekendsSummary', {
          count: freeWeekendCount,
        })}
        accessibilityHint={t('calendar.legend.filterFreeWeekendsHint')}
        borderColor={WEEKEND_COLOR}
        selected={filter === 'freeWeekends'}
        muted={filter != null && filter !== 'freeWeekends'}
        onPress={() => toggle('freeWeekends')}
      />
      {vacationDayCount > 0 ? (
        <LegendPill
          label={t('calendar.legend.vacationSummary', {
            count: vacationDayCount,
          })}
          accessibilityHint={t('calendar.legend.filterVacationHint')}
          borderColor={CALENDAR_MARK_COLORS.vacationBackground}
          selected={filter === 'vacation'}
          muted={filter != null && filter !== 'vacation'}
          onPress={() => toggle('vacation')}
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
};

function LegendPill({
  label,
  accessibilityHint,
  borderColor,
  selected,
  muted,
  onPress,
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
        backgroundColor: selected ? borderColor : '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 10,
        opacity: muted ? 0.45 : 1,
      }}
    >
      <Text
        className={`font-mono text-sm ${selected ? 'text-white' : 'text-ink'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
