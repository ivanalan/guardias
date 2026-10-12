import type { RotationPeriod } from '@/features/rotations/types';

import { isShiftDay } from './is-shift-day';
import { toggleDayShift } from './toggle-day-shift';

function period(overrides: Partial<RotationPeriod> = {}): RotationPeriod {
  return {
    id: 'p1',
    label: 'Test',
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    pattern: { cycleDays: 4, offset: 'A' },
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

describe('toggleDayShift', () => {
  it('skips a pattern shift day', () => {
    // Jul 4 2026 = A
    const p = period();
    const next = toggleDayShift([p], '2026-07-04');
    expect(next?.skippedDates).toEqual(['2026-07-04']);
    expect(isShiftDay(next!, '2026-07-04')).toBe(false);
  });

  it('cover after skip restores the pattern day', () => {
    const p = period({ skippedDates: ['2026-07-04'] });
    const next = toggleDayShift([p], '2026-07-04');
    expect(next?.skippedDates).toEqual([]);
    expect(isShiftDay(next!, '2026-07-04')).toBe(true);
  });

  it('covers a free day', () => {
    const p = period();
    const next = toggleDayShift([p], '2026-07-02');
    expect(next?.coveredDates).toEqual(['2026-07-02']);
    expect(isShiftDay(next!, '2026-07-02')).toBe(true);
  });

  it('skip on a cover removes the cover without skipping', () => {
    const p = period({ coveredDates: ['2026-07-02'] });
    const next = toggleDayShift([p], '2026-07-02');
    expect(next?.coveredDates).toEqual([]);
    expect(next?.skippedDates).toEqual([]);
    expect(isShiftDay(next!, '2026-07-02')).toBe(false);
  });

  it('cover on vacation wins over leave', () => {
    const p = period({
      vacationStartDate: '2026-07-04',
      vacationEndDate: '2026-07-05',
    });
    expect(isShiftDay(p, '2026-07-04')).toBe(false);
    const next = toggleDayShift([p], '2026-07-04');
    expect(next?.coveredDates).toEqual(['2026-07-04']);
    expect(isShiftDay(next!, '2026-07-04')).toBe(true);
  });

  it('returns null when no primary period covers the date', () => {
    expect(toggleDayShift([period()], '2026-06-15')).toBeNull();
  });

  it('ignores secondary periods', () => {
    const friend = period({ id: 'friend', role: 'secondary' });
    expect(toggleDayShift([friend], '2026-07-04')).toBeNull();
  });
});
