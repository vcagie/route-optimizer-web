import { useOptimizeRoute } from "../hooks/useOptimizeRoute";
import { API_BASE_URL } from "../config";
import { useRouteContext } from "../state/RouteContext";

export function OptimizeButton() {
  const { optimize, status, error } = useOptimizeRoute();
  const { state } = useRouteContext();

  const disabled = !API_BASE_URL || state.locations.length < 2 || status === "optimizing";
  const title = !API_BASE_URL
    ? "Set VITE_API_BASE_URL to enable optimization"
    : state.locations.length < 2
      ? "Add at least 2 locations first"
      : undefined;

  return (
    <div className="optimize-action">
      <button type="button" className="btn btn--primary" disabled={disabled} title={title} onClick={optimize}>
        {status === "optimizing" ? "Optimizing..." : "Optimize Route"}
      </button>
      {status === "error" && error && <p className="optimize-action__error">{error}</p>}
    </div>
  );
}
