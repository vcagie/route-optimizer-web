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
  durationSeconds?: number;
}

export interface OptimizedRoute {
  order: string[];
  totalDistanceMeters: number;
  totalDurationSeconds?: number;
  legs?: OptimizedLeg[];
}

export interface OptimizeRequestBody {
  locations: Array<{ id: string; lat: number; lng: number }>;
  mode: RouteMode;
}

export interface OptimizeErrorBody {
  error: string;
}

export interface GeocodeResult {
  label: string;
  lat: number;
  lng: number;
}
