import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { BRAND_COLOR, BRAND_SELECTION } from '../../../theme/brand';
import { Pressable, Text, View } from '../../../tw';

type ShiftsEmptyStateProps = {
  onAddPress: () => void;
};

/** Shown when there are no rotation periods (Home + Shifts). */
export function ShiftsEmptyState({ onAddPress }: ShiftsEmptyStateProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center gap-3 px-8 py-16">
      <View
        className="items-center justify-center"
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          borderCurve: 'continuous',
          backgroundColor: BRAND_SELECTION.background,
        }}
      >
        <MaterialCommunityIcons
          name="clipboard-plus-outline"
          size={36}
          color={BRAND_COLOR}
        />
      </View>
      <Text className="text-center text-xl font-semibold tracking-tight">
        {t('shifts.emptyTitle')}
      </Text>
      <Text className="text-center text-base opacity-60">
        {t('shifts.emptyBody')}
      </Text>

      <Pressable
        accessibilityRole="link"
        accessibilityLabel={t('shifts.emptyCta')}
        onPress={onAddPress}
        className="active:opacity-60"
        hitSlop={8}
      >
        <Text
          className="text-base font-semibold"
          style={{ color: BRAND_COLOR }}
        >
          {t('shifts.emptyCta')}
        </Text>
      </Pressable>
    </View>
  );
}
