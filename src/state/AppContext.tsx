import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AppState } from "@/types";
import { createEmptyState } from "@/data/demo";
import { loadState, saveState } from "@/lib/storage";

interface AppContextValue {
  state: AppState;
  updateState: (update: Partial<AppState>) => void;
  replaceState: (state: AppState) => void;
  resetState: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState());
  useEffect(() => { saveState(state); }, [state]);
  const value = useMemo<AppContextValue>(() => ({
    state,
    updateState: (update) => setState((current) => ({ ...current, ...update })),
    replaceState: setState,
    resetState: () => setState(createEmptyState()),
  }), [state]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppState must be used inside AppProvider");
  return context;
}
