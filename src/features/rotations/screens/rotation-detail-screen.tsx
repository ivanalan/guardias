import { useCallback, useLayoutEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import type { AppLanguage } from '../../../i18n';
import {
  getPeriodShiftProgress,
  getPeriodShiftStatus,
  type DurationParts,
  type HomepageShiftStatus,
} from '../../../lib/shifts';
import { useTheme } from '../../../theme/theme-context';
import { Pressable, ScrollView, Text, View } from '../../../tw';
import { NextShiftCard } from '../../dashboard/components/next-shift-card';
import { ShiftsLeftCard } from '../../dashboard/components/shifts-left-card';
import { formatWeekdayLong } from '../../dashboard/format-home-copy';
import { RotationDetailCalendar } from '../components/rotation-detail-calendar';
import { formatFormDate, formatPeriodRange } from '../format-period-range';
import { isSecondary } from '../period-role';
import { resolveRotationColor } from '../rotation-colors';
import { useRotations } from '../rotations-context';
import type { ShiftsStackParamList } from '../shifts-stack';
import type { RotationPeriod } from '../types';

const REFRESH_MS = 60_000;

type Props = NativeStackScreenProps<ShiftsStackParamList, 'RotationDetail'>;

type TemporalKind = 'upcoming' | 'active' | 'past';

function temporalKind(period: RotationPeriod, todayIso: string): TemporalKind {
  if (todayIso < period.startDate) {
    return 'upcoming';
  }
  if (todayIso > period.endDate) {
    return 'past';
  }
  return 'active';
}

function FactCard({
  value,
  caption,
  className,
}: {
  value: string;
  caption: string;
  className?: string;
}) {
  const { colors } = useTheme();
  return (
    <View
      className={className ?? 'w-full gap-1 px-gutter py-5'}
      style={{
        backgroundColor: colors.bg1,
        borderCurve: 'continuous',
        borderRadius: 32,
      }}
    >
      <Text
        className="font-serif text-3xl"
        style={{ color: colors.text }}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      <Text className="font-mono text-sm" style={{ color: colors.text }}>
        {caption}
      </Text>
    </View>
  );
}

function ActiveNextShiftCard({
  status,
  color,
  language,
  durationValue,
}: {
  status: Exclude<HomepageShiftStatus, { kind: 'idle' }>;
  color: string;
  language: AppLanguage;
  durationValue: (duration: DurationParts) => string;
}) {
  const { t } = useTranslation();

  if (status.kind === 'in_shift') {
    return (
      <NextShiftCard
        compact
        duration={durationValue(status.remainingInShift)}
        caption={t('home.stats.timeLeft')}
        weekday=""
        weekdayColor={color}
      />
    );
  }

  return (
    <NextShiftCard
      compact
      duration={durationValue(status.untilStart)}
      caption={`${t('home.nextShift')}: `}
      weekday={formatWeekdayLong(status.nextShift.startDateTime, language)}
      weekdayColor={color}
    />
  );
}

/** Read-only rotation period summary with edit and delete. */
export function RotationDetailScreen({ navigation, route }: Props) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const language = (i18n.language === 'en' ? 'en' : 'es') as AppLanguage;
  const { periods, deletePeriod } = useRotations();
  const period = periods.find((item) => item.id === route.params.periodId);
  const periodId = period?.id;
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

  useLayoutEffect(() => {
    if (periodId == null) {
      navigation.setOptions({ headerRight: undefined });
      return;
    }

    navigation.setOptions({
      headerRight: () => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('shifts.detail.edit')}
          onPress={() => {
            navigation.navigate('EditRotation', { periodId });
          }}
          className="px-2 active:opacity-60"
          hitSlop={8}
        >
          <Ionicons name="create-outline" size={24} color={colors.brand} />
        </Pressable>
      ),
    });
  }, [navigation, periodId, t, colors.brand]);

  if (period == null) {
    return (
      <View
        className="flex-1 items-center justify-center gap-2 p-gutter"
        style={{ backgroundColor: colors.bg }}
      >
        <Text className="text-base" style={{ color: colors.text }}>
          {t('shifts.detail.notFound')}
        </Text>
      </View>
    );
  }

  const isAD = period.pattern.cycleDays === 4;
  const patternTitle = isAD
    ? t('shifts.form.patternADTitle')
    : t('shifts.form.patternACTitle');
  const patternSubtitle = isAD
    ? t('shifts.form.patternADSubtitle')
    : t('shifts.form.patternACSubtitle');
  const subtitle = t('shifts.rowMeta', {
    range: formatPeriodRange(period.startDate, period.endDate, language),
    letter: period.pattern.offset,
  });
  const vacationValue =
    period.vacationStartDate != null && period.vacationEndDate != null
      ? formatPeriodRange(
          period.vacationStartDate,
          period.vacationEndDate,
          language,
        )
      : t('shifts.detail.noVacation');
  const color = resolveRotationColor(period.color, colors);
  const todayIso = format(now, 'yyyy-MM-dd');
  const phase = temporalKind(period, todayIso);
  const periodProgress = getPeriodShiftProgress(period, now);
  const remaining = Math.max(
    0,
    periodProgress.total - periodProgress.completed,
  );
  const status = getPeriodShiftStatus(period, now);

  const durationValue = (duration: DurationParts) =>
    t('home.durationLong', {
      days: duration.days,
      hours: duration.hours,
    });

  const deletePeriodId = period.id;
  const periodLabel = period.label;

  function confirmDelete() {
    Alert.alert(
      t('shifts.detail.deleteConfirmTitle'),
      t('shifts.detail.deleteConfirmBody', { label: periodLabel }),
      [
        { text: t('shifts.detail.deleteCancel'), style: 'cancel' },
        {
          text: t('shifts.detail.delete'),
          style: 'destructive',
          onPress: () => {
            deletePeriod(deletePeriodId);
            navigation.goBack();
          },
        },
      ],
    );
  }

  let statusCard = null;
  if (phase === 'upcoming') {
    statusCard = (
      <FactCard
        value={formatFormDate(period.startDate, language)}
        caption={t('shifts.detail.starts')}
      />
    );
  } else if (phase === 'past') {
    statusCard = (
      <FactCard
        value={formatFormDate(period.endDate, language)}
        caption={t('shifts.detail.ended')}
      />
    );
  } else if (status.kind !== 'idle') {
    statusCard = (
      <ActiveNextShiftCard
        status={status}
        color={color}
        language={language}
        durationValue={durationValue}
      />
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <ScrollView className="flex-1" contentContainerClassName="gap-4 p-gutter">
        <View className="gap-1">
          <View className="w-full flex-row items-center justify-between gap-3">
            <Text
              className="min-w-0 flex-1 font-serif text-5xl tracking-tight"
              style={{ color: colors.text }}
            >
              {period.label}
            </Text>
            {isSecondary(period) ? (
              <Ionicons
                name="people"
                size={24}
                color={colors.text}
                style={{ marginRight: 16 }}
              />
            ) : null}
          </View>
          <Text
            className="font-mono text-base opacity-50"
            style={{ color: colors.text }}
          >
            {subtitle}
          </Text>
        </View>

        <View className="w-full flex-row gap-3">
          <FactCard
            className="min-w-0 flex-1 gap-1 px-gutter py-5"
            value={`${patternTitle} · ${period.pattern.offset}`}
            caption={patternSubtitle}
          />
          <FactCard
            className="min-w-0 flex-1 gap-1 px-gutter py-5"
            value={period.shiftStartTime}
            caption={t('shifts.form.shiftStartTime')}
          />
        </View>

        <ShiftsLeftCard
          compact
          remaining={remaining}
          total={periodProgress.total}
          color={color}
          caption={t('home.shiftsLeft')}
        />

        {statusCard}

        <FactCard
          value={vacationValue}
          caption={t('shifts.detail.vacationLabel')}
        />

        <RotationDetailCalendar period={period} language={language} />
      </ScrollView>

      <View
        className="items-center pt-2"
        style={{ paddingBottom: Math.max(insets.bottom, 8) }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('shifts.detail.delete')}
          onPress={confirmDelete}
          className="flex-row items-center justify-center gap-2 py-4 active:opacity-80"
          style={{
            backgroundColor: colors.brand,
            borderCurve: 'continuous',
            borderRadius: 32,
            paddingHorizontal: 32,
          }}
        >
          <Ionicons name="trash-outline" size={20} color={colors.textInverse} />
          <Text
            className="font-mono text-base font-semibold"
            style={{ color: colors.textInverse }}
          >
            {t('shifts.detail.delete')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
