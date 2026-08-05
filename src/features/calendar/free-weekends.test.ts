import { listFreeWeekendDates } from './free-weekends';

describe('listFreeWeekendDates', () => {
  it('marks Sat+Sun when both are free', () => {
    const shifts = new Set<string>(['2026-07-01', '2026-07-05']);
    // 2026-07-04 Sat, 2026-07-05 Sun — Sun is a shift → not free
    // 2026-07-11 Sat, 2026-07-12 Sun — both free
    expect(
      listFreeWeekendDates(shifts, '2026-07-01', '2026-07-12'),
    ).toEqual(['2026-07-11', '2026-07-12']);
  });

  it('includes only the in-range half of a weekend on a month edge', () => {
    // 2026-08-01 is Saturday; Sunday is Aug 2
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
