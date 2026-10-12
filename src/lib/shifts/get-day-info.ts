import { primaryPeriods } from '@/features/rotations/period-role';
import type { RotationPeriod } from '@/features/rotations/types';

import { buildShift, type ComputedShift } from './build-shift';
import { findPeriodForDate } from './find-period-for-date';

export type DayInfo =
  | { kind: 'free'; date: string }
  | { kind: 'vacation'; date: string; rotationLabel: string }
  | { kind: 'shift'; date: string; shift: ComputedShift };

function isOnVacation(period: RotationPeriod, isoDate: string): boolean {
  const { vacationStartDate, vacationEndDate } = period;
  if (vacationStartDate == null || vacationEndDate == null) {
    return false;
  }
  return isoDate >= vacationStartDate && isoDate <= vacationEndDate;
}

/**
 * Classifies a calendar day for the day sheet: free, vacation, or a computed
 * shift from the period that covers that date.
 * Covered vacation days resolve as shifts (buildShift before vacation).
 */
export function getDayInfo(
  periods: readonly RotationPeriod[],
  isoDate: string,
): DayInfo {
  const period = findPeriodForDate(primaryPeriods(periods), isoDate);
  if (period == null) {
    return { kind: 'free', date: isoDate };
  }

  const shift = buildShift(period, isoDate);
  if (shift != null) {
    return { kind: 'shift', date: isoDate, shift };
  }

  if (isOnVacation(period, isoDate)) {
    return {
      kind: 'vacation',
      date: isoDate,
      rotationLabel: period.label,
    };
  }

  return { kind: 'free', date: isoDate };
}
