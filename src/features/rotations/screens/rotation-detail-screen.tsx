import { Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import type { AppLanguage } from '../../../i18n';
import { Pressable, Text, View } from '../../../tw';
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

  if (period == null) {
    return (
      <View className="flex-1 items-center justify-center gap-2 bg-white p-6">
        <Text className="text-base">{t('shifts.detail.notFound')}</Text>
      </View>
    );
  }

  const patternLabel =
    period.pattern.cycleDays === 4
      ? t('shifts.form.patternAD')
      : t('shifts.form.patternAC');
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

  // Locals so the Alert callback keeps narrowed values (TS nest-function quirk).
  const periodId = period.id;
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
            deletePeriod(periodId);
            navigation.goBack();
          },
        },
      ],
    );
  }

  return (
    <View className="flex-1 gap-6 bg-white p-6">
      <View className="gap-1">
        <Text className="text-2xl font-semibold">{period.label}</Text>
        <Text className="text-base opacity-70">{dateRange}</Text>
      </View>

      <DetailRow
        label={t('shifts.form.schedule')}
        value={`${patternLabel} · ${period.pattern.offset}`}
      />
      <DetailRow
        label={t('shifts.form.shiftStartTime')}
        value={period.shiftStartTime}
      />
      <DetailRow label={t('shifts.form.vacation')} value={vacationLabel} />
      <DetailRow
        label={t('shifts.form.startDate')}
        value={formatFormDate(period.startDate, language)}
      />
      <DetailRow
        label={t('shifts.form.endDate')}
        value={formatFormDate(period.endDate, language)}
      />

      <View className="mt-auto gap-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('shifts.detail.edit')}
          onPress={() => {
            navigation.navigate('EditRotation', { periodId });
          }}
          className="items-center rounded-xl bg-neutral-900 px-4 py-3 active:opacity-80"
          style={{ borderCurve: 'continuous' }}
        >
          <Text className="text-base font-medium text-white">
            {t('shifts.detail.edit')}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('shifts.detail.delete')}
          onPress={confirmDelete}
          className="items-center rounded-xl border border-red-600 px-4 py-3 active:opacity-70"
          style={{ borderCurve: 'continuous' }}
        >
          <Text className="text-base font-medium text-red-600">
            {t('shifts.detail.delete')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="gap-1">
      <Text className="text-sm opacity-70">{label}</Text>
      <Text className="text-base">{value}</Text>
    </View>
  );
}
