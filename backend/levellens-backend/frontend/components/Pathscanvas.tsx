"use client";
import { useEffect, useRef } from "react";

interface PathPoint {
  x: number;
  y: number;
}

interface Path {
  player: string;
  is_bot: boolean;
  points: PathPoint[];
}

interface PathsCanvasProps {
  paths: Path[];
  show: boolean;
}

export default function PathsCanvas({ paths, show }: PathsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, 1024, 1024);

      if (!show || !paths.length) return;

      for (const path of paths) {
        if (!path.points.length) continue;

        const color = path.is_bot ? "#E24B4A" : "lime";

        // Draw path line
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.8;
        ctx.moveTo(path.points[0].x, path.points[0].y);
        for (let i = 1; i < path.points.length; i++) {
          ctx.lineTo(path.points[i].x, path.points[i].y);
        }
        ctx.stroke();

        // Start dot (green)
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.fillStyle = "#1D9E75";
        ctx.arc(path.points[0].x, path.points[0].y, 5, 0, Math.PI * 2);
        ctx.fill();

        // End dot (red)
        const last = path.points[path.points.length - 1];
        ctx.beginPath();
        ctx.fillStyle = "#E24B4A";
        ctx.arc(last.x, last.y, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    });

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [paths, show]);

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
        zIndex: 60,
      }}
    />
  );
}