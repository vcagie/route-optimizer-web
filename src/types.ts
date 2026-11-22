export type RouteMode = "one-way" | "round-trip";

export interface LocationPoint {
  id: string;
  label: string;
  lat: number;
  lng: number;
}

export interface OptimizedLeg {
  fromId: string;
  toId: string;
  distanceMeters: number;
  durationSeconds: number;
}

export interface RouteTotals {
  order: string[];
  totalDistanceMeters: number;
  totalDurationSeconds?: number;
}

export interface OptimizedRoute extends RouteTotals {
  /** True when the solver proved this is the best possible order. */
  optimal?: boolean;
  legs?: OptimizedLeg[];
  /** The user's original order, priced on the same road network, for comparison. */
  baseline?: RouteTotals;
}

export interface OptimizeRequestBody {
  locations: Array<{ id: string; lat: number; lng: number }>;
  mode: RouteMode;
  end_id?: string;
}

export interface OptimizeErrorBody {
  error: string;
}

export interface GeocodeResult {
  label: string;
  lat: number;
  lng: number;
}
