import type { RotationPeriod } from './types';

import { listShiftMonths } from './list-shift-months';

function period(
  overrides: Partial<RotationPeriod> &
    Pick<RotationPeriod, 'id' | 'startDate' | 'endDate' | 'pattern'>,
): RotationPeriod {
  return {
    label: 'Test',
    firstShiftDate: null,
    vacationStartDate: null,
    vacationEndDate: null,
    skippedDates: [],
    coveredDates: [],
    shiftStartTime: '07:00',
    shiftLengthHours: 24,
    color: '#2F69F3',
    role: 'primary',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('listShiftMonths', () => {
  it('returns sorted first-of-month dates for months with shifts', () => {
    const julAug = period({
      id: '1',
      startDate: '2026-07-01',
      endDate: '2026-08-31',
      pattern: { cycleDays: 4, offset: 'C' },
    });

    expect(listShiftMonths(julAug)).toEqual(['2026-07-01', '2026-08-01']);
  });

  it('returns empty when the period has no shift days', () => {
    const empty = period({
      id: '1',
      startDate: '2026-07-01',
      endDate: '2026-07-03',
      pattern: { cycleDays: 4, offset: 'A' },
    });

    expect(listShiftMonths(empty)).toEqual([]);
  });
});
