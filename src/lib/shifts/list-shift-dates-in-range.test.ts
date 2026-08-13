import type { RotationPeriod } from '@/features/rotations/types';

import { listShiftDatesInRange } from './list-shift-dates-in-range';

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

describe('listShiftDatesInRange', () => {
  it('lists A-D A shifts for a short window', () => {
    const periods = [
      period({
        id: '1',
        startDate: '2026-07-01',
        endDate: '2026-07-16',
        pattern: { cycleDays: 4, offset: 'A' },
      }),
    ];

    // Jan 1 2026 = A → Jul A days are 4, 8, 12, 16.
    expect(listShiftDatesInRange(periods, '2026-07-01', '2026-07-16')).toEqual([
      '2026-07-04',
      '2026-07-08',
      '2026-07-12',
      '2026-07-16',
    ]);
  });

  it('uses only periods that cover each day (sequential periods)', () => {
    const periods = [
      period({
        id: '1',
        startDate: '2026-07-01',
        endDate: '2026-09-30',
        pattern: { cycleDays: 4, offset: 'A' },
      }),
      period({
        id: '2',
        startDate: '2026-10-01',
        endDate: '2026-12-31',
        pattern: { cycleDays: 4, offset: 'B' },
      }),
    ];

    // Sep 30 is the last A in period 1; Oct 1 is B (first B shift in period 2).
    expect(listShiftDatesInRange(periods, '2026-09-27', '2026-10-04')).toEqual([
      '2026-09-30',
      '2026-10-01',
    ]);
  });

  it('returns empty when from is after to', () => {
    expect(listShiftDatesInRange([], '2026-07-10', '2026-07-01')).toEqual([]);
  });
});
