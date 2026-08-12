import type { RotationPeriod } from '../rotations/types';

import { getMonthLegendStats } from './month-legend-stats';

function period(
  overrides: Partial<RotationPeriod> &
    Pick<RotationPeriod, 'id' | 'startDate' | 'endDate' | 'pattern'>,
): RotationPeriod {
  return {
    label: 'Test',
    vacationStartDate: null,
    vacationEndDate: null,
    shiftStartTime: '07:00',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('getMonthLegendStats', () => {
  it('returns 0 shift days and all free weekends when there are no periods', () => {
    const stats = getMonthLegendStats([], '2026-07-15');
    expect(stats.shiftDayCount).toBe(0);
    expect(stats.freeWeekendCount).toBe(4);
  });

  it('returns 0 free weekends when every weekend has a shift', () => {
    // Cover every Jul 2026 weekend day with a shift via overlapping A-D periods.
    const periods = [
      period({
        id: 'p1',
        startDate: '2026-07-01',
        endDate: '2026-07-31',
        pattern: { cycleDays: 4, offset: 'A' },
      }),
      period({
        id: 'p2',
        startDate: '2026-07-11',
        endDate: '2026-07-31',
        pattern: { cycleDays: 4, offset: 'A' },
      }),
      period({
        id: 'p3',
        startDate: '2026-07-12',
        endDate: '2026-07-31',
        pattern: { cycleDays: 4, offset: 'A' },
      }),
      period({
        id: 'p4',
        startDate: '2026-07-18',
        endDate: '2026-07-31',
        pattern: { cycleDays: 4, offset: 'A' },
      }),
    ];

    const stats = getMonthLegendStats(periods, '2026-07-15');
    expect(stats.freeWeekendCount).toBe(0);
    expect(stats.shiftDayCount).toBeGreaterThan(0);
  });

  it('counts shift days and free weekend pairs in the month', () => {
    // A-D offset A starting Jul 1: shifts on Jul 1, 5, 9, 13, 17, 21, 25, 29
    const july = period({
      id: 'p1',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      pattern: { cycleDays: 4, offset: 'A' },
    });

    const stats = getMonthLegendStats([july], '2026-07-15');
    expect(stats.shiftDayCount).toBe(8);
    // Jul 4–5 (Sun shift) no; 11–12 yes; 18–19 yes; 25–26 (Sat shift) no
    expect(stats.freeWeekendCount).toBe(2);
  });

  it('counts a free weekend that only partially falls in the month', () => {
    // Aug 1 2026 is Saturday; with no shifts, Aug 1–2 is a free weekend
    expect(
      getMonthLegendStats([], '2026-08-01').freeWeekendCount,
    ).toBeGreaterThan(0);
  });
});
