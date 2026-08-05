import { addDays, format } from 'date-fns';

import type { RotationPeriod } from '@/features/rotations/types';

import { isShiftDay } from './is-shift-day';
import { parseCalendarDate } from './parse-calendar-date';

/**
 * All shift dates (`YYYY-MM-DD`) in the inclusive `[from, to]` range across
 * any of the given periods. Sorted ascending; duplicates are impossible while
 * periods are non-overlapping.
 */
export function listShiftDatesInRange(
  periods: readonly RotationPeriod[],
  from: string,
  to: string,
): string[] {
  if (from > to) {
    return [];
  }

  const dates: string[] = [];
  let cursor = parseCalendarDate(from);
  const end = parseCalendarDate(to);

  while (cursor <= end) {
    const iso = format(cursor, 'yyyy-MM-dd');
    if (periods.some((period) => isShiftDay(period, iso))) {
      dates.push(iso);
    }
    cursor = addDays(cursor, 1);
  }

  return dates;
}
