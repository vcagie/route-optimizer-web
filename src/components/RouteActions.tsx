import { useEffect, useState } from "react";
import { buildShareUrl } from "../state/persistence";
import { useRouteContext } from "../state/RouteContext";
import type { LocationPoint, RouteMode } from "../types";

/** Google Maps directions links accept an origin, a destination and at most 9 waypoints. */
const GOOGLE_MAPS_MAX_WAYPOINTS = 9;

function googleMapsUrl(locations: LocationPoint[], mode: RouteMode): string | null {
  const points = locations.map((loc) => `${loc.lat},${loc.lng}`);
  if (mode === "round-trip") points.push(points[0]);
  if (points.length < 2 || points.length - 2 > GOOGLE_MAPS_MAX_WAYPOINTS) return null;

  const params = new URLSearchParams({
    api: "1",
    origin: points[0],
    destination: points[points.length - 1],
    travelmode: "driving",
  });
  const waypoints = points.slice(1, -1);
  if (waypoints.length > 0) params.set("waypoints", waypoints.join("|"));
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function RouteActions() {
  const { state } = useRouteContext();
  const { locations, mode, endId } = state;
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (copyStatus === "idle") return;
    const timer = setTimeout(() => setCopyStatus("idle"), 2500);
    return () => clearTimeout(timer);
  }, [copyStatus]);

  if (locations.length < 2) return null;

  const mapsUrl = googleMapsUrl(locations, mode);

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(buildShareUrl({ locations, mode, endId }));
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  }

  return (
    <div className="route-actions">
      {mapsUrl ? (
        <a className="btn btn--secondary" href={mapsUrl} target="_blank" rel="noopener noreferrer">
          Open in Google Maps ↗
        </a>
      ) : (
        <button
          type="button"
          className="btn btn--secondary"
          disabled
          title={`Google Maps links allow at most ${GOOGLE_MAPS_MAX_WAYPOINTS} stops between the start and the finish`}
        >
          Open in Google Maps ↗
        </button>
      )}
      <button type="button" className="btn btn--secondary" onClick={copyShareLink}>
        {copyStatus === "copied" ? "Link copied ✓" : copyStatus === "failed" ? "Couldn't copy" : "Copy share link"}
      </button>
    </div>
  );
}
