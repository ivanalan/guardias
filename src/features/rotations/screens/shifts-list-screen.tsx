import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { SectionList } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { ScreenPageTitle } from '../../../components/screen-page-title';
import type { AppLanguage } from '../../../i18n';
import { Pressable, Text, View } from '../../../tw';
import { RotationPeriodRow } from '../components/rotation-period-row';
import { ShiftsEmptyState } from '../components/shifts-empty-state';
import { formatPeriodRange } from '../format-period-range';
import {
  groupPeriodsByRecency,
  type PeriodRecencySection,
} from '../group-periods-by-recency';
import { useRotations } from '../rotations-context';
import type { ShiftsStackParamList } from '../shifts-stack';
import type { RotationPeriod } from '../types';

type Props = NativeStackScreenProps<ShiftsStackParamList, 'ShiftsList'>;

function keyExtractor(item: RotationPeriod) {
  return item.id;
}

/** Shifts tab list of rotation periods. */
export function ShiftsListScreen({ navigation }: Props) {
  const { t, i18n } = useTranslation();
  const language = (i18n.language === 'en' ? 'en' : 'es') as AppLanguage;
  const { periods } = useRotations();
  const todayIso = format(new Date(), 'yyyy-MM-dd');
  const sections = groupPeriodsByRecency(periods, todayIso);

  return (
    <View className="flex-1 bg-neutral-50">
      <ScreenPageTitle
        title={t('tabs.shifts')}
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('shifts.addA11y')}
            onPress={() => {
              navigation.navigate('AddRotation');
            }}
            className="px-2 active:opacity-60"
            hitSlop={8}
          >
            <Ionicons name="add" size={28} color="#191C1A" />
          </Pressable>
        }
      />
      <SectionList
        sections={sections}
        keyExtractor={keyExtractor}
        contentContainerStyle={{
          flexGrow: 1,
          gap: 8,
          paddingHorizontal: 24,
          paddingTop: 12,
          paddingBottom: 12,
        }}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <ShiftsEmptyState
            onAddPress={() => {
              navigation.navigate('AddRotation');
            }}
          />
        }
        renderSectionHeader={({
          section,
        }: {
          section: PeriodRecencySection;
        }) => (
          <Text className="px-1 pt-2 text-sm font-medium text-neutral-500">
            {t(`shifts.${section.titleKey}`)}
          </Text>
        )}
        renderItem={({ item }) => (
          <RotationPeriodRow
            label={item.label}
            dateRange={formatPeriodRange(
              item.startDate,
              item.endDate,
              language,
            )}
            color={item.color}
            onPress={() => {
              navigation.navigate('RotationDetail', { periodId: item.id });
            }}
          />
        )}
        accessibilityLabel={t('tabs.shifts')}
      />
    </View>
  );
}
