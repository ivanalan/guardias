import {
  radiusForHeight,
  WIDGET_RADIUS,
  WIDGET_RADIUS_FALLBACK,
  WIDGET_RADIUS_MAX,
} from './widget-radius';

describe('radiusForHeight', () => {
  it('returns the fixed widget radius for any height', () => {
    expect(radiusForHeight(0)).toBe(WIDGET_RADIUS);
    expect(radiusForHeight(-10)).toBe(WIDGET_RADIUS);
    expect(radiusForHeight(90)).toBe(WIDGET_RADIUS);
    expect(radiusForHeight(114)).toBe(WIDGET_RADIUS);
    expect(radiusForHeight(400)).toBe(WIDGET_RADIUS);
  });

  it('keeps aliases aligned with WIDGET_RADIUS', () => {
    expect(WIDGET_RADIUS_MAX).toBe(WIDGET_RADIUS);
    expect(WIDGET_RADIUS_FALLBACK).toBe(WIDGET_RADIUS);
  });
});
