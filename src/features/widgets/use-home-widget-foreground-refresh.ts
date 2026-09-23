import { useEffect, useRef } from 'react';
import { AppState, Platform, type AppStateStatus } from 'react-native';

import { refreshHomeWidgets } from './refresh-home-widgets';

/**
 * Keep home-screen widgets in sync with app data.
 * Refreshes on mount (cold start) and whenever the app returns to foreground.
 * No-op on web / when widget native modules are absent (Expo Go).
 */
export function useHomeWidgetForegroundRefresh(): void {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
      return;
    }

    void refreshHomeWidgets();

    const subscription = AppState.addEventListener(
      'change',
      (next: AppStateStatus) => {
        const wasBackground =
          appState.current === 'background' || appState.current === 'inactive';
        appState.current = next;
        if (wasBackground && next === 'active') {
          void refreshHomeWidgets();
        }
      },
    );
    return () => {
      subscription.remove();
    };
  }, []);
}
