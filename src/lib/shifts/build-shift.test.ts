import type { RotationPeriod } from '@/features/rotations/types';

import { buildShift, SHIFT_DURATION_HOURS } from './build-shift';

function period(
  overrides: Partial<RotationPeriod> &
    Pick<RotationPeriod, 'startDate' | 'endDate' | 'pattern'>,
): RotationPeriod {
  return {
    id: 'period-1',
    label: 'Internal medicine',
    firstShiftDate: null,
    vacationStartDate: null,
    vacationEndDate: null,
    shiftStartTime: '07:00',
    color: '#2F69F3',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('buildShift', () => {
  it('returns null on a non-shift day', () => {
    const p = period({
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      pattern: { cycleDays: 4, offset: 'B' },
    });

    // Jul 1 2026 is B; Jul 2 is C.
    expect(buildShift(p, '2026-07-02')).toBeNull();
  });

  it('builds start/end from date + shiftStartTime', () => {
    const p = period({
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      pattern: { cycleDays: 4, offset: 'B' },
      shiftStartTime: '07:00',
    });

    const shift = buildShift(p, '2026-07-01');
    expect(shift).not.toBeNull();
    expect(shift!.date).toBe('2026-07-01');
    expect(shift!.durationHours).toBe(SHIFT_DURATION_HOURS);
    expect(shift!.rotationPeriodId).toBe('period-1');
    expect(shift!.rotationLabel).toBe('Internal medicine');
    expect(shift!.startDateTime.getFullYear()).toBe(2026);
    expect(shift!.startDateTime.getMonth()).toBe(6); // July
    expect(shift!.startDateTime.getDate()).toBe(1);
    expect(shift!.startDateTime.getHours()).toBe(7);
    expect(shift!.startDateTime.getMinutes()).toBe(0);
    expect(shift!.endDateTime.getTime()).toBe(
      shift!.startDateTime.getTime() + 24 * 60 * 60 * 1000,
    );
  });

  it('respects a custom shift start time and crosses midnight for end', () => {
    const p = period({
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      pattern: { cycleDays: 4, offset: 'B' },
      shiftStartTime: '19:30',
    });

    const shift = buildShift(p, '2026-07-01');
    expect(shift).not.toBeNull();
    expect(shift!.startDateTime.getHours()).toBe(19);
    expect(shift!.startDateTime.getMinutes()).toBe(30);
    expect(shift!.endDateTime.getDate()).toBe(2);
    expect(shift!.endDateTime.getHours()).toBe(19);
    expect(shift!.endDateTime.getMinutes()).toBe(30);
  });

  it('returns null on a vacation day that would otherwise be a shift', () => {
    const p = period({
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      pattern: { cycleDays: 4, offset: 'B' },
      vacationStartDate: '2026-07-05',
      vacationEndDate: '2026-07-06',
    });

    expect(buildShift(p, '2026-07-05')).toBeNull();
  });
});
