import {
  GRID_SLOT_HEIGHT,
  MARK_GAP,
  MARK_MAX_SIZE,
  MARK_MAX_TOTAL,
  MARK_MIN_SIZE,
  layoutMarks,
} from './layout-marks';

/** Typical grid width inside the card (phone ~390 − screen gutters − page gutters). */
const PHONE_GRID_WIDTH = 294;

function fitsBox(
  layout: ReturnType<typeof layoutMarks>,
  boxWidth: number,
  boxHeight: number,
): boolean {
  if (layout.renderTotal === 0) {
    return true;
  }
  const width =
    layout.cols * layout.markSize + (layout.cols - 1) * layout.gap;
  const height =
    layout.rows * layout.markSize + (layout.rows - 1) * layout.gap;
  return width <= boxWidth + 0.01 && height <= boxHeight + 0.01;
}

describe('layoutMarks', () => {
  it('returns empty layout for total 0', () => {
    expect(layoutMarks(0, PHONE_GRID_WIDTH, GRID_SLOT_HEIGHT)).toEqual({
      cols: 0,
      rows: 0,
      markSize: 0,
      gap: MARK_GAP,
      renderTotal: 0,
    });
  });

  it('packs a single mark at max size when the box allows', () => {
    const layout = layoutMarks(1, PHONE_GRID_WIDTH, GRID_SLOT_HEIGHT);
    expect(layout.renderTotal).toBe(1);
    expect(layout.cols).toBe(1);
    expect(layout.rows).toBe(1);
    expect(layout.markSize).toBe(MARK_MAX_SIZE);
    expect(fitsBox(layout, PHONE_GRID_WIDTH, GRID_SLOT_HEIGHT)).toBe(true);
  });

  it('fits both mock totals in the shared grid slot', () => {
    const shifts = layoutMarks(16, PHONE_GRID_WIDTH, GRID_SLOT_HEIGHT);
    const days = layoutMarks(62, PHONE_GRID_WIDTH, GRID_SLOT_HEIGHT);

    expect(fitsBox(shifts, PHONE_GRID_WIDTH, GRID_SLOT_HEIGHT)).toBe(true);
    expect(fitsBox(days, PHONE_GRID_WIDTH, GRID_SLOT_HEIGHT)).toBe(true);
    expect(shifts.markSize).toBeGreaterThanOrEqual(days.markSize);
  });

  it('spans the full slot width for shifts and days mocks', () => {
    const shifts = layoutMarks(16, PHONE_GRID_WIDTH, GRID_SLOT_HEIGHT);
    const days = layoutMarks(62, PHONE_GRID_WIDTH, GRID_SLOT_HEIGHT);
    const shiftsWidth =
      shifts.cols * shifts.markSize + (shifts.cols - 1) * shifts.gap;
    const daysWidth =
      days.cols * days.markSize + (days.cols - 1) * days.gap;

    expect(shiftsWidth).toBeGreaterThan(PHONE_GRID_WIDTH * 0.98);
    expect(daysWidth).toBeGreaterThan(PHONE_GRID_WIDTH * 0.98);
  });

  it('does not grow mark size when total increases (same box)', () => {
    const small = layoutMarks(16, PHONE_GRID_WIDTH, GRID_SLOT_HEIGHT);
    const large = layoutMarks(62, PHONE_GRID_WIDTH, GRID_SLOT_HEIGHT);
    expect(large.markSize).toBeLessThanOrEqual(small.markSize);
  });

  it('spans full width even when a single row would also fit', () => {
    const layout = layoutMarks(10, 200, GRID_SLOT_HEIGHT);
    const width =
      layout.cols * layout.markSize + (layout.cols - 1) * layout.gap;
    expect(layout.renderTotal).toBe(10);
    expect(fitsBox(layout, 200, GRID_SLOT_HEIGHT)).toBe(true);
    expect(width).toBeGreaterThan(200 * 0.98);
  });

  it('clamps to minSize without NaN on a tiny box', () => {
    const layout = layoutMarks(20, 10, 10);
    expect(Number.isFinite(layout.markSize)).toBe(true);
    expect(layout.markSize).toBeGreaterThanOrEqual(MARK_MIN_SIZE);
    expect(layout.renderTotal).toBe(20);
  });

  it('clamps renderTotal to the mark budget', () => {
    const layout = layoutMarks(
      MARK_MAX_TOTAL + 50,
      PHONE_GRID_WIDTH,
      GRID_SLOT_HEIGHT,
    );
    expect(layout.renderTotal).toBe(MARK_MAX_TOTAL);
    expect(fitsBox(layout, PHONE_GRID_WIDTH, GRID_SLOT_HEIGHT)).toBe(true);
  });

  it('handles invalid box dimensions', () => {
    expect(layoutMarks(8, 0, GRID_SLOT_HEIGHT).renderTotal).toBe(0);
    expect(layoutMarks(8, PHONE_GRID_WIDTH, -1).renderTotal).toBe(0);
    expect(layoutMarks(8, Number.NaN, GRID_SLOT_HEIGHT).renderTotal).toBe(0);
  });
});
