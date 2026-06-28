import type { LocationPoint, OptimizedRoute, RouteMode } from "../types";

export type Status = "idle" | "optimizing" | "error";

export interface RouteState {
  locations: LocationPoint[];
  mode: RouteMode;
  optimized: OptimizedRoute | null;
  previousOrder: string[] | null;
  status: Status;
  error: string | null;
}

export const initialRouteState: RouteState = {
  locations: [],
  mode: "round-trip",
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
  | { type: "OPTIMIZE_START" }
  | { type: "OPTIMIZE_SUCCESS"; payload: OptimizedRoute }
  | { type: "OPTIMIZE_ERROR"; payload: string }
  | { type: "HYDRATE_FROM_STORAGE"; payload: { locations: LocationPoint[]; mode: RouteMode } };

export function routeReducer(state: RouteState, action: RouteAction): RouteState {
  switch (action.type) {
    case "ADD_LOCATION":
      return {
        ...state,
        locations: [...state.locations, action.payload],
        optimized: null,
        previousOrder: null,
        status: "idle",
        error: null,
      };

    case "REMOVE_LOCATION":
      return {
        ...state,
        locations: state.locations.filter((loc) => loc.id !== action.payload.id),
        optimized: null,
        previousOrder: null,
        status: "idle",
        error: null,
      };

    case "REORDER_LOCATIONS": {
      const byId = new Map(state.locations.map((loc) => [loc.id, loc]));
      const reordered = action.payload.orderedIds
        .map((id) => byId.get(id))
        .filter((loc): loc is LocationPoint => Boolean(loc));
      return {
        ...state,
        locations: reordered.length === state.locations.length ? reordered : state.locations,
        optimized: null,
        previousOrder: null,
        status: "idle",
        error: null,
      };
    }

    case "SET_MODE":
      return {
        ...state,
        mode: action.payload,
        optimized: null,
        previousOrder: null,
        status: "idle",
        error: null,
      };

    case "OPTIMIZE_START":
      return { ...state, status: "optimizing", error: null };

    case "OPTIMIZE_SUCCESS": {
      const previousOrder = state.locations.map((loc) => loc.id);
      const byId = new Map(state.locations.map((loc) => [loc.id, loc]));
      const reordered = action.payload.order
        .map((id) => byId.get(id))
        .filter((loc): loc is LocationPoint => Boolean(loc));
      return {
        ...state,
        locations: reordered.length === state.locations.length ? reordered : state.locations,
        optimized: action.payload,
        previousOrder,
        status: "idle",
        error: null,
      };
    }

    case "OPTIMIZE_ERROR":
      return { ...state, status: "error", error: action.payload };

    case "HYDRATE_FROM_STORAGE":
      return {
        ...state,
        locations: action.payload.locations,
        mode: action.payload.mode,
      };

    default:
      return state;
  }
}
