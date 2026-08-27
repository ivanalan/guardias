import { addDays, format } from 'date-fns';

import { parseCalendarDate } from '../../../lib/shifts/parse-calendar-date';
import { DEFAULT_ROTATION_COLOR } from '../rotation-colors';

/** Monday-start two-week window — static sample for the empty-state preview. */
const PREVIEW_WEEK_START = '2026-08-03';

export const EMPTY_STATE_PREVIEW = {
  shiftsRemaining: 2,
  shiftsTotal: 10,
  shiftColor: DEFAULT_ROTATION_COLOR,
  todayIso: '2026-08-04',
  dates: Array.from({ length: 14 }, (_, index) =>
    format(addDays(parseCalendarDate(PREVIEW_WEEK_START), index), 'yyyy-MM-dd'),
  ),
  // Aug 6 Thu (not Fri) so Aug 8–9 remains a free weekend under Fri+Sat+Sun rule.
  shiftDates: ['2026-08-03', '2026-08-06', '2026-08-11', '2026-08-15'],
  freeWeekendDates: ['2026-08-08', '2026-08-09'],
} as const;

export const EMPTY_STATE_PREVIEW_SHIFT_COLOR_BY_DATE = new Map<string, string>(
  EMPTY_STATE_PREVIEW.shiftDates.map((date) => [date, EMPTY_STATE_PREVIEW.shiftColor]),
);

export const EMPTY_STATE_PREVIEW_FREE_WEEKEND_DATES = new Set<string>(
  EMPTY_STATE_PREVIEW.freeWeekendDates,
);

export const EMPTY_STATE_PREVIEW_VACATION_DATES = new Set<string>();
