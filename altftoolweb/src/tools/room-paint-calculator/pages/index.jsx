"use client";

import { useMemo, useState } from "react";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";

const PAINT_TYPES = {
  emulsion: { label: "Interior Emulsion", coverage: 11, pricePerLiter: 220 },
  enamel: { label: "Enamel", coverage: 13, pricePerLiter: 280 },
  distemper: { label: "Distemper", coverage: 9, pricePerLiter: 120 },
  texture: { label: "Texture Finish", coverage: 6, pricePerLiter: 420 },
};

const COLOR_THEMES = [
  { name: "Modern Calm", wall: "#E5E7EB", trim: "#FFFFFF", accent: "#1F2937", ceiling: "#F9FAFB", finish: "Matte walls + Satin trim" },
  { name: "Warm Earth", wall: "#D6C2A1", trim: "#F5EFE6", accent: "#8B5E3C", ceiling: "#FFF8EE", finish: "Eggshell walls + Satin trim" },
  { name: "Luxury Blue", wall: "#CBD5E1", trim: "#E2E8F0", accent: "#1E3A8A", ceiling: "#F8FAFC", finish: "Velvet matte walls + Semi-gloss accent" },
  { name: "Fresh Nature", wall: "#D1E7DD", trim: "#F0FFF4", accent: "#2F855A", ceiling: "#FAFFFC", finish: "Low-sheen walls + Durable satin trim" },
  { name: "Bold Contrast", wall: "#F3F4F6", trim: "#111827", accent: "#DC2626", ceiling: "#FFFFFF", finish: "Matte walls + Gloss accents" },
  { name: "Soft Minimal", wall: "#F5F5F4", trim: "#E7E5E4", accent: "#78716C", ceiling: "#FAFAF9", finish: "Flat walls + Satin trims" },
];

const CAN_SIZES = [20, 10, 4, 1];

function blankRoom(id) {
  return {
    id,
    name: "",
    length: "",
    width: "",
    height: "",
    doors: "",
    windows: "",
    doorArea: "",
    windowArea: "",
    includeCeiling: true,
  };
}

