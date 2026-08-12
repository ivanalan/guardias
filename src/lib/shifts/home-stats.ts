import { addDays, format, getDay } from 'date-fns';

import type { RotationPeriod } from '@/features/rotations/types';
import { listFreeWeekendDates } from '@/features/calendar/free-weekends';

import { buildShift, SHIFT_DURATION_HOURS } from './build-shift';
import { findPeriodForDate } from './find-period-for-date';
import {
  formatDurationParts,
  getPeriodShiftProgress,
  type DurationParts,
  type HomepageShiftStatus,
} from './get-homepage-shift-status';
import { listShiftDatesInRange } from './list-shift-dates-in-range';
import { parseCalendarDate } from './parse-calendar-date';

/**
 * Hours worked in `period` so far: finished shifts × 24h, plus floored
 * elapsed hours of an in-progress shift in this period (capped at 24).
 */
export function getPeriodHoursWorked(
  period: RotationPeriod,
  now: Date,
): number {
  const { completed } = getPeriodShiftProgress(period, now);
  let hours = completed * SHIFT_DURATION_HOURS;

  const todayIso = format(now, 'yyyy-MM-dd');
  const yesterdayIso = format(addDays(now, -1), 'yyyy-MM-dd');

  for (const iso of [yesterdayIso, todayIso]) {
    const covering = findPeriodForDate([period], iso);
    if (covering === undefined || covering.id !== period.id) {
      continue;
    }
    const shift = buildShift(period, iso);
    if (
      shift !== null &&
      shift.startDateTime <= now &&
      now < shift.endDateTime
    ) {
      const elapsedMs = now.getTime() - shift.startDateTime.getTime();
      const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));
      hours += Math.min(SHIFT_DURATION_HOURS, Math.max(0, elapsedHours));
      break;
    }
  }

  return hours;
}

/**
 * Countdown to the next shift start from homepage status, or `null` when
 * there is no upcoming shift (idle, or in-shift with no following shift).
 */
export function getTimeUntilNextShift(
  status: HomepageShiftStatus,
  now: Date,
): DurationParts | null {
  if (status.kind === 'between_shifts') {
    return status.untilStart;
  }
  if (status.kind === 'in_shift' && status.nextShift !== null) {
    return formatDurationParts(now, status.nextShift.startDateTime);
  }
  return null;
}

export type NextFreeWeekend = {
  saturdayIso: string;
  /** True when today falls on that free Sat or Sun. */
  isNow: boolean;
  until: DurationParts;
};

/**
 * Next Sat–Sun pair with no shifts in `period` where the weekend is not
 * fully past. Countdown targets local midnight Saturday; `isNow` when
 * already inside.
 */
export function getNextFreeWeekend(
  period: RotationPeriod,
  now: Date,
): NextFreeWeekend | null {
  const todayIso = format(now, 'yyyy-MM-dd');
  const { startDate: rangeStart, endDate: rangeEnd } = period;

  // Expand so weekend pairs at the edges are fully evaluated.
  const queryFrom = format(addDays(parseCalendarDate(todayIso), -7), 'yyyy-MM-dd');
  const from = queryFrom < rangeStart ? rangeStart : queryFrom;
  const to = format(addDays(parseCalendarDate(rangeEnd), 1), 'yyyy-MM-dd');

  const shiftDates = new Set(listShiftDatesInRange([period], from, rangeEnd));
  const freeDates = listFreeWeekendDates(shiftDates, from, to);
  const freeSet = new Set(freeDates);

  let saturday = parseCalendarDate(todayIso);
  const day = getDay(saturday);
  const back = day === 6 ? 0 : day + 1;
  saturday = addDays(saturday, -back);

  const horizonEnd = parseCalendarDate(rangeEnd);

  while (saturday <= horizonEnd) {
    const sat = format(saturday, 'yyyy-MM-dd');
    const sun = format(addDays(saturday, 1), 'yyyy-MM-dd');

    // Weekend not fully past: Sunday >= today.
    if (sun >= todayIso && freeSet.has(sat) && freeSet.has(sun)) {
      const saturdayMidnight = parseCalendarDate(sat);
      const isNow = todayIso === sat || todayIso === sun;
      return {
        saturdayIso: sat,
        isNow,
        until: isNow
          ? { days: 0, hours: 0 }
          : formatDurationParts(now, saturdayMidnight),
      };
    }

    saturday = addDays(saturday, 7);
  }

  return null;
}
