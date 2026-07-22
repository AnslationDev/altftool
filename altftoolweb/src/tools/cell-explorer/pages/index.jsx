"use client";

import React, { useState, useEffect, useRef } from "react";
import { Dna, RotateCcw, Info, Sparkles, Layers } from "lucide-react";

const ANIMAL_ORGANELLES = [
  { id: "nucleus", name: "Nucleus", color: "#EC4899", cx: 250, cy: 180, r: 40, func: "Houses genomic DNA and directs cellular protein synthesis.", fact: "The nucleolus inside produces ribosomes." },
  { id: "mitochondria", name: "Mitochondria", color: "#F59E0B", cx: 160, cy: 120, r: 25, func: "Powerhouse generating ATP through oxidative phosphorylation.", fact: "Contains its own independent circular DNA inherited maternally." },
  { id: "er", name: "Endoplasmic Reticulum", color: "#8B5CF6", cx: 340, cy: 160, r: 30, func: "Rough ER folds proteins; Smooth ER synthesizes lipids.", fact: "Spans up to 50% of total internal cell membrane area." },
  { id: "golgi", name: "Golgi Apparatus", color: "#10B981", cx: 200, cy: 260, r: 28, func: "Modifies, sorts, and packages proteins into vesicles.", fact: "Named after Italian biologist Camillo Golgi who discovered it in 1898." },
  { id: "lysosome", name: "Lysosomes", color: "#EF4444", cx: 320, cy: 260, r: 18, func: "Contains hydrolytic enzymes to digest waste and worn-out organelles.", fact: "Operates at acidic pH (~4.5 - 5.0)." },
  { id: "membrane", name: "Cell Membrane", color: "#14B8A6", cx: 250, cy: 200, r: 160, isOutline: true, func: "Selective phospholipid bilayer regulating molecular transport.", fact: "Exhibits fluid mosaic behavior at body temperature." },
];

const PLANT_ORGANELLES = [
  { id: "nucleus", name: "Nucleus", color: "#EC4899", cx: 220, cy: 160, r: 35, func: "Houses DNA and controls genetic transcription.", fact: "Enclosed by a double membrane with nuclear pores." },
  { id: "chloroplast", name: "Chloroplast", color: "#22C55E", cx: 150, cy: 120, r: 28, func: "Converts solar photon energy into chemical glucose via photosynthesis.", fact: "Filled with thylakoid stacks called grana containing chlorophyll." },
  { id: "vacuole", name: "Central Vacuole", color: "#3B82F6", cx: 320, cy: 220, r: 55, func: "Maintains turgor pressure and stores water and nutrients.", fact: "Can occupy up to 90% of a mature plant cell's volume." },
  { id: "mitochondria", name: "Mitochondria", color: "#F59E0B", cx: 160, cy: 270, r: 22, func: "Breaks down glucose into ATP energy for cellular work.", fact: "Plant cells have both chloroplasts and mitochondria." },
  { id: "cellwall", name: "Cell Wall", color: "#15803D", cx: 250, cy: 200, r: 170, isOutline: true, isSquare: true, func: "Rigid outer cellulose layer providing structural support and shape.", fact: "Prevents the plant cell from bursting when water enters via osmosis." },
];

