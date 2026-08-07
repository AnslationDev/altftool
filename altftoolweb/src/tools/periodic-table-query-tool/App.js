"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Atom,
  Clipboard,
  Download,
  Filter,
  Heart,
  RotateCcw,
  Search,
  Sparkles,
  Star,
  BarChart3,
  FlaskConical,
  Thermometer,
  Layers3,
} from "lucide-react";
import { categoryOptions, usePeriodicTable } from "@/tools/periodic-table-query-tool/hooks/usePeriodicTable";
import { copyToClipboard, downloadJSON, downloadTXT, makeElementReport } from "@/tools/periodic-table-query-tool/utils/export";

const categoryStyles = {
  "alkali metal": "bg-rose-500/15 text-rose-500 border-rose-500/30",
  "alkaline earth metal": "bg-orange-500/15 text-orange-500 border-orange-500/30",
  "transition metal": "bg-cyan-500/15 text-cyan-500 border-cyan-500/30",
  metal: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  metalloid: "bg-lime-500/15 text-lime-600 border-lime-500/30",
  nonmetal: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  halogen: "bg-fuchsia-500/15 text-fuchsia-500 border-fuchsia-500/30",
  "noble gas": "bg-violet-500/15 text-violet-500 border-violet-500/30",
  lanthanoid: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  actinoid: "bg-red-500/15 text-red-500 border-red-500/30",
  "post-transition metal": "bg-sky-500/15 text-sky-500 border-sky-500/30",
};

const pretty = (value, fallback = "N/A") => (value === "" || value == null ? fallback : value);
const titleCase = (value) => String(value || "").replace(/\b\w/g, (char) => char.toUpperCase());

const isotopeData = {
  H: [{ mass: 1, stable: true }, { mass: 2, stable: true }, { mass: 3, stable: false }],
  C: [{ mass: 12, stable: true }, { mass: 13, stable: true }, { mass: 14, stable: false }],
  O: [{ mass: 16, stable: true }, { mass: 17, stable: true }, { mass: 18, stable: true }],
  Na: [{ mass: 23, stable: true }, { mass: 22, stable: false }, { mass: 24, stable: false }],
  Cl: [{ mass: 35, stable: true }, { mass: 37, stable: true }, { mass: 36, stable: false }],
  Au: [{ mass: 197, stable: true }, { mass: 195, stable: false }, { mass: 198, stable: false }],
  Fe: [{ mass: 54, stable: true }, { mass: 56, stable: true }, { mass: 57, stable: true }, { mass: 59, stable: false }],
};

const elementUses = {
  H: ["Fuel cells and clean energy research", "Ammonia and chemical production", "Hydrogenation in food and industry"],
  O: ["Respiration and life-support systems", "Medical oxygen therapy", "Steelmaking and welding"],
  C: ["Graphite pencils and electrodes", "Diamond cutting tools and jewelry", "Organic chemistry and life molecules"],
  Na: ["Sodium vapor lamps", "Coolant in some nuclear reactors", "Table salt compounds"],
  Cl: ["Water disinfection", "PVC plastics", "Bleaches and cleaning chemistry"],
  Au: ["Jewelry and investment bullion", "Corrosion-resistant electronics", "Dental and precision contacts"],
  Fe: ["Steel construction", "Machinery and tools", "Hemoglobin oxygen transport"],
};

const reactionDataset = {
  "Cl+Na": { formula: "NaCl", name: "Sodium chloride", note: "An ionic compound forms when sodium transfers an electron to chlorine." },
  "H+O": { formula: "H2O", name: "Water", note: "Hydrogen and oxygen combine in a 2:1 ratio to form water." },
  "C+O": { formula: "CO2", name: "Carbon dioxide", note: "Carbon reacts with oxygen during combustion to form carbon dioxide." },
  "Fe+O": { formula: "Fe2O3", name: "Iron(III) oxide", note: "Iron and oxygen form rust-like iron oxide compounds." },
  "H+Cl": { formula: "HCl", name: "Hydrogen chloride", note: "Hydrogen and chlorine form a polar covalent compound." },
};

