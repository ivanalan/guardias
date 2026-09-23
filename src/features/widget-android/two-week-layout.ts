/**
 * Height-driven layout for the fluid-fill two-week calendar widget.
 * Week count grows with launcher rows: weeks = max(2, cellRows), cap 5.
 * No range title — weekday letters only (hidden when narrow).
 */

export type TwoWeekLayout = {
  weekCount: number;
  cellSize: number;
  dayFontSize: number;
  weekdayFontSize: number;
  showWeekdayLetters: boolean;
};

/** Approximate launcher row from widget height dp (Pixel-ish cell ~68dp). */
export function cellRowsFromHeight(heightDp: number): number {
  if (heightDp < 140) return 1;
  if (heightDp < 200) return 2;
  if (heightDp < 270) return 3;
  if (heightDp < 340) return 4;
  return 5;
}

/** weeks = max(2, cellRows), capped at 5 (~month). */
export function weekCountFromCellRows(cellRows: number): number {
  return Math.min(Math.max(2, cellRows), 5);
}

/**
 * Default ≈4×2 (~340×168dp). Compact width hides M–S letters.
 * Cell size stretches so week rows fill the slot (variant A).
 */
export function resolveTwoWeekLayout(
  heightDp: number,
  widthDp: number = 340,
): TwoWeekLayout {
  const cellRows = cellRowsFromHeight(heightDp);
  const weekCount = weekCountFromCellRows(cellRows);
  const showWeekdayLetters = widthDp >= 200;
  // 1-row launcher height stays compact; 2+ rows use larger type.
  const compact = cellRows <= 1;

  const padTop = showWeekdayLetters ? 18 : 10;
  const weekdayLine = showWeekdayLetters ? (compact ? 10 : 13) : 0;
  const weekdayBottom = showWeekdayLetters ? 6 : 0;
  const weekdayBlock = padTop + weekdayLine + weekdayBottom;
  const padBottom = 8;
  const available = Math.max(40, heightDp - weekdayBlock - padBottom);
  const cellSize = Math.min(
    40,
    Math.max(18, Math.floor(available / weekCount) - 6),
  );
  const dayFontSize = compact
    ? cellSize >= 32
      ? 12
      : cellSize >= 26
        ? 11
        : cellSize >= 20
          ? 10
          : 9
    : cellSize >= 32
      ? 15
      : cellSize >= 26
        ? 14
        : cellSize >= 20
          ? 13
          : 12;
  const weekdayFontSize = compact
    ? weekCount >= 4 || widthDp < 200
      ? 9
      : 10
    : weekCount >= 4 || widthDp < 200
      ? 11
      : 13;

  return {
    weekCount,
    cellSize,
    dayFontSize,
    weekdayFontSize,
    showWeekdayLetters,
  };
}
