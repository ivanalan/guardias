import {
  createContext,
  use,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { MOCK_ROTATION_PERIODS } from './data/mock-rotation-periods';
import { loadRotationPeriods, saveRotationPeriods } from './storage';
import type { RotationPeriod } from './types';

type RotationsContextValue = {
  periods: RotationPeriod[];
  addPeriod: (period: RotationPeriod) => void;
  updatePeriod: (period: RotationPeriod) => void;
  deletePeriod: (id: string) => void;
};

const RotationsContext = createContext<RotationsContextValue | null>(null);

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
        // First launch: seed demo data, then persist so reloads keep edits.
        setPeriods(MOCK_ROTATION_PERIODS);
        await saveRotationPeriods(MOCK_ROTATION_PERIODS);
      } else {
        setPeriods(stored);
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
      const next = [...prev, period];
      void saveRotationPeriods(next);
      return next;
    });
  }, []);

  const updatePeriod = useCallback((period: RotationPeriod) => {
    setPeriods((prev) => {
      const next = prev.map((item) => (item.id === period.id ? period : item));
      void saveRotationPeriods(next);
      return next;
    });
  }, []);

  const deletePeriod = useCallback((id: string) => {
    setPeriods((prev) => {
      const next = prev.filter((item) => item.id !== id);
      void saveRotationPeriods(next);
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
