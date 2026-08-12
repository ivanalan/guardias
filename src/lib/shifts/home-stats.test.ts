import type { RotationPeriod } from '@/features/rotations/types';

import {
  getHomepageShiftStatus,
  getPeriodShiftProgress,
} from './get-homepage-shift-status';
import {
  getNextFreeWeekend,
  getPeriodHoursWorked,
  getTimeUntilNextShift,
} from './home-stats';
import { SHIFT_DURATION_HOURS } from './build-shift';

function period(
  overrides: Partial<RotationPeriod> &
    Pick<RotationPeriod, 'id' | 'startDate' | 'endDate' | 'pattern'>,
): RotationPeriod {
  return {
    label: 'Internal medicine',
    vacationStartDate: null,
    vacationEndDate: null,
    shiftStartTime: '07:00',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function localDate(
  year: number,
  monthIndex: number,
  day: number,
  hour = 0,
  minute = 0,
): Date {
  return new Date(year, monthIndex, day, hour, minute, 0, 0);
}

describe('getPeriodHoursWorked', () => {
  const julyPeriod = period({
    id: 'p1',
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    pattern: { cycleDays: 4, offset: 'A' },
  });

  it('counts finished shifts × 24 with no active shift', () => {
    // After Jul 1 shift ends (Jul 2 08:00); one completed shift.
    const now = localDate(2026, 6, 2, 8, 0);
    const { completed } = getPeriodShiftProgress(julyPeriod, now);
    expect(completed).toBe(1);
    expect(getPeriodHoursWorked(julyPeriod, now)).toBe(
      completed * SHIFT_DURATION_HOURS,
    );
  });

  it('adds floored elapsed hours during an in-progress shift', () => {
    // Jul 1 07:00 start; now Jul 1 15:30 → 8h elapsed + 0 completed.
    const now = localDate(2026, 6, 1, 15, 30);
    expect(getPeriodHoursWorked(julyPeriod, now)).toBe(8);
  });
});

describe('getTimeUntilNextShift', () => {
  const julyPeriod = period({
    id: 'p1',
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    pattern: { cycleDays: 4, offset: 'A' },
  });

  it('returns untilStart when between shifts', () => {
    const now = localDate(2026, 6, 2, 10, 0);
    const status = getHomepageShiftStatus([julyPeriod], now);
    expect(getTimeUntilNextShift(status, now)).toEqual({ days: 2, hours: 21 });
  });

  it('returns countdown to following shift while in shift', () => {
    const now = localDate(2026, 6, 1, 15, 0);
    const status = getHomepageShiftStatus([julyPeriod], now);
    expect(status.kind).toBe('in_shift');
    // Next after Jul 1 is Jul 5 07:00 → from Jul 1 15:00 = 3d 16h.
    expect(getTimeUntilNextShift(status, now)).toEqual({ days: 3, hours: 16 });
  });

  it('returns null when idle', () => {
    const now = localDate(2026, 6, 1, 12);
    expect(getTimeUntilNextShift(getHomepageShiftStatus([], now), now)).toBe(
      null,
    );
  });
});

describe('getNextFreeWeekend', () => {
  // A-D offset A: shifts Jul 1, 5, 9, 13, 17, 21, 25, 29.
  // Free weekends: Sat+Sun both free.
  // Jul 4–5: Jul 5 is shift → not free.
  // Jul 11–12: both free.
  const julyPeriod = period({
    id: 'p1',
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    pattern: { cycleDays: 4, offset: 'A' },
  });

  it('finds the next free Saturday after now', () => {
    const now = localDate(2026, 6, 2, 10, 0); // Thu Jul 2
    const result = getNextFreeWeekend(julyPeriod, now);
    expect(result).not.toBeNull();
    expect(result!.saturdayIso).toBe('2026-07-11');
    expect(result!.isNow).toBe(false);
    // Until Sat Jul 11 00:00 from Thu Jul 2 10:00 = 8d 14h.
    expect(result!.until).toEqual({ days: 8, hours: 14 });
  });

  it('marks isNow when currently on a free weekend day', () => {
    const now = localDate(2026, 6, 11, 12, 0); // Sat Jul 11
    const result = getNextFreeWeekend(julyPeriod, now);
    expect(result).not.toBeNull();
    expect(result!.saturdayIso).toBe('2026-07-11');
    expect(result!.isNow).toBe(true);
    expect(result!.until).toEqual({ days: 0, hours: 0 });
  });

  it('returns null when no free weekend remains in the period', () => {
    const short = period({
      id: 'p-short',
      startDate: '2026-07-01',
      endDate: '2026-07-05',
      pattern: { cycleDays: 4, offset: 'A' },
    });
    // Jul 4–5: Jul 5 is a shift → no free weekend in range.
    expect(getNextFreeWeekend(short, localDate(2026, 6, 1))).toBeNull();
  });
});
