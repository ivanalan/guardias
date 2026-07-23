import { useTranslation } from 'react-i18next';

import { Text, View } from '../../../tw';

/** Shown when there are no rotation periods. */
export function ShiftsEmptyState() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center gap-2 px-8 py-16">
      <Text className="text-center text-lg font-semibold">{t('shifts.emptyTitle')}</Text>
      <Text className="text-center text-sm opacity-60">{t('shifts.emptyBody')}</Text>
    </View>
  );
}
