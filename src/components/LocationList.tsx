import { useState } from "react";
import { MAX_STOPS } from "../config";
import { SAMPLE_STOPS } from "../data/sampleRoute";
import { createLocationId } from "../state/persistence";
import { useRouteContext } from "../state/RouteContext";
import type { OptimizedLeg } from "../types";
import { LocationListItem } from "./LocationListItem";

export function LocationList() {
  const { state, dispatch } = useRouteContext();
  const { locations, previousOrder, optimized, mode, endId } = state;
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const legsByFromId = new Map<string, OptimizedLeg>(optimized?.legs?.map((leg) => [leg.fromId, leg]) ?? []);

  function loadSample() {
    dispatch({
      type: "LOAD_ROUTE",
      payload: {
        locations: SAMPLE_STOPS.map((stop) => ({ ...stop, id: createLocationId() })),
        mode: "round-trip",
        endId: null,
      },
    });
  }

  function clearAll() {
    dispatch({ type: "LOAD_ROUTE", payload: { locations: [], mode, endId: null } });
  }

  function handleRemove(id: string) {
    dispatch({ type: "REMOVE_LOCATION", payload: { id } });
  }

  function handleDragStart(id: string) {
    setDraggedId(id);
  }

  function handleDragOver(id: string) {
    if (id !== dragOverId) setDragOverId(id);
  }

  function handleDrop(targetId: string) {
    if (draggedId && draggedId !== targetId) {
      const ids = locations.map((loc) => loc.id);
      const fromIndex = ids.indexOf(draggedId);
      const toIndex = ids.indexOf(targetId);
      const reordered = [...ids];
      reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, draggedId);
      dispatch({ type: "REORDER_LOCATIONS", payload: { orderedIds: reordered } });
    }
    setDraggedId(null);
    setDragOverId(null);
  }

  function handleDragEnd() {
    setDraggedId(null);
    setDragOverId(null);
  }

  if (locations.length === 0) {
    return (
      <div className="location-list__empty">
        <p>No stops yet. Search for an address above, or see it in action first:</p>
        <button type="button" className="btn btn--secondary" onClick={loadSample}>
          Try a sample route in Paris
        </button>
      </div>
    );
  }

  return (
    <section className="location-list-section">
      <div className="location-list__header">
        <span className="field-label">
          Stops {locations.length}/{MAX_STOPS}
        </span>
        <button type="button" className="link-button" onClick={clearAll}>
          Clear all
        </button>
      </div>
      <ul className="location-list">
        {locations.map((loc, index) => {
          const previousIndex = previousOrder ? previousOrder.indexOf(loc.id) : -1;
          const isLast = index === locations.length - 1;
          return (
            <LocationListItem
              key={loc.id}
              location={loc}
              index={index}
              previousIndex={previousIndex >= 0 ? previousIndex : null}
              role={index === 0 ? "start" : mode === "one-way" && loc.id === endId ? "end" : null}
              leg={legsByFromId.get(loc.id) ?? null}
              legReturnsToStart={mode === "round-trip" && isLast}
              isDragging={draggedId === loc.id}
              isDragOver={dragOverId === loc.id && draggedId !== loc.id}
              onRemove={handleRemove}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
            />
          );
        })}
      </ul>
    </section>
  );
}
