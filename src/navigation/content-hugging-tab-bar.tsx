import { forwardRef, type ReactNode } from 'react';
import {
  StyleSheet,
  View,
  type View as RNView,
  type ViewProps,
} from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type {
  MagicLabelPosition,
  MagicTabBarTheme,
  MagicTabBarVariant,
} from './magic-tab-bar-types';

declare const require: (moduleName: string) => unknown;

const barTransition = LinearTransition.springify()
  .mass(0.5)
  .damping(16)
  .stiffness(160);

const BOTTOM_LABEL_EXTRA_HEIGHT = 6;
const MIN_BAR_OPACITY = 0.1;
const TAB_BAR_HORIZONTAL_PADDING = 16;

const glassEffect = (() => {
  try {
    return require('expo-glass-effect') as typeof import('expo-glass-effect');
  } catch {
    return null;
  }
})();

function clampBarOpacity(isTransparent: boolean, transparency: number): number {
  return isTransparent
    ? Math.min(Math.max(transparency, MIN_BAR_OPACITY), 1)
    : 1;
}

export interface ContentHuggingTabBarProps extends ViewProps {
  theme: MagicTabBarTheme;
  variant?: MagicTabBarVariant;
  labelPosition?: MagicLabelPosition;
  isTransparent?: boolean;
  transparency?: number;
  glass?: boolean;
  renderBackground?: () => ReactNode;
  children?: ReactNode;
}

/** Floating tab bar shell that shrink-wraps its tab items with fixed side padding. */
export const ContentHuggingTabBar = forwardRef<
  RNView,
  ContentHuggingTabBarProps
>(function ContentHuggingTabBar(
  {
    theme,
    variant = 'floating',
    labelPosition = 'right',
    isTransparent = false,
    transparency = 0.6,
    glass = false,
    renderBackground,
    children,
    style,
    ...rest
  },
  ref,
) {
  const insets = useSafeAreaInsets();
  const floating = variant !== 'docked';
  const barHeight =
    labelPosition === 'bottom'
      ? theme.height + BOTTOM_LABEL_EXTRA_HEIGHT
      : theme.height;
  const useGlass = glass && !!glassEffect?.isLiquidGlassAvailable();
  const barOpacity = clampBarOpacity(isTransparent, transparency);
  const seeThrough = useGlass || isTransparent;

  return (
    <View
      ref={ref}
      pointerEvents="box-none"
      style={[
        floating ? styles.floatingWrapper : styles.dockedWrapper,
        {
          paddingBottom: (floating ? insets.bottom : 0) + theme.bottomInset,
        },
      ]}
    >
      <Animated.View
        layout={barTransition}
        style={[
          styles.bar,
          !seeThrough && styles.barShadow,
          { height: barHeight, borderRadius: theme.radius },
        ]}
      >
        {renderBackground ? (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { borderRadius: theme.radius, overflow: 'hidden' },
            ]}
          >
            {renderBackground()}
          </View>
        ) : useGlass && glassEffect ? (
          <glassEffect.GlassView
            pointerEvents="none"
            glassEffectStyle="regular"
            tintColor={theme.barColor}
            style={[StyleSheet.absoluteFill, { borderRadius: theme.radius }]}
          />
        ) : (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: theme.barColor,
                borderRadius: theme.radius,
                opacity: barOpacity,
              },
            ]}
          />
        )}
        <View style={[styles.row, style]} {...rest}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  dockedWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignSelf: 'center',
  },
  barShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: TAB_BAR_HORIZONTAL_PADDING,
    gap: 12,
  },
});
