import { parse } from 'date-fns';

/** Parse `YYYY-MM-DD` as a local calendar date (avoids UTC midnight skew). */
export function parseCalendarDate(isoDate: string): Date {
  return parse(isoDate, 'yyyy-MM-dd', new Date());
}
