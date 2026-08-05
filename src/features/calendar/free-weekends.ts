import { addDays, format, getDay } from 'date-fns';

import { parseCalendarDate } from '../../lib/shifts';

/**
 * Saturdays and Sundays in `[from, to]` that belong to a free weekend:
 * both Sat and Sun have no shift. Days outside the range are omitted even
 * when their pair is inside (caller can expand `from`/`to` for grid padding).
 */
export function listFreeWeekendDates(
  shiftDates: ReadonlySet<string>,
  from: string,
  to: string,
): string[] {
  if (from > to) {
    return [];
  }

  let saturday = parseCalendarDate(from);
  // Rewind to the Saturday on or before `from` (JS: 0 = Sun … 6 = Sat).
  const day = getDay(saturday);
  const back = day === 6 ? 0 : day + 1;
  saturday = addDays(saturday, -back);

  const dates: string[] = [];
  const end = parseCalendarDate(to);

  while (saturday <= end) {
    const sat = format(saturday, 'yyyy-MM-dd');
    const sun = format(addDays(saturday, 1), 'yyyy-MM-dd');
    const intersectsRange =
      (sat >= from && sat <= to) || (sun >= from && sun <= to);

    if (intersectsRange && !shiftDates.has(sat) && !shiftDates.has(sun)) {
      if (sat >= from && sat <= to) {
        dates.push(sat);
      }
      if (sun >= from && sun <= to) {
        dates.push(sun);
      }
    }

    saturday = addDays(saturday, 7);
  }

  return dates;
}
