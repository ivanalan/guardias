import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { getHomepageShiftStatus } from '../../../lib/shifts';
import { Pressable, ScrollView, Text, View } from '../../../tw';
import { useRotations } from '../../rotations/rotations-context';

const REFRESH_MS = 60_000;

export type HomeScreenProps = {
  onOpenCalendar?: () => void;
  onOpenRotations?: () => void;
};

/** F3 homepage: countdown / in-shift status and quick links. */
export function HomeScreen({
  onOpenCalendar,
  onOpenRotations,
}: HomeScreenProps) {
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
    <ScrollView
      className="flex-1 bg-white"
      contentInsetAdjustmentBehavior="automatic"
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
        <View className="gap-3">
          <Text className="text-sm opacity-70">{t('home.nextShift')}</Text>
          <Text className="text-3xl font-semibold">
            {t('home.untilStart', {
              days: status.untilStart.days,
              hours: status.untilStart.hours,
            })}
          </Text>
          <Text className="text-base">
            {t('home.periodLabel', { label: status.period.label })}
          </Text>
          <Text className="text-sm opacity-70">
            {t('home.shiftsRemaining', { count: status.shiftsRemaining })}
          </Text>
        </View>
      ) : null}

      {status.kind === 'in_shift' ? (
        <View className="gap-3">
          <Text className="text-sm opacity-70">{t('home.inShift')}</Text>
          <Text className="text-3xl font-semibold">
            {t('home.remainingInShift', {
              days: status.remainingInShift.days,
              hours: status.remainingInShift.hours,
            })}
          </Text>
          <Text className="text-base">
            {t('home.periodLabel', { label: status.period.label })}
          </Text>
          <Text className="text-sm opacity-70">
            {t('home.shiftsRemaining', { count: status.shiftsRemaining })}
          </Text>
        </View>
      ) : null}

      <View className="gap-3">
        <Pressable
          accessibilityRole="button"
          onPress={onOpenCalendar}
          className="rounded-2xl bg-neutral-100 px-4 py-4 active:opacity-70"
          style={{ borderCurve: 'continuous' }}
        >
          <Text className="text-center text-base font-medium">
            {t('home.openCalendar')}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onOpenRotations}
          className="rounded-2xl bg-neutral-100 px-4 py-4 active:opacity-70"
          style={{ borderCurve: 'continuous' }}
        >
          <Text className="text-center text-base font-medium">
            {t('home.openRotations')}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
