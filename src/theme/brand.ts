/** Primary brand accent (strong blue). Default rotation swatch + tab tint. */
export const BRAND_COLOR = '#2F69F3';

/** App canvas from the visual mocks. */
export const CANVAS_COLOR = '#F6F1EC';

/** Primary text / icon ink. */
export const INK_COLOR = '#1C1B1F';

/** Free-weekend surfaces (sampled from Today mock). */
export const WEEKEND_COLOR = '#085D3A';

/** Unfilled progress-pill track. */
export const PILL_TRACK_COLOR = '#E8E4DF';

/**
 * Shared selected-state chrome for chips, tiles, choice rows, and filters.
 * Soft fill + brand border/foreground — same look as the calendar legend tile.
 */
export const BRAND_SELECTION = {
  /** Soft fill (~8% opacity) for bordered surfaces and choice rows. */
  background: `${BRAND_COLOR}14`,
  /** Lighter fill (~4%) for denser list rows (date/time pickers, etc.). */
  backgroundSubtle: `${BRAND_COLOR}0A`,
  border: BRAND_COLOR,
  foreground: BRAND_COLOR,
} as const;

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
