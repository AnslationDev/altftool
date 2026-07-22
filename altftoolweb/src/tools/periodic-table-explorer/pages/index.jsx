"use client";

import React, { useState, useMemo } from "react";
import { Grid, Search, RotateCcw, Info, Sparkles, Filter } from "lucide-react";

// Representative 118 Elements Dataset with Periodic Table Grid Coordinates
const ELEMENTS = [
  { n: 1, sym: "H", name: "Hydrogen", mass: 1.008, cat: "Nonmetal", group: 1, period: 1, eConfig: "1s¹", melt: "-259.1 °C", boil: "-252.9 °C", density: "0.0899 g/L", disc: "1766", uses: "Rocket fuel, ammonia synthesis, fuel cells." },
  { n: 2, sym: "He", name: "Helium", mass: 4.0026, cat: "Noble Gas", group: 18, period: 1, eConfig: "1s²", melt: "-272.2 °C", boil: "-268.9 °C", density: "0.1786 g/L", disc: "1868", uses: "Cryogenic cooling, balloons, MRI magnets." },
  { n: 3, sym: "Li", name: "Lithium", mass: 6.94, cat: "Alkali Metal", group: 1, period: 2, eConfig: "[He] 2s¹", melt: "180.5 °C", boil: "1342 °C", density: "0.534 g/cm³", disc: "1817", uses: "Rechargeable Li-ion batteries, ceramics." },
  { n: 4, sym: "Be", name: "Beryllium", mass: 9.0122, cat: "Alkaline Earth", group: 2, period: 2, eConfig: "[He] 2s²", melt: "1287 °C", boil: "2469 °C", density: "1.85 g/cm³", disc: "1798", uses: "Aerospace mirrors, X-ray windows, alloys." },
  { n: 5, sym: "B", name: "Boron", mass: 10.81, cat: "Metalloid", group: 13, period: 2, eConfig: "[He] 2s² 2p¹", melt: "2076 °C", boil: "3927 °C", density: "2.34 g/cm³", disc: "1808", uses: "Pyrex glass, semiconductors, fiberglass." },
  { n: 6, sym: "C", name: "Carbon", mass: 12.011, cat: "Nonmetal", group: 14, period: 2, eConfig: "[He] 2s² 2p²", melt: "3550 °C", boil: "4027 °C", density: "2.26 g/cm³", disc: "Ancient", uses: "Organic life, steel manufacture, diamonds." },
  { n: 7, sym: "N", name: "Nitrogen", mass: 14.007, cat: "Nonmetal", group: 15, period: 2, eConfig: "[He] 2s² 2p³", melt: "-210.0 °C", boil: "-195.8 °C", density: "1.251 g/L", disc: "1772", uses: "Fertilizers, food preservation, explosives." },
  { n: 8, sym: "O", name: "Oxygen", mass: 15.999, cat: "Nonmetal", group: 16, period: 2, eConfig: "[He] 2s² 2p⁴", melt: "-218.8 °C", boil: "-183.0 °C", density: "1.429 g/L", disc: "1774", uses: "Cellular respiration, steelmaking, medical oxygen." },
  { n: 9, sym: "F", name: "Fluorine", mass: 18.998, cat: "Halogen", group: 17, period: 2, eConfig: "[He] 2s² 2p⁵", melt: "-219.7 °C", boil: "-188.1 °C", density: "1.696 g/L", disc: "1886", uses: "Toothpaste fluoride, Teflon, refrigerants." },
  { n: 10, sym: "Ne", name: "Neon", mass: 20.180, cat: "Noble Gas", group: 18, period: 2, eConfig: "[He] 2s² 2p⁶", melt: "-248.6 °C", boil: "-246.1 °C", density: "0.900 g/L", disc: "1898", uses: "Neon signage, high-voltage indicators, lasers." },
  { n: 11, sym: "Na", name: "Sodium", mass: 22.990, cat: "Alkali Metal", group: 1, period: 3, eConfig: "[Ne] 3s¹", melt: "97.8 °C", boil: "883 °C", density: "0.97 g/cm³", disc: "1807", uses: "Table salt (NaCl), street lamps, soap production." },
  { n: 12, sym: "Mg", name: "Magnesium", mass: 24.305, cat: "Alkaline Earth", group: 2, period: 3, eConfig: "[Ne] 3s²", melt: "650 °C", boil: "1090 °C", density: "1.74 g/cm³", disc: "1755", uses: "Lightweight automotive alloys, fireworks, medicine." },
  { n: 13, sym: "Al", name: "Aluminum", mass: 26.982, cat: "Post-Transition", group: 13, period: 3, eConfig: "[Ne] 3s² 3p¹", melt: "660.3 °C", boil: "2470 °C", density: "2.70 g/cm³", disc: "1825", uses: "Aircraft frames, beverage cans, foil wrapping." },
  { n: 14, sym: "Si", name: "Silicon", mass: 28.085, cat: "Metalloid", group: 14, period: 3, eConfig: "[Ne] 3s² 3p²", melt: "1414 °C", boil: "3265 °C", density: "2.33 g/cm³", disc: "1824", uses: "Microchips, solar panels, computer processors." },
  { n: 15, sym: "P", name: "Phosphorus", mass: 30.974, cat: "Nonmetal", group: 15, period: 3, eConfig: "[Ne] 3s² 3p³", melt: "44.15 °C", boil: "280.5 °C", density: "1.82 g/cm³", disc: "1669", uses: "Agricultural fertilizers, safety matches, DNA." },
  { n: 16, sym: "S", name: "Sulfur", mass: 32.06, cat: "Nonmetal", group: 16, period: 3, eConfig: "[Ne] 3s² 3p⁴", melt: "115.2 °C", boil: "444.6 °C", density: "2.07 g/cm³", disc: "Ancient", uses: "Sulfuric acid, rubber vulcanization, gunpowder." },
  { n: 17, sym: "Cl", name: "Chlorine", mass: 35.45, cat: "Halogen", group: 17, period: 3, eConfig: "[Ne] 3s² 3p⁵", melt: "-101.5 °C", boil: "-34.04 °C", density: "3.21 g/L", disc: "1774", uses: "Water sanitation, PVC plastics, disinfectants." },
  { n: 18, sym: "Ar", name: "Argon", mass: 39.948, cat: "Noble Gas", group: 18, period: 3, eConfig: "[Ne] 3s² 3p⁶", melt: "-189.3 °C", boil: "-185.8 °C", density: "1.784 g/L", disc: "1894", uses: "Shielding gas for welding, incandescent bulbs." },
  { n: 19, sym: "K", name: "Potassium", mass: 39.098, cat: "Alkali Metal", group: 1, period: 4, eConfig: "[Ar] 4s¹", melt: "63.5 °C", boil: "759 °C", density: "0.89 g/cm³", disc: "1807", uses: "Nerve signaling in body, crop fertilizers." },
  { n: 20, sym: "Ca", name: "Calcium", mass: 40.078, cat: "Alkaline Earth", group: 2, period: 4, eConfig: "[Ar] 4s²", melt: "842 °C", boil: "1484 °C", density: "1.55 g/cm³", disc: "1808", uses: "Human bones and teeth, cement & plaster." },
  { n: 26, sym: "Fe", name: "Iron", mass: 55.845, cat: "Transition Metal", group: 8, period: 4, eConfig: "[Ar] 3d⁶ 4s²", melt: "1538 °C", boil: "2862 °C", density: "7.87 g/cm³", disc: "Ancient", uses: "Structural steel, hemoglobin in red blood cells." },
  { n: 29, sym: "Cu", name: "Copper", mass: 63.546, cat: "Transition Metal", group: 11, period: 4, eConfig: "[Ar] 3d¹⁰ 4s¹", melt: "1085 °C", boil: "2562 °C", density: "8.96 g/cm³", disc: "Ancient", uses: "Electrical wiring, plumbing pipes, bronze alloys." },
  { n: 47, sym: "Ag", name: "Silver", mass: 107.87, cat: "Transition Metal", group: 11, period: 5, eConfig: "[Kr] 4d¹⁰ 5s¹", melt: "961.8 °C", boil: "2162 °C", density: "10.49 g/cm³", disc: "Ancient", uses: "Jewelry, solar panels, electronics contacts." },
  { n: 79, sym: "Au", name: "Gold", mass: 196.97, cat: "Transition Metal", group: 11, period: 6, eConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s¹", melt: "1064 °C", boil: "2970 °C", density: "19.30 g/cm³", disc: "Ancient", uses: "Bullion reserve, electronics plating, dentistry." },
  { n: 92, sym: "U", name: "Uranium", mass: 238.03, cat: "Actinide", group: 3, period: 7, eConfig: "[Rn] 5f³ 6d¹ 7s²", melt: "1135 °C", boil: "4131 °C", density: "19.1 g/cm³", disc: "1789", uses: "Nuclear power plants, radioisotopes." },
];

const CATEGORIES = [
  "All",
  "Alkali Metal",
  "Alkaline Earth",
  "Transition Metal",
  "Post-Transition",
  "Metalloid",
  "Nonmetal",
  "Halogen",
  "Noble Gas",
  "Actinide",
];

export default function PeriodicTableExplorer() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedElement, setSelectedElement] = useState(ELEMENTS[5]); // Carbon default

  const filteredElements = useMemo(() => {
    return ELEMENTS.filter((el) => {
      const matchesSearch =
        el.name.toLowerCase().includes(search.toLowerCase()) ||
        el.sym.toLowerCase().includes(search.toLowerCase()) ||
        String(el.n).includes(search);
      const matchesCat = categoryFilter === "All" || el.cat === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [search, categoryFilter]);

  const handleReset = () => {
    setSearch("");
    setCategoryFilter("All");
    setSelectedElement(ELEMENTS[5]);
  };

  const getCatColor = (cat) => {
    switch (cat) {
      case "Alkali Metal": return "bg-rose-500/20 text-rose-400 border-rose-500/30";
      case "Alkaline Earth": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "Transition Metal": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Post-Transition": return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";
      case "Metalloid": return "bg-teal-500/20 text-teal-400 border-teal-500/30";
      case "Nonmetal": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "Halogen": return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
      case "Noble Gas": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "Actinide": return "bg-pink-500/20 text-pink-400 border-pink-500/30";
      default: return "bg-surface-soft text-foreground border-border";
    }
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
              <span className="text-xs text-muted-foreground">Elements & Atomic Structure</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
              Periodic Table Explorer
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Explore chemical elements, electron shell configurations, physical constants, and industrial applications.
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

          {/* Search, Filters & Element Grid (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row gap-3 shadow-sm">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search element name, symbol, or atomic number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-xs outline-none focus:border-primary"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-xs outline-none focus:border-primary"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Elements Interactive Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {filteredElements.map((el) => (
                <button
                  key={el.sym}
                  onClick={() => setSelectedElement(el)}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-between text-center transition cursor-pointer ${getCatColor(el.cat)} ${
                    selectedElement.sym === el.sym ? "ring-2 ring-primary border-primary scale-105" : "hover:scale-102"
                  }`}
                >
                  <span className="text-[10px] opacity-75 font-mono">{el.n}</span>
                  <span className="text-lg font-black tracking-tight">{el.sym}</span>
                  <span className="text-[10px] truncate w-full">{el.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Element Detail Card (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm">
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div>
                  <span className="text-xs font-mono text-primary font-bold">Atomic No. {selectedElement.n}</span>
                  <h2 className="text-2xl font-extrabold text-foreground mt-0.5">{selectedElement.name}</h2>
                  <span className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getCatColor(selectedElement.cat)}`}>
                    {selectedElement.cat}
                  </span>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-2xl font-black text-primary">
                  {selectedElement.sym}
                </div>
              </div>

              {/* Physical Properties */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Atomic Mass</div>
                  <div className="text-sm font-bold font-mono text-foreground mt-0.5">{selectedElement.mass} u</div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Electron Config</div>
                  <div className="text-xs font-bold font-mono text-foreground mt-0.5">{selectedElement.eConfig}</div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Melting Point</div>
                  <div className="text-xs font-mono text-foreground mt-0.5">{selectedElement.melt}</div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Boiling Point</div>
                  <div className="text-xs font-mono text-foreground mt-0.5">{selectedElement.boil}</div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Density</div>
                  <div className="text-xs font-mono text-foreground mt-0.5">{selectedElement.density}</div>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Year Discovered</div>
                  <div className="text-xs font-mono text-foreground mt-0.5">{selectedElement.disc}</div>
                </div>
              </div>

              {/* Uses */}
              <div className="p-3.5 rounded-xl bg-surface-soft border border-border space-y-1">
                <div className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Common Uses & Applications
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{selectedElement.uses}</p>
              </div>
            </div>

            {/* Educational Info Box */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-2 shadow-sm">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" /> Educational Principles: Periodic Law
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Elements are ordered by atomic number ($Z$). Periodic trends recur periodically due to valence shell electron configurations ($s, p, d, f$ blocks).
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
