import * as Haptics from 'expo-haptics';
import { useRef, useState } from 'react';
import type {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView as RNScrollView,
} from 'react-native';

import { useTheme } from '../../../theme/theme-context';
import { Pressable, ScrollView, Text, View } from '../../../tw';
import { GRID_SLOT_HEIGHT, layoutMarks } from './layout-marks';

const PAGER_DOT_SIZE = 6;

type LeftMode = 'shifts' | 'days';

type MarksPageModel = {
  remaining: number;
  total: number;
  caption: string;
  color: string;
};

type ShiftsLeftCardProps = {
  remaining: number;
  total: number;
  color: string;
  caption: string;
  /** When set with daysTotal + daysCaption, enables swipe/tap toggle to days. */
  daysRemaining?: number;
  daysTotal?: number;
  daysCaption?: string;
  /** Smaller type for denser screens (e.g. rotation detail). */
  compact?: boolean;
};

type MarksPageProps = MarksPageModel & {
  width?: number;
  onPress?: () => void;
  compact?: boolean;
};

function MarksPage({
  remaining,
  total,
  color,
  caption,
  width,
  onPress,
  compact = false,
}: MarksPageProps) {
  const { colors } = useTheme();
  const filled = Math.max(0, Math.min(remaining, total));
  const [gridWidth, setGridWidth] = useState<number | null>(null);
  const titleClass = compact ? 'font-serif text-3xl' : 'font-serif text-5xl';
  const captionClass = compact ? 'font-mono text-sm' : 'font-mono text-base';

  const onGridLayout = (event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    setGridWidth((prev) => (prev === nextWidth ? prev : nextWidth));
  };

  const layout =
    gridWidth != null && gridWidth > 0
      ? layoutMarks(total, gridWidth, GRID_SLOT_HEIGHT)
      : null;

  const content = (
    <>
      <View className="gap-1">
        <Text className={titleClass} style={{ color: colors.text }}>
          <Text className={titleClass} style={{ color }}>
            {remaining}
          </Text>
          {' / '}
          {total}
        </Text>
        <Text className={captionClass} style={{ color: colors.text }}>
          {caption}
        </Text>
      </View>
      <View
        className="justify-center"
        style={{ height: GRID_SLOT_HEIGHT }}
        onLayout={onGridLayout}
      >
        {layout != null && layout.renderTotal > 0
          ? Array.from({ length: layout.rows }, (_, row) => (
              <View
                key={row}
                className="flex-row"
                style={{
                  gap: layout.gap,
                  marginTop: row === 0 ? 0 : layout.gap,
                }}
              >
                {Array.from({ length: layout.cols }, (_, col) => {
                  const index = row * layout.cols + col;
                  if (index >= layout.renderTotal) {
                    return null;
                  }
                  return (
                    <View
                      key={index}
                      style={{
                        width: layout.markSize,
                        height: layout.markSize,
                        borderRadius: layout.markSize / 2,
                        backgroundColor:
                          index < filled ? color : colors.bgPillTrack,
                      }}
                    />
                  );
                })}
              </View>
            ))
          : null}
      </View>
    </>
  );

  if (onPress != null) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        className="gap-4 px-gutter"
        style={width != null ? { width } : undefined}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View
      className="gap-4 px-gutter"
      style={width != null ? { width } : undefined}
    >
      {content}
    </View>
  );
}

/** Remaining/total serif readout with mark grid; optional swipe/tap to days left. */
export function ShiftsLeftCard({
  remaining,
  total,
  color,
  caption,
  daysRemaining,
  daysTotal,
  daysCaption,
  compact = false,
}: ShiftsLeftCardProps) {
  const { colors } = useTheme();
  const canToggle =
    daysRemaining != null && daysTotal != null && daysCaption != null;
  const scrollRef = useRef<RNScrollView>(null);
  const [mode, setMode] = useState<LeftMode>('shifts');
  const [pageWidth, setPageWidth] = useState(0);

  const pages: MarksPageModel[] = [
    { remaining, total, color, caption },
    ...(canToggle
      ? [
          {
            remaining: daysRemaining,
            total: daysTotal,
            color,
            caption: daysCaption,
          },
        ]
      : []),
  ];

  const onCardLayout = (event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    setPageWidth((prev) => (prev === nextWidth ? prev : nextWidth));
  };

  const goToMode = (next: LeftMode) => {
    if (!canToggle || pageWidth === 0) {
      return;
    }
    const index = next === 'shifts' ? 0 : 1;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMode(next);
    scrollRef.current?.scrollTo({ x: index * pageWidth, animated: true });
  };

  const onMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    if (pageWidth === 0) {
      return;
    }
    const index = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
    const next: LeftMode = index >= 1 ? 'days' : 'shifts';
    if (next === mode) {
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMode(next);
  };

  const cardStyle = {
    backgroundColor: colors.bg1,
    borderCurve: 'continuous' as const,
    borderRadius: 32,
  };

  if (!canToggle) {
    return (
      <View className="w-full gap-4 py-5" style={cardStyle}>
        <MarksPage {...pages[0]!} compact={compact} />
      </View>
    );
  }

  return (
    <View className="w-full gap-4 py-5" style={cardStyle} onLayout={onCardLayout}>
      {pageWidth > 0 ? (
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          nestedScrollEnabled
          directionalLockEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          bounces={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
        >
          <MarksPage
            {...pages[0]!}
            compact={compact}
            width={pageWidth}
            onPress={() => goToMode('days')}
          />
          <MarksPage
            {...pages[1]!}
            compact={compact}
            width={pageWidth}
            onPress={() => goToMode('shifts')}
          />
        </ScrollView>
      ) : null}
      <View className="flex-row items-center justify-center gap-2">
        {(['shifts', 'days'] as const).map((page) => (
          <View
            key={page}
            style={{
              width: PAGER_DOT_SIZE,
              height: PAGER_DOT_SIZE,
              borderRadius: PAGER_DOT_SIZE / 2,
              backgroundColor:
                mode === page ? colors.text : colors.bgPillTrack,
            }}
          />
        ))}
      </View>
    </View>
  );
}
