"use client";

import React, { useState } from "react";
import { Droplet, RotateCcw, Sliders, Info, Sparkles } from "lucide-react";

const SUBSTANCES = [
  { name: "Battery Acid", ph: 0.0, desc: "Sulfuric acid in car batteries." },
  { name: "Lemon Juice", ph: 2.0, desc: "Citric acid in citrus fruits." },
  { name: "Vinegar", ph: 2.9, desc: "Dilute acetic acid solution." },
  { name: "Black Coffee", ph: 5.0, desc: "Mildly acidic beverage." },
  { name: "Milk", ph: 6.5, desc: "Nearly neutral organic liquid." },
  { name: "Pure Water", ph: 7.0, desc: "Neutral equilibrium at 25 °C." },
  { name: "Human Blood", ph: 7.4, desc: "Slightly alkaline biological buffer." },
  { name: "Baking Soda", ph: 8.5, desc: "Sodium bicarbonate solution." },
  { name: "Hand Soap", ph: 10.0, desc: "Surfactant alkaline cleaner." },
  { name: "Bleach", ph: 13.0, desc: "Sodium hypochlorite disinfectant." },
  { name: "Drain Cleaner", ph: 14.0, desc: "Concentrated sodium hydroxide (Lye)." },
];

export default function PhScaleVisualizer() {
  const [ph, setPh] = useState(7.0);

  const handleReset = () => {
    setPh(7.0);
  };

  const hConc = Math.pow(10, -ph);
  const ohConc = Math.pow(10, -(14 - ph));

  let status = "Neutral";
  let statusColor = "text-teal-400";
  if (ph < 3) { status = "Strongly Acidic"; statusColor = "text-rose-500"; }
  else if (ph < 6.5) { status = "Weakly Acidic"; statusColor = "text-amber-400"; }
  else if (ph > 11) { status = "Strongly Alkaline (Basic)"; statusColor = "text-purple-400"; }
  else if (ph > 7.5) { status = "Weakly Alkaline (Basic)"; statusColor = "text-blue-400"; }

  // Custom function to compute pH color from gradient
  const getPhColor = (val) => {
    if (val <= 3) return "#EF4444"; // Red
    if (val <= 6) return "#F59E0B"; // Yellow/Orange
    if (val === 7) return "#14B8A6"; // Teal Neutral
    if (val <= 10) return "#3B82F6"; // Blue
    return "#A855F7"; // Purple
  };

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
              <span className="text-xs text-muted-foreground">Acid-Base Chemistry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
              pH Scale Visualizer
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Visualize acidity, alkalinity, hydronium $[H^+]$ ion concentrations, and household substance benchmarks.
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

          {/* Controls Panel (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Sliders className="w-4 h-4" /> pH Control Slider
              </h2>

              {/* Slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>pH Level</span>
                  <span className="font-bold font-mono text-lg" style={{ color: getPhColor(ph) }}>
                    {ph.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="14"
                  step="0.1"
                  value={ph}
                  onChange={(e) => setPh(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Substance Presets */}
              <div>
                <label className="text-xs font-semibold mb-1.5 block">Substance Presets</label>
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {SUBSTANCES.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => setPh(s.ph)}
                      className={`w-full px-3 py-1.5 rounded-lg text-xs font-medium border text-left flex items-center justify-between transition ${
                        ph === s.ph ? "bg-primary text-white border-primary" : "border-border hover:bg-surface-soft"
                      }`}
                    >
                      <span>{s.name}</span>
                      <span className="font-mono opacity-80">pH {s.ph}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Concentrations Telemetry */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
              <div className="border-b border-border pb-2 flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground">Aqueous Ion Data</h2>
                <span className={`text-xs font-bold ${statusColor}`}>{status}</span>
              </div>

              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">$[H^+]$ Hydronium Ion Conc.</div>
                  <div className="text-sm font-bold font-mono text-foreground mt-0.5">
                    {hConc.toExponential(2)} mol/L
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">$[OH^-]$ Hydroxide Ion Conc.</div>
                  <div className="text-sm font-bold font-mono text-foreground mt-0.5">
                    {ohConc.toExponential(2)} mol/L
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Spectrum Visualizer (8 cols) */}
          <div className="lg:col-span-8 flex flex-col space-y-4">

            {/* Dynamic pH Spectrum Bar */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary">pH Spectrum Bar</h3>

              <div className="relative h-12 rounded-xl overflow-hidden shadow-inner bg-gradient-to-r from-red-600 via-amber-500 via-emerald-400 via-blue-500 to-purple-600">
                {/* Pointer indicator */}
                <div
                  className="absolute top-0 bottom-0 w-2 bg-white shadow-lg border-2 border-slate-900 transition-all duration-150"
                  style={{ left: `${(ph / 14) * 100}%` }}
                />
              </div>

              <div className="flex justify-between text-xs font-mono text-muted-foreground px-1">
                <span>0 (Acidic)</span>
                <span>7 (Neutral)</span>
                <span>14 (Alkaline)</span>
              </div>
            </div>

            {/* Educational Notes */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-2 shadow-sm">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" /> Educational Principles: Logarithmic pH Scale
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                pH is defined as $\text{pH} = -\log_{10}[H^+]$. Because it is logarithmic, a change of 1 pH unit represents a 10-fold change in hydrogen ion concentration!
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
