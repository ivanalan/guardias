import { useTheme } from '../../../theme/theme-context';
import { Pressable, Text, View } from '../../../tw';

export type RotationPeriodRowProps = {
  label: string;
  meta: string;
  color: string;
  onPress?: () => void;
};

/** Pressable rotation card — full swatch fill, on-color type. */
export function RotationPeriodRow({
  label,
  meta,
  color,
  onPress,
}: RotationPeriodRowProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="w-full gap-1 px-gutter py-6 active:opacity-70"
      style={{
        backgroundColor: color,
        borderCurve: 'continuous',
        borderRadius: 32,
      }}
    >
      <Text
        className="font-serif text-5xl"
        style={{ color: colors.onColor }}
      >
        {label}
      </Text>
      <Text className="font-mono text-base" style={{ color: colors.onColor }}>
        {meta}
      </Text>
    </Pressable>
  );
}
