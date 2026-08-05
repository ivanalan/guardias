import { Pressable, Text, View } from '../../../tw';

export type RotationPeriodRowProps = {
  label: string;
  dateRange: string;
  onPress?: () => void;
};

/** NativeWind pressable row for a rotation period. */
export function RotationPeriodRow({
  label,
  dateRange,
  onPress,
}: RotationPeriodRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="mx-4 shadow-xs rounded-2xl bg-white px-4 py-4 active:opacity-70"
      style={{ borderCurve: 'continuous' }}
    >
      <View className="gap-2">
        <Text className="text-2xl font-bold">{label}</Text>
        <Text className="text-sm text-gray-900">{dateRange}</Text>
      </View>
    </Pressable>
  );
}
