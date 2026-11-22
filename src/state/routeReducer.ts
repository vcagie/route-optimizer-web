import { MAX_STOPS } from "../config";
import type { LocationPoint, OptimizedRoute, RouteMode } from "../types";

export type Status = "idle" | "optimizing" | "error";

export interface RouteState {
  /** Visiting order. The first stop is always the start of the route. */
  locations: LocationPoint[];
  mode: RouteMode;
  /** One-way only: a stop pinned as the final destination. It is always kept last. */
  endId: string | null;
  optimized: OptimizedRoute | null;
  previousOrder: string[] | null;
  status: Status;
  error: string | null;
}

/** The parts of the state that are saved and shared. */
export interface PersistedRoute {
  locations: LocationPoint[];
  mode: RouteMode;
  endId: string | null;
}

export const initialRouteState: RouteState = {
  locations: [],
  mode: "round-trip",
  endId: null,
  optimized: null,
  previousOrder: null,
  status: "idle",
  error: null,
};

export type RouteAction =
  | { type: "ADD_LOCATION"; payload: LocationPoint }
  | { type: "REMOVE_LOCATION"; payload: { id: string } }
  | { type: "REORDER_LOCATIONS"; payload: { orderedIds: string[] } }
  | { type: "SET_MODE"; payload: RouteMode }
  | { type: "SET_START"; payload: { id: string } }
  | { type: "SET_END"; payload: { id: string | null } }
  | { type: "LOAD_ROUTE"; payload: PersistedRoute }
  | { type: "OPTIMIZE_START" }
  | { type: "OPTIMIZE_SUCCESS"; payload: OptimizedRoute }
  | { type: "OPTIMIZE_ERROR"; payload: string };

export function createRouteState(route: PersistedRoute | null): RouteState {
  if (!route) return initialRouteState;
  const endId = route.mode === "one-way" && route.locations.some((loc) => loc.id === route.endId) ? route.endId : null;
  return { ...initialRouteState, mode: route.mode, endId, locations: keepEndLast(route.locations, endId) };
}

function keepEndLast(locations: LocationPoint[], endId: string | null): LocationPoint[] {
  if (!endId) return locations;
  const end = locations.find((loc) => loc.id === endId);
  if (!end || locations[locations.length - 1] === end) return locations;
  return [...locations.filter((loc) => loc !== end), end];
}

/** Any edit to the stops or settings makes a previous optimization result stale. */
function withEdits(state: RouteState, edits: Partial<RouteState>): RouteState {
  const next = { ...state, ...edits, optimized: null, previousOrder: null, status: "idle" as const, error: null };
  return { ...next, locations: keepEndLast(next.locations, next.endId) };
}

function orderById(locations: LocationPoint[], orderedIds: string[]): LocationPoint[] | null {
  const byId = new Map(locations.map((loc) => [loc.id, loc]));
  const reordered = orderedIds.map((id) => byId.get(id)).filter((loc): loc is LocationPoint => Boolean(loc));
  return reordered.length === locations.length ? reordered : null;
}

export function routeReducer(state: RouteState, action: RouteAction): RouteState {
  switch (action.type) {
    case "ADD_LOCATION":
      if (state.locations.length >= MAX_STOPS) return state;
      return withEdits(state, { locations: [...state.locations, action.payload] });

    case "REMOVE_LOCATION":
      return withEdits(state, {
        locations: state.locations.filter((loc) => loc.id !== action.payload.id),
        endId: state.endId === action.payload.id ? null : state.endId,
      });

    case "REORDER_LOCATIONS":
      return withEdits(state, {
        locations: orderById(state.locations, action.payload.orderedIds) ?? state.locations,
      });

    case "SET_MODE":
      return withEdits(state, {
        mode: action.payload,
        // A round trip always ends where it started, so an end pin no longer applies.
        endId: action.payload === "round-trip" ? null : state.endId,
      });

    case "SET_START": {
      const start = state.locations.find((loc) => loc.id === action.payload.id);
      if (!start) return state;
      return withEdits(state, {
        locations: [start, ...state.locations.filter((loc) => loc !== start)],
        endId: state.endId === start.id ? null : state.endId,
      });
    }

    case "SET_END": {
      const { id } = action.payload;
      const isValid = id === null || (state.locations.some((loc) => loc.id === id) && state.locations[0]?.id !== id);
      if (!isValid || state.mode !== "one-way") return state;
      return withEdits(state, { endId: id });
    }

    case "LOAD_ROUTE":
      return createRouteState(action.payload);

    case "OPTIMIZE_START":
      return { ...state, status: "optimizing", error: null };

    case "OPTIMIZE_SUCCESS":
      return {
        ...state,
        locations: orderById(state.locations, action.payload.order) ?? state.locations,
        optimized: action.payload,
        previousOrder: state.locations.map((loc) => loc.id),
        status: "idle",
        error: null,
      };

    case "OPTIMIZE_ERROR":
      return { ...state, status: "error", error: action.payload };

    default:
      return state;
  }
}
