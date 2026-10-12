import { normalizeExceptionDates, normalizePeriod } from './storage';

describe('normalizePeriod', () => {
  it('defaults missing shiftLengthHours to 24', () => {
    const normalized = normalizePeriod({
      id: '0',
      label: 'ER',
      startDate: '2026-07-01',
      endDate: '2026-09-30',
      pattern: { cycleDays: 4, offset: 'A' },
      firstShiftDate: null,
      vacationStartDate: null,
      vacationEndDate: null,
      shiftStartTime: '07:00',
      color: '#2F69F3',
      createdAt: '2026-01-01T00:00:00.000Z',
    });

    expect(normalized?.shiftLengthHours).toBe(24);
  });

  it('defaults out-of-range shiftLengthHours to 24', () => {
    expect(
      normalizePeriod({
        id: '0b',
        label: 'ER',
        startDate: '2026-07-01',
        endDate: '2026-09-30',
        pattern: { cycleDays: 4, offset: 'A' },
        firstShiftDate: null,
        vacationStartDate: null,
        vacationEndDate: null,
        shiftStartTime: '07:00',
        shiftLengthHours: 7,
        color: '#2F69F3',
        createdAt: '2026-01-01T00:00:00.000Z',
      })?.shiftLengthHours,
    ).toBe(24);
    expect(
      normalizePeriod({
        id: '0c',
        label: 'ER',
        startDate: '2026-07-01',
        endDate: '2026-09-30',
        pattern: { cycleDays: 4, offset: 'A' },
        firstShiftDate: null,
        vacationStartDate: null,
        vacationEndDate: null,
        shiftStartTime: '07:00',
        shiftLengthHours: 41,
        color: '#2F69F3',
        createdAt: '2026-01-01T00:00:00.000Z',
      })?.shiftLengthHours,
    ).toBe(24);
  });

  it('defaults missing role to primary', () => {
    const normalized = normalizePeriod({
      id: '1',
      label: 'ER',
      startDate: '2026-07-01',
      endDate: '2026-09-30',
      pattern: { cycleDays: 4, offset: 'A' },
      firstShiftDate: null,
      vacationStartDate: null,
      vacationEndDate: null,
      shiftStartTime: '07:00',
      shiftLengthHours: 24,
      color: '#2F69F3',
      createdAt: '2026-01-01T00:00:00.000Z',
    });

    expect(normalized?.role).toBe('primary');
    expect(normalized?.skippedDates).toEqual([]);
    expect(normalized?.coveredDates).toEqual([]);
  });

  it('preserves secondary role', () => {
    const normalized = normalizePeriod({
      id: '2',
      label: 'Maria',
      startDate: '2026-07-01',
      endDate: '2026-09-30',
      pattern: { cycleDays: 4, offset: 'B' },
      firstShiftDate: null,
      vacationStartDate: null,
      vacationEndDate: null,
      shiftStartTime: '07:00',
      shiftLengthHours: 24,
      color: '#0D9488',
      role: 'secondary',
      createdAt: '2026-01-01T00:00:00.000Z',
    });

    expect(normalized?.role).toBe('secondary');
  });

  it('keeps valid exception dates and drops overlap into covered', () => {
    const normalized = normalizePeriod({
      id: '3',
      label: 'ER',
      startDate: '2026-07-01',
      endDate: '2026-09-30',
      pattern: { cycleDays: 4, offset: 'A' },
      firstShiftDate: null,
      vacationStartDate: null,
      vacationEndDate: null,
      skippedDates: ['2026-07-04', 'nope', '2026-07-08'],
      coveredDates: ['2026-07-08', '2026-07-02'],
      shiftStartTime: '07:00',
      shiftLengthHours: 24,
      color: '#2F69F3',
      createdAt: '2026-01-01T00:00:00.000Z',
    });

    expect(normalized?.coveredDates).toEqual(['2026-07-08', '2026-07-02']);
    expect(normalized?.skippedDates).toEqual(['2026-07-04']);
  });
});

describe('normalizeExceptionDates', () => {
  it('defaults missing lists to empty', () => {
    expect(normalizeExceptionDates(undefined, undefined)).toEqual({
      skippedDates: [],
      coveredDates: [],
    });
  });
});
