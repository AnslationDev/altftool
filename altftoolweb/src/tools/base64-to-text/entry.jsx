"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Clipboard,
  ClipboardPaste,
  Copy,
  Download,
  FileInput,
  FileOutput,
  FileText,
  HelpCircle,
  Loader2,
  Lock,
  RotateCcw,
  Settings2,
  Share2,
  ShieldCheck,
  Sparkles,
  Timer,
  Trash2,
  Upload,
  X,
  Zap,
} from "lucide-react";

/* ---------------------------------------------------------------------------
   Decode engine (pure functions)
--------------------------------------------------------------------------- */

const DEFAULT_OPTS = {
  autoDecode: true,
  preserveBreaks: true,
  trimWhitespace: false,
  detectInvalid: true,
  urlSafe: false,
};

function cleanupBase64(raw, opts) {
  let s = (raw || "").trim();
  const dataUrl = s.match(/^data:[^;,]*;base64,([\s\S]*)$/);
  if (dataUrl) s = dataUrl[1];
  s = s.replace(/\s+/g, "");
  const hasUrlSafeChars = /[-_]/.test(s);
  if (opts.urlSafe && hasUrlSafeChars) {
    s = s.replace(/-/g, "+").replace(/_/g, "/");
  }
  return { s, hasUrlSafeChars };
}

function decodeBase64(raw, opts) {
  const t0 = typeof performance !== "undefined" ? performance.now() : 0;
  const done = (res) => ({
    ...res,
    ms: Math.max(1, Math.round((typeof performance !== "undefined" ? performance.now() : 0) - t0)),
  });

  const { s: cleanedInput, hasUrlSafeChars } = cleanupBase64(raw, opts);
  let s = cleanedInput;
  if (!s) return done({ ok: false, message: "Input is empty after cleanup." });

  if (opts.detectInvalid) {
    if (hasUrlSafeChars && !opts.urlSafe) {
      return done({
        ok: false,
        message: "URL-safe characters (- _) detected — enable “URL-safe Base64 support”.",
      });
    }
    if (s.length % 4 === 1) {
      return done({ ok: false, message: "Incorrect length — this is not valid Base64." });
    }
    const core = s.replace(/=+$/, "");
    if (!/^[A-Za-z0-9+/]*$/.test(core)) {
      return done({ ok: false, message: "Invalid characters found in the Base64 string." });
    }
  }

  while (s.length % 4 !== 0) s += "=";

  let text;
  let byteLength = 0;
  try {
    const bin = atob(s);
    byteLength = bin.length;
    const bytes = new Uint8Array(byteLength);
    for (let i = 0; i < byteLength; i += 1) bytes[i] = bin.charCodeAt(i);
    text = new TextDecoder("utf-8").decode(bytes);
  } catch (err) {
    return done({ ok: false, message: "Could not decode — the data is not valid Base64." });
  }

  if (!opts.preserveBreaks) text = text.replace(/\r?\n/g, " ");
  if (opts.trimWhitespace) text = text.trim();

  return done({ ok: true, text, byteLength });
}

function encodeUtf8ToBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function formatBytes(n) {
  if (!n) return "0 B";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

const SAMPLE_TEXT = [
  "Hello from AltFTool! 👋",
  "",
  "Base64 makes it easy to move text between systems safely.",
  "Line breaks, symbols (© ™ ✓) and full UTF-8 — sab kuch supported.",
  "",
  "Happy decoding!",
].join("\n");

/* ---------------------------------------------------------------------------
   Small UI atoms
--------------------------------------------------------------------------- */

function GhostButton({ icon: Icon, label, onClick, disabled, title, className = "" }) {
  return (
    <button
      type="button"
      title={title || label}
      onClick={onClick}
      disabled={disabled}
      suppressHydrationWarning
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800 ${className}`}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {label ? <span className="whitespace-nowrap">{label}</span> : null}
    </button>
  );
}

function OptionCheck({ checked, onToggle, label }) {
  return (
    <label className="flex cursor-pointer select-none items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300">
      <input type="checkbox" className="sr-only" checked={checked} onChange={onToggle} />
      <span
        aria-hidden="true"
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
          checked
            ? "border-blue-600 bg-blue-600"
            : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900"
        }`}
      >
        {checked ? <Check className="h-3.5 w-3.5 text-white" strokeWidth={3.5} /> : null}
      </span>
      {label}
    </label>
  );
}

