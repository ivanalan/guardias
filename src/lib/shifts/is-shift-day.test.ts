import type { RotationPeriod } from '@/features/rotations/types';

import {
  getDefaultFirstShiftDate,
  isShiftDay,
  isSkippedPatternDay,
} from './is-shift-day';

function period(
  overrides: Partial<RotationPeriod> &
    Pick<RotationPeriod, 'startDate' | 'endDate' | 'pattern'>,
): RotationPeriod {
  return {
    id: 'test',
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

describe('getDefaultFirstShiftDate', () => {
  it('returns the first Jan 1 letter match on/after startDate', () => {
    // Jul 1 2026 = B; letter D → Jul 3
    expect(
      getDefaultFirstShiftDate('2026-07-01', '2026-07-31', {
        cycleDays: 4,
        offset: 'D',
      }),
    ).toBe('2026-07-03');
  });

  it('returns null when no letter day falls in the range', () => {
    expect(
      getDefaultFirstShiftDate('2026-07-01', '2026-07-02', {
        cycleDays: 4,
        offset: 'D',
      }),
    ).toBeNull();
  });
});

describe('isShiftDay', () => {
  it('anchors A-D to Jan 1 of the year (A), independent of period start', () => {
    // 2026-01-01 = A. 2026-07-01 = B, so offset A shifts are Jul 4, 8, 12, …
    const p = period({
      startDate: '2026-07-01',
      endDate: '2026-07-16',
      pattern: { cycleDays: 4, offset: 'A' },
    });

    expect(isShiftDay(p, '2026-07-01')).toBe(false);
    expect(isShiftDay(p, '2026-07-04')).toBe(true);
    expect(isShiftDay(p, '2026-07-08')).toBe(true);
    expect(isShiftDay(p, '2026-07-12')).toBe(true);
    expect(isShiftDay(p, '2026-07-16')).toBe(true);
  });

  it('respects B offset within A-D on the year calendar', () => {
    const p = period({
      startDate: '2026-07-01',
      endDate: '2026-07-10',
      pattern: { cycleDays: 4, offset: 'B' },
    });

    expect(isShiftDay(p, '2026-07-01')).toBe(true);
    expect(isShiftDay(p, '2026-07-02')).toBe(false);
    expect(isShiftDay(p, '2026-07-05')).toBe(true);
  });

  it('uses a 3-day cycle for A-C anchored to Jan 1', () => {
    // 2026-07-01 = B on A-C; A days are Jul 3, 6, 9, …
    const p = period({
      startDate: '2026-07-01',
      endDate: '2026-07-10',
      pattern: { cycleDays: 3, offset: 'A' },
    });

    expect(isShiftDay(p, '2026-07-01')).toBe(false);
    expect(isShiftDay(p, '2026-07-03')).toBe(true);
    expect(isShiftDay(p, '2026-07-06')).toBe(true);
    expect(isShiftDay(p, '2026-07-09')).toBe(true);
  });

  it('uses a 5-day cycle for A-E anchored to Jan 1', () => {
    // 2026-07-01 = B on A-E; A days are Jul 5, 10, …
    const p = period({
      startDate: '2026-07-01',
      endDate: '2026-07-15',
      pattern: { cycleDays: 5, offset: 'A' },
    });

    expect(isShiftDay(p, '2026-07-01')).toBe(false);
    expect(isShiftDay(p, '2026-07-05')).toBe(true);
    expect(isShiftDay(p, '2026-07-10')).toBe(true);
    expect(isShiftDay(p, '2026-07-15')).toBe(true);
  });

  it('returns false outside the period bounds', () => {
    const p = period({
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      pattern: { cycleDays: 4, offset: 'A' },
    });

    expect(isShiftDay(p, '2026-06-27')).toBe(false);
    expect(isShiftDay(p, '2026-08-01')).toBe(false);
  });

  it('excludes vacation days that would otherwise be shifts', () => {
    const p = period({
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      pattern: { cycleDays: 4, offset: 'A' },
      vacationStartDate: '2026-07-04',
      vacationEndDate: '2026-07-05',
    });

    expect(isShiftDay(p, '2026-07-04')).toBe(false);
    expect(isShiftDay(p, '2026-07-08')).toBe(true);
  });

  it('resets the letter calendar on Jan 1 of each year', () => {
    // 2025-12-31 and 2026-01-01 are both A when each year starts at A.
    const p = period({
      startDate: '2025-12-28',
      endDate: '2026-01-10',
      pattern: { cycleDays: 4, offset: 'A' },
    });

    expect(isShiftDay(p, '2025-12-31')).toBe(true);
    expect(isShiftDay(p, '2026-01-01')).toBe(true);
    expect(isShiftDay(p, '2026-01-05')).toBe(true);
  });

  it('counts leap day in the year-day cycle', () => {
    // 2024-01-01 = A → 2024-02-28 = C, 2024-02-29 = D, 2024-03-01 = A.
    const p = period({
      startDate: '2024-02-28',
      endDate: '2024-03-05',
      pattern: { cycleDays: 4, offset: 'A' },
    });

    expect(isShiftDay(p, '2024-02-28')).toBe(false);
    expect(isShiftDay(p, '2024-02-29')).toBe(false);
    expect(isShiftDay(p, '2024-03-01')).toBe(true);
    expect(isShiftDay(p, '2024-03-05')).toBe(true);
  });

  it('uses firstShiftDate every-N cycle when overridden (keeps letter as identity)', () => {
    // Jan 1 D days would be Jul 3, 7, 11…; override starts Jul 2 → 2, 6, 10…
    const p = period({
      startDate: '2026-07-01',
      endDate: '2026-07-16',
      pattern: { cycleDays: 4, offset: 'D' },
      firstShiftDate: '2026-07-02',
    });

    expect(isShiftDay(p, '2026-07-01')).toBe(false);
    expect(isShiftDay(p, '2026-07-02')).toBe(true);
    expect(isShiftDay(p, '2026-07-03')).toBe(false);
    expect(isShiftDay(p, '2026-07-06')).toBe(true);
    expect(isShiftDay(p, '2026-07-10')).toBe(true);
    expect(isShiftDay(p, '2026-07-14')).toBe(true);
  });

  it('still uses Jan 1 letter D when firstShiftDate is null', () => {
    const p = period({
      startDate: '2026-07-01',
      endDate: '2026-07-16',
      pattern: { cycleDays: 4, offset: 'D' },
      firstShiftDate: null,
    });

    expect(isShiftDay(p, '2026-07-02')).toBe(false);
    expect(isShiftDay(p, '2026-07-03')).toBe(true);
    expect(isShiftDay(p, '2026-07-07')).toBe(true);
  });

  it('excludes vacation days under firstShiftDate override', () => {
    const p = period({
      startDate: '2026-07-01',
      endDate: '2026-07-16',
      pattern: { cycleDays: 4, offset: 'D' },
      firstShiftDate: '2026-07-02',
      vacationStartDate: '2026-07-06',
      vacationEndDate: '2026-07-06',
    });

    expect(isShiftDay(p, '2026-07-06')).toBe(false);
    expect(isShiftDay(p, '2026-07-10')).toBe(true);
  });

  it('skips pattern days listed in skippedDates', () => {
    const p = period({
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      pattern: { cycleDays: 4, offset: 'A' },
      skippedDates: ['2026-07-04'],
    });

    expect(isShiftDay(p, '2026-07-04')).toBe(false);
    expect(isSkippedPatternDay(p, '2026-07-04')).toBe(true);
    expect(isShiftDay(p, '2026-07-08')).toBe(true);
  });

  it('treats coveredDates as shifts even over vacation', () => {
    const p = period({
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      pattern: { cycleDays: 4, offset: 'A' },
      vacationStartDate: '2026-07-04',
      vacationEndDate: '2026-07-05',
      coveredDates: ['2026-07-04', '2026-07-02'],
    });

    expect(isShiftDay(p, '2026-07-04')).toBe(true);
    expect(isShiftDay(p, '2026-07-02')).toBe(true);
    expect(isShiftDay(p, '2026-07-05')).toBe(false);
  });

  it('lets skippedDates win over coveredDates when both list the date', () => {
    const p = period({
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      pattern: { cycleDays: 4, offset: 'A' },
      skippedDates: ['2026-07-02'],
      coveredDates: ['2026-07-02'],
    });

    expect(isShiftDay(p, '2026-07-02')).toBe(false);
  });
});
