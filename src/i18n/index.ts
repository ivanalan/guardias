import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

import en from './en.json';
import es from './es.json';

export type AppLanguage = 'en' | 'es';

/**
 * Resolve the initial language from the device locale.
 * Saved Settings preference will override this later (F5).
 *
 * Priority (MVP):
 * 1. Device language `en` or `es`
 * 2. Otherwise Spanish (primary market fallback)
 */
export function resolveDeviceLanguage(): AppLanguage {
  const languageCode = getLocales()[0]?.languageCode;
  if (languageCode === 'en' || languageCode === 'es') {
    return languageCode;
  }
  return 'es';
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
  },
  lng: resolveDeviceLanguage(),
  fallbackLng: 'es',
  // React Native has no DOM XSS risk from interpolation
  interpolation: {
    escapeValue: false,
  },
  // Avoid plural / Intl edge cases on Hermes with older JSON formats
  compatibilityJSON: 'v4',
});

export default i18n;
