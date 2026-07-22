"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, RotateCcw, Sliders, Info, Flame, ChevronRight } from "lucide-react";

const LOW_MASS_STAGES = [
  { id: "nebula", name: "Stellar Nebula", temp: "10 - 100 K", radius: "10 - 100 light years", lifetime: "10 million yrs", lum: "0.001 L☉", fusion: "None (Gas Collapse)", desc: "Interstellar cloud of hydrogen gas and cosmic dust collapsing under gravity.", color: "#3B82F6" },
  { id: "protostar", name: "Protostar", temp: "2,000 - 3,000 K", radius: "5 - 10 R☉", lifetime: "1 million yrs", lum: "1 - 10 L☉", fusion: "Gravitational Contraction", desc: "A dense hot core forming at the center of collapsing cloud before fusion starts.", color: "#F59E0B" },
  { id: "main-seq", name: "Main Sequence Star", temp: "5,800 K (Sun)", radius: "1 R☉", lifetime: "10 billion yrs", lum: "1 L☉", fusion: "Hydrogen → Helium (p-p chain)", desc: "Hydrostatic equilibrium where outward radiation pressure balances inward gravity.", color: "#FDE047" },
  { id: "red-giant", name: "Red Giant", temp: "3,000 - 4,000 K", radius: "100 R☉", lifetime: "1 billion yrs", lum: "1,000 L☉", fusion: "Helium → Carbon & Oxygen", desc: "Outer hydrogen layers expand and cool as core hydrogen depletes.", color: "#EF4444" },
  { id: "planetary-nebula", name: "Planetary Nebula", temp: "10,000 - 50,000 K", radius: "1 light year", lifetime: "20,000 yrs", lum: "100 L☉", fusion: "None (Shell Ejection)", desc: "Glowing shell of ionized gas expelled by dying medium-mass star.", color: "#14B8A6" },
  { id: "white-dwarf", name: "White Dwarf", temp: "100,000 K → 0 K", radius: "0.01 R☉ (Earth size)", lifetime: "Trillions of yrs", lum: "0.0001 L☉", fusion: "None (Degenerate Core)", desc: "Hot dense core remnant supported by electron degeneracy pressure.", color: "#E2E8F0" },
];

const HIGH_MASS_STAGES = [
  { id: "nebula", name: "Stellar Nebula", temp: "10 - 100 K", radius: "100 light years", lifetime: "5 million yrs", lum: "0.01 L☉", fusion: "None (Cloud Collapse)", desc: "Massive molecular cloud collapsing into high-mass protostars.", color: "#3B82F6" },
  { id: "protostar", name: "Massive Protostar", temp: "5,000 K", radius: "50 R☉", lifetime: "100,000 yrs", lum: "1,000 L☉", fusion: "Gravitational Heat", desc: "Rapidly accreting super-dense protostellar core.", color: "#F59E0B" },
  { id: "blue-supergiant", name: "Blue / O-Type Main Seq", temp: "30,000 K", radius: "10 - 20 R☉", lifetime: "10 million yrs", lum: "100,000 L☉", fusion: "Hydrogen → Helium (CNO cycle)", desc: "Extremely hot, luminous star burning hydrogen fuel at rapid rates.", color: "#38BDF8" },
  { id: "red-supergiant", name: "Red Supergiant", temp: "3,500 K", radius: "1,000 R☉", lifetime: "1 million yrs", lum: "500,000 L☉", fusion: "Carbon, Oxygen, Silicon → Iron", desc: "Concentric burning shells synthesizing elements up to Iron at the core.", color: "#DC2626" },
  { id: "supernova", name: "Type II Supernova", temp: "100 Billion K", radius: "Expanding blast wave", lifetime: "Seconds / Months", lum: "10 Billion L☉", fusion: "Rapid neutron capture (r-process)", desc: "Cataclysmic core-collapse explosion seeding heavy elements into the galaxy.", color: "#A855F7" },
  { id: "remnant", name: "Neutron Star / Black Hole", temp: "1,000,000 K", radius: "20 km (NS) / Event Horizon", lifetime: "Infinite", lum: "0.001 L☉ / 0", fusion: "None (Gravitational Singularity)", desc: "Neutron degeneracy object or infinite density spacetime singularity.", color: "#64748B" },
];

