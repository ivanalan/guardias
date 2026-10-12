import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  startOfMonth,
} from 'date-fns';

import {
  isShiftDay,
  isSkippedPatternDay,
  listShiftDatesInRange,
  parseCalendarDate,
} from '../../lib/shifts';
import { DEFAULT_ROTATION_COLOR } from '../rotations/rotation-colors';
import {
  primaryPeriods,
  secondaryPeriods,
} from '../rotations/period-role';
import type { RotationPeriod } from '../rotations/types';
import type { ShiftDateMark } from './build-marked-dates';
import { countFreeWeekends, listFreeWeekendDates } from './free-weekends';
import { listVacationDatesInRange } from './vacation-dates';

/** One friend period’s legend chip for the visible month. */
export type SecondaryLegendEntry = {
  periodId: string;
  label: string;
  color: string;
  dayCount: number;
};

/** Shared shift / free-weekend / vacation marks for an inclusive date range. */
export type RangeMarkInputs = {
  shiftMarks: ShiftDateMark[];
  /** May include multiple marks per date (concurrent friends). */
  secondaryShiftMarks: ShiftDateMark[];
  freeWeekendDates: string[];
  vacationDates: string[];
  /** Skipped pattern days (strikethrough on empty cells). */
  skippedDates: string[];
};

/** Shared shift / free-weekend / vacation inputs for the visible calendar month. */
export type MonthMarkInputs = RangeMarkInputs & {
  shiftDayCount: number;
  /** Unique dates with ≥1 friend shift in the month. */
  secondaryShiftDayCount: number;
  freeWeekendCount: number;
  vacationDayCount: number;
  /** Dominant period color for shift days in this month (legend chip). */
  shiftColor: string;
  /** Primary period label for the shifts legend chip, if any. */
  primaryLabel: string | null;
  /** Per-friend legend chips for the month (may be empty). */
  secondaryLegend: SecondaryLegendEntry[];
};

const EMPTY_RANGE_MARKS: RangeMarkInputs = {
  shiftMarks: [],
  secondaryShiftMarks: [],
  freeWeekendDates: [],
  vacationDates: [],
  skippedDates: [],
};

function listSkippedDatesInRange(
  periods: readonly RotationPeriod[],
  from: string,
  to: string,
): string[] {
  const dates: string[] = [];
  const seen = new Set<string>();
  for (const period of periods) {
    for (const iso of period.skippedDates) {
      if (iso < from || iso > to || seen.has(iso)) {
        continue;
      }
      if (isSkippedPatternDay(period, iso)) {
        seen.add(iso);
        dates.push(iso);
      }
    }
  }
  return dates;
}

/** Primary marks: one color per date (first matching period). */
function shiftMarksForPeriods(
  periods: readonly RotationPeriod[],
  from: string,
  to: string,
  paddedFrom: string,
  paddedTo: string,
): { marks: ShiftDateMark[]; paddedShiftSet: ReadonlySet<string> } {
  const shiftDates = listShiftDatesInRange(periods, paddedFrom, paddedTo);
  const paddedShiftSet = new Set(shiftDates);
  const marks: ShiftDateMark[] = [];
  for (const date of shiftDates) {
    if (date < from || date > to) {
      continue;
    }
    const period = periods.find((item) => isShiftDay(item, date));
    if (period != null) {
      marks.push({ date, color: period.color, periodId: period.id });
    }
  }
  return { marks, paddedShiftSet };
}

/**
 * Secondary marks: every matching friend period per date (period list order).
 */
function secondaryShiftMarksForPeriods(
  periods: readonly RotationPeriod[],
  from: string,
  to: string,
): ShiftDateMark[] {
  const marks: ShiftDateMark[] = [];
  for (const period of periods) {
    for (const date of listShiftDatesInRange([period], from, to)) {
      marks.push({ date, color: period.color, periodId: period.id });
    }
  }
  marks.sort((a, b) => {
    const byDate = a.date.localeCompare(b.date);
    if (byDate !== 0) {
      return byDate;
    }
    const aIndex = periods.findIndex((p) => p.id === a.periodId);
    const bIndex = periods.findIndex((p) => p.id === b.periodId);
    return aIndex - bIndex;
  });
  return marks;
}

