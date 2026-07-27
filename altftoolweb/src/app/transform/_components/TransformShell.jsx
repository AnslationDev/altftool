"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Clipboard,
  Cpu,
  FileText,
  Loader2,
  Lock,
  RotateCcw,
  Server,
  ShieldCheck,
  Sparkles,
  Timer,
  Trash2,
  TriangleAlert,
  Settings,
} from "lucide-react";
import EditorPane from "./EditorPane";
import SettingsDrawer from "./SettingsDrawer";
import CopyButton from "./CopyButton";
import DownloadButton from "./DownloadButton";
import { GhostButton, PrimaryButton } from "./ui";
import { labelFor } from "../_lib/formats";
import { runClientTransform, getClientMeta } from "../_lib/registry.client";

/**
 * The one shell every converter reuses. Engine-aware:
 *   - browser tools import + run locally (data never leaves the device)
 *   - server tools POST to /transform/api/[slug]
 * Live, debounced (~300ms) conversion with error + warning display.
 *
 * @param {{ tool: import("../_lib/manifest.js").ToolMeta }} props
 */
export default function TransformShell({ tool }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [warnings, setWarnings] = useState([]);
  const [status, setStatus] = useState("empty"); // empty | loading | ok | error
  const [elapsed, setElapsed] = useState(0);

  const [sample, setSample] = useState("");
  const [optionsSchema, setOptionsSchema] = useState([]);
  const [optionsState, setOptionsState] = useState({});
  const [toast, setToast] = useState("");
  const [showSettings, setShowSettings] = useState(true);

  const reqId = useRef(0);
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 1900);
  }, []);

  const applyOptions = useCallback((schema) => {
    setOptionsSchema(schema);
    setOptionsState((prev) => {
      const next = { ...prev };
      for (const opt of schema) if (!(opt.key in next)) next[opt.key] = opt.default;
      return next;
    });
  }, []);

  // Load sample + option schema once per tool.
  useEffect(() => {
    let cancelled = false;
    async function loadMeta() {
      if (tool.engine === "browser") {
        const meta = await getClientMeta(tool.slug);
        if (cancelled) return;
        setSample(meta.sample || "");
        applyOptions(meta.options || []);
      } else {
        try {
          const res = await fetch(`/transform/api/${tool.slug}`);
          const data = await res.json();
          if (cancelled) return;
          setSample(data.sample || "");
          applyOptions(Array.isArray(data.options) ? data.options : []);
        } catch {
          /* metadata is best-effort */
        }
      }
    }
    loadMeta();
    return () => {
      cancelled = true;
    };
  }, [tool.slug, tool.engine, applyOptions]);

  // Debounced live conversion.
  useEffect(() => {
    if (!input.trim()) {
      setOutput("");
      setError("");
      setWarnings([]);
      setStatus("empty");
      setElapsed(0);
      return undefined;
    }

    let cancelled = false;
    const handle = window.setTimeout(async () => {
      const id = ++reqId.current;
      setStatus("loading");
      const t0 = performance.now();
      let result;
      if (tool.engine === "browser") {
        result = await runClientTransform(tool.slug, input, optionsState);
      } else {
        try {
          const res = await fetch(`/transform/api/${tool.slug}`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ input, options: optionsState }),
          });
          result = await res.json();
        } catch {
          result = { ok: false, error: "Network error — please retry." };
        }
      }
      if (cancelled || id !== reqId.current) return;
      const ms = Math.max(1, Math.round(performance.now() - t0));
      setElapsed(ms);
      if (result && result.ok) {
        setOutput(result.output || "");
        setWarnings(Array.isArray(result.warnings) ? result.warnings : []);
        setError("");
        setStatus("ok");
      } else {
        setOutput("");
        setWarnings([]);
        setError((result && result.error) || "Conversion failed.");
        setStatus("error");
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [input, optionsState, tool.slug, tool.engine]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return showToast("Clipboard is empty");
      setInput(text);
      showToast("Pasted from clipboard");
    } catch {
      showToast("Clipboard access was blocked");
    }
  }, [showToast]);

  const handleSample = useCallback(() => {
    if (!sample) return showToast("No sample available yet");
    setInput(sample);
    showToast("Sample input loaded");
  }, [sample, showToast]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setError("");
    setWarnings([]);
    setStatus("empty");
  }, []);

  const handleReset = useCallback(() => {
    handleClear();
    setOptionsState(() => {
      const next = {};
      for (const opt of optionsSchema) next[opt.key] = opt.default;
      return next;
    });
    showToast("Reset");
  }, [handleClear, optionsSchema, showToast]);

  const setOption = useCallback((key, value) => {
    setOptionsState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const statusPill = useMemo(() => {
    if (status === "loading") return { dot: "bg-blue-500 animate-pulse", label: "Converting…", tone: "text-blue-600 dark:text-blue-400" };
    if (status === "error") return { dot: "bg-red-500", label: "Error", tone: "text-red-500" };
    if (status === "ok") return { dot: "bg-emerald-500", label: "Done", tone: "text-emerald-600 dark:text-emerald-400" };
    return { dot: "bg-slate-400", label: "Ready", tone: "text-slate-500 dark:text-slate-400" };
  }, [status]);

  const engineBadge =
    tool.engine === "browser"
      ? { icon: Cpu, label: "Runs in your browser", tone: "text-emerald-600 dark:text-emerald-400" }
      : { icon: Server, label: "Runs on server", tone: "text-blue-600 dark:text-blue-400" };
  const EngineIcon = engineBadge.icon;

  return (
    <div className="w-full">
      {/* header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{labelFor(tool.from)}</span>
            <ArrowRight className="h-3.5 w-3.5" />
            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">{labelFor(tool.to)}</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">{tool.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{tool.description}</p>
        </div>
        <div className={`flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold shadow-sm dark:border-slate-700 dark:bg-slate-900 ${engineBadge.tone}`}>
          <EngineIcon className="h-4 w-4" />
          {engineBadge.label}
        </div>
      </div>

      {/* tool-specific optimization notification banner */}
      {tool.slug.startsWith("svg-") && (
        <div className="mt-5 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3 text-xs text-blue-800 dark:border-blue-500/10 dark:bg-blue-500/5 dark:text-blue-200 animate-fade-in">
          <div className="flex items-center gap-2">
            <TriangleAlert className="h-4 w-4 shrink-0 text-blue-500" />
            <span>SVGO optimization is enabled by default. You can adjust SVGR options in Settings.</span>
          </div>
        </div>
      )}

      {/* workspace */}
      <div className="mt-6 grid grid-cols-1 items-stretch gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <EditorPane
          title={`${labelFor(tool.from)} Input`}
          icon={FileText}
          value={input}
          onChange={setInput}
          onDropText={setInput}
          placeholder={`Paste your ${labelFor(tool.from)} here…`}
          actions={
            <div className="flex items-center gap-1">
              <GhostButton icon={Clipboard} label="Paste" onClick={handlePaste} />
              <GhostButton icon={FileText} label="Sample" onClick={handleSample} />
              {optionsSchema.length > 0 && (
                <GhostButton
                  icon={Settings}
                  label="Settings"
                  onClick={() => setShowSettings(!showSettings)}
                  className={showSettings ? "bg-slate-100 text-blue-600 dark:bg-slate-800 dark:text-blue-400" : ""}
                />
              )}
              <GhostButton icon={RotateCcw} label="Reset" onClick={handleReset} />
              <GhostButton icon={Trash2} label="Clear" onClick={handleClear} disabled={!input && !output} />
            </div>
          }
          footer={
            <span className="text-xs text-slate-400 dark:text-slate-500" suppressHydrationWarning>
              {input.length.toLocaleString()} characters
            </span>
          }
        />

        {/* center rail */}
        <div className="flex flex-row items-center justify-center gap-3 md:flex-col md:py-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/15">
            <ArrowRight className="h-5 w-5 rotate-90 text-blue-600 md:rotate-0 dark:text-blue-400" />
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            {status === "loading" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
            ) : (
              <span className={`h-2 w-2 rounded-full ${statusPill.dot}`} />
            )}
            <span className={`text-xs font-semibold ${statusPill.tone}`} suppressHydrationWarning>
              {statusPill.label}
            </span>
          </div>
        </div>

        <EditorPane
          title={`${labelFor(tool.to)} Output`}
          icon={Sparkles}
          value={output}
          readOnly
          placeholder={`${labelFor(tool.to)} output appears here…`}
          actions={
            <>
              <CopyButton value={output} onDone={showToast} />
              <DownloadButton value={output} slug={tool.slug} format={tool.to} onDone={showToast} />
            </>
          }
          footer={
            <span className="text-xs text-slate-400 dark:text-slate-500" suppressHydrationWarning>
              {output.length.toLocaleString()} characters
            </span>
          }
        />
      </div>

      {/* error + warnings */}
      {error ? (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="whitespace-pre-wrap">{error}</span>
        </div>
      ) : null}
      {warnings.length > 0 ? (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          {warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      ) : null}

      {/* options */}
      {showSettings && optionsSchema.length > 0 && (
        <div className="mt-5 animate-fade-in">
          <SettingsDrawer schema={optionsSchema} values={optionsState} onChange={setOption} />
        </div>
      )}

      {/* stats */}
      <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatTile icon={FileText} tint="bg-blue-500/10" iconTone="text-blue-500" label="Input" value={`${input.length.toLocaleString()} chars`} />
        <StatTile icon={FileText} tint="bg-emerald-500/10" iconTone="text-emerald-500" label="Output" value={`${output.length.toLocaleString()} chars`} />
        <StatTile icon={ShieldCheck} tint="bg-violet-500/10" iconTone="text-violet-500" label="Status" value={statusPill.label} />
        <StatTile icon={Timer} tint="bg-orange-500/10" iconTone="text-orange-500" label="Time" value={`${elapsed} ms`} />
      </div>

      {/* privacy note */}
      <p className="mt-6 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
        <Lock className="h-3.5 w-3.5 shrink-0 text-violet-500" />
        {tool.engine === "browser"
          ? "This conversion runs entirely in your browser — your input never leaves your device."
          : "This conversion runs on our server to use a Node-only library. Your input is processed for the request and never stored."}
      </p>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-xl dark:bg-white dark:text-slate-900">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function StatTile({ icon: Icon, tint, iconTone, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700/70 dark:bg-slate-950/40">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tint}`}>
        <Icon className={`h-5 w-5 ${iconTone}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{label}</p>
        <p className="truncate text-base font-bold text-slate-900 dark:text-white" suppressHydrationWarning>
          {value}
        </p>
      </div>
    </div>
  );
}
