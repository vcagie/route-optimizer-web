import { useRouteContext } from "../state/RouteContext";

function formatDistance(meters: number): string {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
}

function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return `${hours} h ${remaining} min`;
}

export function RouteSummary() {
  const { state } = useRouteContext();
  const { optimized } = state;

  if (!optimized) return null;

  return (
    <div className="route-summary">
      <div className="route-summary__item">
        <span className="route-summary__label">Total distance</span>
        <span className="route-summary__value">{formatDistance(optimized.totalDistanceMeters)}</span>
      </div>
      {typeof optimized.totalDurationSeconds === "number" && (
        <div className="route-summary__item">
          <span className="route-summary__label">Estimated time</span>
          <span className="route-summary__value">{formatDuration(optimized.totalDurationSeconds)}</span>
        </div>
      )}
    </div>
  );
}
