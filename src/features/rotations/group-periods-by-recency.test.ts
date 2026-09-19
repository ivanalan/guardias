import { groupPeriodsByRecency } from './group-periods-by-recency';
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
    role: 'primary',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('groupPeriodsByRecency', () => {
  const past = period({
    id: 'past',
    startDate: '2026-01-01',
    endDate: '2026-03-31',
  });
  const current = period({
    id: 'current',
    startDate: '2026-04-01',
    endDate: '2026-06-30',
  });
  const future = period({
    id: 'future',
    startDate: '2026-07-01',
    endDate: '2026-09-30',
  });
  const later = period({
    id: 'later',
    startDate: '2026-10-01',
    endDate: '2026-12-31',
  });

  it('buckets into Current → Future → Past and omits empty sections', () => {
    const sections = groupPeriodsByRecency(
      [past, current, future, later],
      '2026-05-15',
    );

    expect(sections.map((s) => s.key)).toEqual(['current', 'future', 'past']);
    expect(sections[0]?.data.map((p) => p.id)).toEqual(['current']);
    expect(sections[1]?.data.map((p) => p.id)).toEqual(['future', 'later']);
    expect(sections[2]?.data.map((p) => p.id)).toEqual(['past']);
    expect(sections.map((s) => s.titleKey)).toEqual([
      'sectionCurrent',
      'sectionFuture',
      'sectionPast',
    ]);
  });

  it('treats inclusive bounds as current on start and end days', () => {
    expect(
      groupPeriodsByRecency([current], '2026-04-01').map((s) => s.key),
    ).toEqual(['current']);
    expect(
      groupPeriodsByRecency([current], '2026-06-30').map((s) => s.key),
    ).toEqual(['current']);
  });

  it('returns only past when all periods have ended, newest-ended first', () => {
    const sections = groupPeriodsByRecency([past, current], '2026-07-01');
    expect(sections.map((s) => s.key)).toEqual(['past']);
    expect(sections[0]?.data.map((p) => p.id)).toEqual(['current', 'past']);
  });

  it('returns only future when all periods start after today', () => {
    const sections = groupPeriodsByRecency([future, later], '2026-01-01');
    expect(sections.map((s) => s.key)).toEqual(['future']);
    expect(sections[0]?.data.map((p) => p.id)).toEqual(['future', 'later']);
  });

  it('returns an empty array when there are no periods', () => {
    expect(groupPeriodsByRecency([], '2026-05-15')).toEqual([]);
  });

  it('lists primary current rotations before secondary friend shifts', () => {
    const friend = period({
      id: 'friend',
      label: 'Maria',
      startDate: '2026-08-01',
      endDate: '2026-09-30',
      role: 'secondary',
    });
    const mine = period({
      id: 'mine',
      label: 'Internal Medicine',
      startDate: '2026-09-01',
      endDate: '2026-10-31',
      role: 'primary',
    });

    const sections = groupPeriodsByRecency([friend, mine], '2026-09-15');

    expect(sections.map((s) => s.key)).toEqual(['current']);
    expect(sections[0]?.data.map((p) => p.id)).toEqual(['mine', 'friend']);
  });
});
