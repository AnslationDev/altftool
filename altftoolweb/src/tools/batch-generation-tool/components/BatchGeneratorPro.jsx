"use client";

/**
 * Batch Generator — full product UI (recreated from the design reference,
 * every section responsive).
 *
 * Sections: hero (badges, headline, trust pills, decorative generator visual),
 * live workspace (pattern config ⇄ results console), stats strip, feature
 * grid, how-it-works, use-cases / examples / quick-actions trio, FAQ and
 * related-tools chips.
 *
 * All generation is client-side via utils/batchEngine (unit-tested). Results
 * are LIVE — they recompute as the config changes; the Generate button
 * re-rolls random tokens and (on small screens) scrolls to the results.
 * Surfaces use the site's semantic tokens so light AND dark themes both work;
 * the blue brand accent stays constant like the reference.
 */

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ClipboardList,
  Code2,
  Copy,
  Cpu,
  Download,
  FileJson,
  FileText,
  Hash,
  Layers,
  ListChecks,
  Loader2,
  Package,
  QrCode,
  Regex,
  RotateCcw,
  Save,
  ScanLine,
  Search,
  Shield,
  ShieldCheck,
  Shuffle,
  Sparkles,
  Timer,
  Trash2,
  Type,
  Upload,
  Wand2,
  Zap,
} from "lucide-react";
import {
  MAX_ITEMS,
  formatBytes,
  generateBatchTimed,
  toCsv,
  toJson,
} from "../utils/batchEngine";

/* ---------------------------------- brand ---------------------------------- */

const BLUE = "#2563EB";
const BLUE_GRAD = "linear-gradient(135deg, #3B82F6 0%, #2563EB 55%, #1D4ED8 100%)";
const PRESET_KEY = "ALTFT_BATCH_GENERATOR_PRESET_V1";
const DISPLAY_LIMIT = 100;

const DEFAULT_CFG = {
  type: "sequential",
  pattern: "ALT-{00000}",
  start: 1,
  end: 10000,
  step: 1,
  count: 100,
  customList: "",
  prefix: "",
  suffix: "",
  uppercase: false,
  uniqueOnly: true,
};

const TYPES = [
  { id: "sequential", label: "Sequential", sub: "1, 2, 3, 4…", icon: ListChecks },
  { id: "text", label: "Text Pattern", sub: "Prefix, suffix…", icon: Type },
  { id: "random", label: "Random", sub: "Random data", icon: Shuffle },
  { id: "custom", label: "Custom List", sub: "Your own list", icon: ClipboardList },
];

const TOKEN_CHIPS = [
  { token: "{N}", label: "Number" },
  { token: "{000}", label: "Zero Pad" },
  { token: "{A}", label: "Uppercase" },
  { token: "{a}", label: "Lowercase" },
  { token: "{R}", label: "Random" },
];

const TRUST_PILLS = [
  { icon: Shield, title: "100% Local", sub: "No data stored" },
  { icon: Cpu, title: "Browser Based", sub: "Runs everywhere" },
  { icon: ShieldCheck, title: "Privacy First", sub: "Your data stays safe" },
  { icon: Zap, title: "Lightning Fast", sub: "Instant results" },
];

const FEATURES = [
  { icon: Wand2, title: "Smart Patterns", sub: "Powerful variables and formatting" },
  { icon: Sparkles, title: "Real-time Preview", sub: "See results instantly as you type" },
  { icon: Package, title: "Export Anywhere", sub: "TXT, CSV, JSON & more formats" },
  { icon: Layers, title: "Duplicate Prevention", sub: "Ensure unique values only" },
  { icon: Zap, title: "Lightning Fast", sub: "Generate thousands of items in seconds" },
  { icon: Shield, title: "Secure & Private", sub: "All processing done locally" },
];

const STEPS = [
  { n: 1, title: "Choose Pattern", sub: "Select a pattern type or create your own." },
  { n: 2, title: "Configure Settings", sub: "Set range, variables and advanced options." },
  { n: 3, title: "Generate", sub: "Click generate and let our engine do the work." },
  { n: 4, title: "Use / Export", sub: "Copy, download or export your data instantly." },
];

