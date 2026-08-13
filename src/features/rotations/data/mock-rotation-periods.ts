import { ROTATION_COLORS } from '../rotation-colors';
import type { RotationPeriod } from '../types';

/** Static seed data for the list UI slice. Swap to `[]` to QA empty state. */
export const MOCK_ROTATION_PERIODS: RotationPeriod[] = [
  {
    id: '1',
    label: 'Internal medicine',
    startDate: '2026-07-01',
    endDate: '2026-09-30',
    pattern: { cycleDays: 4, offset: 'A' },
    vacationStartDate: null,
    vacationEndDate: null,
    shiftStartTime: '07:00',
    color: ROTATION_COLORS[0],
    createdAt: '2026-06-01T12:00:00.000Z',
  },
  {
    id: '2',
    label: 'Emergency room',
    startDate: '2026-10-01',
    endDate: '2026-12-31',
    pattern: { cycleDays: 4, offset: 'B' },
    vacationStartDate: null,
    vacationEndDate: null,
    shiftStartTime: '07:00',
    color: ROTATION_COLORS[1],
    createdAt: '2026-09-15T12:00:00.000Z',
  },
];
