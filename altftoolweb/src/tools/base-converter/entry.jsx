"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  ArrowRightLeft,
  ArrowDownUp,
  ArrowRight,
  BadgeCheck,
  Binary,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Eraser,
  Globe,
  Infinity as InfinityIcon,
  Lock,
  MonitorSmartphone,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

/* ---------------------------------------------------------------------------
   Base definitions & math (BigInt-safe, arbitrary length)
--------------------------------------------------------------------------- */

const BASES = [
  { value: 2, label: "Binary (Base 2)", short: "Binary", accent: "text-blue-500", chip: "bg-blue-500/10 text-blue-600 dark:text-blue-400", badge: "bg-blue-500" },
  { value: 8, label: "Octal (Base 8)", short: "Octal", accent: "text-orange-500", chip: "bg-orange-500/10 text-orange-600 dark:text-orange-400", badge: "bg-orange-500" },
  { value: 10, label: "Decimal (Base 10)", short: "Decimal", accent: "text-emerald-500", chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-500" },
  { value: 16, label: "Hexadecimal (Base 16)", short: "Hexadecimal", accent: "text-violet-500", chip: "bg-violet-500/10 text-violet-600 dark:text-violet-400", badge: "bg-violet-500" },
  { value: 36, label: "Base 36", short: "Base 36", accent: "text-sky-500", chip: "bg-sky-500/10 text-sky-600 dark:text-sky-400", badge: "bg-sky-500" },
];

const DIGITS = "0123456789abcdefghijklmnopqrstuvwxyz";

const isValidForBase = (str, base) => {
  if (!str) return true;
  const body = str.startsWith("-") ? str.slice(1) : str;
  if (!body) return false;
  const allowed = DIGITS.slice(0, base);
  return body
    .toLowerCase()
    .split("")
    .every((ch) => allowed.includes(ch));
};

const parseToBigInt = (str, base) => {
  const neg = str.startsWith("-");
  const body = (neg ? str.slice(1) : str).toLowerCase();
  let acc = 0n;
  const B = BigInt(base);
  for (const ch of body) {
    const d = DIGITS.indexOf(ch);
    if (d < 0 || d >= base) return null;
    acc = acc * B + BigInt(d);
  }
  return neg ? -acc : acc;
};

const convert = (str, fromBase, toBase) => {
  if (!str || !isValidForBase(str, fromBase)) return null;
  const big = parseToBigInt(str, fromBase);
  if (big === null) return null;
  return big.toString(toBase).toUpperCase();
};

/* ---------------------------------------------------------------------------
   Static content
--------------------------------------------------------------------------- */

const TRUST_CHIPS = [
  { label: "100% Free", icon: BadgeCheck },
  { label: "Runs in Browser", icon: Globe },
  { label: "Privacy First", icon: Lock },
  { label: "No Installation", icon: CheckCircle2 },
];

const FEATURES = [
  { title: "Lightning Fast", desc: "Instant conversion in real-time.", icon: Zap, accent: "text-amber-500 bg-amber-500/10" },
  { title: "Privacy First", desc: "All conversion happens in your browser.", icon: ShieldCheck, accent: "text-emerald-500 bg-emerald-500/10" },
  { title: "Developer Friendly", desc: "Clean UI, accurate results, always.", icon: Code2, accent: "text-blue-500 bg-blue-500/10" },
  { title: "Unlimited Usage", desc: "Use it as much as you want.", icon: InfinityIcon, accent: "text-rose-500 bg-rose-500/10" },
  { title: "Works Everywhere", desc: "Desktop, tablet & mobile friendly.", icon: MonitorSmartphone, accent: "text-violet-500 bg-violet-500/10" },
];

const SYSTEMS = [
  { name: "Binary (Base 2)", badge: "2", desc: "Uses only 0 and 1.", example: "101101", usedIn: "Computing, Digital Electronics", accent: "bg-blue-500", text: "text-blue-600 dark:text-blue-400" },
  { name: "Decimal (Base 10)", badge: "10", desc: "Our everyday number system.", example: "45", usedIn: "Everyday Calculations", accent: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  { name: "Octal (Base 8)", badge: "8", desc: "Uses digits 0–7.", example: "55", usedIn: "Unix/Linux Permissions", accent: "bg-orange-500", text: "text-orange-600 dark:text-orange-400" },
  { name: "Hexadecimal (Base 16)", badge: "16", desc: "Uses 0–9 and A–F.", example: "2D", usedIn: "Memory, Color Codes, Networking", accent: "bg-violet-500", text: "text-violet-600 dark:text-violet-400" },
];

const STEPS = [
  { n: 1, title: "Enter Number", desc: "Type or paste the number you want to convert.", accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  { n: 2, title: "Choose Source Base", desc: "Select the base of your input number.", accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  { n: 3, title: "Choose Target Base", desc: "Select the base you want to convert to.", accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  { n: 4, title: "Instant Result", desc: "Get accurate results in real-time.", accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
];

const EXAMPLES = [
  { title: "Binary to Decimal", from: "101101", fromLabel: "Binary (Base 2)", to: "45", toLabel: "Decimal (Base 10)", pill: "bg-blue-500/10 text-blue-600 dark:text-blue-400", fromColor: "text-blue-600 dark:text-blue-400", toColor: "text-emerald-600 dark:text-emerald-400" },
  { title: "Decimal to Hexadecimal", from: "255", fromLabel: "Decimal (Base 10)", to: "FF", toLabel: "Hexadecimal (Base 16)", pill: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", fromColor: "text-emerald-600 dark:text-emerald-400", toColor: "text-violet-600 dark:text-violet-400" },
  { title: "Hexadecimal to Binary", from: "A3", fromLabel: "Hexadecimal (Base 16)", to: "10100011", toLabel: "Binary (Base 2)", pill: "bg-violet-500/10 text-violet-600 dark:text-violet-400", fromColor: "text-violet-600 dark:text-violet-400", toColor: "text-blue-600 dark:text-blue-400" },
];

/* ---------------------------------------------------------------------------
   Component
--------------------------------------------------------------------------- */

export default function ToolEntry() {
  const [value, setValue] = useState("101101");
  const [fromBase, setFromBase] = useState(2);
  const [toBase, setToBase] = useState(10);
  const [copied, setCopied] = useState(false);
  const converterRef = useRef(null);
  const examplesRef = useRef(null);

  const valid = isValidForBase(value, fromBase);
  const result = useMemo(() => (valid ? convert(value, fromBase, toBase) : null), [value, fromBase, toBase, valid]);

  // Live values for the hero orbit diagram
  const orbit = useMemo(() => {
    const src = valid && value ? value : "101101";
    const base = valid && value ? fromBase : 2;
    return {
      binary: convert(src, base, 2) || "—",
      decimal: convert(src, base, 10) || "—",
      octal: convert(src, base, 8) || "—",
      hex: convert(src, base, 16) || "—",
    };
  }, [value, fromBase, valid]);

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard?.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleSwap = () => {
    const converted = result;
    setFromBase(toBase);
    setToBase(fromBase);
    if (converted) setValue(converted.toLowerCase());
  };

  const handleClear = () => setValue("");

  const cycleBase = (dir) => {
    const order = BASES.map((b) => b.value);
    const idx = order.indexOf(toBase);
    const next = order[(idx + dir + order.length) % order.length];
    setToBase(next);
  };

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const selectCls =
    "w-full appearance-none rounded-xl border border-(--border) bg-(--background) px-3.5 py-2.5 text-[14px] font-medium text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)/30 transition";

  const orbitNode = (label, val, chip, delay) => (
    <div
      style={{ animation: `bcFloat 5.5s ease-in-out ${delay}s infinite` }}
      className="group/node flex w-28 flex-col items-center gap-0.5 rounded-2xl border border-(--border) bg-(--card)/90 px-3 py-2.5 shadow-lg shadow-black/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-(--primary)/50 hover:shadow-xl hover:shadow-(--primary)/10"
    >
      <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${chip}`}>{label}</span>
      <span key={val} style={{ animation: "bcPop .4s cubic-bezier(0.16,1,0.3,1)" }} className="max-w-full truncate font-mono text-[15px] font-bold text-(--foreground)">
        {val}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground) antialiased">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes bcSpin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes bcSpinRev { from { transform: rotate(360deg) } to { transform: rotate(0deg) } }
        @keyframes bcFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-7px) } }
        @keyframes bcPop { from { transform: scale(.7); opacity: 0 } to { transform: scale(1); opacity: 1 } }
        @keyframes bcGlow { 0%,100% { opacity: .45; transform: scale(1) } 50% { opacity: .9; transform: scale(1.06) } }
        @keyframes bcDrift { 0%,100% { opacity: .25; transform: translateY(0) } 50% { opacity: .75; transform: translateY(-6px) } }
        @keyframes bcPing { 0% { transform: scale(1); opacity: .45 } 80%,100% { transform: scale(1.55); opacity: 0 } }
      `,
        }}
      />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        {/* ------------------------------------------------ Hero */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-(--border) bg-(--card) px-3 py-1 text-[12px] font-semibold text-(--primary)">
              <Code2 className="w-3.5 h-3.5" /> Developer Tools
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Base <span className="text-(--primary)">Converter</span>
            </h1>
            <p className="mt-3 text-lg font-semibold text-(--foreground)">
              Convert Binary, Decimal, Octal &amp; Hexadecimal instantly.
            </p>
            <p className="mt-2 max-w-md text-[14px] leading-relaxed text-(--muted-foreground)">
              Fast, accurate, and effortless base conversion for developers, engineers, students, and curious minds.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => scrollTo(converterRef)}
                className="inline-flex items-center gap-2 rounded-xl bg-(--primary) px-5 py-2.5 text-[14px] font-semibold text-white shadow-lg shadow-(--primary)/20 hover:bg-(--primary)/90 transition-colors"
              >
                Start Converting <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollTo(examplesRef)}
                className="inline-flex items-center gap-2 rounded-xl border border-(--border) bg-(--card) px-5 py-2.5 text-[14px] font-semibold text-(--foreground) hover:bg-(--muted)/60 transition-colors"
              >
                See Examples
              </button>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
              {TRUST_CHIPS.map(({ label, icon: I }) => (
                <span key={label} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-(--muted-foreground)">
                  <I className="w-3.5 h-3.5 text-emerald-500" /> {label}
                </span>
              ))}
            </div>
          </div>

          {/* Orbit diagram — live values, animated */}
          <div className="relative mx-auto hidden h-[340px] w-[340px] sm:block lg:mx-0 lg:justify-self-center">
            {/* ambient gradient glow */}
            <div
              className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-500/20 via-violet-500/10 to-emerald-500/20 blur-2xl"
              style={{ animation: "bcGlow 6s ease-in-out infinite" }}
            />

            {/* rotating conic-gradient ring */}
            <div
              className="absolute inset-6 rounded-full opacity-70"
              style={{
                background: "conic-gradient(from 0deg, #3b82f6, #8b5cf6, #10b981, #f97316, #3b82f6)",
                WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2.5px))",
                mask: "radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2.5px))",
                animation: "bcSpin 14s linear infinite",
              }}
            />
            {/* soft blurred copy of the ring for glow */}
            <div
              className="absolute inset-6 rounded-full opacity-30 blur-[6px]"
              style={{
                background: "conic-gradient(from 0deg, #3b82f6, #8b5cf6, #10b981, #f97316, #3b82f6)",
                WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 5px))",
                mask: "radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 5px))",
                animation: "bcSpin 14s linear infinite",
              }}
            />
            {/* counter-rotating dashed ring */}
            <div
              className="absolute inset-12 rounded-full border border-dashed border-(--border)"
              style={{ animation: "bcSpinRev 40s linear infinite" }}
            />

            {/* traveling dots on the ring */}
            <div className="absolute inset-6" style={{ animation: "bcSpin 8s linear infinite" }}>
              <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 shadow-[0_0_10px_2px_rgba(59,130,246,0.7)]" />
            </div>
            <div className="absolute inset-6" style={{ animation: "bcSpinRev 11s linear infinite" }}>
              <span className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-violet-500 shadow-[0_0_10px_2px_rgba(139,92,246,0.7)]" />
            </div>

            {/* drifting binary digits */}
            <span className="absolute left-0 top-10 font-mono text-[11px] text-(--muted-foreground) select-none" style={{ animation: "bcDrift 5s ease-in-out infinite" }}>0101</span>
            <span className="absolute right-2 top-16 font-mono text-[11px] text-(--muted-foreground) select-none" style={{ animation: "bcDrift 6.5s ease-in-out 1s infinite" }}>1011</span>
            <span className="absolute bottom-14 left-2 font-mono text-[11px] text-(--muted-foreground) select-none" style={{ animation: "bcDrift 5.8s ease-in-out .5s infinite" }}>0101</span>
            <span className="absolute bottom-8 right-6 font-mono text-[11px] text-(--muted-foreground) select-none" style={{ animation: "bcDrift 7s ease-in-out 1.6s infinite" }}>1110</span>

            {/* nodes */}
            <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2">{orbitNode("Binary", orbit.binary, "bg-blue-500/10 text-blue-600 dark:text-blue-400", 0)}</div>
            <div className="absolute right-0 top-1/2 z-10 -translate-y-1/2">{orbitNode("Decimal", orbit.decimal, "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", 0.9)}</div>
            <div className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2">{orbitNode("Octal", orbit.octal, "bg-orange-500/10 text-orange-600 dark:text-orange-400", 1.8)}</div>
            <div className="absolute left-0 top-1/2 z-10 -translate-y-1/2">{orbitNode("Hexadecimal", orbit.hex, "bg-violet-500/10 text-violet-600 dark:text-violet-400", 2.7)}</div>

            {/* center swap — gradient + pulse */}
            <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
              <span
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600"
                style={{ animation: "bcPing 2.6s cubic-bezier(0,0,0.2,1) infinite" }}
              />
              <button
                onClick={handleSwap}
                aria-label="Swap bases"
                className="group/swap relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-transform"
              >
                <ArrowRightLeft className="w-6 h-6 transition-transform duration-500 group-hover/swap:rotate-180" />
              </button>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------ Converter card */}
        <div ref={converterRef} className="mt-12 scroll-mt-24 rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold tracking-tight">Base Converter</h2>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Live
            </span>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-(--foreground)">Enter Number</label>
              <div className="relative">
                <input
                  value={value}
                  onChange={(e) => setValue(e.target.value.trim())}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp") { e.preventDefault(); cycleBase(-1); }
                    if (e.key === "ArrowDown") { e.preventDefault(); cycleBase(1); }
                  }}
                  placeholder="e.g. 101101"
                  spellCheck={false}
                  className={`w-full rounded-xl border bg-(--background) px-3.5 py-2.5 pr-10 font-mono text-[15px] text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 transition ${
                    valid ? "border-(--border) focus:ring-(--primary)/30" : "border-red-500/60 focus:ring-red-500/30"
                  }`}
                />
                {value && (
                  <button onClick={handleClear} aria-label="Clear input" className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded-md text-(--muted-foreground) hover:bg-(--muted)/60 hover:text-(--foreground)">
                    <Eraser className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {!valid && (
                <p className="mt-1.5 text-[12px] font-medium text-red-500">
                  Invalid digits for {BASES.find((b) => b.value === fromBase)?.label}.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-(--foreground)">From Base</label>
                <select value={fromBase} onChange={(e) => setFromBase(Number(e.target.value))} className={selectCls}>
                  {BASES.map((b) => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSwap}
                aria-label="Swap from and to bases"
                className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-xl border border-(--border) bg-(--background) text-(--primary) hover:bg-(--muted)/60 active:scale-95 transition-all sm:mb-0.5"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-(--foreground)">To Base</label>
                <select value={toBase} onChange={(e) => setToBase(Number(e.target.value))} className={selectCls}>
                  {BASES.map((b) => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-(--foreground)">Result</label>
              <div className="relative">
                <div className="min-h-[52px] w-full rounded-xl border border-(--border) bg-(--muted)/40 px-3.5 py-3 pr-12 font-mono text-xl font-bold text-(--foreground) break-all">
                  {value ? (result ?? <span className="text-[14px] font-medium text-red-500">Invalid input</span>) : <span className="text-[14px] font-medium text-(--muted-foreground)">Result appears here…</span>}
                </div>
                <button
                  onClick={handleCopy}
                  aria-label="Copy result"
                  disabled={!result}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-(--border) bg-(--card) text-(--muted-foreground) hover:text-(--foreground) disabled:opacity-40 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-(--border) pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[12px] font-semibold text-(--muted-foreground)">Quick Actions:</span>
                <button onClick={handleCopy} disabled={!result} className="inline-flex items-center gap-1.5 rounded-lg border border-(--border) px-3 py-1.5 text-[12px] font-medium text-(--foreground) hover:bg-(--muted)/60 disabled:opacity-40 transition-colors">
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />} Copy
                </button>
                <button onClick={handleSwap} className="inline-flex items-center gap-1.5 rounded-lg border border-(--border) px-3 py-1.5 text-[12px] font-medium text-(--foreground) hover:bg-(--muted)/60 transition-colors">
                  <ArrowDownUp className="w-3 h-3" /> Swap
                </button>
                <button onClick={handleClear} className="inline-flex items-center gap-1.5 rounded-lg border border-(--border) px-3 py-1.5 text-[12px] font-medium text-(--foreground) hover:bg-(--muted)/60 transition-colors">
                  <Eraser className="w-3 h-3" /> Clear
                </button>
              </div>
              <p className="text-[12px] text-(--muted-foreground)">
                Tip: Use keyboard <kbd className="rounded border border-(--border) bg-(--muted)/50 px-1 font-mono text-[10px]">↑</kbd>{" "}
                <kbd className="rounded border border-(--border) bg-(--muted)/50 px-1 font-mono text-[10px]">↓</kbd> to switch bases
              </p>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------ Feature strip */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {FEATURES.map(({ title, desc, icon: I, accent }) => (
            <div key={title} className="rounded-2xl border border-(--border) bg-(--card) p-4">
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${accent}`}>
                <I className="w-4 h-4" />
              </span>
              <p className="mt-2.5 text-[13px] font-semibold text-(--foreground)">{title}</p>
              <p className="mt-0.5 text-[12px] leading-snug text-(--muted-foreground)">{desc}</p>
            </div>
          ))}
        </div>

        {/* ------------------------------------------------ Supported systems */}
        <section className="mt-14">
          <h2 className="text-center text-xl font-bold tracking-tight sm:text-2xl">Supported Number Systems</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SYSTEMS.map((s) => (
              <div key={s.name} className="rounded-2xl border border-(--border) bg-(--card) p-5">
                <div className="flex items-center gap-2.5">
                  <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-[12px] font-bold text-white ${s.accent}`}>{s.badge}</span>
                  <h3 className="text-[14px] font-bold text-(--foreground)">{s.name}</h3>
                </div>
                <p className="mt-2.5 text-[12px] text-(--muted-foreground)">{s.desc}</p>
                <p className="mt-2 text-[12px] text-(--muted-foreground)">
                  Example: <span className={`font-mono font-bold ${s.text}`}>{s.example}</span>
                </p>
                <p className="mt-1 text-[12px] text-(--muted-foreground)">
                  Used in: <span className="font-medium text-(--foreground)">{s.usedIn}</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------ How it works */}
        <section className="mt-14">
          <h2 className="text-center text-xl font-bold tracking-tight sm:text-2xl">How It Works</h2>
          <div className="mt-6 rounded-2xl border border-(--border) bg-(--card) p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((st, i) => (
                <div key={st.n} className="relative flex flex-col items-center text-center">
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-[15px] font-bold ${st.accent}`}>{st.n}</span>
                  <p className="mt-3 text-[14px] font-semibold text-(--foreground)">{st.title}</p>
                  <p className="mt-1 text-[12px] leading-snug text-(--muted-foreground)">{st.desc}</p>
                  {i < STEPS.length - 1 && (
                    <ArrowRight className="absolute -right-4 top-3 hidden w-4 h-4 text-(--muted-foreground)/50 lg:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ Examples */}
        <section ref={examplesRef} className="mt-14 scroll-mt-24 pb-4">
          <h2 className="text-center text-xl font-bold tracking-tight sm:text-2xl">Conversion Examples</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {EXAMPLES.map((ex) => (
              <div key={ex.title} className="rounded-2xl border border-(--border) bg-(--card) p-5 text-center">
                <span className={`inline-flex rounded-full px-3 py-1 text-[12px] font-semibold ${ex.pill}`}>{ex.title}</span>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <div>
                    <p className={`font-mono text-xl font-bold ${ex.fromColor}`}>{ex.from}</p>
                    <p className="mt-0.5 text-[11px] text-(--muted-foreground)">{ex.fromLabel}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 shrink-0 text-(--muted-foreground)" />
                  <div>
                    <p className={`font-mono text-xl font-bold ${ex.toColor}`}>{ex.to}</p>
                    <p className="mt-0.5 text-[11px] text-(--muted-foreground)">{ex.toLabel}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setValue(ex.from.toLowerCase());
                    setFromBase(ex.fromLabel.includes("2)") ? 2 : ex.fromLabel.includes("10") ? 10 : 16);
                    setToBase(ex.toLabel.includes("2)") ? 2 : ex.toLabel.includes("10") ? 10 : 16);
                    scrollTo(converterRef);
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-(--border) px-3 py-1.5 text-[12px] font-medium text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--muted)/60 transition-colors"
                >
                  <Sparkles className="w-3 h-3" /> Try it
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
