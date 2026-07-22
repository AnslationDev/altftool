"use client";

import React, { useState, useEffect, useRef } from "react";
import { Globe, RotateCcw, Play, Pause, Sliders, Info, Compass } from "lucide-react";

const PLANETS = [
  { name: "Mercury", orbitRadius: 55, size: 5, period: 88, color: "#A1A1AA", radiusKm: "2,440", massKg: "3.30 × 10²³", gravity: "3.70 m/s²", distAU: "0.39 AU", temp: "167 °C", day: "58.6 days", year: "88 days" },
  { name: "Venus", orbitRadius: 85, size: 9, period: 225, color: "#F59E0B", radiusKm: "6,052", massKg: "4.87 × 10²⁴", gravity: "8.87 m/s²", distAU: "0.72 AU", temp: "464 °C", day: "243 days", year: "225 days" },
  { name: "Earth", orbitRadius: 120, size: 10, period: 365, color: "#3B82F6", radiusKm: "6,371", massKg: "5.97 × 10²⁴", gravity: "9.81 m/s²", distAU: "1.00 AU", temp: "15 °C", day: "24 hours", year: "365.25 days" },
  { name: "Mars", orbitRadius: 155, size: 7, period: 687, color: "#EF4444", radiusKm: "3,390", massKg: "6.42 × 10²³", gravity: "3.71 m/s²", distAU: "1.52 AU", temp: "-65 °C", day: "24.6 hours", year: "687 days" },
  { name: "Jupiter", orbitRadius: 205, size: 20, period: 4333, color: "#F97316", radiusKm: "69,911", massKg: "1.90 × 10²⁷", gravity: "24.79 m/s²", distAU: "5.20 AU", temp: "-110 °C", day: "9.9 hours", year: "11.86 years" },
  { name: "Saturn", orbitRadius: 260, size: 16, period: 10759, color: "#EAB308", hasRing: true, radiusKm: "58,232", massKg: "5.68 × 10²⁶", gravity: "10.44 m/s²", distAU: "9.58 AU", temp: "-140 °C", day: "10.7 hours", year: "29.45 years" },
  { name: "Uranus", orbitRadius: 310, size: 13, period: 30687, color: "#06B6D4", radiusKm: "25,362", massKg: "8.68 × 10²⁵", gravity: "8.69 m/s²", distAU: "19.22 AU", temp: "-195 °C", day: "17.2 hours", year: "84.0 years" },
  { name: "Neptune", orbitRadius: 365, size: 12, period: 60190, color: "#6366F1", radiusKm: "24,622", massKg: "1.02 × 10²⁶", gravity: "11.15 m/s²", distAU: "30.05 AU", temp: "-200 °C", day: "16.1 hours", year: "164.8 years" },
];

