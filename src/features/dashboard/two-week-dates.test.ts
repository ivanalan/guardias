import { addDays, format } from 'date-fns';

import { getTwoWeekDates } from './two-week-dates';

describe('getTwoWeekDates', () => {
  it('returns 14 days starting Monday of the current week', () => {
    // Wednesday 2026-08-05 → week starts Monday Aug 3.
    const dates = getTwoWeekDates(new Date(2026, 7, 5, 12));
    expect(dates).toHaveLength(14);
    expect(dates[0]).toBe('2026-08-03');
    expect(dates[13]).toBe('2026-08-16');
  });

  it('starts on the same Monday when today is Monday', () => {
    const dates = getTwoWeekDates(new Date(2026, 7, 3, 8));
    expect(dates[0]).toBe('2026-08-03');
  });
});

describe('two-week window is contiguous', () => {
  it('steps one calendar day at a time', () => {
    const dates = getTwoWeekDates(new Date(2026, 0, 15));
    for (let i = 1; i < dates.length; i += 1) {
      const prev = new Date(`${dates[i - 1]}T00:00:00`);
      expect(dates[i]).toBe(format(addDays(prev, 1), 'yyyy-MM-dd'));
    }
  });
});
