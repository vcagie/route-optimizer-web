# Route Optimizer (Frontend)

A portfolio demo for route optimization: add stops, see them on a map, and optimize the visiting order via a separately-deployed backend.

- **Map**: Leaflet + OpenStreetMap tiles (no API key required)
- **Geocoding**: free Nominatim API for address search
- **Routing visualization**: free OSRM public API for road-following polylines
- **Backend**: a separate Python + OR-Tools API (not part of this repo) that returns the optimized stop order

## Features

- Add locations by address search
- Drag to reorder stops manually in the list
- Toggle one-way vs round-trip
- "Optimize Route" sends the current stops + mode to your backend and draws the optimized path
- Auto-saves your location list to `localStorage` across refreshes

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
  "mode": "round-trip"
}
```

and expects back an `order` (array of location ids in optimized visiting order) plus a distance field — either `totalDistanceMeters` or `total_distance_km`, both are supported.

## Build

```bash
npm run build
```
