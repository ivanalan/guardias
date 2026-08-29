import {
  addCalendarDays,
  dayMatchesActiveFilter,
  DIM_OPACITY,
  PATTERN_SHIFT_OPACITY,
  getDayMarkKind,
  isCalendarDatePast,
  isDayDimmedByFilter,
  isFreeWeekendSpanEnd,
  isFreeWeekendSpanStart,
  markColorAlpha,
  PAST_EVENT_OPACITY,
  shiftMarkColorAlpha,
} from './calendar-day-marker';

describe('calendar day marker span helpers', () => {
  const freeWeekendSet = new Set(['2026-08-01', '2026-08-02', '2026-08-08']);

  const ctx = {
    shiftColorByDate: new Map<string, string>(),
    freeWeekendSet,
    vacationSet: new Set<string>(),
  };

  it('detects Saturday span start when Sunday is also free', () => {
    expect(
      isFreeWeekendSpanStart('2026-08-01', freeWeekendSet, 'freeWeekend'),
    ).toBe(true);
    expect(addCalendarDays('2026-08-01', 1)).toBe('2026-08-02');
  });

  it('detects Sunday span end when Saturday is also free', () => {
    expect(
      isFreeWeekendSpanEnd('2026-08-02', freeWeekendSet, 'freeWeekend'),
    ).toBe(true);
  });

  it('does not span when Sunday is missing from the set', () => {
    const soloSaturday = new Set(['2026-08-08']);
    expect(
      isFreeWeekendSpanStart('2026-08-08', soloSaturday, 'freeWeekend'),
    ).toBe(false);
  });

  it('does not span when mark kind is overridden by shift', () => {
    const shiftCtx = {
      ...ctx,
      shiftColorByDate: new Map([['2026-08-01', '#E53935']]),
    };
    expect(getDayMarkKind('2026-08-01', shiftCtx)).toBe('shift');
    expect(
      isFreeWeekendSpanStart('2026-08-01', freeWeekendSet, 'shift'),
    ).toBe(false);
  });

  it('does not span across a month boundary', () => {
    // Sat 2026-10-31 + Sun 2026-11-01 sit in different month grids.
    const crossMonth = new Set(['2026-10-31', '2026-11-01']);
    expect(
      isFreeWeekendSpanEnd('2026-11-01', crossMonth, 'freeWeekend'),
    ).toBe(false);
    expect(
      isFreeWeekendSpanStart('2026-10-31', crossMonth, 'freeWeekend'),
    ).toBe(false);
  });

  it('does not treat weekdays as span endpoints', () => {
    expect(
      isFreeWeekendSpanStart('2026-08-05', freeWeekendSet, 'freeWeekend'),
    ).toBe(false);
    expect(
      isFreeWeekendSpanEnd('2026-08-03', freeWeekendSet, 'freeWeekend'),
    ).toBe(false);
  });
});

describe('past event mark alpha', () => {
  it('treats dates before today as past', () => {
    expect(isCalendarDatePast('2026-08-18', '2026-08-19')).toBe(true);
    expect(isCalendarDatePast('2026-08-19', '2026-08-19')).toBe(false);
    expect(isCalendarDatePast('2026-08-20', '2026-08-19')).toBe(false);
  });

  it('uses past opacity for past marks and 1 for today and future', () => {
    expect(markColorAlpha(false, true)).toBe(PAST_EVENT_OPACITY);
    expect(markColorAlpha(false, false)).toBe(1);
  });

  it('keeps filter dimming stronger than the past fade', () => {
    expect(markColorAlpha(true, true)).toBe(DIM_OPACITY);
    expect(markColorAlpha(true, false)).toBe(DIM_OPACITY);
  });
});

describe('pattern anchor shift alpha', () => {
  it('dims non-anchor shift days and keeps the anchor full opacity', () => {
    expect(
      shiftMarkColorAlpha(false, false, '2026-08-10', '2026-08-06'),
    ).toBe(PATTERN_SHIFT_OPACITY);
    expect(
      shiftMarkColorAlpha(false, true, '2026-08-06', '2026-08-06'),
    ).toBe(1);
    expect(
      shiftMarkColorAlpha(false, false, '2026-08-06', '2026-08-06'),
    ).toBe(1);
  });

  it('falls back to past/filter alpha when no anchor is set', () => {
    expect(shiftMarkColorAlpha(false, true, '2026-08-06', null)).toBe(
      PAST_EVENT_OPACITY,
    );
    expect(shiftMarkColorAlpha(false, false, '2026-08-06', undefined)).toBe(1);
    expect(shiftMarkColorAlpha(true, false, '2026-08-10', '2026-08-06')).toBe(
      DIM_OPACITY,
    );
  });
});

