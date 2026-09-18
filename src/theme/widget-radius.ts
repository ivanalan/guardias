import type { LayoutChangeEvent } from 'react-native';

/**
 * Fixed continuous-corner radius for in-app widget / calendar cards.
 *
 * Vertical padding: use NativeWind `py-widget` (`--spacing-widget` /
 * `WIDGET_CARD_PADDING_Y`). Horizontal: `px-gutter` (`WIDGET_CARD_PADDING_X`).
 */
export const WIDGET_RADIUS = 32;
export const WIDGET_RADIUS_MAX = WIDGET_RADIUS;
export const WIDGET_RADIUS_FALLBACK = WIDGET_RADIUS;

/**
 * Corner radius for widget cards. Height is ignored — all content cards share
 * a fixed token so short and tall cards match visually.
 */
export function radiusForHeight(_height?: number): number {
  return WIDGET_RADIUS;
}

type WidgetBorderRadius = {
  borderRadius: number;
  onLayout: (event: LayoutChangeEvent) => void;
};

/**
 * Fixed widget card radius. `onLayout` is a no-op kept for call-site compatibility
 * (some cards fold width measurement into the same handler).
 * Combine with `borderCurve: 'continuous'` on the same style.
 */
export function useWidgetBorderRadius(
  _fallback: number = WIDGET_RADIUS,
): WidgetBorderRadius {
  return {
    borderRadius: WIDGET_RADIUS,
    onLayout: () => {},
  };
}
