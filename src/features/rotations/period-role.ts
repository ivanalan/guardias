import type { RotationPeriod, RotationPeriodRole } from './types';

export function isPrimary(period: RotationPeriod): boolean {
  return period.role === 'primary';
}

export function isSecondary(period: RotationPeriod): boolean {
  return period.role === 'secondary';
}

/** Periods that drive Home, free weekends, and primary calendar fills. */
export function primaryPeriods(
  periods: readonly RotationPeriod[],
): RotationPeriod[] {
  return periods.filter(isPrimary);
}

/** Friend/spouse periods shown as calendar dots only. */
export function secondaryPeriods(
  periods: readonly RotationPeriod[],
): RotationPeriod[] {
  return periods.filter(isSecondary);
}

/** First secondary period if any (v1 UI expects at most one). */
export function findSecondaryPeriod(
  periods: readonly RotationPeriod[],
): RotationPeriod | undefined {
  return periods.find(isSecondary);
}

export function normalizePeriodRole(
  role: unknown,
): RotationPeriodRole {
  return role === 'secondary' ? 'secondary' : 'primary';
}
