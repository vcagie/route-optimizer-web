import { useRouteContext } from "../state/RouteContext";
import type { OptimizedRoute } from "../types";
import { formatDistance, formatDuration } from "../utils/format";

/** Below this, a difference is rounding noise rather than a real improvement. */
const MIN_MEANINGFUL_SAVING_SECONDS = 30;

function Savings({ route }: { route: OptimizedRoute }) {
  const { baseline } = route;
  if (!baseline || route.totalDurationSeconds === undefined || baseline.totalDurationSeconds === undefined) {
    return null;
  }

  const savedSeconds = baseline.totalDurationSeconds - route.totalDurationSeconds;
  if (savedSeconds < MIN_MEANINGFUL_SAVING_SECONDS) {
    return (
      <p className="route-summary__savings route-summary__savings--neutral">
        {route.optimal ? "Your original order was already the best one." : "No faster order was found."}
      </p>
    );
  }

  const percent = Math.round((savedSeconds / baseline.totalDurationSeconds) * 100);
  const distanceDelta = baseline.totalDistanceMeters - route.totalDistanceMeters;
  const distanceNote =
    Math.abs(distanceDelta) < 50
      ? null
      : distanceDelta > 0
        ? `${formatDistance(distanceDelta)} shorter`
        : `${formatDistance(-distanceDelta)} longer, but faster roads`;

  return (
    <p className="route-summary__savings">
      <strong>
        Saves {formatDuration(savedSeconds)} ({percent}%)
      </strong>{" "}
      compared with your original order
      {distanceNote && <span className="route-summary__savings-detail">{distanceNote}</span>}
    </p>
  );
}

export function RouteSummary() {
  const { state } = useRouteContext();
  const { optimized } = state;

  if (!optimized) return null;

  return (
    <div className="route-summary" aria-live="polite">
      <div className="route-summary__header">
        <span className="route-summary__title">Optimized route</span>
        {optimized.optimal !== undefined && (
          <span
            className={`route-summary__badge ${optimized.optimal ? "route-summary__badge--optimal" : ""}`}
            title={
              optimized.optimal
                ? "Every possible order was considered (Held-Karp dynamic programming), so no faster order exists."
                : "Too many stops to check every order, so this is the best route found by a time-limited search."
            }
          >
            {optimized.optimal ? "✓ Proven optimal" : "Best found"}
          </span>
        )}
      </div>
      <div className="route-summary__stats">
        {typeof optimized.totalDurationSeconds === "number" && (
          <div className="route-summary__item">
            <span className="route-summary__label">Drive time</span>
            <span className="route-summary__value">{formatDuration(optimized.totalDurationSeconds)}</span>
          </div>
        )}
        <div className="route-summary__item">
          <span className="route-summary__label">Total distance</span>
          <span className="route-summary__value">{formatDistance(optimized.totalDistanceMeters)}</span>
        </div>
      </div>
      <Savings route={optimized} />
    </div>
  );
}
