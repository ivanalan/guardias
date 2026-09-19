import {
  createContext,
  use,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';

import { refreshTwoWeekWidget } from '../widget-android/refresh-two-week-widget';
import { refreshUpcomingShiftsWidget } from '../widget-android/refresh-upcoming-widget';
import { loadRotationPeriods, saveRotationPeriods } from './storage';
import type { RotationPeriod } from './types';

type RotationsContextValue = {
  periods: RotationPeriod[];
  addPeriod: (period: RotationPeriod) => void;
  updatePeriod: (period: RotationPeriod) => void;
  deletePeriod: (id: string) => void;
};

const RotationsContext = createContext<RotationsContextValue | null>(null);

/** Ascending by start date (`YYYY-MM-DD` string compare). */
function sortPeriodsByStartDate(
  periods: readonly RotationPeriod[],
): RotationPeriod[] {
  return [...periods].sort((a, b) =>
    a.startDate < b.startDate ? -1 : a.startDate > b.startDate ? 1 : 0,
  );
}

function persistAndRefresh(next: RotationPeriod[]): void {
  void (async () => {
    await saveRotationPeriods(next);
    if (Platform.OS === 'android') {
      await Promise.all([
        refreshTwoWeekWidget(next),
        refreshUpcomingShiftsWidget(next),
      ]);
    }
  })();
}

/** Rotation periods hydrated from AsyncStorage (offline-first). */
export function RotationsProvider({ children }: { children: ReactNode }) {
  const [periods, setPeriods] = useState<RotationPeriod[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const stored = await loadRotationPeriods();
      if (cancelled) {
        return;
      }

      if (stored == null) {
        setPeriods([]);
        await saveRotationPeriods([]);
      } else {
        setPeriods(sortPeriodsByStartDate(stored));
      }

      if (!cancelled) {
        setReady(true);
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const addPeriod = useCallback((period: RotationPeriod) => {
    setPeriods((prev) => {
      const next = sortPeriodsByStartDate([...prev, period]);
      persistAndRefresh(next);
      return next;
    });
  }, []);

  const updatePeriod = useCallback((period: RotationPeriod) => {
    setPeriods((prev) => {
      const next = sortPeriodsByStartDate(
        prev.map((item) => (item.id === period.id ? period : item)),
      );
      persistAndRefresh(next);
      return next;
    });
  }, []);

  const deletePeriod = useCallback((id: string) => {
    setPeriods((prev) => {
      const next = prev.filter((item) => item.id !== id);
      persistAndRefresh(next);
      return next;
    });
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <RotationsContext.Provider
      value={{ periods, addPeriod, updatePeriod, deletePeriod }}
    >
      {children}
    </RotationsContext.Provider>
  );
}

export function useRotations(): RotationsContextValue {
  const value = use(RotationsContext);
  if (!value) {
    throw new Error('useRotations must be used within RotationsProvider');
  }
  return value;
}
