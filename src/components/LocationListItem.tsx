import type { LocationPoint, OptimizedLeg } from "../types";
import { formatDistance, formatDuration } from "../utils/format";

interface LocationListItemProps {
  location: LocationPoint;
  index: number;
  previousIndex: number | null;
  role: "start" | "end" | null;
  /** The drive from this stop to the next one, once the route is optimized. */
  leg: OptimizedLeg | null;
  legReturnsToStart: boolean;
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
  role,
  leg,
  legReturnsToStart,
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
      <span className={`location-list__badge ${role ? `location-list__badge--${role}` : ""}`}>{index + 1}</span>
      <div className="location-list__content">
        <div className="location-list__title">
          <span className="location-list__label" title={location.label}>
            {location.label}
          </span>
          {role && <span className={`location-list__tag location-list__tag--${role}`}>{role}</span>}
          {hasMoved && (
            <span className="location-list__moved" title={`Was position ${previousIndex + 1}`}>
              was {previousIndex + 1}
            </span>
          )}
        </div>
        {leg && (
          <span className="location-list__leg">
            {legReturnsToStart ? "↩ back to start" : "↓ next stop"} · {formatDuration(leg.durationSeconds)} ·{" "}
            {formatDistance(leg.distanceMeters)}
          </span>
        )}
      </div>
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
