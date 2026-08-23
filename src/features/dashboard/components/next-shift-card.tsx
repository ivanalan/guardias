import { useTheme } from '../../../theme/theme-context';
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
  const { colors } = useTheme();

  return (
    <View
      className="w-full gap-1 px-gutter py-5"
      style={{
        backgroundColor: colors.bg1,
        borderCurve: 'continuous',
        borderRadius: 32,
      }}
    >
      <Text className="font-serif text-5xl" style={{ color: colors.text }}>
        {duration}
      </Text>
      <Text className="font-mono text-base" style={{ color: colors.text }}>
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
