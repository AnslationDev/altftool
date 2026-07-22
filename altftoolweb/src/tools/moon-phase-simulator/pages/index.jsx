"use client";

import React, { useState, useEffect, useRef } from "react";
import { Moon, RotateCcw, Play, Pause, Sliders, Info, Sun } from "lucide-react";

const PHASES = [
  { name: "New Moon", dayMin: 0, dayMax: 1.8, illum: 0 },
  { name: "Waxing Crescent", dayMin: 1.8, dayMax: 5.5, illum: 25 },
  { name: "First Quarter", dayMin: 5.5, dayMax: 9.2, illum: 50 },
  { name: "Waxing Gibbous", dayMin: 9.2, dayMax: 12.9, illum: 75 },
  { name: "Full Moon", dayMin: 12.9, dayMax: 16.6, illum: 100 },
  { name: "Waning Gibbous", dayMin: 16.6, dayMax: 20.3, illum: 75 },
  { name: "Third Quarter", dayMin: 20.3, dayMax: 24.0, illum: 50 },
  { name: "Waning Crescent", dayMin: 24.0, dayMax: 29.53, illum: 25 },
];

export default function MoonPhaseSimulator() {
  const [day, setDay] = useState(14.8); // Default Full Moon
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const canvasSpaceRef = useRef(null);
  const canvasEarthViewRef = useRef(null);
  const animRef = useRef(null);

  const synodicMonth = 29.53;

  const handleReset = () => {
    setDay(14.8);
    setIsPlaying(false);
    setSpeed(1);
  };

  // Calculated Phase & Illumination
  const normDay = ((day % synodicMonth) + synodicMonth) % synodicMonth;
  const phaseAngle = (normDay / synodicMonth) * Math.PI * 2; // 0 at New Moon (Sun-Moon-Earth alignment)

  // Illumination %: 0% at angle 0, 100% at angle PI, 0% at 2PI
  const illuminationPct = Math.round((1 - Math.cos(phaseAngle)) * 50);

  let currentPhaseName = "New Moon";
  if (normDay >= 0 && normDay < 1.8) currentPhaseName = "New Moon";
  else if (normDay >= 1.8 && normDay < 5.5) currentPhaseName = "Waxing Crescent";
  else if (normDay >= 5.5 && normDay < 9.2) currentPhaseName = "First Quarter";
  else if (normDay >= 9.2 && normDay < 12.9) currentPhaseName = "Waxing Gibbous";
  else if (normDay >= 12.9 && normDay < 16.6) currentPhaseName = "Full Moon";
  else if (normDay >= 16.6 && normDay < 20.3) currentPhaseName = "Waning Gibbous";
  else if (normDay >= 20.3 && normDay < 24.0) currentPhaseName = "Third Quarter";
  else currentPhaseName = "Waning Crescent";

  // Animation ticker
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setDay((d) => (d + 0.1 * speed) % synodicMonth);
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  // Space View Canvas (Top Down Orbit)
  useEffect(() => {
    const canvas = canvasSpaceRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2;
    const rOrbit = Math.min(w, h) * 0.35;

    ctx.clearRect(0, 0, w, h);

    // Sun Rays from Right side
    ctx.strokeStyle = "rgba(253, 224, 71, 0.25)";
    ctx.lineWidth = 2;
    for (let y = 30; y < h; y += 25) {
      ctx.beginPath();
      ctx.moveTo(w, y);
      ctx.lineTo(w - 60, y);
      ctx.stroke();
    }
    ctx.fillStyle = "#FDE047";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("Sunlight Rays ➔", w - 100, 20);

    // Orbit Ring
    ctx.strokeStyle = "rgba(20, 184, 166, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, rOrbit, 0, Math.PI * 2);
    ctx.stroke();

    // Earth at Center
    ctx.fillStyle = "#3B82F6"; // Day side
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1E293B"; // Night side (left half)
    ctx.beginPath();
    ctx.arc(cx, cy, 18, Math.PI / 2, (Math.PI * 3) / 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "10px sans-serif";
    ctx.fillText("Earth", cx - 12, cy + 32);

    // Moon Position (Angle 0 is Right, towards Sun)
    const mx = cx + rOrbit * Math.cos(phaseAngle);
    const my = cy + rOrbit * Math.sin(phaseAngle);

    // Draw Moon Body (Lit right half, Dark left half)
    ctx.save();
    ctx.translate(mx, my);

    // Lit half (facing right towards Sun)
    ctx.fillStyle = "#F8FAFC";
    ctx.beginPath();
    ctx.arc(0, 0, 10, -Math.PI / 2, Math.PI / 2);
    ctx.fill();

    // Dark half (facing left away from Sun)
    ctx.fillStyle = "#334155";
    ctx.beginPath();
    ctx.arc(0, 0, 10, Math.PI / 2, (Math.PI * 3) / 2);
    ctx.fill();

    ctx.strokeStyle = "#14B8A6";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-12, -12, 24, 24);

    ctx.restore();

  }, [phaseAngle]);

  // As Seen From Earth View Canvas
  useEffect(() => {
    const canvas = canvasEarthViewRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2;
    const rMoon = Math.min(w, h) * 0.35;

    ctx.clearRect(0, 0, w, h);

    // Base dark circle
    ctx.fillStyle = "#1E293B";
    ctx.beginPath();
    ctx.arc(cx, cy, rMoon, 0, Math.PI * 2);
    ctx.fill();

    // Lit Crescent / Gibbous Shape using Arc & Ellipse
    ctx.fillStyle = "#F8FAFC";
    const cosAngle = Math.cos(phaseAngle);

    if (phaseAngle <= Math.PI) {
      // Waxing (Lit on Right side)
      ctx.beginPath();
      ctx.arc(cx, cy, rMoon, -Math.PI / 2, Math.PI / 2);
      ctx.ellipse(cx, cy, rMoon, Math.abs(cosAngle) * rMoon, 0, Math.PI / 2, -Math.PI / 2, cosAngle < 0);
      ctx.fill();
    } else {
      // Waning (Lit on Left side)
      ctx.beginPath();
      ctx.arc(cx, cy, rMoon, Math.PI / 2, (Math.PI * 3) / 2);
      ctx.ellipse(cx, cy, rMoon, Math.abs(cosAngle) * rMoon, 0, (Math.PI * 3) / 2, Math.PI / 2, cosAngle > 0);
      ctx.fill();
    }

    // Outer glow
    ctx.strokeStyle = "#14B8A6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, rMoon, 0, Math.PI * 2);
    ctx.stroke();

  }, [phaseAngle]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Hero Section */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                Science / Astronomy
              </span>
              <span className="text-xs text-muted-foreground">Lunar Motion</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
              Moon Phase Simulator
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Simulate the 29.5-day synodic lunar cycle with dual orbital space geometry and Earth-view phase visualization.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-primary text-white hover:bg-primary/90 transition shadow-md"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? "Pause Cycle" : "Auto Play"}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold border border-border bg-card hover:bg-surface-soft transition"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Controls Panel (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Sliders className="w-4 h-4" /> Lunar Cycle Controls
              </h2>

              {/* Day Slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Synodic Month Day</span>
                  <span className="text-primary font-mono">{normDay.toFixed(1)} / 29.5 Days</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="29.53"
                  step="0.1"
                  value={normDay}
                  onChange={(e) => setDay(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Fast Jump Presets */}
              <div>
                <label className="text-xs font-semibold mb-1.5 block">Phase Fast Jump</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button onClick={() => setDay(0)} className="px-2.5 py-1.5 rounded border border-border hover:bg-surface-soft">New Moon (0d)</button>
                  <button onClick={() => setDay(7.4)} className="px-2.5 py-1.5 rounded border border-border hover:bg-surface-soft">1st Quarter (7.4d)</button>
                  <button onClick={() => setDay(14.8)} className="px-2.5 py-1.5 rounded border border-border hover:bg-surface-soft">Full Moon (14.8d)</button>
                  <button onClick={() => setDay(22.1)} className="px-2.5 py-1.5 rounded border border-border hover:bg-surface-soft">3rd Quarter (22.1d)</button>
                </div>
              </div>
            </div>

            {/* Current Phase Telemetry Card */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-lg font-bold text-foreground">{currentPhaseName}</h2>
                <span className="text-xs font-bold font-mono text-primary">{illuminationPct}% Lit</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Moon Age</div>
                  <div className="text-sm font-bold font-mono text-foreground mt-0.5">
                    {normDay.toFixed(1)} Days
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Phase Angle</div>
                  <div className="text-sm font-bold font-mono text-foreground mt-0.5">
                    {Math.round((phaseAngle * 180) / Math.PI)}°
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dual Canvases (8 cols) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Top-Down Space Orbit Geometry */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-col items-center min-h-[360px]">
              <div className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Space Orbit View (Top-Down)</div>
              <div className="relative w-full flex-1">
                <canvas ref={canvasSpaceRef} className="w-full h-full block" />
              </div>
            </div>

            {/* View From Earth */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-col items-center min-h-[360px]">
              <div className="text-xs font-bold uppercase tracking-wider text-primary mb-2">As Seen From Earth</div>
              <div className="relative w-full flex-1">
                <canvas ref={canvasEarthViewRef} className="w-full h-full block" />
              </div>
            </div>

            {/* Educational Explanation Box */}
            <div className="sm:col-span-2 rounded-xl border border-border bg-card p-5 space-y-2 shadow-sm">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" /> Educational Principles: Why Moon Phases Occur
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Moon phases are caused by changing geometric alignments between Sun, Earth, and Moon. Half of the Moon is always illuminated by the Sun, but our view of that illuminated hemisphere changes as the Moon orbits Earth every 29.53 days.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
