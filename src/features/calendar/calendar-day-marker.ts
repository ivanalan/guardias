import { addDays, format, getDay } from 'date-fns';

import { parseCalendarDate } from '../../lib/shifts/parse-calendar-date';
import { BORDER_RADIUS } from '../../theme/layout';
import {
  EMPTY_CALENDAR_FILTER,
  type CalendarLegendFilterState,
} from './build-marked-dates';
import type { CalendarMarkColors } from './calendar-mark-colors';

export const CELL_SIZE = 36;
/** Vertical space between date rows in month / two-week calendars. */
export const CALENDAR_WEEK_ROW_GAP = 8;
export const DAY_MARKER_RADIUS = BORDER_RADIUS;
export const TODAY_BORDER_WIDTH = 1.5;
export const TODAY_INNER_GAP = 2;
export const DAY_MARKER_INNER_RADIUS = Math.max(
  DAY_MARKER_RADIUS - TODAY_INNER_GAP - TODAY_BORDER_WIDTH,
  4,
);
export const SECONDARY_DOT_SIZE = 5;

export const dayMarkerStyle = {
  borderCurve: 'continuous' as const,
  borderRadius: DAY_MARKER_RADIUS,
};

export const DIM_OPACITY = 0.3;
export const PAST_EVENT_OPACITY = 0.5;
/** Non-anchor shift days in the first-shift picker (add/edit rotation). */
export const PATTERN_SHIFT_OPACITY = 0.65;

export type DayMarkKind = 'shift' | 'vacation' | 'freeWeekend' | 'none';

export type CalendarDayMarkContext = {
  shiftColorByDate: ReadonlyMap<string, string>;
  secondaryShiftColorByDate: ReadonlyMap<string, string>;
  freeWeekendSet: ReadonlySet<string>;
  vacationSet: ReadonlySet<string>;
  filter: CalendarLegendFilterState;
  todayIso: string;
  /** When set, non-anchor shift days render at PATTERN_SHIFT_OPACITY (first-shift picker). */
  patternAnchorDate?: string | null;
  /** `YYYY-MM` of the month the legend describes; extra days skip filter dimming. */
  visibleMonthKey?: string | null;
};

/** Day-of-month label from `YYYY-MM-DD`. */
export function dayNumber(iso: string): string {
  return String(Number(iso.slice(8, 10)));
}

export function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export type DayFilterMatchInput = {
  hasPrimary: boolean;
  hasSecondary: boolean;
  markKind: DayMarkKind;
};

/**
 * Whether this day satisfies every selected legend filter (AND across
 * categories). An empty filter matches every day.
 */
export function dayMatchesActiveFilter(
  filter: CalendarLegendFilterState,
  { hasPrimary, hasSecondary, markKind }: DayFilterMatchInput,
): boolean {
  if (filter.has('shifts') && !hasPrimary) {
    return false;
  }
  if (filter.has('secondaryShifts') && !hasSecondary) {
    return false;
  }
  if (filter.has('freeWeekends') && markKind !== 'freeWeekend') {
    return false;
  }
  if (filter.has('vacation') && markKind !== 'vacation') {
    return false;
  }
  return true;
}

export type DayFilterDimOptions = {
  /** Extra / adjacent-month cells in the current grid. */
  inactive?: boolean;
  iso?: string;
  /** `YYYY-MM`; days outside this month are not dimmed by the legend filter. */
  visibleMonthKey?: string | null;
};

/** Every mark on a day dims together when the day fails the active filter. */
export function isDayDimmedByFilter(
  filter: CalendarLegendFilterState,
  input: DayFilterMatchInput,
  options?: DayFilterDimOptions,
): boolean {
  if (options?.inactive === true) {
    return false;
  }
  const visibleMonthKey = options?.visibleMonthKey;
  const iso = options?.iso;
  if (
    visibleMonthKey != null &&
    visibleMonthKey !== '' &&
    iso != null &&
    iso.slice(0, 7) !== visibleMonthKey
  ) {
    return false;
  }
  return filter.size > 0 && !dayMatchesActiveFilter(filter, input);
}

/** `YYYY-MM-DD` comparison; today is not past. */
export function isCalendarDatePast(iso: string, todayIso: string): boolean {
  return iso < todayIso;
}

/** Filter dimming wins over past-event fade. */
export function markColorAlpha(
  dimmedByFilter: boolean,
  isPast: boolean,
): number {
  if (dimmedByFilter) {
    return DIM_OPACITY;
  }
  if (isPast) {
    return PAST_EVENT_OPACITY;
  }
  return 1;
}

/**
 * Shift alpha for the first-shift picker: anchor stays full opacity;
 * other pattern days use PATTERN_SHIFT_OPACITY (filter dim still wins when active).
 */