const USE_CASES = [
  "Generate Serial Numbers",
  "Create Usernames & IDs",
  "Bulk Email Generation",
  "Coupon & Voucher Codes",
  "SKU / Product Codes",
  "API Keys & Tokens",
];

const EXAMPLES = [
  { pattern: "ALT-{000}", output: "ALT-001, ALT-002, ALT-003…" },
  { pattern: "User_{0000}", output: "User_0001, User_0002…" },
  { pattern: "INV-{YYYY}-{00000}", output: "INV-2026-00001, INV-2026…" },
  { pattern: "CODE-{A}{N}{N}{N}", output: "CODE-A123, CODE-B456…" },
];

const FAQS = [
  {
    q: "Is my data stored or sent anywhere?",
    a: "No. Everything runs entirely in your browser — patterns, results and presets never leave your device. Presets you save live in your own browser's local storage only.",
  },
  {
    q: "Can I generate random values?",
    a: "Yes. Pick the Random pattern type and use tokens like {A} (uppercase letter), {a} (lowercase), {N} (digit) or {R} (any alphanumeric). Turn on Unique Only to guarantee no duplicates.",
  },
  {
    q: "What export formats are supported?",
    a: "You can copy everything to the clipboard, or download the results as plain TXT, CSV (with an index column) or a JSON array.",
  },
];

const RELATED = [
  { slug: "text-case-converter", label: "Text Case Converter", icon: Type },
  { slug: "regex-tester", label: "Regex Tester", icon: Regex },
  { slug: "json-formatter", label: "JSON Formatter", icon: FileJson },
  { slug: "uuid-generator", label: "UUID Generator", icon: Hash },
  { slug: "md5-hash-generator", label: "Hash Generator", icon: Hash },
  { slug: "barcode-generator", label: "Barcode Generator", icon: QrCode },
  { slug: "base64-to-ascii", label: "Base64 Decoder", icon: Code2 },
  { slug: "base64-url-encoder", label: "URL Encoder", icon: ScanLine },
];

/* -------------------------------- small bits ------------------------------- */

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative h-6 w-11 flex-none rounded-full transition-colors motion-reduce:transition-none"
      style={{ background: checked ? BLUE : "var(--border)" }}
    >
      <span
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform motion-reduce:transition-none"
        style={{ transform: checked ? "translateX(22px)" : "translateX(2px)", left: 0 }}
      />
    </button>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="mb-2.5 text-[13px] font-bold text-(--foreground)">{children}</div>
  );
}

function FieldInput({ label, ...props }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-[12px] font-semibold text-(--muted-foreground)">{label}</span>
      <input
        {...props}
        className={`w-full rounded-xl border border-(--border) bg-(--background) px-3 py-2.5 text-[14px] text-(--foreground) outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15 ${props.readOnly ? "font-bold text-[#2563EB]" : ""}`}
      />
    </label>
  );
}

/* --------------------------------- component ------------------------------- */

