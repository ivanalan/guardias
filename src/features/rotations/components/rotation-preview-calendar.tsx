import { useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Calendar, type DateData } from 'react-native-calendars';
import { useTranslation } from 'react-i18next';

import type { AppLanguage } from '../../../i18n';
import { listShiftDatesInRange } from '../../../lib/shifts';
import { ANDROID_TEXT_WIDTH_BUMP } from '../../../theme/android-text';
import { BRAND_COLOR } from '../../../theme/brand';
import { Pressable, Text, View } from '../../../tw';
import { buildCalendarDayMarkContext } from '../../calendar/calendar-day-marker';
import { CALENDAR_THEME } from '../../calendar/calendar-theme';
import { createCalendarDayComponent } from '../../calendar/components/calendar-day';
import { CalendarMonthTitle } from '../../calendar/components/calendar-month-title';
import { configureCalendarLocale } from '../../calendar/configure-calendar-locale';
import { buildMonthMarkedDates } from '../../calendar/month-marks';
import { getMonthMarkInputs } from '../../calendar/month-legend-stats';
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

  const monthInputs = datesValid
    ? getMonthMarkInputs([period], currentMonth)
    : {
        shiftMarks: [],
        freeWeekendDates: [],
        vacationDates: [],
      };
  const todayIso = format(new Date(), 'yyyy-MM-dd');
  const markContext = useMemo(
    () =>
      buildCalendarDayMarkContext(
        monthInputs.shiftMarks,
        monthInputs.freeWeekendDates,
        monthInputs.vacationDates,
        null,
        todayIso,
      ),
    [
      monthInputs.shiftMarks,
      monthInputs.freeWeekendDates,
      monthInputs.vacationDates,
      todayIso,
    ],
  );
  const DayComponent = useMemo(
    () => createCalendarDayComponent(markContext),
    [markContext],
  );

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
  const toggleLabel = expanded
    ? t('shifts.form.previewHideCalendar')
    : t('shifts.form.previewShowCalendar');

  return (
    <View className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${t('shifts.form.preview')}. ${countLabel}${
          datesLabel != null ? `. ${datesLabel}` : ''
        }. ${toggleLabel}`}
        onPress={() => setExpanded((prev) => !prev)}
        className="flex-row items-center px-4 py-3.5 active:opacity-70"
      >
        <View className="min-w-0 flex-1 gap-0.5 pr-3">
          <Text className="text-base font-semibold text-neutral-900">
            {countLabel}
          </Text>
          {datesLabel != null ? (
            <Text className="text-sm text-neutral-500">{datesLabel}</Text>
          ) : null}
        </View>
        <View className="shrink-0 flex-row items-center gap-1">
          <Text
            className="shrink-0 text-sm"
            style={[{ color: BRAND_COLOR }, ANDROID_TEXT_WIDTH_BUMP]}
          >
            {toggleLabel}
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
            monthFormat="MMMM"
            markingType="custom"
            markedDates={buildMonthMarkedDates([period], currentMonth)}
            dayComponent={DayComponent}
            renderHeader={(date) => (
              <CalendarMonthTitle date={date} monthFormat="MMMM" />
            )}
            theme={CALENDAR_THEME}
          />
        </View>
      ) : null}
    </View>
  );
}
