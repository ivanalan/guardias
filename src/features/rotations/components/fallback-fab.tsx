import { Alert, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const FAB_SIZE = 56;
export const FAB_MARGIN = 16;
/** List bottom padding so rows clear the FAB. */
export const FAB_CLEARANCE = FAB_SIZE + FAB_MARGIN * 2;

export function useAddRotationAction() {
  const { t } = useTranslation();
  return {
    a11yLabel: t('shifts.addA11y'),
    onPress: () => Alert.alert(t('shifts.comingSoon')),
  };
}

/** RN Pressable FAB — Expo Go / Compose fallback. Inline styles for reliable layout. */
export function FallbackFab({
  onPress,
  a11yLabel,
}: {
  onPress: () => void;
  a11yLabel: string;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      accessibilityLabel={a11yLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.fab,
        { bottom: Math.max(insets.bottom, FAB_MARGIN) + 8, right: FAB_MARGIN },
      ]}
    >
      <Ionicons name="add" size={28} color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: 50,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
});
