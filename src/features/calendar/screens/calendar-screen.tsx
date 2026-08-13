import { useEffect, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Calendar, CalendarList, type DateData } from 'react-native-calendars';
import { useTranslation } from 'react-i18next';

import { ScreenPageTitle } from '../../../components/screen-page-title';
import type { AppLanguage } from '../../../i18n';
import { View } from '../../../tw';
import { toISODate } from '../../rotations/format-period-range';
import { useRotations } from '../../rotations/rotations-context';
import type { CalendarStackParamList } from '../calendar-stack';
import {
  buildMarkedDates,
  type CalendarLegendFilter,
} from '../build-marked-dates';
import { CALENDAR_LIST_THEME, CALENDAR_THEME } from '../calendar-theme';
import type { CalendarViewMode } from '../calendar-view-mode';
import { CalendarMonthLegend } from '../components/calendar-month-legend';
import { CalendarViewToggle } from '../components/calendar-view-toggle';
import { configureCalendarLocale } from '../configure-calendar-locale';
import { getMarkInputsForMonthWindow } from '../month-legend-stats';

type Props = NativeStackScreenProps<CalendarStackParamList, 'CalendarHome'>;

type ListSize = {
  width: number;
  height: number;
};

/** Calendar home: single-month or scrollable list, with legend filter. */
export function CalendarScreen({ navigation }: Props) {
  const { t, i18n } = useTranslation();
  const { periods } = useRotations();
  const language = (i18n.language === 'en' ? 'en' : 'es') as AppLanguage;
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [visibleMonth, setVisibleMonth] = useState(() => toISODate(new Date()));
  // Anchor for CalendarList remount — must not update while scrolling.
  const [scrollAnchor, setScrollAnchor] = useState(visibleMonth);
  const [listSize, setListSize] = useState<ListSize | null>(null);
  const [filter, setFilter] = useState<CalendarLegendFilter>(null);

  useEffect(() => {
    configureCalendarLocale(language, t('calendar.today'));
  }, [language, t]);

  // ±2 months so next/prev (and fast swipe) paints with marks before onMonthChange.
  const monthInputs = getMarkInputsForMonthWindow(periods, visibleMonth, 2);
  const markedDates = buildMarkedDates(
    monthInputs.shiftMarks,
    monthInputs.freeWeekendDates,
    monthInputs.vacationDates,
    filter,
  );

  useEffect(() => {
    if (filter === 'vacation' && monthInputs.vacationDayCount === 0) {
      setFilter(null);
    }
  }, [filter, monthInputs.vacationDayCount]);

  const onViewModeChange = (mode: CalendarViewMode) => {
    if (mode === 'scroll') {
      setScrollAnchor(visibleMonth);
      setFilter(null);
    }
    setViewMode(mode);
  };

  const onDayPress = (day: DateData) => {
    navigation.navigate('DayDetail', { date: day.dateString });
  };

  const onListContainerLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    const next = {
      width: Math.round(width),
      height: Math.round(height),
    };
    if (next.width <= 0 || next.height <= 0) {
      return;
    }
    setListSize((prev) =>
      prev?.width === next.width && prev.height === next.height ? prev : next,
    );
  };

  return (
    <View className="flex-1 bg-neutral-50">
      <ScreenPageTitle
        title={t('tabs.calendar')}
        right={
          <CalendarViewToggle value={viewMode} onChange={onViewModeChange} />
        }
      />
      <View className="flex-1 px-4 pb-4">
        <View
          className={viewMode === 'scroll' ? 'min-h-0 flex-1' : undefined}
          onLayout={onListContainerLayout}
        >
          {viewMode === 'month' ? (
            <Calendar
              key={`month-${language}`}
              current={visibleMonth}
              onMonthChange={(month: DateData) => {
                setVisibleMonth(month.dateString);
              }}
              onDayPress={onDayPress}
              enableSwipeMonths
              firstDay={1}
              markingType="custom"
              markedDates={markedDates}
              theme={CALENDAR_THEME}
            />
          ) : listSize != null ? (
            <CalendarList
              key={`scroll-${language}-${scrollAnchor.slice(0, 7)}`}
              current={scrollAnchor}
              style={{ height: listSize.height }}
              calendarWidth={listSize.width}
              onVisibleMonthsChange={(months: DateData[]) => {
                const primary = months[0];
                if (primary == null) {
                  return;
                }
                setVisibleMonth((prev) =>
                  prev.slice(0, 7) === primary.dateString.slice(0, 7)
                    ? prev
                    : primary.dateString,
                );
              }}
              onDayPress={onDayPress}
              pastScrollRange={24}
              futureScrollRange={24}
              showScrollIndicator
              removeClippedSubviews={false}
              firstDay={1}
              markingType="custom"
              markedDates={markedDates}
              theme={CALENDAR_LIST_THEME}
            />
          ) : null}
        </View>
        {viewMode === 'month' ? (
          <CalendarMonthLegend
            shiftDayCount={monthInputs.shiftDayCount}
            freeWeekendCount={monthInputs.freeWeekendCount}
            vacationDayCount={monthInputs.vacationDayCount}
            filter={filter}
            onFilterChange={setFilter}
          />
        ) : null}
      </View>
    </View>
  );
}
