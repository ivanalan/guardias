import type { ReactNode } from 'react';

export interface MagicTabIconProps {
  focused: boolean;
  color: string;
  size: number;
}

export interface MagicTabConfig {
  name: string;
  label?: string;
  showLabel?: boolean;
  badge?: number | string | boolean;
  disabled?: boolean;
  variant?: 'action';
  isLight?: boolean;
  icon: (props: MagicTabIconProps) => ReactNode;
}

export type MagicNavigationTab = MagicTabConfig;
export type MagicLabelMode = 'active' | 'always' | 'never';
export type MagicLabelPosition = 'right' | 'bottom';
export type MagicTabBarVariant = 'floating' | 'docked';

export interface MagicSpringConfig {
  mass: number;
  damping: number;
  stiffness: number;
}

export interface MagicTabBarTheme {
  barColor: string;
  activePillColor: string;
  activeColor: string;
  inactiveColor: string;
  iconSize: number;
  fontSize: number;
  height: number;
  radius: number;
  badgeColor: string;
  badgeTextColor: string;
  actionColor: string;
  actionIconColor: string;
  horizontalMargin: number;
  bottomInset: number;
  spring: MagicSpringConfig;
}
