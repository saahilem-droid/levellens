# Insights

*Context: the dataset analyzed consists of test/internal matches with only 2–3 human players per match and the remainder bot-controlled. Insights below are framed around what the tool surfaces and how a designer would use it — not as final competitive-balance conclusions, since bot behavior dominates the sample. They're most useful here as a demonstration of what the tool can reveal once run against real player data.*

---

## Insight 1: Movement and loot dominate the heatmaps; combat is rare

**What caught my eye:** Across all three maps (AmbroseValley, GrandRift, Lockdown), the Movement and Loot layers are consistently dense and broad, while the Deaths and Kills layers are sparse — small, scattered clusters rather than clear hotspots.

**Evidence:** This holds consistently across every map in the dataset, not just one. Movement events vastly outnumber Kill/Death events in raw count (every tick of player/bot movement logs a `Position`/`BotPosition` event, while a kill only logs once per death), but even accounting for that, the *spatial spread* of combat is much narrower and more diffuse than movement/loot — suggesting players (and bots) traverse and loot large portions of the map without converging into consistent fight zones.

**Actionable:** This is the expected shape of a low-contention test dataset, but it's exactly the signal a designer would track once real player data comes in. If combat density stays this sparse relative to movement/loot in real matches too, it likely means encounter rate is too low for the map size — loot is spread thin enough that players rarely cross paths. Concrete levers: shrink the playable zone faster (storm timing), or concentrate higher-value loot into a smaller number of areas to force route overlap. The metric to watch is **kills-per-minute relative to map area covered by movement**, which this tool can already compute (heatmap area vs. kill heatmap density).

**Why a level designer should care:** Movement/loot heatmaps without matching combat density are a classic sign of a map that's "too big" or "too spread out" for its player count — players are exploring but not fighting. This is a fast, visual way to flag that before relying on slower aggregate stats like average match length.

---

## Insight 2: Most movement is bot-driven, not human

**What caught my eye:** Filtering movement by type, the overwhelming majority of position data in this dataset comes from bot-controlled characters (`BotPosition`) rather than human players (`Position`).

**Evidence:** This is consistent with the dataset's composition (2–3 humans per match, rest bots), so it's not surprising on its own — but it's an important caveat the tool makes immediately visible just by toggling the "type" filter, rather than requiring a separate query.

**Actionable:** Before drawing any conclusions about player behavior, movement, loot routes, or "popular paths" from this data, a designer needs to filter to **human-only** movement (the tool already supports this via the `type=human` query param on `/positions`). Bot pathing likely reflects simplistic AI navigation (e.g. nearest-loot or patrol logic) rather than genuine player decision-making, and mixing the two would produce misleading heatmaps — e.g. a "hot path" that's actually just bot patrol routes, not a real human desire path.

**Why a level designer should care:** Conflating bot and human behavior risks designing around AI navigation quirks instead of real player psychology (sightlines, cover-seeking, loot greed, rotation timing). Any insight drawn from this tool — or any similar telemetry tool — should be sanity-checked against the human/bot split first.

---

## Insight 3: Movement consistently originates from map edges/corners, never the center

**What caught my eye:** Across matches, player and bot paths reliably begin near a map's outer edges or corners — never starting from the center of the playable area. The specific corner varies match to match, but the "edge-only" pattern is consistent.

**Evidence:** This pattern held across AmbroseValley, GrandRift, and Lockdown, and across different matches within each map — the *exact* spawn point differs per match, but it's always at a periphery position, never interior.

**Actionable:** This strongly suggests spawn points are deliberately placed at map edges (a common design pattern to give players an initial buffer before contact). If a designer wants to *verify* even spacing of spawns (e.g. no two spawns clustered on the same side, biasing early-game loot access), this tool's movement heatmap at the very start of the replay timeline (low `timelineIndex` values) is a direct way to audit spawn distribution — currently this requires manually scrubbing the replay slider to the start rather than having a dedicated "spawn point" view, which would be a natural feature add. The metric to track: **spawn-to-first-loot distance** and **spawn-to-first-contact time**, both of which should be roughly even across spawn points if spawn placement is fair.

**Why a level designer should care:** Spawn fairness is foundational to perceived map balance — if some spawns are systematically closer to good loot or have shorter rotation paths to contested areas, players will notice and the map will feel "rigged" even if the rest of the geometry is balanced. This tool gives a fast visual way to confirm spawns sit at comparable distances from key resources, without needing to manually log spawn coordinates per match.
