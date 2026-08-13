import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { ScreenPageTitle } from '../../../components/screen-page-title';
import {
  getHomepageShiftStatus,
  getNextFreeWeekend,
  getPeriodShiftProgress,
  getTimeUntilNextShift,
  type DurationParts,
  type HomepageShiftStatus,
  type PeriodShiftProgress,
} from '../../../lib/shifts';
import type { TabParamList } from '../../../navigation/types';
import { getAccentTints } from '../../../theme/accent-tints';
import { Pressable, ScrollView, Text, View } from '../../../tw';
import { ShiftsEmptyState } from '../../rotations/components/shifts-empty-state';
import { useRotations } from '../../rotations/rotations-context';
import type { DashboardStackParamList } from '../dashboard-stack';
import { ShiftsProgressRing } from '../components/shifts-progress-ring';
import { StatsCard } from '../components/stats-card';
import { StatsCardGrid } from '../components/stats-card-grid';

const REFRESH_MS = 60_000;

type Props = CompositeScreenProps<
  NativeStackScreenProps<DashboardStackParamList, 'HomeHome'>,
  BottomTabScreenProps<TabParamList>
>;

type ActiveHomeProps = {
  status: Exclude<HomepageShiftStatus, { kind: 'idle' }>;
  now: Date;
  periodProgress: PeriodShiftProgress;
};

function ActiveHomeContent({ status, now, periodProgress }: ActiveHomeProps) {
  const { t } = useTranslation();
  const untilNext = getTimeUntilNextShift(status, now);
  const freeWeekend = getNextFreeWeekend(status.period, now);
  const accents = getAccentTints(status.period.color);

  const durationValue = (duration: DurationParts) =>
    t('home.durationShort', {
      days: duration.days,
      hours: duration.hours,
    });

  return (
    <View className="w-full gap-8">
      <View className="items-center gap-8 py-2">
        <Text className="text-center text-lg font-medium">
          {t('home.periodLabel', { label: status.period.label })}
        </Text>
        <ShiftsProgressRing
          progress={periodProgress.progress}
          color={accents.brand}
        >
          <View className="items-center gap-1">
            <Text className="text-center text-4xl font-bold tracking-tight">
              {periodProgress.completed}
              <Text className="text-xl font-semibold opacity-40">
                {t('home.progressOf', { total: periodProgress.total })}
              </Text>
            </Text>
            <Text className="text-center text-sm opacity-60">
              {t('home.shiftsCompleted')}
            </Text>
          </View>
        </ShiftsProgressRing>
      </View>

      <StatsCardGrid>
        {status.kind === 'in_shift' ? (
          <StatsCard
            fullWidth
            accents={accents}
            tint="violet"
            icon="clock-outline"
            value={durationValue(status.remainingInShift)}
            subtitle={t('home.stats.timeLeft')}
          />
        ) : null}

        {untilNext != null ? (
          <StatsCard
            accents={accents}
            tint="brand"
            icon="calendar-clock"
            value={durationValue(untilNext)}
            subtitle={t('home.stats.timeUntilNext')}
          />
        ) : null}

        <StatsCard
          accents={accents}
          tint="indigo"
          icon="clipboard-list-outline"
          value={String(status.shiftsRemaining)}
          subtitle={t('home.stats.shiftsRemaining')}
        />

        <StatsCard
          accents={accents}
          tint="azure"
          icon="clipboard-check-outline"
          value={String(periodProgress.completed)}
          subtitle={t('home.stats.shiftsWorked')}
        />

        {freeWeekend != null ? (
          <StatsCard
            accents={accents}
            tint="teal"
            icon="umbrella-beach"
            value={
              freeWeekend.isNow
                ? t('home.stats.now')
                : durationValue(freeWeekend.until)
            }
            subtitle={t('home.stats.nextFreeWeekend')}
          />
        ) : (
          <StatsCard
            accents={accents}
            tint="teal"
            icon="umbrella-beach"
            value="—"
            subtitle={t('home.stats.noneInPeriod')}
          />
        )}
      </StatsCardGrid>
    </View>
  );
}

/** F3 homepage: period progress ring + stats card grid. */
export function HomeScreen({ navigation }: Props) {
  const { t } = useTranslation();
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

  return (
    <View className="flex-1 bg-neutral-50">
      <ScreenPageTitle
        title={t('tabs.home')}
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
              size={24}
              color="#191C1A"
            />
          </Pressable>
        }
      />
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow gap-8 p-6"
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
          />
        )}
      </ScrollView>
    </View>
  );
}
