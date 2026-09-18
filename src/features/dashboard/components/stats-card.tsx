import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import { useTheme } from '../../../theme/theme-context';
import { useWidgetBorderRadius } from '../../../theme/widget-radius';
import { Text, View } from '../../../tw';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type StatsCardProps = {
  /** Period / accent calendar color for the icon. */
  iconColor: string;
  icon: IconName;
  value: string;
  subtitle: string;
  fullWidth?: boolean;
};

/** Soft metric card: tinted icon, large value, subtitle. */
export function StatsCard({
  iconColor,
  icon,
  value,
  subtitle,
  fullWidth = false,
}: StatsCardProps) {
  const { colors } = useTheme();
  const { borderRadius, onLayout } = useWidgetBorderRadius();

  return (
    <View
      className={`gap-3 border px-gutter py-widget ${fullWidth ? 'w-full' : 'min-w-[46%] flex-1'}`}
      onLayout={onLayout}
      style={{
        borderCurve: 'continuous',
        borderRadius,
        borderColor: colors.border,
        backgroundColor: colors.bg1,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      }}
    >
      <Ionicons name={icon} size={20} color={iconColor} />
      <View className="gap-1">
        <Text
          className="font-serif text-2xl tracking-tight"
          style={{ color: colors.text }}
        >
          {value}
        </Text>
        <Text
          className="font-mono text-sm opacity-50"
          style={{ color: colors.text }}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}
