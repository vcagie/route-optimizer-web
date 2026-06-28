import { createContext, useContext, useEffect, useReducer, type ReactNode } from "react";
import { initialRouteState, routeReducer, type RouteAction, type RouteState } from "./routeReducer";
import type { LocationPoint, RouteMode } from "../types";

const STORAGE_KEY = "route-optimizer:state";

interface StoredState {
  locations: LocationPoint[];
  mode: RouteMode;
}

function loadFromStorage(): StoredState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredState;
    if (!Array.isArray(parsed.locations)) return null;
    return parsed;
  } catch {
    return null;
  }
}

interface RouteContextValue {
  state: RouteState;
  dispatch: React.Dispatch<RouteAction>;
}

const RouteContext = createContext<RouteContextValue | null>(null);

export function RouteProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(routeReducer, initialRouteState);

  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) {
      dispatch({ type: "HYDRATE_FROM_STORAGE", payload: stored });
    }
  }, []);

  useEffect(() => {
    const toStore: StoredState = { locations: state.locations, mode: state.mode };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  }, [state.locations, state.mode]);

  return <RouteContext.Provider value={{ state, dispatch }}>{children}</RouteContext.Provider>;
}

export function useRouteContext(): RouteContextValue {
  const ctx = useContext(RouteContext);
  if (!ctx) {
    throw new Error("useRouteContext must be used within a RouteProvider");
  }
  return ctx;
}
