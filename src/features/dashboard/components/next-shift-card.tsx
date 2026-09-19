import { useTheme } from '../../../theme/theme-context';
import { useWidgetBorderRadius } from '../../../theme/widget-radius';
import { Text, View } from '../../../tw';

type NextShiftCardProps = {
  duration: string;
  caption: string;
  weekday: string;
  /** Smaller type for denser screens (e.g. rotation detail). */
  compact?: boolean;
};

/** Countdown (or time-left) widget; weekday uses body text color. */
export function NextShiftCard({
  duration,
  caption,
  weekday,
  compact = false,
}: NextShiftCardProps) {
  const { colors } = useTheme();
  const { borderRadius, onLayout } = useWidgetBorderRadius();
  const titleClass = 'font-serif text-3xl';
  const captionClass = compact ? 'font-mono text-sm' : 'font-mono text-base';

  return (
    <View
      className="w-full gap-1 px-gutter py-widget"
      onLayout={onLayout}
      style={{
        backgroundColor: colors.bg1,
        borderCurve: 'continuous',
        borderRadius,
      }}
    >
      <Text className={titleClass} style={{ color: colors.text }}>
        {duration}
      </Text>
      <Text className={captionClass} style={{ color: colors.text }}>
        {caption}
        {weekday}
      </Text>
    </View>
  );
}
