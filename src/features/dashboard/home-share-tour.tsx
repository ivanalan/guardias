import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'guardias.homeShareCoachSeen';
/** Legacy key from the Guideway experiment — treat as seen if present. */
const LEGACY_STORAGE_KEY = 'guideway:seen:home-share';

export async function hasSeenHomeShareCoach(): Promise<boolean> {
  const [current, legacy] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEY),
    AsyncStorage.getItem(LEGACY_STORAGE_KEY),
  ]);
  return (
    (current != null && current !== '') || (legacy != null && legacy !== '')
  );
}

/** Persist that the share coach should never show again. */
export async function markHomeShareCoachSeen(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, '1');
}
