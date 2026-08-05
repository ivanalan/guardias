import type { RotationPeriod } from '@/features/rotations/types';

import { isShiftDay } from './is-shift-day';

function period(
  overrides: Partial<RotationPeriod> &
    Pick<RotationPeriod, 'startDate' | 'endDate' | 'pattern'>,
): RotationPeriod {
  return {
    id: 'test',
    label: 'Test',
    vacationStartDate: null,
    vacationEndDate: null,
    shiftStartTime: '07:00',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('isShiftDay', () => {
  it('marks every 4th day starting at A (A-D)', () => {
    const p = period({
      startDate: '2026-07-01',
      endDate: '2026-07-16',
      pattern: { cycleDays: 4, offset: 'A' },
    });

    expect(isShiftDay(p, '2026-07-01')).toBe(true);
    expect(isShiftDay(p, '2026-07-02')).toBe(false);
    expect(isShiftDay(p, '2026-07-05')).toBe(true);
    expect(isShiftDay(p, '2026-07-09')).toBe(true);
    expect(isShiftDay(p, '2026-07-13')).toBe(true);
  });

  it('respects B offset within A-D', () => {
    const p = period({
      startDate: '2026-07-01',
      endDate: '2026-07-10',
      pattern: { cycleDays: 4, offset: 'B' },
    });

    expect(isShiftDay(p, '2026-07-01')).toBe(false);
    expect(isShiftDay(p, '2026-07-02')).toBe(true);
    expect(isShiftDay(p, '2026-07-06')).toBe(true);
  });

  it('uses a 3-day cycle for A-C', () => {
    const p = period({
      startDate: '2026-07-01',
      endDate: '2026-07-10',
      pattern: { cycleDays: 3, offset: 'A' },
    });

    expect(isShiftDay(p, '2026-07-01')).toBe(true);
    expect(isShiftDay(p, '2026-07-02')).toBe(false);
    expect(isShiftDay(p, '2026-07-04')).toBe(true);
    expect(isShiftDay(p, '2026-07-07')).toBe(true);
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
      vacationStartDate: '2026-07-05',
      vacationEndDate: '2026-07-06',
    });

    expect(isShiftDay(p, '2026-07-01')).toBe(true);
    expect(isShiftDay(p, '2026-07-05')).toBe(false);
    expect(isShiftDay(p, '2026-07-09')).toBe(true);
  });

  it('handles a year boundary', () => {
    const p = period({
      startDate: '2025-12-30',
      endDate: '2026-01-10',
      pattern: { cycleDays: 4, offset: 'A' },
    });

    expect(isShiftDay(p, '2025-12-30')).toBe(true);
    expect(isShiftDay(p, '2026-01-03')).toBe(true);
    expect(isShiftDay(p, '2026-01-07')).toBe(true);
  });

  it('handles leap day in the cycle', () => {
    const p = period({
      startDate: '2024-02-28',
      endDate: '2024-03-05',
      pattern: { cycleDays: 4, offset: 'A' },
    });

    expect(isShiftDay(p, '2024-02-28')).toBe(true);
    expect(isShiftDay(p, '2024-02-29')).toBe(false);
    expect(isShiftDay(p, '2024-03-03')).toBe(true);
  });
});
