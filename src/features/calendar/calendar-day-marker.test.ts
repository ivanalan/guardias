import {
  addCalendarDays,
  getDayMarkKind,
  isFreeWeekendSpanEnd,
  isFreeWeekendSpanStart,
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

  it('does not treat weekdays as span endpoints', () => {
    expect(
      isFreeWeekendSpanStart('2026-08-05', freeWeekendSet, 'freeWeekend'),
    ).toBe(false);
    expect(
      isFreeWeekendSpanEnd('2026-08-03', freeWeekendSet, 'freeWeekend'),
    ).toBe(false);
  });
});
