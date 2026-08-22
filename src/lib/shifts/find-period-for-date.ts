import type { RotationPeriod } from '@/features/rotations/types';

/**
 * Period whose inclusive `[startDate, endDate]` contains `isoDate`
 * (`YYYY-MM-DD`), if any. Periods are expected to be non-overlapping.
 */
export function findPeriodForDate(
  periods: readonly RotationPeriod[],
  isoDate: string,
): RotationPeriod | undefined {
  return periods.find(
    (period) => isoDate >= period.startDate && isoDate <= period.endDate,
  );
}