function toNum(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function calcRoomArea(room) {
  const l = toNum(room.length);
  const w = toNum(room.width);
  const h = toNum(room.height);
  const wallArea = 2 * (l + w) * h;
  const openingArea = toNum(room.doors) * toNum(room.doorArea) + toNum(room.windows) * toNum(room.windowArea);
  const netWallArea = Math.max(0, wallArea - openingArea);
  const ceilingArea = room.includeCeiling ? l * w : 0;
  return { wallArea, openingArea, netWallArea, ceilingArea, totalArea: netWallArea + ceilingArea };
}

function canPlan(litersNeeded) {
  let remaining = Math.ceil(litersNeeded * 100) / 100;
  const result = [];
  CAN_SIZES.forEach((size) => {
    const qty = Math.floor(remaining / size);
    if (qty > 0) {
      result.push({ size, qty, liters: size * qty });
      remaining = Number((remaining - size * qty).toFixed(2));
    }
  });
  if (remaining > 0) result.push({ size: 1, qty: Math.ceil(remaining), liters: Math.ceil(remaining) });
  return result;
}

export default function ToolHome() {
  const [rooms, setRooms] = useState([blankRoom(1)]);
  const [paintType, setPaintType] = useState("");
  const [coverage, setCoverage] = useState("");
  const [pricePerLiter, setPricePerLiter] = useState("");
  const [wallCoats, setWallCoats] = useState("");
  const [ceilingCoats, setCeilingCoats] = useState("");
  const [primerCoats, setPrimerCoats] = useState("");
  const [wastagePercent, setWastagePercent] = useState("");
  const [laborRate, setLaborRate] = useState("");
  const [contingencyPercent, setContingencyPercent] = useState("");

  const updateRoom = (id, key, value) => setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
  const addRoom = () => setRooms((prev) => [...prev, blankRoom(prev.length + 1)]);
  const removeRoom = (id) => setRooms((prev) => (prev.length === 1 ? prev : prev.filter((r) => r.id !== id)));

  const onPaintTypeChange = (type) => {
    setPaintType(type);
    if (!type) return;
    setCoverage((old) => old || String(PAINT_TYPES[type].coverage));
    setPricePerLiter((old) => old || String(PAINT_TYPES[type].pricePerLiter));
  };

  const summary = useMemo(() => {
    const roomBreakdown = rooms.map((room) => ({ room, ...calcRoomArea(room) }));
    const netWallArea = roomBreakdown.reduce((a, r) => a + r.netWallArea, 0);
    const ceilingArea = roomBreakdown.reduce((a, r) => a + r.ceilingArea, 0);
    const totalPaintable = netWallArea + ceilingArea;
    const cov = Math.max(1, toNum(coverage, 1));
    const wc = Math.max(1, toNum(wallCoats, 1));
    const cc = Math.max(0, toNum(ceilingCoats, 0));
    const pc = Math.max(0, toNum(primerCoats, 0));
    const wasteFactor = 1 + Math.max(0, toNum(wastagePercent, 0)) / 100;
    const wallLiters = (netWallArea * wc) / cov;
    const ceilingLiters = (ceilingArea * cc) / cov;
    const primerLiters = (totalPaintable * pc) / cov;
    const totalLiters = (wallLiters + ceilingLiters + primerLiters) * wasteFactor;
    const rate = Math.max(0, toNum(pricePerLiter, 0));
    const paintCost = totalLiters * rate;
    const laborCost = totalPaintable * Math.max(0, toNum(laborRate, 0));
    const subTotal = paintCost + laborCost;
    const contingency = subTotal * (Math.max(0, toNum(contingencyPercent, 0)) / 100);
    const totalCost = subTotal + contingency;
    return {
      roomBreakdown, netWallArea, ceilingArea, totalPaintable, wallLiters, ceilingLiters, primerLiters,
      totalLiters, canDistribution: canPlan(totalLiters), paintCost, laborCost, contingency, totalCost,
    };
  }, [rooms, coverage, wallCoats, ceilingCoats, primerCoats, wastagePercent, pricePerLiter, laborRate, contingencyPercent]);

  return (
    <div className="px-4 py-6 rpc-shell">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="heading animate-fade-up">Room Paint Calculator</h1>
          <p className="description mt-1 text-(--secondary) text-2xl animate-fade-up">
            Estimate paint quantity, cost, and shopping list with professional planning controls.
          </p>
        </div>

        <div className="rounded-2xl rpc-main-card overflow-hidden">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Room Inputs</h2>
              <button onClick={addRoom} className="px-4 py-2 rounded-lg font-semibold rpc-btn-primary">+ Add Room</button>
            </div>

            <div className="space-y-4">
              {rooms.map((room, idx) => (
                <div key={room.id} className="rounded-xl rpc-panel p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <input value={room.name} onChange={(e) => updateRoom(room.id, "name", e.target.value)} placeholder={`Room ${idx + 1} name`} className="w-full max-w-xs px-3 py-2 rpc-field" />
                    <button onClick={() => removeRoom(room.id)} className="px-3 py-2 rounded-lg rpc-field">Remove</button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <input value={room.length} onChange={(e) => updateRoom(room.id, "length", e.target.value)} placeholder="Length (ft)" className="px-3 py-2 rpc-field" />
                    <input value={room.width} onChange={(e) => updateRoom(room.id, "width", e.target.value)} placeholder="Width (ft)" className="px-3 py-2 rpc-field" />
                    <input value={room.height} onChange={(e) => updateRoom(room.id, "height", e.target.value)} placeholder="Height (ft)" className="px-3 py-2 rpc-field" />
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={room.includeCeiling} onChange={(e) => updateRoom(room.id, "includeCeiling", e.target.checked)} /> Include Ceiling</label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                    <input value={room.doors} onChange={(e) => updateRoom(room.id, "doors", e.target.value)} placeholder="No. Doors" className="px-3 py-2 rpc-field" />
                    <input value={room.windows} onChange={(e) => updateRoom(room.id, "windows", e.target.value)} placeholder="No. Windows" className="px-3 py-2 rpc-field" />
                    <input value={room.doorArea} onChange={(e) => updateRoom(room.id, "doorArea", e.target.value)} placeholder="Door area each (sqft)" className="px-3 py-2 rpc-field" />
                    <input value={room.windowArea} onChange={(e) => updateRoom(room.id, "windowArea", e.target.value)} placeholder="Window area each (sqft)" className="px-3 py-2 rpc-field" />
                  </div>
                </div>
              ))}
            </div>

            <h2 className="text-xl font-bold pt-2">Paint and Cost Strategy</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <select value={paintType} onChange={(e) => onPaintTypeChange(e.target.value)} className="px-3 py-2 rpc-field">
                <option value="">Select paint type</option>
                {Object.entries(PAINT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <input value={coverage} onChange={(e) => setCoverage(e.target.value)} placeholder="Coverage (sqft/liter)" className="px-3 py-2 rpc-field" />
              <input value={pricePerLiter} onChange={(e) => setPricePerLiter(e.target.value)} placeholder="Price per liter" className="px-3 py-2 rpc-field" />
              <input value={wastagePercent} onChange={(e) => setWastagePercent(e.target.value)} placeholder="Wastage %" className="px-3 py-2 rpc-field" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <input value={wallCoats} onChange={(e) => setWallCoats(e.target.value)} placeholder="Wall coats" className="px-3 py-2 rpc-field" />
              <input value={ceilingCoats} onChange={(e) => setCeilingCoats(e.target.value)} placeholder="Ceiling coats" className="px-3 py-2 rpc-field" />
              <input value={primerCoats} onChange={(e) => setPrimerCoats(e.target.value)} placeholder="Primer coats" className="px-3 py-2 rpc-field" />
              <input value={laborRate} onChange={(e) => setLaborRate(e.target.value)} placeholder="Labor Rate (₹/sqft)" className="px-3 py-2 rpc-field" />
              <input value={contingencyPercent} onChange={(e) => setContingencyPercent(e.target.value)} placeholder="Contingency %" className="px-3 py-2 rpc-field" />
            </div>

            <div className="rounded-xl border border-(--border) bg-(--background) p-4">
              <h3 className="font-semibold mb-3">Color Combination Suggestions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {COLOR_THEMES.map((theme) => (
                  <div key={theme.name} className="rounded-xl border border-(--border) bg-(--card) p-3">
                    <p className="font-semibold text-sm mb-2">{theme.name}</p>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      {[theme.wall, theme.trim, theme.accent, theme.ceiling].map((c) => <div key={c} className="h-8 rounded" style={{ background: c }} />)}
                    </div>
                    <p className="text-xs text-(--muted-foreground)">Wall {theme.wall} | Trim {theme.trim}</p>
                    <p className="text-xs text-(--muted-foreground)">Accent {theme.accent} | Ceiling {theme.ceiling}</p>
                    <p className="text-xs mt-1 text-(--primary)">{theme.finish}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="rounded-xl border border-(--border) bg-(--background) p-4"><p className="text-xs uppercase text-(--muted-foreground)">Total Paintable Area</p><p className="text-2xl font-bold">{summary.totalPaintable.toFixed(1)} sqft</p></div>
              <div className="rounded-xl border border-(--border) bg-(--background) p-4"><p className="text-xs uppercase text-(--muted-foreground)">Total Paint Needed</p><p className="text-2xl font-bold">{summary.totalLiters.toFixed(2)} L</p></div>
              <div className="rounded-xl border border-(--border) bg-(--background) p-4"><p className="text-xs uppercase text-(--muted-foreground)">Paint Cost</p><p className="text-2xl font-bold">₹{summary.paintCost.toFixed(0)}</p></div>
              <div className="rounded-xl border border-(--border) bg-(--background) p-4"><p className="text-xs uppercase text-(--muted-foreground)">Labor Amount</p><p className="text-2xl font-bold">₹{summary.laborCost.toFixed(0)}</p></div>
            </div>

            <div className="rounded-xl border border-(--border) bg-(--background) p-4">
              <p className="text-xs uppercase text-(--muted-foreground)">Total Amount</p>
              <p className="text-3xl font-bold text-(--primary)">₹{summary.totalCost.toFixed(0)}</p>
              <p className="text-sm text-(--muted-foreground) mt-1">Total = Paint Cost + Labor Amount + Contingency</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-xl border border-(--border) bg-(--background) p-4">
                <h3 className="font-semibold mb-2">Shopping List (Can Sizes)</h3>
                <div className="space-y-2 text-sm">{summary.canDistribution.map((c, i) => <p key={`${c.size}-${i}`}>{c.qty} x {c.size}L can ({c.liters}L)</p>)}</div>
              </div>
              <div className="rounded-xl border border-(--border) bg-(--background) p-4">
                <h3 className="font-semibold mb-2">Cost Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <p>Paint materials: ₹{summary.paintCost.toFixed(0)}</p>
                  <p>Labor: ₹{summary.laborCost.toFixed(0)}</p>
                  <p>Contingency: ₹{summary.contingency.toFixed(0)}</p>
                  <p className="font-semibold pt-1">Estimated total: ₹{summary.totalCost.toFixed(0)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-(--border) bg-(--background) p-4">
              <h3 className="font-semibold mb-3">Room-by-Room Area Summary</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left border-b border-(--border)"><th className="py-2">Room</th><th className="py-2">Net Walls</th><th className="py-2">Ceiling</th><th className="py-2">Total</th></tr></thead>
                  <tbody>
                    {summary.roomBreakdown.map((r, idx) => (
                      <tr key={r.room.id} className="border-b border-(--border)">
                        <td className="py-2">{r.room.name || `Room ${idx + 1}`}</td>
                        <td className="py-2">{r.netWallArea.toFixed(1)} sqft</td>
                        <td className="py-2">{r.ceilingArea.toFixed(1)} sqft</td>
                        <td className="py-2 font-medium">{r.totalArea.toFixed(1)} sqft</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <HowItWorks />
        <Features />
      </div>
    </div>
  );
}
