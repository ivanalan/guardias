import type { RotationPeriod } from '../rotations/types';

import {
  getMarkInputsForMonthWindow,
  getMonthLegendStats,
  getMonthMarkInputs,
} from './month-legend-stats';

function period(
  overrides: Partial<RotationPeriod> &
    Pick<RotationPeriod, 'id' | 'startDate' | 'endDate' | 'pattern'>,
): RotationPeriod {
  return {
    label: 'Test',
    firstShiftDate: null,
    vacationStartDate: null,
    vacationEndDate: null,
    shiftStartTime: '07:00',
    color: '#2F69F3',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('getMonthLegendStats', () => {
  it('returns 0 shift days and all free weekends when there are no periods', () => {
    const stats = getMonthLegendStats([], '2026-07-15');
    expect(stats.shiftDayCount).toBe(0);
    expect(stats.freeWeekendCount).toBe(4);
    expect(stats.vacationDayCount).toBe(0);
  });

  it('returns 0 free weekends when every weekend has a shift', () => {
    // Cover every Jul 2026 day letter so each weekend has a shift.
    const periods = (
      [
        ['pA', 'A'],
        ['pB', 'B'],
        ['pC', 'C'],
        ['pD', 'D'],
      ] as const
    ).map(([id, offset]) =>
      period({
        id,
        startDate: '2026-07-01',
        endDate: '2026-07-31',
        pattern: { cycleDays: 4, offset },
      }),
    );

    const stats = getMonthLegendStats(periods, '2026-07-15');
    expect(stats.freeWeekendCount).toBe(0);
    expect(stats.shiftDayCount).toBeGreaterThan(0);
    expect(stats.vacationDayCount).toBe(0);
  });

  it('counts shift days and free weekend pairs in the month', () => {
    // A-D offset A (Jan 1 = A): Jul A days are 4, 8, 12, 16, 20, 24, 28.
    const july = period({
      id: 'p1',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      pattern: { cycleDays: 4, offset: 'A' },
    });

    const stats = getMonthLegendStats([july], '2026-07-15');
    expect(stats.shiftDayCount).toBe(7);
    // Jul 4–5 (Sat A) no; 11–12 (Sun A) no; 18–19 yes; 25–26 yes
    expect(stats.freeWeekendCount).toBe(2);
    expect(stats.vacationDayCount).toBe(0);
  });

  it('counts vacation days in the month', () => {
    const july = period({
      id: 'p1',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      pattern: { cycleDays: 4, offset: 'A' },
      vacationStartDate: '2026-07-10',
      vacationEndDate: '2026-07-12',
    });

    const stats = getMonthLegendStats([july], '2026-07-15');
    expect(stats.vacationDayCount).toBe(3);
    // Jul 12 is an A shift day; vacation removes it → 6 shifts
    expect(stats.shiftDayCount).toBe(6);
  });

  it('excludes vacation days from shift day count', () => {
    const july = period({
      id: 'p1',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      pattern: { cycleDays: 4, offset: 'A' },
      vacationStartDate: '2026-07-04',
      vacationEndDate: '2026-07-04',
    });

    const stats = getMonthLegendStats([july], '2026-07-15');
    expect(stats.vacationDayCount).toBe(1);
    // Without vacation: 7 shifts; Jul 4 excluded → 6
    expect(stats.shiftDayCount).toBe(6);
  });

  it('counts a free weekend that only partially falls in the month', () => {
    // Aug 1 2026 is Saturday; with no shifts, Aug 1–2 is a free weekend
    expect(
      getMonthLegendStats([], '2026-08-01').freeWeekendCount,
    ).toBeGreaterThan(0);
  });
});

describe('getMarkInputsForMonthWindow', () => {
  it('merges marks across adjacent months and keeps center legend counts', () => {
    const span = period({
      id: 'p1',
      startDate: '2026-06-01',
      endDate: '2026-08-31',
      pattern: { cycleDays: 4, offset: 'A' },
    });

    const center = getMonthMarkInputs([span], '2026-07-15');
    const window = getMarkInputsForMonthWindow([span], '2026-07-15', 1);

    expect(window.shiftDayCount).toBe(center.shiftDayCount);
    expect(window.freeWeekendCount).toBe(center.freeWeekendCount);
    expect(window.vacationDayCount).toBe(center.vacationDayCount);

    const june = getMonthMarkInputs([span], '2026-06-15');
    const august = getMonthMarkInputs([span], '2026-08-15');
    const expectedShiftDates = new Set([
      ...june.shiftMarks.map((m) => m.date),
      ...center.shiftMarks.map((m) => m.date),
      ...august.shiftMarks.map((m) => m.date),
    ]);

    expect(window.shiftMarks.map((m) => m.date).sort()).toEqual(
      [...expectedShiftDates].sort(),
    );
    expect(window.shiftMarks.length).toBeGreaterThan(center.shiftMarks.length);
  });

  it('with radius 0 matches a single month', () => {
    const july = period({
      id: 'p1',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      pattern: { cycleDays: 4, offset: 'A' },
    });

    const single = getMonthMarkInputs([july], '2026-07-15');
    const window = getMarkInputsForMonthWindow([july], '2026-07-15', 0);

    expect(window).toEqual(single);
  });
});
