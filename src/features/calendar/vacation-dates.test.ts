import type { RotationPeriod } from '../rotations/types';

import { listVacationDatesInRange } from './vacation-dates';

function period(
  overrides: Partial<RotationPeriod> &
    Pick<RotationPeriod, 'id' | 'startDate' | 'endDate' | 'pattern'>,
): RotationPeriod {
  return {
    label: 'Test',
    vacationStartDate: null,
    vacationEndDate: null,
    shiftStartTime: '07:00',
    color: '#2F69F3',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('listVacationDatesInRange', () => {
  it('returns empty when no vacations are set', () => {
    const periods = [
      period({
        id: 'p1',
        startDate: '2026-07-01',
        endDate: '2026-07-31',
        pattern: { cycleDays: 4, offset: 'A' },
      }),
    ];
    expect(listVacationDatesInRange(periods, '2026-07-01', '2026-07-31')).toEqual(
      [],
    );
  });

  it('lists inclusive vacation days clamped to the range', () => {
    const periods = [
      period({
        id: 'p1',
        startDate: '2026-07-01',
        endDate: '2026-07-31',
        pattern: { cycleDays: 4, offset: 'A' },
        vacationStartDate: '2026-07-10',
        vacationEndDate: '2026-07-12',
      }),
    ];

    expect(listVacationDatesInRange(periods, '2026-07-11', '2026-07-20')).toEqual(
      ['2026-07-11', '2026-07-12'],
    );
  });

  it('returns empty when vacation is outside the queried range', () => {
    const periods = [
      period({
        id: 'p1',
        startDate: '2026-07-01',
        endDate: '2026-07-31',
        pattern: { cycleDays: 4, offset: 'A' },
        vacationStartDate: '2026-07-01',
        vacationEndDate: '2026-07-03',
      }),
    ];

    expect(listVacationDatesInRange(periods, '2026-07-10', '2026-07-20')).toEqual(
      [],
    );
  });
});
