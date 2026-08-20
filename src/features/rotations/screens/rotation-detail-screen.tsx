import { useLayoutEffect } from 'react';
import { Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import type { AppLanguage } from '../../../i18n';
import { getDefaultFirstShiftDate } from '../../../lib/shifts';
import { Pressable, ScrollView, Text, View } from '../../../tw';
import { StatsCard } from '../../dashboard/components/stats-card';
import { StatsCardGrid } from '../../dashboard/components/stats-card-grid';
import { formatFormDate, formatPeriodRange } from '../format-period-range';
import { useRotations } from '../rotations-context';
import type { ShiftsStackParamList } from '../shifts-stack';

type Props = NativeStackScreenProps<ShiftsStackParamList, 'RotationDetail'>;

/** Read-only rotation period summary with edit and delete. */
export function RotationDetailScreen({ navigation, route }: Props) {
  const { t, i18n } = useTranslation();
  const language = (i18n.language === 'en' ? 'en' : 'es') as AppLanguage;
  const { periods, deletePeriod } = useRotations();
  const period = periods.find((item) => item.id === route.params.periodId);
  const periodId = period?.id;

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
          <Ionicons name="create-outline" size={24} color="#191C1A" />
        </Pressable>
      ),
    });
  }, [navigation, periodId, t]);

  if (period == null) {
    return (
      <View className="flex-1 items-center justify-center gap-2 bg-canvas p-gutter">
        <Text className="text-base">{t('shifts.detail.notFound')}</Text>
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
  const dateRange = formatPeriodRange(
    period.startDate,
    period.endDate,
    language,
  );
  const vacationLabel =
    period.vacationStartDate != null && period.vacationEndDate != null
      ? formatPeriodRange(
          period.vacationStartDate,
          period.vacationEndDate,
          language,
        )
      : t('shifts.detail.noVacation');
  const firstShiftIso =
    period.firstShiftDate ??
    getDefaultFirstShiftDate(
      period.startDate,
      period.endDate,
      period.pattern,
    );

  // Locals so the Alert callback keeps narrowed values (TS nest-function quirk).
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

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow gap-8 p-gutter"
      >
        <View className="gap-1">
          <Text className="font-serif text-5xl tracking-tight">
            {period.label}
          </Text>
          <Text className="font-mono text-base opacity-50">{dateRange}</Text>
        </View>

        <StatsCardGrid>
          <StatsCard
            tint="brand"
            icon="sync-outline"
            value={`${patternTitle} · ${period.pattern.offset}`}
            subtitle={patternSubtitle}
          />
          <StatsCard
            tint="indigo"
            icon="time-outline"
            value={period.shiftStartTime}
            subtitle={t('shifts.form.shiftStartTime')}
          />
          <StatsCard
            tint="azure"
            icon="today-outline"
            value={formatFormDate(period.startDate, language)}
            subtitle={t('shifts.form.startDate')}
          />
          <StatsCard
            tint="violet"
            icon="flag-outline"
            value={formatFormDate(period.endDate, language)}
            subtitle={t('shifts.form.endDate')}
          />
          {firstShiftIso != null ? (
            <StatsCard
              fullWidth
              tint="indigo"
              icon="checkmark-circle-outline"
              value={formatFormDate(firstShiftIso, language)}
              subtitle={t('shifts.form.firstShiftDate')}
            />
          ) : null}
          <StatsCard
            fullWidth
            tint="teal"
            icon="umbrella-outline"
            value={vacationLabel}
            subtitle={t('shifts.form.vacation')}
          />
        </StatsCardGrid>

        <View className="mt-auto pt-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('shifts.detail.delete')}
            onPress={confirmDelete}
            className="items-center rounded-xl border border-red-600/80 bg-white px-4 py-3 active:opacity-70"
            style={{ borderCurve: 'continuous' }}
          >
            <Text className="text-base font-medium text-red-600">
              {t('shifts.detail.delete')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
