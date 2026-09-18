import { useEffect, useRef } from 'react';
import { AppState, Platform, type AppStateStatus } from 'react-native';

import { refreshTwoWeekWidget } from './refresh-two-week-widget';

/**
 * Keep the Android two-week widget in sync with app data.
 * Refreshes on mount (cold start) and whenever the app returns to foreground.
 */
export function useTwoWeekWidgetForegroundRefresh(): void {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    void refreshTwoWeekWidget();

    const subscription = AppState.addEventListener(
      'change',
      (next: AppStateStatus) => {
        const wasBackground =
          appState.current === 'background' || appState.current === 'inactive';
        appState.current = next;
        if (wasBackground && next === 'active') {
          void refreshTwoWeekWidget();
        }
      },
    );
    return () => {
      subscription.remove();
    };
  }, []);
}
