import { useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { Calendar } from 'react-native-calendars';
import { useTranslation } from 'react-i18next';

import type { AppLanguage } from '../../../i18n';
import { useTheme } from '../../../theme/theme-context';
import { Text, View } from '../../../tw';
import { buildCalendarDayMarkContext } from '../../calendar/calendar-day-marker';
import { EMPTY_CALENDAR_FILTER } from '../../calendar/build-marked-dates';
import {
  calendarCardStyle,
  calendarListCardHeight,
  calendarThemeFor,
  weeksInCalendarMonth,
} from '../../calendar/calendar-theme';
import { createCalendarDayComponent } from '../../calendar/components/calendar-day';
import { CalendarMonthTitle } from '../../calendar/components/calendar-month-title';
import { configureCalendarLocale } from '../../calendar/configure-calendar-locale';
import { getMonthMarkInputs } from '../../calendar/month-legend-stats';
import { buildMonthMarkedDates } from '../../calendar/month-marks';
import { listShiftMonths } from '../list-shift-months';
import { isSecondary } from '../period-role';
import { resolveShiftMarks } from '../rotation-colors';
import type { RotationPeriod } from '../types';

type Props = {
  period: RotationPeriod;
  language: AppLanguage;
};

type MonthCardProps = {
  period: RotationPeriod;
  monthDate: string;
  todayIso: string;
};

function RotationDetailMonthCard({
  period,
  monthDate,
  todayIso,
}: MonthCardProps) {
  const { colors } = useTheme();
  const friendShift = isSecondary(period);
  const monthInputs = getMonthMarkInputs([period], monthDate);
  const resolvedShiftMarks = useMemo(
    () => resolveShiftMarks(monthInputs.shiftMarks, colors),
    [monthInputs.shiftMarks, colors],
  );
  const resolvedSecondaryShiftMarks = useMemo(
    () => resolveShiftMarks(monthInputs.secondaryShiftMarks, colors),
    [monthInputs.secondaryShiftMarks, colors],
  );
  const markContext = useMemo(
    () =>
      friendShift
        ? buildCalendarDayMarkContext(
            [],
            [],
            [],
            EMPTY_CALENDAR_FILTER,
            todayIso,
            null,
            resolvedSecondaryShiftMarks,
          )
        : buildCalendarDayMarkContext(
            resolvedShiftMarks,
            monthInputs.freeWeekendDates,
            monthInputs.vacationDates,
            EMPTY_CALENDAR_FILTER,
            todayIso,
            null,
            [],
          ),
    [
      friendShift,
      resolvedShiftMarks,
      resolvedSecondaryShiftMarks,
      monthInputs.freeWeekendDates,
      monthInputs.vacationDates,
      todayIso,
    ],
  );
  const DayComponent = useMemo(
    () => createCalendarDayComponent(markContext),
    [markContext],
  );

  return (
    <View pointerEvents="none">
      <Calendar
        key={monthDate}
        current={monthDate}
        enableSwipeMonths={false}
        hideArrows
        hideDayNames
        firstDay={1}
        monthFormat="MMMM yyyy"
        markingType="custom"
        markedDates={buildMonthMarkedDates([period], monthDate)}
        dayComponent={DayComponent}
        renderHeader={(date) => (
          <CalendarMonthTitle date={date} monthFormat="MMMM yyyy" />
        )}
        style={calendarCardStyle(
          colors,
          calendarListCardHeight(weeksInCalendarMonth(monthDate)),
        )}
        theme={calendarThemeFor(colors)}
      />
    </View>
  );
}

/** Read-only month cards for shifts in a single rotation period. */
export function RotationDetailCalendar({ period, language }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const months = useMemo(() => listShiftMonths(period), [period]);
  const todayIso = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    configureCalendarLocale(language, t('calendar.today'));
  }, [language, t]);

  if (months.length === 0) {
    return null;
  }

  return (
    <View className="gap-4">
      <Text
        className="font-serif text-3xl"
        style={{ color: colors.text }}
        accessibilityRole="header"
      >
        {t('shifts.detail.calendarSection')}
      </Text>
      <View className="gap-5">
        {months.map((monthDate) => (
          <RotationDetailMonthCard
            key={monthDate}
            period={period}
            monthDate={monthDate}
            todayIso={todayIso}
          />
        ))}
      </View>
    </View>
  );
}
