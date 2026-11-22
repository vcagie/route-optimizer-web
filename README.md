# Route Optimizer (Frontend)

A portfolio demo for route optimization: add stops, see them on a map, and optimize the visiting order via a separately-deployed backend.

- **Map**: Leaflet + OpenStreetMap tiles (no API key required)
- **Geocoding**: free Nominatim API for address search
- **Routing visualization**: free OSRM public API for road-following polylines
- **Backend**: a separate Python + OR-Tools API (not part of this repo) that returns the optimized stop order

## Features

- Add stops by address search, or load a sample route in one click
- Drag to reorder stops, choose the starting stop, and (one-way) pin the final stop
- Toggle one-way vs round-trip
- "Optimize Route" returns the fastest visiting order, labelled **Proven optimal** when the backend solved it exactly
- Shows the time and distance saved compared with your original order, with both routes drawn on the map
- Drive time and distance for every leg
- Open the route in Google Maps, or copy a share link that restores the stops for anyone who opens it
- Auto-saves your stops to `localStorage` across refreshes
- Responsive layout: on phones the map sits above the controls

## Getting started

```bash
npm install
```

Create a `.env` file (see `.env.example`) pointing at your backend:

```
VITE_API_BASE_URL=http://localhost:8765/api
```

Then run the dev server:

```bash
npm run dev
```

## Backend contract

The frontend `POST`s to `{VITE_API_BASE_URL}/optimize` with:

```json
{
  "locations": [{ "id": "loc-1", "lat": 40.7128, "lng": -74.006 }],
  "mode": "one-way",
  "end_id": "loc-4"
}
```

The first location is the start. `end_id` is optional and only applies to one-way routes.

The response contains the optimized `order` (location ids), `total_distance_m`, `total_duration_s`,
`optimal` (true when the order is proven optimal), per-leg `legs`, and a `baseline` with the totals for
the original order. Older backends that only return `total_distance_km` / `total_duration_min` still work.

## Build

```bash
npm run build
```
