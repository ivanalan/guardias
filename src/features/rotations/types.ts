/** Cycle length: `3` = A-C, `4` = A-D, `5` = A-E. */
export type CycleDays = 3 | 4 | 5;

/** Letter on the year-anchored calendar (Jan 1 = A). `D`/`E` only for longer cycles. */
export type OffsetLetter = 'A' | 'B' | 'C' | 'D' | 'E';

export type RotationPattern = {
  cycleDays: CycleDays;
  offset: OffsetLetter;
};

export const OFFSETS_FOR_CYCLE: Record<CycleDays, readonly OffsetLetter[]> = {
  3: ['A', 'B', 'C'],
  4: ['A', 'B', 'C', 'D'],
  5: ['A', 'B', 'C', 'D', 'E'],
};

/** Default pattern: A-D with offset A. */
export const DEFAULT_PATTERN: RotationPattern = {
  cycleDays: 4,
  offset: 'A',
};

/** Default local time each shift starts (`HH:mm`). */
export const DEFAULT_SHIFT_START_TIME = '07:00';

/** Allowed shift length range (inclusive), in whole hours. */
export const MIN_SHIFT_LENGTH_HOURS = 8;
export const MAX_SHIFT_LENGTH_HOURS = 40;

/** Default shift length in hours. */
export const DEFAULT_SHIFT_LENGTH_HOURS = 24;

/** Whole-hour options for the shift-length picker (8…40). */
export const SHIFT_LENGTH_HOUR_OPTIONS: readonly number[] = Array.from(
  { length: MAX_SHIFT_LENGTH_HOURS - MIN_SHIFT_LENGTH_HOURS + 1 },
  (_, i) => MIN_SHIFT_LENGTH_HOURS + i,
);

/**
 * `primary` drives Home, free weekends, and calendar fills.
 * `secondary` (friend/spouse) is calendar dots only.
 */
export type RotationPeriodRole = 'primary' | 'secondary';

/** Rotation period fields for the Shifts list (and form save). */
export type RotationPeriod = {
  id: string;
  label: string;
  /** ISO date `YYYY-MM-DD` */
  startDate: string;
  /** ISO date `YYYY-MM-DD` */
  endDate: string;
  pattern: RotationPattern;
  /**
   * Phase override: `null` = Jan 1 letter calendar + `pattern.offset`;
   * ISO date = that day is a shift, then every `pattern.cycleDays`.
   */
  firstShiftDate: string | null;
  /** Inclusive vacation block start, or null if none. */
  vacationStartDate: string | null;
  /** Inclusive vacation block end, or null if none. */
  vacationEndDate: string | null;
  /** ISO dates removed from the pattern (skipped shifts). */
  skippedDates: string[];
  /** ISO dates worked outside the pattern (incl. over vacation). */
  coveredDates: string[];
  /** Local time each shift starts, `HH:mm`. */
  shiftStartTime: string;
  /** Length of each shift in hours. */
  shiftLengthHours: number;
  /** Calendar mark color for shift days (`#RRGGBB`). */
  color: string;
  /** Whose schedule this period represents. */
  role: RotationPeriodRole;
  /** ISO datetime when the period was created. */
  createdAt: string;
};
