jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'es' }],
}));

import {
  buildTwoWeekWidgetPropsForScheme,
  buildUpcomingShiftsWidgetPropsForScheme,
} from './build-widget-props';
import type { RotationPeriod } from '../rotations/types';

function period(
  partial: Partial<RotationPeriod> & Pick<RotationPeriod, 'id'>,
): RotationPeriod {
  return {
    label: 'Test',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    pattern: { cycleDays: 4, offset: 'A' },
    firstShiftDate: '2026-09-14',
    vacationStartDate: null,
    vacationEndDate: null,
    shiftStartTime: '07:00',
    color: '#DC211E',
    role: 'primary',
    createdAt: '2026-09-01T00:00:00.000Z',
    ...partial,
  };
}

describe('buildTwoWeekWidgetPropsForScheme', () => {
  it('returns 14 day cells across two weeks with weekday labels', () => {
    const now = new Date(2026, 8, 17); // Wed Sep 17 2026
    const props = buildTwoWeekWidgetPropsForScheme(
      [period({ id: '1', label: 'Urgencias' })],
      'es',
      'light',
      now,
    );

    expect(props.title).toBe('Urgencias');
    expect(props.weekdayLabels).toEqual(['L', 'M', 'M', 'J', 'V', 'S', 'D']);
    expect(props.weeks).toHaveLength(2);
    expect(props.weeks[0]).toHaveLength(7);
    expect(props.weeks[1]).toHaveLength(7);
    expect(props.weeks.flat()).toHaveLength(14);
  });

  it('marks today and primary shift days', () => {
    const now = new Date(2026, 8, 14); // Mon Sep 14 — firstShiftDate
    const props = buildTwoWeekWidgetPropsForScheme(
      [period({ id: '1', firstShiftDate: '2026-09-14', label: 'Pediatría' })],
      'en',
      'light',
      now,
    );

    expect(props.title).toBe('Pediatría');
    const today = props.weeks[0]![0]!;
    expect(today.isToday).toBe(true);
    expect(today.borderColor).toBeTruthy();
    expect(today.backgroundColor).toBe('#DC211E');
  });

  it('falls back when there are no periods', () => {
    const props = buildTwoWeekWidgetPropsForScheme([], 'en', 'light');
    expect(props.title).toBe('Mi Guardia');
  });
});

describe('buildUpcomingShiftsWidgetPropsForScheme', () => {
  it('lists up to four upcoming shifts with the next highlighted', () => {
    const now = new Date(2026, 8, 14, 8); // Mon Sep 14 08:00 — after 07:00 start
    const props = buildUpcomingShiftsWidgetPropsForScheme(
      [period({ id: '1', firstShiftDate: '2026-09-14', label: 'Urgencias' })],
      'en',
      'light',
      now,
    );

    expect(props.title).toBe('Upcoming shifts');
    expect(props.items.length).toBeGreaterThan(0);
    expect(props.items.length).toBeLessThanOrEqual(4);
    expect(props.items[0]!.isNext).toBe(true);
    expect(props.items.slice(1).every((item) => !item.isNext)).toBe(true);
    expect(props.items[0]!.weekday.length).toBeGreaterThan(0);
    expect(props.items[0]!.relativeLabel.length).toBeGreaterThan(0);
    expect(props.accentColor).toBe('#DC211E');
  });

  it('returns empty items when there are no periods', () => {
    const props = buildUpcomingShiftsWidgetPropsForScheme([], 'es', 'dark');
    expect(props.title).toBe('Próximas guardias');
    expect(props.items).toEqual([]);
    expect(props.emptyCaption.length).toBeGreaterThan(0);
  });
});
