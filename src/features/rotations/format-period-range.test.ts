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
  it('returns the inclusive last day of a 2-week span', () => {
    expect(defaultVacationEndISO(parseISO('2026-07-01'))).toBe('2026-07-14');
    expect(defaultVacationEndISO(parseISO('2026-01-15'))).toBe('2026-01-28');
  });
});

describe('defaultVacationEndWithinPeriod', () => {
  it('clamps to the rotation end when 2 weeks would overrun', () => {
    expect(defaultVacationEndWithinPeriod('2026-07-01', '2026-07-05')).toBe(
      '2026-07-05',
    );
  });

  it('keeps the 2-week end when it fits in the period', () => {
    expect(defaultVacationEndWithinPeriod('2026-07-01', '2026-09-30')).toBe(
      '2026-07-14',
    );
  });
});