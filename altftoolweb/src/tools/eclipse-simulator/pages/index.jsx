"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sun, RotateCcw, Play, Pause, Sliders, Info, Eye } from "lucide-react";

export default function EclipseSimulator() {
  const [eclipseType, setEclipseType] = useState("solar"); // 'solar' | 'lunar'
  const [alignmentOffset, setAlignmentOffset] = useState(0); // -50 to +50 mm
  const [moonDist, setMoonDist] = useState(120); // mm (Perigee vs Apogee)
  const [isPlaying, setIsPlaying] = useState(false);

  const canvasRef = useRef(null);
  const animRef = useRef(null);

  const handleReset = () => {
    setEclipseType("solar");
    setAlignmentOffset(0);
    setMoonDist(120);
    setIsPlaying(false);
  };

  // Determine Eclipse State
  const absOffset = Math.abs(alignmentOffset);
  let eclipseState = "None";
  if (absOffset < 5) {
    if (eclipseType === "solar") {
      eclipseState = moonDist < 135 ? "Total Solar Eclipse" : "Annular Solar Eclipse";
    } else {
      eclipseState = "Total Lunar Eclipse";
    }
  } else if (absOffset < 25) {
    eclipseState = eclipseType === "solar" ? "Partial Solar Eclipse" : "Partial Lunar Eclipse";
  } else if (absOffset < 45 && eclipseType === "lunar") {
    eclipseState = "Penumbral Lunar Eclipse";
  }

  // Animation Loop for moving Moon through alignment
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setAlignmentOffset((off) => {
        let next = off + 1;
        if (next > 45) next = -45;
        return next;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Render Ray Optics on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    // Sun on Left
    const sunX = 70;
    const sunR = 45;

    ctx.fillStyle = "#FDE047";
    ctx.shadowColor = "#F59E0B";
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(sunX, cy, sunR, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("Sun", sunX - 10, cy + 4);

    // Positions of Earth & Moon based on Solar vs Lunar Eclipse
    let earthX, earthY, moonX, moonY;
    const baseDistance = 320;

    if (eclipseType === "solar") {
      // Sun -> Moon -> Earth
      moonX = sunX + moonDist * 1.5;
      moonY = cy + alignmentOffset;
      earthX = sunX + baseDistance;
      earthY = cy;
    } else {
      // Sun -> Earth -> Moon
      earthX = sunX + 200;
      earthY = cy;
      moonX = earthX + moonDist;
      moonY = cy + alignmentOffset;
    }

    const moonR = 10;
    const earthR = 25;

    // Draw Penumbra Cone (Outer light shadow)
    const occludingX = eclipseType === "solar" ? moonX : earthX;
    const occludingY = eclipseType === "solar" ? moonY : earthY;
    const occludingR = eclipseType === "solar" ? moonR : earthR;

    ctx.fillStyle = "rgba(100, 116, 139, 0.15)";
    ctx.beginPath();
    ctx.moveTo(sunX, cy - sunR);
    ctx.lineTo(w, occludingY + (occludingR + 30));
    ctx.lineTo(w, occludingY - (occludingR + 30));
    ctx.lineTo(sunX, cy + sunR);
    ctx.closePath();
    ctx.fill();

    // Draw Umbra Cone (Inner dark shadow)
    ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
    ctx.beginPath();
    ctx.moveTo(sunX, cy - sunR);
    ctx.lineTo(occludingX + 180, occludingY);
    ctx.lineTo(sunX, cy + sunR);
    ctx.closePath();
    ctx.fill();

    // Draw Earth
    ctx.fillStyle = "#3B82F6";
    ctx.beginPath();
    ctx.arc(earthX, earthY, earthR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Earth", earthX - 14, earthY + 4);

    // Draw Moon
    ctx.fillStyle = "#CBD5E1";
    ctx.strokeStyle = "#14B8A6";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Moon", moonX - 14, moonY - 14);

    // Legend
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillText("■ Umbra (Full Shadow)", 20, h - 35);
    ctx.fillStyle = "rgba(100, 116, 139, 0.7)";
    ctx.fillText("■ Penumbra (Partial Shadow)", 20, h - 18);

  }, [eclipseType, alignmentOffset, moonDist]);

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
              <span className="text-xs text-muted-foreground">Celestial Optics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
              Solar & Lunar Eclipse Simulator
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Simulate umbra and penumbra shadow cone geometry, alignment precision, and celestial eclipses.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-primary text-white hover:bg-primary/90 transition shadow-md"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? "Pause Transit" : "Animate Transit"}
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
                <Sliders className="w-4 h-4" /> Eclipse Configuration
              </h2>

              {/* Eclipse Type Toggle */}
              <div>
                <label className="text-xs font-semibold mb-1.5 block">Eclipse Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setEclipseType("solar"); setAlignmentOffset(0); }}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border text-center transition ${
                      eclipseType === "solar" ? "bg-primary text-white border-primary" : "border-border hover:bg-surface-soft"
                    }`}
                  >
                    Solar Eclipse
                  </button>
                  <button
                    onClick={() => { setEclipseType("lunar"); setAlignmentOffset(0); }}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border text-center transition ${
                      eclipseType === "lunar" ? "bg-primary text-white border-primary" : "border-border hover:bg-surface-soft"
                    }`}
                  >
                    Lunar Eclipse
                  </button>
                </div>
              </div>

              {/* Alignment Offset Slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Orbital Alignment Shift</span>
                  <span className="text-primary font-mono">{alignmentOffset} mm</span>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  value={alignmentOffset}
                  onChange={(e) => setAlignmentOffset(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Moon Distance (Perigee vs Apogee) */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Earth-Moon Distance</span>
                  <span className="text-primary font-mono">{moonDist < 135 ? "Perigee (Near)" : "Apogee (Far)"}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="160"
                  value={moonDist}
                  onChange={(e) => setMoonDist(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>

            {/* Current State Telemetry Card */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-base font-bold text-foreground">{eclipseState}</h2>
                <span className={`text-xs font-bold ${absOffset < 5 ? "text-emerald-500" : "text-amber-500"}`}>
                  {absOffset < 5 ? "Exact Alignment" : "Partial Shift"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Umbra Coverage</div>
                  <div className="text-sm font-bold font-mono text-foreground mt-0.5">
                    {absOffset < 5 ? "100%" : absOffset < 25 ? `${Math.round(100 - absOffset * 3.5)}%` : "0%"}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Shadow Zone</div>
                  <div className="text-sm font-bold text-foreground mt-0.5">
                    {absOffset < 5 ? "Umbra Cone" : absOffset < 25 ? "Penumbra Cone" : "Outside Shadow"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ray Optics Canvas (8 cols) */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            <div className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-sm flex-1 min-h-[420px]">
              <canvas ref={canvasRef} className="w-full h-full block" />
            </div>

            {/* Educational Notes */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-2 shadow-sm">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" /> Educational Principles: Shadow Cones
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The Umbra is the dark central region of shadow where the light source is completely blocked. The Penumbra is the outer fringe where only part of the light source is obstructed. Solar eclipses occur at New Moon, whereas Lunar eclipses occur at Full Moon.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
