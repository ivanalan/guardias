import { useTheme } from '../../../theme/theme-context';
import { Text, View } from '../../../tw';

type NextShiftCardProps = {
  duration: string;
  caption: string;
  weekday: string;
  weekdayColor: string;
  /** Smaller type for denser screens (e.g. rotation detail). */
  compact?: boolean;
};

/** Countdown (or time-left) widget with a highlighted weekday. */
export function NextShiftCard({
  duration,
  caption,
  weekday,
  weekdayColor,
  compact = false,
}: NextShiftCardProps) {
  const { colors } = useTheme();
  const titleClass = compact ? 'font-serif text-3xl' : 'font-serif text-5xl';
  const captionClass = compact ? 'font-mono text-sm' : 'font-mono text-base';

  return (
    <View
      className="w-full gap-1 px-gutter py-5"
      style={{
        backgroundColor: colors.bg1,
        borderCurve: 'continuous',
        borderRadius: 32,
      }}
    >
      <Text className={titleClass} style={{ color: colors.text }}>
        {duration}
      </Text>
      <Text className={captionClass} style={{ color: colors.text }}>
        {caption}
        {weekday ? (
          <Text className={captionClass} style={{ color: weekdayColor }}>
            {weekday}
          </Text>
        ) : null}
      </Text>
    </View>
  );
}
