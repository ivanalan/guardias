import { useEffect, useRef } from 'react';
import { AppState, Platform, type AppStateStatus } from 'react-native';

import { refreshTwoWeekWidget } from './refresh-two-week-widget';
import { refreshUpcomingShiftsWidget } from './refresh-upcoming-widget';

async function refreshAllAndroidWidgets(): Promise<void> {
  await Promise.all([refreshTwoWeekWidget(), refreshUpcomingShiftsWidget()]);
}

/**
 * Keep Android home-screen widgets in sync with app data.
 * Refreshes on mount (cold start) and whenever the app returns to foreground.
 */
export function useAndroidWidgetForegroundRefresh(): void {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    void refreshAllAndroidWidgets();

    const subscription = AppState.addEventListener(
      'change',
      (next: AppStateStatus) => {
        const wasBackground =
          appState.current === 'background' || appState.current === 'inactive';
        appState.current = next;
        if (wasBackground && next === 'active') {
          void refreshAllAndroidWidgets();
        }
      },
    );
    return () => {
      subscription.remove();
    };
  }, []);
}
