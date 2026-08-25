declare module 'react-native-magic-tab-bar/lib/module/MagicTabItem.js' {
  import type { ForwardRefExoticComponent, RefAttributes } from 'react';
  import type { View } from 'react-native';

  export const MagicTabItem: ForwardRefExoticComponent<
    Record<string, unknown> & RefAttributes<View>
  >;
}
