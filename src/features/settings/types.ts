import type { AppLanguage } from '../../i18n';

/**
 * Persisted app preferences.
 * `locale: null` means follow the device language.
 */
export type AppPreferences = {
  locale: AppLanguage | null;
};

export const DEFAULT_APP_PREFERENCES: AppPreferences = {
  locale: null,
};
