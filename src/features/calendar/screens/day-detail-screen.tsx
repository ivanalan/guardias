import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import type { AppLanguage } from '../../../i18n';
import { getDayInfo } from '../../../lib/shifts';
import { useTheme } from '../../../theme/theme-context';
import { Text, View } from '../../../tw';
import { StatsCard } from '../../dashboard/components/stats-card';
import { StatsCardGrid } from '../../dashboard/components/stats-card-grid';
import { useRotations } from '../../rotations/rotations-context';
import { resolveRotationColor } from '../../rotations/rotation-colors';
import type { CalendarStackParamList } from '../calendar-stack';
import {
  formatDaySheetDate,
  formatShiftShortDate,
  formatShiftTime,
} from '../format-shift-datetime';

type Props = NativeStackScreenProps<CalendarStackParamList, 'DayDetail'>;

/** Form sheet: free day or shift summary for the tapped calendar date. */
export function DayDetailScreen({ route }: Props) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { periods } = useRotations();
  const language = (i18n.language === 'en' ? 'en' : 'es') as AppLanguage;
  const { date } = route.params;
  const dateLabel = formatDaySheetDate(date, language);
  const dayInfo = getDayInfo(periods, date);

  if (dayInfo.kind === 'free') {
    return (
      <View className="gap-8 p-gutter" style={{ backgroundColor: colors.bg }}>
        <View className="gap-1">
          <Text
            className="font-serif text-4xl tracking-tight"
            style={{ color: colors.text }}
          >
            {dateLabel}
          </Text>
          <Text className="font-mono text-lg" style={{ color: colors.text }}>
            {t('calendar.freeDay')}
          </Text>
        </View>
      </View>
    );
  }

  if (dayInfo.kind === 'vacation') {
    return (
      <View className="gap-8 p-gutter" style={{ backgroundColor: colors.bg }}>
        <View className="gap-1">
          <Text
            className="font-serif text-4xl tracking-tight"
            style={{ color: colors.text }}
          >
            {dateLabel}
          </Text>
          <Text className="font-mono text-lg" style={{ color: colors.text }}>
            {t('calendar.vacationDay')}
          </Text>
          <Text
            className="font-mono text-base opacity-50"
            style={{ color: colors.text }}
          >
            {dayInfo.rotationLabel}
          </Text>
        </View>
      </View>
    );
  }

  const { shift } = dayInfo;
  const storedIconColor =
    periods.find((period) => period.id === shift.rotationPeriodId)?.color ??
    colors.brand;
  const iconColor = resolveRotationColor(storedIconColor, colors);

  return (
    <View className="gap-5 p-gutter" style={{ backgroundColor: colors.bg }}>
      <View className="gap-1">
        <Text
          className="font-serif text-4xl tracking-tight"
          style={{ color: colors.text }}
        >
          {dateLabel}
        </Text>
        <Text className="font-mono text-lg" style={{ color: colors.text }}>
          {shift.rotationLabel}
        </Text>
      </View>
      <StatsCardGrid>
        <StatsCard
          iconColor={iconColor}
          icon="log-in-outline"
          value={formatShiftTime(shift.startDateTime)}
          subtitle={t('calendar.startsOn', {
            date: formatShiftShortDate(shift.startDateTime, language),
          })}
        />
        <StatsCard
          iconColor={iconColor}
          icon="log-out-outline"
          value={formatShiftTime(shift.endDateTime)}
          subtitle={t('calendar.endsOn', {
            date: formatShiftShortDate(shift.endDateTime, language),
          })}
        />
      </StatsCardGrid>
    </View>
  );
}
