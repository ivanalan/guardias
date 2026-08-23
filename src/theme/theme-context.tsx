import {
  createContext,
  use,
  useEffect,
  type ReactNode,
} from 'react';
import {
  Appearance,
  useColorScheme,
  type ColorSchemeName,
} from 'react-native';

import { colorsFor, type ThemeColors, type ThemeScheme } from './colors';

/** `null` = follow the device color scheme. */
export type ColorSchemePreference = ThemeScheme | null;

type ThemeContextValue = {
  preference: ColorSchemePreference;
  scheme: ThemeScheme;
  colors: ThemeColors;
  setPreference: (preference: ColorSchemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function resolveThemeScheme(
  preference: ColorSchemePreference,
  systemScheme: ColorSchemeName,
): ThemeScheme {
  if (preference != null) {
    return preference;
  }
  return systemScheme === 'dark' ? 'dark' : 'light';
}

export function applyColorSchemePreference(
  preference: ColorSchemePreference,
): void {
  // RN 0.82+ Android rejects null; "unspecified" follows the system scheme.
  Appearance.setColorScheme(preference ?? 'unspecified');
}

type ThemeProviderProps = {
  preference: ColorSchemePreference;
  setPreference: (preference: ColorSchemePreference) => void;
  children: ReactNode;
};

/** Resolves light/dark palettes from preference + system appearance. */
export function ThemeProvider({
  preference,
  setPreference,
  children,
}: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const scheme = resolveThemeScheme(preference, systemScheme);
  const colors = colorsFor(scheme);

  useEffect(() => {
    applyColorSchemePreference(preference);
  }, [preference]);

  return (
    <ThemeContext.Provider
      value={{ preference, scheme, colors, setPreference }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const value = use(ThemeContext);
  if (!value) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return value;
}
