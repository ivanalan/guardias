import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  loadAppPreferences,
  saveAppPreferences,
} from './storage';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

describe('app preferences storage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns null when nothing is stored', async () => {
    await expect(loadAppPreferences()).resolves.toBeNull();
  });

  it('round-trips locale System (null), en, and es', async () => {
    await saveAppPreferences({ locale: null });
    await expect(loadAppPreferences()).resolves.toEqual({
      locale: null,
      colorScheme: null,
    });

    await saveAppPreferences({ locale: 'en' });
    await expect(loadAppPreferences()).resolves.toEqual({
      locale: 'en',
      colorScheme: null,
    });

    await saveAppPreferences({ locale: 'es' });
    await expect(loadAppPreferences()).resolves.toEqual({
      locale: 'es',
      colorScheme: null,
    });
  });

  it('round-trips colorScheme System, light, and dark', async () => {
    await saveAppPreferences({ colorScheme: null });
    await expect(loadAppPreferences()).resolves.toMatchObject({
      colorScheme: null,
    });

    await saveAppPreferences({ colorScheme: 'light' });
    await expect(loadAppPreferences()).resolves.toMatchObject({
      colorScheme: 'light',
    });

    await saveAppPreferences({ colorScheme: 'dark' });
    await expect(loadAppPreferences()).resolves.toMatchObject({
      colorScheme: 'dark',
    });
  });

  it('merges partial saves so locale and colorScheme do not clobber', async () => {
    await saveAppPreferences({ locale: 'en', colorScheme: 'dark' });
    await saveAppPreferences({ locale: 'es' });
    await expect(loadAppPreferences()).resolves.toEqual({
      locale: 'es',
      colorScheme: 'dark',
    });

    await saveAppPreferences({ colorScheme: 'light' });
    await expect(loadAppPreferences()).resolves.toEqual({
      locale: 'es',
      colorScheme: 'light',
    });
  });

  it('accepts legacy locale-only payloads', async () => {
    await AsyncStorage.setItem(
      'guardias.appPreferences',
      JSON.stringify({ locale: 'en' }),
    );
    await expect(loadAppPreferences()).resolves.toEqual({
      locale: 'en',
      colorScheme: null,
    });
  });

  it('returns null for corrupt or invalid payloads', async () => {
    await AsyncStorage.setItem('guardias.appPreferences', 'not-json');
    await expect(loadAppPreferences()).resolves.toBeNull();

    await AsyncStorage.setItem(
      'guardias.appPreferences',
      JSON.stringify({ locale: 'fr' }),
    );
    await expect(loadAppPreferences()).resolves.toBeNull();

    await AsyncStorage.setItem(
      'guardias.appPreferences',
      JSON.stringify({ locale: 'en', colorScheme: 'purple' }),
    );
    await expect(loadAppPreferences()).resolves.toBeNull();

    await AsyncStorage.setItem(
      'guardias.appPreferences',
      JSON.stringify({ locale: 'en', extra: true }),
    );
    await expect(loadAppPreferences()).resolves.toEqual({
      locale: 'en',
      colorScheme: null,
    });
  });
});
