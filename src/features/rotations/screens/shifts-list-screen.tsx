import { FlatList, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { FloatingAddButton } from '../components/add-rotation-button';
import { FAB_CLEARANCE } from '../components/fallback-fab';
import { RotationPeriodRow } from '../components/rotation-period-row';
import { ShiftsEmptyState } from '../components/shifts-empty-state';
import { MOCK_ROTATION_PERIODS } from '../data/mock-rotation-periods';
import { formatPeriodRange } from '../format-period-range';
import type { RotationPeriod } from '../types';
import type { AppLanguage } from '../../../i18n';

const isAndroid = process.env.EXPO_OS === 'android';

function keyExtractor(item: RotationPeriod) {
  return item.id;
}

/** Shifts tab list of rotation periods (mock data for this slice). */
export function ShiftsListScreen() {
  const { t, i18n } = useTranslation();
  const language = (i18n.language === 'en' ? 'en' : 'es') as AppLanguage;

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={MOCK_ROTATION_PERIODS}
        keyExtractor={keyExtractor}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          flexGrow: 1,
          gap: 12,
          paddingTop: 12,
          paddingBottom: isAndroid ? FAB_CLEARANCE : 12,
        }}
        ListEmptyComponent={ShiftsEmptyState}
        renderItem={({ item }) => (
          <RotationPeriodRow
            label={item.label}
            dateRange={formatPeriodRange(item.startDate, item.endDate, language)}
          />
        )}
        accessibilityLabel={t('tabs.shifts')}
      />
      {isAndroid ? <FloatingAddButton /> : null}
    </View>
  );
}
