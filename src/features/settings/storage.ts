import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ColorSchemePreference } from '../../theme/theme-context';
import {
  DEFAULT_APP_PREFERENCES,
  type AppPreferences,
} from './types';

const STORAGE_KEY = 'guardias.appPreferences';

function isAppLanguage(value: unknown): value is AppPreferences['locale'] {
  return value === null || value === 'en' || value === 'es';
}

function isColorSchemePreference(
  value: unknown,
): value is ColorSchemePreference {
  return value === null || value === 'light' || value === 'dark';
}

function parsePreferences(parsed: object): AppPreferences | null {
  const record = parsed as {
    locale?: unknown;
    colorScheme?: unknown;
  };

  if (!('locale' in record) || !isAppLanguage(record.locale)) {
    return null;
  }

  if ('colorScheme' in record) {
    if (!isColorSchemePreference(record.colorScheme)) {
      return null;
    }
    return {
      locale: record.locale,
      colorScheme: record.colorScheme,
    };
  }

  return {
    locale: record.locale,
    colorScheme: DEFAULT_APP_PREFERENCES.colorScheme,
  };
}

/** Returns stored preferences, or `null` if nothing has been saved yet. */
export async function loadAppPreferences(): Promise<AppPreferences | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (raw == null) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed == null || typeof parsed !== 'object') {
      return null;
    }

    return parsePreferences(parsed);
  } catch {
    return null;
  }
}

/**
 * Persist a partial update merged with existing preferences.
 * Avoids locale and colorScheme overwriting each other.
 */
export async function saveAppPreferences(
  patch: Partial<AppPreferences>,
): Promise<AppPreferences> {
  const stored = await loadAppPreferences();
  const next: AppPreferences = {
    ...DEFAULT_APP_PREFERENCES,
    ...stored,
    ...patch,
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export { DEFAULT_APP_PREFERENCES };
