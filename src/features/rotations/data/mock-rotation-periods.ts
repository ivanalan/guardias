import type { RotationPeriod } from '../types';

/** Static seed data for the list UI slice. Swap to `[]` to QA empty state. */
export const MOCK_ROTATION_PERIODS: RotationPeriod[] = [
  {
    id: '1',
    label: 'Internal medicine',
    startDate: '2026-07-01',
    endDate: '2026-09-30',
  },
  {
    id: '2',
    label: 'Emergency room',
    startDate: '2026-10-01',
    endDate: '2026-12-31',
  },
];
