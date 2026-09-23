import {
  cellRowsFromHeight,
  resolveTwoWeekLayout,
  weekCountFromCellRows,
} from './two-week-layout';

describe('weekCountFromCellRows', () => {
  it('keeps 2 weeks for 1–2 launcher rows', () => {
    expect(weekCountFromCellRows(1)).toBe(2);
    expect(weekCountFromCellRows(2)).toBe(2);
  });

  it('matches launcher rows from 3 up, capped at 5', () => {
    expect(weekCountFromCellRows(3)).toBe(3);
    expect(weekCountFromCellRows(4)).toBe(4);
    expect(weekCountFromCellRows(5)).toBe(5);
    expect(weekCountFromCellRows(6)).toBe(5);
  });
});

describe('cellRowsFromHeight', () => {
  it('maps canvas size heights to row counts', () => {
    expect(cellRowsFromHeight(110)).toBe(1);
    expect(cellRowsFromHeight(168)).toBe(2);
    expect(cellRowsFromHeight(236)).toBe(3);
    expect(cellRowsFromHeight(304)).toBe(4);
    expect(cellRowsFromHeight(372)).toBe(5);
  });
});

describe('resolveTwoWeekLayout', () => {
  it('uses 2 weeks and stretch cells at proposed 4×2 default', () => {
    const layout = resolveTwoWeekLayout(168, 340);
    expect(layout.weekCount).toBe(2);
    expect(layout.showWeekdayLetters).toBe(true);
    expect(layout.cellSize).toBeGreaterThan(28);
  });

  it('uses compact fonts at 1-row height', () => {
    const layout = resolveTwoWeekLayout(110, 340);
    expect(layout.dayFontSize).toBeLessThanOrEqual(12);
    expect(layout.weekdayFontSize).toBeLessThanOrEqual(10);
  });

  it('uses larger fonts at 2+ row height', () => {
    const twoRow = resolveTwoWeekLayout(168, 340);
    expect(twoRow.dayFontSize).toBeGreaterThanOrEqual(14);
    expect(twoRow.weekdayFontSize).toBe(13);

    const threeRow = resolveTwoWeekLayout(236, 340);
    expect(threeRow.dayFontSize).toBeGreaterThanOrEqual(13);
    expect(threeRow.weekdayFontSize).toBeGreaterThanOrEqual(11);
  });

  it('shows 3 weeks at 4×3 height', () => {
    expect(resolveTwoWeekLayout(236).weekCount).toBe(3);
  });

  it('shows 4 weeks at 4×4 height', () => {
    expect(resolveTwoWeekLayout(304).weekCount).toBe(4);
  });

  it('hides weekday letters when narrow', () => {
    expect(resolveTwoWeekLayout(156, 168).showWeekdayLetters).toBe(false);
  });
});
