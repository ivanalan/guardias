import { BRAND_COLOR } from '../../theme/brand';

/** Default calendar mark color for a rotation (brand blue). */
export const DEFAULT_ROTATION_COLOR = BRAND_COLOR;

/**
 * Curated swatches for rotation calendar marks.
 * Saturated enough that white date text stays readable.
 */
export const ROTATION_COLORS = [
  BRAND_COLOR, // brand blue
  '#1F9BA8', // teal
  '#6B4FE0', // violet
  '#E53935', // red
  '#FB8C00', // amber
  '#43A047', // green
  '#D81B60', // rose
] as const;

export type RotationColor = (typeof ROTATION_COLORS)[number];

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

/** True when `value` is a `#RRGGBB` hex color. */
export function isRotationColor(value: unknown): value is string {
  return typeof value === 'string' && HEX_COLOR.test(value);
}

/** Coerce stored / draft color to a valid hex, falling back to brand. */
export function normalizeRotationColor(value: unknown): string {
  return isRotationColor(value) ? value : DEFAULT_ROTATION_COLOR;
}
