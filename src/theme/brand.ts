/** Primary brand accent (strong blue on white). */
export const BRAND_COLOR = '#2F69F3';

/**
 * Nearby accents around {@link BRAND_COLOR} for dashboard shift stats icons.
 * Same neighborhood — a step toward violet or teal — so cards read apart.
 */
export const BRAND_ACCENT_TINTS = {
  violet: '#6B4FE0',
  indigo: '#3F51D4',
  brand: BRAND_COLOR,
  azure: '#2B85D9',
  teal: '#1F9BA8',
} as const;
