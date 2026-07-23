import { FallbackFab, useAddRotationAction } from './fallback-fab';

/** Non-Android FAB stub (inline-style Pressable). */
export function FloatingAddButton() {
  const { a11yLabel, onPress } = useAddRotationAction();
  return <FallbackFab onPress={onPress} a11yLabel={a11yLabel} />;
}
