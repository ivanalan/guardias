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

export type DayMarkKind = 'shift' | 'vacation' | 'freeWeekend' | 'none';

export type CalendarDayMarkContext = {
  shiftColorByDate: ReadonlyMap<string, string>;
  secondaryShiftColorByDate: ReadonlyMap<string, string>;
  freeWeekendSet: ReadonlySet<string>;
  vacationSet: ReadonlySet<string>;
  filter: CalendarLegendFilterState;
  todayIso: string;
  /** When set, non-anchor shift days render at DIM_OPACITY (first-shift picker). */
  patternAnchorDate?: string | null;
};

export type CalendarDayMarkDimming = {
  dimFreeWeekends: boolean;
  dimVacations: boolean;
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

export function getMarkDimming(
  filter: CalendarLegendFilterState,
): CalendarDayMarkDimming {
  const active = filter.size > 0;
  return {
    dimFreeWeekends: active && !filter.has('freeWeekends'),
    dimVacations: active && !filter.has('vacation'),
  };
}

/**
 * Dim primary shift fills when a filter is active and this day is not a
 * selected match. With both `shifts` and `secondaryShifts` selected, only
 * shared on-call days stay bright (AND).
 */
export function isPrimaryShiftDimmed(
  filter: CalendarLegendFilterState,
  hasPrimary: boolean,
  hasSecondary: boolean,
): boolean {
  if (filter.size === 0) {
    return false;
  }
  if (!filter.has('shifts')) {
    return true;
  }
  if (filter.has('secondaryShifts')) {
    return !(hasPrimary && hasSecondary);
  }
  return false;
}

/**
 * Dim secondary dots when a filter is active and this day is not a selected
 * match. With both shift filters selected, only shared days stay bright.
 */
export function isSecondaryShiftDimmed(
  filter: CalendarLegendFilterState,
  hasPrimary: boolean,
  hasSecondary: boolean,
): boolean {
  if (filter.size === 0) {
    return false;
  }
  if (!filter.has('secondaryShifts')) {
    return true;
  }
  if (filter.has('shifts')) {
    return !(hasPrimary && hasSecondary);
  }
  return false;
}

export type DayFilterMatchInput = {
  hasPrimary: boolean;
  hasSecondary: boolean;
  markKind: DayMarkKind;
};

/**
 * Whether this day matches any selected legend filter (OR across categories;
 * shifts + secondaryShifts still AND for shared days).
 */
export function dayMatchesActiveFilter(
  filter: CalendarLegendFilterState,
  { hasPrimary, hasSecondary, markKind }: DayFilterMatchInput,
): boolean {
  if (filter.size === 0) {
    return true;
  }
  if (filter.has('shifts')) {
    if (filter.has('secondaryShifts')) {
      if (hasPrimary && hasSecondary) {
        return true;
      }
    } else if (hasPrimary) {
      return true;
    }
  } else if (filter.has('secondaryShifts') && hasSecondary) {
    return true;
  }
  if (filter.has('freeWeekends') && markKind === 'freeWeekend') {
    return true;
  }
  if (filter.has('vacation') && markKind === 'vacation') {
    return true;
  }
  return false;
}

/** Dim day numbers when a filter is active and this day is not a match. */
export function isDayLabelDimmed(
  filter: CalendarLegendFilterState,
  input: DayFilterMatchInput,
): boolean {
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
 * other pattern days use DIM_OPACITY (filter dim still wins when active).
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
    return DIM_OPACITY;
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

/** Saturday that starts a Sat–Sun free-weekend pill (partner must also be free). */
export function isFreeWeekendSpanStart(
  iso: string,
  freeWeekendSet: ReadonlySet<string>,
  markKind: DayMarkKind,
): boolean {
  if (markKind !== 'freeWeekend' || getDay(parseCalendarDate(iso)) !== 6) {
    return false;
  }
  return freeWeekendSet.has(addCalendarDays(iso, 1));
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
  return freeWeekendSet.has(addCalendarDays(iso, -1));
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
