import {
  DARK_ACCENT_COLORS,
  LIGHT_ACCENT_COLORS,
  type AccentColorKey,
  type ThemeColors,
} from '../../theme/colors';

/** Preset accent order for the rotation color picker. */
export const ROTATION_ACCENT_KEYS = [
  'accentRed',
  'accentBlue',
  'accentTeal',
  'accentViolet',
  'accentAmber',
  'accentGreen',
  'accentRose',
] as const satisfies readonly AccentColorKey[];

/**
 * Canonical light-scheme hex values for rotation swatches (storage / defaults).
 * Saturated enough that white date text stays readable.
 */
export const ROTATION_COLORS = [
  LIGHT_ACCENT_COLORS.accentRed,
  LIGHT_ACCENT_COLORS.accentBlue,
  LIGHT_ACCENT_COLORS.accentTeal,
  LIGHT_ACCENT_COLORS.accentViolet,
  LIGHT_ACCENT_COLORS.accentAmber,
  LIGHT_ACCENT_COLORS.accentGreen,
  LIGHT_ACCENT_COLORS.accentRose,
] as const;

/** Default calendar mark color for a new rotation (matches Today mock). */
export const DEFAULT_ROTATION_COLOR = ROTATION_COLORS[0];

export type RotationColor = (typeof ROTATION_COLORS)[number];

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

function normalizeHex(hex: string): string {
  return hex.toLowerCase();
}

/** Map a stored or draft hex to its accent key, if it matches a preset swatch. */
export function accentKeyForHex(hex: string): AccentColorKey | null {
  const normalized = normalizeHex(hex);
  for (const key of ROTATION_ACCENT_KEYS) {
    if (normalizeHex(LIGHT_ACCENT_COLORS[key]) === normalized) {
      return key;
    }
    if (normalizeHex(DARK_ACCENT_COLORS[key]) === normalized) {
      return key;
    }
  }
  return null;
}

/** Theme-appropriate display color for a stored rotation hex. */
export function resolveRotationColor(
  storedHex: string,
  colors: ThemeColors,
): string {
  const key = accentKeyForHex(storedHex);
  return key ? colors[key] : storedHex;
}

/** Ordered accent swatches for the active color scheme. */
export function rotationColorsFrom(colors: ThemeColors): string[] {
  return ROTATION_ACCENT_KEYS.map((key) => colors[key]);
}

export type ShiftDateColorMark = {
  date: string;
  color: string;
  periodId?: string;
};

/** Resolve shift mark colors for the active color scheme. */
export function resolveShiftMarks<T extends ShiftDateColorMark>(
  shiftMarks: readonly T[],
  colors: ThemeColors,
): T[] {
  return shiftMarks.map((mark) => ({
    ...mark,
    color: resolveRotationColor(mark.color, colors),
  }));
}

/** True when `value` is a `#RRGGBB` hex color. */
export function isRotationColor(value: unknown): value is string {
  return typeof value === 'string' && HEX_COLOR.test(value);
}

/** Coerce stored / draft color to a valid hex, falling back to the default swatch. */
export function normalizeRotationColor(value: unknown): string {
  return isRotationColor(value) ? value : DEFAULT_ROTATION_COLOR;
}
