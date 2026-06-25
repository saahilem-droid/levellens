"use client";
import { useEffect, useRef } from "react";

interface Point {
  x: number;
  y: number;
  visits: number;
}

interface HeatmapCanvasProps {
  movementPoints: Point[];
  lootPoints: Point[];
  deathPoints: Point[];
  killPoints: Point[];
  botKillPoints: Point[];
  stormPoints: Point[];
  showMovement: boolean;
  showLoot: boolean;
  showDeaths: boolean;
  showKills: boolean;
  showBotKills: boolean;
  showStormDeaths: boolean;
}

const LAYER_CONFIGS = {
  movement: { r: 55,  g: 138, b: 221 },
  loot:     { r: 29,  g: 158, b: 117 },
  death:    { r: 226, g: 75,  b: 74  },
  kill:     { r: 239, g: 159, b: 39  },
  botkill:  { r: 212, g: 83,  b: 126 },
  storm:    { r: 127, g: 119, b: 221 },
};

// Cache: keyed by layer name, stores { canvas, pointsHash }
// so we only redraw a layer if its data actually changed
const layerCache = new Map<string, { canvas: HTMLCanvasElement; hash: string }>();

function hashPoints(points: Point[]): string {
  if (!points.length) return "";
  // Fast hash: length + first/last x,y + total visits
  const first = points[0];
  const last = points[points.length - 1];
  const totalVisits = points.reduce((s, p) => s + p.visits, 0);
  return `${points.length}_${first.x}_${first.y}_${last.x}_${last.y}_${totalVisits}`;
}

function getLayerCanvas(
  key: string,
  points: Point[],
  color: { r: number; g: number; b: number }
): HTMLCanvasElement {
  const hash = hashPoints(points);
  const cached = layerCache.get(key);

  // Return cached canvas if data hasn't changed
  if (cached && cached.hash === hash) {
    return cached.canvas;
  }

  const offscreen = document.createElement("canvas");
  offscreen.width = 1024;
  offscreen.height = 1024;
  const octx = offscreen.getContext("2d")!;

  if (points.length > 0) {
    const maxVisits = Math.max(...points.map((p) => p.visits), 1);

    for (const point of points) {
      const intensity = Math.min(point.visits / maxVisits, 1);
      const radius = 28 + intensity * 38;
      const alpha = 0.18 + intensity * 0.55;

      const grad = octx.createRadialGradient(
        point.x, point.y, 0,
        point.x, point.y, radius
      );
      grad.addColorStop(0,   `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`);
      grad.addColorStop(0.4, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.6})`);
      grad.addColorStop(1,   `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

      octx.fillStyle = grad;
      octx.beginPath();
      octx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      octx.fill();
    }
  }

  layerCache.set(key, { canvas: offscreen, hash });
  return offscreen;
}

export default function HeatmapCanvas({
  movementPoints,
  lootPoints,
  deathPoints,
  killPoints,
  botKillPoints,
  stormPoints,
  showMovement,
  showLoot,
  showDeaths,
  showKills,
  showBotKills,
  showStormDeaths,
}: HeatmapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Cancel any pending draw before scheduling a new one
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, 1024, 1024);

      // Each layer: get cached offscreen canvas, blur-composite onto main canvas
      const layers: [boolean, Point[], keyof typeof LAYER_CONFIGS][] = [
        [showMovement,    movementPoints,  "movement"],
        [showLoot,        lootPoints,      "loot"],
        [showDeaths,      deathPoints,     "death"],
        [showKills,       killPoints,      "kill"],
        [showBotKills,    botKillPoints,   "botkill"],
        [showStormDeaths, stormPoints,     "storm"],
      ];

      for (const [visible, points, key] of layers) {
        if (!visible || !points.length) continue;
        const offscreen = getLayerCanvas(key, points, LAYER_CONFIGS[key]);
        ctx.filter = "blur(10px)";
        ctx.drawImage(offscreen, 0, 0);
        ctx.filter = "none";
      }
    });

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [
    movementPoints, lootPoints, deathPoints,
    killPoints, botKillPoints, stormPoints,
    showMovement, showLoot, showDeaths,
    showKills, showBotKills, showStormDeaths,
  ]);

  return (
    <canvas
      ref={canvasRef}
      width={1024}
      height={1024}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 40,
      }}
    />
  );
}