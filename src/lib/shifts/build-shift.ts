import { addHours, parse } from 'date-fns';

import type { RotationPeriod } from '@/features/rotations/types';

import { isShiftDay } from './is-shift-day';

/** Fixed MVP shift length (PRD). */
export const SHIFT_DURATION_HOURS = 24 as const;

/** Computed shift for a calendar day (not stored). */
export type ComputedShift = {
  /** Calendar day the shift starts (`YYYY-MM-DD`). */
  date: string;
  startDateTime: Date;
  endDateTime: Date;
  durationHours: typeof SHIFT_DURATION_HOURS;
  rotationPeriodId: string;
  rotationLabel: string;
};

/**
 * Builds the shift for `isoDate` on this period, or `null` if that day is
 * not a scheduled shift (out of bounds, vacation, or wrong cycle slot).
 */
export function buildShift(
  period: RotationPeriod,
  isoDate: string,
): ComputedShift | null {
  if (!isShiftDay(period, isoDate)) {
    return null;
  }

  const startDateTime = parse(
    `${isoDate} ${period.shiftStartTime}`,
    'yyyy-MM-dd HH:mm',
    new Date(),
  );
  const endDateTime = addHours(startDateTime, SHIFT_DURATION_HOURS);

  return {
    date: isoDate,
    startDateTime,
    endDateTime,
    durationHours: SHIFT_DURATION_HOURS,
    rotationPeriodId: period.id,
    rotationLabel: period.label,
  };
}
