import { addDays, format, startOfWeek } from 'date-fns';

/**
 * Monday-start ISO dates for `weekCount` weeks from the current week.
 * Used by the home calendar (2 weeks) and the Android widget (2–5 weeks).
 */
export function getWeekDates(now: Date, weekCount: number): string[] {
  const weeks = Math.max(1, Math.floor(weekCount));
  const monday = startOfWeek(now, { weekStartsOn: 1 });
  return Array.from({ length: weeks * 7 }, (_, index) =>
    format(addDays(monday, index), 'yyyy-MM-dd'),
  );
}

/** Monday-start ISO dates for this week and the next (14 days). */
export function getTwoWeekDates(now: Date): string[] {
  return getWeekDates(now, 2);
}
