import { Modal, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { AppLanguage } from '../../../i18n';
import { Pressable, Text, View } from '../../../tw';
import { formatPeriodRange } from '../../rotations/format-period-range';
import type { RotationPeriod } from '../../rotations/types';

type Props = {
  visible: boolean;
  periods: readonly RotationPeriod[];
  language: AppLanguage;
  onSelect: (period: RotationPeriod) => void;
  onCancel: () => void;
  /** Fired after the modal finish dismissing (needed on iOS before share sheet). */
  onDismiss?: () => void;
};

/** Modal list to pick which rotation period to export as .ics. */
export function ExportPeriodPickerModal({
  visible,
  periods,
  language,
  onSelect,
  onCancel,
  onDismiss,
}: Props) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      onDismiss={onDismiss}
    >
      <View className="flex-1 justify-end bg-black/40">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('calendar.sharePickCancel')}
          onPress={onCancel}
          className="absolute inset-0"
        />
        <View className="w-full max-h-[70%] rounded-t-3xl bg-neutral-50 px-4 pb-8 pt-4">
          <Text className="mb-3 px-2 text-xl font-bold">
            {t('calendar.sharePickTitle')}
          </Text>
          <ScrollView>
            <View className="gap-2 pb-2">
              {periods.map((period) => (
                <Pressable
                  key={period.id}
                  accessibilityRole="button"
                  onPress={() => {
                    onSelect(period);
                  }}
                  className="w-full flex-row items-center gap-4 border border-neutral-200 bg-white px-5 py-4 active:opacity-70"
                  style={{
                    borderRadius: 16,
                    borderCurve: 'continuous',
                  }}
                >
                  <View
                    accessibilityElementsHidden
                    importantForAccessibility="no"
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: period.color,
                    }}
                  />
                  <View className="min-w-0 flex-1 gap-0.5">
                    <Text className="text-lg font-semibold">
                      {period.label}
                    </Text>
                    <Text className="text-sm opacity-50">
                      {formatPeriodRange(
                        period.startDate,
                        period.endDate,
                        language,
                      )}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          <Pressable
            accessibilityRole="button"
            onPress={onCancel}
            className="mt-2 items-center py-3 active:opacity-60"
          >
            <Text className="text-base font-medium opacity-60">
              {t('calendar.sharePickCancel')}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
