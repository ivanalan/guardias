/** Horizontal inset from the screen edge — keep in sync with `--spacing-gutter` in global.css. */
export const SCREEN_GUTTER = 24;

/**
 * Vertical inset for home / rotation / calendar widget cards.
 * Keep in sync with `--spacing-widget` in global.css (`py-widget`).
 */
export const WIDGET_CARD_PADDING_Y = 20;

/**
 * Horizontal inset for home / rotation / calendar widget cards.
 * Same as `SCREEN_GUTTER` / NativeWind `px-gutter`.
 */
export const WIDGET_CARD_PADDING_X = SCREEN_GUTTER;

/**
 * Bottom scroll inset so content clears the floating tab chip: bar height plus the
 * home-indicator inset plus breathing room. Keep in sync with `--spacing-tab-clearance`.
 */
export const FLOATING_TAB_BAR_CLEARANCE = 120;

/**
 * Shared corner radius for form controls, chips, and calendar day markers.
 * Keep in sync with `--radius-xl` in global.css (`rounded-xl`).
 */
export const BORDER_RADIUS = 14;
