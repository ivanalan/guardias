import { addDays, format, getDay } from 'date-fns';

import { parseCalendarDate } from '../../lib/shifts/parse-calendar-date';

/**
 * A free weekend is Fri+Sat+Sun with no shifts. Friday counts because a Friday
 * guardia ends Saturday morning — the resident is still recovering.
 */
function isFreeWeekendPair(
  shiftDates: ReadonlySet<string>,
  saturday: Date,
): boolean {
  const fri = format(addDays(saturday, -1), 'yyyy-MM-dd');
  const sat = format(saturday, 'yyyy-MM-dd');
  const sun = format(addDays(saturday, 1), 'yyyy-MM-dd');
  return (
    !shiftDates.has(fri) && !shiftDates.has(sat) && !shiftDates.has(sun)
  );
}

/**
 * Saturdays and Sundays in `[from, to]` that belong to a free weekend:
 * Fri, Sat, and Sun all have no shift. Days outside the range are omitted
 * even when their pair is inside (caller can expand `from`/`to` for grid
 * padding). Friday itself is never listed — only Sat/Sun are marked.
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

    if (intersectsRange && isFreeWeekendPair(shiftDates, saturday)) {
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

/**
 * Counts free weekend pairs (Fri+Sat+Sun all free) that intersect `[from, to]`.
 * A month-edge half-weekend still counts as one pair.
 */
export function countFreeWeekends(
  shiftDates: ReadonlySet<string>,
  from: string,
  to: string,
): number {
  if (from > to) {
    return 0;
  }

  let saturday = parseCalendarDate(from);
  const day = getDay(saturday);
  const back = day === 6 ? 0 : day + 1;
  saturday = addDays(saturday, -back);

  let count = 0;
  const end = parseCalendarDate(to);

  while (saturday <= end) {
    const sat = format(saturday, 'yyyy-MM-dd');
    const sun = format(addDays(saturday, 1), 'yyyy-MM-dd');
    const intersectsRange =
      (sat >= from && sat <= to) || (sun >= from && sun <= to);

    if (intersectsRange && isFreeWeekendPair(shiftDates, saturday)) {
      count += 1;
    }

    saturday = addDays(saturday, 7);
  }

  return count;
}
