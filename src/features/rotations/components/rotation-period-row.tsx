import { Pressable, Text, View } from '../../../tw';

export type RotationPeriodRowProps = {
  label: string;
  meta: string;
  color: string;
  onPress?: () => void;
};

/** Pressable rotation card — full swatch fill, white type. */
export function RotationPeriodRow({
  label,
  meta,
  color,
  onPress,
}: RotationPeriodRowProps) {
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
      <Text className="font-serif text-5xl text-white">{label}</Text>
      <Text className="font-mono text-base text-white">{meta}</Text>
    </Pressable>
  );
}
