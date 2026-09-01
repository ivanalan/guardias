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
import { MagicTabItem } from './magic-tab-item';
import type {
  MagicLabelMode,
  MagicNavigationTab,
  MagicTabBarTheme,
} from './magic-tab-bar-types';

import { useRotations } from '../features/rotations/rotations-context';
import type { ThemeColors } from '../theme/colors';
import { useTheme } from '../theme/theme-context';
import { ContentHuggingTabBar } from './content-hugging-tab-bar';
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

function floatingTabBarTheme(colors: ThemeColors): Partial<MagicTabBarTheme> {
  return {
    barColor: 'transparent',
    activePillColor: 'transparent',
    activeColor: colors.brand,
    inactiveColor: colors.tabInactive,
    iconSize: 22,
    fontSize: 11,
    height: 56,
    radius: 999,
    bottomInset: Platform.OS === 'ios' ? -12 : 16,
  };
}

const MAGIC_TAB_BAR_DEFAULT_THEME: MagicTabBarTheme = {
  barColor: 'rgba(38, 38, 40, 0.94)',
  activePillColor: 'rgba(120, 120, 124, 0.55)',
  activeColor: '#FFFFFF',
  inactiveColor: '#FFFFFF',
  iconSize: 22,
  fontSize: 12,
  height: 56,
  radius: 28,
  badgeColor: '#FF3B30',
  badgeTextColor: '#FFFFFF',
  actionColor: '#0A84FF',
  actionIconColor: '#FFFFFF',
  horizontalMargin: 14,
  bottomInset: 10,
  spring: { mass: 0.6, damping: 18, stiffness: 180 },
};

function mergeTheme(override?: Partial<MagicTabBarTheme>): MagicTabBarTheme {
  return { ...MAGIC_TAB_BAR_DEFAULT_THEME, ...override };
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
      <BlurView
        tint={blurTint}
        intensity={100}
        style={StyleSheet.absoluteFill}
      />
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
export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const { t } = useTranslation();
  const { periods } = useRotations();
  const { colors, scheme } = useTheme();
  const tabBarTheme = useMemo(
    () => mergeTheme(floatingTabBarTheme(colors)),
    [colors],
  );
  const tabs = useMemo(() => buildTabs(t), [t]);
  const tabByName = useMemo(() => {
    const map = new Map<string, MagicNavigationTab>();
    for (const tab of tabs) map.set(tab.name, tab);
    return map;
  }, [tabs]);
  const blurTint: 'light' | 'dark' = scheme === 'dark' ? 'dark' : 'light';
  const labelMode: MagicLabelMode = 'always';

  if (periods.length === 0 || !shouldShowTabBar(state)) {
    return null;
  }

  return (
    <ContentHuggingTabBar
      theme={tabBarTheme}
      variant="floating"
      labelPosition="bottom"
      isTransparent
      renderBackground={() => (
        <TabBarBackground
          overlayColor={colors.tabBarOverlay}
          blurTint={blurTint}
        />
      )}
    >
      {state.routes.map((route, index) => {
        const tab = tabByName.get(route.name);
        if (!tab) return null;

        const focused = state.index === index;

        const handlePress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const handleLongPress = () => {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        };

        return (
          <MagicTabItem
            key={route.key}
            name={route.name}
            icon={tab.icon}
            label={tab.label}
            labelMode={labelMode}
            labelPosition="bottom"
            badge={tab.badge}
            disabled={tab.disabled}
            variant={tab.variant}
            haptics
            theme={tabBarTheme}
            isFocused={focused}
            onPress={handlePress}
            onLongPress={handleLongPress}
          />
        );
      })}
    </ContentHuggingTabBar>
  );
}
