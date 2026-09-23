import {
  createContext,
  use,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import i18n, { resolveDeviceLanguage, type AppLanguage } from '../../i18n';
import {
  ThemeProvider,
  type ColorSchemePreference,
} from '../../theme/theme-context';
import { refreshHomeWidgets } from '../widgets/refresh-home-widgets';
import {
  DEFAULT_APP_PREFERENCES,
  loadAppPreferences,
  saveAppPreferences,
} from './storage';
import type { AppPreferences } from './types';

type PreferencesContextValue = {
  /** Stored preference: `null` = follow device. */
  locale: AppPreferences['locale'];
  /** Effective UI language after resolving System → device. */
  effectiveLanguage: AppLanguage;
  setLocale: (locale: AppPreferences['locale']) => void;
  /** Stored appearance: `null` = follow device. */
  colorScheme: ColorSchemePreference;
  setColorScheme: (colorScheme: ColorSchemePreference) => void;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function resolveEffectiveLanguage(
  locale: AppPreferences['locale'],
): AppLanguage {
  return locale ?? resolveDeviceLanguage();
}

/** App preferences hydrated from AsyncStorage; applies language + theme. */
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppPreferences['locale']>(
    DEFAULT_APP_PREFERENCES.locale,
  );
  const [colorScheme, setColorSchemeState] = useState<ColorSchemePreference>(
    DEFAULT_APP_PREFERENCES.colorScheme,
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const stored = await loadAppPreferences();
      if (cancelled) {
        return;
      }

      const nextLocale = stored?.locale ?? DEFAULT_APP_PREFERENCES.locale;
      const nextColorScheme =
        stored?.colorScheme ?? DEFAULT_APP_PREFERENCES.colorScheme;
      setLocaleState(nextLocale);
      setColorSchemeState(nextColorScheme);
      await i18n.changeLanguage(resolveEffectiveLanguage(nextLocale));

      if (!cancelled) {
        setReady(true);
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const setLocale = useCallback((next: AppPreferences['locale']) => {
    setLocaleState(next);
    void (async () => {
      await saveAppPreferences({ locale: next });
      await i18n.changeLanguage(resolveEffectiveLanguage(next));
      await refreshHomeWidgets();
    })();
  }, []);

  const setColorScheme = useCallback((next: ColorSchemePreference) => {
    setColorSchemeState(next);
    void (async () => {
      await saveAppPreferences({ colorScheme: next });
      await refreshHomeWidgets();
    })();
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <PreferencesContext.Provider
      value={{
        locale,
        effectiveLanguage: resolveEffectiveLanguage(locale),
        setLocale,
        colorScheme,
        setColorScheme,
      }}
    >
      <ThemeProvider preference={colorScheme} setPreference={setColorScheme}>
        {children}
      </ThemeProvider>
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextValue {
  const value = use(PreferencesContext);
  if (!value) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return value;
}