function buildSecondaryLegend(
  secondaries: readonly RotationPeriod[],
  secondaryShiftMarks: readonly ShiftDateMark[],
): SecondaryLegendEntry[] {
  const countById = new Map<string, number>();
  for (const mark of secondaryShiftMarks) {
    countById.set(mark.periodId, (countById.get(mark.periodId) ?? 0) + 1);
  }
  const legend: SecondaryLegendEntry[] = [];
  for (const period of secondaries) {
    const dayCount = countById.get(period.id) ?? 0;
    if (dayCount === 0) {
      continue;
    }
    legend.push({
      periodId: period.id,
      label: period.label,
      color: period.color,
      dayCount,
    });
  }
  return legend;
}

function uniqueSecondaryDayCount(
  secondaryShiftMarks: readonly ShiftDateMark[],
): number {
  return new Set(secondaryShiftMarks.map((mark) => mark.date)).size;
}

/**
 * Shift dates, free weekends, and vacation days for `[from, to]`
 * (`YYYY-MM-DD`). Pads ±6 days when resolving shifts so free weekends on the
 * range edge (Fri before / Sun after) stay correct.
 *
 * Primary periods drive fills, free weekends, and vacation. Secondary periods
 * contribute dots only (`secondaryShiftMarks`).
 */
export function getRangeMarkInputs(
  periods: readonly RotationPeriod[],
  from: string,
  to: string,
): RangeMarkInputs {
  return buildRangeMarkInputs(periods, from, to).marks;
}

function buildRangeMarkInputs(
  periods: readonly RotationPeriod[],
  from: string,
  to: string,
): { marks: RangeMarkInputs; paddedShiftSet: ReadonlySet<string> } {
  if (from > to) {
    return {
      marks: EMPTY_RANGE_MARKS,
      paddedShiftSet: new Set(),
    };
  }

  const fromDate = parseCalendarDate(from);
  const toDate = parseCalendarDate(to);
  const paddedFrom = format(addDays(fromDate, -6), 'yyyy-MM-dd');
  const paddedTo = format(addDays(toDate, 6), 'yyyy-MM-dd');

  const primaries = primaryPeriods(periods);
  const secondaries = secondaryPeriods(periods);

  const { marks: shiftMarks, paddedShiftSet } = shiftMarksForPeriods(
    primaries,
    from,
    to,
    paddedFrom,
    paddedTo,
  );
  const secondaryShiftMarks = secondaryShiftMarksForPeriods(
    secondaries,
    from,
    to,
  );

  const freeWeekendDates = listFreeWeekendDates(paddedShiftSet, from, to);
  const vacationDates = listVacationDatesInRange(primaries, from, to);
  const skippedDates = listSkippedDatesInRange(primaries, from, to);

  return {
    marks: {
      shiftMarks,
      secondaryShiftMarks,
      freeWeekendDates,
      vacationDates,
      skippedDates,
    },
    paddedShiftSet,
  };
}

/**
 * Shift dates, free weekends, and vacation days for the month containing
 * `monthDate` (`YYYY-MM-DD`).
 */
