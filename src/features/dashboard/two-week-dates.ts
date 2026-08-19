import { addDays, format, startOfWeek } from 'date-fns';

/** Monday-start ISO dates for this week and the next (14 days). */
export function getTwoWeekDates(now: Date): string[] {
  const monday = startOfWeek(now, { weekStartsOn: 1 });
  return Array.from({ length: 14 }, (_, index) =>
    format(addDays(monday, index), 'yyyy-MM-dd'),
  );
}
