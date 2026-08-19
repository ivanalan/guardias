import { Text, View } from '../../../tw';

type NextShiftCardProps = {
  duration: string;
  caption: string;
  weekday: string;
  weekdayColor: string;
};

/** Countdown (or time-left) widget with a highlighted weekday. */
export function NextShiftCard({
  duration,
  caption,
  weekday,
  weekdayColor,
}: NextShiftCardProps) {
  return (
    <View
      className="w-full gap-1 bg-white px-gutter py-5"
      style={{ borderCurve: 'continuous', borderRadius: 32 }}
    >
      <Text className="font-serif text-5xl text-ink">{duration}</Text>
      <Text className="font-mono text-base text-ink">
        {caption}
        {weekday ? (
          <Text className="font-mono text-base" style={{ color: weekdayColor }}>
            {weekday}
          </Text>
        ) : null}
      </Text>
    </View>
  );
}
