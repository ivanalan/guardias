import { useEffect, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Calendar, type DateData } from 'react-native-calendars';
import { useTranslation } from 'react-i18next';

import { ScreenPageTitle } from '../../../components/screen-page-title';
import type { AppLanguage } from '../../../i18n';
import { Pressable, View } from '../../../tw';
import { toISODate } from '../../rotations/format-period-range';
import { useRotations } from '../../rotations/rotations-context';
import type { CalendarStackParamList } from '../calendar-stack';
import {
  buildMarkedDates,
  type CalendarLegendFilter,
} from '../build-marked-dates';
import { CALENDAR_THEME } from '../calendar-theme';
import { CalendarMonthLegend } from '../components/calendar-month-legend';
import { configureCalendarLocale } from '../configure-calendar-locale';
import { getMonthMarkInputs } from '../month-legend-stats';

type Props = NativeStackScreenProps<CalendarStackParamList, 'CalendarHome'>;

/** Monthly calendar with shift and free-weekend marks and legend filter. */
export function CalendarScreen({ navigation }: Props) {
  const { t, i18n } = useTranslation();
  const { periods } = useRotations();
  const language = (i18n.language === 'en' ? 'en' : 'es') as AppLanguage;
  const [currentMonth, setCurrentMonth] = useState(toISODate(new Date()));
  const [filter, setFilter] = useState<CalendarLegendFilter>(null);

  useEffect(() => {
    configureCalendarLocale(language, t('calendar.today'));
  }, [language, t]);

  const monthInputs = getMonthMarkInputs(periods, currentMonth);
  const markedDates = buildMarkedDates(
    monthInputs.shiftsInMonth,
    monthInputs.freeWeekendDates,
    filter,
  );

  const clearFilter = () => {
    setFilter(null);
  };

  return (
    <Pressable
      accessibilityRole="none"
      className="flex-1 bg-neutral-50"
      onPress={clearFilter}
    >
      <ScreenPageTitle title={t('tabs.calendar')} />
      <View className="flex-1 px-4 pb-4" pointerEvents="box-none">
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
          theme={CALENDAR_THEME}
        />
        <CalendarMonthLegend
          shiftDayCount={monthInputs.shiftDayCount}
          freeWeekendCount={monthInputs.freeWeekendCount}
          filter={filter}
          onFilterChange={setFilter}
        />
      </View>
    </Pressable>
  );
}
