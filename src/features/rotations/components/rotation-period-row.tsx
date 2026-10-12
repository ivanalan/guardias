import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../../theme/theme-context';
import { useWidgetBorderRadius } from '../../../theme/widget-radius';
import { Pressable, Text, View } from '../../../tw';
import { resolveRotationColor } from '../rotation-colors';

export type RotationPeriodRowProps = {
  label: string;
  meta: string;
  color: string;
  /** Friend/secondary period — people icon marks it as secondary viz. */
  showPeopleIcon?: boolean;
  /** Smaller title for dense sheets (e.g. share period picker). */
  compact?: boolean;
  onPress?: () => void;
};

/** Pressable rotation card — full swatch fill, on-color type. */
export function RotationPeriodRow({
  label,
  meta,
  color,
  showPeopleIcon = false,
  compact = false,
  onPress,
}: RotationPeriodRowProps) {
  const { colors } = useTheme();
  const backgroundColor = resolveRotationColor(color, colors);
  const { borderRadius, onLayout } = useWidgetBorderRadius();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onLayout={onLayout}
      className="w-full gap-1 px-gutter py-widget active:opacity-70"
      style={{
        backgroundColor,
        borderCurve: 'continuous',
        borderRadius,
      }}
    >
      <View className="w-full flex-row items-center gap-3">
        {showPeopleIcon ? (
          <Ionicons
            name="people"
            size={compact ? 16 : 20}
            color={colors.onColor}
          />
        ) : null}
        <Text
          className={
            compact
              ? 'min-w-0 flex-1 font-serif text-2xl'
              : 'min-w-0 flex-1 font-serif text-3xl'
          }
          style={{ color: colors.onColor }}
        >
          {label}
        </Text>
      </View>
      <Text
        className={compact ? 'font-mono text-sm' : 'font-mono text-base'}
        style={{ color: colors.onColor }}
      >
        {meta}
      </Text>
    </Pressable>
  );
}
