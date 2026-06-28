import { useState } from "react";
import { useGeocode } from "../hooks/useGeocode";
import { useRouteContext } from "../state/RouteContext";
import type { GeocodeResult } from "../types";

export function LocationSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { results, isLoading, error } = useGeocode(query);
  const { dispatch } = useRouteContext();

  function handleSelect(result: GeocodeResult) {
    dispatch({
      type: "ADD_LOCATION",
      payload: {
        id: `loc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        label: result.label,
        lat: result.lat,
        lng: result.lng,
      },
    });
    setQuery("");
    setIsOpen(false);
  }

  return (
    <div className="location-search">
      <label className="field-label" htmlFor="location-search-input">
        Add a location
      </label>
      <input
        id="location-search-input"
        type="text"
        className="text-input"
        placeholder="Search for an address..."
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && query.trim().length >= 3 && (
        <div className="search-results">
          {isLoading && <div className="search-results__status">Searching...</div>}
          {!isLoading && error && <div className="search-results__status search-results__status--error">{error}</div>}
          {!isLoading && !error && results.length === 0 && (
            <div className="search-results__status">No results found.</div>
          )}
          {!isLoading &&
            results.map((result, index) => (
              <button
                key={`${result.lat}-${result.lng}-${index}`}
                type="button"
                className="search-results__item"
                onClick={() => handleSelect(result)}
              >
                {result.label}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
