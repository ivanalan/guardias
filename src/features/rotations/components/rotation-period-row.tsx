import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../../theme/theme-context';
import { Pressable, Text, View } from '../../../tw';
import { resolveRotationColor } from '../rotation-colors';

export type RotationPeriodRowProps = {
  label: string;
  meta: string;
  color: string;
  /** Friend/secondary period — people icon marks it as secondary viz. */
  showPeopleIcon?: boolean;
  onPress?: () => void;
};

/** Pressable rotation card — full swatch fill, on-color type. */
export function RotationPeriodRow({
  label,
  meta,
  color,
  showPeopleIcon = false,
  onPress,
}: RotationPeriodRowProps) {
  const { colors } = useTheme();
  const backgroundColor = resolveRotationColor(color, colors);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="w-full gap-1 px-gutter py-6 active:opacity-70"
      style={{
        backgroundColor,
        borderCurve: 'continuous',
        borderRadius: 32,
      }}
    >
      <View className="w-full flex-row items-center justify-between gap-3">
        <Text
          className="min-w-0 flex-1 font-serif text-5xl"
          style={{ color: colors.onColor }}
        >
          {label}
        </Text>
        {showPeopleIcon ? (
          <Ionicons name="people" size={24} color={colors.onColor} />
        ) : null}
      </View>
      <Text className="font-mono text-base" style={{ color: colors.onColor }}>
        {meta}
      </Text>
    </Pressable>
  );
}
