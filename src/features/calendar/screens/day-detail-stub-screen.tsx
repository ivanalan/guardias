import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import type { AppLanguage } from '../../../i18n';
import { Text, View } from '../../../tw';
import { formatFormDate } from '../../rotations/format-period-range';
import type { CalendarStackParamList } from '../calendar-stack';

type Props = NativeStackScreenProps<CalendarStackParamList, 'DayDetailStub'>;

/** Placeholder day sheet — real free/shift detail comes later. */
export function DayDetailStubScreen({ route }: Props) {
  const { t, i18n } = useTranslation();
  const language = (i18n.language === 'en' ? 'en' : 'es') as AppLanguage;
  const dateLabel = formatFormDate(route.params.date, language);

  return (
    <View className="flex-1 gap-3 bg-white p-6">
      <Text className="text-xl font-semibold">{dateLabel}</Text>
      <Text className="text-sm opacity-70">{t('calendar.dayDetailComingSoon')}</Text>
    </View>
  );
}
