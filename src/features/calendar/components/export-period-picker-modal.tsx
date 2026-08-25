import { Modal, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { AppLanguage } from '../../../i18n';
import { useTheme } from '../../../theme/theme-context';
import { Pressable, Text, View } from '../../../tw';
import { RotationPeriodRow } from '../../rotations/components/rotation-period-row';
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
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      onDismiss={onDismiss}
    >
      <View
        className="flex-1 justify-end"
        style={{ backgroundColor: colors.scrim }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('calendar.sharePickCancel')}
          onPress={onCancel}
          className="absolute inset-0"
        />
        <View
          className="w-full max-h-[70%] rounded-t-3xl px-4 pb-8 pt-4"
          style={{ backgroundColor: colors.bg }}
        >
          <Text
            className="mb-3 px-2 font-serif text-3xl"
            style={{ color: colors.text }}
          >
            {t('calendar.sharePickTitle')}
          </Text>
          <ScrollView>
            <View className="gap-3 pb-2">
              {periods.map((period) => (
                <RotationPeriodRow
                  key={period.id}
                  label={period.label}
                  meta={t('shifts.rowMeta', {
                    range: formatPeriodRange(
                      period.startDate,
                      period.endDate,
                      language,
                    ),
                    letter: period.pattern.offset,
                  })}
                  color={period.color}
                  showPeopleIcon={period.role === 'secondary'}
                  onPress={() => {
                    onSelect(period);
                  }}
                />
              ))}
            </View>
          </ScrollView>
          <Pressable
            accessibilityRole="button"
            onPress={onCancel}
            className="mt-2 items-center py-3 active:opacity-60"
          >
            <Text
              className="text-base font-medium opacity-60"
              style={{ color: colors.text }}
            >
              {t('calendar.sharePickCancel')}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
