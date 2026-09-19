import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { format, differenceInCalendarDays } from 'date-fns';
import { useTranslation } from 'react-i18next';

import {
  ScreenPageTitle,
  SCREEN_PAGE_TITLE_ICON_SIZE,
} from '../../../components/screen-page-title';
import type { AppLanguage } from '../../../i18n';
import {
  getHomepageShiftStatus,
  getNextFreeWeekend,
  getPeriodDayProgress,
  getPeriodShiftProgress,
  getTimeUntilNextShift,
  listUpcomingShifts,
  type DurationParts,
  type HomepageShiftStatus,
  type PeriodDayProgress,
  type PeriodShiftProgress,
} from '../../../lib/shifts';
import type { TabParamList } from '../../../navigation/types';
import { useTheme } from '../../../theme/theme-context';
import { Pressable, ScrollView, View } from '../../../tw';
import { getRangeMarkInputs } from '../../calendar/month-legend-stats';
import { ShiftsEmptyState } from '../../rotations/components/shifts-empty-state';
import {
  resolveRotationColor,
  resolveShiftMarks,
} from '../../rotations/rotation-colors';
import { useRotations } from '../../rotations/rotations-context';
import type { RotationPeriod } from '../../rotations/types';
import { NextShiftCard } from '../components/next-shift-card';
import { ShiftsLeftCard } from '../components/shifts-left-card';
import { TwoWeekCalendar } from '../components/two-week-calendar';
import { WeekendBanner } from '../components/weekend-banner';
import type { DashboardStackParamList } from '../dashboard-stack';
import {
  formatWeekendRange,
  formatWeekdayLong,
  weekdayInitials,
} from '../format-home-copy';
import { getTwoWeekDates } from '../two-week-dates';

const REFRESH_MS = 60_000;
const UPCOMING_SHIFTS_LIMIT = 4;

type Props = CompositeScreenProps<
  NativeStackScreenProps<DashboardStackParamList, 'HomeHome'>,
  BottomTabScreenProps<TabParamList>
>;

type ActiveHomeProps = {
  status: Exclude<HomepageShiftStatus, { kind: 'idle' }>;
  periods: readonly RotationPeriod[];
  now: Date;
  periodProgress: PeriodShiftProgress;
  dayProgress: PeriodDayProgress;
  language: AppLanguage;
};

