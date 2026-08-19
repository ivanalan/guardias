import {
  formatHomeDateTitle,
  formatWeekendRange,
  formatWeekdayLong,
  weekdayInitials,
} from './format-home-copy';

describe('formatHomeDateTitle', () => {
  it('uses an English ordinal', () => {
    expect(formatHomeDateTitle(new Date(2026, 7, 4), 'en')).toBe('August 4th');
  });

  it('uses a Spanish day-of-month phrase', () => {
    expect(formatHomeDateTitle(new Date(2026, 7, 4), 'es')).toBe('4 de agosto');
  });
});

describe('formatWeekendRange', () => {
  it('omits the repeated month in English', () => {
    expect(formatWeekendRange('2026-08-06', 'en')).toBe('August 6 - 7');
  });

  it('keeps the month once in Spanish', () => {
    expect(formatWeekendRange('2026-08-06', 'es')).toBe('6 - 7 de agosto');
  });

  it('shows both months when the weekend crosses them', () => {
    expect(formatWeekendRange('2026-01-31', 'en')).toBe(
      'January 31 - February 1',
    );
  });
});

describe('formatWeekdayLong', () => {
  it('returns the English weekday', () => {
    expect(formatWeekdayLong(new Date(2026, 7, 6), 'en')).toBe('Thursday');
  });
});

describe('weekdayInitials', () => {
  it('starts on Monday', () => {
    expect(weekdayInitials('en')[0]).toBe('M');
    expect(weekdayInitials('es')[0]).toBe('L');
    expect(weekdayInitials('es')).toEqual(['L', 'M', 'M', 'J', 'V', 'S', 'D']);
  });
});