const shellCapacities = [2, 8, 18, 32, 32, 18, 8];
const commonValence = { H: 1, O: 2, Na: 1, Cl: 1, C: 4, N: 3, Mg: 2, Ca: 2, Al: 3, F: 1, S: 2, K: 1 };

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const buildCompoundFormula = (leftSymbol, rightSymbol) => {
  if (!leftSymbol || !rightSymbol) return "";
  // Crisscross valence rule: left element's subscript = right element's valence, and vice versa,
  // then reduce by the GCD so e.g. Mg(2)+O(2) simplifies from "Mg2O2" down to "MgO".
  const leftCount = commonValence[rightSymbol] || 1;
  const rightCount = commonValence[leftSymbol] || 1;
  const divisor = gcd(leftCount, rightCount) || 1;
  const reducedLeft = leftCount / divisor;
  const reducedRight = rightCount / divisor;
  return `${leftSymbol}${reducedLeft > 1 ? reducedLeft : ""}${rightSymbol}${reducedRight > 1 ? reducedRight : ""}`;
};

const getShells = (atomicNumber) => {
  let remaining = Number(atomicNumber) || 0;
  return shellCapacities.reduce((shells, capacity) => {
    if (remaining <= 0) return shells;
    const electrons = Math.min(remaining, capacity);
    remaining -= electrons;
    return [...shells, electrons];
  }, []);
};

const getMassNumber = (element) => {
  if (Array.isArray(element.atomicMass)) return Math.round(element.atomicMass[0]);
  // atomicMass is often a precision-annotated string like "15.9994(3)"; Number() rejects that
  // (returns NaN) because it requires the whole string to be a clean numeric literal, so we
  // need parseFloat, which correctly reads the leading numeric portion.
  const parsed = parseFloat(element.atomicMass);
  return Math.round(Number.isFinite(parsed) ? parsed : element.atomicNumber);
};
const getNeutrons = (element) => Math.max(0, getMassNumber(element) - element.atomicNumber);
const pairKey = (a, b) => [a, b].sort().join("+");
const getReaction = (a, b) => reactionDataset[pairKey(a?.symbol, b?.symbol)];
const getReadableTextColor = (hex = "06b6d4") => {
  const clean = hex.replace("#", "").padEnd(6, "0").slice(0, 6);
  const red = parseInt(clean.slice(0, 2), 16);
  const green = parseInt(clean.slice(2, 4), 16);
  const blue = parseInt(clean.slice(4, 6), 16);
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000;
  return brightness > 155 ? "#111827" : "#ffffff";
};
const getAtomAccentColors = (hex = "06b6d4") => {
  const clean = hex.replace("#", "").padEnd(6, "0").slice(0, 6);
  const values = [clean.slice(0, 2), clean.slice(2, 4), clean.slice(4, 6)].map((part) => parseInt(part, 16));
  const brightness = (values[0] * 299 + values[1] * 587 + values[2] * 114) / 1000;
  const tune = brightness > 185 ? 0.58 : brightness < 90 ? 1.45 : 1;
  const [red, green, blue] = values.map((value) => Math.max(0, Math.min(255, Math.round(value * tune))));
  return {
    solid: `rgb(${red}, ${green}, ${blue})`,
    orbit: `rgba(${red}, ${green}, ${blue}, 0.45)`,
    glow: `rgba(${red}, ${green}, ${blue}, 0.24)`,
  };
};
const normalizeHexColor = (value, fallback = "06b6d4") => {
  // data/elements.json stores some cpkHexColor values as bare numbers instead of strings
  // (e.g. Fluorine's is 9e+51, Palladium's is 6985, Erbium's is 0), which are not valid
  // 6-digit hex colors. Pad/validate before use, falling back to the tool's default accent.
  const padded = String(value ?? "").padStart(6, "0").slice(0, 6);
  return /^[0-9a-fA-F]{6}$/.test(padded) ? padded : fallback;
};

const groupLabel = (element) => {
  if (element.group != null) return element.group;
  if (element.groupBlock === "lanthanoid") return "Lanthanide (n/a)";
  if (element.groupBlock === "actinoid") return "Actinide (n/a)";
  return "N/A";
};

const getStateAtTemperature = (element, kelvin) => {
  const melting = Number(element.meltingPoint);
  const boiling = Number(element.boilingPoint);
  if (!melting && !boiling) return titleCase(element.standardState);
  if (melting && kelvin < melting) return "Solid";
  if (boiling && kelvin >= boiling) return "Gas";
  return "Liquid";
};

