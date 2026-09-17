import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Pressable, Text, View } from '../../../tw';
import type { PeriodRecencyKey } from '../group-periods-by-recency';

export const PERIOD_SECTION_HEADER_ROW_CLASS =
  'min-h-8 flex-row items-center gap-1.5 px-1';

const CHEVRON_ROTATE_MS = 200;

type PastSectionHeaderProps = {
  title: string;
  expanded: boolean;
  expandA11y: string;
  collapseA11y: string;
  color: string;
  onToggle: () => void;
};

function PastSectionHeader({
  title,
  expanded,
  expandA11y,
  collapseA11y,
  color,
  onToggle,
}: PastSectionHeaderProps) {
  const rotation = useSharedValue(expanded ? 90 : 0);

  useEffect(() => {
    rotation.set(
      withTiming(expanded ? 90 : 0, { duration: CHEVRON_ROTATE_MS }),
    );
  }, [expanded, rotation]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.get()}deg` }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      accessibilityLabel={`${title}. ${expanded ? collapseA11y : expandA11y}`}
      onPress={onToggle}
      className={`${PERIOD_SECTION_HEADER_ROW_CLASS} active:opacity-60`}
      hitSlop={8}
    >
      <Animated.View style={chevronStyle}>
        <Ionicons name="chevron-forward" size={18} color={color} />
      </Animated.View>
      <Text className="font-mono text-lg" style={{ color }}>
        {title}
      </Text>
    </Pressable>
  );
}

type PeriodRecencySectionHeaderProps = {
  sectionKey: PeriodRecencyKey;
  title: string;
  color: string;
  pastExpanded: boolean;
  expandA11y: string;
  collapseA11y: string;
  onTogglePast: () => void;
};

/** Current / Upcoming label, or collapsible Past control. */
export function PeriodRecencySectionHeader({
  sectionKey,
  title,
  color,
  pastExpanded,
  expandA11y,
  collapseA11y,
  onTogglePast,
}: PeriodRecencySectionHeaderProps) {
  if (sectionKey !== 'past') {
    return (
      <View className={PERIOD_SECTION_HEADER_ROW_CLASS}>
        <Text className="font-mono text-lg" style={{ color }}>
          {title}
        </Text>
      </View>
    );
  }

  return (
    <PastSectionHeader
      title={title}
      expanded={pastExpanded}
      expandA11y={expandA11y}
      collapseA11y={collapseA11y}
      color={color}
      onToggle={onTogglePast}
    />
  );
}
