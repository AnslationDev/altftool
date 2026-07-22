"use client";

import React, { useState, useEffect, useRef } from "react";
import { FlaskConical, RotateCcw, Play, Pause, Sliders, Info, Sparkles } from "lucide-react";

const REACTIONS = [
  {
    type: "Combination (Synthesis)",
    eq: "2H₂ + O₂ ➔ 2H₂O",
    deltaH: "-483.6 kJ/mol",
    energyType: "Exothermic",
    desc: "Two or more reactants combine to form a single complex product.",
    reactants: [ { name: "H₂", count: 2, color: "#38BDF8" }, { name: "O₂", count: 1, color: "#EF4444" } ],
    products: [ { name: "H₂O", count: 2, color: "#14B8A6" } ],
  },
  {
    type: "Decomposition",
    eq: "2H₂O₂ ➔ 2H₂O + O₂",
    deltaH: "-196.0 kJ/mol",
    energyType: "Exothermic",
    desc: "A single compound breaks down into two or more simpler substances.",
    reactants: [ { name: "H₂O₂", count: 2, color: "#A855F7" } ],
    products: [ { name: "H₂O", count: 2, color: "#14B8A6" }, { name: "O₂", count: 1, color: "#EF4444" } ],
  },
  {
    type: "Single Replacement",
    eq: "Zn + 2HCl ➔ ZnCl₂ + H₂",
    deltaH: "-153.2 kJ/mol",
    energyType: "Exothermic",
    desc: "An active element replaces a less reactive element in a compound.",
    reactants: [ { name: "Zn", count: 1, color: "#94A3B8" }, { name: "HCl", count: 2, color: "#10B981" } ],
    products: [ { name: "ZnCl₂", count: 1, color: "#3B82F6" }, { name: "H₂", count: 1, color: "#38BDF8" } ],
  },
  {
    type: "Double Replacement",
    eq: "AgNO₃ + NaCl ➔ AgCl↓ + NaNO₃",
    deltaH: "-65.5 kJ/mol",
    energyType: "Exothermic (Precipitation)",
    desc: "Ions in two compounds exchange partners, forming a solid precipitate.",
    reactants: [ { name: "AgNO₃", count: 1, color: "#F59E0B" }, { name: "NaCl", count: 1, color: "#06B6D4" } ],
    products: [ { name: "AgCl (s)", count: 1, color: "#F8FAFC" }, { name: "NaNO₃", count: 1, color: "#818CF8" } ],
  },
  {
    type: "Combustion",
    eq: "CH₄ + 2O₂ ➔ CO₂ + 2H₂O",
    deltaH: "-890.3 kJ/mol",
    energyType: "Highly Exothermic",
    desc: "Hydrocarbon reacts rapidly with oxygen releasing heat and light energy.",
    reactants: [ { name: "CH₄", count: 1, color: "#334155" }, { name: "O₂", count: 2, color: "#EF4444" } ],
    products: [ { name: "CO₂", count: 1, color: "#64748B" }, { name: "H₂O", count: 2, color: "#14B8A6" } ],
  },
];

export default function ChemicalReactionExplorer() {
  const [selectedRxn, setSelectedRxn] = useState(REACTIONS[0]);
  const [progress, setProgress] = useState(0); // 0 (Reactants) -> 100 (Products)
  const [isPlaying, setIsPlaying] = useState(false);

  const canvasRef = useRef(null);

  const handleReset = () => {
    setProgress(0);
    setIsPlaying(false);
  };

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          setIsPlaying(false);
          return 100;
        }
        return p + 2;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Canvas Molecule Transition Render
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

    const t = progress / 100; // 0 to 1

    // 1. Draw Reactants Side (Left -> Center)
    const leftX = w * 0.25 + t * (w * 0.25);
    selectedRxn.reactants.forEach((r, idx) => {
      const py = cy + (idx - (selectedRxn.reactants.length - 1) / 2) * 60;
      const alpha = Math.max(0, 1 - t * 1.5);

      ctx.fillStyle = r.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(leftX, py, 25, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${r.count > 1 ? r.count : ""}${r.name}`, leftX, py);
    });

    // 2. Draw Products Side (Center -> Right)
    const rightX = w * 0.5 + t * (w * 0.25);
    selectedRxn.products.forEach((p, idx) => {
      const py = cy + (idx - (selectedRxn.products.length - 1) / 2) * 60;
      const alpha = Math.min(1, t * 1.5);

      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(rightX, py, 28, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${p.count > 1 ? p.count : ""}${p.name}`, rightX, py);
    });

    ctx.globalAlpha = 1.0;

    // Reaction Progress Arrow in Center
    ctx.strokeStyle = "#14B8A6";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w * 0.35, cy);
    ctx.lineTo(w * 0.65, cy);
    ctx.stroke();

    ctx.fillStyle = "#14B8A6";
    ctx.beginPath();
    ctx.moveTo(w * 0.65, cy);
    ctx.lineTo(w * 0.65 - 10, cy - 6);
    ctx.lineTo(w * 0.65 - 10, cy + 6);
    ctx.fill();

  }, [selectedRxn, progress]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Hero Section */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                Science / Chemistry
              </span>
              <span className="text-xs text-muted-foreground">Chemical Kinetics & Stoichiometry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
              Chemical Reaction Explorer
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Simulate chemical reaction classifications, stoichiometry, enthalpy changes ($\Delta H$), and molecular bond transformations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-primary text-white hover:bg-primary/90 transition shadow-md"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? "Pause Reaction" : "Trigger Reaction"}
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

          {/* Reaction Selectors (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <FlaskConical className="w-4 h-4" /> Reaction Type Selector
              </h2>
              <div className="space-y-2">
                {REACTIONS.map((r) => (
                  <button
                    key={r.type}
                    onClick={() => { setSelectedRxn(r); handleReset(); }}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border text-left flex flex-col transition ${
                      selectedRxn.type === r.type ? "bg-primary text-white border-primary" : "border-border hover:bg-surface-soft"
                    }`}
                  >
                    <span>{r.type}</span>
                    <span className="font-mono text-[11px] opacity-80 mt-0.5">{r.eq}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reaction Telemetry & Enthalpy Card */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
              <div className="border-b border-border pb-2">
                <h2 className="text-base font-bold text-foreground">{selectedRxn.type}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedRxn.desc}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Enthalpy ($\Delta H$)</div>
                  <div className="text-sm font-bold font-mono text-foreground mt-0.5">{selectedRxn.deltaH}</div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Thermodynamics</div>
                  <div className="text-xs font-bold text-rose-400 mt-0.5">{selectedRxn.energyType}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Reaction Animation Canvas (8 cols) */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            <div className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-sm flex-1 min-h-[420px]">
              <canvas ref={canvasRef} className="w-full h-full block" />
              <div className="absolute top-3 left-4 text-xs font-mono bg-card/80 backdrop-blur border border-border px-3 py-1 rounded-lg text-primary font-bold">
                {selectedRxn.eq}
              </div>
              <div className="absolute bottom-4 left-6 right-6">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Reactants</span>
                  <span>Products</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>

            {/* Educational Notes */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-2 shadow-sm">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" /> Educational Principles: Chemical Stoichiometry
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Chemical reactions satisfy the Law of Conservation of Mass: atom counts for each element remain identical on both sides of the balanced equation. Exothermic reactions release thermal enthalpy (ΔH &lt; 0).
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
