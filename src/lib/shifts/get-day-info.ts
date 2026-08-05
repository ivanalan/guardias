import type { RotationPeriod } from '@/features/rotations/types';

import { buildShift, type ComputedShift } from './build-shift';
import { findPeriodForDate } from './find-period-for-date';

export type DayInfo =
  | { kind: 'free'; date: string }
  | { kind: 'shift'; date: string; shift: ComputedShift };

/**
 * Classifies a calendar day for the day sheet: free, or a computed shift
 * from the period that covers that date.
 */
export function getDayInfo(
  periods: readonly RotationPeriod[],
  isoDate: string,
): DayInfo {
  const period = findPeriodForDate(periods, isoDate);
  if (period == null) {
    return { kind: 'free', date: isoDate };
  }

  const shift = buildShift(period, isoDate);
  if (shift == null) {
    return { kind: 'free', date: isoDate };
  }

  return { kind: 'shift', date: isoDate, shift };
}
