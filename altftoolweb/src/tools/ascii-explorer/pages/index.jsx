"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Binary,
  Check,
  Copy,
  FlaskConical,
  Hash,
  Info,
  Layers,
  Lightbulb,
  PieChart,
  Search,
  Sparkles,
  Table as TableIcon,
  Type,
  X,
} from "lucide-react";

/* ---------------------------------------------------------------------------
   ASCII data
--------------------------------------------------------------------------- */

const CONTROL_NAMES = [
  ["NUL", "Null character"], ["SOH", "Start of heading"], ["STX", "Start of text"], ["ETX", "End of text"],
  ["EOT", "End of transmission"], ["ENQ", "Enquiry"], ["ACK", "Acknowledge"], ["BEL", "Bell (alert)"],
  ["BS", "Backspace"], ["HT", "Horizontal tab"], ["LF", "Line feed (new line)"], ["VT", "Vertical tab"],
  ["FF", "Form feed"], ["CR", "Carriage return"], ["SO", "Shift out"], ["SI", "Shift in"],
  ["DLE", "Data link escape"], ["DC1", "Device control 1 (XON)"], ["DC2", "Device control 2"], ["DC3", "Device control 3 (XOFF)"],
  ["DC4", "Device control 4"], ["NAK", "Negative acknowledge"], ["SYN", "Synchronous idle"], ["ETB", "End of transmission block"],
  ["CAN", "Cancel"], ["EM", "End of medium"], ["SUB", "Substitute"], ["ESC", "Escape"],
  ["FS", "File separator"], ["GS", "Group separator"], ["RS", "Record separator"], ["US", "Unit separator"],
];

const categoryOf = (code) => {
  if (code < 32 || code === 127) return "control";
  if (code === 32) return "space";
  if (code >= 48 && code <= 57) return "digit";
  if (code >= 65 && code <= 90) return "upper";
  if (code >= 97 && code <= 122) return "lower";
  return "punct";
};

