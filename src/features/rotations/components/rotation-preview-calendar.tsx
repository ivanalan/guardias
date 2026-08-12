import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Calendar, type DateData } from 'react-native-calendars';
import { useTranslation } from 'react-i18next';

import type { AppLanguage } from '../../../i18n';
import { listShiftDatesInRange } from '../../../lib/shifts';
import { BRAND_COLOR } from '../../../theme/brand';
import { Pressable, Text, View } from '../../../tw';
import { CALENDAR_THEME } from '../../calendar/calendar-theme';
import { configureCalendarLocale } from '../../calendar/configure-calendar-locale';
import { buildMonthMarkedDates } from '../../calendar/month-marks';
import { formatShortFormDate } from '../format-period-range';
import type { RotationPeriod } from '../types';

type Props = {
  period: RotationPeriod;
  language: AppLanguage;
};

const NEXT_SHIFT_TEASER_COUNT = 3;

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

  const shiftDates = listShiftDatesInRange(
    [period],
    period.startDate,
    period.endDate,
  );
  const shiftCount = shiftDates.length;
  const countLabel = t('shifts.form.previewShiftCount', { count: shiftCount });
  const nextDates = shiftDates.slice(0, NEXT_SHIFT_TEASER_COUNT);
  const datesLabel =
    nextDates.length > 0
      ? nextDates.map((iso) => formatShortFormDate(iso, language)).join(', ')
      : null;

  return (
    <View className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${t('shifts.form.preview')}. ${countLabel}${
          datesLabel != null ? `. ${datesLabel}` : ''
        }`}
        onPress={() => setExpanded((prev) => !prev)}
        className="flex-row items-center justify-between px-4 py-3.5 active:opacity-70"
      >
        <View className="flex-1 gap-0.5 pr-3">
          <Text className="text-base font-semibold text-neutral-900">
            {countLabel}
          </Text>
          {datesLabel != null ? (
            <Text className="text-sm text-neutral-500">{datesLabel}</Text>
          ) : null}
        </View>
        <View className="flex-row items-center gap-1">
          <Text className="text-sm" style={{ color: BRAND_COLOR }}>
            {expanded
              ? t('shifts.form.previewHideCalendar')
              : t('shifts.form.previewShowCalendar')}
          </Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={BRAND_COLOR}
          />
        </View>
      </Pressable>

      {expanded ? (
        <View className="border-t border-neutral-100 px-1 pb-2">
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
        </View>
      ) : null}
    </View>
  );
}
