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

  if (!ready) {
    return null;
  }

  return (
    <RotationsContext.Provider value={{ periods, addPeriod }}>
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
