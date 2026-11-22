import { useCallback } from "react";
import { API_BASE_URL } from "../config";
import { useRouteContext } from "../state/RouteContext";
import type { OptimizeErrorBody, OptimizeRequestBody, OptimizedLeg, OptimizedRoute, RouteTotals } from "../types";

interface RawTotals {
  order: string[];
  total_distance_m?: number;
  total_distance_km?: number;
  total_duration_s?: number;
  total_duration_min?: number;
}

interface RawOptimizeResponse extends RawTotals {
  optimal?: boolean;
  legs?: Array<{ from_id: string; to_id: string; distance_m: number; duration_s: number }>;
  baseline?: RawTotals;
}

/** Accept both the current fields (metres/seconds) and the older km/min ones. */
function normalizeTotals(raw: RawTotals): RouteTotals {
  const totalDistanceMeters =
    raw.total_distance_m ?? (typeof raw.total_distance_km === "number" ? raw.total_distance_km * 1000 : 0);
  const totalDurationSeconds =
    raw.total_duration_s ?? (typeof raw.total_duration_min === "number" ? raw.total_duration_min * 60 : undefined);
  return {
    order: raw.order,
    totalDistanceMeters,
    ...(totalDurationSeconds !== undefined ? { totalDurationSeconds } : {}),
  };
}

function normalizeOptimizeResponse(raw: RawOptimizeResponse): OptimizedRoute {
  const legs: OptimizedLeg[] | undefined = raw.legs?.map((leg) => ({
    fromId: leg.from_id,
    toId: leg.to_id,
    distanceMeters: leg.distance_m,
    durationSeconds: leg.duration_s,
  }));
  return {
    ...normalizeTotals(raw),
    optimal: raw.optimal,
    ...(legs ? { legs } : {}),
    ...(raw.baseline ? { baseline: normalizeTotals(raw.baseline) } : {}),
  };
}

export function useOptimizeRoute() {
  const { state, dispatch } = useRouteContext();

  const optimize = useCallback(async () => {
    if (!API_BASE_URL) {
      dispatch({ type: "OPTIMIZE_ERROR", payload: "Backend API URL is not configured (VITE_API_BASE_URL)." });
      return;
    }
    if (state.locations.length < 2) {
      dispatch({ type: "OPTIMIZE_ERROR", payload: "Add at least 2 locations to optimize a route." });
      return;
    }

    dispatch({ type: "OPTIMIZE_START" });

    // The first stop is the start; the backend defaults to it.
    const body: OptimizeRequestBody = {
      locations: state.locations.map(({ id, lat, lng }) => ({ id, lat, lng })),
      mode: state.mode,
      ...(state.mode === "one-way" && state.endId ? { end_id: state.endId } : {}),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let message = `Optimization failed (${response.status}).`;
        try {
          const errorBody = (await response.json()) as OptimizeErrorBody;
          if (errorBody?.error) message = errorBody.error;
        } catch {
          // ignore parse failure, keep generic message
        }
        dispatch({ type: "OPTIMIZE_ERROR", payload: message });
        return;
      }

      const data = (await response.json()) as RawOptimizeResponse;
      dispatch({ type: "OPTIMIZE_SUCCESS", payload: normalizeOptimizeResponse(data) });
    } catch {
      dispatch({ type: "OPTIMIZE_ERROR", payload: "Could not reach the optimization service. Please try again." });
    }
  }, [state.locations, state.mode, state.endId, dispatch]);

  return { optimize, status: state.status, error: state.error };
}
