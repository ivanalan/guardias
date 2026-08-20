import { addDays, format, getDay } from 'date-fns';

import { parseCalendarDate } from '../../lib/shifts/parse-calendar-date';
import { INK_COLOR } from '../../theme/brand';
import { BORDER_RADIUS } from '../../theme/layout';
import type { CalendarLegendFilter } from './build-marked-dates';
import { CALENDAR_MARK_COLORS } from './calendar-mark-colors';

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

export const dayMarkerStyle = {
  borderCurve: 'continuous' as const,
  borderRadius: DAY_MARKER_RADIUS,
};

export const DIM_OPACITY = 0.3;

export type DayMarkKind = 'shift' | 'vacation' | 'freeWeekend' | 'none';

export type CalendarDayMarkContext = {
  shiftColorByDate: ReadonlyMap<string, string>;
  freeWeekendSet: ReadonlySet<string>;
  vacationSet: ReadonlySet<string>;
  filter: CalendarLegendFilter;
  todayIso: string;
};

export type CalendarDayMarkDimming = {
  dimShifts: boolean;
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
  filter: CalendarLegendFilter,
): CalendarDayMarkDimming {
  return {
    dimShifts: filter != null && filter !== 'shifts',
    dimFreeWeekends: filter != null && filter !== 'freeWeekends',
    dimVacations: filter != null && filter !== 'vacation',
  };
}

export function buildCalendarDayMarkContext(
  shiftMarks: readonly { date: string; color: string }[],
  freeWeekendDates: readonly string[],
  vacationDates: readonly string[],
  filter: CalendarLegendFilter,
  todayIso: string,
): CalendarDayMarkContext {
  const shiftColorByDate = new Map<string, string>();
  for (const { date, color } of shiftMarks) {
    shiftColorByDate.set(date, color);
  }

  return {
    shiftColorByDate,
    freeWeekendSet: new Set(freeWeekendDates),
    vacationSet: new Set(vacationDates),
    filter,
    todayIso,
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

export function resolveShiftColor(
  iso: string,
  color: string,
  dimmed: boolean,
): string {
  return dimmed ? withAlpha(color, DIM_OPACITY) : color;
}

export function resolveWeekendBackground(dimmed: boolean): string {
  return dimmed
    ? withAlpha(CALENDAR_MARK_COLORS.freeWeekendBackground, DIM_OPACITY)
    : CALENDAR_MARK_COLORS.freeWeekendBackground;
}

export function resolveVacationBackground(dimmed: boolean): string {
  return dimmed
    ? withAlpha(CALENDAR_MARK_COLORS.vacationBackground, DIM_OPACITY)
    : CALENDAR_MARK_COLORS.vacationBackground;
}

export function resolveVacationTextColor(dimmed: boolean): string {
  return dimmed
    ? withAlpha(CALENDAR_MARK_COLORS.vacationText, DIM_OPACITY)
    : CALENDAR_MARK_COLORS.vacationText;
}

export function resolveShiftTextColor(dimmed: boolean): string {
  return dimmed
    ? withAlpha(CALENDAR_MARK_COLORS.shiftText, DIM_OPACITY)
    : CALENDAR_MARK_COLORS.shiftText;
}

export function resolveInkTextColor(inactive: boolean): string {
  return inactive ? withAlpha(INK_COLOR, 0.35) : INK_COLOR;
}
