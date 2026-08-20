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
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  MagicTabBarNavigation,
  type MagicNavigationTab,
} from 'react-native-magic-tab-bar/react-navigation';

import { INK_COLOR } from '../theme/brand';
import { useRotations } from '../features/rotations/rotations-context';
import { SCREEN_GUTTER } from '../theme/layout';
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

const INACTIVE_TAB_COLOR = '#49454F';

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

/** Frosted white wash over the blur — keeps the chip light on the canvas. */
const TAB_BAR_WHITE_OVERLAY = 'rgba(255, 255, 255, 0.45)';

/** Visual tokens for the floating chip tab bar — tuned to the Shifts mock. */
export const FLOATING_TAB_BAR_THEME = {
  barColor: 'transparent',
  activePillColor: 'transparent',
  activeColor: INK_COLOR,
  inactiveColor: INACTIVE_TAB_COLOR,
  iconSize: 22,
  fontSize: 11,
  height: 64,
  radius: 999,
  horizontalMargin: 72,
  bottomInset: 16,
} as const;

function TabBarBlurBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView tint="light" intensity={100} style={StyleSheet.absoluteFill} />
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: TAB_BAR_WHITE_OVERLAY },
        ]}
      />
    </View>
  );
}

function TabBarBackground() {
  if (isLiquidGlassAvailable() && isGlassEffectAPIAvailable()) {
    return (
      <GlassView
        glassEffectStyle="regular"
        tintColor={TAB_BAR_WHITE_OVERLAY}
        style={StyleSheet.absoluteFill}
      />
    );
  }

  return <TabBarBlurBackground />;
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
      renderBackground={() => <TabBarBackground />}
      theme={FLOATING_TAB_BAR_THEME}
    />
  );
}
