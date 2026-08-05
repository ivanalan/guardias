/**
 * CSS-enabled React Native primitives (NativeWind v5 / react-native-css).
 * Prefer these over `react-native` when using `className`.
 */
export {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  TouchableHighlight,
  Image,
} from 'react-native-css/components';

import { useUnstableNativeVariable } from 'react-native-css';

type CSSVariableHook = (name: string) => string;

/**
 * Resolve a CSS custom property for imperative props (icons, nav tint, etc.).
 * Package root types expose the web stub (0 args); native runtime accepts a name.
 */
export const useCSSVariable: CSSVariableHook =
  process.env.EXPO_OS === 'web'
    ? (name) => `var(${name.startsWith('--') ? name : `--${name}`})`
    : (useUnstableNativeVariable as unknown as CSSVariableHook);
