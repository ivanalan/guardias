import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Calendar, type DateData } from 'react-native-calendars';
import { useTranslation } from 'react-i18next';

import type { AppLanguage } from '../../../i18n';
import { listShiftDatesInRange } from '../../../lib/shifts';
import { Pressable, Text, View } from '../../../tw';
import { CALENDAR_THEME } from '../../calendar/calendar-theme';
import { configureCalendarLocale } from '../../calendar/configure-calendar-locale';
import { buildMonthMarkedDates } from '../../calendar/month-marks';
import type { RotationPeriod } from '../types';

type Props = {
  period: RotationPeriod;
  language: AppLanguage;
};

function monthKey(isoDate: string): string {
  return isoDate.slice(0, 7);
}

/** Collapsible read-only month calendar preview for the add/edit rotation form. */
export function RotationPreviewCalendar({ period, language }: Props) {
  const { t } = useTranslation();
  const datesValid = period.startDate < period.endDate;
  const [expanded, setExpanded] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(period.startDate);

  useEffect(() => {
    configureCalendarLocale(language, t('calendar.today'));
  }, [language, t]);

  useEffect(() => {
    setCurrentMonth((prev) =>
      monthKey(prev) === monthKey(period.startDate) ? prev : period.startDate,
    );
  }, [period.startDate]);

  if (!datesValid) {
    return null;
  }

  const shiftCount = listShiftDatesInRange(
    [period],
    period.startDate,
    period.endDate,
  ).length;
  const countLabel = t('shifts.form.previewShiftCount', { count: shiftCount });

  return (
    <View className="gap-2">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${t('shifts.form.preview')}. ${countLabel}`}
        onPress={() => setExpanded((prev) => !prev)}
        className="flex-row items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 active:opacity-70"
        style={{ borderCurve: 'continuous' }}
      >
        <View className="flex-1 gap-0.5 pr-3">
          <Text className="text-sm font-medium text-neutral-600">
            {t('shifts.form.preview')}
          </Text>
          <Text className="text-sm text-neutral-500">{countLabel}</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#737373"
        />
      </Pressable>

      {expanded ? (
        <Calendar
          key={`${language}-${monthKey(period.startDate)}`}
          current={currentMonth}
          onMonthChange={(month: DateData) => {
            setCurrentMonth(month.dateString);
          }}
          enableSwipeMonths
          firstDay={1}
          markingType="custom"
          markedDates={buildMonthMarkedDates([period], currentMonth)}
          theme={CALENDAR_THEME}
        />
      ) : null}
    </View>
  );
}
