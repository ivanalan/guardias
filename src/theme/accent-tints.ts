import { BRAND_ACCENT_TINTS, BRAND_COLOR } from './brand';

export type AccentTintKey = keyof typeof BRAND_ACCENT_TINTS;

export type AccentTints = Record<AccentTintKey, string>;

type Hsl = { h: number; s: number; l: number };

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!HEX_COLOR.test(hex)) {
    return null;
  }
  return {
    r: parseInt(hex.slice(1, 3), 16) / 255,
    g: parseInt(hex.slice(3, 5), 16) / 255,
    b: parseInt(hex.slice(5, 7), 16) / 255,
  };
}

function rgbToHsl(r: number, g: number, b: number): Hsl {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) {
    return { h: 0, s: 0, l };
  }
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    default:
      h = ((r - g) / d + 4) / 6;
      break;
  }
  return { h: h * 360, s, l };
}

function hue2rgb(p: number, q: number, t: number): number {
  let tt = t;
  if (tt < 0) tt += 1;
  if (tt > 1) tt -= 1;
  if (tt < 1 / 6) return p + (q - p) * 6 * tt;
  if (tt < 1 / 2) return q;
  if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
  return p;
}

function hslToHex({ h, s, l }: Hsl): string {
  const hh = ((h % 360) + 360) % 360;
  const ss = clamp01(s);
  const ll = clamp01(l);
  if (ss === 0) {
    const v = Math.round(ll * 255);
    const hex = v.toString(16).padStart(2, '0');
    return `#${hex}${hex}${hex}`.toUpperCase();
  }
  const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss;
  const p = 2 * ll - q;
  const hk = hh / 360;
  const r = Math.round(hue2rgb(p, q, hk + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, hk) * 255);
  const b = Math.round(hue2rgb(p, q, hk - 1 / 3) * 255);
  return `#${[r, g, b]
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`;
}

function parseHsl(hex: string): Hsl | null {
  const rgb = hexToRgb(hex);
  if (rgb == null) {
    return null;
  }
  return rgbToHsl(rgb.r, rgb.g, rgb.b);
}

/** Shortest signed hue distance in degrees (−180, 180]. */
function hueDelta(from: number, to: number): number {
  let delta = (((to - from) % 360) + 360) % 360;
  if (delta > 180) {
    delta -= 360;
  }
  return delta;
}

const BRAND_HSL = parseHsl(BRAND_COLOR)!;

/** Hue offsets of brand accent neighbors relative to {@link BRAND_COLOR}. */
const HUE_OFFSETS: Record<Exclude<AccentTintKey, 'brand'>, number> = {
  violet: hueDelta(BRAND_HSL.h, parseHsl(BRAND_ACCENT_TINTS.violet)!.h),
  indigo: hueDelta(BRAND_HSL.h, parseHsl(BRAND_ACCENT_TINTS.indigo)!.h),
  azure: hueDelta(BRAND_HSL.h, parseHsl(BRAND_ACCENT_TINTS.azure)!.h),
  teal: hueDelta(BRAND_HSL.h, parseHsl(BRAND_ACCENT_TINTS.teal)!.h),
};

const ROLE_SL: Record<Exclude<AccentTintKey, 'brand'>, { s: number; l: number }> =
  {
    violet: {
      s: parseHsl(BRAND_ACCENT_TINTS.violet)!.s,
      l: parseHsl(BRAND_ACCENT_TINTS.violet)!.l,
    },
    indigo: {
      s: parseHsl(BRAND_ACCENT_TINTS.indigo)!.s,
      l: parseHsl(BRAND_ACCENT_TINTS.indigo)!.l,
    },
    azure: {
      s: parseHsl(BRAND_ACCENT_TINTS.azure)!.s,
      l: parseHsl(BRAND_ACCENT_TINTS.azure)!.l,
    },
    teal: {
      s: parseHsl(BRAND_ACCENT_TINTS.teal)!.s,
      l: parseHsl(BRAND_ACCENT_TINTS.teal)!.l,
    },
  };

function normalizeHex(hex: string): string {
  return hex.toUpperCase();
}

/**
 * Related accent family for a rotation swatch.
 * `brand` is the base; neighbors reuse brand tint S/L with the same hue
 * offsets as {@link BRAND_ACCENT_TINTS} around {@link BRAND_COLOR}.
 */
export function getAccentTints(baseHex: string): AccentTints {
  const base = parseHsl(baseHex);
  if (base == null) {
    return { ...BRAND_ACCENT_TINTS };
  }

  const brand = normalizeHex(baseHex);
  return {
    brand,
    violet: hslToHex({
      h: base.h + HUE_OFFSETS.violet,
      s: ROLE_SL.violet.s,
      l: ROLE_SL.violet.l,
    }),
    indigo: hslToHex({
      h: base.h + HUE_OFFSETS.indigo,
      s: ROLE_SL.indigo.s,
      l: ROLE_SL.indigo.l,
    }),
    azure: hslToHex({
      h: base.h + HUE_OFFSETS.azure,
      s: ROLE_SL.azure.s,
      l: ROLE_SL.azure.l,
    }),
    teal: hslToHex({
      h: base.h + HUE_OFFSETS.teal,
      s: ROLE_SL.teal.s,
      l: ROLE_SL.teal.l,
    }),
  };
}
