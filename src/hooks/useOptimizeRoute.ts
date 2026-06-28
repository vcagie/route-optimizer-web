import { useCallback } from "react";
import { API_BASE_URL } from "../config";
import { useRouteContext } from "../state/RouteContext";
import type { OptimizeErrorBody, OptimizeRequestBody, OptimizedRoute } from "../types";

interface RawOptimizeResponse {
  order: string[];
  totalDistanceMeters?: number;
  total_distance_km?: number;
  totalDurationSeconds?: number;
  total_duration_seconds?: number;
  legs?: OptimizedRoute["legs"];
}

function normalizeOptimizeResponse(raw: RawOptimizeResponse): OptimizedRoute {
  const totalDistanceMeters =
    raw.totalDistanceMeters ?? (typeof raw.total_distance_km === "number" ? raw.total_distance_km * 1000 : 0);
  const totalDurationSeconds = raw.totalDurationSeconds ?? raw.total_duration_seconds;

  return {
    order: raw.order,
    totalDistanceMeters,
    ...(totalDurationSeconds !== undefined ? { totalDurationSeconds } : {}),
    ...(raw.legs ? { legs: raw.legs } : {}),
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

    const body: OptimizeRequestBody = {
      locations: state.locations.map(({ id, lat, lng }) => ({ id, lat, lng })),
      mode: state.mode,
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
  }, [state.locations, state.mode, dispatch]);

  return { optimize, status: state.status, error: state.error };
}
