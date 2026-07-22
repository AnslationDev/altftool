"use client";

import React, { useState, useEffect, useRef } from "react";
import { Dna, RotateCcw, Play, Pause, Sliders, Info, Sparkles } from "lucide-react";

const BASE_PAIRS = [
  { pair: "A-T", name: "Adenine – Thymine", hBonds: 2, color1: "#EF4444", color2: "#10B981" },
  { pair: "G-C", name: "Guanine – Cytosine", hBonds: 3, color1: "#3B82F6", color2: "#F59E0B" },
  { pair: "T-A", name: "Thymine – Adenine", hBonds: 2, color1: "#10B981", color2: "#EF4444" },
  { pair: "C-G", name: "Cytosine – Guanine", hBonds: 3, color1: "#F59E0B", color2: "#3B82F6" },
];

export default function DnaDoubleHelixExplorer() {
  const [rotSpeed, setRotSpeed] = useState(1);
  const [isRotating, setIsRotating] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'basepairs' | 'replication'

  const canvasRef = useRef(null);
  const angleRef = useRef(0);
  const animRef = useRef(null);

  const numRungs = 16;

  const handleReset = () => {
    setRotSpeed(1);
    setIsRotating(true);
    setActiveTab("overview");
  };

  // Canvas Render Loop
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

      ctx.clearRect(0, 0, w, h);

      if (isRotating) {
        angleRef.current += 0.03 * rotSpeed;
      }

      const rungSpacing = (h - 80) / numRungs;
      const radius = 90;

      // Draw Helix strands & Base pairs from Top to Bottom
      for (let i = 0; i < numRungs; i++) {
        const y = 40 + i * rungSpacing;
        const phase = angleRef.current + i * 0.4;

        const x1 = cx + Math.sin(phase) * radius;
        const x2 = cx - Math.sin(phase) * radius;

        const z1 = Math.cos(phase);
        const z2 = -Math.cos(phase);

        const bpInfo = BASE_PAIRS[i % BASE_PAIRS.length];

        // Draw Base Pair Rung
        ctx.strokeStyle = bpInfo.color1;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(cx, y);
        ctx.stroke();

        ctx.strokeStyle = bpInfo.color2;
        ctx.beginPath();
        ctx.moveTo(cx, y);
        ctx.lineTo(x2, y);
        ctx.stroke();

        // Draw Hydrogen Bond dots at center
        ctx.fillStyle = "#ffffff";
        for (let b = 0; b < bpInfo.hBonds; b++) {
          ctx.beginPath();
          ctx.arc(cx - 6 + b * 6, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw Strand 1 Node (Sugar-Phosphate Backbone)
        ctx.fillStyle = z1 > 0 ? "#14B8A6" : "#0F766E";
        ctx.beginPath();
        ctx.arc(x1, y, 7 + z1 * 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw Strand 2 Node
        ctx.fillStyle = z2 > 0 ? "#22D3EE" : "#0891B2";
        ctx.beginPath();
        ctx.arc(x2, y, 7 + z2 * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animRef.current);
  }, [isRotating, rotSpeed, activeTab]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Hero Section */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                Science / Molecular Genetics
              </span>
              <span className="text-xs text-muted-foreground">Genomics & Nucleic Acids</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
              DNA Double Helix Explorer
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Interactive 3D double helix model exploring complementary base pairing, hydrogen bonding, and backbone antiparallelism.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRotating(!isRotating)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-primary text-white hover:bg-primary/90 transition shadow-md"
            >
              {isRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRotating ? "Pause Rotation" : "Rotate Helix"}
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
                <Sliders className="w-4 h-4" /> Helix Controls
              </h2>

              {/* Rotation Speed */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Rotation Velocity</span>
                  <span className="text-primary font-mono">{rotSpeed}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3"
                  step="0.2"
                  value={rotSpeed}
                  onChange={(e) => setRotSpeed(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* View Mode */}
              <div>
                <label className="text-xs font-semibold mb-1.5 block">Exploration View</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    { id: "overview", label: "Structural 3D View" },
                    { id: "basepairs", label: "Base Pairing Rules" },
                    { id: "replication", label: "Semiconservative Replication" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition ${
                        activeTab === tab.id ? "bg-primary text-white border-primary" : "border-border hover:bg-surface-soft"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Base Pair Legend Card */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Dna className="w-4 h-4" /> Nucleotide Base Pairs
              </h2>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-surface-soft border border-border flex items-center justify-between">
                  <span className="flex items-center gap-2 font-bold">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Adenine (A) – Thymine (T)
                  </span>
                  <span className="font-mono text-primary font-bold">2 H-Bonds</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-soft border border-border flex items-center justify-between">
                  <span className="flex items-center gap-2 font-bold">
                    <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Guanine (G) – Cytosine (C)
                  </span>
                  <span className="font-mono text-primary font-bold">3 H-Bonds</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Helix Canvas (8 cols) */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            <div className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-sm flex-1 min-h-[440px]">
              <canvas ref={canvasRef} className="w-full h-full block" />
              <div className="absolute top-3 left-4 text-xs font-mono bg-card/80 backdrop-blur border border-border px-3 py-1 rounded-lg text-primary font-bold">
                Antiparallel Strands (5' ➔ 3' and 3' ➔ 5')
              </div>
            </div>

            {/* Educational Notes */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-2 shadow-sm">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" /> Educational Principles: Watson-Crick Model
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Discovered by Watson, Crick, and Franklin in 1953, DNA consists of two complementary right-handed helical chains. Adenine always pairs with Thymine via 2 hydrogen bonds, while Guanine pairs with Cytosine via 3 hydrogen bonds.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
