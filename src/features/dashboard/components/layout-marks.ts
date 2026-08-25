/** Matches `gap-1` between marks. */
export const MARK_GAP = 4;
export const MARK_MIN_SIZE = 4;
/** Soft ceiling so tiny totals don't grow huge marks. */
export const MARK_MAX_SIZE = 28;
/** Hard render budget — residency periods rarely need more. */
export const MARK_MAX_TOTAL = 180;

/**
 * Fixed grid-slot height shared by shifts and days pages.
 * Fits ~3 rows of mid-size marks.
 */
export const GRID_SLOT_HEIGHT = 56;

export type MarkGridLayout = {
  cols: number;
  rows: number;
  markSize: number;
  gap: number;
  /** Marks to render (clamped to budget). */
  renderTotal: number;
};

export type LayoutMarksOptions = {
  gap?: number;
  minSize?: number;
  maxSize?: number;
  maxMarks?: number;
};

function packedExtent(count: number, size: number, gap: number): number {
  if (count <= 0) {
    return 0;
  }
  return count * size + (count - 1) * gap;
}

function isBetterFill(
  candidate: MarkGridLayout,
  best: MarkGridLayout,
  renderTotal: number,
): boolean {
  if (candidate.markSize > best.markSize + 1e-6) {
    return true;
  }
  if (Math.abs(candidate.markSize - best.markSize) > 1e-6) {
    return false;
  }
  const candidateLeftover = candidate.cols * candidate.rows - renderTotal;
  const bestLeftover = best.cols * best.rows - renderTotal;
  return candidateLeftover < bestLeftover;
}

function isBetterFallback(
  candidate: MarkGridLayout,
  best: MarkGridLayout,
): boolean {
  if (candidate.markSize > best.markSize + 1e-6) {
    return true;
  }
  if (Math.abs(candidate.markSize - best.markSize) > 1e-6) {
    return false;
  }
  const candidateWidth = packedExtent(
    candidate.cols,
    candidate.markSize,
    candidate.gap,
  );
  const bestWidth = packedExtent(best.cols, best.markSize, best.gap);
  return candidateWidth > bestWidth + 1e-6;
}

/**
 * Pack `total` circular marks into a fixed box.
 *
 * Prefers layouts that span the full width (`sizeW ≤ sizeH`), maximizing
 * that mark size so the grid reaches the right edge. Falls back to maximizing
 * `min(sizeW, sizeH)` when no width-filling layout fits.
 */
export function layoutMarks(
  total: number,
  boxWidth: number,
  boxHeight: number,
  opts?: LayoutMarksOptions,
): MarkGridLayout {
  const gap = opts?.gap ?? MARK_GAP;
  const minSize = opts?.minSize ?? MARK_MIN_SIZE;
  const maxSize = opts?.maxSize ?? MARK_MAX_SIZE;
  const maxMarks = opts?.maxMarks ?? MARK_MAX_TOTAL;

  const renderTotal = Math.max(0, Math.min(Math.floor(total), maxMarks));

  if (
    renderTotal === 0 ||
    boxWidth <= 0 ||
    boxHeight <= 0 ||
    !Number.isFinite(boxWidth) ||
    !Number.isFinite(boxHeight)
  ) {
    return { cols: 0, rows: 0, markSize: 0, gap, renderTotal: 0 };
  }

  const maxColsByMin = Math.max(
    1,
    Math.floor((boxWidth + gap) / (minSize + gap)),
  );
  const maxCols = Math.min(renderTotal, maxColsByMin);

  let bestFill: MarkGridLayout | null = null;
  let bestFallback: MarkGridLayout | null = null;

  for (let cols = 1; cols <= maxCols; cols += 1) {
    const rows = Math.ceil(renderTotal / cols);
    const sizeW = (boxWidth - (cols - 1) * gap) / cols;
    const sizeH = (boxHeight - (rows - 1) * gap) / rows;
    if (!Number.isFinite(sizeW) || !Number.isFinite(sizeH)) {
      continue;
    }

    // Width-filling: span the row, only if that size still fits in height.
    if (sizeW >= minSize && sizeW <= sizeH + 1e-6) {
      const markSize = Math.min(maxSize, sizeW);
      const width = packedExtent(cols, markSize, gap);
      // Accept when unclamped, or when clamping still spans ~full width.
      if (markSize >= sizeW - 1e-6 || width >= boxWidth * 0.98) {
        const candidate: MarkGridLayout = {
          cols,
          rows,
          markSize,
          gap,
          renderTotal,
        };
        if (bestFill == null || isBetterFill(candidate, bestFill, renderTotal)) {
          bestFill = candidate;
        }
      }
    }

    // Fallback: maximize min(sizeW, sizeH), prefer wider span on ties.
    const raw = Math.min(sizeW, sizeH);
    const markSize = Math.min(maxSize, Math.max(minSize, raw));
    if (
      packedExtent(cols, markSize, gap) > boxWidth + 0.01 ||
      packedExtent(rows, markSize, gap) > boxHeight + 0.01
    ) {
      if (markSize > minSize) {
        continue;
      }
    }

    const candidate: MarkGridLayout = {
      cols,
      rows,
      markSize,
      gap,
      renderTotal,
    };
    if (
      bestFallback == null ||
      isBetterFallback(candidate, bestFallback)
    ) {
      bestFallback = candidate;
    }
  }

  if (bestFill != null) {
    return bestFill;
  }
  if (bestFallback != null) {
    return bestFallback;
  }

  return {
    cols: 1,
    rows: renderTotal,
    markSize: minSize,
    gap,
    renderTotal,
  };
}
