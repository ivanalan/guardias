import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { ComponentProps } from 'react';
import { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  MagicTabBarNavigation,
  type MagicNavigationTab,
} from 'react-native-magic-tab-bar/react-navigation';

import { useRotations } from '../features/rotations/rotations-context';
import type { ThemeColors } from '../theme/colors';
import { useTheme } from '../theme/theme-context';
import type { TabParamList } from './types';

type TabKey = keyof TabParamList;
type IconName = ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<TabKey, { focused: IconName; unfocused: IconName }> = {
  Home: { focused: 'home', unfocused: 'home-outline' },
  Calendar: { focused: 'calendar', unfocused: 'calendar-outline' },
  Shifts: { focused: 'albums', unfocused: 'albums-outline' },
};

const TAB_TITLE_KEYS: Record<
  TabKey,
  'tabs.home' | 'tabs.calendar' | 'tabs.shifts'
> = {
  Home: 'tabs.home',
  Calendar: 'tabs.calendar',
  Shifts: 'tabs.shifts',
};

/** Initial route per tab — tab bar is shown only on these screens. */
const TAB_ROOT_SCREENS: Record<TabKey, string> = {
  Home: 'HomeHome',
  Calendar: 'CalendarHome',
  Shifts: 'ShiftsList',
};

function shouldShowTabBar(state: BottomTabBarProps['state']): boolean {
  const tabRoute = state.routes[state.index];
  const tabName = tabRoute.name as TabKey;
  const focusedName =
    getFocusedRouteNameFromRoute(tabRoute) ?? TAB_ROOT_SCREENS[tabName];
  return focusedName === TAB_ROOT_SCREENS[tabName];
}

function floatingTabBarTheme(colors: ThemeColors) {
  return {
    barColor: 'transparent',
    activePillColor: 'transparent',
    activeColor: colors.brand,
    inactiveColor: colors.tabInactive,
    iconSize: 22,
    fontSize: 11,
    height: 64,
    radius: 999,
    horizontalMargin: 72,
    bottomInset: Platform.OS === 'ios' ? 0 : 16,
  } as const;
}

function TabBarBlurBackground({
  overlayColor,
  blurTint,
}: {
  overlayColor: string;
  blurTint: 'light' | 'dark';
}) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView tint={blurTint} intensity={100} style={StyleSheet.absoluteFill} />
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: overlayColor }]}
      />
    </View>
  );
}

function TabBarBackground({
  overlayColor,
  blurTint,
}: {
  overlayColor: string;
  blurTint: 'light' | 'dark';
}) {
  if (isLiquidGlassAvailable() && isGlassEffectAPIAvailable()) {
    return (
      <GlassView
        glassEffectStyle="regular"
        tintColor={overlayColor}
        style={StyleSheet.absoluteFill}
      />
    );
  }

  return (
    <TabBarBlurBackground overlayColor={overlayColor} blurTint={blurTint} />
  );
}

function buildTabs(t: (key: string) => string): MagicNavigationTab[] {
  return (Object.keys(TAB_ICONS) as TabKey[]).map((name) => {
    const icons = TAB_ICONS[name];
    return {
      name,
      label: t(TAB_TITLE_KEYS[name]),
      icon: ({ focused, color, size }) => (
        <Ionicons
          name={focused ? icons.focused : icons.unfocused}
          size={size}
          color={color}
        />
      ),
    };
  });
}

/** Floating glass chip tab bar for the root navigator. */
export function FloatingTabBar(props: BottomTabBarProps) {
  const { t } = useTranslation();
  const { periods } = useRotations();
  const { colors, scheme } = useTheme();
  const tabBarTheme = useMemo(() => floatingTabBarTheme(colors), [colors]);
  const blurTint: 'light' | 'dark' = scheme === 'dark' ? 'dark' : 'light';

  if (periods.length === 0 || !shouldShowTabBar(props.state)) {
    return null;
  }

  return (
    <MagicTabBarNavigation
      {...props}
      tabs={buildTabs(t)}
      variant="floating"
      labelPosition="bottom"
      showLabels="always"
      haptics
      isTransparent
      renderBackground={() => (
        <TabBarBackground
          overlayColor={colors.tabBarOverlay}
          blurTint={blurTint}
        />
      )}
      theme={tabBarTheme}
    />
  );
}