export function getMonthMarkInputs(
  periods: readonly RotationPeriod[],
  monthDate: string,
): MonthMarkInputs {
  const monthStart = startOfMonth(parseCalendarDate(monthDate));
  const monthEnd = endOfMonth(monthStart);
  const from = format(monthStart, 'yyyy-MM-dd');
  const to = format(monthEnd, 'yyyy-MM-dd');

  const { marks, paddedShiftSet } = buildRangeMarkInputs(periods, from, to);
  const primaries = primaryPeriods(periods);
  const secondaries = secondaryPeriods(periods);
  const secondaryLegend = buildSecondaryLegend(
    secondaries,
    marks.secondaryShiftMarks,
  );
  const secondaryShiftDayCount = uniqueSecondaryDayCount(
    marks.secondaryShiftMarks,
  );
  const firstShiftDate = marks.shiftMarks[0]?.date;
  const primaryForMonth =
    firstShiftDate != null
      ? primaries.find((item) => isShiftDay(item, firstShiftDate))
      : primaries[0];

  return {
    ...marks,
    shiftDayCount: marks.shiftMarks.length,
    secondaryShiftDayCount,
    freeWeekendCount: countFreeWeekends(paddedShiftSet, from, to),
    vacationDayCount: marks.vacationDates.length,
    shiftColor: marks.shiftMarks[0]?.color ?? DEFAULT_ROTATION_COLOR,
    primaryLabel: primaryForMonth?.label ?? null,
    secondaryLegend,
  };
}

/**
 * Mark inputs for months around `centerMonthDate`, with legend counts from the
 * center month only. Prefetches adjacent months so Calendar next/prev paints
 * with marks before `onMonthChange` updates parent state.
 */
export function getMarkInputsForMonthWindow(
  periods: readonly RotationPeriod[],
  centerMonthDate: string,
  radiusMonths = 1,
): MonthMarkInputs {
  const center = getMonthMarkInputs(periods, centerMonthDate);
  if (radiusMonths <= 0) {
    return center;
  }

  const centerStart = startOfMonth(parseCalendarDate(centerMonthDate));
  const shiftByDate = new Map<string, ShiftDateMark>();
  const secondaryByKey = new Map<string, ShiftDateMark>();
  const freeWeekendSet = new Set<string>();
  const vacationSet = new Set<string>();
  const skippedSet = new Set<string>();

  for (let offset = -radiusMonths; offset <= radiusMonths; offset += 1) {
    const monthDate = format(addMonths(centerStart, offset), 'yyyy-MM-dd');
    const inputs = getMonthMarkInputs(periods, monthDate);
    for (const mark of inputs.shiftMarks) {
      shiftByDate.set(mark.date, mark);
    }
    for (const mark of inputs.secondaryShiftMarks) {
      secondaryByKey.set(`${mark.date}\0${mark.periodId}`, mark);
    }
    for (const date of inputs.freeWeekendDates) {
      freeWeekendSet.add(date);
    }
    for (const date of inputs.vacationDates) {
      vacationSet.add(date);
    }
    for (const date of inputs.skippedDates) {
      skippedSet.add(date);
    }
  }

  return {
    shiftMarks: [...shiftByDate.values()],
    secondaryShiftMarks: [...secondaryByKey.values()],
    freeWeekendDates: [...freeWeekendSet],
    vacationDates: [...vacationSet],
    skippedDates: [...skippedSet],
    shiftDayCount: center.shiftDayCount,
    secondaryShiftDayCount: center.secondaryShiftDayCount,
    freeWeekendCount: center.freeWeekendCount,
    vacationDayCount: center.vacationDayCount,
    shiftColor: center.shiftColor,
    primaryLabel: center.primaryLabel,
    secondaryLegend: center.secondaryLegend,
  };
}

export type MonthLegendStats = {
  shiftDayCount: number;
  secondaryShiftDayCount: number;
  freeWeekendCount: number;
  vacationDayCount: number;
};

/** Per-month counts for the calendar legend. */
export function getMonthLegendStats(
  periods: readonly RotationPeriod[],
  monthDate: string,
): MonthLegendStats {
  const {
    shiftDayCount,
    secondaryShiftDayCount,
    freeWeekendCount,
    vacationDayCount,
  } = getMonthMarkInputs(periods, monthDate);
  return {
    shiftDayCount,
    secondaryShiftDayCount,
    freeWeekendCount,
    vacationDayCount,
  };
}