const StatusBadge = ({ icon: Icon, text, tone = "info" }) => {
  const tones = {
    info: "bg-cyan-500/10 text-cyan-500 border-cyan-500/25",
    success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/25",
    warn: "bg-amber-500/10 text-amber-500 border-amber-500/25",
  };
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold font-secondary ${tones[tone]}`}>
      {Icon && <Icon size={13} />}
      {text}
    </span>
  );
};

const InfoCard = ({ title, icon: Icon, children, className = "" }) => (
  <section className={`relative min-w-0 bg-(--card) border border-(--border) rounded-2xl p-5 sm:p-6 lg:p-7 transition-all duration-300 hover:border-cyan-500/30 ${className}`}>
    <div className="flex items-center gap-3 mb-5 border-b border-(--border) pb-4">
      <div className="shrink-0 p-2 rounded-lg bg-(--background) border border-(--border) text-cyan-500">{Icon && <Icon size={18} />}</div>
      <h3 className="min-w-0 font-primary font-bold text-lg sm:text-xl text-(--foreground) whitespace-normal leading-tight">{title}</h3>
    </div>
    {children}
  </section>
);

const DataRow = ({ label, value, highlight = false }) => (
  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5 sm:gap-4 py-2 border-b border-(--border)/35 last:border-0">
    <span className="text-sm font-secondary text-(--muted-foreground) shrink-0">{label}</span>
    <span className={`min-w-0 max-w-full sm:max-w-[68%] text-sm sm:text-[15px] font-semibold sm:text-right break-words [overflow-wrap:anywhere] ${highlight ? "text-cyan-500" : "text-(--foreground)"}`}>{pretty(value)}</span>
  </div>
);

const ElementCell = ({ element, selected, visible, related, favorite, onSelect }) => {
  const style = categoryStyles[element.groupBlock] || "bg-slate-500/10 text-(--foreground) border-(--border)";
  return (
    <button
      type="button"
      onClick={() => onSelect(element.atomicNumber)}
      style={{ gridColumn: element.tableColumn, gridRow: element.tableRow }}
      className={`relative w-full min-w-0 aspect-square overflow-hidden rounded-xl border p-2 text-left transition-all duration-200 active:scale-95 ${style}
        ${selected ? "ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/20" : ""}
        ${related ? "shadow-md shadow-cyan-500/10 border-cyan-400/60" : ""}
        ${visible ? "opacity-100 hover:-translate-y-1 hover:shadow-lg" : "opacity-20 grayscale"}`}
      title={`${element.name} (${element.symbol})`}
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex h-4 items-start justify-between gap-1">
          <span className="text-[10px] font-bold leading-none opacity-75 sm:text-xs">{element.atomicNumber}</span>
          {favorite && <Star size={10} className="shrink-0 fill-current" />}
        </div>
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <div className="max-w-full truncate text-center text-[24px] font-black leading-none sm:text-[28px]">{element.symbol}</div>
        </div>
        <div className="hidden max-w-full truncate text-center text-[9px] font-extrabold leading-tight opacity-85 sm:block">{element.name}</div>
      </div>
    </button>
  );
};

const AtomModelCanvas = ({ element, shells }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext("2d");
    let frame;
    let tick = 0;

    const draw = () => {
      const size = canvas.clientWidth || 320;
      const scale = window.devicePixelRatio || 1;
      canvas.width = size * scale;
      canvas.height = 260 * scale;
      context.setTransform(scale, 0, 0, scale, 0, 0);
      context.clearRect(0, 0, size, 260);
      const cx = size / 2;
      const cy = 130;
      const nucleusHex = normalizeHexColor(element.cpkHexColor);
      const color = `#${nucleusHex}`;
      const textColor = getReadableTextColor(nucleusHex);
      const atomColors = getAtomAccentColors(nucleusHex);
      context.fillStyle = color;
      context.shadowColor = color;
      context.shadowBlur = 22;
      context.beginPath();
      context.arc(cx, cy, 25, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;
      context.strokeStyle = textColor === "#ffffff" ? "rgba(255,255,255,0.82)" : "rgba(17,24,39,0.55)";
      context.lineWidth = 2;
      context.beginPath();
      context.arc(cx, cy, 25, 0, Math.PI * 2);
      context.stroke();
      context.font = "900 18px sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.lineWidth = 4;
      context.strokeStyle = textColor === "#ffffff" ? "rgba(17,24,39,0.7)" : "rgba(255,255,255,0.92)";
      context.strokeText(element.symbol, cx, cy);
      context.fillStyle = textColor;
      context.fillText(element.symbol, cx, cy);

      shells.slice(0, 5).forEach((count, shellIndex) => {
        const radius = 42 + shellIndex * 19;
        context.strokeStyle = atomColors.orbit;
        context.lineWidth = 2;
        context.beginPath();
        context.ellipse(cx, cy, radius, radius * 0.55, (shellIndex * Math.PI) / 8 + tick * 0.004, 0, Math.PI * 2);
        context.stroke();
        const visibleElectrons = Math.min(count, 12);
        for (let i = 0; i < visibleElectrons; i += 1) {
          const angle = tick * (0.018 + shellIndex * 0.004) + (i / visibleElectrons) * Math.PI * 2;
          const tilt = (shellIndex * Math.PI) / 8;
          const x = cx + Math.cos(angle) * radius * Math.cos(tilt) - Math.sin(angle) * radius * 0.2 * Math.sin(tilt);
          const y = cy + Math.sin(angle) * radius * 0.55;
          context.shadowColor = atomColors.glow;
          context.shadowBlur = 8;
          context.fillStyle = atomColors.solid;
          context.beginPath();
          context.arc(x, y, 4.5, 0, Math.PI * 2);
          context.fill();
          context.shadowBlur = 0;
        }
      });
      tick += 1;
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [element, shells]);

  return <canvas ref={canvasRef} className="h-[260px] w-full rounded-xl bg-(--background) border border-(--border)" aria-label={`${element.name} animated atom model`} />;
};

