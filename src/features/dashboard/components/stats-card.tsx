import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import { BRAND_ACCENT_TINTS } from '../../../theme/brand';
import { Text, View } from '../../../tw';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export type StatsCardTint = keyof typeof BRAND_ACCENT_TINTS;

export type StatsCardProps = {
  tint?: StatsCardTint;
  icon: IconName;
  value: string;
  subtitle: string;
  fullWidth?: boolean;
};

/** Soft metric card: brand-adjacent tinted icon, large value, subtitle. */
export function StatsCard({
  tint = 'brand',
  icon,
  value,
  subtitle,
  fullWidth = false,
}: StatsCardProps) {
  return (
    <View
      className={`gap-3 border border-neutral-200 bg-white p-4 ${
        fullWidth ? 'w-full' : 'min-w-[46%] flex-1'
      }`}
      style={{
        borderCurve: 'continuous',
        borderRadius: 24,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      }}
    >
      <MaterialCommunityIcons
        name={icon}
        size={20}
        color={BRAND_ACCENT_TINTS[tint]}
      />
      <View className="gap-1">
        <Text className="text-2xl font-bold tracking-tight">{value}</Text>
        <Text className="text-sm opacity-50">{subtitle}</Text>
      </View>
    </View>
  );
}
