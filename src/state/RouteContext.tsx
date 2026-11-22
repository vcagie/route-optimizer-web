import { createContext, useContext, useEffect, useReducer, type ReactNode } from "react";
import { createRouteState, routeReducer, type RouteAction, type RouteState } from "./routeReducer";
import { clearShareHash, loadFromShareUrl, loadFromStorage, saveToStorage } from "./persistence";

interface RouteContextValue {
  state: RouteState;
  dispatch: React.Dispatch<RouteAction>;
}

const RouteContext = createContext<RouteContextValue | null>(null);

/**
 * Read saved state synchronously while creating the reducer. Loading it in an
 * effect instead lets the save effect overwrite storage with the empty initial
 * state first, which wiped saved stops on every reload under StrictMode.
 * A shared link takes priority over what this browser had saved.
 */
function initRouteState(): RouteState {
  return createRouteState(loadFromShareUrl() ?? loadFromStorage());
}

export function RouteProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(routeReducer, undefined, initRouteState);

  // The shared route has been loaded into state (and is saved below), so tidy
  // the address bar. This must not happen inside the initializer, which React
  // may call twice in StrictMode.
  useEffect(() => {
    clearShareHash();
  }, []);

  useEffect(() => {
    saveToStorage({ locations: state.locations, mode: state.mode, endId: state.endId });
  }, [state.locations, state.mode, state.endId]);

  return <RouteContext.Provider value={{ state, dispatch }}>{children}</RouteContext.Provider>;
}

export function useRouteContext(): RouteContextValue {
  const ctx = useContext(RouteContext);
  if (!ctx) {
    throw new Error("useRouteContext must be used within a RouteProvider");
  }
  return ctx;
}