const ShellDiagram = ({ shells }) => (
  <div className="flex min-h-[210px] items-center justify-center rounded-xl bg-(--background) border border-(--border) p-4">
    <div className="relative h-44 w-44">
      {shells.map((count, index) => (
        <div key={index} className="absolute rounded-full border border-cyan-500/35" style={{ inset: `${index * 13}px` }}>
          <span className="absolute -right-2 top-1/2 -translate-y-1/2 rounded-full bg-cyan-500 px-2 py-0.5 text-xs font-black text-white">{count}</span>
        </div>
      ))}
      <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/80" />
    </div>
  </div>
);

const AtomicStructureDiagram = ({ element }) => {
  const neutrons = getNeutrons(element);
  const particles = [
    ["Protons", element.atomicNumber, "text-cyan-500"],
    ["Neutrons", neutrons, "text-amber-500"],
    ["Electrons", element.atomicNumber, "text-emerald-500"],
  ];
  return (
    <div className="grid grid-cols-3 gap-3">
      {particles.map(([label, value, tone]) => (
        <div key={label} className="rounded-xl bg-(--background) border border-(--border) p-3 text-center">
          <div className={`text-2xl font-black ${tone}`}>{value}</div>
          <div className="text-xs font-bold text-(--muted-foreground)">{label}</div>
        </div>
      ))}
    </div>
  );
};

