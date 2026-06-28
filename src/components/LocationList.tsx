import { useState } from "react";
import { useRouteContext } from "../state/RouteContext";
import { LocationListItem } from "./LocationListItem";

export function LocationList() {
  const { state, dispatch } = useRouteContext();
  const { locations, previousOrder } = state;
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

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
    return <p className="location-list__empty">No locations added yet. Search above to get started.</p>;
  }

  return (
    <ul className="location-list">
      {locations.map((loc, index) => {
        const previousIndex = previousOrder ? previousOrder.indexOf(loc.id) : -1;
        return (
          <LocationListItem
            key={loc.id}
            location={loc}
            index={index}
            previousIndex={previousIndex >= 0 ? previousIndex : null}
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
  );
}
