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
    skippedDates: [],
    coveredDates: [],
    shiftStartTime: '07:00',
    shiftLengthHours: 24,
    color: '#2F69F3',
    role: 'primary',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

const baseInput = {
  label: 'ER',
  startDate: '2026-07-01',
  endDate: '2026-09-30',
  firstShiftDate: null as string | null,
  role: 'primary' as const,
  vacationEnabled: false,
  vacationStartDate: '2026-07-01',
  vacationEndDate: '2026-07-01',
};

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
    period({
      id: 'friend',
      startDate: '2026-07-01',
      endDate: '2026-09-30',
      role: 'secondary',
    }),
  ];

  it('finds an overlapping period of the same role', () => {
    expect(
      findOverlappingPeriod(
        '2026-09-15',
        '2026-10-15',
        periods,
        'primary',
      )?.id,
    ).toBe('1');
  });

  it('ignores the excluded id (edit self)', () => {
    expect(
      findOverlappingPeriod(
        '2026-07-01',
        '2026-09-30',
        periods,
        'primary',
        '1',
      ),
    ).toBeUndefined();
  });

  it('ignores secondary when checking primary overlap', () => {
    expect(
      findOverlappingPeriod(
        '2026-07-01',
        '2026-09-30',
        periods,
        'primary',
        '1',
      ),
    ).toBeUndefined();
  });
});

describe('validatePeriodForm', () => {
  const periods = [
    period({ id: '1', startDate: '2026-07-01', endDate: '2026-09-30' }),
  ];

  it('returns dateOverlap when primary ranges conflict', () => {
    expect(
      validatePeriodForm(
        {
          ...baseInput,
          startDate: '2026-09-01',
          endDate: '2026-10-01',
        },
        periods,
      ),
    ).toBe('dateOverlap');
  });

  it('allows secondary overlapping a primary', () => {
    expect(
      validatePeriodForm(
        {
          ...baseInput,
          label: 'Maria',
          role: 'secondary',
          startDate: '2026-07-01',
          endDate: '2026-09-30',
        },
        periods,
      ),
    ).toBeNull();
  });

  it('allows another secondary with a non-overlapping range', () => {
    const withFriend = [
      ...periods,
      period({
        id: 'friend',
        startDate: '2026-01-01',
        endDate: '2026-03-31',
        role: 'secondary',
      }),
    ];
    expect(
      validatePeriodForm(
        {
          ...baseInput,
          label: 'Other',
          role: 'secondary',
          startDate: '2026-04-01',
          endDate: '2026-06-30',
        },
        withFriend,
      ),
    ).toBeNull();
  });

  it('allows secondary periods that overlap each other', () => {
    const withFriend = [
      ...periods,
      period({
        id: 'friend',
        startDate: '2026-07-01',
        endDate: '2026-09-30',
        role: 'secondary',
      }),
    ];
    expect(
      validatePeriodForm(
        {
          ...baseInput,
          label: 'Luis',
          role: 'secondary',
          startDate: '2026-07-01',
          endDate: '2026-09-30',
        },
        withFriend,
      ),
    ).toBeNull();
  });

  it('returns secondaryCap when 8 secondaries already exist', () => {
    const withFriends = [
      ...periods,
      ...Array.from({ length: 8 }, (_, i) =>
        period({
          id: `friend-${i}`,
          startDate: '2026-01-01',
          endDate: '2026-12-31',
          role: 'secondary',
        }),
      ),
    ];
    expect(
      validatePeriodForm(
        {
          ...baseInput,
          label: 'Ninth',
          role: 'secondary',
          startDate: '2026-01-01',
          endDate: '2026-12-31',
        },
        withFriends,
      ),
    ).toBe('secondaryCap');
  });

  it('allows editing an existing secondary when at the cap', () => {
    const withFriends = Array.from({ length: 8 }, (_, i) =>
      period({
        id: `friend-${i}`,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        role: 'secondary',
      }),
    );
    expect(
      validatePeriodForm(
        {
          ...baseInput,
          label: 'Maria',
          role: 'secondary',
          startDate: '2026-01-01',
          endDate: '2026-12-31',
        },
        withFriends,
        'friend-0',
      ),
    ).toBeNull();
  });

  it('rejects demoting secondary to primary when overlapping a primary', () => {
    const withFriend = [
      ...periods,
      period({
        id: 'friend',
        startDate: '2026-07-01',
        endDate: '2026-09-30',
        role: 'secondary',
      }),
    ];
    expect(
      validatePeriodForm(
        {
          ...baseInput,
          label: 'Maria',
          role: 'primary',
          startDate: '2026-07-01',
          endDate: '2026-09-30',
        },
        withFriend,
        'friend',
      ),
    ).toBe('dateOverlap');
  });

  it('allows the same range when editing that period', () => {
    expect(
      validatePeriodForm(
        {
          ...baseInput,
          label: 'Internal medicine',
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
          ...baseInput,
          firstShiftDate: '2026-06-30',
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
          ...baseInput,
          firstShiftDate: '2026-07-02',
        },
        periods,
        '1',
      ),
    ).toBeNull();
  });
});
