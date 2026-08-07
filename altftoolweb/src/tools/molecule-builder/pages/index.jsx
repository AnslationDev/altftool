"use client";

import React, { useState, useEffect, useRef } from "react";
import { Atom, RotateCcw, Plus, Info } from "lucide-react";

const ATOM_TYPES = {
  H: { name: "Hydrogen", sym: "H", valency: 1, mass: 1.008, color: "#F8FAFC", r: 16 },
  C: { name: "Carbon", sym: "C", valency: 4, mass: 12.011, color: "#334155", r: 24 },
  O: { name: "Oxygen", sym: "O", valency: 2, mass: 15.999, color: "#EF4444", r: 22 },
  N: { name: "Nitrogen", sym: "N", valency: 3, mass: 14.007, color: "#3B82F6", r: 22 },
  Cl: { name: "Chlorine", sym: "Cl", valency: 1, mass: 35.45, color: "#10B981", r: 24 },
};

const PRESETS = [
  {
    name: "Water (H₂O)",
    formula: "H₂O",
    molWeight: "18.015",
    geometry: "Bent (~104.5°)",
    atoms: [
      { id: 1, type: "O", x: 250, y: 180 },
      { id: 2, type: "H", x: 180, y: 220 },
      { id: 3, type: "H", x: 320, y: 220 },
    ],
    bonds: [{ a1: 1, a2: 2 }, { a1: 1, a2: 3 }],
  },
  {
    name: "Methane (CH₄)",
    formula: "CH₄",
    molWeight: "16.04",
    geometry: "Tetrahedral (109.5°)",
    atoms: [
      { id: 1, type: "C", x: 250, y: 180 },
      { id: 2, type: "H", x: 250, y: 100 },
      { id: 3, type: "H", x: 170, y: 220 },
      { id: 4, type: "H", x: 330, y: 220 },
      { id: 5, type: "H", x: 250, y: 260 },
    ],
    bonds: [{ a1: 1, a2: 2 }, { a1: 1, a2: 3 }, { a1: 1, a2: 4 }, { a1: 1, a2: 5 }],
  },
  {
    name: "Carbon Dioxide (CO₂)",
    formula: "CO₂",
    molWeight: "44.01",
    geometry: "Linear (180°)",
    atoms: [
      { id: 1, type: "C", x: 250, y: 180 },
      { id: 2, type: "O", x: 150, y: 180 },
      { id: 3, type: "O", x: 350, y: 180 },
    ],
    bonds: [{ a1: 1, a2: 2, order: 2 }, { a1: 1, a2: 3, order: 2 }],
  },
  {
    name: "Ammonia (NH₃)",
    formula: "NH₃",
    molWeight: "17.03",
    geometry: "Trigonal Pyramidal (107°)",
    atoms: [
      { id: 1, type: "N", x: 250, y: 160 },
      { id: 2, type: "H", x: 180, y: 230 },
      { id: 3, type: "H", x: 250, y: 250 },
      { id: 4, type: "H", x: 320, y: 230 },
    ],
    bonds: [{ a1: 1, a2: 2 }, { a1: 1, a2: 3 }, { a1: 1, a2: 4 }],
  },
];

