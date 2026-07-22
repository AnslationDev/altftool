"use client";

/**
 * Base64 → ASCII converter UI.
 *
 * Layout (recreated from the product reference, fully responsive):
 *   1. Hero — icon badge, gradient title, subtitle, feature pills
 *   2. Converter — Input card | Convert control | dark terminal Output card
 *      (3 columns on lg, stacked on smaller screens in input → convert →
 *      output order)
 *   3. Feature cards (4) and a numbered "How It Works" strip
 *
 * THEMING: structural surfaces use the site's semantic tokens (--background,
 * --card, --border, --foreground, --muted-foreground) so light AND dark themes
 * both work. The brand accent is a deliberate BLUE (from the reference) held
 * constant across themes; the Output terminal stays dark in both themes by
 * design, like a real code console. Decoding is 100% client-side.
 */

import { useCallback, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Clipboard,
  Code2,
  Copy,
  Cpu,
  Download,
  Gift,
  Globe,
  Maximize2,
  RotateCcw,
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  Terminal,
  Trash2,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { decodeBase64ToText } from "../utils/decodeBase64";

/* ---------------------------------- brand ---------------------------------- */

const BLUE = "#2563EB";
const BLUE_LIGHT = "#3B82F6";
const BLUE_GRAD = "linear-gradient(135deg, #3B82F6 0%, #2563EB 55%, #1D4ED8 100%)";
const MAX_CHARS = 10000;

const SAMPLE_B64 =
  "SGVsbG8sIERldmVsb3BlciE=\nV2VsY29tZSB0byBCYXNlNjQg\nVG8gQVNDSUkgQ29udmVydGVyIQ==";

const PILLS = [
  { icon: Zap, label: "Instant Decode" },
  { icon: Cpu, label: "Client-side Processing" },
  { icon: Upload, label: "Zero Uploads" },
  { icon: Globe, label: "UTF-8 Support" },
  { icon: ShieldCheck, label: "Privacy First" },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Privacy First",
    body: "100% browser-based processing. Your data never leaves your device.",
  },
  {
    icon: Zap,
    title: "High Performance",
    body: "Lightning-fast decoding with optimized client-side processing.",
  },
  {
    icon: Target,
    title: "Accurate Results",
    body: "Perfect ASCII conversion with full UTF-8 and Unicode support.",
  },
  {
    icon: Gift,
    title: "Completely Free",
    body: "Unlimited conversions with no sign-up, no limits, no hidden fees.",
  },
];

const STEPS = [
  { n: 1, title: "Paste Base64", body: "Input your Base64 encoded string or upload a file." },
  { n: 2, title: "Decode Instantly", body: "Our engine decodes it in real time, right in your browser." },
  { n: 3, title: "ASCII Generated", body: "Readable ASCII text is generated instantly." },
  { n: 4, title: "Copy & Use", body: "Copy, download, or share your decoded result." },
];

/* -------------------------------- small bits ------------------------------- */

function Pill({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-(--border) bg-(--card) px-3.5 py-2 text-[13px] font-medium text-(--foreground) shadow-sm">
      <Check className="h-3.5 w-3.5" style={{ color: BLUE }} strokeWidth={3} />
      <Icon className="h-3.5 w-3.5 text-(--muted-foreground)" />
      {label}
    </span>
  );
}

