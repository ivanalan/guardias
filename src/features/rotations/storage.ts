import AsyncStorage from '@react-native-async-storage/async-storage';

import { normalizePeriodRole } from './period-role';
import { normalizeRotationColor } from './rotation-colors';
import type { RotationPeriod } from './types';

const STORAGE_KEY = 'guardias.rotationPeriods';

/** Normalize a raw stored period (also used in tests for migration). */
export function normalizePeriod(raw: unknown): RotationPeriod | null {
  if (raw == null || typeof raw !== 'object') {
    return null;
  }
  const period = raw as RotationPeriod & { role?: unknown };
  return {
    ...period,
    firstShiftDate:
      typeof period.firstShiftDate === 'string' ? period.firstShiftDate : null,
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