function ActiveHomeContent({
  status,
  periods,
  now,
  periodProgress,
  dayProgress,
  language,
}: ActiveHomeProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const untilNext = getTimeUntilNextShift(status, now);
  const freeWeekend = getNextFreeWeekend(status.period, now);
  const todayIso = format(now, 'yyyy-MM-dd');
  const windowDates = getTwoWeekDates(now);
  const windowStart = windowDates[0]!;
  const windowEnd = windowDates[13]!;
  const markInputs = getRangeMarkInputs(periods, windowStart, windowEnd);
  const resolvedShiftMarks = useMemo(
    () => resolveShiftMarks(markInputs.shiftMarks, colors),
    [markInputs.shiftMarks, colors],
  );
  const resolvedSecondaryShiftMarks = useMemo(
    () => resolveShiftMarks(markInputs.secondaryShiftMarks, colors),
    [markInputs.secondaryShiftMarks, colors],
  );
  const shiftColorByDate = useMemo(() => {
    const map = new Map<string, string>();
    for (const { date, color } of resolvedShiftMarks) {
      map.set(date, color);
    }
    return map;
  }, [resolvedShiftMarks]);
  const secondaryShiftColorByDate = useMemo(() => {
    const map = new Map<string, string>();
    for (const { date, color } of resolvedSecondaryShiftMarks) {
      map.set(date, color);
    }
    return map;
  }, [resolvedSecondaryShiftMarks]);
  const freeWeekendDates = new Set(markInputs.freeWeekendDates);
  const vacationDates = new Set(markInputs.vacationDates);
  const remaining = Math.max(
    0,
    periodProgress.total - periodProgress.completed,
  );
  const daysRemaining = Math.max(0, dayProgress.total - dayProgress.completed);
  const color = resolveRotationColor(status.period.color, colors);
  const upcomingItems = listUpcomingShifts(
    status.period,
    now,
    UPCOMING_SHIFTS_LIMIT,
  ).map((shift) => {
    const daysUntil = differenceInCalendarDays(shift.startDateTime, now);
    return {
      dayNumber: format(shift.startDateTime, 'd'),
      weekday: formatWeekdayLong(shift.startDateTime, language),
      relativeLabel:
        daysUntil <= 0
          ? t('home.inDaysToday')
          : t('home.inDays', { count: daysUntil }),
    };
  });

  const durationValue = (duration: DurationParts) =>
    t('home.durationLong', {
      days: duration.days,
      hours: duration.hours,
    });

  const nextShiftCard =
    status.kind === 'in_shift' ? (
      <NextShiftCard
        duration={durationValue(status.remainingInShift)}
        caption={t('home.stats.timeLeft')}
        weekday=""
      />
    ) : untilNext != null && status.kind === 'between_shifts' ? (
      <NextShiftCard
        duration={durationValue(untilNext)}
        caption={`${t('home.nextShift')}: `}
        weekday={formatWeekdayLong(status.nextShift.startDateTime, language)}
      />
    ) : null;

  return (
    <View className="w-full gap-5">
      {freeWeekend != null ? (
        <WeekendBanner
          rangeLabel={formatWeekendRange(freeWeekend.saturdayIso, language)}
          caption={
            freeWeekend.isNow
              ? t('home.stats.now')
              : t('home.stats.nextFreeWeekend')
          }
        />
      ) : null}

      <TwoWeekCalendar
        dates={windowDates}
        weekdayLabels={weekdayInitials(language)}
        todayIso={todayIso}
        shiftColorByDate={shiftColorByDate}
        secondaryShiftColorByDate={secondaryShiftColorByDate}
        freeWeekendDates={freeWeekendDates}
        vacationDates={vacationDates}
        upcomingCaption={t('home.upcomingShifts')}
        upcomingEmptyCaption={t('home.stats.noneInPeriod')}
        upcomingItems={upcomingItems}
        upcomingAccentColor={color}
      />

      <ShiftsLeftCard
        remaining={remaining}
        total={periodProgress.total}
        color={color}
        caption={t('home.shiftsLeft')}
        daysRemaining={daysRemaining}
        daysTotal={dayProgress.total}
        daysCaption={t('home.daysLeft')}
      />

      {nextShiftCard}
    </View>
  );
}

/** F3 homepage: date header + weekend, two-week, remaining, next-shift widgets. */
export function HomeScreen({ navigation }: Props) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const language = (i18n.language === 'en' ? 'en' : 'es') as AppLanguage;
  const { periods } = useRotations();
  const [now, setNow] = useState(() => new Date());

  useFocusEffect(
    useCallback(() => {
      setNow(new Date());
      const id = setInterval(() => {
        setNow(new Date());
      }, REFRESH_MS);
      return () => {
        clearInterval(id);
      };
    }, []),
  );

  const status = getHomepageShiftStatus(periods, now);

  if (status.kind === 'idle') {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.bg }}>
        <ShiftsEmptyState
          onAddPress={() => {
            navigation.navigate('Shifts', { screen: 'AddRotation' });
          }}
        />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow gap-5 px-gutter pb-tab-clearance"
      >
        <View className="-mx-gutter">
          <ScreenPageTitle
            title={status.period.label}
            right={
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('settings.openA11y')}
                onPress={() => {
                  navigation.navigate('Settings');
                }}
                className="px-2 active:opacity-60"
                hitSlop={8}
              >
                <Ionicons
                  name="settings-outline"
                  size={SCREEN_PAGE_TITLE_ICON_SIZE}
                  color={colors.brand}
                />
              </Pressable>
            }
          />
        </View>
        <ActiveHomeContent
          status={status}
          periods={periods}
          now={now}
          periodProgress={getPeriodShiftProgress(status.period, now)}
          dayProgress={getPeriodDayProgress(
            status.period,
            format(now, 'yyyy-MM-dd'),
          )}
          language={language}
        />
      </ScrollView>
    </View>
  );
}
