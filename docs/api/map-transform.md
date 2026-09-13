# MapTransform class

The class for sub-map selection, viewport transformation, and cross-map viewport synchronization (Processings 2–4).

## Constructor

```javascript
import { MapTransform } from '@maplat/transform';

const mt = new MapTransform();
```

## Methods

### `setMapData(mapData: MapData): void`

Load a main TIN and optional sub-map TINs.

- **Parameters:**
  - `mapData`: `{ compiled, maxZoom?, sub_maps? }` — main compiled TIN data, optional explicit maxZoom, and optional array of sub-map definitions

### `xy2Merc(xy: number[]): number[] | false`

Transform a pixel coordinate to EPSG:3857 using the main TIN.

- **Parameters:** `xy` — pixel coordinate `[x, y]`
- **Returns:** EPSG:3857 coordinate, or `false` if out of bounds

### `merc2Xy(merc: number[]): number[] | false`

Transform an EPSG:3857 coordinate to pixel coordinate using the main TIN (reverse).

- **Parameters:** `merc` — EPSG:3857 coordinate `[x, y]`
- **Returns:** Pixel coordinate, or `false` if out of bounds

### `xy2MercWithLayer(xy: number[]): [number, number[]] | false`

Transform a pixel coordinate to EPSG:3857, automatically selecting the appropriate TIN from sub-maps based on priority and region (Processing 2).

- **Parameters:** `xy` — pixel coordinate `[x, y]`
- **Returns:** `[layerIndex, mercCoord]` or `false` if out of bounds

### `merc2XyWithLayer(merc: number[]): ([number, number[]] | undefined)[]`

Transform an EPSG:3857 coordinate to pixel coordinate across all applicable TIN layers, returning up to 2 results ordered by importance (Processing 2).

> To return more than 2 layers, increase the limit in the `.slice(0, 2)` / `.filter(i < 2)` lines inside the implementation.

- **Parameters:** `merc` — EPSG:3857 coordinate `[x, y]`
- **Returns:** Array of up to 2 elements; each is `[layerIndex, xyCoord]` or `undefined`

This method is intended for viewpoint conversion and general coordinate transformation (it always keeps the main map as a candidate). To decide which layer a GPS marker or POI pin should be drawn on, use `merc2XyVisibleLayers`.

### `merc2XyVisibleLayers(merc: number[]): [number, number[]][]`

Return the layers that correspond to an EPSG:3857 coordinate and are not covered by another layer, for choosing where to draw GPS markers and POI pins.

1. Each layer's TIN reverse-transforms the coordinate. A sub-map is a corresponding layer only when the result lies inside its own `xyBounds`. The main map (layer 0) is always a candidate; whether the result lies on the main map's paper is **not** checked here (the caller filters it).
2. A corresponding layer is covered when its pixel coordinate lies inside the `xyBounds` of a sub-map with a higher priority, regardless of whether that sub-map itself corresponds to the coordinate. The main map is also covered by a priority-0 sub-map.
3. Sub-maps with the same priority do not cover each other.
4. The uncovered layers are sorted by importance (descending), then priority (descending), then layer index (ascending), and **all** of them are returned (no upper limit).
5. If no uncovered layer exists, an empty array is returned (out of range). `undefined` placeholders are never returned.

- **Parameters:** `merc` — EPSG:3857 coordinate `[x, y]`
- **Returns:** Array (0 or more elements) of `[layerIndex, xyCoord]`
- **Throws:** Error if `setMapData()` has not been called

### `viewpoint2Mercs(viewpoint: Viewpoint, size: [number, number]): number[][]`

Convert a pixel-space viewport to five EPSG:3857 points (Processing 3).

- **Parameters:**
  - `viewpoint`: `{ center, zoom, rotation }` — viewport in pixel space (center as EPSG:3857 equivalent via `xy2SysCoord`)
  - `size`: Canvas size `[width, height]`
- **Returns:** Array of 5 EPSG:3857 points `[center, north, east, south, west]`
- **Throws:** Error if the center point is outside the TIN bounds

### `mercs2Viewpoint(mercs: number[][], size: [number, number]): Viewpoint`

Convert five EPSG:3857 points back to a pixel-space viewport (Processing 3 reverse).

- **Parameters:**
  - `mercs`: Array of 5 EPSG:3857 points (as returned by `viewpoint2Mercs`)
  - `size`: Canvas size `[width, height]`
- **Returns:** `Viewpoint` — `{ center, zoom, rotation }` in pixel space
- **Throws:** Error if the center point cannot be reverse-transformed

## Accessors

- `maxxy: number` — `2^maxZoom × 256`; the pixel-to-EPSG:3857 scale factor

## Exported Types

- `Viewpoint` — `{ center: number[], zoom: number, rotation: number }`
- `MapData` — `{ compiled: Compiled, maxZoom?: number, sub_maps?: SubMapData[] }`
- `SubMapData` — `{ compiled: Compiled, priority: number, importance: number, bounds?: number[][] }`

## See also

- [Transform class](transform.md) — coordinate transformation (Processing 1)
- [Main README](../README.md) — install / quick start / ecosystem
