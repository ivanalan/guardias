import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import type { AppLanguage } from '../../../i18n';
import { getDayInfo } from '../../../lib/shifts';
import { Text, View } from '../../../tw';
import { StatsCard } from '../../dashboard/components/stats-card';
import { StatsCardGrid } from '../../dashboard/components/stats-card-grid';
import { useRotations } from '../../rotations/rotations-context';
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
  const { periods } = useRotations();
  const language = (i18n.language === 'en' ? 'en' : 'es') as AppLanguage;
  const { date } = route.params;
  const dateLabel = formatDaySheetDate(date, language);
  const dayInfo = getDayInfo(periods, date);

  if (dayInfo.kind === 'free') {
    return (
      <View className="gap-8 bg-white p-6">
        <View className="gap-1">
          <Text className="text-3xl font-bold tracking-tight">{dateLabel}</Text>
          <Text className="text-lg font-medium">{t('calendar.freeDay')}</Text>
        </View>
      </View>
    );
  }

  const { shift } = dayInfo;

  return (
    <View className="gap-4 bg-white p-6">
      <View className="gap-1">
        <Text className="text-3xl font-bold tracking-tight">{dateLabel}</Text>
        <Text className="text-lg font-medium">{shift.rotationLabel}</Text>
      </View>
      <StatsCardGrid>
        <StatsCard
          tint="brand"
          icon="login"
          value={formatShiftTime(shift.startDateTime)}
          subtitle={t('calendar.startsOn', {
            date: formatShiftShortDate(shift.startDateTime, language),
          })}
        />
        <StatsCard
          tint="indigo"
          icon="logout"
          value={formatShiftTime(shift.endDateTime)}
          subtitle={t('calendar.endsOn', {
            date: formatShiftShortDate(shift.endDateTime, language),
          })}
        />
      </StatsCardGrid>
    </View>
  );
}
