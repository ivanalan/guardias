import type { AppLanguage } from '../../i18n';
import type { ColorSchemePreference } from '../../theme/theme-context';

/**
 * Persisted app preferences.
 * `locale: null` means follow the device language.
 * `colorScheme: null` means follow the device appearance.
 */
export type AppPreferences = {
  locale: AppLanguage | null;
  colorScheme: ColorSchemePreference;
};

export const DEFAULT_APP_PREFERENCES: AppPreferences = {
  locale: null,
  colorScheme: null,
};
