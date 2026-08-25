import { addDays, differenceInCalendarDays, format } from 'date-fns';

import type { RotationPeriod } from '@/features/rotations/types';

import { buildShift, type ComputedShift } from './build-shift';
import { findPeriodForDate } from './find-period-for-date';
import { listShiftDatesInRange } from './list-shift-dates-in-range';
import { parseCalendarDate } from './parse-calendar-date';

/** Whole days + leftover hours between two instants (floored; never negative). */
export type DurationParts = {
  days: number;
  hours: number;
};

export type HomepageShiftStatus =
  | { kind: 'idle' }
  | {
      kind: 'between_shifts';
      period: RotationPeriod;
      nextShift: ComputedShift;
      untilStart: DurationParts;
      shiftsRemaining: number;
    }
  | {
      kind: 'in_shift';
      period: RotationPeriod;
      currentShift: ComputedShift;
      remainingInShift: DurationParts;
      shiftsRemaining: number;
      nextShift: ComputedShift | null;
    };

export function formatDurationParts(from: Date, to: Date): DurationParts {
  const ms = Math.max(0, to.getTime() - from.getTime());
  const totalHours = Math.floor(ms / (1000 * 60 * 60));
  return {
    days: Math.floor(totalHours / 24),
    hours: totalHours % 24,
  };
}

/**
 * Counts shift starts with `startDateTime > now` in `period` (excludes an
 * in-progress shift).
 */
export function countShiftsRemaining(
  period: RotationPeriod,
  now: Date,
): number {
  const todayIso = format(now, 'yyyy-MM-dd');
  const from = todayIso < period.startDate ? period.startDate : todayIso;
  if (from > period.endDate) {
    return 0;
  }

  let count = 0;
  for (const iso of listShiftDatesInRange([period], from, period.endDate)) {
    const shift = buildShift(period, iso);
    if (shift !== null && shift.startDateTime > now) {
      count += 1;
    }
  }
  return count;
}

/** Completed vs total scheduled shifts in a period (for homepage ring fill). */
export type PeriodShiftProgress = {
  completed: number;
  total: number;
  /** 0–1; `0` when `total` is 0. */
  progress: number;
};

/**
 * Counts finished shifts (`endDateTime <= now`) and all scheduled shifts in
 * `period`. Vacation / non-shift days are excluded via `listShiftDatesInRange`.
 */
export function getPeriodShiftProgress(
  period: RotationPeriod,
  now: Date,
): PeriodShiftProgress {
  let completed = 0;
  let total = 0;

  for (const iso of listShiftDatesInRange(
    [period],
    period.startDate,
    period.endDate,
  )) {
    const shift = buildShift(period, iso);
    if (shift === null) {
      continue;
    }
    total += 1;
    if (shift.endDateTime <= now) {
      completed += 1;
    }
  }

  return {
    completed,
    total,
    progress: total === 0 ? 0 : completed / total,
  };
}

/** Completed vs total inclusive calendar days in a period (vacations not subtracted). */
export type PeriodDayProgress = {
  completed: number;
  total: number;
  /** 0–1; `0` when `total` is 0. */
  progress: number;
};

/**
 * Inclusive calendar-day progress for `period` relative to `todayIso`
 * (`YYYY-MM-DD`). Remaining includes today through `endDate`.
 */
export function getPeriodDayProgress(
  period: RotationPeriod,
  todayIso: string,
): PeriodDayProgress {
  const start = parseCalendarDate(period.startDate);
  const end = parseCalendarDate(period.endDate);
  const total = Math.max(0, differenceInCalendarDays(end, start) + 1);

  let remaining: number;
  if (todayIso < period.startDate) {
    remaining = total;
  } else if (todayIso > period.endDate) {
    remaining = 0;
  } else {
    remaining =
      differenceInCalendarDays(end, parseCalendarDate(todayIso)) + 1;
  }

  const completed = total - remaining;
  return {
    completed,
    total,
    progress: total === 0 ? 0 : completed / total,
  };
}

function findActiveShift(
  periods: readonly RotationPeriod[],
  now: Date,
): ComputedShift | null {
  const todayIso = format(now, 'yyyy-MM-dd');
  const yesterdayIso = format(addDays(now, -1), 'yyyy-MM-dd');

  for (const iso of [yesterdayIso, todayIso]) {
    const period = findPeriodForDate(periods, iso);
    if (period === undefined) {
      continue;
    }
    const shift = buildShift(period, iso);
    if (
      shift !== null &&
      shift.startDateTime <= now &&
      now < shift.endDateTime
    ) {
      return shift;
    }
  }
  return null;
}

function findNextShift(
  periods: readonly RotationPeriod[],
  now: Date,
  rangeEnd: string,
): ComputedShift | null {
  const todayIso = format(now, 'yyyy-MM-dd');
  const rangeStart = periods.reduce(
    (min, p) => (p.startDate < min ? p.startDate : min),
    periods[0]!.startDate,
  );
  const from = todayIso < rangeStart ? rangeStart : todayIso;
  if (from > rangeEnd) {
    return null;
  }

  for (const iso of listShiftDatesInRange(periods, from, rangeEnd)) {
    const period = findPeriodForDate(periods, iso);
    if (period === undefined) {
      continue;
    }
    const shift = buildShift(period, iso);
    if (shift !== null && shift.startDateTime > now) {
      return shift;
    }
  }
  return null;
}

function periodById(
  periods: readonly RotationPeriod[],
  id: string,
): RotationPeriod {
  const period = periods.find((p) => p.id === id);
  if (period === undefined) {
    throw new Error(`Rotation period not found: ${id}`);
  }
  return period;
}

/**
 * At-a-glance homepage state: idle, countdown to next shift, or remaining
 * time in the current 24h shift.
 */
export function getHomepageShiftStatus(
  periods: readonly RotationPeriod[],
  now: Date,
): HomepageShiftStatus {
  if (periods.length === 0) {
    return { kind: 'idle' };
  }

  const rangeEnd = periods.reduce(
    (max, p) => (p.endDate > max ? p.endDate : max),
    periods[0]!.endDate,
  );

  const currentShift = findActiveShift(periods, now);
  const nextShift = findNextShift(periods, now, rangeEnd);

  if (currentShift !== null) {
    const period = periodById(periods, currentShift.rotationPeriodId);
    // Scope "next" to this period only — homepage cards are per-rotation.
    const nextInPeriod = findNextShift([period], now, period.endDate);
    return {
      kind: 'in_shift',
      period,
      currentShift,
      remainingInShift: formatDurationParts(now, currentShift.endDateTime),
      shiftsRemaining: countShiftsRemaining(period, now),
      nextShift: nextInPeriod,
    };
  }

  if (nextShift !== null) {
    const period = periodById(periods, nextShift.rotationPeriodId);
    return {
      kind: 'between_shifts',
      period,
      nextShift,
      untilStart: formatDurationParts(now, nextShift.startDateTime),
      shiftsRemaining: countShiftsRemaining(period, now),
    };
  }

  return { kind: 'idle' };
}
