import { CALENDAR_MARK_COLORS } from './calendar-mark-colors';
import { buildMarkedDates } from './build-marked-dates';

describe('buildMarkedDates', () => {
  const shifts = ['2026-07-01'];
  const freeWeekends = ['2026-07-11', '2026-07-12'];

  it('applies full-opacity marks when filter is null', () => {
    const marked = buildMarkedDates(shifts, freeWeekends, null);
    expect(marked['2026-07-01']?.customStyles?.container?.backgroundColor).toBe(
      CALENDAR_MARK_COLORS.shiftBackground,
    );
    expect(
      marked['2026-07-11']?.customStyles?.container?.backgroundColor,
    ).toBe(CALENDAR_MARK_COLORS.freeWeekendBackground);
  });

  it('dims free weekends when filter is shifts', () => {
    const marked = buildMarkedDates(shifts, freeWeekends, 'shifts');
    expect(marked['2026-07-01']?.customStyles?.container?.backgroundColor).toBe(
      CALENDAR_MARK_COLORS.shiftBackground,
    );
    expect(
      marked['2026-07-11']?.customStyles?.container?.backgroundColor,
    ).toMatch(/^rgba\(/);
  });

  it('dims shifts when filter is freeWeekends', () => {
    const marked = buildMarkedDates(shifts, freeWeekends, 'freeWeekends');
    expect(marked['2026-07-01']?.customStyles?.container?.backgroundColor).toMatch(
      /^rgba\(/,
    );
    expect(
      marked['2026-07-11']?.customStyles?.container?.backgroundColor,
    ).toBe(CALENDAR_MARK_COLORS.freeWeekendBackground);
  });
});