export default function CellExplorer() {
  const [cellType, setCellType] = useState("animal"); // 'animal' | 'plant'
  const [selectedId, setSelectedId] = useState("nucleus");

  const canvasRef = useRef(null);

  const organelles = cellType === "animal" ? ANIMAL_ORGANELLES : PLANT_ORGANELLES;
  const activeOrganelle = organelles.find((o) => o.id === selectedId) || organelles[0];

  const handleReset = () => {
    setCellType("animal");
    setSelectedId("nucleus");
  };

  // Canvas Interactive Diagram Render
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

    // 1. Draw Outer Membrane / Cell Wall
    const outline = organelles.find((o) => o.isOutline);
    if (outline) {
      ctx.strokeStyle = outline.color;
      ctx.lineWidth = 6;
      ctx.fillStyle = cellType === "animal" ? "rgba(20, 184, 166, 0.05)" : "rgba(34, 197, 94, 0.05)";

      ctx.beginPath();
      if (outline.isSquare) {
        ctx.roundRect(40, 20, w - 80, h - 40, 30);
      } else {
        ctx.ellipse(w / 2, h / 2, w * 0.42, h * 0.42, 0, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.stroke();
    }

    // 2. Draw Internal Organelles
    organelles.forEach((o) => {
      if (o.isOutline) return;

      const isSel = selectedId === o.id;

      ctx.fillStyle = o.color;
      ctx.shadowColor = o.color;
      ctx.shadowBlur = isSel ? 15 : 0;

      ctx.beginPath();
      ctx.arc(o.cx, o.cy, o.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = isSel ? "#ffffff" : "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = isSel ? 3 : 1.5;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(o.name, o.cx, o.cy + 4);
    });

  }, [cellType, selectedId, organelles]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clicked = organelles.find((o) => {
      if (o.isOutline) return false;
      const dx = x - o.cx;
      const dy = y - o.cy;
      return Math.sqrt(dx * dx + dy * dy) <= o.r;
    });

    if (clicked) setSelectedId(clicked.id);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Hero Section */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                Science / Biology
              </span>
              <span className="text-xs text-muted-foreground">Cytology & Cell Physiology</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
              Cell Explorer
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Interactive structural diagram of animal and plant cells with organelle metabolism functions and biological facts.
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

          {/* Controls & Organelle List (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Layers className="w-4 h-4" /> Cell Type Selector
              </h2>

              {/* Cell Type Toggle */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setCellType("animal"); setSelectedId("nucleus"); }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border text-center transition ${
                    cellType === "animal" ? "bg-primary text-white border-primary" : "border-border hover:bg-surface-soft"
                  }`}
                >
                  Animal Cell
                </button>
                <button
                  onClick={() => { setCellType("plant"); setSelectedId("nucleus"); }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border text-center transition ${
                    cellType === "plant" ? "bg-primary text-white border-primary" : "border-border hover:bg-surface-soft"
                  }`}
                >
                  Plant Cell
                </button>
              </div>

              {/* Organelle Select Buttons */}
              <div>
                <label className="text-xs font-semibold mb-1.5 block">Organelles</label>
                <div className="space-y-1.5">
                  {organelles.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setSelectedId(o.id)}
                      className={`w-full px-3 py-2 rounded-lg text-xs font-medium border text-left flex items-center justify-between transition ${
                        selectedId === o.id ? "bg-primary text-white border-primary" : "border-border hover:bg-surface-soft"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: o.color }} />
                        {o.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Organelle Info Card */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
              <div className="border-b border-border pb-2">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full inline-block" style={{ backgroundColor: activeOrganelle.color }} />
                  {activeOrganelle.name}
                </h2>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-bold text-primary block">Metabolic Function:</span>
                  <p className="text-muted-foreground leading-relaxed mt-0.5">{activeOrganelle.func}</p>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <span className="font-bold text-amber-400 block flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Biological Fact:
                  </span>
                  <p className="text-muted-foreground leading-relaxed mt-0.5">{activeOrganelle.fact}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Cell Canvas (8 cols) */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            <div
              className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-sm flex-1 min-h-[440px] cursor-pointer"
              onClick={handleCanvasClick}
            >
              <canvas ref={canvasRef} className="w-full h-full block" />
              <div className="absolute top-3 left-4 text-xs font-mono bg-card/80 backdrop-blur border border-border px-3 py-1 rounded-lg text-muted-foreground">
                Click any organelle on diagram to inspect function
              </div>
            </div>

            {/* Educational Notes */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-2 shadow-sm">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" /> Educational Principles: Eukaryotic Cells
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Plant cells differ from animal cells by possessing a rigid cellulose cell wall, large central vacuole for turgor pressure, and chloroplasts for photosynthesis.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
