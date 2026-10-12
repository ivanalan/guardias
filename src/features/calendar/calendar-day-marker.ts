import { addDays, format, getDay } from 'date-fns';

import { parseCalendarDate } from '../../lib/shifts/parse-calendar-date';
import { BORDER_RADIUS } from '../../theme/layout';
import {
  EMPTY_CALENDAR_FILTER,
  selectedSecondaryPeriodIds,
  type CalendarLegendFilterState,
  type ShiftDateMark,
} from './build-marked-dates';
import type { CalendarMarkColors } from './calendar-mark-colors';

export const CELL_SIZE = 36;
/**
 * Vertical space between date rows in month / two-week calendars (and list
 * height math). Tweak this when friend dots need more breathing room — day
 * cells, calendar theme `gap`, and home two-week strip all read this constant.
 */
export const CALENDAR_WEEK_ROW_GAP = 12;
/** Gap between the day mark and friend dots parked below the cell. */
export const SECONDARY_DOT_GAP = 4;
export const DAY_MARKER_RADIUS = BORDER_RADIUS;
export const TODAY_BORDER_WIDTH = 1.5;
export const TODAY_INNER_GAP = 2;
export const DAY_MARKER_INNER_RADIUS = Math.max(
  DAY_MARKER_RADIUS - TODAY_INNER_GAP - TODAY_BORDER_WIDTH,
  4,
);
export const SECONDARY_DOT_SIZE = 5;
/** Line height reserved for the “+N” overflow label beside friend dots. */
export const SECONDARY_OVERFLOW_LABEL_LINE_HEIGHT = 10;
/** Max friend dots under a day cell before showing +N. */
export const SECONDARY_DAY_DOT_CAP = 1;
/**
 * Vertical room below the day mark for friend dots / +N so rows and weekend
 * capsules do not clip them. Keep in sync with SecondaryDotRow typography.
 */
export const SECONDARY_DOT_STACK_HEIGHT =
  SECONDARY_DOT_GAP +
  Math.max(SECONDARY_DOT_SIZE, SECONDARY_OVERFLOW_LABEL_LINE_HEIGHT);

export type SecondaryDayDot = {
  periodId: string;
  color: string;
};

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
  /** Friend dots for the date (stable period order; may be empty). */
  secondaryDotsByDate: ReadonlyMap<string, readonly SecondaryDayDot[]>;
  freeWeekendSet: ReadonlySet<string>;
  vacationSet: ReadonlySet<string>;
  /** Skipped pattern days — strikethrough on empty (non-fill) cells. */
  skippedSet: ReadonlySet<string>;
  filter: CalendarLegendFilterState;
  todayIso: string;
  /** When set, non-anchor shift days render at PATTERN_SHIFT_OPACITY (first-shift picker). */
  patternAnchorDate?: string | null;
  /** Day open in DayDetail — brand ring while the sheet is presented. */
  selectedIso?: string | null;
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
  /** Friend period ids with a shift on this day. */
  secondaryPeriodIds: readonly string[];
  markKind: DayMarkKind;
};

/**
 * Whether this day satisfies every selected legend filter (AND across
 * categories; OR among selected friend filters). An empty filter matches
 * every day.
 */
export function dayMatchesActiveFilter(
  filter: CalendarLegendFilterState,
  { hasPrimary, secondaryPeriodIds, markKind }: DayFilterMatchInput,
): boolean {
  if (filter.has('shifts') && !hasPrimary) {
    return false;
  }
  const selectedFriends = selectedSecondaryPeriodIds(filter);
  if (selectedFriends.length > 0) {
    const onDay = new Set(secondaryPeriodIds);
    if (!selectedFriends.some((id) => onDay.has(id))) {
      return false;
    }
  }
  if (filter.has('freeWeekends') && markKind !== 'freeWeekend') {
    return false;
  }
  if (filter.has('vacation') && markKind !== 'vacation') {
    return false;
  }
  return true;
}

/**
 * Friend dots to paint for a day: all when no friend filter is selected;
 * otherwise only selected friends present on that day.
 */
export function visibleSecondaryDotsForDay(
  dots: readonly SecondaryDayDot[],
  filter: CalendarLegendFilterState,
): SecondaryDayDot[] {
  const selected = selectedSecondaryPeriodIds(filter);
  if (selected.length === 0) {
    return [...dots];
  }
  const selectedSet = new Set(selected);
  return dots.filter((dot) => selectedSet.has(dot.periodId));
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

/** Group secondary marks by date (preserves mark array order per date). */
export function buildSecondaryDotsByDate(
  secondaryShiftMarks: readonly Pick<
    ShiftDateMark,
    'date' | 'color' | 'periodId'
  >[],
): Map<string, SecondaryDayDot[]> {
  const secondaryDotsByDate = new Map<string, SecondaryDayDot[]>();
  for (const { date, color, periodId } of secondaryShiftMarks) {
    const list = secondaryDotsByDate.get(date);
    if (list != null) {
      list.push({ periodId, color });
    } else {
      secondaryDotsByDate.set(date, [{ periodId, color }]);
    }
  }
  return secondaryDotsByDate;
}

export function buildCalendarDayMarkContext(
  shiftMarks: readonly { date: string; color: string }[],
  freeWeekendDates: readonly string[],
  vacationDates: readonly string[],
  filter: CalendarLegendFilterState,
  todayIso: string,
  patternAnchorDate?: string | null,
  secondaryShiftMarks: readonly Pick<
    ShiftDateMark,
    'date' | 'color' | 'periodId'
  >[] = [],
  visibleMonthKey?: string | null,
  skippedDates: readonly string[] = [],
  selectedIso?: string | null,
): CalendarDayMarkContext {
  const shiftColorByDate = new Map<string, string>();
  for (const { date, color } of shiftMarks) {
    shiftColorByDate.set(date, color);
  }

  return {
    shiftColorByDate,
    secondaryDotsByDate: buildSecondaryDotsByDate(secondaryShiftMarks),
    freeWeekendSet: new Set(freeWeekendDates),
    vacationSet: new Set(vacationDates),
    skippedSet: new Set(skippedDates),
    filter: filter ?? EMPTY_CALENDAR_FILTER,
    todayIso,
    patternAnchorDate,
    selectedIso: selectedIso ?? null,
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