describe('legend filter matching', () => {
  it('matches everything when the filter set is empty', () => {
    expect(
      dayMatchesActiveFilter(new Set(), {
        hasPrimary: false,
        hasSecondary: false,
        markKind: 'none',
      }),
    ).toBe(true);
    expect(
      isDayDimmedByFilter(new Set(), {
        hasPrimary: false,
        hasSecondary: false,
        markKind: 'none',
      }),
    ).toBe(false);
  });

  it('dims unmarked and non-shift days when filtering shifts only', () => {
    const shifts = new Set(['shifts'] as const);
    expect(
      isDayDimmedByFilter(shifts, {
        hasPrimary: true,
        hasSecondary: false,
        markKind: 'shift',
      }),
    ).toBe(false);
    expect(
      isDayDimmedByFilter(shifts, {
        hasPrimary: false,
        hasSecondary: false,
        markKind: 'none',
      }),
    ).toBe(true);
    expect(
      isDayDimmedByFilter(shifts, {
        hasPrimary: false,
        hasSecondary: false,
        markKind: 'freeWeekend',
      }),
    ).toBe(true);
    expect(
      isDayDimmedByFilter(shifts, {
        hasPrimary: false,
        hasSecondary: true,
        markKind: 'none',
      }),
    ).toBe(true);
  });

  it('keeps friend-shift days bright including free-weekend days', () => {
    const friend = new Set(['secondaryShifts'] as const);
    expect(
      isDayDimmedByFilter(friend, {
        hasPrimary: false,
        hasSecondary: true,
        markKind: 'none',
      }),
    ).toBe(false);
    expect(
      isDayDimmedByFilter(friend, {
        hasPrimary: true,
        hasSecondary: true,
        markKind: 'shift',
      }),
    ).toBe(false);
    expect(
      isDayDimmedByFilter(friend, {
        hasPrimary: false,
        hasSecondary: true,
        markKind: 'freeWeekend',
      }),
    ).toBe(false);
    expect(
      isDayDimmedByFilter(friend, {
        hasPrimary: true,
        hasSecondary: false,
        markKind: 'shift',
      }),
    ).toBe(true);
    expect(
      isDayDimmedByFilter(friend, {
        hasPrimary: false,
        hasSecondary: false,
        markKind: 'none',
      }),
    ).toBe(true);
  });

  it('AND-matches only shared days when both shift filters are selected', () => {
    const both = new Set(['shifts', 'secondaryShifts'] as const);
    expect(
      dayMatchesActiveFilter(both, {
        hasPrimary: true,
        hasSecondary: true,
        markKind: 'shift',
      }),
    ).toBe(true);
    expect(
      dayMatchesActiveFilter(both, {
        hasPrimary: true,
        hasSecondary: false,
        markKind: 'shift',
      }),
    ).toBe(false);
    expect(
      dayMatchesActiveFilter(both, {
        hasPrimary: false,
        hasSecondary: true,
        markKind: 'none',
      }),
    ).toBe(false);
  });

  it('AND-matches friend shifts with free weekends', () => {
    const both = new Set(['secondaryShifts', 'freeWeekends'] as const);
    expect(
      dayMatchesActiveFilter(both, {
        hasPrimary: false,
        hasSecondary: true,
        markKind: 'freeWeekend',
      }),
    ).toBe(true);
    expect(
      dayMatchesActiveFilter(both, {
        hasPrimary: false,
        hasSecondary: true,
        markKind: 'none',
      }),
    ).toBe(false);
    expect(
      dayMatchesActiveFilter(both, {
        hasPrimary: false,
        hasSecondary: false,
        markKind: 'freeWeekend',
      }),
    ).toBe(false);
  });

  it('matches free weekends and vacations only for those filters', () => {
    const weekends = new Set(['freeWeekends'] as const);
    const vacation = new Set(['vacation'] as const);
    expect(
      isDayDimmedByFilter(weekends, {
        hasPrimary: false,
        hasSecondary: false,
        markKind: 'freeWeekend',
      }),
    ).toBe(false);
    expect(
      isDayDimmedByFilter(weekends, {
        hasPrimary: true,
        hasSecondary: false,
        markKind: 'shift',
      }),
    ).toBe(true);
    expect(
      isDayDimmedByFilter(vacation, {
        hasPrimary: false,
        hasSecondary: false,
        markKind: 'vacation',
      }),
    ).toBe(false);
    expect(
      isDayDimmedByFilter(vacation, {
        hasPrimary: false,
        hasSecondary: false,
        markKind: 'none',
      }),
    ).toBe(true);
  });
});
