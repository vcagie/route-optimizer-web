import type { LocationPoint } from "../types";

interface LocationListItemProps {
  location: LocationPoint;
  index: number;
  previousIndex: number | null;
  isDragging: boolean;
  isDragOver: boolean;
  onRemove: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragOver: (id: string) => void;
  onDrop: (id: string) => void;
  onDragEnd: () => void;
}

export function LocationListItem({
  location,
  index,
  previousIndex,
  isDragging,
  isDragOver,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: LocationListItemProps) {
  const hasMoved = previousIndex !== null && previousIndex !== index;

  return (
    <li
      className={[
        "location-list__item",
        isDragging ? "location-list__item--dragging" : "",
        isDragOver ? "location-list__item--drag-over" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        onDragStart(location.id);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        onDragOver(location.id);
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDrop(location.id);
      }}
      onDragEnd={onDragEnd}
    >
      <span className="location-list__handle" aria-hidden="true">
        ⠿
      </span>
      <span className="location-list__badge">{index + 1}</span>
      {hasMoved && (
        <span className="location-list__moved" title={`Was position ${previousIndex! + 1}`}>
          was {previousIndex! + 1}
        </span>
      )}
      <span className="location-list__label" title={location.label}>
        {location.label}
      </span>
      <button
        type="button"
        className="location-list__remove"
        onClick={() => onRemove(location.id)}
        aria-label={`Remove ${location.label}`}
      >
        ×
      </button>
    </li>
  );
}
