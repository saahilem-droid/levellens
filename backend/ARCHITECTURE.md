# Architecture

## What it's built with, and why

**Backend: FastAPI + Pandas.** Match logs arrive as per-match parquet files. Pandas is the natural tool for loading, filtering (`map_id`, `event` type, `match_id`), and grouping (e.g. `groupby("user_id")` for paths) this kind of tabular event data. FastAPI was chosen over Flask/Django because the app is purely a JSON API with no templating or auth needs — FastAPI gives fast iteration, async support, and free interactive docs at `/docs`.

**Frontend: Next.js + Canvas/SVG.** A single dashboard page with heavy client-side rendering didn't need server-rendering or routing complexity, but Next.js was still the fastest path to a deployable React app on Vercel. Heatmaps are drawn on `<canvas>` because they can involve thousands of points per layer — canvas with radial gradients and an offscreen-canvas cache (keyed by a cheap hash of the point set) keeps re-renders fast even when toggling layers. Player paths and the replay's animated trail use SVG `<polyline>`, since those are a handful of long paths rather than thousands of independent points, where SVG's simplicity wins.

## Data flow

1. **Parquet files on disk** (`backend/data/<date>/*.parquet`) — one file per match, containing every logged event (`Position`, `BotPosition`, `Loot`, `Kill`, `Killed`, `BotKill`, `BotKilled`, `KilledByStorm`) with `x`/`z` world coordinates and a timestamp.
2. **`load_date()`** loads and concatenates all matches for a given date into one DataFrame.
3. **FastAPI endpoints** (`/movement`, `/loot`, `/deaths`, `/kills`, `/botkills`, `/storm`, `/paths`, `/replay`) filter that DataFrame by map, match, and event type, then convert every point's world coordinates into minimap pixel coordinates (see below).
4. For heatmap endpoints, points are bucketed into a **20px grid** and counted, so the frontend receives `{x, y, visits}` cells rather than raw points — this caps payload size and gives the heatmap a natural intensity signal.
5. **Frontend** fetches these endpoints per layer/date/map/match combination, then renders them: heatmap layers on canvas, `paths` as SVG polylines, `replay` as a scrubbable, timestamp-ordered per-player point sequence.

## Coordinate mapping (world → minimap)

Each map has its own affine mapping, defined per-map in `MAP_CONFIG`:

```python
MAP_CONFIG = {
    "AmbroseValley": {"scale": 900,  "origin_x": -370, "origin_z": -473},
    "GrandRift":     {"scale": 581,  "origin_x": -290, "origin_z": -290},
    "Lockdown":      {"scale": 1000, "origin_x": -500, "origin_z": -500},
}
```

The transform itself, in `world_to_minimap(x, z, map_name)`:

```python
pixel_x = ((x - origin_x) / scale) * 1024
pixel_y = 1024 - (((z - origin_z) / scale) * 1024)
```

**How this works:**
- `origin_x`/`origin_z` shift world coordinates so the map's playable bottom-left corner becomes `(0, 0)`.
- Dividing by `scale` normalizes that shifted coordinate into a `0–1` range (`scale` is effectively "world units across the playable area").
- Multiplying by `1024` maps that into pixel space, since minimaps are rendered at a fixed `1024×1024` canvas.
- The `y` axis is **flipped** (`1024 - ...`) because in-game `z` typically increases "north/up" in world space, while image pixel `y` increases downward. Without the flip, the heatmap would be mirrored vertically relative to the actual minimap image.

`scale` and the two origins were tuned per map by trial and error: overlay sampled in-game positions onto the minimap image and adjust until points landed on the correct visual features (paths, buildings, map edges).

**Validation step:** every heatmap/position endpoint additionally samples the actual minimap pixel at the computed `(px, py)` and checks its RGB value (`r < 120 and g < 100 and b < 100` → treated as "off-map"/background and discarded). This is a pragmatic guard against bad transforms or out-of-bounds points polluting the heatmap, since the minimap images use a dark background outside the playable area.

## Assumptions made where data was ambiguous

- **Bot vs. human attribution**: events are split by string-prefix convention (`event.startswith("Bot")` → bot; e.g. `BotPosition`, `BotKill`, `BotKilled`). There's no explicit `is_bot` flag in the raw data, so this naming convention is trusted as ground truth.
- **"All Matches" aggregation**: when no specific match is selected, all matches for that date+map are pooled into one heatmap. This assumes positions are comparable across matches on the same map (true, since coordinates are world-space and map geometry doesn't change between matches).
- **Off-map point filtering**: the RGB-threshold check (`r<120, g<100, b<100` = background) is a heuristic, not a precise map-boundary polygon. It's good enough to drop clearly-invalid points but could mis-classify a few legitimately dark in-map areas (e.g. shadowed buildings) as "off-map."
- **Heatmap grid resolution**: a 20px bucket size was chosen as a balance between visual smoothness and not over-aggregating small-scale movement detail. This is a fixed constant, not derived from the data.
- **Replay ordering**: events are sorted by `ts` (timestamp) per player to reconstruct a path; no de-duplication or interpolation is applied if timestamps are sparse or irregular.

## Tradeoffs

| Decision | Options considered | Chosen | Why |
|---|---|---|---|
| Backend framework | Flask, Django, FastAPI | FastAPI | No need for templating/auth; async + auto docs help iteration speed |
| Heatmap aggregation | Send raw points to frontend, or pre-bucket server-side | Server-side 20px grid bucketing | Caps payload size; matches don't need pixel-perfect heatmap detail |
| Map storage | Database (Postgres/SQLite) vs. reading parquet files directly per request | Direct parquet reads | No infra to manage; dataset size for this scope doesn't need indexing/querying beyond what Pandas filters handle |
| Coordinate transform | Per-map hardcoded affine constants vs. a generic homography/calibration tool | Hardcoded per-map `scale`/`origin` | Only 3 maps; manual tuning was faster than building a calibration UI for this scope |
| Off-map point filtering | Polygon/mask boundary per map vs. pixel-color heuristic | Pixel-color heuristic on the minimap image itself | Reuses the existing minimap asset as an implicit mask; avoids authoring separate boundary geometry |
| Heatmap rendering | Canvas vs. WebGL vs. many DOM/SVG elements | Canvas with offscreen-canvas caching per layer | Canvas handles thousands of points cheaply; WebGL was unnecessary overhead for this point volume |
| Replay/path rendering | Canvas vs. SVG | SVG polylines | Small number of long paths; SVG is simpler to animate via point slicing than re-drawing a canvas path every frame |
