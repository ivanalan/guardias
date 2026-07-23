/** Minimal rotation period fields needed for the Shifts list row. */
export type RotationPeriod = {
  id: string;
  label: string;
  /** ISO date `YYYY-MM-DD` */
  startDate: string;
  /** ISO date `YYYY-MM-DD` */
  endDate: string;
};
