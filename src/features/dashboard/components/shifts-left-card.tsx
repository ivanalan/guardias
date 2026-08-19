import { PILL_TRACK_COLOR } from '../../../theme/brand';
import { Text, View } from '../../../tw';

type ShiftsLeftCardProps = {
  remaining: number;
  total: number;
  color: string;
  caption: string;
};

/** Remaining/total serif readout with a row of vertical pills. */
export function ShiftsLeftCard({
  remaining,
  total,
  color,
  caption,
}: ShiftsLeftCardProps) {
  const filled = Math.max(0, Math.min(remaining, total));

  return (
    <View
      className="w-full gap-4 bg-white px-gutter py-5"
      style={{ borderCurve: 'continuous', borderRadius: 32 }}
    >
      <View className="gap-1">
        <Text className="font-serif text-5xl text-ink">
          <Text className="font-serif text-5xl" style={{ color }}>
            {remaining}
          </Text>
          /{total}
        </Text>
        <Text className="font-mono text-base text-ink">{caption}</Text>
      </View>
      {total > 0 ? (
        <View className="flex-row gap-1">
          {Array.from({ length: total }, (_, index) => (
            <View
              key={index}
              className="h-8 flex-1"
              style={{
                borderRadius: 999,
                backgroundColor: index < filled ? color : PILL_TRACK_COLOR,
              }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
