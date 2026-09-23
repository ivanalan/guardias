import { resolveUpcomingShiftsLayout } from './upcoming-shifts-layout';

describe('resolveUpcomingShiftsLayout', () => {
  it('hides relative captions only when very short', () => {
    expect(resolveUpcomingShiftsLayout(120)).toEqual({
      maxItems: 4,
      showRelative: false,
    });
  });

  it('uses default 2×2 layout around typical height', () => {
    expect(resolveUpcomingShiftsLayout(156)).toEqual({
      maxItems: 4,
      showRelative: true,
    });
    expect(resolveUpcomingShiftsLayout(236)).toEqual({
      maxItems: 4,
      showRelative: true,
    });
  });

  it('uses tall layout at 280dp and above', () => {
    expect(resolveUpcomingShiftsLayout(280)).toEqual({
      maxItems: 6,
      showRelative: true,
    });
    expect(resolveUpcomingShiftsLayout(320)).toEqual({
      maxItems: 6,
      showRelative: true,
    });
  });
});
