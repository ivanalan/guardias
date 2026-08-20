import { parseISO } from 'date-fns';

import {
  defaultRotationEndISO,
  defaultVacationEndISO,
  defaultVacationEndWithinPeriod,
} from './format-period-range';

describe('defaultRotationEndISO', () => {
  it('returns the inclusive last day of a 2-month span', () => {
    expect(defaultRotationEndISO(parseISO('2026-07-01'))).toBe('2026-08-31');
    expect(defaultRotationEndISO(parseISO('2026-01-15'))).toBe('2026-03-14');
  });
});

describe('defaultVacationEndISO', () => {
  it('returns the inclusive last day of a 10-weekday span', () => {
    // Mon Jul 20 → Fri Jul 31 (10 weekdays including start)
    expect(defaultVacationEndISO(parseISO('2026-07-20'))).toBe('2026-07-31');
    // Wed Jul 1 → Tue Jul 14
    expect(defaultVacationEndISO(parseISO('2026-07-01'))).toBe('2026-07-14');
    // Thu Jan 15 → Wed Jan 28
    expect(defaultVacationEndISO(parseISO('2026-01-15'))).toBe('2026-01-28');
  });
});

describe('defaultVacationEndWithinPeriod', () => {
  it('clamps to the rotation end when 10 weekdays would overrun', () => {
    expect(defaultVacationEndWithinPeriod('2026-07-01', '2026-07-05')).toBe(
      '2026-07-05',
    );
  });

  it('keeps the 10-weekday end when it fits in the period', () => {
    expect(defaultVacationEndWithinPeriod('2026-07-20', '2026-09-30')).toBe(
      '2026-07-31',
    );
  });
});