# LevelLens

A match analytics and visualization tool for game telemetry. LevelLens ingests raw match-event parquet logs (positions, loot, kills, deaths, storm damage) and renders them as interactive heatmaps, player paths, and a frame-by-frame replay overlaid on each map's minimap.

**Live app:** https://saahilem-droid-levellens.vercel.app/
**Repo:** https://github.com/saahilem-droid/levellens

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js (React, TypeScript) | Fast iteration, easy Vercel deploys, good fit for a single interactive dashboard page |
| Backend | FastAPI (Python) | Lightweight, async-friendly, auto-generates docs, plays well with Pandas for data wrangling |
| Data processing | Pandas | Parquet is a first-class format for Pandas; simplest way to filter/group match events |
| Rendering | HTML Canvas (heatmaps, paths) + SVG (replay trails) | Canvas handles large point sets efficiently with offscreen-canvas caching; SVG is simple for animated polylines |
| Backend hosting | Hugging Face Spaces | Free, simple Docker/Python hosting for the API |
| Frontend hosting | Vercel | Native Next.js support, zero-config deploys |

---

## Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Runs at `http://127.0.0.1:8000` by default.

Match data is expected under `backend/data/<date_name>/*.parquet`, where each parquet file is one match containing columns: `map_id`, `match_id`, `user_id`, `event`, `x`, `z`, `ts`.

Minimap images are expected at `backend/assets/maps/<MapName>_Minimap.png` (or `.jpg`), referenced relative to `main.py` so the app works the same locally and when deployed.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:3000` by default.

---

## Environment Variables

| Variable | Where | Example | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Frontend (Vercel project settings, or `.env.local` locally) | `https://muhammed242-levellens-backend.hf.space` | Base URL the frontend uses to call the backend API. Falls back to `http://127.0.0.1:8000` if unset, for local dev. |

No backend env vars are required for local/dev use; CORS is open (`allow_origins=["*"]`) for simplicity.

---

## How to Use

1. Pick a **session date** from the dropdown.
2. Pick a **map** (AmbroseValley, GrandRift, or Lockdown).
3. Optionally narrow to a **specific match**, or leave on "All Matches" to see aggregated data.
4. Toggle **layers** (Movement, Loot, Deaths, Kills, Bot Kills, Storm Deaths, Paths) on/off to inspect different event types.
5. Use the **Replay** panel to scrub or auto-play a frame-by-frame reconstruction of a match.
