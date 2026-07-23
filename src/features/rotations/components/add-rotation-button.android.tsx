import { Component, type ReactNode } from 'react';
import { View } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FAB_MARGIN, FallbackFab, useAddRotationAction } from './fallback-fab';

/** `@expo/ui` Jetpack Compose is not in Expo Go — skip loading it there. */
const hasExpoUI = requireOptionalNativeModule('ExpoUI') != null;

class FabErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function ComposeFloatingAddButton({ onPress }: { onPress: () => void }) {
  // Dynamic require so Expo Go never evaluates `@expo/ui` at module load.
  const {
    FloatingActionButton,
    Host,
    Icon,
  } = require('@expo/ui/jetpack-compose') as typeof import('@expo/ui/jetpack-compose');
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        bottom: Math.max(insets.bottom, FAB_MARGIN) + 8,
        right: FAB_MARGIN,
      }}
    >
      {/* matchContents — Host sizes to the FAB; absoluteFill stretched it full-screen */}
      <Host matchContents>
        <FloatingActionButton onClick={onPress}>
          <FloatingActionButton.Icon>
            <Icon source={require('../../../../assets/icons/add.xml')} />
          </FloatingActionButton.Icon>
        </FloatingActionButton>
      </Host>
    </View>
  );
}

/** Android Material FAB via Compose; RN Pressable when Compose is unavailable. */
export function FloatingAddButton() {
  const { a11yLabel, onPress } = useAddRotationAction();
  const fallback = <FallbackFab onPress={onPress} a11yLabel={a11yLabel} />;

  if (!hasExpoUI) {
    return fallback;
  }

  return (
    <FabErrorBoundary fallback={fallback}>
      <ComposeFloatingAddButton onPress={onPress} />
    </FabErrorBoundary>
  );
}
