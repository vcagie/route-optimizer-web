import type { LocationPoint } from "../types";

/**
 * A day of sightseeing in Paris, deliberately listed in an inefficient order
 * so first-time visitors can see the optimizer make a visible difference.
 */
export const SAMPLE_STOPS: Omit<LocationPoint, "id">[] = [
  { label: "Eiffel Tower, Paris", lat: 48.8584, lng: 2.2945 },
  { label: "Place de la Bastille, Paris", lat: 48.8532, lng: 2.3691 },
  { label: "Arc de Triomphe, Paris", lat: 48.8738, lng: 2.295 },
  { label: "Panthéon, Paris", lat: 48.8462, lng: 2.3464 },
  { label: "Sacré-Cœur, Paris", lat: 48.8867, lng: 2.3431 },
  { label: "Musée d'Orsay, Paris", lat: 48.86, lng: 2.3266 },
  { label: "Notre-Dame de Paris", lat: 48.853, lng: 2.3499 },
  { label: "Louvre Museum, Paris", lat: 48.8606, lng: 2.3376 },
];
