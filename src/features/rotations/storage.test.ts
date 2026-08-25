import { normalizePeriod } from './storage';

describe('normalizePeriod', () => {
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
      color: '#2F69F3',
      createdAt: '2026-01-01T00:00:00.000Z',
    });

    expect(normalized?.role).toBe('primary');
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
      color: '#0D9488',
      role: 'secondary',
      createdAt: '2026-01-01T00:00:00.000Z',
    });

    expect(normalized?.role).toBe('secondary');
  });
});
