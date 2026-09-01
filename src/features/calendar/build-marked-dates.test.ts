import {
  buildMarkedDates,
  pruneLegendFilterForMonthCounts,
} from './build-marked-dates';

describe('buildMarkedDates', () => {
  const shifts = [{ date: '2026-07-01', color: '#2F69F3' }];
  const freeWeekends = ['2026-07-11', '2026-07-12'];
  const vacations = ['2026-07-15', '2026-07-16'];
  const secondary = [{ date: '2026-07-02', color: '#0D9488' }];

  it('marks shift, free-weekend, vacation, and secondary dates', () => {
    const marked = buildMarkedDates(
      shifts,
      freeWeekends,
      vacations,
      secondary,
    );
    expect(marked['2026-07-01']?.marked).toBe(true);
    expect(marked['2026-07-11']?.marked).toBe(true);
    expect(marked['2026-07-15']?.marked).toBe(true);
    expect(marked['2026-07-02']?.marked).toBe(true);
  });

  it('lets shift marks override free-weekend keys on the same day', () => {
    const marked = buildMarkedDates(
      [{ date: '2026-07-11', color: '#E53935' }],
      ['2026-07-11'],
      [],
    );
    expect(marked['2026-07-11']?.marked).toBe(true);
  });
});

describe('pruneLegendFilterForMonthCounts', () => {
  const allOn = new Set([
    'shifts',
    'secondaryShifts',
    'freeWeekends',
    'vacation',
  ] as const);

  it('drops categories whose visible-month count is 0', () => {
    const next = pruneLegendFilterForMonthCounts(allOn, {
      shiftDayCount: 0,
      secondaryShiftDayCount: 2,
      freeWeekendCount: 0,
      vacationDayCount: 1,
    });
    expect([...next].sort()).toEqual(['secondaryShifts', 'vacation']);
  });

  it('keeps the same set when every selected category still has a count', () => {
    const shiftsOnly = new Set(['shifts'] as const);
    expect(
      pruneLegendFilterForMonthCounts(shiftsOnly, {
        shiftDayCount: 7,
        secondaryShiftDayCount: 0,
        freeWeekendCount: 2,
        vacationDayCount: 0,
      }),
    ).toBe(shiftsOnly);
  });
});
