import { useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Calendar, type DateData } from 'react-native-calendars';
import { useTranslation } from 'react-i18next';

import type { AppLanguage } from '../../../i18n';
import { listShiftDatesInRange } from '../../../lib/shifts';
import { parseCalendarDate } from '../../../lib/shifts/parse-calendar-date';
import { ANDROID_TEXT_WIDTH_BUMP } from '../../../theme/android-text';
import { useTheme } from '../../../theme/theme-context';
import { Pressable, Text, View } from '../../../tw';
import { buildCalendarDayMarkContext } from '../../calendar/calendar-day-marker';
import { calendarThemeFor } from '../../calendar/calendar-theme';
import { createCalendarDayComponent } from '../../calendar/components/calendar-day';
import { CalendarMonthHeader } from '../../calendar/components/calendar-month-header';
import { configureCalendarLocale } from '../../calendar/configure-calendar-locale';
import { buildMonthMarkedDates } from '../../calendar/month-marks';
import { getMonthMarkInputs } from '../../calendar/month-legend-stats';
import { resolveShiftMarks } from '../rotation-colors';
import { formatFormDate, toISODate } from '../format-period-range';
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
  const { colors } = useTheme();
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
  const resolvedShiftMarks = useMemo(
    () => resolveShiftMarks(monthInputs.shiftMarks, colors),
    [monthInputs.shiftMarks, colors],
  );
  const todayIso = format(new Date(), 'yyyy-MM-dd');
  const markContext = useMemo(
    () =>
      buildCalendarDayMarkContext(
        resolvedShiftMarks,
        monthInputs.freeWeekendDates,
        monthInputs.vacationDates,
        null,
        todayIso,
      ),
    [
      resolvedShiftMarks,
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
  const datesLabel =
    shiftDates.length > 0
      ? shiftDates.map((iso) => formatFormDate(iso, language)).join(', ')
      : null;
  const toggleLabel = expanded
    ? t('shifts.form.previewHideCalendar')
    : t('shifts.form.previewShowCalendar');

  const onPreviousMonth = () => {
    setCurrentMonth((prev) => {
      const date = parseCalendarDate(prev);
      return toISODate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
    });
  };

  const onNextMonth = () => {
    setCurrentMonth((prev) => {
      const date = parseCalendarDate(prev);
      return toISODate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
    });
  };

  return (
    <View className="gap-1.5">
      <Text
        className="font-mono text-sm"
        style={{ ...ANDROID_TEXT_WIDTH_BUMP, color: colors.text }}
      >
        {countLabel}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${t('shifts.form.preview')}. ${countLabel}${
          datesLabel != null ? `. ${datesLabel}` : ''
        }. ${toggleLabel}`}
        onPress={() => setExpanded((prev) => !prev)}
        className="h-14 flex-row items-center rounded-xl px-4 active:opacity-70"
        style={{
          borderCurve: 'continuous',
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.bg1,
        }}
      >
        {datesLabel != null ? (
          <Text
            className="min-w-0 flex-1 pr-2 font-mono text-base"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ ...ANDROID_TEXT_WIDTH_BUMP, color: colors.text }}
          >
            {datesLabel}
          </Text>
        ) : (
          <View className="flex-1" />
        )}
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.brand}
        />
      </Pressable>

      {expanded ? (
        <View
          className="overflow-hidden rounded-xl px-3 py-5"
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.bg1,
          }}
        >
          <Calendar
            key={`${language}-${monthKey(currentMonth)}`}
            current={currentMonth}
            onMonthChange={(month: DateData) => {
              setCurrentMonth(month.dateString);
            }}
            enableSwipeMonths
            hideArrows
            firstDay={1}
            monthFormat="MMMM"
            markingType="custom"
            markedDates={buildMonthMarkedDates([period], currentMonth)}
            dayComponent={DayComponent}
            renderHeader={(date) => (
              <CalendarMonthHeader
                date={date}
                monthFormat="MMMM"
                onPreviousMonth={onPreviousMonth}
                onNextMonth={onNextMonth}
              />
            )}
            theme={calendarThemeFor(colors)}
          />
        </View>
      ) : null}
    </View>
  );
}
