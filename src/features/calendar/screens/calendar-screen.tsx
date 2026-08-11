import { useEffect, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Calendar, type DateData } from 'react-native-calendars';
import { useTranslation } from 'react-i18next';

import { ScreenPageTitle } from '../../../components/screen-page-title';
import type { AppLanguage } from '../../../i18n';
import { View } from '../../../tw';
import { toISODate } from '../../rotations/format-period-range';
import { useRotations } from '../../rotations/rotations-context';
import type { CalendarStackParamList } from '../calendar-stack';
import { CALENDAR_MARK_COLORS } from '../calendar-mark-colors';
import { configureCalendarLocale } from '../configure-calendar-locale';
import { buildMonthMarkedDates } from '../month-marks';

type Props = NativeStackScreenProps<CalendarStackParamList, 'CalendarHome'>;

/** Monthly calendar with shift and free-weekend marks. */
export function CalendarScreen({ navigation }: Props) {
  const { t, i18n } = useTranslation();
  const { periods } = useRotations();
  const language = (i18n.language === 'en' ? 'en' : 'es') as AppLanguage;
  const [currentMonth, setCurrentMonth] = useState(toISODate(new Date()));

  useEffect(() => {
    configureCalendarLocale(language, t('calendar.today'));
  }, [language, t]);

  const markedDates = buildMonthMarkedDates(periods, currentMonth);

  return (
    <View className="flex-1 bg-white">
      <ScreenPageTitle title={t('tabs.calendar')} />
      <View className="flex-1 px-4 pb-4">
        <Calendar
          key={language}
          current={currentMonth}
          onMonthChange={(month: DateData) => {
            setCurrentMonth(month.dateString);
          }}
          onDayPress={(day: DateData) => {
            navigation.navigate('DayDetail', { date: day.dateString });
          }}
          enableSwipeMonths
          firstDay={1}
          markingType="custom"
          markedDates={markedDates}
          theme={{
            todayTextColor: CALENDAR_MARK_COLORS.shiftBackground,
            arrowColor: CALENDAR_MARK_COLORS.shiftBackground,
            selectedDayBackgroundColor: CALENDAR_MARK_COLORS.shiftBackground,
            selectedDayTextColor: '#ffffff',
            monthTextColor: '#1C1B1F',
            textSectionTitleColor: '#49454F',
            dayTextColor: '#1C1B1F',
            textDisabledColor: '#C4C4C4',
          }}
        />
      </View>
    </View>
  );
}