export default function MoleculeBuilder() {
  const [atoms, setAtoms] = useState(PRESETS[0].atoms);
  const [bonds, setBonds] = useState(PRESETS[0].bonds);
  const [selectedAtomId, setSelectedAtomId] = useState(null);
  const [currentPreset, setCurrentPreset] = useState(PRESETS[0]);

  const canvasRef = useRef(null);
  const draggingIdRef = useRef(null);

  const handleReset = () => {
    setAtoms(PRESETS[0].atoms);
    setBonds(PRESETS[0].bonds);
    setCurrentPreset(PRESETS[0]);
    setSelectedAtomId(null);
  };

  const handlePresetSelect = (p) => {
    setAtoms(p.atoms);
    setBonds(p.bonds);
    setCurrentPreset(p);
    setSelectedAtomId(null);
  };

  const addAtom = (type) => {
    const newAtom = {
      id: Date.now(),
      type,
      x: 150 + Math.random() * 200,
      y: 150 + Math.random() * 100,
    };
    setAtoms((prev) => [...prev, newAtom]);
    setCurrentPreset(null);
  };

  // Calculate total molecular weight
  const totalWeight = atoms.reduce((sum, a) => sum + (ATOM_TYPES[a.type]?.mass || 0), 0);

  // Canvas Drawing & Dragging Interaction
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

    // 1. Draw Bonds
    bonds.forEach((b) => {
      const a1 = atoms.find((a) => a.id === b.a1);
      const a2 = atoms.find((a) => a.id === b.a2);
      if (!a1 || !a2) return;

      ctx.strokeStyle = "#94A3B8";
      ctx.lineWidth = b.order === 2 ? 6 : 3;

      ctx.beginPath();
      ctx.moveTo(a1.x, a1.y);
      ctx.lineTo(a2.x, a2.y);
      ctx.stroke();
    });

    // 2. Draw Atoms
    atoms.forEach((a) => {
      const info = ATOM_TYPES[a.type] || ATOM_TYPES.H;

      ctx.fillStyle = info.color;
      ctx.shadowColor = info.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(a.x, a.y, info.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = selectedAtomId === a.id ? "#14B8A6" : "#ffffff";
      ctx.lineWidth = selectedAtomId === a.id ? 3 : 1.5;
      ctx.stroke();

      ctx.fillStyle = a.type === "H" ? "#0F172A" : "#ffffff";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(a.type, a.x, a.y);
    });
  }, [atoms, bonds, selectedAtomId]);

  const handlePointerDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clicked = atoms.find((a) => {
      const r = ATOM_TYPES[a.type]?.r || 20;
      const dx = x - a.x;
      const dy = y - a.y;
      return Math.sqrt(dx * dx + dy * dy) <= r;
    });

    if (clicked) {
      draggingIdRef.current = clicked.id;
      e.currentTarget.setPointerCapture(e.pointerId);
      if (selectedAtomId && selectedAtomId !== clicked.id) {
        // Toggle bond between selected and clicked
        setBonds((prev) => {
          const exists = prev.find(
            (b) => (b.a1 === selectedAtomId && b.a2 === clicked.id) || (b.a1 === clicked.id && b.a2 === selectedAtomId)
          );
          if (exists) {
            return prev.filter((b) => b !== exists);
          }
          return [...prev, { a1: selectedAtomId, a2: clicked.id, order: 1 }];
        });
        setSelectedAtomId(null);
        setCurrentPreset(null);
      } else {
        setSelectedAtomId(clicked.id);
      }
    } else {
      setSelectedAtomId(null);
    }
  };

  const handlePointerMove = (e) => {
    if (!draggingIdRef.current || e.buttons !== 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setAtoms((prev) => prev.map((a) => (a.id === draggingIdRef.current ? { ...a, x, y } : a)));
  };

  const handlePointerUp = () => {
    draggingIdRef.current = null;
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
              <span className="text-xs text-muted-foreground">Molecular Geometry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
              Molecule Builder
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Construct molecules, form covalent bonds, calculate molecular weights, and explore VSEPR shapes.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold border border-border bg-card hover:bg-surface-soft transition"
            >
              <RotateCcw className="w-4 h-4" /> Reset Workspace
            </button>
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Controls & Atom Palette (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Atom Elements
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(ATOM_TYPES).map((sym) => (
                  <button
                    key={sym}
                    onClick={() => addAtom(sym)}
                    className="px-3 py-2 rounded-lg text-xs font-bold border border-border bg-surface-soft hover:bg-primary/20 hover:border-primary transition flex flex-col items-center justify-center gap-0.5"
                  >
                    <span className="text-base">{sym}</span>
                    <span className="text-[10px] text-muted-foreground font-normal">{ATOM_TYPES[sym].name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Presets Card */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary">Preset Molecules</h2>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => handlePresetSelect(p)}
                    className={`px-3 py-2 rounded-lg border text-left font-medium transition ${
                      currentPreset?.name === p.name ? "bg-primary text-white border-primary" : "border-border hover:bg-surface-soft"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Molecule Properties Card */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Atom className="w-4 h-4" /> Structure Properties
              </h2>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Molecular Weight</div>
                  <div className="text-sm font-bold font-mono text-foreground mt-0.5" aria-live="polite">
                    {totalWeight.toFixed(2)} g/mol
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">VSEPR Shape</div>
                  <div className="text-xs font-bold text-foreground mt-0.5" aria-live="polite">
                    {currentPreset?.geometry || "Custom"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Canvas Workspace (8 cols) */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            <div
              className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-sm flex-1 min-h-[440px] cursor-pointer"
              role="application"
              aria-label="Molecule builder canvas: click two atoms to bond, drag to reposition"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              <canvas ref={canvasRef} className="w-full h-full block" />
              <div className="absolute top-3 left-4 text-xs font-mono bg-card/80 backdrop-blur border border-border px-3 py-1 rounded-lg text-muted-foreground">
                Click 2 atoms to connect/disconnect covalent bonds. Drag atoms to move.
              </div>
            </div>

            {/* Educational Notes */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-2 shadow-sm">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" /> Educational Principles: Covalent Bonding
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Atoms share valence electrons to complete their outer octet shell (2 electrons for H, 8 for C, N, O, Cl). VSEPR theory dictates molecular geometry based on electron pair repulsion around the central atom.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