export function shiftMarkColorAlpha(
  dimmedByFilter: boolean,
  isPast: boolean,
  iso: string,
  patternAnchorDate: string | null | undefined,
): number {
  if (dimmedByFilter) {
    return DIM_OPACITY;
  }
  if (
    patternAnchorDate != null &&
    patternAnchorDate !== '' &&
    iso !== patternAnchorDate
  ) {
    return PATTERN_SHIFT_OPACITY;
  }
  if (patternAnchorDate != null && iso === patternAnchorDate) {
    return 1;
  }
  if (isPast) {
    return PAST_EVENT_OPACITY;
  }
  return 1;
}

export function buildCalendarDayMarkContext(
  shiftMarks: readonly { date: string; color: string }[],
  freeWeekendDates: readonly string[],
  vacationDates: readonly string[],
  filter: CalendarLegendFilterState,
  todayIso: string,
  patternAnchorDate?: string | null,
  secondaryShiftMarks: readonly { date: string; color: string }[] = [],
  visibleMonthKey?: string | null,
): CalendarDayMarkContext {
  const shiftColorByDate = new Map<string, string>();
  for (const { date, color } of shiftMarks) {
    shiftColorByDate.set(date, color);
  }
  const secondaryShiftColorByDate = new Map<string, string>();
  for (const { date, color } of secondaryShiftMarks) {
    secondaryShiftColorByDate.set(date, color);
  }

  return {
    shiftColorByDate,
    secondaryShiftColorByDate,
    freeWeekendSet: new Set(freeWeekendDates),
    vacationSet: new Set(vacationDates),
    filter: filter ?? EMPTY_CALENDAR_FILTER,
    todayIso,
    patternAnchorDate,
    visibleMonthKey,
  };
}

/** Priority: shift > vacation > free weekend. */
export function getDayMarkKind(
  iso: string,
  ctx: Pick<
    CalendarDayMarkContext,
    'shiftColorByDate' | 'freeWeekendSet' | 'vacationSet'
  >,
): DayMarkKind {
  if (ctx.shiftColorByDate.has(iso)) {
    return 'shift';
  }
  if (ctx.vacationSet.has(iso)) {
    return 'vacation';
  }
  if (ctx.freeWeekendSet.has(iso)) {
    return 'freeWeekend';
  }
  return 'none';
}

export function addCalendarDays(iso: string, amount: number): string {
  return format(addDays(parseCalendarDate(iso), amount), 'yyyy-MM-dd');
}

/**
 * The pill only exists inside one month grid, so a partner in another month
 * cannot paint (or be painted by) this cell.
 */
function isSameCalendarMonth(iso: string, other: string): boolean {
  return iso.slice(0, 7) === other.slice(0, 7);
}

/** Saturday that starts a Sat–Sun free-weekend pill (partner must also be free). */
export function isFreeWeekendSpanStart(
  iso: string,
  freeWeekendSet: ReadonlySet<string>,
  markKind: DayMarkKind,
): boolean {
  if (markKind !== 'freeWeekend' || getDay(parseCalendarDate(iso)) !== 6) {
    return false;
  }
  const sunday = addCalendarDays(iso, 1);
  return isSameCalendarMonth(iso, sunday) && freeWeekendSet.has(sunday);
}

/** Sunday covered by a Sat–Sun pill rendered from Saturday. */
export function isFreeWeekendSpanEnd(
  iso: string,
  freeWeekendSet: ReadonlySet<string>,
  markKind: DayMarkKind,
): boolean {
  if (markKind !== 'freeWeekend' || getDay(parseCalendarDate(iso)) !== 0) {
    return false;
  }
  const saturday = addCalendarDays(iso, -1);
  return isSameCalendarMonth(iso, saturday) && freeWeekendSet.has(saturday);
}

function applyMarkColor(hex: string, alpha: number): string {
  return alpha < 1 ? withAlpha(hex, alpha) : hex;
}

export function resolveShiftColor(color: string, alpha: number): string {
  return applyMarkColor(color, alpha);
}

export function resolveWeekendBackground(
  markColors: CalendarMarkColors,
  alpha: number,
): string {
  return applyMarkColor(markColors.freeWeekendBackground, alpha);
}

export function resolveVacationBackground(
  markColors: CalendarMarkColors,
  alpha: number,
): string {
  return applyMarkColor(markColors.vacationBackground, alpha);
}

export function resolveVacationTextColor(
  markColors: CalendarMarkColors,
  alpha: number,
): string {
  return applyMarkColor(markColors.vacationText, alpha);
}

export function resolveShiftTextColor(
  markColors: CalendarMarkColors,
  alpha: number,
): string {
  return applyMarkColor(markColors.shiftText, alpha);
}

export function resolveInkTextColor(ink: string, inactive: boolean): string {
  return inactive ? withAlpha(ink, 0.35) : ink;
}
