"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Magnet, RotateCcw, Zap, Compass, Info, Sliders, Activity } from "lucide-react";

export default function MagneticFieldVisualizer() {
  const [mode, setMode] = useState("single"); // 'single' | 'double' | 'electromagnet'
  const [alignment, setAlignment] = useState("attract"); // 'attract' | 'repel'
  const [fieldStrength, setFieldStrength] = useState(50);
  const [lineDensity, setLineDensity] = useState(24);
  const [isReversed, setIsReversed] = useState(false);

  // Mouse/probe position
  const [probePos, setProbePos] = useState({ x: 250, y: 150 });
  const [probeB, setProbeB] = useState({ bx: 0, by: 0, bTotal: 0 });

  const canvasRef = useRef(null);

  const handleReset = () => {
    setMode("single");
    setAlignment("attract");
    setFieldStrength(50);
    setLineDensity(24);
    setIsReversed(false);
  };

  // Compute magnetic field vector at position (x, y)
  const computeFieldVector = useCallback((x, y, magnets) => {
    let bx = 0;
    let by = 0;

    magnets.forEach((mag) => {
      // North pole (positive magnetic charge)
      const dxN = x - mag.n.x;
      const dyN = y - mag.n.y;
      const rN2 = dxN * dxN + dyN * dyN + 100;
      const rN = Math.sqrt(rN2);
      const bN = mag.strength / rN2;
      bx += bN * (dxN / rN);
      by += bN * (dyN / rN);

      // South pole (negative magnetic charge)
      const dxS = x - mag.s.x;
      const dyS = y - mag.s.y;
      const rS2 = dxS * dxS + dyS * dyS + 100;
      const rS = Math.sqrt(rS2);
      const bS = mag.strength / rS2;
      bx -= bS * (dxS / rS);
      by -= bS * (dyS / rS);
    });

    return { bx, by, bTotal: Math.sqrt(bx * bx + by * by) };
  }, []);

  // Update probe stats when position or settings change
  useEffect(() => {
    const w = 600;
    const h = 400;

    let magnets = [];
    const k = isReversed ? -1 : 1;
    const str = fieldStrength * 100 * k;

    if (mode === "single") {
      magnets = [{ n: { x: 200, y: 200 }, s: { x: 400, y: 200 }, strength: str }];
    } else if (mode === "double") {
      if (alignment === "attract") {
        magnets = [
          { n: { x: 120, y: 200 }, s: { x: 240, y: 200 }, strength: str },
          { n: { x: 360, y: 200 }, s: { x: 480, y: 200 }, strength: str },
        ];
      } else {
        magnets = [
          { n: { x: 240, y: 200 }, s: { x: 120, y: 200 }, strength: str },
          { n: { x: 360, y: 200 }, s: { x: 480, y: 200 }, strength: str },
        ];
      }
    } else if (mode === "electromagnet") {
      // Solenoid simulated as series of magnetic dipoles
      magnets = [
        { n: { x: 200, y: 160 }, s: { x: 400, y: 160 }, strength: str * 0.5 },
        { n: { x: 200, y: 200 }, s: { x: 400, y: 200 }, strength: str * 0.5 },
        { n: { x: 200, y: 240 }, s: { x: 400, y: 240 }, strength: str * 0.5 },
      ];
    }

    const b = computeFieldVector(probePos.x, probePos.y, magnets);
    setProbeB(b);
  }, [probePos, mode, alignment, fieldStrength, isReversed, computeFieldVector]);

  // Main Canvas Rendering Loop
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

    ctx.clearRect(0, 0, w, h);

    // Setup magnet geometry based on mode
    let magnets = [];
    const k = isReversed ? -1 : 1;
    const str = fieldStrength * 100 * k;

    if (mode === "single") {
      magnets = [{ n: { x: w * 0.35, y: h * 0.5 }, s: { x: w * 0.65, y: h * 0.5 }, strength: str }];
    } else if (mode === "double") {
      if (alignment === "attract") {
        magnets = [
          { n: { x: w * 0.2, y: h * 0.5 }, s: { x: w * 0.38, y: h * 0.5 }, strength: str },
          { n: { x: w * 0.62, y: h * 0.5 }, s: { x: w * 0.8, y: h * 0.5 }, strength: str },
        ];
      } else {
        magnets = [
          { n: { x: w * 0.38, y: h * 0.5 }, s: { x: w * 0.2, y: h * 0.5 }, strength: str },
          { n: { x: w * 0.62, y: h * 0.5 }, s: { x: w * 0.8, y: h * 0.5 }, strength: str },
        ];
      }
    } else if (mode === "electromagnet") {
      magnets = [
        { n: { x: w * 0.35, y: h * 0.4 }, s: { x: w * 0.65, y: h * 0.4 }, strength: str * 0.5 },
        { n: { x: w * 0.35, y: h * 0.5 }, s: { x: w * 0.65, y: h * 0.5 }, strength: str * 0.5 },
        { n: { x: w * 0.35, y: h * 0.6 }, s: { x: w * 0.65, y: h * 0.6 }, strength: str * 0.5 },
      ];
    }

    // 1. Draw Field Lines using Streamline Integration
    const numSeeds = lineDensity;
    const stepSize = 4;
    const maxSteps = 150;

    magnets.forEach((mag) => {
      // Seed points around North Pole
      for (let i = 0; i < numSeeds; i++) {
        const ang = (i / numSeeds) * Math.PI * 2;
        let currX = mag.n.x + Math.cos(ang) * 15;
        let currY = mag.n.y + Math.sin(ang) * 15;

        ctx.beginPath();
        ctx.moveTo(currX, currY);
        ctx.strokeStyle = "rgba(20, 184, 166, 0.4)";
        ctx.lineWidth = 1.5;

        for (let step = 0; step < maxSteps; step++) {
          const vec = computeFieldVector(currX, currY, magnets);
          if (vec.bTotal === 0) break;

          const dx = (vec.bx / vec.bTotal) * stepSize;
          const dy = (vec.by / vec.bTotal) * stepSize;

          currX += dx;
          currY += dy;

          ctx.lineTo(currX, currY);

          // Stop if out of bounds or near South pole
          if (currX < 0 || currX > w || currY < 0 || currY > h) break;
        }
        ctx.stroke();
      }
    });

    // 2. Draw Magnets / Coils
    if (mode === "electromagnet") {
      // Draw Coils
      ctx.strokeStyle = "#F59E0B";
      ctx.lineWidth = 5;
      for (let x = w * 0.35; x <= w * 0.65; x += 15) {
        ctx.beginPath();
        ctx.ellipse(x, h * 0.5, 8, 30, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else {
      // Draw Bar Magnets
      magnets.forEach((m) => {
        const mx = (m.n.x + m.s.x) / 2;
        const my = (m.n.y + m.s.y) / 2;
        const width = Math.abs(m.s.x - m.n.x);
        const height = 40;

        // Red (North) half
        ctx.fillStyle = "#EF4444";
        ctx.fillRect(m.n.x < m.s.x ? m.n.x - 10 : m.n.x + 10 - width / 2, my - height / 2, width / 2 + 10, height);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 14px sans-serif";
        ctx.fillText(isReversed ? "S" : "N", m.n.x < m.s.x ? m.n.x + 10 : m.n.x - 20, my + 5);

        // Blue (South) half
        ctx.fillStyle = "#3B82F6";
        ctx.fillRect(m.n.x < m.s.x ? mx : m.s.x - 10, my - height / 2, width / 2 + 10, height);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(isReversed ? "N" : "S", m.n.x < m.s.x ? m.s.x - 20 : m.s.x + 10, my + 5);

        // Border
        ctx.strokeStyle = "rgba(255,255,255,0.4)";
        ctx.lineWidth = 2;
        ctx.strokeRect(Math.min(m.n.x, m.s.x) - 10, my - height / 2, width + 20, height);
      });
    }

    // 3. Draw Compass Probe
    const bVec = computeFieldVector(probePos.x, probePos.y, magnets);
    const angle = Math.atan2(bVec.by, bVec.bx);

    ctx.save();
    ctx.translate(probePos.x, probePos.y);

    // Outer Circle
    ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
    ctx.strokeStyle = "#14B8A6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Needle
    ctx.rotate(angle);
    ctx.fillStyle = "#EF4444"; // North tip
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(0, -5);
    ctx.lineTo(0, 5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#3B82F6"; // South tip
    ctx.beginPath();
    ctx.moveTo(-14, 0);
    ctx.lineTo(0, -5);
    ctx.lineTo(0, 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }, [mode, alignment, fieldStrength, lineDensity, isReversed, probePos, computeFieldVector]);

  // Handle Canvas Interaction for Moving Compass Probe
  const handleCanvasPointer = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setProbePos({ x, y });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Hero Section */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                Science / Physics
              </span>
              <span className="text-xs text-muted-foreground">Electromagnetism</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
              Magnetic Field Visualizer
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Visualize vector lines of force, magnetic dipoles, solenoids, and measure flux density with an interactive compass probe.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold border border-border bg-card hover:bg-surface-soft transition"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Control Panel (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Sliders className="w-4 h-4" /> Magnet Configuration
              </h2>

              {/* Magnet Mode Select */}
              <div>
                <label className="text-xs font-semibold mb-1.5 block">Magnet System</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "single", label: "Bar" },
                    { id: "double", label: "Two Magnets" },
                    { id: "electromagnet", label: "Solenoid" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                        mode === m.id ? "bg-primary text-white border-primary" : "border-border hover:bg-surface-soft"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alignment for double magnets */}
              {mode === "double" && (
                <div>
                  <label className="text-xs font-semibold mb-1.5 block">Poles Alignment</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setAlignment("attract")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                        alignment === "attract" ? "bg-primary text-white border-primary" : "border-border hover:bg-surface-soft"
                      }`}
                    >
                      Attracting (N - S)
                    </button>
                    <button
                      onClick={() => setAlignment("repel")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                        alignment === "repel" ? "bg-primary text-white border-primary" : "border-border hover:bg-surface-soft"
                      }`}
                    >
                      Repelling (N - N)
                    </button>
                  </div>
                </div>
              )}

              {/* Reverse Polarity */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-xs font-semibold">Reverse Polarity</span>
                <input
                  type="checkbox"
                  checked={isReversed}
                  onChange={(e) => setIsReversed(e.target.checked)}
                  className="h-4 w-4 accent-primary cursor-pointer"
                />
              </div>

              {/* Field Strength */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Field Strength</span>
                  <span className="text-primary font-mono">{fieldStrength}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={fieldStrength}
                  onChange={(e) => setFieldStrength(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Line Density */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Field Lines Density</span>
                  <span className="text-primary font-mono">{lineDensity}</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="48"
                  step="4"
                  value={lineDensity}
                  onChange={(e) => setLineDensity(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>

            {/* Probe Telemetry Card */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Compass className="w-4 h-4" /> Magnetic Sensor Probe
              </h2>
              <p className="text-xs text-muted-foreground">Click or drag anywhere on the canvas to place the compass probe.</p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Flux Density ($|B|$)</div>
                  <div className="text-base font-bold font-mono text-foreground mt-0.5">
                    {(probeB.bTotal * 10).toFixed(2)} mT
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Vector Angle</div>
                  <div className="text-base font-bold font-mono text-foreground mt-0.5">
                    {Math.round((Math.atan2(probeB.by, probeB.bx) * 180) / Math.PI)}°
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">$B_x$ Component</div>
                  <div className="text-sm font-mono text-foreground mt-0.5">
                    {(probeB.bx * 10).toFixed(2)} mT
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">$B_y$ Component</div>
                  <div className="text-sm font-mono text-foreground mt-0.5">
                    {(probeB.by * 10).toFixed(2)} mT
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Canvas (8 cols) */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            <div
              className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-sm flex-1 min-h-[420px] cursor-crosshair"
              onPointerDown={handleCanvasPointer}
              onPointerMove={(e) => { if (e.buttons === 1) handleCanvasPointer(e); }}
            >
              <canvas ref={canvasRef} className="w-full h-full block" />
              <div className="absolute top-3 left-4 text-xs font-mono bg-card/80 backdrop-blur border border-border px-3 py-1 rounded-lg text-muted-foreground">
                Click/Drag canvas to position Compass Probe
              </div>
            </div>

            {/* Educational Notes */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-2 shadow-sm">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" /> Educational Principles: Magnetic Dipoles
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Magnetic field lines form continuous loops flowing from North to South externally. Opposite poles ($N-S$) attract due to converging flux lines, while like poles ($N-N$) repel due to opposing vector field forces.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[11px] text-muted-foreground font-mono">
                <div className="p-2 rounded bg-surface-soft">Lorentz Force: F = q(E + v × B)</div>
                <div className="p-2 rounded bg-surface-soft">Biot-Savart Law: dB = (μ₀ I dl × r̂) / 4πr²</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
