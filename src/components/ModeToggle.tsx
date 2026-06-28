import { useRouteContext } from "../state/RouteContext";
import type { RouteMode } from "../types";

export function ModeToggle() {
  const { state, dispatch } = useRouteContext();

  function setMode(mode: RouteMode) {
    if (mode === state.mode) return;
    dispatch({ type: "SET_MODE", payload: mode });
  }

  return (
    <div className="mode-toggle" role="radiogroup" aria-label="Route mode">
      <button
        type="button"
        role="radio"
        aria-checked={state.mode === "one-way"}
        className={`mode-toggle__option ${state.mode === "one-way" ? "mode-toggle__option--active" : ""}`}
        onClick={() => setMode("one-way")}
      >
        One-way
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={state.mode === "round-trip"}
        className={`mode-toggle__option ${state.mode === "round-trip" ? "mode-toggle__option--active" : ""}`}
        onClick={() => setMode("round-trip")}
      >
        Round trip
      </button>
    </div>
  );
}
