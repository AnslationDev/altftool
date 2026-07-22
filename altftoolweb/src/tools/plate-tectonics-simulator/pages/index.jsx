"use client";

import React, { useState, useEffect, useRef } from "react";
import { Layers, RotateCcw, Play, Pause, Sliders, Info, Activity } from "lucide-react";

const BOUNDARIES = [
  {
    id: "divergent",
    name: "Divergent (Spreading)",
    features: "Mid-Ocean Ridges, Rift Valleys, New Oceanic Crust",
    seismic: "Moderate (Shallow Earthquakes)",
    magma: "High (Decompression Melting)",
    desc: "Plates pull apart from each other. Upwelling mantle magma cools to form new oceanic lithosphere.",
  },
  {
    id: "convergent",
    name: "Convergent (Subduction)",
    features: "Deep Ocean Trenches, Volcanic Mountain Arcs",
    seismic: "Severe (Mega-thrust Earthquakes)",
    magma: "High (Flux Melting)",
    desc: "Dense oceanic plate sinks beneath lighter continental plate into the hot asthenosphere.",
  },
  {
    id: "transform",
    name: "Transform (Strike-Slip)",
    features: "Fault Lines, Offset Streams, Linear Ridges",
    seismic: "Extreme (Shallow Destructive Earthquakes)",
    magma: "None",
    desc: "Plates slide horizontally past one another along strike-slip faults like the San Andreas Fault.",
  },
];

export default function PlateTectonicsSimulator() {
  const [boundary, setBoundary] = useState(BOUNDARIES[0]);
  const [plateSpeed, setPlateSpeed] = useState(5); // cm/yr
  const [isPlaying, setIsPlaying] = useState(true);

  const canvasRef = useRef(null);
  const shiftRef = useRef(0);
  const animRef = useRef(null);

  const handleReset = () => {
    setBoundary(BOUNDARIES[0]);
    setPlateSpeed(5);
    setIsPlaying(true);
    shiftRef.current = 0;
  };

  // Canvas Cross Section Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      if (isPlaying) {
        shiftRef.current += (plateSpeed / 10) * 0.5;
      }
      const shift = shiftRef.current;

      // 1. Asthenosphere (Mantle) Background
      ctx.fillStyle = "#7C2D12"; // Deep hot mantle red
      ctx.fillRect(0, h * 0.4, w, h * 0.6);

      // Convection Currents Arrows in Mantle
      ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
      ctx.lineWidth = 3;

      if (boundary.id === "divergent") {
        // Upwelling arrows in center
        ctx.beginPath();
        ctx.moveTo(w * 0.5, h * 0.8);
        ctx.lineTo(w * 0.5, h * 0.45);
        ctx.stroke();

        // 2. Lithospheric Plates Moving Apart
        ctx.fillStyle = "#334155"; // Plate 1 Left
        ctx.fillRect(0, h * 0.25, w * 0.5 - shift * 2, h * 0.15);

        ctx.fillStyle = "#475569"; // Plate 2 Right
        ctx.fillRect(w * 0.5 + shift * 2, h * 0.25, w * 0.5, h * 0.15);

        // Magma Upwelling gap
        ctx.fillStyle = "#EF4444";
        ctx.fillRect(w * 0.5 - shift * 2, h * 0.25, shift * 4, h * 0.15);

      } else if (boundary.id === "convergent") {
        // Continental Plate Right
        ctx.fillStyle = "#1E293B";
        ctx.fillRect(w * 0.45, h * 0.2, w * 0.55, h * 0.2);

        // Oceanic Subducting Plate Left (diving under right plate)
        ctx.fillStyle = "#334155";
        ctx.beginPath();
        ctx.moveTo(0, h * 0.25);
        ctx.lineTo(w * 0.55, h * 0.25);
        ctx.lineTo(w * 0.75, h * 0.75); // Subducting slab
        ctx.lineTo(w * 0.65, h * 0.75);
        ctx.lineTo(0, h * 0.35);
        ctx.closePath();
        ctx.fill();

        // Volcanic Plume rising
        ctx.fillStyle = "#F59E0B";
        ctx.beginPath();
        ctx.arc(w * 0.65, h * 0.22, 12, 0, Math.PI * 2);
        ctx.fill();

      } else {
        // Transform Fault
        ctx.fillStyle = "#334155";
        ctx.fillRect(0, h * 0.25, w, h * 0.08);

        ctx.fillStyle = "#475569";
        ctx.fillRect(0, h * 0.33, w, h * 0.08);

        // Fault line crack
        ctx.strokeStyle = "#EF4444";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, h * 0.33);
        ctx.lineTo(w, h * 0.33);
        ctx.stroke();
      }

      // Ocean Water Top
      ctx.fillStyle = "rgba(14, 165, 233, 0.25)";
      ctx.fillRect(0, 0, w, h * 0.25);

      animRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animRef.current);
  }, [boundary, isPlaying, plateSpeed]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Hero Section */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                Science / Geosciences
              </span>
              <span className="text-xs text-muted-foreground">Geodynamics & Plate Boundaries</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
              Plate Tectonics Simulator
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Simulate lithospheric plate boundary interactions, mantle convection, subduction zones, and volcanism.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-primary text-white hover:bg-primary/90 transition shadow-md"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? "Pause Motion" : "Animate Motion"}
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
                <Sliders className="w-4 h-4" /> Boundary Configuration
              </h2>

              {/* Boundary Select */}
              <div>
                <label className="text-xs font-semibold mb-1.5 block">Plate Boundary Type</label>
                <div className="space-y-1.5">
                  {BOUNDARIES.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setBoundary(b)}
                      className={`w-full px-3 py-2 rounded-lg text-xs font-medium border text-left flex items-center justify-between transition ${
                        boundary.id === b.id ? "bg-primary text-white border-primary" : "border-border hover:bg-surface-soft"
                      }`}
                    >
                      <span>{b.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Plate Speed Slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Plate Relative Velocity</span>
                  <span className="text-primary font-mono">{plateSpeed} cm/yr</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={plateSpeed}
                  onChange={(e) => setPlateSpeed(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>

            {/* Geologic Features Telemetry */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
              <div className="border-b border-border pb-2">
                <h2 className="text-base font-bold text-foreground">{boundary.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{boundary.desc}</p>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Geologic Features Formed:</div>
                  <div className="text-xs font-bold text-foreground mt-0.5">{boundary.features}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Seismic Hazard:</div>
                  <div className="text-xs font-bold text-rose-500 mt-0.5">{boundary.seismic}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Cross Section Canvas (8 cols) */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            <div className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-sm flex-1 min-h-[440px]">
              <canvas ref={canvasRef} className="w-full h-full block" />
              <div className="absolute top-3 left-4 text-xs font-mono bg-card/80 backdrop-blur border border-border px-3 py-1 rounded-lg text-primary font-bold">
                Mantle Convection & Crustal Subduction/Spreading
              </div>
            </div>

            {/* Educational Notes */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-2 shadow-sm">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" /> Educational Principles: Tectonic Dynamics
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Earth's rigid lithosphere is broken into 7 major tectonic plates floating on the semi-fluid asthenosphere. Heat escaping from Earth's core drives mantle convection currents, propelling continental drift.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
