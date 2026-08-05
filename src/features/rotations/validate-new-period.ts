export type RotationValidationError =
  | 'labelRequired'
  | 'dateOrder'
  | 'vacationOrder'
  | 'vacationOutOfBounds';

export type NewPeriodInput = {
  label: string;
  startDate: string;
  endDate: string;
  vacationEnabled: boolean;
  vacationStartDate: string;
  vacationEndDate: string;
};

/** Returns the first validation error for a new period, or null if valid. */
export function validateNewPeriod(
  input: NewPeriodInput,
): RotationValidationError | null {
  if (!input.label.trim()) {
    return 'labelRequired';
  }

  if (input.endDate <= input.startDate) {
    return 'dateOrder';
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
