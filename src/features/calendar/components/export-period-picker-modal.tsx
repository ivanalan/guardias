import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { Modal, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { AppLanguage } from '../../../i18n';
import { useTheme } from '../../../theme/theme-context';
import { Pressable, Text, View } from '../../../tw';
import { PeriodRecencySectionHeader } from '../../rotations/components/period-recency-section-header';
import { RotationPeriodRow } from '../../rotations/components/rotation-period-row';
import { formatPeriodRange } from '../../rotations/format-period-range';
import { groupPeriodsByRecency } from '../../rotations/group-periods-by-recency';
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
  const [pastExpanded, setPastExpanded] = useState(false);
  const todayIso = format(new Date(), 'yyyy-MM-dd');
  const sections = groupPeriodsByRecency(periods, todayIso);

  useEffect(() => {
    if (visible) {
      setPastExpanded(false);
    }
  }, [visible]);

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
          className="w-full max-h-[70%] rounded-t-3xl px-4 pb-8 pt-6"
          style={{ backgroundColor: colors.bg }}
        >
          <Text
            className="mb-4 px-2 font-serif text-4xl"
            style={{ color: colors.text }}
          >
            {t('calendar.sharePickTitle')}
          </Text>
          <ScrollView>
            <View className="gap-5 pb-2">
              {sections.map((section) => {
                const items =
                  section.key === 'past' && !pastExpanded ? [] : section.data;

                return (
                  <View key={section.key} className="gap-3">
                    <PeriodRecencySectionHeader
                      sectionKey={section.key}
                      title={t(`shifts.${section.titleKey}`)}
                      color={colors.text}
                      pastExpanded={pastExpanded}
                      expandA11y={t('shifts.sectionPastExpandA11y')}
                      collapseA11y={t('shifts.sectionPastCollapseA11y')}
                      onTogglePast={() => setPastExpanded((prev) => !prev)}
                    />
                    {items.map((period) => (
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
                        compact
                        onPress={() => {
                          onSelect(period);
                        }}
                      />
                    ))}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
