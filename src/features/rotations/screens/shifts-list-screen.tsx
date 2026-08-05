import { FlatList } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import type { AppLanguage } from '../../../i18n';
import { View } from '../../../tw';
import { FAB_CLEARANCE, FloatingAddButton } from '../components/add-rotation-button';
import { RotationPeriodRow } from '../components/rotation-period-row';
import { ShiftsEmptyState } from '../components/shifts-empty-state';
import { formatPeriodRange } from '../format-period-range';
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

  return (
    <View className="flex-1">
      <FlatList
        data={periods}
        keyExtractor={keyExtractor}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          flexGrow: 1,
          gap: 12,
          paddingTop: 12,
          paddingBottom: FAB_CLEARANCE,
        }}
        ListEmptyComponent={ShiftsEmptyState}
        renderItem={({ item }) => (
          <RotationPeriodRow
            label={item.label}
            dateRange={formatPeriodRange(item.startDate, item.endDate, language)}
            onPress={() => {
              navigation.navigate('RotationDetail', { periodId: item.id });
            }}
          />
        )}
        accessibilityLabel={t('tabs.shifts')}
      />
      <FloatingAddButton />
    </View>
  );
}
