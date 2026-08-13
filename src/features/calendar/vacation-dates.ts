import { addDays, format } from 'date-fns';

import type { RotationPeriod } from '../rotations/types';
import { parseCalendarDate } from '../../lib/shifts/parse-calendar-date';

/**
 * Inclusive vacation days from periods that intersect `[from, to]`
 * (`YYYY-MM-DD`). Days outside the range are omitted.
 */
export function listVacationDatesInRange(
  periods: readonly RotationPeriod[],
  from: string,
  to: string,
): string[] {
  if (from > to) {
    return [];
  }

  const dates: string[] = [];

  for (const period of periods) {
    const { vacationStartDate, vacationEndDate } = period;
    if (vacationStartDate == null || vacationEndDate == null) {
      continue;
    }

    const start = vacationStartDate > from ? vacationStartDate : from;
    const end = vacationEndDate < to ? vacationEndDate : to;
    if (start > end) {
      continue;
    }

    let cursor = parseCalendarDate(start);
    const last = parseCalendarDate(end);
    while (cursor <= last) {
      dates.push(format(cursor, 'yyyy-MM-dd'));
      cursor = addDays(cursor, 1);
    }
  }

  return dates;
}
