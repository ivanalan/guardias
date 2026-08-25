import {
  findSecondaryPeriod,
  isPrimary,
  isSecondary,
  primaryPeriods,
  secondaryPeriods,
} from './period-role';
import type { RotationPeriod } from './types';

function period(
  overrides: Partial<RotationPeriod> &
    Pick<RotationPeriod, 'id' | 'startDate' | 'endDate'>,
): RotationPeriod {
  return {
    label: 'Test',
    pattern: { cycleDays: 4, offset: 'A' },
    firstShiftDate: null,
    vacationStartDate: null,
    vacationEndDate: null,
    shiftStartTime: '07:00',
    color: '#2F69F3',
    role: 'primary',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('period-role helpers', () => {
  const periods = [
    period({ id: '1', startDate: '2026-07-01', endDate: '2026-09-30' }),
    period({
      id: '2',
      startDate: '2026-07-01',
      endDate: '2026-09-30',
      role: 'secondary',
      label: 'Maria',
    }),
  ];

  it('splits primary and secondary', () => {
    expect(primaryPeriods(periods).map((p) => p.id)).toEqual(['1']);
    expect(secondaryPeriods(periods).map((p) => p.id)).toEqual(['2']);
    expect(isPrimary(periods[0]!)).toBe(true);
    expect(isSecondary(periods[1]!)).toBe(true);
  });

  it('finds the first secondary', () => {
    expect(findSecondaryPeriod(periods)?.id).toBe('2');
    expect(findSecondaryPeriod([periods[0]!])).toBeUndefined();
  });
});
