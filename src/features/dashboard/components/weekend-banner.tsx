import { useTheme } from '../../../theme/theme-context';
import { useWidgetBorderRadius } from '../../../theme/widget-radius';
import { Text, View } from '../../../tw';

type WeekendBannerProps = {
  rangeLabel: string;
  caption: string;
};

/** Forest-green next-free-weekend widget. */
export function WeekendBanner({ rangeLabel, caption }: WeekendBannerProps) {
  const { colors } = useTheme();
  const { borderRadius, onLayout } = useWidgetBorderRadius();

  return (
    <View
      className="w-full gap-1 px-gutter py-widget"
      onLayout={onLayout}
      style={{
        backgroundColor: colors.bgWeekend,
        borderCurve: 'continuous',
        borderRadius,
      }}
    >
      <Text className="font-serif text-3xl" style={{ color: colors.onColor }}>
        {rangeLabel}
      </Text>
      <Text className="font-mono text-base" style={{ color: colors.onColor }}>
        {caption}
      </Text>
    </View>
  );
}
