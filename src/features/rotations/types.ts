/** Cycle length: `3` = A-C, `4` = A-D (PRD MVP). */
export type CycleDays = 3 | 4;

/** Letter on the year-anchored calendar (Jan 1 = A). `D` only valid for A-D. */
export type OffsetLetter = 'A' | 'B' | 'C' | 'D';

export type RotationPattern = {
  cycleDays: CycleDays;
  offset: OffsetLetter;
};

export const OFFSETS_FOR_CYCLE: Record<CycleDays, readonly OffsetLetter[]> = {
  3: ['A', 'B', 'C'],
  4: ['A', 'B', 'C', 'D'],
};

/** PRD default: A-D with offset A. */
export const DEFAULT_PATTERN: RotationPattern = {
  cycleDays: 4,
  offset: 'A',
};

/** Default local time each 24h shift starts (`HH:mm`). */
export const DEFAULT_SHIFT_START_TIME = '07:00';

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
  /** Local time each shift starts, `HH:mm`. */
  shiftStartTime: string;
  /** Calendar mark color for shift days (`#RRGGBB`). */
  color: string;
  /** ISO datetime when the period was created. */
  createdAt: string;
};
