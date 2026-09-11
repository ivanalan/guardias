import type { RotationPeriod } from '../rotations/types';

import { buildGoogleCalendarUrl } from './build-google-calendar-url';

function period(
  overrides: Partial<RotationPeriod> &
    Pick<RotationPeriod, 'id' | 'startDate' | 'endDate' | 'pattern'>,
): RotationPeriod {
  return {
    label: 'Internal medicine',
    firstShiftDate: null,
    vacationStartDate: null,
    vacationEndDate: null,
    shiftStartTime: '07:00',
    color: '#2F69F3',
    role: 'primary',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('buildGoogleCalendarUrl', () => {
  it('returns null when there are no shift days', () => {
    const p = period({
      id: 'period-1',
      startDate: '2026-07-02',
      endDate: '2026-07-02',
      pattern: { cycleDays: 4, offset: 'B' },
    });

    expect(buildGoogleCalendarUrl(p)).toBeNull();
  });

  it('builds a TEMPLATE URL with all-day dates and recur RRULE', () => {
    const p = period({
      id: 'period-1',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      pattern: { cycleDays: 4, offset: 'B' },
    });

    const url = buildGoogleCalendarUrl(p);
    expect(url).not.toBeNull();

    const parsed = new URL(url!);
    expect(parsed.origin + parsed.pathname).toBe(
      'https://calendar.google.com/calendar/render',
    );
    expect(parsed.searchParams.get('action')).toBe('TEMPLATE');
    expect(parsed.searchParams.get('text')).toBe('Internal medicine');
    expect(parsed.searchParams.get('dates')).toBe('20260701/20260702');
    expect(parsed.searchParams.get('recur')).toBe(
      'RRULE:FREQ=DAILY;INTERVAL=4;UNTIL=20260731',
    );
    expect(parsed.searchParams.get('details')).toBeNull();
  });

  it('URL-encodes special characters in the title', () => {
    const p = period({
      id: 'period-1',
      label: 'ER & Night',
      startDate: '2026-07-01',
      endDate: '2026-07-01',
      pattern: { cycleDays: 4, offset: 'B' },
    });

    const url = buildGoogleCalendarUrl(p)!;
    expect(url).toContain('text=ER+%26+Night');
  });

  it('includes INTERVAL=3 for A-C periods', () => {
    const p = period({
      id: 'period-ac',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      pattern: { cycleDays: 3, offset: 'B' },
    });

    const parsed = new URL(buildGoogleCalendarUrl(p)!);
    expect(parsed.searchParams.get('recur')).toBe(
      'RRULE:FREQ=DAILY;INTERVAL=3;UNTIL=20260731',
    );
  });

  it('puts the vacation note in details when provided', () => {
    const p = period({
      id: 'period-1',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      pattern: { cycleDays: 4, offset: 'B' },
      vacationStartDate: '2026-07-05',
      vacationEndDate: '2026-07-05',
    });

    const parsed = new URL(
      buildGoogleCalendarUrl(p, {
        details: 'Skip these vacation days: 2026-07-05',
      })!,
    );
    expect(parsed.searchParams.get('details')).toBe(
      'Skip these vacation days: 2026-07-05',
    );
    // Google TEMPLATE has no EXDATE; note is the workaround.
    expect(parsed.searchParams.get('recur')).not.toContain('EXDATE');
  });

  it('prefixes secondary period titles with the people emoji', () => {
    const p = period({
      id: 'friend-1',
      label: 'Maria',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      pattern: { cycleDays: 4, offset: 'B' },
      role: 'secondary',
    });

    const parsed = new URL(buildGoogleCalendarUrl(p)!);
    expect(parsed.searchParams.get('text')).toBe('👥 Maria');
  });
});
