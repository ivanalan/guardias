import { useMemo } from 'react';
import { Image } from 'react-native';
import { format } from 'date-fns';
import { Calendar } from 'react-native-calendars';
import { useTranslation } from 'react-i18next';

import type { AppLanguage } from '../../../i18n';
import { useTheme } from '../../../theme/theme-context';
import { Text, View } from '../../../tw';
import { weekdayInitials } from '../../dashboard/format-home-copy';
import { formatPeriodRange } from '../../rotations/format-period-range';
import { listShiftMonths } from '../../rotations/list-shift-months';
import { isSecondary } from '../../rotations/period-role';
import { resolveShiftMarks } from '../../rotations/rotation-colors';
import type { RotationPeriod } from '../../rotations/types';
import { buildCalendarDayMarkContext } from '../calendar-day-marker';
import { EMPTY_CALENDAR_FILTER } from '../build-marked-dates';
import {
  CALENDAR_WEEKDAY_LABEL_LINE_HEIGHT,
  calendarThemeFor,
} from '../calendar-theme';
import { createCalendarDayComponent } from './calendar-day';
import { CalendarMonthTitle } from './calendar-month-title';
import { buildMonthMarkedDates } from '../month-marks';
import { getMonthMarkInputs } from '../month-legend-stats';

const APP_ICON = require('../../../../assets/icon.png');
const LOGO_SIZE = 14;

/** Logical width of the captured PNG (physical size follows PixelRatio). */
export const SHARE_IMAGE_WIDTH = 360;

type Props = {
  period: RotationPeriod;
  language: AppLanguage;
};

type MonthCardProps = {
  period: RotationPeriod;
  monthDate: string;
  todayIso: string;
};

function ShareImageMonthCard({ period, monthDate, todayIso }: MonthCardProps) {
  const { colors } = useTheme();
  const { i18n } = useTranslation();
  const language = (i18n.language === 'en' ? 'en' : 'es') as AppLanguage;
  const weekdayLabels = weekdayInitials(language);
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
            null,
            monthInputs.skippedDates,
          ),
    [
      friendShift,
      resolvedShiftMarks,
      resolvedSecondaryShiftMarks,
      monthInputs.freeWeekendDates,
      monthInputs.vacationDates,
      monthInputs.skippedDates,
      todayIso,
    ],
  );
  const DayComponent = useMemo(
    () => createCalendarDayComponent(markContext),
    [markContext],
  );

  return (
    <View
      pointerEvents="none"
      style={{
        backgroundColor: colors.bg1,
        borderCurve: 'continuous',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 12,
        width: SHARE_IMAGE_WIDTH - 40,
      }}
    >
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
          <View style={{ gap: 8, width: '100%' }}>
            <CalendarMonthTitle date={date} monthFormat="MMMM yyyy" />
            <View className="flex-row">
              {weekdayLabels.map((label, index) => (
                <Text
                  key={`${label}-${index}`}
                  className="flex-1 text-center font-mono text-xs"
                  style={{
                    lineHeight: CALENDAR_WEEKDAY_LABEL_LINE_HEIGHT,
                    color: colors.textMuted,
                  }}
                >
                  {label}
                </Text>
              ))}
            </View>
          </View>
        )}
        style={{ backgroundColor: 'transparent' }}
        theme={calendarThemeFor(colors)}
      />
    </View>
  );
}

/**
 * Branded rotation calendar card for `react-native-view-shot` capture.
 * Solid background required — transparent views crash capture on some devices.
 */
export function RotationShareImageCard({ period, language }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const months = useMemo(() => listShiftMonths(period), [period]);
  const todayIso = format(new Date(), 'yyyy-MM-dd');
  const range = formatPeriodRange(period.startDate, period.endDate, language);
  const meta = t('shifts.rowMeta', {
    range,
    letter: period.pattern.offset,
  });

  return (
    <View
      collapsable={false}
      style={{
        width: SHARE_IMAGE_WIDTH,
        backgroundColor: colors.bg,
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 20,
        gap: 16,
      }}
    >
      <View style={{ gap: 6 }}>
        <Text className="font-serif text-4xl" style={{ color: colors.text }}>
          {period.label}
        </Text>
        <Text className="font-mono text-sm" style={{ color: colors.textMuted }}>
          {meta}
        </Text>
      </View>

      <View style={{ gap: 12, alignItems: 'center' }}>
        {months.map((monthDate) => (
          <ShareImageMonthCard
            key={monthDate}
            period={period}
            monthDate={monthDate}
            todayIso={todayIso}
          />
        ))}
      </View>

      <View className="mt-1 flex-row items-center justify-center gap-1.5">
        <Image
          source={APP_ICON}
          style={{ width: LOGO_SIZE, height: LOGO_SIZE, borderRadius: 3 }}
          resizeMode="cover"
        />
        <Text className="font-mono text-xs" style={{ color: colors.textMuted }}>
          DeGuardia
        </Text>
      </View>
    </View>
  );
}
