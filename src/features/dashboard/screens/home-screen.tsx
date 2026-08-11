import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { ScreenPageTitle } from '../../../components/screen-page-title';
import {
  getHomepageShiftStatus,
  getPeriodShiftProgress,
  type DurationParts,
  type PeriodShiftProgress,
} from '../../../lib/shifts';
import { Pressable, ScrollView, Text, View } from '../../../tw';
import { useRotations } from '../../rotations/rotations-context';
import type { DashboardStackParamList } from '../dashboard-stack';
import { ShiftsProgressRing } from '../components/shifts-progress-ring';

const REFRESH_MS = 60_000;

type Props = NativeStackScreenProps<DashboardStackParamList, 'HomeHome'>;

type ActiveHomeProps = {
  statusLabel: string;
  duration: DurationParts;
  periodLabel: string;
  shiftsRemaining: number;
  periodProgress: PeriodShiftProgress;
};

function ActiveHomeHero({
  statusLabel,
  duration,
  periodLabel,
  shiftsRemaining,
  periodProgress,
}: ActiveHomeProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center gap-8 py-4">
      <ShiftsProgressRing progress={periodProgress.progress}>
        <View className="items-center gap-1">
          <Text className="text-center text-sm opacity-60">{statusLabel}</Text>
          <Text className="text-center text-3xl font-bold tracking-tight">
            {t('home.durationShort', {
              days: duration.days,
              hours: duration.hours,
            })}
          </Text>
        </View>
      </ShiftsProgressRing>
      <View className="items-center gap-2">
        <Text className="text-5xl font-bold tracking-tight">
          {periodProgress.completed}
          <Text className="text-2xl font-semibold opacity-40">
            {t('home.progressOf', { total: periodProgress.total })}
          </Text>
        </Text>
        <Text className="text-center text-sm opacity-60">
          {t('home.shiftsCompleted')}
        </Text>
        <Text className="text-center text-base font-medium">
          {t('home.periodLabel', { label: periodLabel })}
        </Text>
        <Text className="text-center text-sm opacity-60">
          {t('home.shiftsRemaining', { count: shiftsRemaining })}
        </Text>
      </View>
    </View>
  );
}

/** F3 homepage: countdown / in-shift status with period progress ring. */
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
    <View className="flex-1 bg-white">
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
          <View className="flex-1 items-center justify-center gap-2 py-16">
            <Text className="text-center text-lg font-semibold">
              {t('home.emptyTitle')}
            </Text>
            <Text className="text-center text-sm opacity-60">
              {t('home.emptyBody')}
            </Text>
          </View>
        ) : null}

        {status.kind === 'between_shifts' ? (
          <ActiveHomeHero
            statusLabel={t('home.nextShift')}
            duration={status.untilStart}
            periodLabel={status.period.label}
            shiftsRemaining={status.shiftsRemaining}
            periodProgress={getPeriodShiftProgress(status.period, now)}
          />
        ) : null}

        {status.kind === 'in_shift' ? (
          <ActiveHomeHero
            statusLabel={t('home.inShift')}
            duration={status.remainingInShift}
            periodLabel={status.period.label}
            shiftsRemaining={status.shiftsRemaining}
            periodProgress={getPeriodShiftProgress(status.period, now)}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}
