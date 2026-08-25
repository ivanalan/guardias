import { useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Calendar, type DateData } from 'react-native-calendars';
import { useTranslation } from 'react-i18next';

import type { AppLanguage } from '../../../i18n';
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
  selectedFirstShift: string;
  onSelectFirstShift: (iso: string) => void;
};

function monthKey(isoDate: string): string {
  return isoDate.slice(0, 7);
}

function isWithinPeriod(
  iso: string,
  startDate: string,
  endDate: string,
): boolean {
  return iso >= startDate && iso <= endDate;
}

/** First-shift field + expandable calendar; tap a day to set the pattern. */
export function FirstShiftCalendar({
  period,
  language,
  selectedFirstShift,
  onSelectFirstShift,
}: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const datesValid = period.startDate < period.endDate;
  const [expanded, setExpanded] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(selectedFirstShift);

  useEffect(() => {
    configureCalendarLocale(language, t('calendar.today'));
  }, [language, t]);

  useEffect(() => {
    setCurrentMonth((prev) =>
      monthKey(prev) === monthKey(selectedFirstShift)
        ? prev
        : selectedFirstShift,
    );
  }, [selectedFirstShift]);

  const monthInputs = datesValid
    ? getMonthMarkInputs([period], currentMonth)
    : {
        shiftMarks: [],
        secondaryShiftMarks: [],
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
        new Set(),
        todayIso,
        selectedFirstShift,
        [],
      ),
    [
      resolvedShiftMarks,
      monthInputs.freeWeekendDates,
      monthInputs.vacationDates,
      todayIso,
      selectedFirstShift,
    ],
  );
  const DayComponent = useMemo(
    () => createCalendarDayComponent(markContext),
    [markContext],
  );

  const valueLabel = formatFormDate(selectedFirstShift, language);
  const fieldLabel = t('shifts.form.firstShiftDate');
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

  const onDayPress = (day: DateData) => {
    if (!isWithinPeriod(day.dateString, period.startDate, period.endDate)) {
      return;
    }
    onSelectFirstShift(day.dateString);
  };

  return (
    <View className="gap-1.5">
      <Text
        className="mb-0.5 font-mono text-sm"
        style={{ ...ANDROID_TEXT_WIDTH_BUMP, color: colors.text }}
      >
        {fieldLabel}
      </Text>
      <Text
        className="font-mono text-sm"
        style={{ ...ANDROID_TEXT_WIDTH_BUMP, color: colors.textMuted }}
      >
        {t('shifts.form.firstShiftHint')}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${fieldLabel}: ${valueLabel}. ${toggleLabel}`}
        onPress={() => setExpanded((prev) => !prev)}
        className="h-14 flex-row items-center rounded-xl px-4 active:opacity-70"
        style={{
          borderCurve: 'continuous',
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.bg1,
        }}
      >
        <Text
          className="min-w-0 flex-1 pr-2 font-mono text-base"
          numberOfLines={1}
          style={{ ...ANDROID_TEXT_WIDTH_BUMP, color: colors.text }}
        >
          {valueLabel}
        </Text>
        <Ionicons name="calendar-outline" size={18} color={colors.brand} />
      </Pressable>

      {expanded && datesValid ? (
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
            onDayPress={onDayPress}
            minDate={period.startDate}
            maxDate={period.endDate}
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
