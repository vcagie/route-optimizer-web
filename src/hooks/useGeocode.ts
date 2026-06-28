import { useEffect, useRef, useState } from "react";
import type { GeocodeResult } from "../types";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const DEBOUNCE_MS = 400;

export function useGeocode(query: string) {
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (trimmed.length < 3) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const controller = new AbortController();

    debounceRef.current = setTimeout(async () => {
      try {
        const url = `${NOMINATIM_URL}?format=json&q=${encodeURIComponent(trimmed)}&limit=5`;
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error("Geocoding request failed");
        const data = (await response.json()) as Array<{ display_name: string; lat: string; lon: string }>;
        setResults(
          data.map((item) => ({
            label: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          }))
        );
        setError(null);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError("Could not search for that address. Please try again.");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return { results, isLoading, error };
}
