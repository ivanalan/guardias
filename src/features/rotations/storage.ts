import AsyncStorage from '@react-native-async-storage/async-storage';

import { normalizePeriodRole } from './period-role';
import { normalizeRotationColor } from './rotation-colors';
import {
  DEFAULT_SHIFT_LENGTH_HOURS,
  MAX_SHIFT_LENGTH_HOURS,
  MIN_SHIFT_LENGTH_HOURS,
  type RotationPeriod,
} from './types';

const STORAGE_KEY = 'guardias.rotationPeriods';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Whole hours in 8…40; invalid/missing → default 24. */
export function normalizeShiftLengthHours(raw: unknown): number {
  if (typeof raw !== 'number' || !Number.isInteger(raw)) {
    return DEFAULT_SHIFT_LENGTH_HOURS;
  }
  if (raw < MIN_SHIFT_LENGTH_HOURS || raw > MAX_SHIFT_LENGTH_HOURS) {
    return DEFAULT_SHIFT_LENGTH_HOURS;
  }
  return raw;
}

/** Keep unique `YYYY-MM-DD` strings; drop invalid entries. */
export function normalizeIsoDateList(raw: unknown): string[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const seen = new Set<string>();
  const dates: string[] = [];
  for (const item of raw) {
    if (typeof item !== 'string' || !ISO_DATE.test(item) || seen.has(item)) {
      continue;
    }
    seen.add(item);
    dates.push(item);
  }
  return dates;
}

/**
 * Ensure skipped/covered lists are valid and mutually exclusive.
 * Dates in both lists are kept only in `coveredDates`.
 */
export function normalizeExceptionDates(
  skippedRaw: unknown,
  coveredRaw: unknown,
): { skippedDates: string[]; coveredDates: string[] } {
  const coveredDates = normalizeIsoDateList(coveredRaw);
  const coveredSet = new Set(coveredDates);
  const skippedDates = normalizeIsoDateList(skippedRaw).filter(
    (date) => !coveredSet.has(date),
  );
  return { skippedDates, coveredDates };
}

/** Normalize a raw stored period (also used in tests for migration). */
export function normalizePeriod(raw: unknown): RotationPeriod | null {
  if (raw == null || typeof raw !== 'object') {
    return null;
  }
  const period = raw as RotationPeriod & { role?: unknown };
  const { skippedDates, coveredDates } = normalizeExceptionDates(
    period.skippedDates,
    period.coveredDates,
  );
  return {
    ...period,
    firstShiftDate:
      typeof period.firstShiftDate === 'string' ? period.firstShiftDate : null,
    skippedDates,
    coveredDates,
    shiftLengthHours: normalizeShiftLengthHours(period.shiftLengthHours),
    color: normalizeRotationColor(period.color),
    role: normalizePeriodRole(period.role),
  };
}

/** Returns stored periods, or `null` if nothing has been saved yet. */
export async function loadRotationPeriods(): Promise<RotationPeriod[] | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (raw == null) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return null;
    }
    return parsed
      .map(normalizePeriod)
      .filter((period): period is RotationPeriod => period != null);
  } catch {
    return null;
  }
}

/** Persist the full periods list (source of truth for the device). */
export async function saveRotationPeriods(
  periods: readonly RotationPeriod[],
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(periods));
}
