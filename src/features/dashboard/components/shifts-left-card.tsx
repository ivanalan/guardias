import { useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';

import { useTheme } from '../../../theme/theme-context';
import { Text, View } from '../../../tw';

const MAX_PILLS_PER_ROW = 10;
/** Matches `gap-1` between pills. */
const PILL_GAP = 4;

type ShiftsLeftCardProps = {
  remaining: number;
  total: number;
  color: string;
  caption: string;
};

function pillSizeForRowWidth(rowWidth: number): number {
  return (rowWidth - (MAX_PILLS_PER_ROW - 1) * PILL_GAP) / MAX_PILLS_PER_ROW;
}

/** Remaining/total serif readout with wrapped rows of equal-size pills (max 10 per row). */
export function ShiftsLeftCard({
  remaining,
  total,
  color,
  caption,
}: ShiftsLeftCardProps) {
  const { colors } = useTheme();
  const filled = Math.max(0, Math.min(remaining, total));
  const [gridWidth, setGridWidth] = useState<number | null>(null);

  const onGridLayout = (event: LayoutChangeEvent) => {
    const width = Math.round(event.nativeEvent.layout.width);
    setGridWidth((prev) => (prev === width ? prev : width));
  };

  const pillSize =
    gridWidth != null ? pillSizeForRowWidth(gridWidth) : null;

  return (
    <View
      className="w-full gap-4 px-gutter py-5"
      style={{
        backgroundColor: colors.bg1,
        borderCurve: 'continuous',
        borderRadius: 32,
      }}
    >
      <View className="gap-1">
        <Text className="font-serif text-5xl" style={{ color: colors.text }}>
          <Text className="font-serif text-5xl" style={{ color }}>
            {remaining}
          </Text>
          {' / '}
          {total}
        </Text>
        <Text className="font-mono text-base" style={{ color: colors.text }}>
          {caption}
        </Text>
      </View>
      {total > 0 ? (
        <View className="flex-row flex-wrap gap-1" onLayout={onGridLayout}>
          {pillSize != null
            ? Array.from({ length: total }, (_, index) => (
                <View
                  key={index}
                  style={{
                    width: pillSize,
                    height: pillSize,
                    borderRadius: pillSize / 2,
                    backgroundColor:
                      index < filled ? color : colors.bgPillTrack,
                  }}
                />
              ))
            : null}
        </View>
      ) : null}
    </View>
  );
}
