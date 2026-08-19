import { buildMarkedDates } from './build-marked-dates';

describe('buildMarkedDates', () => {
  const shifts = [{ date: '2026-07-01', color: '#2F69F3' }];
  const freeWeekends = ['2026-07-11', '2026-07-12'];
  const vacations = ['2026-07-15', '2026-07-16'];

  it('marks shift, free-weekend, and vacation dates', () => {
    const marked = buildMarkedDates(shifts, freeWeekends, vacations, null);
    expect(marked['2026-07-01']?.marked).toBe(true);
    expect(marked['2026-07-11']?.marked).toBe(true);
    expect(marked['2026-07-15']?.marked).toBe(true);
  });

  it('lets shift marks override free-weekend keys on the same day', () => {
    const marked = buildMarkedDates(
      [{ date: '2026-07-11', color: '#E53935' }],
      ['2026-07-11'],
      [],
      null,
    );
    expect(marked['2026-07-11']?.marked).toBe(true);
  });

  it('returns entries regardless of filter (dimming lives in day context)', () => {
    const marked = buildMarkedDates(shifts, freeWeekends, vacations, 'shifts');
    expect(marked['2026-07-01']?.marked).toBe(true);
    expect(marked['2026-07-11']?.marked).toBe(true);
    expect(marked['2026-07-15']?.marked).toBe(true);
  });
});
