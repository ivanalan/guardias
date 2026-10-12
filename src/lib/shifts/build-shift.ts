import { addHours, parse } from 'date-fns';

import {
  DEFAULT_SHIFT_LENGTH_HOURS,
  type RotationPeriod,
} from '@/features/rotations/types';

import { isShiftDay } from './is-shift-day';

/** Default shift length; periods may override via `shiftLengthHours`. */
export const SHIFT_DURATION_HOURS = DEFAULT_SHIFT_LENGTH_HOURS;

/** Computed shift for a calendar day (not stored). */
export type ComputedShift = {
  /** Calendar day the shift starts (`YYYY-MM-DD`). */
  date: string;
  startDateTime: Date;
  endDateTime: Date;
  durationHours: number;
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
  const durationHours = period.shiftLengthHours;
  const endDateTime = addHours(startDateTime, durationHours);

  return {
    date: isoDate,
    startDateTime,
    endDateTime,
    durationHours,
    rotationPeriodId: period.id,
    rotationLabel: period.label,
  };
}
