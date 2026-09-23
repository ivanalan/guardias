import { requireOptionalNativeModule } from 'expo';
import { Platform } from 'react-native';

/**
 * True only in a custom iOS binary that includes the ExpoWidgets native module.
 * False in Expo Go (and on Android / web) — callers must no-op.
 */
export function isExpoWidgetsLinked(): boolean {
  return (
    Platform.OS === 'ios' && requireOptionalNativeModule('ExpoWidgets') != null
  );
}
