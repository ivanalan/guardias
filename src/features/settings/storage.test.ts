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

  it('round-trips System (null), en, and es', async () => {
    await saveAppPreferences({ locale: null });
    await expect(loadAppPreferences()).resolves.toEqual({ locale: null });

    await saveAppPreferences({ locale: 'en' });
    await expect(loadAppPreferences()).resolves.toEqual({ locale: 'en' });

    await saveAppPreferences({ locale: 'es' });
    await expect(loadAppPreferences()).resolves.toEqual({ locale: 'es' });
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
      JSON.stringify({ locale: 'en', extra: true }),
    );
    await expect(loadAppPreferences()).resolves.toEqual({ locale: 'en' });
  });
});