export default function StarLifeCycleExplorer() {
  const [initialMass, setInitialMass] = useState(1.0); // M_solar
  const [stageIndex, setStageIndex] = useState(2); // Main sequence default

  const canvasRef = useRef(null);

  const isHighMass = initialMass > 8.0;
  const currentStages = isHighMass ? HIGH_MASS_STAGES : LOW_MASS_STAGES;
  const currentStage = currentStages[Math.min(stageIndex, currentStages.length - 1)];

  const handleReset = () => {
    setInitialMass(1.0);
    setStageIndex(2);
  };

  // Canvas Render for current stellar stage
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
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    const stageId = currentStage.id;

    if (stageId === "nebula" || stageId === "planetary-nebula") {
      // Draw Gas Nebula Cloud
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 160);
      grad.addColorStop(0, currentStage.color);
      grad.addColorStop(0.5, "rgba(168, 85, 247, 0.4)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 160, 0, Math.PI * 2);
      ctx.fill();
    } else if (stageId === "supernova") {
      // Explosive Shockwave
      ctx.strokeStyle = "#F59E0B";
      ctx.lineWidth = 4;
      for (let r = 20; r < 140; r += 20) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(cx, cy, 25, 0, Math.PI * 2);
      ctx.fill();
    } else if (stageId === "remnant" && isHighMass) {
      // Black Hole Accretion Disk or Pulsar
      const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 90);
      grad.addColorStop(0, "#000000");
      grad.addColorStop(0.3, "#000000");
      grad.addColorStop(0.7, "#F59E0B");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 90, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(cx, cy, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#14B8A6";
      ctx.stroke();
    } else {
      // Standard Star Glow
      const rStar = stageId.includes("giant") ? 90 : stageId.includes("dwarf") ? 15 : 45;
      const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, rStar * 1.8);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.4, currentStage.color);
      grad.addColorStop(1, "rgba(0,0,0,0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, rStar * 1.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = currentStage.color;
      ctx.beginPath();
      ctx.arc(cx, cy, rStar, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [currentStage, isHighMass]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Hero Section */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                Science / Astrophysics
              </span>
              <span className="text-xs text-muted-foreground">Stellar Evolution</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
              Star Life Cycle Explorer
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Chart the life paths of stars from gas nebulae through main sequence fusion to supernovae, neutron stars, and black holes.
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

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Controls & Mass Selector (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Sliders className="w-4 h-4" /> Stellar Initial Mass
              </h2>

              {/* Initial Mass Slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Initial Solar Mass ($M_\odot$)</span>
                  <span className="text-primary font-mono">{initialMass} M☉</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="40"
                  step="0.5"
                  value={initialMass}
                  onChange={(e) => setInitialMass(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Branch Indicator */}
              <div className="p-3 rounded-lg bg-surface-soft border border-border text-xs">
                <div className="font-semibold text-foreground">Evolutionary Branch</div>
                <div className={`font-bold mt-0.5 ${isHighMass ? "text-rose-500" : "text-amber-500"}`}>
                  {isHighMass ? "High Mass (> 8 M☉) → Supernova" : "Low/Medium Mass (< 8 M☉) → White Dwarf"}
                </div>
              </div>

              {/* Stage Stepper Buttons */}
              <div>
                <label className="text-xs font-semibold mb-1.5 block">Evolutionary Stage</label>
                <div className="space-y-1.5">
                  {currentStages.map((stg, idx) => (
                    <button
                      key={stg.id}
                      onClick={() => setStageIndex(idx)}
                      className={`w-full px-3 py-2 rounded-lg text-xs font-medium border text-left flex items-center justify-between transition ${
                        stageIndex === idx ? "bg-primary text-white border-primary" : "border-border hover:bg-surface-soft"
                      }`}
                    >
                      <span>{stg.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Current Stage Telemetry */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
              <div className="border-b border-border pb-2">
                <h2 className="text-base font-bold text-foreground">{currentStage.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{currentStage.desc}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Surface Temp</div>
                  <div className="text-xs font-bold font-mono text-foreground mt-0.5">{currentStage.temp}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Radius</div>
                  <div className="text-xs font-bold font-mono text-foreground mt-0.5">{currentStage.radius}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Luminosity</div>
                  <div className="text-xs font-bold font-mono text-foreground mt-0.5">{currentStage.lum}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Lifetime</div>
                  <div className="text-xs font-bold font-mono text-foreground mt-0.5">{currentStage.lifetime}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stellar Canvas Visualizer (8 cols) */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            <div className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-sm flex-1 min-h-[440px]">
              <canvas ref={canvasRef} className="w-full h-full block" />
              <div className="absolute bottom-3 left-4 text-xs font-mono bg-card/80 backdrop-blur border border-border px-3 py-1.5 rounded-lg text-primary">
                Core Fusion Stage: {currentStage.fusion}
              </div>
            </div>

            {/* Educational Notes */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-2 shadow-sm">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" /> Educational Principles: Stellar Nucleosynthesis
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Stars spend 90% of their life fusing Hydrogen into Helium on the Main Sequence. High-mass stars fuse heavier elements (C, O, Ne, Mg, Si) until reaching Iron ($Fe$), triggering core collapse and a supernova.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