function ActionButton({ icon: Icon, label, onClick, tone = "ghost" }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all active:scale-[.97] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50";
  const tones = {
    ghost:
      "border border-(--border) bg-(--card) text-(--foreground) hover:border-[#2563EB] hover:text-[#2563EB]",
    dark: "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${tones[tone]}`}
      style={{ outlineColor: BLUE }}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}

/* --------------------------------- component ------------------------------- */

export default function Base64ToAscii() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const fileRef = useRef(null);
  const outputRef = useRef(null);
  const copyTimer = useRef(0);

  const result = useMemo(() => decodeBase64ToText(input), [input]);
  const charCount = input.length;
  const outputText = result.ok ? result.text : "";
  const lines = outputText ? outputText.split("\n") : [];

  /* ------------------------------- input actions ------------------------------ */

  const onUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setInput(String(reader.result || "").slice(0, MAX_CHARS));
    reader.readAsText(file);
    e.target.value = "";
  }, []);

  const onPaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text.slice(0, MAX_CHARS));
    } catch {
      /* clipboard blocked — user can paste manually into the textarea */
    }
  }, []);

  const onConvert = useCallback(() => {
    setPulse(true);
    window.setTimeout(() => setPulse(false), 600);
    // Decoding is already live; on small screens bring the result into view.
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  /* ------------------------------ output actions ------------------------------ */

  const flashCopied = useCallback(() => {
    setCopied(true);
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 1600);
  }, []);

  const onCopy = useCallback(async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      flashCopied();
    } catch {
      /* ignore */
    }
  }, [outputText, flashCopied]);

  const onDownload = useCallback(() => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "decoded-ascii.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [outputText]);

  const onShare = useCallback(async () => {
    if (!outputText) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Decoded ASCII", text: outputText });
        return;
      } catch {
        /* user cancelled or unsupported — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(outputText);
      flashCopied();
    } catch {
      /* ignore */
    }
  }, [outputText, flashCopied]);

  /* --------------------------------- render --------------------------------- */

  return (
    <div className="b64-scope w-full text-(--foreground)">
      <style>{`
        @keyframes b64Pulse{0%{transform:scale(1)}45%{transform:scale(.96)}100%{transform:scale(1)}}
        @keyframes b64Float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @media (prefers-reduced-motion: no-preference){
          .b64-pulse{animation:b64Pulse .6s ease}
          .b64-float{animation:b64Float 6s ease-in-out infinite}
        }
      `}</style>

      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden px-4 pb-10 pt-8 text-center sm:pt-12">
        {/* ambient blue glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[-120px] h-[380px] w-[680px] max-w-[110%] -translate-x-1/2 rounded-full opacity-70"
          style={{ background: "radial-gradient(closest-side, rgba(59,130,246,.18), transparent)" }}
        />

        <div className="relative mx-auto flex max-w-3xl flex-col items-center">
          <span
            className="b64-float mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg"
            style={{ background: BLUE_GRAD, boxShadow: "0 12px 30px rgba(37,99,235,.35)" }}
          >
            <Code2 className="h-8 w-8" />
          </span>

          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: BLUE_GRAD, WebkitBackgroundClip: "text" }}
            >
              Base64
            </span>{" "}
            to ASCII
            <br className="hidden sm:block" /> Converter
          </h1>

          <p className="mt-4 max-w-xl text-balance text-[15px] leading-relaxed text-(--muted-foreground) sm:text-base">
            Decode Base64 encoded strings into readable ASCII text instantly.
            Secure, fast, browser-based conversion.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            {PILLS.map((p) => (
              <Pill key={p.label} icon={p.icon} label={p.label} />
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CONVERTER ===================== */}
      <section className="px-1 sm:px-2">
        <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-3">
          {/* ---------- Input ---------- */}
          <div className="flex flex-col rounded-2xl border border-(--border) bg-(--card) p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5" style={{ color: BLUE }} />
              <h2 className="text-[15px] font-bold">Base64 Input</h2>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
              spellCheck={false}
              placeholder="Paste your Base64 encoded text here…"
              className="min-h-[180px] w-full flex-1 resize-y rounded-xl border border-(--border) bg-(--background) p-3.5 font-mono text-[13.5px] leading-relaxed text-(--foreground) outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15"
            />

            <div className="mt-2.5 flex items-center justify-between text-[12.5px] text-(--muted-foreground)">
              <span className={charCount >= MAX_CHARS ? "font-semibold text-amber-500" : ""}>
                {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                UTF-8
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <ActionButton icon={Upload} label="Upload File" onClick={() => fileRef.current?.click()} />
              <ActionButton icon={Clipboard} label="Paste" onClick={onPaste} />
              <ActionButton icon={Trash2} label="Clear" onClick={() => setInput("")} />
              <ActionButton icon={RotateCcw} label="Sample Data" onClick={() => setInput(SAMPLE_B64)} />
            </div>
            <input ref={fileRef} type="file" accept=".txt,text/plain" hidden onChange={onUpload} />
          </div>

          {/* ---------- Convert control ---------- */}
          <div className="flex flex-row items-center justify-center gap-3 py-1 lg:flex-col lg:px-1">
            <span
              aria-hidden="true"
              className="hidden h-14 w-14 items-center justify-center rounded-full border border-(--border) bg-(--card) shadow-sm lg:flex"
              style={{ color: BLUE }}
            >
              <ArrowRight className="h-6 w-6" />
            </span>
            <button
              type="button"
              onClick={onConvert}
              className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-[15px] font-bold text-white shadow-lg transition-transform hover:scale-[1.03] active:scale-[.97] motion-reduce:transition-none ${pulse ? "b64-pulse" : ""}`}
              style={{ background: BLUE_GRAD, boxShadow: "0 12px 26px rgba(37,99,235,.4)" }}
            >
              <Zap className="h-5 w-5" />
              Convert
            </button>
          </div>

          {/* ---------- Output (dark terminal, both themes) ---------- */}
          <div
            ref={outputRef}
            className="flex flex-col overflow-hidden rounded-2xl border border-white/10 shadow-lg"
            style={{ background: "#0B1120" }}
          >
            <div className="flex flex-col gap-2 border-b border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-slate-100">
                <Terminal className="h-[18px] w-[18px]" style={{ color: BLUE_LIGHT }} />
                <h2 className="text-[15px] font-bold">ASCII Output</h2>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <ActionButton icon={copied ? Check : Copy} label={copied ? "Copied" : "Copy"} onClick={onCopy} tone="dark" />
                <ActionButton icon={Download} label="Download" onClick={onDownload} tone="dark" />
                <ActionButton icon={Share2} label="Share" onClick={onShare} tone="dark" />
                <button
                  type="button"
                  onClick={() => setFullscreen(true)}
                  aria-label="Expand output"
                  className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <OutputBody result={result} lines={lines} />
          </div>
        </div>
      </section>

      {/* ===================== FEATURE CARDS ===================== */}
      <section className="mt-8 grid grid-cols-1 gap-4 px-1 sm:grid-cols-2 sm:px-2 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm">
            <span
              className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ background: "rgba(37,99,235,.1)", color: BLUE }}
            >
              <Icon className="h-[22px] w-[22px]" />
            </span>
            <h3 className="text-[15px] font-bold">{title}</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-(--muted-foreground)">{body}</p>
          </div>
        ))}
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section className="mt-10 px-1 pb-4 sm:px-2">
        <h2 className="mb-6 text-center text-xl font-bold sm:text-2xl">How It Works</h2>
        <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.n} className="relative rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm">
              <span
                className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-[14px] font-bold text-white"
                style={{ background: BLUE_GRAD }}
              >
                {s.n}
              </span>
              <h3 className="text-[14.5px] font-bold">{s.title}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-(--muted-foreground)">{s.body}</p>
              {i < STEPS.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute right-[-10px] top-1/2 hidden h-0.5 w-5 -translate-y-1/2 lg:block"
                  style={{ background: "repeating-linear-gradient(90deg,#93c5fd 0 4px,transparent 4px 8px)" }}
                />
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      {/* ===================== FULLSCREEN OUTPUT ===================== */}
      {fullscreen ? (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#0B1120" }} role="dialog" aria-modal="true" aria-label="ASCII output fullscreen">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2 text-slate-100">
              <Terminal className="h-[18px] w-[18px]" style={{ color: BLUE_LIGHT }} />
              <span className="text-[15px] font-bold">ASCII Output</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ActionButton icon={copied ? Check : Copy} label={copied ? "Copied" : "Copy"} onClick={onCopy} tone="dark" />
              <ActionButton icon={Download} label="Download" onClick={onDownload} tone="dark" />
              <button
                type="button"
                onClick={() => setFullscreen(false)}
                aria-label="Close fullscreen"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
            <OutputBody result={result} lines={lines} grow />
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* -------------------------- output terminal body --------------------------- */

function OutputBody({ result, lines, grow = false }) {
  const showError = !result.ok;
  const isEmpty = result.ok && result.empty;

  return (
    <div className={`relative overflow-auto ${grow ? "h-full" : "min-h-[220px]"} px-0 py-3 font-mono text-[13.5px] leading-relaxed`}>
      {showError ? (
        <p className="px-4 text-rose-300">⚠ {result.error}</p>
      ) : isEmpty ? (
        <p className="px-4 text-slate-500">Decoded ASCII text will appear here…</p>
      ) : (
        <div className="flex">
          {/* line numbers */}
          <div aria-hidden="true" className="select-none pr-3 pl-4 text-right text-slate-600">
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          {/* text */}
          <pre className="min-w-0 flex-1 whitespace-pre-wrap break-words pr-4 text-emerald-300">
            {lines.map((ln, i) => (
              <div key={i}>{ln || " "}</div>
            ))}
          </pre>
        </div>
      )}
    </div>
  );
}
