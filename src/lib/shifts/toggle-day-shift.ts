import { primaryPeriods } from '@/features/rotations/period-role';
import type { RotationPeriod } from '@/features/rotations/types';

import { findPeriodForDate } from './find-period-for-date';
import { isShiftDay } from './is-shift-day';

function withoutDate(dates: readonly string[], isoDate: string): string[] {
  return dates.filter((date) => date !== isoDate);
}

function withDate(dates: readonly string[], isoDate: string): string[] {
  if (dates.includes(isoDate)) {
    return [...dates];
  }
  return [...dates, isoDate].sort();
}

/**
 * Toggles whether the primary period covering `isoDate` has a shift that day.
 * Skip when working → remove cover or add skip. Cover when free → remove skip
 * or add cover. Returns `null` when no primary period contains the date.
 */
export function toggleDayShift(
  periods: readonly RotationPeriod[],
  isoDate: string,
): RotationPeriod | null {
  const period = findPeriodForDate(primaryPeriods(periods), isoDate);
  if (period == null) {
    return null;
  }

  if (isShiftDay(period, isoDate)) {
    if (period.coveredDates.includes(isoDate)) {
      return {
        ...period,
        coveredDates: withoutDate(period.coveredDates, isoDate),
      };
    }
    return {
      ...period,
      skippedDates: withDate(period.skippedDates, isoDate),
      coveredDates: withoutDate(period.coveredDates, isoDate),
    };
  }

  if (period.skippedDates.includes(isoDate)) {
    return {
      ...period,
      skippedDates: withoutDate(period.skippedDates, isoDate),
    };
  }

  return {
    ...period,
    coveredDates: withDate(period.coveredDates, isoDate),
    skippedDates: withoutDate(period.skippedDates, isoDate),
  };
}
