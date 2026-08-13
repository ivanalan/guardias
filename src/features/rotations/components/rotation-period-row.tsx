import { Pressable, Text, View } from '../../../tw';

export type RotationPeriodRowProps = {
  label: string;
  dateRange: string;
  color: string;
  onPress?: () => void;
};

/** Pressable card for a rotation period — same shell as home StatsCard. */
export function RotationPeriodRow({
  label,
  dateRange,
  color,
  onPress,
}: RotationPeriodRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="w-full flex-row items-center gap-4 border border-neutral-200 bg-white px-6 py-6 active:opacity-70"
      style={{
        borderRadius: 18,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      }}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no"
        style={{
          width: 14,
          height: 14,
          borderRadius: 7,
          backgroundColor: color,
        }}
      />
      <View className="min-w-0 flex-1 gap-1">
        <Text className="text-2xl font-bold tracking-tight">{label}</Text>
        <Text className="text-sm opacity-50">{dateRange}</Text>
      </View>
    </Pressable>
  );
}
