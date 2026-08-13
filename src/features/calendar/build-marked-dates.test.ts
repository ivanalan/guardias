import { CALENDAR_MARK_COLORS } from './calendar-mark-colors';
import { buildMarkedDates } from './build-marked-dates';

describe('buildMarkedDates', () => {
  const shifts = [{ date: '2026-07-01', color: CALENDAR_MARK_COLORS.shiftBackground }];
  const freeWeekends = ['2026-07-11', '2026-07-12'];
  const vacations = ['2026-07-15', '2026-07-16'];

  it('applies full-opacity marks when filter is null', () => {
    const marked = buildMarkedDates(shifts, freeWeekends, vacations, null);
    expect(marked['2026-07-01']?.customStyles?.container?.backgroundColor).toBe(
      CALENDAR_MARK_COLORS.shiftBackground,
    );
    expect(
      marked['2026-07-11']?.customStyles?.container?.backgroundColor,
    ).toBe(CALENDAR_MARK_COLORS.freeWeekendBackground);
    expect(
      marked['2026-07-15']?.customStyles?.container?.backgroundColor,
    ).toBe(CALENDAR_MARK_COLORS.vacationBackground);
  });

  it('uses each shift mark’s color', () => {
    const marked = buildMarkedDates(
      [
        { date: '2026-07-01', color: '#1F9BA8' },
        { date: '2026-07-05', color: '#E53935' },
      ],
      [],
      [],
      null,
    );
    expect(marked['2026-07-01']?.customStyles?.container?.backgroundColor).toBe(
      '#1F9BA8',
    );
    expect(marked['2026-07-05']?.customStyles?.container?.backgroundColor).toBe(
      '#E53935',
    );
  });

  it('lets vacation override free-weekend marks on the same day', () => {
    const marked = buildMarkedDates(
      [],
      ['2026-07-11'],
      ['2026-07-11'],
      null,
    );
    expect(marked['2026-07-11']?.customStyles?.container?.backgroundColor).toBe(
      CALENDAR_MARK_COLORS.vacationBackground,
    );
  });

  it('dims free weekends and vacations when filter is shifts', () => {
    const marked = buildMarkedDates(shifts, freeWeekends, vacations, 'shifts');
    expect(marked['2026-07-01']?.customStyles?.container?.backgroundColor).toBe(
      CALENDAR_MARK_COLORS.shiftBackground,
    );
    expect(
      marked['2026-07-11']?.customStyles?.container?.backgroundColor,
    ).toMatch(/^rgba\(/);
    expect(
      marked['2026-07-15']?.customStyles?.container?.backgroundColor,
    ).toMatch(/^rgba\(/);
  });

  it('dims shifts and vacations when filter is freeWeekends', () => {
    const marked = buildMarkedDates(
      shifts,
      freeWeekends,
      vacations,
      'freeWeekends',
    );
    expect(marked['2026-07-01']?.customStyles?.container?.backgroundColor).toMatch(
      /^rgba\(/,
    );
    expect(
      marked['2026-07-11']?.customStyles?.container?.backgroundColor,
    ).toBe(CALENDAR_MARK_COLORS.freeWeekendBackground);
    expect(
      marked['2026-07-15']?.customStyles?.container?.backgroundColor,
    ).toMatch(/^rgba\(/);
  });

  it('dims shifts and free weekends when filter is vacation', () => {
    const marked = buildMarkedDates(shifts, freeWeekends, vacations, 'vacation');
    expect(marked['2026-07-01']?.customStyles?.container?.backgroundColor).toMatch(
      /^rgba\(/,
    );
    expect(
      marked['2026-07-11']?.customStyles?.container?.backgroundColor,
    ).toMatch(/^rgba\(/);
    expect(
      marked['2026-07-15']?.customStyles?.container?.backgroundColor,
    ).toBe(CALENDAR_MARK_COLORS.vacationBackground);
  });
});
