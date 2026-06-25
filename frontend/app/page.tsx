"use client";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import HeatmapCanvas from "../components/HeatMapCanvas";
import PathsCanvas from "../components/Pathscanvas";

const HUD_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  html, body { height: 100%; overflow: hidden; }

  .hud-root {
    display: flex;
    height: 100vh;
    width: 100vw;
    background: #060a0f;
    font-family: 'Rajdhani', sans-serif;
    overflow: hidden;
  }

  .hud-sidebar {
    width: 360px;
    min-width: 360px;
    height: 100vh;
    background: #0a0e15;
    border-right: 1px solid #1a2a3a;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    flex-shrink: 0;
  }

  .hud-sidebar::-webkit-scrollbar { width: 4px; }
  .hud-sidebar::-webkit-scrollbar-track { background: #0a0e15; }
  .hud-sidebar::-webkit-scrollbar-thumb { background: #1a2a3a; border-radius: 2px; }

  .sidebar-header {
    padding: 16px;
    border-bottom: 1px solid #1a2a3a;
    background: #080c12;
    flex-shrink: 0;
  }

  .logo {
    font-family: 'Share Tech Mono', monospace;
    font-size: 18px;
    color: #58a6ff;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .logo-sub {
    font-size: 10px;
    color: #2a4a6a;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-top: 2px;
    font-family: 'Share Tech Mono', monospace;
  }

  .hud-section {
    padding: 12px 14px;
    border-bottom: 1px solid #111e2a;
    flex-shrink: 0;
  }

  .hud-section-label {
    font-size: 9px;
    letter-spacing: 0.2em;
    color: #2a4a6a;
    text-transform: uppercase;
    margin-bottom: 8px;
    font-family: 'Share Tech Mono', monospace;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .hud-section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #111e2a;
  }

  .hud-select {
    width: 100%;
    background: #0d1520;
    border: 1px solid #1a2a3a;
    border-radius: 3px;
    color: #7aa8cc;
    font-size: 12px;
    font-family: 'Share Tech Mono', monospace;
    padding: 6px 8px;
    margin-bottom: 6px;
    appearance: none;
    cursor: pointer;
    outline: none;
  }

  .hud-select:focus { border-color: #58a6ff; }
  .hud-select option { background: #0d1520; color: #7aa8cc; }

  .stat-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    margin-bottom: 4px;
  }

  .stat-box {
    background: #0d1520;
    border: 1px solid #1a2a3a;
    border-radius: 3px;
    padding: 8px;
    text-align: center;
  }

  .stat-val {
    font-size: 22px;
    color: #58a6ff;
    font-weight: 600;
    font-family: 'Share Tech Mono', monospace;
    line-height: 1;
  }

  .stat-lbl {
    font-size: 9px;
    color: #2a4a6a;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-top: 2px;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0;
    font-size: 11px;
    border-bottom: 1px solid #0d1520;
  }

  .info-row:last-child { border-bottom: none; }
  .info-label { color: #2a4a6a; font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 0.08em; }
  .info-val { color: #58a6ff; font-family: 'Share Tech Mono', monospace; font-size: 10px; }

  .layer-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 0;
    cursor: pointer;
  }

  .layer-left {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #4a6a8a;
    letter-spacing: 0.05em;
  }

  .layer-left.active { color: #7aa8cc; }

  .layer-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    border: 1px solid #1a2a3a;
  }

  .hud-toggle {
    width: 30px;
    height: 15px;
    background: #0d1520;
    border: 1px solid #1a2a3a;
    border-radius: 8px;
    position: relative;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
  }

  .hud-toggle.on {
    background: #0d2540;
    border-color: #58a6ff;
  }

  .hud-toggle::after {
    content: '';
    position: absolute;
    width: 11px;
    height: 11px;
    background: #1a2a3a;
    border-radius: 50%;
    top: 1px;
    left: 1px;
    transition: left 0.15s, background 0.15s;
  }

  .hud-toggle.on::after {
    left: 16px;
    background: #58a6ff;
  }

  .hud-range {
    width: 100%;
    appearance: none;
    height: 3px;
    background: #1a2a3a;
    border-radius: 2px;
    outline: none;
    cursor: pointer;
  }

  .hud-range::-webkit-slider-thumb {
    appearance: none;
    width: 12px;
    height: 12px;
    background: #58a6ff;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid #0a0e15;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 11px;
    color: #4a6a8a;
    padding: 3px 0;
    letter-spacing: 0.04em;
  }

  .legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .legend-line {
    width: 16px;
    height: 2px;
    border-radius: 1px;
    flex-shrink: 0;
  }

  .hud-map-area {
    flex: 1;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #060a0f;
  }

  .map-topbar {
    height: 38px;
    min-height: 38px;
    background: #080c12;
    border-bottom: 1px solid #1a2a3a;
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 20px;
    flex-shrink: 0;
    z-index: 200;
  }

  .topbar-crumb {
    font-family: 'Share Tech Mono', monospace;
    font-size: 10px;
    color: #2a4a6a;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .topbar-crumb span { color: #58a6ff; }

  .map-and-legend {
    flex: 1;
    display: flex;
    flex-direction: row;
    overflow: hidden;
  }

  .map-scroll-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .map-container {
    position: relative;
    width: 100%;
    flex: 1;
    overflow: auto;
    background: #060a0f;
    scrollbar-width: none;
  }

  .map-container::-webkit-scrollbar { width: 0px; height: 0px; }

  .corner { position: absolute; width: 16px; height: 16px; z-index: 100; }
  .corner-tl { top: 10px; left: 10px; border-top: 1px solid #58a6ff; border-left: 1px solid #58a6ff; opacity: 0.6; }
  .corner-tr { top: 10px; right: 10px; border-top: 1px solid #58a6ff; border-right: 1px solid #58a6ff; opacity: 0.6; }
  .corner-bl { bottom: 10px; left: 10px; border-bottom: 1px solid #58a6ff; border-left: 1px solid #58a6ff; opacity: 0.6; }
  .corner-br { bottom: 10px; right: 10px; border-bottom: 1px solid #58a6ff; border-right: 1px solid #58a6ff; opacity: 0.6; }

  .map-bottom-bar {
    height: 44px;
    min-height: 44px;
    background: #080c12;
    border-top: 1px solid #1a2a3a;
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 12px;
    flex-shrink: 0;
  }

  .tl-label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 9px;
    color: #2a4a6a;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .tl-time {
    font-family: 'Share Tech Mono', monospace;
    font-size: 11px;
    color: #58a6ff;
    white-space: nowrap;
    min-width: 60px;
    text-align: right;
  }

  .map-scroll-controls {
    width: 24px;
    min-width: 24px;
    background: #0a0e15;
    border-left: 1px solid #1a2a3a;
    border-right: 1px solid #1a2a3a;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    flex-shrink: 0;
  }

  .scroll-btn {
    width: 20px;
    height: 20px;
    background: #0d1520;
    border: 1px solid #1a2a3a;
    border-radius: 3px;
    color: #2a4a6a;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-family: 'Share Tech Mono', monospace;
    user-select: none;
    transition: border-color 0.15s, color 0.15s;
  }

  .scroll-btn:hover { border-color: #58a6ff; color: #58a6ff; }

  .scroll-track {
    flex: 1;
    width: 2px;
    background: #111e2a;
    border-radius: 1px;
    margin: 8px 0;
    position: relative;
  }

  .scroll-thumb {
    width: 2px;
    background: #58a6ff;
    border-radius: 1px;
    position: absolute;
    top: 0;
    transition: top 0.1s;
  }

  .right-legend {
    width: 320px;
    min-width: 320px;
    height: 100%;
    background: #0a0e15;
    border-left: 1px solid #1a2a3a;
    display: flex;
    flex-direction: column;
    padding: 16px 14px;
    overflow-y: auto;
    flex-shrink: 0;
  }

  .right-legend::-webkit-scrollbar { width: 4px; }
  .right-legend::-webkit-scrollbar-track { background: #0a0e15; }
  .right-legend::-webkit-scrollbar-thumb { background: #1a2a3a; border-radius: 2px; }

  .loading-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background: #060a0f;
    font-family: 'Share Tech Mono', monospace;
    color: #58a6ff;
    font-size: 14px;
    letter-spacing: 0.2em;
  }

  /* ── Replay controls ── */
  .replay-controls {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 8px;
  }

  .replay-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 150px;
    height: 28px;
    background: #0d1520;
    border: 1px solid #1a2a3a;
    border-radius: 3px;
    cursor: pointer;
    color: #4a6a8a;
    font-size: 11px;
    font-family: 'Share Tech Mono', monospace;
    user-select: none;
    transition: border-color 0.15s, color 0.15s, background 0.15s;
    flex-shrink: 0;
  }

  .replay-btn:hover {
    border-color: #58a6ff;
    color: #58a6ff;
  }

  .replay-btn.active {
    background: #0d2540;
    border-color: #58a6ff;
    color: #58a6ff;
  }

  .replay-speed {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .speed-btn {
    font-family: 'Share Tech Mono', monospace;
    font-size: 9px;
    color: #2a4a6a;
    cursor: pointer;
    padding: 2px 5px;
    border: 1px solid #111e2a;
    border-radius: 2px;
    background: transparent;
    letter-spacing: 0.05em;
    transition: border-color 0.15s, color 0.15s;
  }

  .speed-btn:hover, .speed-btn.active {
    border-color: #58a6ff;
    color: #58a6ff;
  }
`;

export default function Home() {
  const [map, setMap] = useState("");
  const [movementPoints, setMovementPoints] = useState<any[]>([]);
  const [lootPoints, setLootPoints] = useState<any[]>([]);
  const [deathPoints, setDeathPoints] = useState<any[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [maps, setMaps] = useState<any>({});
  const [selectedMap, setSelectedMap] = useState("");
  const [selectedMatch, setSelectedMatch] = useState("all");
  const [showMovement, setShowMovement] = useState(true);
  const [showLoot, setShowLoot] = useState(false);
  const [showDeaths, setShowDeaths] = useState(false);
  const [paths, setPaths] = useState<any[]>([]);
  const [showPaths, setShowPaths] = useState(false);
  const [stormPoints, setStormPoints] = useState<any[]>([]);
  const [showStormDeaths, setShowStormDeaths] = useState(false);
  const [replayData, setReplayData] = useState<any[]>([]);
  const [timelineIndex, setTimelineIndex] = useState(0);
  const [killPoints, setKillPoints] = useState<any[]>([]);
  const [showKills, setShowKills] = useState(false);
  const [botKillPoints, setBotKillPoints] = useState<any[]>([]);
  const [showBotKills, setShowBotKills] = useState(false);
  const [playerCount, setPlayerCount] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState("all");
  const [players, setPlayers] = useState<string[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  // ── Replay playback state ──
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const animFrameRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);
  // Stores parsed timestamps per frame for real-time playback

  const imageMap: Record<string, string> = {
    AmbroseValley: "/maps/AmbroseValley_Minimap.png",
    GrandRift: "/maps/GrandRift_Minimap.png",
    Lockdown: "/maps/Lockdown_Minimap.jpg",
  };

  // ── 1. Fetch dates once on mount
  useEffect(() => {
    axios.get(`${API}`).then((response) => {
      setDates(response.data.dates);
      if (response.data.dates.length > 0) setSelectedDate(response.data.dates[0]);
    });
  }, []);

  // ── 2. Fetch map/match filters when date changes
  useEffect(() => {
    if (!selectedDate) return;
    axios.get(`${API}/${selectedDate}`).then((response) => {
      setMaps(response.data);
      const mapNames = Object.keys(response.data);
      if (mapNames.length > 0) setSelectedMap(mapNames[0]);
    });
  }, [selectedDate]);

  // ── 3. Reset match when map changes
  useEffect(() => { setSelectedMatch("all"); }, [selectedMap]);

  // ── 4. Fetch ALL data when date/map/match changes
  useEffect(() => {
    if (!selectedDate || !selectedMap) return;
    setMap(selectedMap);

    // Stop any active playback when filters change
    isPlayingRef.current = false;
    setIsPlaying(false);
    setTimelineIndex(0);

     axios.get(`${API}/playercount/${selectedDate}/${selectedMap}/${selectedMatch}`)
    .then((r) => setPlayerCount(r.data.count));

  axios.get(`${API}/movement/${selectedDate}/${selectedMap}/${selectedMatch}`)
    .then((r) => setMovementPoints(r.data));

  axios.get(`${API}/loot/${selectedDate}/${selectedMap}/${selectedMatch}`)
    .then((r) => setLootPoints(r.data));

  axios.get(`${API}/deaths/${selectedDate}/${selectedMap}/${selectedMatch}`)
    .then((r) => setDeathPoints(r.data));

  axios.get(`${API}/kills/${selectedDate}/${selectedMap}/${selectedMatch}`)
    .then((r) => setKillPoints(r.data));

  axios.get(`${API}/botkills/${selectedDate}/${selectedMap}/${selectedMatch}`)
    .then((r) => setBotKillPoints(r.data));

  axios.get(`${API}/storm/${selectedDate}/${selectedMap}/${selectedMatch}`)
    .then((r) => setStormPoints(r.data));

  axios.get(`${API}/paths/${selectedDate}/${selectedMap}/${selectedMatch}`)
    .then((r) => setPaths(r.data));

  axios.get(`${API}/replay/${selectedDate}/${selectedMap}/${selectedMatch}`)
    .then((r) => setReplayData(r.data));

  if (selectedMatch && selectedMatch !== "all") {
    axios.get(`${API}/players/${selectedDate}/${selectedMap}/${selectedMatch}`)
        .then((r) => {
          setPlayers(r.data);
          if (r.data.length > 0 && selectedPlayer === "all") setSelectedPlayer(r.data[0]);
        });
    } else {
      setPlayers([]);
    }

  }, [selectedDate, selectedMap, selectedMatch]);

  const maxFrames = replayData.length > 0
    ? Math.max(...replayData.map((p) => p?.points?.length || 0))
    : 0;

  // Keep mutable refs so the rAF loop never needs to be recreated
  const isPlayingRef = useRef(false);
  const playbackSpeedRef = useRef(playbackSpeed);
  const maxFramesRef = useRef(maxFrames);

  // Sync inline on every render — no useEffect delay
  playbackSpeedRef.current = playbackSpeed;
  maxFramesRef.current = maxFrames;

  // Single stable rAF loop — advances 1 frame per ~50ms at 1x speed
  // FRAMES_PER_MS: at 1x, advance 1 frame every 50ms (20fps playback)
  useEffect(() => {
    const MS_PER_FRAME = 50; // at 1x: 1 frame per 50ms
    let accumulated = 0;

    const loop = (now: number) => {
      if (isPlayingRef.current) {
        if (lastTickRef.current === null) lastTickRef.current = now;
        const delta = now - lastTickRef.current;
        lastTickRef.current = now;
        accumulated += delta * playbackSpeedRef.current;

        if (accumulated >= MS_PER_FRAME) {
          const steps = Math.floor(accumulated / MS_PER_FRAME);
          accumulated -= steps * MS_PER_FRAME;

          setTimelineIndex((prev) => {
            const max = maxFramesRef.current;
            if (max === 0) return prev;
            const next = prev + steps;
            if (next >= max - 1) {
              isPlayingRef.current = false;
              setIsPlaying(false);
              return max - 1;
            }
            return next;
          });
        }
      } else {
        lastTickRef.current = null;
        accumulated = 0;
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);
    };
  }, []); // runs once, reads everything via refs

  const handlePlayPause = () => {
    if (timelineIndex >= maxFrames - 1) {
      // At the end — restart then play
      setTimelineIndex(0);
      isPlayingRef.current = true;
      setIsPlaying(true);
      return;
    }
    const next = !isPlayingRef.current;
    isPlayingRef.current = next;
    setIsPlaying(next);
  };

  const handleRestart = () => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    setTimelineIndex(0);
  };

  const currentPlayer = replayData.length > 0 ? replayData[0] : null;
  const currentFrame = currentPlayer?.points?.[Math.min(timelineIndex, maxFrames - 1)];

  if (!map) {
    return (
      <>
        <style>{HUD_STYLES}</style>
        <div className="loading-screen">INITIALIZING LEVELLENS...</div>
      </>
    );
  }

  const layers = [
    { key: "movement", label: "Movement",     color: "#378ADD", active: showMovement,    toggle: setShowMovement },
    { key: "loot",     label: "Loot",         color: "#1D9E75", active: showLoot,        toggle: setShowLoot },
    { key: "deaths",   label: "Deaths",       color: "#E24B4A", active: showDeaths,      toggle: setShowDeaths },
    { key: "kills",    label: "Kills",        color: "#EF9F27", active: showKills,       toggle: setShowKills },
    { key: "botkills", label: "Bot Kills",    color: "#D4537E", active: showBotKills,    toggle: setShowBotKills },
    { key: "storm",    label: "Storm Deaths", color: "#7F77DD", active: showStormDeaths, toggle: setShowStormDeaths },
    { key: "paths",    label: "Paths",        color: "#5DCAA5", active: showPaths,       toggle: setShowPaths },
  ];

  const divider = <div style={{ height: "1px", background: "#111e2a", margin: "10px 0" }} />;

  return (
    <>
      <style>{HUD_STYLES}</style>
      <div className="hud-root">

        {/* ── LEFT SIDEBAR ── */}
        <div className="hud-sidebar">
          <div className="sidebar-header">
            <div className="logo">Level<span style={{ color: "#2a6a9e" }}>Lens</span></div>
            <div className="logo-sub">Match Analytics System</div>
          </div>

          <div className="hud-section">
            <div className="hud-section-label">Session</div>
            <select className="hud-select" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
              {dates.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select className="hud-select" value={selectedMap} onChange={(e) => setSelectedMap(e.target.value)}>
              {Object.keys(maps).map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select className="hud-select" value={selectedMatch} onChange={(e) => setSelectedMatch(e.target.value)}>
              <option value="all">All Matches</option>
              {maps[selectedMap]?.map((match: any, i: number) => (
                <option key={`${match.match_id}-${i}`} value={match.match_id}>{match.match_id}</option>
              ))}
            </select>
          </div>

          <div className="hud-section">
            <div className="hud-section-label">Match Stats</div>
            <div className="stat-row">
              <div className="stat-box">
                <div className="stat-val">{playerCount}</div>
                <div className="stat-lbl">Players</div>
              </div>
              <div className="stat-box">
                <div className="stat-val">{maps[selectedMap]?.length || 0}</div>
                <div className="stat-lbl">Matches</div>
              </div>
            </div>
          </div>

          <div className="hud-section">
            <div className="hud-section-label">Layers</div>
            {layers.map((l) => (
              <div key={l.key} className="layer-row" onClick={() => l.toggle(!l.active)}>
                <div className={`layer-left ${l.active ? "active" : ""}`}>
                  <div className="layer-dot" style={{ background: l.active ? l.color : "transparent", borderColor: l.active ? l.color : "#1a2a3a" }} />
                  {l.label}
                </div>
                <div className={`hud-toggle ${l.active ? "on" : ""}`} />
              </div>
            ))}
          </div>

          <div className="hud-section" style={{ flex: 1 }}>
            <div className="hud-section-label">Replay</div>

            <select className="hud-select" value={selectedPlayer} onChange={(e) => setSelectedPlayer(e.target.value)}>
              <option value="all">All Players</option>
              {players.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>

            {/* ── Play / Pause / Restart controls ── */}
            <div className="replay-controls">
  {/* Row 1: Restart + Play */}
  
  <div style={{ display: "flex", gap: "6px" }}>
    <button className="replay-btn" onClick={handleRestart} title="Restart" aria-label="Restart replay">⟨⟨</button>
    <button
      className={`replay-btn${isPlaying ? " active" : ""}`}
      onClick={handlePlayPause}
      title={isPlaying ? "Pause" : "Play"}
      aria-label={isPlaying ? "Pause replay" : "Play replay"}
      style={{ width: 150, fontSize: 13 }}
    >
      {isPlaying ? "⏸" : "▶"}
    </button>
  </div>
  <div className="replay-speed" style={{ marginLeft: 0 }}>
    {([0.5, 1, 2, 4] as const).map((s) => (
      <button
        key={s}
        className={`speed-btn${playbackSpeed === s ? " active" : ""}`}
        onClick={() => setPlaybackSpeed(s)}
        title={`${s}× speed`}
        style={{ width: 65, fontSize: 10 }}
      >
        {s}×
      </button>
    ))}
  </div>

  {/* Row 2: Speed buttons */}
  
</div>

            {/* Timeline slider */}
            <input
              className="hud-range"
              type="range"
              min="0"
              max={maxFrames > 0 ? maxFrames - 1 : 0}
              value={timelineIndex}
              onChange={(e) => {
                setIsPlaying(false);
                setTimelineIndex(Number(e.target.value));
              }}
              style={{ margin: "8px 0" }}
            />

            <div className="info-row">
              <span className="info-label">Player</span>
              <span className="info-val">{currentPlayer?.player || "—"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Time</span>
              <span className="info-val">{currentFrame?.ts || "—"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Event</span>
              <span className="info-val">{currentFrame?.type || "—"}</span>
            </div>
          </div>
        </div>

        {/* ── MAP AREA ── */}
        <div className="hud-map-area">

          <div className="map-topbar">
            <div className="topbar-crumb">Map // <span>{selectedMap || "—"}</span></div>
            <div className="topbar-crumb">Match // <span>{selectedMatch === "all" ? "All" : selectedMatch}</span></div>
            <div className="topbar-crumb" style={{ marginLeft: "auto" }}>Date // <span>{selectedDate}</span></div>
          </div>

          <div className="map-and-legend">

            <div className="map-scroll-area">
              <div className="map-container" ref={mapRef}>
                <div className="corner corner-tl" />
                <div className="corner corner-tr" />
                <div className="corner corner-bl" />
                <div className="corner corner-br" />

                <img
                  src={imageMap[map]}
                  alt="map"
                  style={{ position: "absolute", top: 0, left: 0, width: "1024px", height: "1024px" }}
                />

                {/* Heatmap smoke layer */}
                <HeatmapCanvas
                  movementPoints={movementPoints}
                  lootPoints={lootPoints}
                  deathPoints={deathPoints}
                  killPoints={killPoints}
                  botKillPoints={botKillPoints}
                  stormPoints={stormPoints}
                  showMovement={showMovement}
                  showLoot={showLoot}
                  showDeaths={showDeaths}
                  showKills={showKills}
                  showBotKills={showBotKills}
                  showStormDeaths={showStormDeaths}
                />

                {/* Replay trails */}
                <svg width="1024" height="1024" style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", zIndex: 50 }}>
                  {replayData.map((player, index) => {
                    if (!player?.points) return null;
                    return (
                      <polyline
                        key={index}
                        points={player.points.slice(0, Math.min(timelineIndex + 1, player.points.length)).map((p: any) => `${p.x},${p.y}`).join(" ")}
                        fill="none"
                        stroke={player.is_bot ? "black" : "#00ffff"}
                        strokeWidth="2"
                      />
                    );
                  })}
                </svg>

                {/* Replay dots */}
                {replayData.length > 0 && timelineIndex > 0 && replayData.map((player, index) => {
                  if (!player?.points?.length) return null;
                  const current = player.points[Math.min(timelineIndex, player.points.length - 1)];
                  if (!current) return null;
                  return (
                    <div key={index} style={{
                      position: "absolute",
                      left: current.x - 5,
                      top: current.y - 5,
                      width: "10px",
                      height: "10px",
                      background: player.is_bot ? "#E24B4A" : "#ffffff",
                      borderRadius: "50%",
                      border: `2px solid ${player.is_bot ? "#ff6b6b" : "#58a6ff"}`,
                      zIndex: 9999
                    }} />
                  );
                })}

                {/* Paths - canvas-based for performance */}
                <PathsCanvas paths={paths} show={showPaths} />
              </div>

              {/* Timeline bar */}
              <div className="map-bottom-bar">
                <div className="tl-label">Timeline</div>
                <input
                  className="hud-range"
                  type="range"
                  min="0"
                  max={maxFrames > 0 ? maxFrames - 1 : 0}
                  value={timelineIndex}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setTimelineIndex(Number(e.target.value));
                  }}
                  style={{ flex: 1 }}
                />
                <div className="tl-time">{currentFrame?.ts || "00:00"}</div>
              </div>
            </div>

            {/* ── VERTICAL SCROLLER ── */}
            <div className="map-scroll-controls">
              <div className="scroll-btn" onClick={() => mapRef.current?.scrollBy({ top: -100, behavior: "smooth" })}>▲</div>
              <div className="scroll-track">
                <div className="scroll-thumb" style={{ height: "30px", top: `${(timelineIndex / (maxFrames || 1)) * 70}%` }} />
              </div>
              <div className="scroll-btn" onClick={() => mapRef.current?.scrollBy({ top: 100, behavior: "smooth" })}>▼</div>
            </div>

            {/* ── RIGHT LEGEND ── */}
            <div className="right-legend">
              <div className="hud-section-label" style={{ marginBottom: "10px" }}>Layers</div>
              {layers.filter(l => l.key !== "paths").map((l) => (
                <div key={l.key} className="legend-item">
                  <div className="legend-dot" style={{ background: l.active ? l.color : "#1a2a3a", opacity: l.active ? 1 : 0.3 }} />
                  <span style={{ color: l.active ? "#7aa8cc" : "#2a4a6a" }}>{l.label}</span>
                </div>
              ))}

              {divider}

              <div className="hud-section-label" style={{ marginBottom: "10px" }}>Paths</div>
              <div className="legend-item">
                <div className="legend-line" style={{ background: showPaths ? "lime" : "#1a2a3a", opacity: showPaths ? 1 : 0.3 }} />
                <span style={{ color: showPaths ? "#7aa8cc" : "#2a4a6a" }}>Human path</span>
              </div>
              <div className="legend-item">
                <div className="legend-line" style={{ background: showPaths ? "#E24B4A" : "#1a2a3a", opacity: showPaths ? 1 : 0.3 }} />
                <span style={{ color: showPaths ? "#7aa8cc" : "#2a4a6a" }}>Bot path</span>
              </div>

              {divider}

              <div className="hud-section-label" style={{ marginBottom: "10px" }}>Timeline</div>
              <div className="legend-item"><div className="legend-line" style={{ background: "#00ffff" }} />Human replay</div>
              <div className="legend-item"><div className="legend-line" style={{ background: "#555" }} />Bot replay</div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}