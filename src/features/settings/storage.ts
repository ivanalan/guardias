import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  DEFAULT_APP_PREFERENCES,
  type AppPreferences,
} from './types';

const STORAGE_KEY = 'guardias.appPreferences';

function isAppLanguage(value: unknown): value is AppPreferences['locale'] {
  return value === null || value === 'en' || value === 'es';
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

    const locale = (parsed as { locale?: unknown }).locale;
    if (!isAppLanguage(locale)) {
      return null;
    }

    return { locale };
  } catch {
    return null;
  }
}

/** Persist app preferences (source of truth for language override). */
export async function saveAppPreferences(
  preferences: AppPreferences,
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

export { DEFAULT_APP_PREFERENCES };
