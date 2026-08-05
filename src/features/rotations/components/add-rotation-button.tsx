import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ShiftsStackParamList } from '../shifts-stack';
import { Pressable } from '../../../tw';

export const FAB_SIZE = 56;
export const FAB_MARGIN = 16;
/** List bottom padding so rows clear the FAB. */
export const FAB_CLEARANCE = FAB_SIZE + FAB_MARGIN * 2;

export function useAddRotationAction() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<ShiftsStackParamList>>();

  return {
    a11yLabel: t('shifts.addA11y'),
    onPress: () => navigation.navigate('AddRotation'),
  };
}

/** Floating add button for the shifts list. */
export function FloatingAddButton() {
  const { a11yLabel, onPress } = useAddRotationAction();
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      accessibilityLabel={a11yLabel}
      accessibilityRole="button"
      onPress={onPress}
      className="absolute h-14 w-14 items-center justify-center rounded-full bg-neutral-900 elevation-8 active:opacity-80"
      style={{
        bottom: Math.max(insets.bottom, FAB_MARGIN) + 8,
        right: FAB_MARGIN,
        borderCurve: 'continuous',
      }}
    >
      <Ionicons name="add" size={28} color="#fff" />
    </Pressable>
  );
}
