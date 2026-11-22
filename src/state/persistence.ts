import { MAX_STOPS } from "../config";
import type { LocationPoint, RouteMode } from "../types";
import type { PersistedRoute } from "./routeReducer";

const STORAGE_KEY = "route-optimizer:state";
const SHARE_HASH_PREFIX = "#route=";

export function createLocationId(): string {
  return `loc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isMode(value: unknown): value is RouteMode {
  return value === "one-way" || value === "round-trip";
}

function isValidStop(value: unknown): value is LocationPoint {
  if (typeof value !== "object" || value === null) return false;
  const { id, label, lat, lng } = value as Record<string, unknown>;
  return (
    typeof id === "string" &&
    typeof label === "string" &&
    typeof lat === "number" &&
    typeof lng === "number" &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  );
}

function sanitize(value: unknown): PersistedRoute | null {
  if (typeof value !== "object" || value === null) return null;
  const { locations, mode, endId } = value as Record<string, unknown>;
  if (!Array.isArray(locations) || !locations.every(isValidStop)) return null;
  return {
    locations: locations.slice(0, MAX_STOPS),
    mode: isMode(mode) ? mode : "round-trip",
    endId: typeof endId === "string" ? endId : null,
  };
}

export function loadFromStorage(): PersistedRoute | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? sanitize(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function saveToStorage(route: PersistedRoute): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(route));
  } catch {
    // Storage can be full or blocked (e.g. private mode); saving is best-effort.
  }
}

/** Compact share format: stops as [label, lat, lng] tuples, end pin as an index. */
interface SharePayload {
  v: 1;
  m: RouteMode;
  e: number | null;
  s: Array<[string, number, number]>;
}

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(encoded: string): string {
  const binary = atob(encoded.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
}

export function buildShareUrl(route: PersistedRoute): string {
  const endIndex = route.endId ? route.locations.findIndex((loc) => loc.id === route.endId) : -1;
  const payload: SharePayload = {
    v: 1,
    m: route.mode,
    e: endIndex >= 0 ? endIndex : null,
    s: route.locations.map((loc) => [loc.label, +loc.lat.toFixed(5), +loc.lng.toFixed(5)]),
  };
  const url = new URL(window.location.href);
  url.hash = `${SHARE_HASH_PREFIX.slice(1)}${toBase64Url(JSON.stringify(payload))}`;
  return url.toString();
}

export function hasSharedRoute(): boolean {
  return window.location.hash.startsWith(SHARE_HASH_PREFIX);
}

export function loadFromShareUrl(): PersistedRoute | null {
  if (!hasSharedRoute()) return null;
  try {
    const payload = JSON.parse(fromBase64Url(window.location.hash.slice(SHARE_HASH_PREFIX.length))) as SharePayload;
    if (payload.v !== 1 || !Array.isArray(payload.s)) return null;
    const locations = payload.s.map(([label, lat, lng]) => ({ id: createLocationId(), label, lat, lng }));
    const endId = typeof payload.e === "number" ? (locations[payload.e]?.id ?? null) : null;
    return sanitize({ locations, mode: payload.m, endId });
  } catch {
    return null;
  }
}

export function clearShareHash(): void {
  if (!hasSharedRoute()) return;
  const url = new URL(window.location.href);
  url.hash = "";
  window.history.replaceState(null, "", url.toString());
}
