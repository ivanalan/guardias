import { Pressable, Text, View } from '../../../tw';

type Props = {
  label: string;
  dateRange: string;
  onPress?: () => void;
};

/** Single rotation period row for the Shifts list. */
export function RotationPeriodRow({ label, dateRange, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="mx-4 rounded-2xl border border-black/10 bg-white px-4 py-3 active:opacity-70"
      style={{ borderCurve: 'continuous' }}
    >
      <View className="gap-4">
        <Text className="text-smxs font-bold">{label}</Text>
        <Text className="text-sm opacity-80">{dateRange}</Text>
      </View>
    </Pressable>
  );
}
