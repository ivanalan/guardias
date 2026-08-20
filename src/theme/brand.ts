/** Primary UI chrome — buttons, links, selection borders (ink black). */
export const BRAND_COLOR = '#1C1B1F';

/** App canvas from the visual mocks. */
export const CANVAS_COLOR = '#F6F1EC';

/** Primary text / icon ink (same as brand). */
export const INK_COLOR = BRAND_COLOR;

/** Free-weekend surfaces (sampled from Today mock). */
export const WEEKEND_COLOR = '#085D3A';

/** Unfilled progress-pill track. */
export const PILL_TRACK_COLOR = '#E8E4DF';

/**
 * Shared selected-state chrome for chips, tiles, choice rows, and filters.
 * Soft fill + ink border/foreground — same look as the calendar legend tile.
 */
export const BRAND_SELECTION = {
  /** Soft fill (~8% opacity) for bordered surfaces and choice rows. */
  background: `${BRAND_COLOR}14`,
  /** Lighter fill (~4%) for denser list rows (date/time pickers, etc.). */
  backgroundSubtle: `${BRAND_COLOR}0A`,
  border: BRAND_COLOR,
  foreground: BRAND_COLOR,
} as const;
