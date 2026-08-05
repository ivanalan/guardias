import type { RotationPeriod } from '@/features/rotations/types';

import { getDayInfo } from './get-day-info';

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

describe('getDayInfo', () => {
  const periods = [
    period({
      id: 'p1',
      label: 'Pediatrics',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      pattern: { cycleDays: 4, offset: 'A' },
    }),
  ];

  it('returns free when no period covers the date', () => {
    expect(getDayInfo(periods, '2026-06-15')).toEqual({
      kind: 'free',
      date: '2026-06-15',
    });
  });

  it('returns free on a covered non-shift day', () => {
    expect(getDayInfo(periods, '2026-07-02')).toEqual({
      kind: 'free',
      date: '2026-07-02',
    });
  });

  it('returns shift payload on a shift day', () => {
    const info = getDayInfo(periods, '2026-07-01');
    expect(info.kind).toBe('shift');
    if (info.kind !== 'shift') {
      return;
    }
    expect(info.date).toBe('2026-07-01');
    expect(info.shift.rotationLabel).toBe('Pediatrics');
    expect(info.shift.rotationPeriodId).toBe('p1');
    expect(info.shift.durationHours).toBe(24);
    expect(info.shift.startDateTime.getHours()).toBe(7);
  });

  it('picks the covering period among sequential periods', () => {
    const sequential = [
      period({
        id: 'early',
        label: 'Early',
        startDate: '2026-01-01',
        endDate: '2026-03-31',
        pattern: { cycleDays: 4, offset: 'A' },
      }),
      period({
        id: 'late',
        label: 'Late',
        startDate: '2026-04-01',
        endDate: '2026-06-30',
        pattern: { cycleDays: 4, offset: 'A' },
      }),
    ];

    const info = getDayInfo(sequential, '2026-04-01');
    expect(info.kind).toBe('shift');
    if (info.kind === 'shift') {
      expect(info.shift.rotationPeriodId).toBe('late');
      expect(info.shift.rotationLabel).toBe('Late');
    }
  });
});
