import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { useRouteContext } from "../state/RouteContext";
import { useRoutePath } from "../hooks/useRoutePath";
import type { LocationPoint } from "../types";

function createNumberedIcon(index: number, isOptimized: boolean) {
  return L.divIcon({
    className: "location-marker-icon",
    html: `<div class="location-marker ${isOptimized ? "location-marker--optimized" : ""}">${index + 1}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function bearingDegrees([lat1, lng1]: [number, number], [lat2, lng2]: [number, number]): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaLng = toRad(lng2 - lng1);
  const y = Math.sin(deltaLng) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function createArrowIcon(rotation: number, color: string) {
  return L.divIcon({
    className: "route-arrow-icon",
    html: `<div class="route-arrow" style="transform: rotate(${rotation}deg); color: ${color};">&#9650;</div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function RouteArrows({ path, color, count = 6 }: { path: [number, number][]; color: string; count?: number }) {
  const arrows = useMemo(() => {
    if (path.length < 2) return [];
    const step = Math.max(1, Math.floor(path.length / (count + 1)));
    const points: { position: [number, number]; rotation: number }[] = [];
    for (let i = step; i < path.length - 1; i += step) {
      points.push({ position: path[i], rotation: bearingDegrees(path[i - 1], path[i]) });
    }
    return points;
  }, [path, count]);

  return (
    <>
      {arrows.map((arrow, idx) => (
        <Marker
          key={idx}
          position={arrow.position}
          icon={createArrowIcon(arrow.rotation, color)}
          interactive={false}
        />
      ))}
    </>
  );
}

function FitBounds({ locations }: { locations: LocationPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length === 0) return;
    if (locations.length === 1) {
      map.setView([locations[0].lat, locations[0].lng], 13);
      return;
    }
    const bounds = L.latLngBounds(locations.map((loc) => [loc.lat, loc.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [48, 48] });
  }, [locations, map]);

  return null;
}

const DEFAULT_CENTER: [number, number] = [40.7128, -74.006];
const DRAFT_COLOR = "#475569";
const OPTIMIZED_COLOR = "#1d4ed8";

export function MapView() {
  const { state } = useRouteContext();
  const { locations, optimized, mode } = state;

  const optimizedPositions = useMemo<[number, number][]>(() => {
    if (!optimized) return [];
    const byId = new Map(locations.map((loc) => [loc.id, loc]));
    const ordered = optimized.order
      .map((id) => byId.get(id))
      .filter((loc): loc is LocationPoint => Boolean(loc));
    const positions = ordered.map((loc) => [loc.lat, loc.lng] as [number, number]);
    if (mode === "round-trip" && positions.length > 1) {
      positions.push(positions[0]);
    }
    return positions;
  }, [optimized, locations, mode]);

  const draftPositions = useMemo<[number, number][]>(() => {
    if (optimized) return [];
    const positions = locations.map((loc) => [loc.lat, loc.lng] as [number, number]);
    if (mode === "round-trip" && positions.length > 1) {
      positions.push(positions[0]);
    }
    return positions;
  }, [optimized, locations, mode]);

  const draftRoutePath = useRoutePath(draftPositions);
  const optimizedRoutePath = useRoutePath(optimizedPositions);

  const draftLine = draftRoutePath ?? draftPositions;
  const optimizedLine = optimizedRoutePath ?? optimizedPositions;

  return (
    <MapContainer center={DEFAULT_CENTER} zoom={12} className="map-view">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds locations={locations} />
      {locations.map((loc, index) => (
        <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={createNumberedIcon(index, Boolean(optimized))}>
          <Tooltip>{loc.label}</Tooltip>
        </Marker>
      ))}
      {draftPositions.length > 1 && (
        <>
          <Polyline positions={draftLine} pathOptions={{ color: "#ffffff", weight: 7, opacity: 0.9 }} />
          <Polyline
            positions={draftLine}
            pathOptions={{ color: DRAFT_COLOR, weight: 4, opacity: 0.95, dashArray: "10 8" }}
          />
          <RouteArrows path={draftLine} color={DRAFT_COLOR} />
        </>
      )}
      {optimizedPositions.length > 1 && (
        <>
          <Polyline positions={optimizedLine} pathOptions={{ color: "#ffffff", weight: 8, opacity: 0.9 }} />
          <Polyline positions={optimizedLine} pathOptions={{ color: OPTIMIZED_COLOR, weight: 5, opacity: 0.95 }} />
          <RouteArrows path={optimizedLine} color={OPTIMIZED_COLOR} />
        </>
      )}
    </MapContainer>
  );
}
