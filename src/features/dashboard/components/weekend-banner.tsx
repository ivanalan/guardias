import { Text, View } from '../../../tw';
import { WEEKEND_COLOR } from '../../../theme/brand';

type WeekendBannerProps = {
  rangeLabel: string;
  caption: string;
};

/** Forest-green next-free-weekend widget. */
export function WeekendBanner({ rangeLabel, caption }: WeekendBannerProps) {
  return (
    <View
      className="w-full gap-1 px-gutter py-5"
      style={{
        backgroundColor: WEEKEND_COLOR,
        borderCurve: 'continuous',
        borderRadius: 32,
      }}
    >
      <Text className="font-serif text-5xl text-white">{rangeLabel}</Text>
      <Text className="font-mono text-base text-white">{caption}</Text>
    </View>
  );
}
