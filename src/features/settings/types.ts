import type { AppLanguage } from '../../i18n';

/**
 * Persisted app preferences (PRD §5 AppPreferences).
 * `locale: null` means follow the device language.
 */
export type AppPreferences = {
  locale: AppLanguage | null;
};

export const DEFAULT_APP_PREFERENCES: AppPreferences = {
  locale: null,
};
