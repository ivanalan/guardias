jest.mock('react-native', () => ({
  Platform: { select: (spec: { default?: string }) => spec.default },
}));

import {
  CALENDAR_LIST_CARD_HEIGHT,
  CALENDAR_LIST_FIRST_DAY,
  calendarListCardHeight,
  calendarListItemHeight,
  weeksInCalendarMonth,
} from './calendar-theme';

describe('weeksInCalendarMonth', () => {
  it('counts 5 weeks when the month fits a 5-row Monday-first grid', () => {
    // Sep 2025 starts on Monday
    expect(weeksInCalendarMonth('2025-09-01', CALENDAR_LIST_FIRST_DAY)).toBe(5);
    // Nov 2025 starts on Saturday
    expect(weeksInCalendarMonth('2025-11-15', CALENDAR_LIST_FIRST_DAY)).toBe(5);
  });

  it('counts 6 weeks when the month spans six Monday-first rows', () => {
    // Mar 2025 starts on Saturday
    expect(weeksInCalendarMonth('2025-03-01', CALENDAR_LIST_FIRST_DAY)).toBe(6);
  });

  it('counts 4 weeks for a short February that starts on Monday', () => {
    // Feb 2021 starts on Monday and is non-leap
    expect(weeksInCalendarMonth('2021-02-01', CALENDAR_LIST_FIRST_DAY)).toBe(4);
  });
});

describe('calendarListCardHeight', () => {
  it('matches the legacy 6-week constant', () => {
    expect(calendarListCardHeight(6)).toBe(CALENDAR_LIST_CARD_HEIGHT);
  });

  it('shrinks for fewer week rows', () => {
    expect(calendarListCardHeight(5)).toBeLessThan(calendarListCardHeight(6));
    expect(calendarListItemHeight(5)).toBeLessThan(calendarListItemHeight(6));
  });
});
