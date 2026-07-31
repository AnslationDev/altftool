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
import { GhostButton } from "./ui";
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
    if (status === "loading") return { dot: "bg-primary animate-pulse", label: "Converting…", tone: "text-primary" };
    if (status === "error") return { dot: "bg-danger", label: "Error", tone: "text-[var(--danger-text)]" };
    if (status === "ok") return { dot: "bg-success", label: "Done", tone: "text-[var(--success-text)]" };
    return { dot: "bg-muted-foreground", label: "Ready", tone: "text-muted-foreground" };
  }, [status]);

  const engineBadge =
    tool.engine === "browser"
      ? { icon: Cpu, label: "Runs in your browser", tone: "text-[var(--success-text)]" }
      : { icon: Server, label: "Runs on server", tone: "text-primary" };
  const EngineIcon = engineBadge.icon;

  return (
    <div className="w-full">
      {/* header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            <span className="rounded-md bg-muted px-2 py-0.5 text-muted-foreground">{labelFor(tool.from)}</span>
            <ArrowRight className="h-3.5 w-3.5" />
            <span className="rounded-md bg-primary-soft px-2 py-0.5 text-primary-text">{labelFor(tool.to)}</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{tool.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{tool.description}</p>
        </div>
        <div className={`flex shrink-0 items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold shadow-sm ${engineBadge.tone}`}>
          <EngineIcon className="h-4 w-4" />
          {engineBadge.label}
        </div>
      </div>

      {/* tool-specific optimization notification banner */}
      {tool.slug.startsWith("svg-") && (
        <div className="mt-5 flex items-center justify-between rounded-xl border border-info/20 bg-info-soft px-4 py-3 text-xs text-[var(--info-text)] animate-fade-in">
          <div className="flex items-center gap-2">
            <TriangleAlert className="h-4 w-4 shrink-0 text-info" />
            <span>SVGO optimization is not applied — markup is converted as-is, attributes and comments included.</span>
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
                  className={showSettings ? "bg-muted text-primary" : ""}
                />
              )}
              <GhostButton icon={RotateCcw} label="Reset" onClick={handleReset} />
              <GhostButton icon={Trash2} label="Clear" onClick={handleClear} disabled={!input && !output} />
            </div>
          }
          footer={
            <span className="text-xs text-muted-foreground" suppressHydrationWarning>
              {input.length.toLocaleString()} characters
            </span>
          }
        />

        {/* center rail */}
        <div className="flex flex-row items-center justify-center gap-3 md:flex-col md:py-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft">
            <ArrowRight className="h-5 w-5 rotate-90 text-primary md:rotate-0" />
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 shadow-sm">
            {status === "loading" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
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
            <span className="text-xs text-muted-foreground" suppressHydrationWarning>
              {output.length.toLocaleString()} characters
            </span>
          }
        />
      </div>

      {/* error + warnings */}
      {error ? (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-[var(--danger-text)]">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="whitespace-pre-wrap">{error}</span>
        </div>
      ) : null}
      {warnings.length > 0 ? (
        <div className="mt-3 rounded-xl border border-warning/30 bg-warning-soft px-4 py-3 text-sm text-[var(--warning-text)]">
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
        <StatTile icon={FileText} tint="bg-primary-soft" iconTone="text-primary" label="Input" value={`${input.length.toLocaleString()} chars`} />
        <StatTile icon={FileText} tint="bg-success-soft" iconTone="text-[var(--success-text)]" label="Output" value={`${output.length.toLocaleString()} chars`} />
        <StatTile icon={ShieldCheck} tint="bg-accent-soft" iconTone="text-accent" label="Status" value={statusPill.label} />
        <StatTile icon={Timer} tint="bg-warning-soft" iconTone="text-[var(--warning-text)]" label="Time" value={`${elapsed} ms`} />
      </div>

      {/* privacy note */}
      <p className="mt-6 flex items-center gap-2 rounded-xl bg-surface-soft px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        <Lock className="h-3.5 w-3.5 shrink-0 text-accent" />
        {tool.engine === "browser"
          ? "This conversion runs entirely in your browser — your input never leaves your device."
          : "This conversion runs on our server to use a Node-only library. Your input is processed for the request and never stored."}
      </p>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background shadow-xl">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function StatTile({ icon: Icon, tint, iconTone, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tint}`}>
        <Icon className={`h-5 w-5 ${iconTone}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="truncate text-base font-bold text-foreground" suppressHydrationWarning>
          {value}
        </p>
      </div>
    </div>
  );
}
