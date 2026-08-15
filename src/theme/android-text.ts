import { Platform, type TextStyle } from 'react-native';

/** Bold text paints wider than RN measures (RN #54931). */
export const ANDROID_TEXT_WIDTH_BUMP: TextStyle | undefined =
  Platform.OS === 'android' ? { paddingRight: 12 } : undefined;
