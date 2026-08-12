import { Pressable, Text } from '../../../tw';

export type RotationPeriodRowProps = {
  label: string;
  dateRange: string;
  onPress?: () => void;
};

/** Pressable card for a rotation period — same shell as home StatsCard. */
export function RotationPeriodRow({
  label,
  dateRange,
  onPress,
}: RotationPeriodRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="w-full gap-1 border border-neutral-200 bg-white px-6 py-6 active:opacity-70"
      style={{
        borderRadius: 18,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      }}
    >
      <Text className="text-2xl font-bold tracking-tight">{label}</Text>
      <Text className="text-sm opacity-50">{dateRange}</Text>
    </Pressable>
  );
}