const CATEGORY_META = {
  control: { label: "Control", color: "#8b5cf6", chip: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  space: { label: "Space", color: "#94a3b8", chip: "bg-slate-500/10 text-slate-600 dark:text-slate-400" },
  digit: { label: "Digit", color: "#f59e0b", chip: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  upper: { label: "Uppercase", color: "#3b82f6", chip: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  lower: { label: "Lowercase", color: "#10b981", chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  punct: { label: "Symbol", color: "#ec4899", chip: "bg-pink-500/10 text-pink-600 dark:text-pink-400" },
};

const describe = (code) => {
  if (code === 127) return "Delete (DEL)";
  if (code < 32) return CONTROL_NAMES[code][1];
  if (code === 32) return "Space";
  const ch = String.fromCharCode(code);
  const cat = categoryOf(code);
  if (cat === "digit") return `Digit ${ch}`;
  if (cat === "upper") return `Uppercase letter ${ch}`;
  if (cat === "lower") return `Lowercase letter ${ch}`;
  return `Symbol ${ch}`;
};

const displayChar = (code) => {
  if (code === 127) return "DEL";
  if (code < 32) return CONTROL_NAMES[code][0];
  if (code === 32) return "␣";
  return String.fromCharCode(code);
};

const ASCII = Array.from({ length: 128 }, (_, code) => ({
  code,
  hex: code.toString(16).toUpperCase().padStart(2, "0"),
  oct: code.toString(8).padStart(3, "0"),
  bin: code.toString(2).padStart(8, "0"),
  char: displayChar(code),
  desc: describe(code),
  cat: categoryOf(code),
}));

const DISTRIBUTION = [
  { key: "control", count: ASCII.filter((a) => a.cat === "control").length },
  { key: "space", count: 1 },
  { key: "digit", count: 10 },
  { key: "upper", count: 26 },
  { key: "lower", count: 26 },
  { key: "punct", count: ASCII.filter((a) => a.cat === "punct").length },
];

const QUICK_FACTS = [
  { icon: Sparkles, text: "95 of 128 ASCII characters are printable — about 74% of the whole table." },
  { icon: Binary, text: "ASCII is a 7-bit code: every character fits in values 0–127." },
  { icon: Type, text: "'A' is 65 and 'a' is 97 — upper and lower case differ by exactly 32 (bit 5)." },
  { icon: Hash, text: "Digits 0–9 sit at codes 48–57, so code − 48 gives the digit's value." },
  { icon: Info, text: "Control codes 0–31 come from teletype machines — LF (10) and CR (13) still end your lines today." },
  { icon: Layers, text: "DEL (127) is the only control character outside the 0–31 block." },
];

const FILTERS = [
  { id: "all", label: "All" },
  { id: "control", label: "Control" },
  { id: "printable", label: "Printable" },
];

/* ---------------------------------------------------------------------------
   Component
--------------------------------------------------------------------------- */

export default function ToolHome() {
  const [charInput, setCharInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [selected, setSelected] = useState(null); // code number
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState(null);
  const rowRefs = useRef({});

  const lookupChar = () => {
    if (!charInput) return;
    const code = charInput.codePointAt(0);
    if (code > 127) { setSelected(-1); return; }
    setSelected(code);
    setFilter("all");
    setQuery("");
  };
  const lookupCode = () => {
    const code = parseInt(codeInput, 10);
    if (Number.isNaN(code) || code < 0 || code > 127) { setSelected(-1); return; }
    setSelected(code);
    setFilter("all");
    setQuery("");
  };

  useEffect(() => {
    if (selected != null && selected >= 0 && rowRefs.current[selected]) {
      rowRefs.current[selected].scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [selected]);

  const rows = useMemo(
    () =>
      ASCII.filter((a) => {
        const matchFilter =
          filter === "all" ? true : filter === "control" ? a.cat === "control" : a.cat !== "control";
        const q = query.trim().toLowerCase();
        const matchQuery =
          !q ||
          String(a.code) === q ||
          a.hex.toLowerCase() === q ||
          a.char.toLowerCase() === q ||
          a.desc.toLowerCase().includes(q);
        return matchFilter && matchQuery;
      }),
    [filter, query],
  );

  const copyRow = (a) => {
    navigator.clipboard?.writeText(a.cat === "control" ? a.char : String.fromCharCode(a.code));
    setCopiedCode(a.code);
    setTimeout(() => setCopiedCode(null), 1200);
  };

  const sel = selected != null && selected >= 0 ? ASCII[selected] : null;
  const maxDist = Math.max(...DISTRIBUTION.map((d) => d.count));

  const card = "rounded-2xl border border-(--border) bg-(--card)";
  const inputCls =
    "w-full rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-[13px] text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/25";

  /* donut geometry: control 33 (incl DEL), printable 95 */
  const donut = useMemo(() => {
    const C = 2 * Math.PI * 52;
    const controlFrac = 33 / 128;
    return { C, control: controlFrac * C, printable: (95 / 128) * C };
  }, []);

  return (
    <div className="min-h-screen bg-(--background) px-3 py-6 text-(--foreground) antialiased sm:px-5 sm:py-10">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* ================= header + lookups ================= */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
              <FlaskConical className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                ASCII <span className="text-blue-600 dark:text-blue-400">Explorer</span>
              </h1>
              <p className="mt-0.5 max-w-md text-[13px] text-(--muted-foreground)">
                Explore ASCII characters, codes, and their representations in different number systems.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className={`${card} p-3`}>
              <p className="text-[12px] font-semibold">Character Lookup</p>
              <div className="mt-2 flex gap-2">
                <input
                  value={charInput}
                  maxLength={2}
                  onChange={(e) => setCharInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && lookupChar()}
                  placeholder="Enter any character (e.g. A, $, 7)"
                  className={inputCls}
                />
                <button onClick={lookupChar} className="shrink-0 rounded-xl bg-(--primary) px-4 py-2 text-[12px] font-semibold text-white hover:bg-(--primary)/90">
                  Lookup
                </button>
              </div>
            </div>
            <div className={`${card} p-3`}>
              <p className="text-[12px] font-semibold">ASCII Code Lookup</p>
              <div className="mt-2 flex gap-2">
                <input
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.replace(/[^\d]/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && lookupCode()}
                  placeholder="Enter ASCII code (0 – 127)"
                  className={inputCls}
                />
                <button onClick={lookupCode} className="shrink-0 rounded-xl bg-(--primary) px-4 py-2 text-[12px] font-semibold text-white hover:bg-(--primary)/90">
                  Lookup
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* lookup result banner */}
        {selected === -1 && (
          <div className={`${card} flex items-center gap-3 border-amber-500/30 bg-amber-500/5 p-3`}>
            <Info className="h-4 w-4 shrink-0 text-amber-500" />
            <p className="text-[13px] text-(--foreground)">That's outside the 7-bit ASCII range (0–127). Try a standard ASCII character or code.</p>
            <button onClick={() => setSelected(null)} className="ml-auto grid h-7 w-7 place-items-center rounded-lg text-(--muted-foreground) hover:bg-(--muted)/60"><X className="h-3.5 w-3.5" /></button>
          </div>
        )}
        {sel && (
          <div className={`${card} flex flex-wrap items-center gap-x-5 gap-y-2 border-(--primary)/30 bg-(--primary)/5 p-3.5`}>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-(--primary) font-mono text-lg font-bold text-white">{sel.char}</span>
            <div className="text-[13px]"><span className="text-(--muted-foreground)">Dec</span> <span className="font-mono font-bold">{sel.code}</span></div>
            <div className="text-[13px]"><span className="text-(--muted-foreground)">Hex</span> <span className="font-mono font-bold">0x{sel.hex}</span></div>
            <div className="text-[13px]"><span className="text-(--muted-foreground)">Oct</span> <span className="font-mono font-bold">{sel.oct}</span></div>
            <div className="text-[13px]"><span className="text-(--muted-foreground)">Bin</span> <span className="font-mono font-bold">{sel.bin}</span></div>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${CATEGORY_META[sel.cat].chip}`}>{sel.desc}</span>
            <button onClick={() => setSelected(null)} className="ml-auto grid h-7 w-7 place-items-center rounded-lg text-(--muted-foreground) hover:bg-(--muted)/60"><X className="h-3.5 w-3.5" /></button>
          </div>
        )}

        {/* ================= stat tiles ================= */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { value: "128", label: "Total Characters", sub: "codes 0 – 127", color: "text-blue-600 dark:text-blue-400", ring: "bg-blue-500/10" },
            { value: "95", label: "Printable Characters", sub: "codes 32 – 126", color: "text-emerald-600 dark:text-emerald-400", ring: "bg-emerald-500/10" },
            { value: "33", label: "Control Characters", sub: "codes 0 – 31 & 127", color: "text-violet-600 dark:text-violet-400", ring: "bg-violet-500/10" },
            { value: "7-Bit", label: "ASCII Standard", sub: "fits in 7 bits", color: "text-amber-600 dark:text-amber-400", ring: "bg-amber-500/10" },
          ].map((s) => (
            <div key={s.label} className={`${card} p-4`}>
              <span className={`inline-flex rounded-lg px-2 py-0.5 text-xl font-extrabold tabular-nums ${s.color} ${s.ring}`}>{s.value}</span>
              <p className="mt-2 text-[13px] font-semibold">{s.label}</p>
              <p className="text-[11px] text-(--muted-foreground)">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* ================= main grid ================= */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          {/* ---- left: overview + ranges ---- */}
          <div className="space-y-5 xl:col-span-3">
            <section className={`${card} p-4`}>
              <div className="flex items-center gap-2">
                <PieChart className="h-4 w-4 text-(--muted-foreground)" />
                <h2 className="text-[14px] font-bold">ASCII Overview</h2>
              </div>
              <div className="mt-3 flex items-center justify-center">
                <div className="relative">
                  <svg width="150" height="150" viewBox="0 0 150 150">
                    <circle cx="75" cy="75" r="52" fill="none" stroke="#10b981" strokeWidth="18"
                      strokeDasharray={`${donut.printable} ${donut.C}`} transform="rotate(-90 75 75)" />
                    <circle cx="75" cy="75" r="52" fill="none" stroke="#8b5cf6" strokeWidth="18"
                      strokeDasharray={`${donut.control} ${donut.C}`}
                      strokeDashoffset={-donut.printable} transform="rotate(-90 75 75)" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold tabular-nums">128</span>
                    <span className="text-[10px] text-(--muted-foreground)">Total</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1.5 text-[12px]">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Printable (32–126)</span>
                  <span className="font-semibold tabular-nums">95 <span className="text-(--muted-foreground)">(74%)</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-violet-500" /> Control (0–31, 127)</span>
                  <span className="font-semibold tabular-nums">33 <span className="text-(--muted-foreground)">(26%)</span></span>
                </div>
              </div>
            </section>

            <section className={`${card} p-4`}>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-(--muted-foreground)" />
                <h2 className="text-[14px] font-bold">ASCII Ranges</h2>
              </div>
              <div className="mt-3 overflow-hidden rounded-xl border border-(--border)">
                <div className="grid grid-cols-[1fr_1.6fr_auto] gap-2 border-b border-(--border) bg-(--muted)/40 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-(--muted-foreground)">
                  <span>Range</span><span>Type</span><span>Count</span>
                </div>
                {[
                  ["0 – 31", "Control Characters", 32],
                  ["32 – 126", "Printable Characters", 95],
                  ["127", "Delete (DEL)", 1],
                ].map(([range, type, count]) => (
                  <div key={range} className="grid grid-cols-[1fr_1.6fr_auto] gap-2 border-b border-(--border) px-3 py-2 text-[12px] last:border-0">
                    <span className="font-mono font-semibold">{range}</span>
                    <span className="text-(--muted-foreground)">{type}</span>
                    <span className="font-semibold tabular-nums">{count}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ---- center: full table ---- */}
          <section className={`${card} flex flex-col xl:col-span-5`}>
            <div className="flex flex-wrap items-center gap-2 border-b border-(--border) p-3.5">
              <TableIcon className="h-4 w-4 text-(--muted-foreground)" />
              <h2 className="text-[14px] font-bold">ASCII Table (0 – 127)</h2>
              <span className="ml-auto rounded-full bg-(--primary)/10 px-2.5 py-0.5 text-[11px] font-semibold text-(--primary)">{rows.length} shown</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 border-b border-(--border) p-3">
              <div className="flex gap-1 rounded-xl border border-(--border) bg-(--muted)/40 p-1">
                {FILTERS.map((f) => (
                  <button key={f.id} onClick={() => setFilter(f.id)} className={`rounded-lg px-3 py-1 text-[12px] font-semibold transition-colors ${filter === f.id ? "bg-(--card) text-(--foreground) shadow-sm" : "text-(--muted-foreground)"}`}>
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-(--muted-foreground)" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search char, code, hex or name…" className={`${inputCls} py-1.5 pl-8 text-[12px]`} />
              </div>
            </div>
            <div className="apo-scroll max-h-[520px] flex-1 overflow-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 z-10 bg-(--card)">
                  <tr className="border-b border-(--border) text-[10px] font-semibold uppercase tracking-wide text-(--muted-foreground)">
                    {["Dec", "Hex", "Oct", "Binary", "Char", "Description", ""].map((h) => (
                      <th key={h} className="px-3 py-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((a) => {
                    const isSel = selected === a.code;
                    return (
                      <tr
                        key={a.code}
                        ref={(el) => { rowRefs.current[a.code] = el; }}
                        onClick={() => setSelected(a.code)}
                        className={`cursor-pointer border-b border-(--border) text-[12px] transition-colors last:border-0 ${isSel ? "bg-(--primary)/10" : "hover:bg-(--muted)/40"}`}
                      >
                        <td className="px-3 py-1.5 font-mono font-semibold tabular-nums">{a.code}</td>
                        <td className="px-3 py-1.5 font-mono text-(--muted-foreground)">0x{a.hex}</td>
                        <td className="px-3 py-1.5 font-mono text-(--muted-foreground)">{a.oct}</td>
                        <td className="px-3 py-1.5 font-mono text-[11px] text-(--muted-foreground)">{a.bin}</td>
                        <td className="px-3 py-1.5">
                          <span className={`inline-flex min-w-8 items-center justify-center rounded-md px-1.5 py-0.5 font-mono text-[11px] font-bold ${CATEGORY_META[a.cat].chip}`}>
                            {a.char}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 text-(--muted-foreground)">{a.desc}</td>
                        <td className="px-2 py-1.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); copyRow(a); }}
                            aria-label={`Copy character ${a.code}`}
                            className="grid h-6 w-6 place-items-center rounded text-(--muted-foreground) hover:bg-(--muted)/60 hover:text-(--foreground)"
                          >
                            {copiedCode === a.code ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {rows.length === 0 && (
                    <tr><td colSpan={7} className="px-3 py-10 text-center text-[13px] text-(--muted-foreground)">No characters match your search.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ---- right: distribution + facts ---- */}
          <div className="space-y-5 xl:col-span-4">
            <section className={`${card} p-4`}>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-(--muted-foreground)" />
                <h2 className="text-[14px] font-bold">ASCII Code Distribution</h2>
              </div>
              <div className="mt-4 flex h-40 items-end justify-between gap-2 px-1">
                {DISTRIBUTION.map((d) => {
                  const meta = CATEGORY_META[d.key];
                  return (
                    <div key={d.key} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                      <span className="text-[11px] font-bold tabular-nums">{d.count}</span>
                      <div
                        className="w-full max-w-9 rounded-t-lg transition-all duration-500"
                        style={{ height: `${Math.max((d.count / maxDist) * 100, 4)}%`, background: meta.color }}
                        title={`${meta.label}: ${d.count}`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 flex justify-between gap-2 px-1">
                {DISTRIBUTION.map((d) => (
                  <span key={d.key} className="flex-1 text-center text-[9.5px] font-medium text-(--muted-foreground)">{CATEGORY_META[d.key].label}</span>
                ))}
              </div>
            </section>

            <section className={`${card} p-4`}>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <h2 className="text-[14px] font-bold">Quick Facts</h2>
              </div>
              <ul className="mt-3 space-y-2">
                {QUICK_FACTS.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex gap-2.5 rounded-xl border border-(--border) bg-(--muted)/30 p-2.5 text-[12px] leading-relaxed text-(--foreground)">
                    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-(--primary)" />
                    {text}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .apo-scroll::-webkit-scrollbar { height: 6px; width: 6px }
        .apo-scroll::-webkit-scrollbar-thumb { background: color-mix(in oklab, currentColor 18%, transparent); border-radius: 9999px }
      ` }} />
    </div>
  );
}
