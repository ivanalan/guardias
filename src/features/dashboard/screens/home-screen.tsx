import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { ScreenPageTitle, SCREEN_PAGE_TITLE_ICON_SIZE } from '../../../components/screen-page-title';
import type { AppLanguage } from '../../../i18n';
import {
  getHomepageShiftStatus,
  getNextFreeWeekend,
  getPeriodShiftProgress,
  getTimeUntilNextShift,
  listShiftDatesInRange,
  type DurationParts,
  type HomepageShiftStatus,
  type PeriodShiftProgress,
} from '../../../lib/shifts';
import type { TabParamList } from '../../../navigation/types';
import { INK_COLOR } from '../../../theme/brand';
import { Pressable, ScrollView, View } from '../../../tw';
import { listFreeWeekendDates } from '../../calendar/free-weekends';
import { ShiftsEmptyState } from '../../rotations/components/shifts-empty-state';
import { useRotations } from '../../rotations/rotations-context';
import { NextShiftCard } from '../components/next-shift-card';
import { ShiftsLeftCard } from '../components/shifts-left-card';
import { TwoWeekCalendar } from '../components/two-week-calendar';
import { WeekendBanner } from '../components/weekend-banner';
import type { DashboardStackParamList } from '../dashboard-stack';
import {
  formatHomeDateTitle,
  formatWeekendRange,
  formatWeekdayLong,
  weekdayInitials,
} from '../format-home-copy';
import { getTwoWeekDates } from '../two-week-dates';

const REFRESH_MS = 60_000;

type Props = CompositeScreenProps<
  NativeStackScreenProps<DashboardStackParamList, 'HomeHome'>,
  BottomTabScreenProps<TabParamList>
>;

type ActiveHomeProps = {
  status: Exclude<HomepageShiftStatus, { kind: 'idle' }>;
  now: Date;
  periodProgress: PeriodShiftProgress;
  language: AppLanguage;
};

function ActiveHomeContent({
  status,
  now,
  periodProgress,
  language,
}: ActiveHomeProps) {
  const { t } = useTranslation();
  const untilNext = getTimeUntilNextShift(status, now);
  const freeWeekend = getNextFreeWeekend(status.period, now);
  const todayIso = format(now, 'yyyy-MM-dd');
  const windowDates = getTwoWeekDates(now);
  const windowStart = windowDates[0]!;
  const windowEnd = windowDates[13]!;
  const shiftList = listShiftDatesInRange(
    [status.period],
    windowStart,
    windowEnd,
  );
  const shiftDates = new Set(shiftList);
  const freeWeekendDates = new Set(
    listFreeWeekendDates(shiftDates, windowStart, windowEnd),
  );
  const remaining = Math.max(
    0,
    periodProgress.total - periodProgress.completed,
  );
  const color = status.period.color;

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
        weekdayColor={color}
      />
    ) : untilNext != null && status.kind === 'between_shifts' ? (
      <NextShiftCard
        duration={durationValue(untilNext)}
        caption={`${t('home.nextShift')}: `}
        weekday={formatWeekdayLong(status.nextShift.startDateTime, language)}
        weekdayColor={color}
      />
    ) : null;

  return (
    <View className="w-full gap-4">
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
        shiftDates={shiftDates}
        freeWeekendDates={freeWeekendDates}
        shiftColor={color}
      />

      <ShiftsLeftCard
        remaining={remaining}
        total={periodProgress.total}
        color={color}
        caption={t('home.shiftsLeft')}
      />

      {nextShiftCard}
    </View>
  );
}

/** F3 homepage: date header + weekend, two-week, remaining, next-shift widgets. */
export function HomeScreen({ navigation }: Props) {
  const { t, i18n } = useTranslation();
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
  const subtitle =
    status.kind === 'idle' ? undefined : status.period.label;

  return (
    <View className="flex-1 bg-canvas">
      <ScreenPageTitle
        title={formatHomeDateTitle(now, language)}
        subtitle={subtitle}
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
            <MaterialCommunityIcons
              name="cog-outline"
              size={SCREEN_PAGE_TITLE_ICON_SIZE}
              color={INK_COLOR}
            />
          </Pressable>
        }
      />
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow gap-4 p-gutter"
      >
        {status.kind === 'idle' ? (
          <ShiftsEmptyState
            onAddPress={() => {
              navigation.navigate('Shifts', { screen: 'AddRotation' });
            }}
          />
        ) : (
          <ActiveHomeContent
            status={status}
            now={now}
            periodProgress={getPeriodShiftProgress(status.period, now)}
            language={language}
          />
        )}
      </ScrollView>
    </View>
  );
}
