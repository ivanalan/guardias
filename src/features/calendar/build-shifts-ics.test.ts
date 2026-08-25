import type { RotationPeriod } from '../rotations/types';

import { buildShiftsIcs } from './build-shifts-ics';

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

describe('buildShiftsIcs', () => {
  const now = new Date('2026-08-13T12:00:00.000Z');

  it('emits calendar headers with no event when there are no shift days', () => {
    // Jul 2 is C — B period with only Jul 2 has no shifts.
    const p = period({
      id: 'period-1',
      startDate: '2026-07-02',
      endDate: '2026-07-02',
      pattern: { cycleDays: 4, offset: 'B' },
    });

    const { ics, eventCount } = buildShiftsIcs(p, now);

    expect(eventCount).toBe(0);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('METHOD:PUBLISH');
    expect(ics).not.toContain('BEGIN:VEVENT');
    expect(ics).toContain('END:VCALENDAR');
  });

  it('emits one all-day recurring VEVENT for the period', () => {
    // Jul 1 2026 is B.
    const p = period({
      id: 'period-1',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      pattern: { cycleDays: 4, offset: 'B' },
      shiftStartTime: '07:00',
    });

    const { ics, eventCount } = buildShiftsIcs(p, now);

    expect(eventCount).toBe(1);
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('UID:guardias-period-1@guardias.app');
    expect(ics).toContain('DTSTAMP:20260813T120000Z');
    expect(ics).toContain('DTSTART;VALUE=DATE:20260701');
    expect(ics).toContain('DTEND;VALUE=DATE:20260702');
    expect(ics).toContain('RRULE:FREQ=DAILY;INTERVAL=4;UNTIL=20260731');
    expect(ics).toContain('SUMMARY:Internal medicine');
    expect(ics).not.toContain('EXDATE');
    expect(ics).toContain('END:VEVENT');
  });

  it('uses INTERVAL=3 for A-C periods', () => {
    // Jul 1 2026 is A for cycle 3? Jan 1 2026 Thursday... 
    // daysFromJan1 for Jul 1: need A-C offset that hits.
    // Jul 1 2026 from Jan 1 = 181 days, 181 % 3 = 1 → B for A-C.
    const p = period({
      id: 'period-ac',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      pattern: { cycleDays: 3, offset: 'B' },
    });

    const { ics } = buildShiftsIcs(p, now);

    expect(ics).toContain('RRULE:FREQ=DAILY;INTERVAL=3;UNTIL=20260731');
    expect(ics).toContain('DTSTART;VALUE=DATE:20260701');
  });

  it('adds EXDATE for vacation pattern days', () => {
    // Jul 1 is B; next B is Jul 5. Vacation covering Jul 5.
    const p = period({
      id: 'period-1',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      pattern: { cycleDays: 4, offset: 'B' },
      vacationStartDate: '2026-07-05',
      vacationEndDate: '2026-07-05',
    });

    const { ics, eventCount } = buildShiftsIcs(p, now);

    expect(eventCount).toBe(1);
    expect(ics).toContain('EXDATE;VALUE=DATE:20260705');
  });

  it('escapes SUMMARY special characters', () => {
    const p = period({
      id: 'period-1',
      label: 'ER; Night, Floor\\A',
      startDate: '2026-07-01',
      endDate: '2026-07-01',
      pattern: { cycleDays: 4, offset: 'B' },
    });

    const { ics } = buildShiftsIcs(p, now);

    expect(ics).toContain('SUMMARY:ER\\; Night\\, Floor\\\\A');
  });

  it('prefixes SUMMARY with people emoji for secondary periods', () => {
    const p = period({
      id: 'friend-1',
      label: 'Maria',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      pattern: { cycleDays: 4, offset: 'B' },
      role: 'secondary',
    });

    const { ics } = buildShiftsIcs(p, now);

    expect(ics).toContain('SUMMARY:👥 Maria');
  });
});
