import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import type { AppLanguage } from '../../../i18n';
import { getDayInfo } from '../../../lib/shifts';
import { Text, View } from '../../../tw';
import { formatFormDate } from '../../rotations/format-period-range';
import { useRotations } from '../../rotations/rotations-context';
import type { CalendarStackParamList } from '../calendar-stack';
import { formatShiftDateTime } from '../format-shift-datetime';

type Props = NativeStackScreenProps<CalendarStackParamList, 'DayDetail'>;

/** Form sheet: free day or shift summary for the tapped calendar date. */
export function DayDetailScreen({ route }: Props) {
  const { t, i18n } = useTranslation();
  const { periods } = useRotations();
  const language = (i18n.language === 'en' ? 'en' : 'es') as AppLanguage;
  const { date } = route.params;
  const dateLabel = formatFormDate(date, language);
  const dayInfo = getDayInfo(periods, date);

  if (dayInfo.kind === 'free') {
    return (
      <View className="gap-3 bg-white p-6">
        <Text className="text-xl font-semibold">{dateLabel}</Text>
        <Text className="text-base">{t('calendar.freeDay')}</Text>
      </View>
    );
  }

  const { shift } = dayInfo;

  return (
    <View className="gap-3 bg-white p-6">
      <Text className="text-xl font-semibold">{dateLabel}</Text>
      <Text className="text-base font-medium">{t('calendar.shiftDay')}</Text>
      <Text className="text-base">{shift.rotationLabel}</Text>
      <View className="gap-1">
        <Text className="text-sm opacity-70">{t('calendar.starts')}</Text>
        <Text className="text-base">
          {formatShiftDateTime(shift.startDateTime, language)}
        </Text>
      </View>
      <View className="gap-1">
        <Text className="text-sm opacity-70">{t('calendar.ends')}</Text>
        <Text className="text-base">
          {formatShiftDateTime(shift.endDateTime, language)}
        </Text>
      </View>
      <Text className="text-sm opacity-70">
        {t('calendar.duration', { hours: shift.durationHours })}
      </Text>
    </View>
  );
}
