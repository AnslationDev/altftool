
"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { openFullscreen } from "../../lib/fullscreen";
import { primaryButton } from "../../components/uiClasses";
import { CanvasTool, Range } from "./CanvasShell";

export function MatrixRain() {
  const canvasRef = useRef(null);
  const [speed, setSpeed] = useState(42);
  const [density, setDensity] = useState(18);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let frame = 0;
    let columns = [];
    let width = 0;
    let height = 0;
    const chars = "ｱｲｳｴｵｶｷｸｹｺ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const resize = () => {
      width = canvas.clientWidth * window.devicePixelRatio;
      height = canvas.clientHeight * window.devicePixelRatio;
      canvas.width = width;
      canvas.height = height;
      const count = Math.floor(width / density);
      columns = Array.from({ length: count }, () => Math.random() * height);
    };
    resize();
    window.addEventListener("resize", resize);
    const draw = () => {
      if (!paused) {
        ctx.fillStyle = "rgba(2, 6, 23, 0.14)";
        ctx.fillRect(0, 0, width, height);
        ctx.font = `${density * window.devicePixelRatio}px monospace`;
        columns.forEach((y, index) => {
          const text = chars[Math.floor(Math.random() * chars.length)];
          ctx.fillStyle = index % 7 === 0 ? "#eafff4" : "#22c55e";
          ctx.fillText(text, index * density * window.devicePixelRatio, y);
          columns[index] = y > height + Math.random() * 12000 ? 0 : y + speed * 0.42;
        });
      }
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [density, paused, speed]);
  return (
    <CanvasTool canvasRef={canvasRef} title="Matrix renderer" onFullscreen={() => openFullscreen(canvasRef)}>
      <Range label="Speed" value={speed} setValue={setSpeed} min={10} max={100} />
      <Range label="Density" value={density} setValue={setDensity} min={12} max={34} />
      <button onClick={() => setPaused((value) => !value)} className={primaryButton}>{paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}{paused ? "Resume" : "Pause"}</button>
    </CanvasTool>
  );
}
