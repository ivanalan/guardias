import { listShiftDatesInRange } from '../../lib/shifts';

import type { RotationPeriod } from './types';

/**
 * Sorted first-of-month ISO dates (`YYYY-MM-01`) for months that contain at
 * least one shift day in `period`.
 */
export function listShiftMonths(period: RotationPeriod): string[] {
  const shiftDates = listShiftDatesInRange(
    [period],
    period.startDate,
    period.endDate,
  );
  const months = new Set<string>();
  for (const iso of shiftDates) {
    months.add(iso.slice(0, 7));
  }
  return [...months].sort().map((ym) => `${ym}-01`);
}