/* ---------------------------------------------------------------------------
   Tool
--------------------------------------------------------------------------- */

export default function ToolEntry() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("empty"); // empty | valid | invalid
  const [errorMsg, setErrorMsg] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [opts, setOpts] = useState(DEFAULT_OPTS);
  const [advOpen, setAdvOpen] = useState(true);
  const [howOpen, setHowOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState("");

  const fileRef = useRef(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 1900);
  }, []);

  const runDecode = useCallback((raw, o) => {
    if (!raw.trim()) {
      setOutput("");
      setStatus("empty");
      setErrorMsg("");
      setElapsed(0);
      setProcessing(false);
      return;
    }
    setProcessing(true);
    window.setTimeout(() => {
      const res = decodeBase64(raw, o);
      if (res.ok) {
        setOutput(res.text);
        setStatus("valid");
        setErrorMsg("");
      } else {
        setOutput("");
        setStatus("invalid");
        setErrorMsg(res.message);
      }
      setElapsed(res.ms);
      setProcessing(false);
    }, 90);
  }, []);

  // Auto decode while typing (debounced).
  useEffect(() => {
    if (!opts.autoDecode) return undefined;
    const t = window.setTimeout(() => runDecode(input, opts), 220);
    return () => window.clearTimeout(t);
  }, [input, opts, runDecode]);

  // Esc closes the How-it-works modal.
  useEffect(() => {
    if (!howOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setHowOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [howOpen]);

  const toggleOpt = (key) => setOpts((prev) => ({ ...prev, [key]: !prev[key] }));

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return showToast("Clipboard is empty");
      setInput(text);
      showToast("Pasted from clipboard");
    } catch {
      showToast("Clipboard access was blocked by the browser");
    }
  };

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setInput(String(reader.result || ""));
    reader.readAsText(file);
  };

  const handleCopy = async () => {
    if (!output) return showToast("Nothing to copy yet");
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
      showToast("Copied to clipboard");
    } catch {
      showToast("Copy failed — select the text manually");
    }
  };

  const handleDownload = () => {
    if (!output) return showToast("Nothing to download yet");
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "decoded-text.txt";
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  const handleShare = async () => {
    if (!output) return showToast("Nothing to share yet");
    const text = output.length > 4000 ? `${output.slice(0, 4000)}…` : output;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Decoded text — AltFTool", text });
      } catch {
        /* user dismissed the sheet */
      }
    } else {
      await handleCopy();
      showToast("Sharing not supported — copied instead");
    }
  };

  const handleSample = () => {
    setInput(encodeUtf8ToBase64(SAMPLE_TEXT));
    showToast("Sample Base64 loaded");
  };

  const handleReset = () => {
    setInput("");
    setOutput("");
    setStatus("empty");
    setErrorMsg("");
    setElapsed(0);
    setOpts(DEFAULT_OPTS);
    showToast("Tool reset");
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setStatus("empty");
    setErrorMsg("");
    setElapsed(0);
  };

  const inputBytes = useMemo(() => (input ? new Blob([input]).size : 0), [input]);
  const outputBytes = useMemo(() => (output ? new Blob([output]).size : 0), [output]);
  const words = useMemo(() => (output.trim() ? output.trim().split(/\s+/).length : 0), [output]);

  const statusTile =
    status === "valid"
      ? { value: "Valid Base64", sub: "Decoded successfully", tone: "text-emerald-600 dark:text-emerald-400" }
      : status === "invalid"
        ? { value: "Invalid", sub: errorMsg || "Check the input string", tone: "text-red-500" }
        : { value: "Ready", sub: "Waiting for input", tone: "text-violet-600 dark:text-violet-400" };

  const statusPill = processing
    ? { label: "Decoding…", sub: "Working locally", tone: "text-blue-600 dark:text-blue-400", dot: "bg-blue-500" }
    : status === "invalid"
      ? { label: "Invalid", sub: "Check your input", tone: "text-red-500", dot: "bg-red-500" }
      : status === "valid"
        ? { label: "Done", sub: "Decoded successfully", tone: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" }
        : { label: "Ready", sub: "Waiting for input", tone: "text-slate-900 dark:text-white", dot: "bg-emerald-500" };

  /* ------------------------------- modals -------------------------------- */

  const renderHowModal = () => {
    if (!howOpen) return null;
    const steps = [
      ["Paste or upload", "Drop a .txt file, paste a Base64 string, or load the sample data."],
      ["Decode", "With Auto Decode on it converts as you type — or press the Decode button."],
      ["Use the result", "Copy, download as .txt, share, or open the decoded text fullscreen."],
    ];
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={() => setHowOpen(false)}>
        <div
          className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
              <HelpCircle className="h-5 w-5 text-blue-600" /> How it works
            </h3>
            <button type="button" onClick={() => setHowOpen(false)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800">
              <X className="h-[18px] w-[18px]" />
            </button>
          </div>
          <ol className="mt-5 space-y-4">
            {steps.map(([title, body], i) => (
              <li key={title} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">{i + 1}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{body}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-5 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
            <ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-violet-500" />
            Everything runs locally in your browser — your data is never uploaded to a server.
          </p>
        </div>
      </div>
    );
  };

  /* ------------------------------- render -------------------------------- */

  const features = [
    { icon: <CheckCircle2 className="h-5 w-5 text-blue-500" />, tint: "bg-blue-500/10", title: "Live Validation", body: "Instantly validates Base64 format as you type." },
    { icon: <Zap className="h-5 w-5 text-violet-500" />, tint: "bg-violet-500/10", title: "Instant Processing", body: "Decode Base64 to text in real-time instantly." },
    { icon: <Lock className="h-5 w-5 text-emerald-500" />, tint: "bg-emerald-500/10", title: "Privacy First", body: "Your data never leaves your browser." },
    { icon: <span className="text-lg font-black leading-none text-orange-500">A</span>, tint: "bg-orange-500/10", title: "UTF-8 Support", body: "Properly handles UTF-8 and special characters." },
    { icon: <FileText className="h-5 w-5 text-blue-500" />, tint: "bg-blue-500/10", title: "Large File Support", body: "Supports large Base64 strings with ease." },
    { icon: <Clipboard className="h-5 w-5 text-emerald-500" />, tint: "bg-emerald-500/10", title: "Clipboard Integration", body: "Easy paste and copy with one click." },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-100 px-3 py-6 [font-family:var(--font-ibm-plex-sans,inherit)] sm:px-6 sm:py-8 lg:px-10 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-[1440px] rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8 dark:border-slate-800 dark:bg-slate-900">
        {/* ------------------------------ header ----------------------------- */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/30">
              <FileText className="mb-1.5 h-6 w-6 text-white" />
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded bg-white/25 px-1 text-[8px] font-bold leading-3 text-white">B64</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">Base64 to Text</h1>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Decode Base64 strings into readable plain text instantly.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <GhostButton icon={HelpCircle} label="How it works" onClick={() => setHowOpen(true)} className="rounded-full" />
          </div>
        </div>

        {/* --------------------------- main workspace ------------------------- */}
        <div className="mt-7 grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_180px_minmax(0,1fr)]">
          {/* input panel */}
          <section className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/70 dark:bg-slate-950/40">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 pb-3 pt-4 sm:px-5">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 sm:text-base dark:text-white">
                <FileInput className="h-[18px] w-[18px] text-blue-600" /> Base64 Encoded Input
              </h2>
              <div className="flex items-center gap-2">
                <GhostButton icon={Clipboard} label="Paste" onClick={handlePaste} />
                <GhostButton icon={Upload} label="Upload .txt" onClick={() => fileRef.current?.click()} />
                <input
                  ref={fileRef}
                  type="file"
                  accept=".txt,.b64,.base64,text/plain"
                  className="hidden"
                  onChange={(e) => {
                    handleFile(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
            <div
              className={`relative mx-4 flex-1 rounded-xl border transition sm:mx-5 ${
                dragOver
                  ? "border-blue-500 bg-blue-50/60 dark:bg-blue-500/10"
                  : "border-slate-200 bg-slate-50/50 dark:border-slate-700/70 dark:bg-slate-900/60"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFile(e.dataTransfer.files?.[0]);
              }}
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your Base64 encoded string here..."
                spellCheck={false}
                suppressHydrationWarning
                className="h-64 w-full resize-none rounded-xl bg-transparent p-4 font-mono text-sm leading-relaxed text-slate-800 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/30 dark:text-slate-200 dark:placeholder:text-slate-500"
              />
              {!input ? (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute left-1/2 top-1/2 flex w-[min(85%,18rem)] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white/70 px-6 py-7 text-center transition hover:border-blue-400 hover:bg-blue-50/60 dark:border-slate-600 dark:bg-slate-900/70 dark:hover:border-blue-500 dark:hover:bg-blue-500/10"
                >
                  <Upload className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Drag &amp; drop a file here</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">or click to upload</span>
                </button>
              ) : null}
            </div>
            {status === "invalid" && input ? (
              <p className="mx-4 mt-2 text-xs font-medium text-red-500 sm:mx-5">{errorMsg}</p>
            ) : null}
            <div className="flex items-center justify-between px-4 py-3.5 sm:px-5">
              <span className="text-xs text-slate-400 dark:text-slate-500" suppressHydrationWarning>
                {input.length.toLocaleString()} characters
              </span>
              <GhostButton icon={Trash2} label="Clear" onClick={handleClear} disabled={!input && !output} />
            </div>
          </section>

          {/* center controls */}
          <div className="flex flex-row flex-wrap items-center justify-center gap-4 lg:flex-col lg:flex-nowrap">
            <div className="hidden grid-cols-3 gap-1.5 lg:grid" aria-hidden="true">
              {Array.from({ length: 9 }).map((_, i) => (
                <span key={i} className="h-1 w-1 rounded-full bg-slate-200 dark:bg-slate-700" />
              ))}
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-900">
              <ArrowRight className="h-5 w-5 rotate-90 text-blue-600 lg:rotate-0 dark:text-blue-400" />
            </div>
            <button
              type="button"
              onClick={() => runDecode(input, opts)}
              suppressHydrationWarning
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4" /> Decode
            </button>
            <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <span className={`flex items-center gap-2 text-sm font-bold ${statusPill.tone}`} suppressHydrationWarning>
                {processing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                ) : (
                  <span className={`h-2 w-2 rounded-full ${statusPill.dot}`} />
                )}
                {statusPill.label}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500" suppressHydrationWarning>
                {statusPill.sub}
              </span>
            </div>
          </div>

          {/* output panel */}
          <section className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/70 dark:bg-slate-950/40">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 pb-3 pt-4 sm:px-5">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 sm:text-base dark:text-white">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-100 text-[11px] font-black text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">T</span> Decoded Text Output
              </h2>
              <div className="flex items-center gap-2">
                <GhostButton icon={copied ? Check : Copy} label={copied ? "Copied" : "Copy"} onClick={handleCopy} disabled={!output} />
                <GhostButton icon={Download} label="Download .txt" onClick={handleDownload} disabled={!output} />
                <GhostButton icon={Share2} label="Share" onClick={handleShare} disabled={!output} />
              </div>
            </div>
            <div className="mx-4 flex-1 rounded-xl border border-slate-200 bg-slate-50/50 sm:mx-5 dark:border-slate-700/70 dark:bg-slate-900/60">
              <textarea
                value={output}
                readOnly
                placeholder="Your decoded text will appear here..."
                spellCheck={false}
                suppressHydrationWarning
                className="h-64 w-full resize-none rounded-xl bg-transparent p-4 text-sm leading-relaxed text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500"
              />
            </div>
            <div className="flex items-center justify-end px-4 py-3.5 sm:px-5">
              <span className="text-xs text-slate-400 dark:text-slate-500" suppressHydrationWarning>
                {output.length.toLocaleString()} characters&ensp;|&ensp;{words.toLocaleString()} words
              </span>
            </div>
          </section>
        </div>

        {/* ---------------------------- quick actions ------------------------- */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          <GhostButton icon={ClipboardPaste} label="Paste from Clipboard" onClick={handlePaste} className="!py-2.5" />
          <GhostButton icon={FileText} label="Sample Data" onClick={handleSample} className="!py-2.5" />
          <button
            type="button"
            onClick={() => toggleOpt("autoDecode")}
            suppressHydrationWarning
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
          >
            <Zap className="h-4 w-4" />
            <span className="whitespace-nowrap">Auto Decode</span>
            <span
              className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${opts.autoDecode ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300" : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300"}`}
            >
              <Zap className="h-2.5 w-2.5" />
              {opts.autoDecode ? "ON" : "OFF"}
            </span>
          </button>
          <GhostButton icon={Copy} label="Copy Result" onClick={handleCopy} disabled={!output} className="!py-2.5" />
          <GhostButton icon={Download} label="Download Result" onClick={handleDownload} disabled={!output} className="!py-2.5" />
          <GhostButton icon={RotateCcw} label="Reset All" onClick={handleReset} className="!py-2.5" />
        </div>

        {/* ------------------------------- stats ------------------------------ */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              icon: <FileText className="h-5 w-5 text-blue-500" />,
              tint: "bg-blue-500/10",
              label: "Input Size",
              value: formatBytes(inputBytes),
              sub: `${input.length.toLocaleString()} characters`,
              tone: "text-slate-900 dark:text-white",
            },
            {
              icon: <FileText className="h-5 w-5 text-emerald-500" />,
              tint: "bg-emerald-500/10",
              label: "Output Size",
              value: formatBytes(outputBytes),
              sub: `${output.length.toLocaleString()} characters`,
              tone: "text-slate-900 dark:text-white",
            },
            {
              icon: <ShieldCheck className="h-5 w-5 text-violet-500" />,
              tint: "bg-violet-500/10",
              label: "Decoding Status",
              value: statusTile.value,
              sub: statusTile.sub,
              tone: statusTile.tone,
            },
            {
              icon: <Timer className="h-5 w-5 text-orange-500" />,
              tint: "bg-orange-500/10",
              label: "Processing Time",
              value: `${elapsed} ms`,
              sub: "Last run",
              tone: "text-slate-900 dark:text-white",
            },
          ].map((tile) => (
            <div key={tile.label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/70 dark:bg-slate-950/40">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tile.tint}`}>{tile.icon}</div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{tile.label}</p>
                <p className={`truncate text-xl font-bold sm:text-2xl ${tile.tone}`} suppressHydrationWarning>
                  {tile.value}
                </p>
                <p className="truncate text-xs text-slate-400 dark:text-slate-500" suppressHydrationWarning>
                  {tile.sub}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* --------------------------- advanced options ----------------------- */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/70 dark:bg-slate-950/40">
          <button
            type="button"
            onClick={() => setAdvOpen((v) => !v)}
            suppressHydrationWarning
            className="flex w-full items-center justify-between px-5 py-4"
          >
            <span className="flex items-center gap-2 text-sm font-bold text-slate-900 sm:text-base dark:text-white">
              <Settings2 className="h-[18px] w-[18px] text-slate-500" /> Advanced Options
            </span>
            <ChevronDown className={`h-[18px] w-[18px] text-slate-400 transition-transform ${advOpen ? "rotate-180" : ""}`} />
          </button>
          {advOpen ? (
            <div className="grid grid-cols-1 gap-x-8 gap-y-3.5 border-t border-slate-100 px-5 pb-5 pt-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 dark:border-slate-800">
              <OptionCheck checked={opts.autoDecode} onToggle={() => toggleOpt("autoDecode")} label="Auto decode while typing" />
              <OptionCheck checked={opts.preserveBreaks} onToggle={() => toggleOpt("preserveBreaks")} label="Preserve line breaks" />
              <OptionCheck checked={opts.trimWhitespace} onToggle={() => toggleOpt("trimWhitespace")} label="Trim whitespace" />
              <OptionCheck checked={opts.detectInvalid} onToggle={() => toggleOpt("detectInvalid")} label="Detect invalid Base64" />
              <OptionCheck checked={opts.urlSafe} onToggle={() => toggleOpt("urlSafe")} label="URL-safe Base64 support" />
            </div>
          ) : null}
        </div>

        {/* ------------------------------ features ---------------------------- */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700/70 dark:bg-slate-950/40">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${f.tint}`}>{f.icon}</div>
              <p className="mt-3 text-sm font-bold text-slate-900 dark:text-white">{f.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{f.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* toast */}
      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-xl dark:bg-white dark:text-slate-900">
          {toast}
        </div>
      ) : null}

      {renderHowModal()}
    </div>
  );
}
