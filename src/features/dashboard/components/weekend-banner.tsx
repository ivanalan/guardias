import { useTheme } from '../../../theme/theme-context';
import { Text, View } from '../../../tw';

type WeekendBannerProps = {
  rangeLabel: string;
  caption: string;
};

/** Forest-green next-free-weekend widget. */
export function WeekendBanner({ rangeLabel, caption }: WeekendBannerProps) {
  const { colors } = useTheme();

  return (
    <View
      className="w-full gap-1 px-gutter py-5"
      style={{
        backgroundColor: colors.bgWeekend,
        borderCurve: 'continuous',
        borderRadius: 32,
      }}
    >
      <Text className="font-serif text-5xl" style={{ color: colors.onColor }}>
        {rangeLabel}
      </Text>
      <Text className="font-mono text-base" style={{ color: colors.onColor }}>
        {caption}
      </Text>
    </View>
  );
}