export default function PeriodicTableQueryTool() {
  const table = usePeriodicTable();
  const [copied, setCopied] = useState(false);
  const [temperature, setTemperature] = useState(298);
  const [reactionA, setReactionA] = useState(11);
  const [reactionB, setReactionB] = useState(17);
  const visibleSet = useMemo(() => new Set(table.filteredElements.map((element) => element.atomicNumber)), [table.filteredElements]);
  const favoriteSet = useMemo(() => new Set(table.favorites), [table.favorites]);
  const selectedCategoryStyle = categoryStyles[table.selected.groupBlock] || "bg-cyan-500/10 text-cyan-500 border-cyan-500/25";
  const selectedShells = useMemo(() => getShells(table.selected.atomicNumber), [table.selected.atomicNumber]);
  const reactionLeft = table.elements.find((element) => element.atomicNumber === Number(reactionA));
  const reactionRight = table.elements.find((element) => element.atomicNumber === Number(reactionB));
  const reaction = getReaction(reactionLeft, reactionRight);
  const selectedUses = elementUses[table.selected.symbol] || [
    `${table.selected.name} is studied for its ${table.selected.groupBlock} chemistry.`,
    "Used in education, research, and materials reference work.",
  ];
  const selectedIsotopes = isotopeData[table.selected.symbol] || [
    { mass: getMassNumber(table.selected), stable: table.selected.atomicNumber <= 82 },
    { mass: getMassNumber(table.selected) + 1, stable: false },
  ];
  const simulatedState = getStateAtTemperature(table.selected, temperature);

  const handleCopy = async () => {
    const ok = await copyToClipboard(makeElementReport(table.selected));
    setCopied(ok);
    if (ok) setTimeout(() => setCopied(false), 1600);
  };

  const handleSelectElement = (atomicNumber, source = "click") => {
    table.selectElement(atomicNumber, source);
    setReactionA(Number(atomicNumber));
  };

  const handleResetWorkspace = () => {
    table.resetWorkspace();
    setReactionA(8);
  };

  return (
    <div className="px-4 py-8 font-secondary selection:bg-cyan-500/30">
      <div className="max-w-[1520px] mx-auto space-y-9">
        <header className="text-center text-(--primary)">
          <div className="flex items-center justify-center gap-2 flex-wrap mb-4">
            <StatusBadge icon={Sparkles} text="Offline Element Database" tone="success" />
            <StatusBadge icon={Atom} text={`${table.stats.total} Real Elements`} />
            <StatusBadge icon={Filter} text={`${table.stats.visible} Visible`} tone="warn" />
          </div>
          <h1 className="heading animate-fade-up md:whitespace-nowrap !text-3xl md:!text-5xl">
            Periodic Table Explorer Studio
          </h1>
          <p className="description opacity-90 mt-1 text-(--secondary) text-base md:text-lg animate-fade-up">
            Search, compare, favorite, and export scientific element data in real time
          </p>
        </header>

        <InfoCard title="Search & Filters" icon={Search}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500" />
              <input
                value={table.query}
                onChange={(event) => table.setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && table.filteredElements[0]) handleSelectElement(table.filteredElements[0].atomicNumber, "search");
                }}
                placeholder="Search by name, symbol, atomic number, or category"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-(--background) border border-(--border) outline-none focus:border-cyan-500/60 text-base"
              />
            </div>
            <div className="flex gap-2 flex-wrap lg:justify-end">
              <button onClick={handleResetWorkspace} className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-(--background) border border-(--border) text-base font-bold hover:border-cyan-500/40">
                <RotateCcw size={15} /> Reset
              </button>
              <button onClick={handleCopy} className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-(--background) border border-(--border) text-base font-bold hover:border-cyan-500/40">
                <Clipboard size={15} className={copied ? "text-emerald-500" : "text-cyan-500"} /> {copied ? "Copied" : "Copy"}
              </button>
              <div className="relative group/export">
                <button className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-cyan-600 text-white text-base font-bold hover:bg-cyan-700">
                  <Download size={15} /> Export
                </button>
                <div className="absolute top-full right-0 mt-2 w-48 bg-(--card) border border-(--border) rounded-xl shadow-xl py-2 opacity-0 invisible group-hover/export:opacity-100 group-hover/export:visible transition-all z-30">
                  <button onClick={() => downloadTXT(table.selected, `${table.selected.name.toLowerCase()}-element.txt`)} className="w-full text-left px-4 py-2 hover:bg-cyan-500/10 text-base font-medium">Download TXT</button>
                  <button onClick={() => downloadJSON({ selected: table.selected, compare: table.compare, favorites: table.favorites }, "periodic-table-workspace.json")} className="w-full text-left px-4 py-2 hover:bg-cyan-500/10 text-base font-medium">Download JSON</button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 mt-5">
            {["all", ...categoryOptions].map((option) => (
              <button
                key={option}
                onClick={() => table.setCategory(option)}
                className={`shrink-0 px-3 py-2 rounded-full border text-sm font-bold transition-all ${
                  table.category === option ? "bg-cyan-500 text-white border-cyan-500" : "bg-(--background) border-(--border) text-(--muted-foreground) hover:text-(--foreground)"
                }`}
              >
                {option === "all" ? "All Elements" : titleCase(option)}
              </button>
            ))}
          </div>
        </InfoCard>

        <div className="space-y-8">
          <InfoCard title="Interactive Periodic Table" icon={Atom}>
            <div className="-mx-2 overflow-x-auto px-2 pb-3">
              <div className="grid min-w-[1220px] grid-cols-[repeat(18,minmax(62px,1fr))] grid-rows-[repeat(9,minmax(62px,1fr))] gap-2 sm:min-w-[1320px] sm:grid-cols-[repeat(18,minmax(68px,1fr))] sm:grid-rows-[repeat(9,minmax(68px,1fr))] 2xl:min-w-0">
                {table.elements.map((element) => (
                  <ElementCell
                    key={element.atomicNumber}
                    element={element}
                    selected={element.atomicNumber === table.selected.atomicNumber}
                    related={(element.group != null && element.group === table.selected.group) || element.period === table.selected.period}
                    visible={visibleSet.has(element.atomicNumber)}
                    favorite={favoriteSet.has(element.atomicNumber)}
                    onSelect={handleSelectElement}
                  />
                ))}
              </div>
            </div>
          </InfoCard>

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-8 items-start">
            <InfoCard title="Element Detail Panel" icon={FlaskConical}>
              <div className={`rounded-2xl border p-5 mb-4 ${selectedCategoryStyle}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-5xl sm:text-6xl font-black leading-none break-words">{table.selected.symbol}</div>
                    <h2 className="text-xl sm:text-2xl font-extrabold mt-2 text-(--foreground) break-words">{table.selected.name}</h2>
                    <p className="text-xs sm:text-sm font-bold uppercase tracking-widest opacity-80 break-words">{titleCase(table.selected.groupBlock)}</p>
                  </div>
                  <button onClick={() => table.toggleFavorite()} className="p-3 rounded-xl bg-(--background) border border-(--border) hover:border-cyan-500/50" title="Toggle favorite">
                    <Heart size={18} className={favoriteSet.has(table.selected.atomicNumber) ? "fill-rose-500 text-rose-500" : "text-cyan-500"} />
                  </button>
                </div>
              </div>
              <DataRow label="Atomic Number" value={table.selected.atomicNumber} highlight />
              <DataRow label="Atomic Mass" value={table.selected.atomicMass} />
              <DataRow label="Group / Period" value={`${groupLabel(table.selected)} / ${table.selected.period}`} />
              <DataRow label="State" value={titleCase(table.selected.standardState)} />
              <DataRow label="Electron Config" value={table.selected.electronicConfiguration} highlight />
              <DataRow label="Discovered" value={table.selected.yearDiscovered} />
              <div className="mt-5 space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-widest font-bold text-cyan-500 mb-2">3D Atom Model Viewer</p>
                  <AtomModelCanvas element={table.selected} shells={selectedShells} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest font-bold text-cyan-500 mb-2">Element Uses</p>
                  <div className="grid gap-2">
                    {selectedUses.map((use) => (
                      <div key={use} className="rounded-xl bg-(--background) border border-(--border) px-3 py-2 text-sm font-semibold text-(--muted-foreground)">
                        {use}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </InfoCard>

            <InfoCard title="Physical Properties" icon={BarChart3}>
              <DataRow label="Density" value={`${pretty(table.selected.density)} g/cm3`} highlight />
              <DataRow label="Melting Point" value={`${pretty(table.selected.meltingPoint)} K`} />
              <DataRow label="Boiling Point" value={`${pretty(table.selected.boilingPoint)} K`} />
              <DataRow label="Electronegativity" value={table.selected.electronegativity} />
              <DataRow label="Ionization Energy" value={`${pretty(table.selected.ionizationEnergy)} kJ/mol`} />
              <div className="mt-4 p-4 rounded-xl bg-(--background) border border-(--border)">
                <p className="text-xs uppercase tracking-widest font-bold text-cyan-500 mb-2">Learning View</p>
                <p className="text-base leading-relaxed text-(--muted-foreground)">
                  {table.selected.name} is a {table.selected.groupBlock} with atomic number {table.selected.atomicNumber}. Its standard state is {table.selected.standardState}, and its electron configuration is {pretty(table.selected.electronicConfiguration)}.
                </p>
              </div>
              <div className="mt-5 space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-widest font-bold text-cyan-500 mb-2">Electron Shell Visualization</p>
                  <ShellDiagram shells={selectedShells} />
                  <p className="mt-2 text-sm font-bold text-(--muted-foreground)">Shell layout: {selectedShells.join(", ")}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest font-bold text-cyan-500 mb-2">Atomic Structure Diagram</p>
                  <AtomicStructureDiagram element={table.selected} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest font-bold text-cyan-500 mb-2">Isotope Information</p>
                  <div className="space-y-2">
                    {selectedIsotopes.map((isotope) => (
                      <div key={`${table.selected.symbol}${isotope.mass}`} className="flex items-center justify-between gap-3 rounded-xl bg-(--background) border border-(--border) px-3 py-2">
                        <span className="font-black">{table.selected.symbol}-{isotope.mass}</span>
                        <span className={`text-xs font-bold ${isotope.stable ? "text-emerald-500" : "text-amber-500"}`}>
                          {isotope.stable ? "Stable" : "Unstable / Radioactive"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </InfoCard>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <InfoCard title="Compare Elements" icon={Atom} className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {[0, 1].map((index) => (
                <select
                  key={index}
                  value={table.compareNumbers[index]}
                  onChange={(event) => table.updateCompare(index, event.target.value)}
                  aria-label={index === 0 ? "Compare element, first slot" : "Compare element, second slot"}
                  className="w-full px-4 py-3 rounded-xl bg-(--background) border border-(--border) outline-none focus:border-cyan-500/60 text-base font-bold"
                >
                  {table.elements.map((element) => <option key={element.atomicNumber} value={element.atomicNumber}>{element.name} ({element.symbol})</option>)}
                </select>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] table-fixed text-base">
                <tbody>
                  {["atomicNumber", "atomicMass", "groupBlock", "standardState", "electronicConfiguration", "density"].map((key) => (
                    <tr key={key} className="border-b border-(--border)/40">
                      <td className="w-[34%] py-3 pr-4 text-(--muted-foreground) font-bold break-words">{titleCase(key.replace(/([A-Z])/g, " $1"))}</td>
                      {table.compare.map((element) => <td key={element.atomicNumber} className="w-[33%] py-3 px-3 font-semibold break-words align-top">{pretty(element[key])}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </InfoCard>

          <InfoCard title="Favorites & History" icon={Star}>
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-cyan-500 mb-2">Favorites</p>
                <div className="flex gap-2 flex-wrap">
                  {table.favorites.length ? table.favorites.map((number) => {
                    const element = table.elements.find((item) => item.atomicNumber === number);
                    return <button key={number} onClick={() => handleSelectElement(number)} className="px-3 py-2 rounded-lg bg-(--background) border border-(--border) text-sm font-bold hover:border-cyan-500/50">{element?.symbol}</button>;
                  }) : <p className="text-base text-(--muted-foreground)">No favorites saved yet.</p>}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs uppercase tracking-widest font-bold text-cyan-500">Recent Searches</p>
                  <button onClick={table.clearHistory} className="text-xs font-bold text-(--muted-foreground) hover:text-cyan-500">Clear</button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {table.history.length ? table.history.map((number) => {
                    const element = table.elements.find((item) => item.atomicNumber === number);
                    return <button key={number} onClick={() => handleSelectElement(number)} className="px-3 py-2 rounded-lg bg-(--background) border border-(--border) text-sm font-bold hover:border-cyan-500/50">{element?.name}</button>;
                  }) : <p className="text-base text-(--muted-foreground)">Search and press Enter to build history.</p>}
                </div>
              </div>
            </div>
          </InfoCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <InfoCard title="Chemistry Section" icon={Layers3}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {[reactionA, reactionB].map((value, index) => (
                <select
                  key={index}
                  value={value}
                  onChange={(event) => (index === 0 ? setReactionA(event.target.value) : setReactionB(event.target.value))}
                  aria-label={index === 0 ? "Reactant A" : "Reactant B"}
                  className="w-full px-4 py-3 rounded-xl bg-(--background) border border-(--border) outline-none focus:border-cyan-500/60 text-base font-bold"
                >
                  {table.elements.map((element) => <option key={element.atomicNumber} value={element.atomicNumber}>{element.name} ({element.symbol})</option>)}
                </select>
              ))}
            </div>
            <div className="rounded-xl bg-(--background) border border-(--border) p-4">
              <p className="text-xs uppercase tracking-widest font-bold text-cyan-500 mb-2">Element Reaction Explorer</p>
              <div className="text-2xl font-black text-(--foreground)">
                {reactionLeft?.symbol} + {reactionRight?.symbol} {reaction ? `= ${reaction.formula}` : ""}
              </div>
              <p className="mt-2 text-base text-(--muted-foreground)">
                {reaction ? `${reaction.name}: ${reaction.note}` : "No predefined classroom reaction is available for this pair."}
              </p>
            </div>
            <div className="mt-4 rounded-xl bg-(--background) border border-(--border) p-4">
              <p className="text-xs uppercase tracking-widest font-bold text-cyan-500 mb-2">Compound Builder</p>
              <div className="text-3xl font-black text-cyan-500">
                {reaction?.formula || buildCompoundFormula(reactionLeft?.symbol, reactionRight?.symbol)}
              </div>
              <p className="mt-2 text-sm text-(--muted-foreground)">Generated from predefined reactions first, then simple valence balancing for common elements.</p>
            </div>
          </InfoCard>

          <InfoCard title="Temperature State Simulation" icon={Thermometer}>
            <div className="rounded-xl bg-(--background) border border-(--border) p-4">
              <div className="flex items-center justify-between gap-4 mb-4">
                <span className="text-sm font-bold text-(--muted-foreground)">Temperature</span>
                <span className="text-xl font-black text-cyan-500">{temperature} K</span>
              </div>
              <input
                type="range"
                min="0"
                max="6500"
                step="10"
                value={temperature}
                onChange={(event) => setTemperature(Number(event.target.value))}
                aria-label="Temperature in Kelvin"
                className="w-full accent-cyan-500"
              />
              <div className="mt-5 grid grid-cols-3 gap-3">
                {["Solid", "Liquid", "Gas"].map((state) => (
                  <div key={state} className={`rounded-xl border p-3 text-center text-sm font-black ${simulatedState === state ? "border-cyan-500 bg-cyan-500 text-white" : "border-(--border) bg-(--card) text-(--muted-foreground)"}`}>
                    {state}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-base text-(--muted-foreground)">
                {table.selected.name} is predicted as <span className="font-black text-(--foreground)">{simulatedState}</span> using melting point {pretty(table.selected.meltingPoint)} K and boiling point {pretty(table.selected.boilingPoint)} K.
              </p>
            </div>
          </InfoCard>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InfoCard title="Elements" icon={Atom}><div className="text-3xl font-black text-cyan-500">{table.stats.total}</div></InfoCard>
          <InfoCard title="Visible" icon={Filter}><div className="text-3xl font-black text-emerald-500">{table.stats.visible}</div></InfoCard>
          <InfoCard title="Favorites" icon={Heart}><div className="text-3xl font-black text-rose-500">{table.stats.favorites}</div></InfoCard>
          <InfoCard title="History" icon={BarChart3}><div className="text-3xl font-black text-amber-500">{table.stats.history}</div></InfoCard>
        </div>

        <footer className="pt-4 pb-2">
          <div className="text-center mb-8">
            <h2 className="font-primary font-black text-3xl md:text-4xl text-(--foreground) leading-tight">
              Dashboard Intelligence Features
            </h2>
            <p className="mt-3 text-base md:text-lg text-(--muted-foreground)">
              A secure, fast, and comprehensive chemistry exploration dashboard
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[
              ["Real-time Detection", "Instantly update element details, atom models, shells, reactions, and state simulation as you explore."],
              ["Privacy First", "All chemistry exploration runs client-side in your browser. No element workspace data is sent to a server."],
              ["Export & Copy", "Download detailed element reports in JSON or TXT format, or copy the current element data with one click."],
              ["Atomic Analysis", "Deep-dive into protons, neutrons, electrons, isotopes, electron shells, and physical properties."],
              ["Reaction & Compound Logic", "Explore predefined chemistry relationships and generate common compound formulas live."],
              ["Explorer Insights", "Search, filter, compare, favorite, and revisit recent elements with real-time dashboard updates."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-(--border) bg-(--card) p-7 min-h-[190px]">
                <h3 className="font-primary font-black text-xl md:text-2xl text-(--foreground) leading-tight">
                  {title}
                </h3>
                <p className="mt-4 text-base md:text-lg leading-relaxed text-(--muted-foreground)">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