export default function BatchGeneratorPro() {
  const [cfg, setCfg] = useState(DEFAULT_CFG);
  const [nonce, setNonce] = useState(0); // Generate re-rolls random tokens
  const [pulse, setPulse] = useState(false);
  const [copiedKey, setCopiedKey] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [presetSaved, setPresetSaved] = useState(false);
  const patternRef = useRef(null);
  const resultsRef = useRef(null);
  const fileRef = useRef(null);
  const copyTimer = useRef(0);

  const set = useCallback((patch) => setCfg((c) => ({ ...c, ...patch })), []);

  /* ------------------------------ live generation ----------------------------- */

  // `nonce` is a deliberate dependency: Generate re-rolls random tokens.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { items, capped, elapsedMs, bytes } = useMemo(() => generateBatchTimed(cfg), [cfg, nonce]);

  const totalSequential = useMemo(() => {
    const st = Math.max(1, Math.trunc(cfg.step) || 1);
    const span = Math.trunc(cfg.end) - Math.trunc(cfg.start);
    return span < 0 ? 0 : Math.min(Math.floor(span / st) + 1, MAX_ITEMS);
  }, [cfg.start, cfg.end, cfg.step]);

  const filtered = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    return items.filter((v) => v.toLowerCase().includes(q));
  }, [items, query]);

  const displaySource = filtered ?? items;
  const displayRows = displaySource.slice(0, DISPLAY_LIMIT);
  const hasTail = displaySource.length > DISPLAY_LIMIT + 1;
  const lastRow = displaySource.length > DISPLAY_LIMIT ? displaySource[displaySource.length - 1] : null;

  /* --------------------------------- actions --------------------------------- */

  const flashCopied = useCallback((key) => {
    setCopiedKey(key);
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopiedKey(""), 1500);
  }, []);

  const copyText = useCallback(async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      flashCopied(key);
    } catch {
      /* clipboard blocked — nothing to break */
    }
  }, [flashCopied]);

  const download = useCallback((content, filename, mime) => {
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, []);

  const onGenerate = useCallback(() => {
    setNonce((n) => n + 1);
    setPulse(true);
    window.setTimeout(() => setPulse(false), 550);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const insertToken = useCallback((token) => {
    const el = patternRef.current;
    setCfg((c) => {
      if (!el) return { ...c, pattern: c.pattern + token };
      const s = el.selectionStart ?? c.pattern.length;
      const e = el.selectionEnd ?? c.pattern.length;
      return { ...c, pattern: c.pattern.slice(0, s) + token + c.pattern.slice(e) };
    });
    el?.focus();
  }, []);

  const onImportFile = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      set({ type: "custom", customList: String(reader.result || "").slice(0, 500000) });
    reader.readAsText(file);
    e.target.value = "";
  }, [set]);

  const savePreset = useCallback(() => {
    try {
      window.localStorage.setItem(PRESET_KEY, JSON.stringify(cfg));
      setPresetSaved(true);
      window.setTimeout(() => setPresetSaved(false), 1600);
    } catch {
      /* storage unavailable */
    }
  }, [cfg]);

  const loadSample = useCallback(() => {
    setCfg({ ...DEFAULT_CFG });
    setQuery("");
  }, []);

  const typeLabel = TYPES.find((t) => t.id === cfg.type)?.label || "—";

  /* ---------------------------------- render --------------------------------- */

  return (
    <div className="bgen-scope w-full text-(--foreground)">
      <style>{`
        @keyframes bgenPulse{0%{transform:scale(1)}45%{transform:scale(.97)}100%{transform:scale(1)}}
        @keyframes bgenSpin{to{transform:rotate(360deg)}}
        @media (prefers-reduced-motion: no-preference){
          .bgen-pulse{animation:bgenPulse .55s ease}
          .bgen-spin{animation:bgenSpin 1.2s linear infinite}
        }
      `}</style>

      {/* ===================== HERO ===================== */}
      <section className="relative grid items-center gap-8 px-1 pb-10 pt-6 sm:px-2 sm:pt-8 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="mb-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-(--border) bg-(--card) px-3 py-1.5 text-[12.5px] font-semibold" style={{ color: BLUE }}>
              <Code2 className="h-3.5 w-3.5" /> Developer Tools
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold text-white" style={{ background: BLUE_GRAD }}>
              <Layers className="h-3.5 w-3.5" /> Batch Generation Tool
            </span>
          </div>

          <h1 className="text-4xl font-extrabold leading-[1.06] tracking-tight sm:text-5xl">
            Batch Generate
            <br />
            Anything.{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: BLUE_GRAD, WebkitBackgroundClip: "text" }}>
              Instantly.
            </span>
          </h1>

          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-(--muted-foreground)">
            Generate thousands of unique values using powerful patterns, sequences,
            and smart variables. Save time. Boost productivity.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:max-w-xl">
            {TRUST_PILLS.map(({ icon: Icon, title, sub }) => (
              <div key={title} className="rounded-xl border border-(--border) bg-(--card) px-3 py-2.5 shadow-sm">
                <div className="flex items-center gap-1.5 text-[12.5px] font-bold">
                  <Icon className="h-3.5 w-3.5" style={{ color: BLUE }} />
                  {title}
                </div>
                <div className="mt-0.5 text-[11.5px] text-(--muted-foreground)">{sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* decorative generator visual (desktop only) */}
        <div aria-hidden="true" className="relative hidden select-none lg:block">
          <div className="grid grid-cols-[auto_1fr] items-start gap-4">
            <div className="flex flex-col gap-3">
              {[
                ["Pattern", "ALT-{00000}"],
                ["Count", "10,000"],
                ["Preview", "ALT-*****"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-(--border) bg-(--card) px-4 py-2.5 shadow-sm">
                  <div className="text-[11px] font-semibold text-(--muted-foreground)">{k}</div>
                  <div className="font-mono text-[12.5px] font-bold">{v}</div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-(--border) bg-(--card) p-4 shadow-lg">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[13px] font-bold">Generating…</span>
                <Loader2 className="bgen-spin h-4 w-4" style={{ color: BLUE }} />
              </div>
              {["ALT-00001", "ALT-00002", "ALT-00003", "ALT-00004", "ALT-00005"].map((v) => (
                <div key={v} className="flex items-center justify-between border-b border-(--border) py-1.5 font-mono text-[12.5px] text-(--muted-foreground) last:border-0">
                  {v}
                  <span className="h-2 w-2 rounded-full bg-(--border)" />
                </div>
              ))}
              <div className="mt-1.5 flex items-center justify-between rounded-lg px-2 py-1.5 font-mono text-[12.5px] font-bold" style={{ background: "rgba(16,164,107,.1)", color: "#16A46B" }}>
                ALT-10000 <Check className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
          <span className="absolute -left-2 bottom-6 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl" style={{ background: BLUE_GRAD }}>
            <Zap className="h-6 w-6" />
          </span>
        </div>
      </section>

      {/* ===================== WORKSPACE ===================== */}
      <section className="grid items-start gap-4 px-1 sm:px-2 lg:grid-cols-2">
        {/* -------- config card -------- */}
        <div className="rounded-2xl border border-(--border) bg-(--card) p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-[17px] font-extrabold">Batch Generator</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-(--border) px-2.5 py-1 text-[11.5px] font-bold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live
            </span>
          </div>

          {/* 1. type */}
          <SectionLabel>1. Choose Pattern Type</SectionLabel>
          <div className="mb-5 grid grid-cols-2 gap-2 md:grid-cols-4">
            {TYPES.map(({ id, label, sub, icon: Icon }) => {
              const active = cfg.type === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => set({ type: id })}
                  className="rounded-xl border p-3 text-left transition active:scale-[.98] motion-reduce:transition-none"
                  style={
                    active
                      ? { borderColor: BLUE, background: "rgba(37,99,235,.06)", boxShadow: "0 0 0 1px " + BLUE }
                      : { borderColor: "var(--border)", background: "var(--background)" }
                  }
                >
                  <Icon className="mb-1.5 h-4 w-4" style={{ color: active ? BLUE : "var(--muted-foreground)" }} />
                  <div className="text-[13px] font-bold">{label}</div>
                  <div className="text-[11.5px] text-(--muted-foreground)">{sub}</div>
                </button>
              );
            })}
          </div>

          {/* 2. pattern / custom list */}
          <SectionLabel>2. Configure Pattern</SectionLabel>
          {cfg.type === "custom" ? (
            <textarea
              value={cfg.customList}
              onChange={(e) => set({ customList: e.target.value })}
              placeholder={"One item per line…\nalpha\nbeta\ngamma"}
              spellCheck={false}
              className="mb-5 min-h-[120px] w-full resize-y rounded-xl border border-(--border) bg-(--background) p-3 font-mono text-[13.5px] text-(--foreground) outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15"
            />
          ) : (
            <div className="mb-5">
              <div className="flex gap-2">
                <input
                  ref={patternRef}
                  value={cfg.pattern}
                  onChange={(e) => set({ pattern: e.target.value })}
                  spellCheck={false}
                  aria-label="Pattern"
                  className="w-full rounded-xl border border-(--border) bg-(--background) px-3.5 py-3 font-mono text-[14px] text-(--foreground) outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15"
                />
                <span className="hidden h-[46px] w-[46px] flex-none items-center justify-center rounded-xl border border-(--border) bg-(--background) font-mono text-[13px] text-(--muted-foreground) sm:flex">
                  {"{}"}
                </span>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {TOKEN_CHIPS.map(({ token, label }) => (
                  <button
                    key={token}
                    type="button"
                    onClick={() => insertToken(token)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-(--border) bg-(--background) px-2.5 py-1.5 text-[12px] font-semibold text-(--muted-foreground) transition hover:border-[#2563EB] hover:text-[#2563EB] active:scale-95 motion-reduce:transition-none"
                  >
                    <span className="font-mono font-bold text-(--foreground)">{token}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. range */}
          <SectionLabel>3. Set Range</SectionLabel>
          <div className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {cfg.type === "sequential" ? (
              <>
                <FieldInput label="Start" type="number" value={cfg.start} onChange={(e) => set({ start: Number(e.target.value) })} />
                <FieldInput label="End" type="number" value={cfg.end} onChange={(e) => set({ end: Number(e.target.value) })} />
                <FieldInput label="Step" type="number" min={1} value={cfg.step} onChange={(e) => set({ step: Number(e.target.value) })} />
                <FieldInput label="Total Count" readOnly value={totalSequential.toLocaleString()} />
              </>
            ) : cfg.type === "custom" ? (
              <FieldInput label="Items in list" readOnly value={items.length.toLocaleString()} />
            ) : (
              <>
                <FieldInput label="Start" type="number" value={cfg.start} onChange={(e) => set({ start: Number(e.target.value) })} />
                <FieldInput label="Count" type="number" min={0} max={MAX_ITEMS} value={cfg.count} onChange={(e) => set({ count: Number(e.target.value) })} />
              </>
            )}
          </div>

          {/* 4. advanced */}
          <SectionLabel>4. Advanced Options</SectionLabel>
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2.5">
              <Toggle checked={Boolean(cfg.prefix)} onChange={(on) => set({ prefix: on ? "item-" : "" })} label="Add prefix" />
              <span className="w-20 flex-none text-[13px] font-semibold">Add Prefix</span>
              <input
                value={cfg.prefix}
                onChange={(e) => set({ prefix: e.target.value })}
                placeholder="item-"
                className="w-full min-w-0 rounded-lg border border-(--border) bg-(--background) px-2.5 py-1.5 text-[13px] outline-none focus:border-[#2563EB]"
              />
            </div>
            <div className="flex items-center gap-2.5">
              <Toggle checked={Boolean(cfg.suffix)} onChange={(on) => set({ suffix: on ? ".txt" : "" })} label="Add suffix" />
              <span className="w-20 flex-none text-[13px] font-semibold">Add Suffix</span>
              <input
                value={cfg.suffix}
                onChange={(e) => set({ suffix: e.target.value })}
                placeholder=".txt"
                className="w-full min-w-0 rounded-lg border border-(--border) bg-(--background) px-2.5 py-1.5 text-[13px] outline-none focus:border-[#2563EB]"
              />
            </div>
            <div className="flex items-center gap-2.5">
              <Toggle checked={cfg.uppercase} onChange={(on) => set({ uppercase: on })} label="Uppercase" />
              <span className="text-[13px] font-semibold">Uppercase</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Toggle checked={cfg.uniqueOnly} onChange={(on) => set({ uniqueOnly: on })} label="Unique only" />
              <span className="text-[13px] font-semibold">Unique Only</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onGenerate}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-bold text-white shadow-lg transition-transform hover:scale-[1.01] active:scale-[.98] motion-reduce:transition-none ${pulse ? "bgen-pulse" : ""}`}
            style={{ background: BLUE_GRAD, boxShadow: "0 10px 24px rgba(37,99,235,.35)" }}
          >
            <Zap className="h-5 w-5" /> Generate Data
          </button>
        </div>

        {/* -------- results card -------- */}
        <div ref={resultsRef} className="flex flex-col rounded-2xl border border-(--border) bg-(--card) p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-[17px] font-extrabold">Generated Results</h2>
              <span className="rounded-full px-2.5 py-1 text-[11.5px] font-bold text-white" style={{ background: BLUE_GRAD }}>
                {items.length.toLocaleString()} items
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label="Search results"
                aria-pressed={searchOpen}
                onClick={() => { setSearchOpen((o) => !o); setQuery(""); }}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-(--border) bg-(--background) text-(--muted-foreground) transition hover:text-[#2563EB]"
              >
                <Search className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Copy all results"
                onClick={() => copyText(items.join("\n"), "all")}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-(--border) bg-(--background) text-(--muted-foreground) transition hover:text-[#2563EB]"
              >
                {copiedKey === "all" ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </button>
              <button
                type="button"
                aria-label="Download as TXT"
                onClick={() => download(items.join("\n"), "batch-data.txt", "text/plain")}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-(--border) bg-(--background) text-(--muted-foreground) transition hover:text-[#2563EB]"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>

          {searchOpen ? (
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter results…"
              className="mb-3 w-full rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-[13.5px] outline-none focus:border-[#2563EB]"
            />
          ) : null}

          <div className="min-h-[280px] flex-1 overflow-auto rounded-xl border border-(--border) bg-(--background) font-mono text-[13px] leading-relaxed lg:max-h-[420px]">
            {displaySource.length === 0 ? (
              <p className="p-4 text-(--muted-foreground)">
                {query ? "No matches for your filter." : "Configure a pattern to see live results…"}
              </p>
            ) : (
              <div className="py-2">
                {displayRows.map((v, i) => (
                  <div key={i} className="group flex items-center gap-3 px-3 py-0.5 hover:bg-[#2563EB]/5">
                    <span className="w-10 flex-none select-none text-right text-(--muted-foreground)/60">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate">{v}</span>
                    <button
                      type="button"
                      aria-label={`Copy row ${i + 1}`}
                      onClick={() => copyText(v, `row-${i}`)}
                      className="flex h-6 w-6 flex-none items-center justify-center rounded text-(--muted-foreground)/50 opacity-100 transition hover:text-[#2563EB] lg:opacity-0 lg:group-hover:opacity-100"
                    >
                      {copiedKey === `row-${i}` ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                ))}
                {hasTail ? <div className="px-3 py-1 text-(--muted-foreground)">… {(displaySource.length - DISPLAY_LIMIT - 1).toLocaleString()} more items</div> : null}
                {lastRow !== null ? (
                  <div className="flex items-center gap-3 px-3 py-0.5">
                    <span className="w-10 flex-none text-right text-(--muted-foreground)/60">{displaySource.length}</span>
                    <span className="min-w-0 flex-1 truncate">{lastRow}</span>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {capped ? (
            <p className="mt-2 text-[12px] font-semibold text-amber-500">
              Capped at {MAX_ITEMS.toLocaleString()} items per run.
            </p>
          ) : null}

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button type="button" onClick={() => copyText(items.join("\n"), "footer")} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-(--border) bg-(--background) px-3 py-2.5 text-[13px] font-bold transition hover:border-[#2563EB] hover:text-[#2563EB] active:scale-[.97]">
              {copiedKey === "footer" ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />} Copy All
            </button>
            <button type="button" onClick={() => download(items.join("\n"), "batch-data.txt", "text/plain")} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-(--border) bg-(--background) px-3 py-2.5 text-[13px] font-bold transition hover:border-[#2563EB] hover:text-[#2563EB] active:scale-[.97]">
              <Download className="h-4 w-4" /> Download
            </button>
            <div className="relative">
              <button
                type="button"
                aria-expanded={exportOpen}
                onClick={() => setExportOpen((o) => !o)}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-(--border) bg-(--background) px-3 py-2.5 text-[13px] font-bold transition hover:border-[#2563EB] hover:text-[#2563EB] active:scale-[.97]"
              >
                <Package className="h-4 w-4" /> Export As
              </button>
              {exportOpen ? (
                <div className="absolute bottom-[110%] left-0 z-10 w-full overflow-hidden rounded-xl border border-(--border) bg-(--card) shadow-lg">
                  {[
                    ["TXT", () => download(items.join("\n"), "batch-data.txt", "text/plain")],
                    ["CSV", () => download(toCsv(items), "batch-data.csv", "text/csv")],
                    ["JSON", () => download(toJson(items), "batch-data.json", "application/json")],
                  ].map(([label, fn]) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => { fn(); setExportOpen(false); }}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] font-semibold transition hover:bg-[#2563EB]/8 hover:text-[#2563EB]"
                    >
                      <FileText className="h-4 w-4" /> {label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <button type="button" onClick={() => set({ pattern: "", customList: "" })} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-500/5 px-3 py-2.5 text-[13px] font-bold text-rose-500 transition hover:bg-rose-500/10 active:scale-[.97] dark:border-rose-500/30">
              <Trash2 className="h-4 w-4" /> Clear All
            </button>
          </div>
        </div>
      </section>

      {/* ===================== STATS STRIP ===================== */}
      <section className="mt-6 grid grid-cols-2 gap-3 px-1 sm:px-2 md:grid-cols-3 xl:grid-cols-5">
        {[
          { icon: Timer, label: "Total Generated", value: items.length.toLocaleString(), sub: "Items" },
          { icon: Zap, label: "Processing Time", value: `${(elapsedMs / 1000).toFixed(3)}s`, sub: "Super fast" },
          { icon: FileText, label: "Total Size", value: formatBytes(bytes), sub: "(approx.)" },
          { icon: Hash, label: "Pattern Type", value: typeLabel, sub: cfg.type === "custom" ? "Your list" : cfg.pattern || "—" },
          { icon: Cpu, label: "Memory Used", value: formatBytes(Math.round(bytes * 2.2)), sub: "Peak usage" },
        ].map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="flex items-start justify-between gap-2 rounded-2xl border border-(--border) bg-(--card) p-4 shadow-sm">
            <div className="min-w-0">
              <div className="text-[11.5px] font-semibold text-(--muted-foreground)">{label}</div>
              <div className="truncate text-[19px] font-extrabold tabular-nums">{value}</div>
              <div className="truncate text-[11.5px] text-(--muted-foreground)">{sub}</div>
            </div>
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl" style={{ background: "rgba(37,99,235,.1)", color: BLUE }}>
              <Icon className="h-[18px] w-[18px]" />
            </span>
          </div>
        ))}
      </section>

      {/* ===================== FEATURES ===================== */}
      <section className="mt-6 grid grid-cols-1 gap-3 px-1 sm:grid-cols-2 sm:px-2 lg:grid-cols-3 xl:grid-cols-6">
        {FEATURES.map(({ icon: Icon, title, sub }) => (
          <div key={title} className="rounded-2xl border border-(--border) bg-(--card) p-4 shadow-sm">
            <span className="mb-2.5 inline-flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(37,99,235,.1)", color: BLUE }}>
              <Icon className="h-5 w-5" />
            </span>
            <div className="text-[13.5px] font-bold">{title}</div>
            <div className="mt-1 text-[12px] leading-relaxed text-(--muted-foreground)">{sub}</div>
          </div>
        ))}
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section className="mt-10 px-1 sm:px-2">
        <h2 className="mb-5 text-center text-xl font-extrabold">How It Works</h2>
        <ol className="grid grid-cols-1 gap-3 rounded-2xl border border-(--border) bg-(--card) p-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.n} className="relative flex items-start gap-3 p-2">
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full text-[15px] font-extrabold" style={{ background: "rgba(37,99,235,.1)", color: BLUE }}>
                {s.n}
              </span>
              <div>
                <div className="text-[13.5px] font-bold">{s.title}</div>
                <div className="mt-0.5 text-[12px] leading-relaxed text-(--muted-foreground)">{s.sub}</div>
              </div>
              {i < STEPS.length - 1 ? (
                <ArrowRight aria-hidden="true" className="absolute right-[-10px] top-1/2 hidden h-4 w-4 -translate-y-1/2 text-(--muted-foreground)/50 lg:block" />
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      {/* ===================== USE CASES / EXAMPLES / QUICK ACTIONS ===================== */}
      <section className="mt-6 grid grid-cols-1 gap-4 px-1 sm:px-2 lg:grid-cols-[1fr_1.5fr_1fr]">
        <div className="rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm">
          <h3 className="mb-3 text-[15px] font-extrabold">Popular Use Cases</h3>
          <ul className="space-y-2.5">
            {USE_CASES.map((u) => (
              <li key={u} className="flex items-center gap-2 text-[13.5px]">
                <Check className="h-4 w-4 flex-none" style={{ color: BLUE }} strokeWidth={3} />
                {u}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm">
          <h3 className="mb-3 text-[15px] font-extrabold">Examples</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[380px] text-left text-[13px]">
              <thead>
                <tr className="text-(--muted-foreground)">
                  <th className="pb-2 font-semibold">Pattern</th>
                  <th className="pb-2 font-semibold">Output</th>
                </tr>
              </thead>
              <tbody>
                {EXAMPLES.map((ex) => (
                  <tr
                    key={ex.pattern}
                    className="cursor-pointer border-t border-(--border) transition hover:bg-[#2563EB]/5"
                    onClick={() => { set({ type: "sequential", pattern: ex.pattern }); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  >
                    <td className="py-2.5 pr-3 font-mono font-semibold" style={{ color: BLUE }}>{ex.pattern}</td>
                    <td className="py-2.5 font-mono text-(--muted-foreground)">{ex.output}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[12px] text-(--muted-foreground)">Tip: click a row to load that pattern.</p>
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm">
          <h3 className="mb-3 text-[15px] font-extrabold">Quick Actions</h3>
          <div className="space-y-2">
            <button type="button" onClick={loadSample} className="flex w-full items-center gap-2.5 rounded-xl border border-(--border) bg-(--background) px-3.5 py-3 text-[13.5px] font-bold transition hover:border-[#2563EB] hover:text-[#2563EB] active:scale-[.98]">
              <RotateCcw className="h-4 w-4" /> Load Sample Data
            </button>
            <button type="button" onClick={savePreset} className="flex w-full items-center gap-2.5 rounded-xl border border-(--border) bg-(--background) px-3.5 py-3 text-[13.5px] font-bold transition hover:border-[#2563EB] hover:text-[#2563EB] active:scale-[.98]">
              {presetSaved ? <Check className="h-4 w-4 text-emerald-500" /> : <Save className="h-4 w-4" />}
              {presetSaved ? "Preset Saved" : "Save Preset"}
            </button>
            <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full items-center gap-2.5 rounded-xl border border-(--border) bg-(--background) px-3.5 py-3 text-[13.5px] font-bold transition hover:border-[#2563EB] hover:text-[#2563EB] active:scale-[.98]">
              <Upload className="h-4 w-4" /> Import List
            </button>
            <button type="button" onClick={() => { setCfg({ ...DEFAULT_CFG, pattern: "", customList: "" }); setQuery(""); }} className="flex w-full items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-500/5 px-3.5 py-3 text-[13.5px] font-bold text-rose-500 transition hover:bg-rose-500/10 active:scale-[.98] dark:border-rose-500/30">
              <Trash2 className="h-4 w-4" /> Clear Everything
            </button>
          </div>
          <input ref={fileRef} type="file" accept=".txt,.csv,text/plain" hidden onChange={onImportFile} />
        </div>
      </section>

      {/* ===================== FAQ ===================== */}
      <section className="mt-10 px-1 sm:px-2">
        <h2 className="mb-5 text-center text-xl font-extrabold">Frequently Asked Questions</h2>
        <div className="mx-auto max-w-3xl space-y-2.5">
          {FAQS.map(({ q, a }) => (
            <details key={q} className="group rounded-2xl border border-(--border) bg-(--card) px-5 py-4 shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[14px] font-bold [&::-webkit-details-marker]:hidden">
                {q}
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full text-lg leading-none text-(--muted-foreground) transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-[13.5px] leading-relaxed text-(--muted-foreground)">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ===================== RELATED TOOLS ===================== */}
      <section className="mt-10 px-1 pb-6 sm:px-2">
        <h2 className="mb-5 text-center text-xl font-extrabold">Related Developer Tools</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
          {RELATED.map(({ slug, label, icon: Icon }) => (
            <Link
              key={slug}
              href={`/tools/all/${slug}`}
              className="flex flex-col items-center gap-2 rounded-2xl border border-(--border) bg-(--card) px-3 py-4 text-center shadow-sm transition hover:border-[#2563EB] hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(37,99,235,.1)", color: BLUE }}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-[12.5px] font-bold leading-tight">{label}</span>
            </Link>
          ))}
        </div>
        <div className="mt-5 text-center">
          <Link href="/tools/all" className="inline-flex items-center gap-1.5 text-[13.5px] font-bold" style={{ color: BLUE }}>
            Explore All Tools <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
