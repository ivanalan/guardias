import { countFreeWeekends, listFreeWeekendDates } from './free-weekends';

describe('listFreeWeekendDates', () => {
  it('marks Sat+Sun when Fri, Sat, and Sun are free', () => {
    const shifts = new Set<string>(['2026-07-01', '2026-07-05']);
    // 2026-07-04 Sat, 2026-07-05 Sun — Sun is a shift → not free
    // 2026-07-11 Sat, 2026-07-12 Sun — Fri Jul 10 free → free
    expect(
      listFreeWeekendDates(shifts, '2026-07-01', '2026-07-12'),
    ).toEqual(['2026-07-11', '2026-07-12']);
  });

  it('returns empty when Friday has a shift even if Sat+Sun are free', () => {
    // Fri Jul 10 shift; Sat–Sun Jul 11–12 free
    const shifts = new Set<string>(['2026-07-10']);
    expect(
      listFreeWeekendDates(shifts, '2026-07-11', '2026-07-12'),
    ).toEqual([]);
  });

  it('includes only the in-range half of a weekend on a month edge', () => {
    // 2026-08-01 is Saturday; Sunday is Aug 2; Fri Jul 31 has no shift
    const shifts = new Set<string>();
    expect(listFreeWeekendDates(shifts, '2026-08-01', '2026-08-01')).toEqual([
      '2026-08-01',
    ]);
  });

  it('returns empty when a weekend has a shift on Saturday', () => {
    const shifts = new Set<string>(['2026-07-11']);
    expect(
      listFreeWeekendDates(shifts, '2026-07-11', '2026-07-12'),
    ).toEqual([]);
  });
});

describe('countFreeWeekends', () => {
  it('counts free weekend pairs, not individual days', () => {
    const shifts = new Set<string>(['2026-07-01', '2026-07-05']);
    // Only Jul 11–12 is free in this range
    expect(countFreeWeekends(shifts, '2026-07-01', '2026-07-12')).toBe(1);
  });

  it('does not count a weekend whose Friday has a shift', () => {
    const shifts = new Set<string>(['2026-07-10']);
    expect(countFreeWeekends(shifts, '2026-07-11', '2026-07-12')).toBe(0);
  });

  it('counts a month-edge half-weekend as one pair', () => {
    const shifts = new Set<string>();
    expect(countFreeWeekends(shifts, '2026-08-01', '2026-08-01')).toBe(1);
  });

  it('returns 0 when no free weekends', () => {
    const shifts = new Set<string>(['2026-07-11']);
    expect(countFreeWeekends(shifts, '2026-07-11', '2026-07-12')).toBe(0);
  });
});
