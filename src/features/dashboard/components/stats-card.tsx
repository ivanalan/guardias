import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import {
  type AccentTintKey,
  type AccentTints,
} from '../../../theme/accent-tints';
import { DEFAULT_ACCENT_TINTS } from '../../../theme/accent-tints';
import { useTheme } from '../../../theme/theme-context';
import { Text, View } from '../../../tw';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type StatsCardTint = AccentTintKey;

export type StatsCardProps = {
  tint?: StatsCardTint;
  /** Accent family for icon colors; defaults to brand tints. */
  accents?: AccentTints;
  /** Overrides tint when set (e.g. a rotation’s calendar color). */
  iconColor?: string;
  icon: IconName;
  value: string;
  subtitle: string;
  fullWidth?: boolean;
};

/** Soft metric card: brand-adjacent tinted icon, large value, subtitle. */
export function StatsCard({
  tint = 'brand',
  accents = DEFAULT_ACCENT_TINTS,
  iconColor,
  icon,
  value,
  subtitle,
  fullWidth = false,
}: StatsCardProps) {
  const { colors } = useTheme();

  return (
    <View
      className={`gap-3 border p-4 ${fullWidth ? 'w-full' : 'min-w-[46%] flex-1'}`}
      style={{
        borderCurve: 'continuous',
        borderRadius: 32,
        borderColor: colors.border,
        backgroundColor: colors.bg1,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      }}
    >
      <Ionicons name={icon} size={20} color={iconColor ?? accents[tint]} />
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
