import {
  datesOverlap,
  findOverlappingPeriod,
  validatePeriodForm,
} from './validate-new-period';
import type { RotationPeriod } from './types';

function period(
  overrides: Partial<RotationPeriod> &
    Pick<RotationPeriod, 'id' | 'startDate' | 'endDate'>,
): RotationPeriod {
  return {
    label: 'Test',
    pattern: { cycleDays: 4, offset: 'A' },
    firstShiftDate: null,
    vacationStartDate: null,
    vacationEndDate: null,
    shiftStartTime: '07:00',
    color: '#2F69F3',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('datesOverlap', () => {
  it('detects inclusive overlap on a shared boundary day', () => {
    expect(datesOverlap('2026-07-01', '2026-09-30', '2026-09-30', '2026-12-31')).toBe(
      true,
    );
  });

  it('returns false for adjacent non-overlapping ranges', () => {
    expect(datesOverlap('2026-07-01', '2026-09-29', '2026-09-30', '2026-12-31')).toBe(
      false,
    );
  });
});

describe('findOverlappingPeriod', () => {
  const periods = [
    period({ id: '1', startDate: '2026-07-01', endDate: '2026-09-30' }),
    period({ id: '2', startDate: '2026-10-01', endDate: '2026-12-31' }),
  ];

  it('finds an overlapping period', () => {
    expect(
      findOverlappingPeriod('2026-09-15', '2026-10-15', periods)?.id,
    ).toBe('1');
  });

  it('ignores the excluded id (edit self)', () => {
    expect(
      findOverlappingPeriod('2026-07-01', '2026-09-30', periods, '1'),
    ).toBeUndefined();
  });
});

describe('validatePeriodForm', () => {
  const periods = [
    period({ id: '1', startDate: '2026-07-01', endDate: '2026-09-30' }),
  ];

  it('returns dateOverlap when ranges conflict', () => {
    expect(
      validatePeriodForm(
        {
          label: 'ER',
          startDate: '2026-09-01',
          endDate: '2026-10-01',
          firstShiftDate: null,
          vacationEnabled: false,
          vacationStartDate: '2026-09-01',
          vacationEndDate: '2026-09-01',
        },
        periods,
      ),
    ).toBe('dateOverlap');
  });

  it('allows the same range when editing that period', () => {
    expect(
      validatePeriodForm(
        {
          label: 'Internal medicine',
          startDate: '2026-07-01',
          endDate: '2026-09-30',
          firstShiftDate: null,
          vacationEnabled: false,
          vacationStartDate: '2026-07-01',
          vacationEndDate: '2026-07-01',
        },
        periods,
        '1',
      ),
    ).toBeNull();
  });

  it('rejects firstShiftDate outside the period', () => {
    expect(
      validatePeriodForm(
        {
          label: 'ER',
          startDate: '2026-07-01',
          endDate: '2026-09-30',
          firstShiftDate: '2026-06-30',
          vacationEnabled: false,
          vacationStartDate: '2026-07-01',
          vacationEndDate: '2026-07-01',
        },
        periods,
        '1',
      ),
    ).toBe('firstShiftOutOfBounds');
  });

  it('allows firstShiftDate within the period', () => {
    expect(
      validatePeriodForm(
        {
          label: 'ER',
          startDate: '2026-07-01',
          endDate: '2026-09-30',
          firstShiftDate: '2026-07-02',
          vacationEnabled: false,
          vacationStartDate: '2026-07-01',
          vacationEndDate: '2026-07-01',
        },
        periods,
        '1',
      ),
    ).toBeNull();
  });
});
