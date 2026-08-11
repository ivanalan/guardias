import { parseISO } from 'date-fns';

import { defaultRotationEndISO } from './format-period-range';

describe('defaultRotationEndISO', () => {
  it('returns the inclusive last day of a 2-month span', () => {
    expect(defaultRotationEndISO(parseISO('2026-07-01'))).toBe('2026-08-31');
    expect(defaultRotationEndISO(parseISO('2026-01-15'))).toBe('2026-03-14');
  });
});
