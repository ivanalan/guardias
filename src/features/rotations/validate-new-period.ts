import type { RotationPeriod } from './types';

export type RotationValidationError =
  | 'labelRequired'
  | 'dateOrder'
  | 'vacationOrder'
  | 'vacationOutOfBounds'
  | 'dateOverlap'
  | 'firstShiftOutOfBounds';

export type PeriodFormInput = {
  label: string;
  startDate: string;
  endDate: string;
  /** Override ISO date, or null when using the Jan 1 default. */
  firstShiftDate: string | null;
  vacationEnabled: boolean;
  vacationStartDate: string;
  vacationEndDate: string;
};

/**
 * Inclusive date-range overlap: `[aStart, aEnd]` intersects `[bStart, bEnd]`.
 */
export function datesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  return aStart <= bEnd && bStart <= aEnd;
}

/** First existing period whose range overlaps `[startDate, endDate]`, if any. */
export function findOverlappingPeriod(
  startDate: string,
  endDate: string,
  periods: readonly RotationPeriod[],
  excludeId?: string,
): RotationPeriod | undefined {
  return periods.find(
    (period) =>
      period.id !== excludeId &&
      datesOverlap(startDate, endDate, period.startDate, period.endDate),
  );
}

/** Returns the first validation error for a period form, or null if valid. */
export function validatePeriodForm(
  input: PeriodFormInput,
  periods: readonly RotationPeriod[],
  excludeId?: string,
): RotationValidationError | null {
  if (!input.label.trim()) {
    return 'labelRequired';
  }

  if (input.endDate <= input.startDate) {
    return 'dateOrder';
  }

  if (
    findOverlappingPeriod(
      input.startDate,
      input.endDate,
      periods,
      excludeId,
    ) != null
  ) {
    return 'dateOverlap';
  }

  if (
    input.firstShiftDate != null &&
    (input.firstShiftDate < input.startDate ||
      input.firstShiftDate > input.endDate)
  ) {
    return 'firstShiftOutOfBounds';
  }

  if (!input.vacationEnabled) {
    return null;
  }

  if (input.vacationStartDate > input.vacationEndDate) {
    return 'vacationOrder';
  }

  if (
    input.vacationStartDate < input.startDate ||
    input.vacationEndDate > input.endDate
  ) {
    return 'vacationOutOfBounds';
  }

  return null;
}
