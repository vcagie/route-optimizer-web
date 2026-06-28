import { useEffect, useState } from "react";

const OSRM_URL = "https://router.project-osrm.org/route/v1/driving";

interface OsrmResponse {
  code: string;
  routes?: Array<{ geometry: { coordinates: [number, number][] } }>;
}

function waypointsKey(waypoints: [number, number][]): string {
  return waypoints.map(([lat, lng]) => `${lat.toFixed(5)},${lng.toFixed(5)}`).join(";");
}

export function useRoutePath(waypoints: [number, number][]) {
  const [path, setPath] = useState<[number, number][] | null>(null);
  const key = waypoints.length > 1 ? waypointsKey(waypoints) : "";

  useEffect(() => {
    if (waypoints.length < 2) {
      setPath(null);
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        const coordsParam = waypoints.map(([lat, lng]) => `${lng},${lat}`).join(";");
        const response = await fetch(`${OSRM_URL}/${coordsParam}?overview=full&geometries=geojson`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Routing request failed");
        const data = (await response.json()) as OsrmResponse;
        const route = data.routes?.[0];
        if (!route) throw new Error("No route returned");
        setPath(route.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]));
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setPath(null);
      }
    })();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return path;
}
