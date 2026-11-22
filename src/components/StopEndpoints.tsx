import { useRouteContext } from "../state/RouteContext";

function shortLabel(label: string): string {
  return label.split(",")[0].trim() || label;
}

/** Choose where the route starts and, for one-way routes, where it must finish. */
export function StopEndpoints() {
  const { state, dispatch } = useRouteContext();
  const { locations, mode, endId } = state;

  if (locations.length < 2) return null;

  const start = locations[0];

  return (
    <div className="stop-endpoints">
      <div>
        <label className="field-label" htmlFor="route-start-select">
          Start from
        </label>
        <select
          id="route-start-select"
          className="text-input"
          value={start.id}
          onChange={(event) => dispatch({ type: "SET_START", payload: { id: event.target.value } })}
        >
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {shortLabel(loc.label)}
            </option>
          ))}
        </select>
      </div>

      {mode === "one-way" && (
        <div>
          <label className="field-label" htmlFor="route-end-select">
            Finish at
          </label>
          <select
            id="route-end-select"
            className="text-input"
            value={endId ?? ""}
            onChange={(event) => dispatch({ type: "SET_END", payload: { id: event.target.value || null } })}
          >
            <option value="">Anywhere (optimizer decides)</option>
            {locations.slice(1).map((loc) => (
              <option key={loc.id} value={loc.id}>
                {shortLabel(loc.label)}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