export default function SolarSystemExplorer() {
  const [selectedPlanet, setSelectedPlanet] = useState(PLANETS[2]); // Earth default
  const [simSpeed, setSimSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);

  const canvasRef = useRef(null);
  const timeRef = useRef(0);
  const animRef = useRef(null);

  const handleReset = () => {
    setSelectedPlanet(PLANETS[2]);
    setSimSpeed(1);
    setIsPlaying(true);
    timeRef.current = 0;
  };

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
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Starry background dots
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      for (let i = 0; i < 60; i++) {
        const sx = (Math.sin(i * 99) * 0.5 + 0.5) * w;
        const sy = (Math.cos(i * 33) * 0.5 + 0.5) * h;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // Draw Sun in center
      const sunGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 32);
      sunGrad.addColorStop(0, "#FDE047");
      sunGrad.addColorStop(0.5, "#F59E0B");
      sunGrad.addColorStop(1, "rgba(245, 158, 11, 0)");

      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 32, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#FEF08A";
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();

      // Update simulation time
      if (isPlaying) {
        timeRef.current += 0.5 * simSpeed;
      }

      // Draw Orbit Rings and Planets
      PLANETS.forEach((planet) => {
        const r = planet.orbitRadius * (Math.min(w, h) / 820);
        const angle = (timeRef.current / (planet.period * 0.05)) % (Math.PI * 2);

        // Orbit ring
        ctx.strokeStyle = selectedPlanet.name === planet.name ? "rgba(20, 184, 166, 0.6)" : "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = selectedPlanet.name === planet.name ? 2 : 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        // Planet Position
        const px = cx + r * Math.cos(angle);
        const py = cy + r * Math.sin(angle);

        // Saturn Ring
        if (planet.hasRing) {
          ctx.strokeStyle = "rgba(234, 179, 8, 0.5)";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(px, py, planet.size * 1.6, planet.size * 0.6, 0.4, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Body
        ctx.fillStyle = planet.color;
        ctx.beginPath();
        ctx.arc(px, py, planet.size, 0, Math.PI * 2);
        ctx.fill();

        // Selection highlight glow
        if (selectedPlanet.name === planet.name) {
          ctx.strokeStyle = "#14B8A6";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(px, py, planet.size + 5, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      animRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, simSpeed, selectedPlanet]);

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
              <span className="text-xs text-muted-foreground">Planetary Mechanics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
              Solar System Explorer
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Explore planetary orbits, astronomical physical data, orbital periods, and physical properties of our solar system.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-primary text-white hover:bg-primary/90 transition shadow-md"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? "Pause Orbits" : "Resume Orbits"}
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

          {/* Controls & Selected Planet Data (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Globe className="w-4 h-4" /> Planet Selection
              </h2>

              {/* Planet Grid */}
              <div className="grid grid-cols-4 gap-2">
                {PLANETS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => setSelectedPlanet(p)}
                    className={`p-2 rounded-lg text-xs font-medium border text-center transition ${
                      selectedPlanet.name === p.name ? "bg-primary text-white border-primary" : "border-border hover:bg-surface-soft"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              {/* Speed Slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Orbit Speed Multiplier</span>
                  <span className="text-primary font-mono">{simSpeed}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="5"
                  step="0.2"
                  value={simSpeed}
                  onChange={(e) => setSimSpeed(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>

            {/* Planet Data Card */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full inline-block" style={{ backgroundColor: selectedPlanet.color }} />
                  {selectedPlanet.name}
                </h2>
                <span className="text-xs font-mono text-primary">{selectedPlanet.distAU}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Equatorial Radius</div>
                  <div className="text-sm font-bold font-mono text-foreground mt-0.5">
                    {selectedPlanet.radiusKm} km
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Mass</div>
                  <div className="text-sm font-bold font-mono text-foreground mt-0.5">
                    {selectedPlanet.massKg} kg
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Surface Gravity</div>
                  <div className="text-sm font-bold font-mono text-foreground mt-0.5">
                    {selectedPlanet.gravity}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Mean Temp</div>
                  <div className="text-sm font-bold font-mono text-foreground mt-0.5">
                    {selectedPlanet.temp}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Rotation Day</div>
                  <div className="text-sm font-bold font-mono text-foreground mt-0.5">
                    {selectedPlanet.day}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Orbital Year</div>
                  <div className="text-sm font-bold font-mono text-foreground mt-0.5">
                    {selectedPlanet.year}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Planetarium Canvas (8 cols) */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            <div className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-sm flex-1 min-h-[440px]">
              <canvas ref={canvasRef} className="w-full h-full block" />
              <div className="absolute top-3 left-4 text-xs font-mono bg-card/80 backdrop-blur border border-border px-3 py-1 rounded-lg text-muted-foreground">
                Interactive Planetary Orbits (Not to scale for visibility)
              </div>
            </div>

            {/* Educational Notes */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-2 shadow-sm">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" /> Educational Principles: Kepler's Laws
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Kepler's Third Law ($T^2 \propto a^3$) dictates that planets further from the Sun move significantly slower in their orbits. Terrestrial planets are dense and rocky, whereas Gas Giants are dominated by hydrogen and helium atmospheres.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
