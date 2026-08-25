import type { RotationPeriod } from '@/features/rotations/types';

import {
  countShiftsRemaining,
  formatDurationParts,
  getHomepageShiftStatus,
  getPeriodDayProgress,
  getPeriodShiftProgress,
} from './get-homepage-shift-status';

function period(
  overrides: Partial<RotationPeriod> &
    Pick<RotationPeriod, 'id' | 'startDate' | 'endDate' | 'pattern'>,
): RotationPeriod {
  return {
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

/** Local wall-clock `Date` for tests (avoids UTC string parsing surprises). */
function localDate(
  year: number,
  monthIndex: number,
  day: number,
  hour = 0,
  minute = 0,
): Date {
  return new Date(year, monthIndex, day, hour, minute, 0, 0);
}

describe('formatDurationParts', () => {
  it('splits elapsed time into whole days and leftover hours', () => {
    const from = localDate(2026, 6, 1, 7, 0);
    const to = localDate(2026, 6, 3, 10, 0);
    expect(formatDurationParts(from, to)).toEqual({ days: 2, hours: 3 });
  });

  it('floors partial hours and never goes negative', () => {
    const from = localDate(2026, 6, 1, 7, 0);
    const to = localDate(2026, 6, 1, 8, 45);
    expect(formatDurationParts(from, to)).toEqual({ days: 0, hours: 1 });
    expect(formatDurationParts(to, from)).toEqual({ days: 0, hours: 0 });
  });
});

describe('getHomepageShiftStatus', () => {
  const julyPeriod = period({
    id: 'p1',
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    pattern: { cycleDays: 4, offset: 'B' },
  });

  it('returns idle when there are no periods', () => {
    expect(getHomepageShiftStatus([], localDate(2026, 6, 1, 12))).toEqual({
      kind: 'idle',
    });
  });

  it('returns idle when all periods are fully in the past', () => {
    const past = period({
      id: 'past',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      pattern: { cycleDays: 4, offset: 'A' },
    });
    expect(getHomepageShiftStatus([past], localDate(2026, 6, 1, 12))).toEqual({
      kind: 'idle',
    });
  });

  it('returns between_shifts with countdown to the next start', () => {
    // Jul 1 is B; next is Jul 5. Now = Jul 2 10:00 → 2d 21h until Jul 5 07:00.
    const status = getHomepageShiftStatus(
      [julyPeriod],
      localDate(2026, 6, 2, 10, 0),
    );

    expect(status.kind).toBe('between_shifts');
    if (status.kind !== 'between_shifts') {
      return;
    }
    expect(status.nextShift.date).toBe('2026-07-05');
    expect(status.untilStart).toEqual({ days: 2, hours: 21 });
    expect(status.period.id).toBe('p1');
    expect(status.shiftsRemaining).toBe(
      countShiftsRemaining(julyPeriod, localDate(2026, 6, 2, 10, 0)),
    );
    expect(status.shiftsRemaining).toBeGreaterThan(0);
  });

  it('returns in_shift with remaining time during a shift', () => {
    // Jul 1 07:00 – Jul 2 07:00. Now = Jul 1 15:00 → 16h left.
    const status = getHomepageShiftStatus(
      [julyPeriod],
      localDate(2026, 6, 1, 15, 0),
    );

    expect(status.kind).toBe('in_shift');
    if (status.kind !== 'in_shift') {
      return;
    }
    expect(status.currentShift.date).toBe('2026-07-01');
    expect(status.remainingInShift).toEqual({ days: 0, hours: 16 });
    expect(status.nextShift?.date).toBe('2026-07-05');
    // In-progress shift is not counted as remaining.
    expect(status.shiftsRemaining).toBe(
      countShiftsRemaining(julyPeriod, localDate(2026, 6, 1, 15, 0)),
    );
  });

  it('detects in_shift after midnight when the shift started yesterday', () => {
    // Jul 1 07:00 – Jul 2 07:00. Now = Jul 2 03:00 → still in shift, 4h left.
    const status = getHomepageShiftStatus(
      [julyPeriod],
      localDate(2026, 6, 2, 3, 0),
    );

    expect(status.kind).toBe('in_shift');
    if (status.kind !== 'in_shift') {
      return;
    }
    expect(status.currentShift.date).toBe('2026-07-01');
    expect(status.remainingInShift).toEqual({ days: 0, hours: 4 });
  });

  it('skips a vacation day that would otherwise be the next shift', () => {
    const withVacation = period({
      id: 'p1',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      pattern: { cycleDays: 4, offset: 'B' },
      vacationStartDate: '2026-07-05',
      vacationEndDate: '2026-07-05',
    });

    const status = getHomepageShiftStatus(
      [withVacation],
      localDate(2026, 6, 2, 10, 0),
    );

    expect(status.kind).toBe('between_shifts');
    if (status.kind !== 'between_shifts') {
      return;
    }
    // Jul 5 skipped; next B day is Jul 9.
    expect(status.nextShift.date).toBe('2026-07-09');
  });

  it('finds the next shift across a year boundary', () => {
    const span = period({
      id: 'nye',
      startDate: '2026-12-20',
      endDate: '2027-01-15',
      pattern: { cycleDays: 4, offset: 'A' },
    });
    // Dec 31 and Jan 1 are both A (year calendar resets). During Dec 31 shift,
    // the following A day is Jan 1 2027.
    const status = getHomepageShiftStatus(
      [span],
      localDate(2026, 11, 31, 12, 0),
    );

    expect(status.kind).toBe('in_shift');
    if (status.kind !== 'in_shift') {
      return;
    }
    expect(status.currentShift.date).toBe('2026-12-31');
    expect(status.nextShift?.date).toBe('2027-01-01');
  });

  it('uses the upcoming period when current calendar day has no period', () => {
    const later = period({
      id: 'p2',
      startDate: '2026-10-01',
      endDate: '2026-10-31',
      pattern: { cycleDays: 4, offset: 'B' },
    });

    const status = getHomepageShiftStatus(
      [julyPeriod, later],
      localDate(2026, 8, 15, 12, 0),
    );

    expect(status.kind).toBe('between_shifts');
    if (status.kind !== 'between_shifts') {
      return;
    }
    // Oct 1 2026 is B on the year calendar.
    expect(status.period.id).toBe('p2');
    expect(status.nextShift.date).toBe('2026-10-01');
  });
});

describe('getPeriodShiftProgress', () => {
  const julyPeriod = period({
    id: 'p1',
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    pattern: { cycleDays: 4, offset: 'B' },
  });

  it('returns zeros before the period starts', () => {
    expect(
      getPeriodShiftProgress(julyPeriod, localDate(2026, 5, 15, 12)),
    ).toEqual({ completed: 0, total: 8, progress: 0 });
  });

  it('counts a shift as completed only after it ends', () => {
    // Jul 1 shift ends Jul 2 07:00. Mid-shift → 0 completed.
    expect(
      getPeriodShiftProgress(julyPeriod, localDate(2026, 6, 1, 15)),
    ).toEqual({ completed: 0, total: 8, progress: 0 });

    // Just after first shift ends.
    const afterFirst = getPeriodShiftProgress(
      julyPeriod,
      localDate(2026, 6, 2, 7),
    );
    expect(afterFirst.completed).toBe(1);
    expect(afterFirst.total).toBe(8);
    expect(afterFirst.progress).toBeCloseTo(1 / 8);
  });

  it('excludes vacation shift days from total', () => {
    const withVacation = period({
      id: 'p1',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      pattern: { cycleDays: 4, offset: 'B' },
      vacationStartDate: '2026-07-05',
      vacationEndDate: '2026-07-05',
    });

    const progress = getPeriodShiftProgress(
      withVacation,
      localDate(2026, 5, 15, 12),
    );
    expect(progress.total).toBe(7);
    expect(progress.completed).toBe(0);
    expect(progress.progress).toBe(0);
  });

  it('returns full progress after the last shift ends', () => {
    // Last B day in July 2026 is Jul 29 (01,05,09,13,17,21,25,29).
    const afterLast = getPeriodShiftProgress(
      julyPeriod,
      localDate(2026, 6, 30, 8),
    );
    expect(afterLast.completed).toBe(8);
    expect(afterLast.total).toBe(8);
    expect(afterLast.progress).toBe(1);
  });
});

describe('getPeriodDayProgress', () => {
  const julyPeriod = period({
    id: 'p1',
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    pattern: { cycleDays: 4, offset: 'B' },
  });

  it('returns full remaining before the period starts', () => {
    expect(getPeriodDayProgress(julyPeriod, '2026-06-15')).toEqual({
      completed: 0,
      total: 31,
      progress: 0,
    });
  });

  it('counts inclusive calendar days mid-period', () => {
    // Jul 1–31 = 31 days; on Jul 10 → 22 days left (10..31), 9 completed.
    const mid = getPeriodDayProgress(julyPeriod, '2026-07-10');
    expect(mid.completed).toBe(9);
    expect(mid.total).toBe(31);
    expect(mid.progress).toBeCloseTo(9 / 31);
  });

  it('includes today on the start and end dates', () => {
    expect(getPeriodDayProgress(julyPeriod, '2026-07-01')).toEqual({
      completed: 0,
      total: 31,
      progress: 0,
    });
    const onEnd = getPeriodDayProgress(julyPeriod, '2026-07-31');
    expect(onEnd.completed).toBe(30);
    expect(onEnd.total).toBe(31);
    expect(onEnd.progress).toBeCloseTo(30 / 31);
  });

  it('returns full completed after the period ends', () => {
    expect(getPeriodDayProgress(julyPeriod, '2026-08-01')).toEqual({
      completed: 31,
      total: 31,
      progress: 1,
    });
  });
});
