"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Copy,
  Check,
  Download,
  History,
  RotateCcw,
  Sparkles,
  Upload,
} from "lucide-react";
import Icon from "@/shared/ui/Icon";
import { safeCopyText } from "@/shared/utils/clipboard";
import {
  coerceValues,
  defaultValues,
  fieldsForMode,
  loadInitial,
  missingRequired,
  normalizeResult,
  summarize,
} from "./runtimeHelpers";

/**
 * ToolRuntime — a single generic, level-5 renderer for any ToolSpec.
 *
 * A ToolSpec (see automation/lib/spec.mjs for the contract) declares:
 *   { title, description, badge, icon, modes?, fields[], compute, presets?,
 *     outputLabel?, note? }
 * `compute(values, mode) => { result, caption?, rows?, list?, table?, error? }`
 * is a pure function; number/range fields are coerced to Number first.
 *
 * Everything below (modes, presets, validation, history, copy/download,
 * empty/error states, responsive + dark mode) is provided generically so any
 * generated tool is a complete product without per-tool UI code.
 */
export default function ToolRuntime({ spec }) {
  const storageKey = "altftool:" + (spec.slug || spec.title || "tool");
  const hasModes = Array.isArray(spec.modes) && spec.modes.length > 0;

  // Tools render client-only (ssr:false), so it is safe to seed state from
  // localStorage in a lazy initializer — no hydration mismatch, no effect.
  const initial = useMemo(() => loadInitial(spec, storageKey, hasModes), [spec, storageKey, hasModes]);
  const [mode, setMode] = useState(initial.mode);
  const [raw, setRaw] = useState(initial.raw);
  const [result, setResult] = useState(() => normalizeResult(null));
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [nonce, setNonce] = useState(0);
  const computeToken = useRef(0);

  const activeFields = useMemo(() => fieldsForMode(spec.fields, mode), [spec.fields, mode]);
  const missing = useMemo(() => missingRequired(spec.fields, raw, mode), [spec.fields, raw, mode]);

  // Live compute (supports async compute). All setState happens inside the
  // async chain so nothing is set synchronously within the effect body.
  useEffect(() => {
    const token = ++computeToken.current;
    Promise.resolve()
      .then(() => (missing.length ? null : spec.compute(coerceValues(activeFields, raw), mode)))
      .then((r) => {
        if (token === computeToken.current) setResult(normalizeResult(r));
      })
      .catch((e) => {
        if (token === computeToken.current) setResult(normalizeResult({ error: e?.message || String(e) }));
      });
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify({ raw, mode }));
      } catch {
        /* ignore quota */
      }
    }
  }, [raw, mode, missing.length, activeFields, spec, storageKey, nonce]);

  const setField = useCallback((key, value) => setRaw((prev) => ({ ...prev, [key]: value })), []);

  const applyPreset = (preset) => {
    if (preset.mode && hasModes) setMode(preset.mode);
    setRaw((prev) => ({ ...prev, ...preset.values }));
  };

  const reset = () => {
    // Opt-in only: specs stay silent by default (unchanged behavior for
    // every tool that doesn't set spec.confirmReset). Tools whose only
    // meaningful input is free-form pasted text (e.g. a large textarea) can
    // set spec.confirmReset to a string to gate this destructive action
    // behind a confirmation, matching the window.confirm convention used by
    // bespoke tool pages for destructive resets.
    if (
      spec.confirmReset &&
      typeof window !== "undefined" &&
      !window.confirm(
        typeof spec.confirmReset === "string"
          ? spec.confirmReset
          : "Reset all fields to the defaults? This cannot be undone.",
      )
    ) {
      return;
    }
    setRaw(defaultValues(spec.fields));
    if (hasModes) setMode(spec.modes[0].id);
  };

  const pushHistory = () => {
    if (!result.result) return;
    setHistory((h) => [{ at: Date.now(), text: result.result }, ...h].slice(0, 8));
  };

  const copy = async () => {
    const ok = await safeCopyText(summarize(spec, raw, result, mode));
    if (!ok) return;
    setCopied(true);
    pushHistory();
    setTimeout(() => setCopied(false), 1200);
  };

  const download = () => {
    if (typeof window === "undefined") return;
    const blob = new Blob([summarize(spec, raw, result, mode)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (spec.slug || "result") + ".txt";
    a.click();
    URL.revokeObjectURL(url);
    pushHistory();
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Icon name={spec.icon || "sparkles"} className="h-4 w-4" />
            {spec.badge || "Tool"}
          </div>
          <h1 className="text-3xl font-semibold leading-tight">{spec.title}</h1>
          {spec.description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
              {spec.description}
            </p>
          ) : null}

          {hasModes ? (
            <div className="mt-4 flex flex-wrap gap-2" role="tablist">
              {spec.modes.map((m) => (
                <button
                  key={m.id}
                  role="tab"
                  aria-selected={mode === m.id}
                  onClick={() => setMode(m.id)}
                  className={`rounded-md border px-3 py-1.5 text-sm font-semibold transition ${
                    mode === m.id
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          ) : null}
        </section>

        {/* Presets */}
        {Array.isArray(spec.presets) && spec.presets.length ? (
          <section className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 shadow-[var(--anslation-ds-shadow-sm)]">
            <span className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Examples</span>
            {spec.presets.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-semibold transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
              >
                {p.label}
              </button>
            ))}
          </section>
        ) : null}

        <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
          {/* Inputs */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold">Inputs</span>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--primary)]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>
            <div className="grid gap-4">
              {activeFields.map((f) => (
                <Field key={f.key} field={f} value={raw[f.key]} onChange={setField} />
              ))}
            </div>
          </div>

          {/* Output */}
          <div className="grid content-start gap-4">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  {spec.outputLabel || "Result"}
                </span>
                <div className="flex gap-1.5">
                  <IconButton onClick={copy} label={copied ? "Copied" : "Copy"} active={copied}>
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </IconButton>
                  <IconButton onClick={download} label="Download">
                    <Download className="h-3.5 w-3.5" />
                  </IconButton>
                  {history.length ? (
                    <IconButton onClick={() => setShowHistory((s) => !s)} label="History" active={showHistory}>
                      <History className="h-3.5 w-3.5" />
                    </IconButton>
                  ) : null}
                </div>
              </div>

              {spec.regenerate ? (
                <button
                  type="button"
                  onClick={() => setNonce((n) => n + 1)}
                  className="mt-3 inline-flex h-10 items-center gap-2 rounded-md bg-[var(--primary)] px-5 font-semibold text-[var(--primary-foreground)] transition hover:opacity-90"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate
                </button>
              ) : null}

              <div aria-live="polite" className="mt-3">
                {missing.length ? (
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Enter {missing.slice(0, 3).join(", ")}
                    {missing.length > 3 ? "…" : ""} to see the result.
                  </p>
                ) : result.error ? (
                  <p className="flex items-start gap-2 text-sm text-red-600">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {result.error}
                  </p>
                ) : (
                  <>
                    <p className="break-words text-3xl font-semibold text-[var(--primary)]">
                      {result.result || "—"}
                    </p>
                    {result.caption ? (
                      <p className="mt-2 text-sm text-[var(--muted-foreground)]">{result.caption}</p>
                    ) : null}

                    {result.list.length ? (
                      <ul className="mt-4 grid gap-2">
                        {result.list.map((item, i) => (
                          <li
                            key={i}
                            className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-medium"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    {result.rows.length ? (
                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {result.rows.map(([label, value], i) => (
                          <div key={i} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                            <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                            <p className="mt-1 break-words font-semibold">{String(value)}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {result.table ? (
                      <div className="mt-4 overflow-x-auto rounded-md border border-[var(--border)]">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-[var(--muted)]">
                            <tr>
                              {result.table.headers.map((h, i) => (
                                <th key={i} className="px-3 py-2 font-semibold">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {result.table.rows.map((r, i) => (
                              <tr key={i} className="border-t border-[var(--border)]">
                                {r.map((c, j) => (
                                  <td key={j} className="px-3 py-2">{String(c)}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            </div>

            {showHistory && history.length ? (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
                <p className="mb-2 text-xs font-semibold uppercase text-[var(--muted-foreground)]">Recent results</p>
                <ul className="grid gap-1.5">
                  {history.map((h, i) => (
                    <li key={i} className="truncate rounded border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-xs">
                      {h.text}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>

        {spec.note ? (
          <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--card)] p-3 text-xs leading-5 text-[var(--muted-foreground)]">
            {spec.note}
          </p>
        ) : null}
      </div>
    </main>
  );
}

function IconButton({ onClick, label, active, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`inline-flex h-8 items-center gap-1 rounded-md border px-2.5 text-xs font-semibold transition ${
        active
          ? "border-[var(--primary)] text-[var(--primary)]"
          : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
      }`}
    >
      {children}
    </button>
  );
}

function readFile(file, readAs) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const base = { name: file.name, type: file.type, size: file.size };
      if (readAs === "text") resolve({ ...base, text: String(reader.result) });
      else resolve({ ...base, dataUrl: String(reader.result) });
    };
    if (readAs === "text") reader.readAsText(file);
    else reader.readAsDataURL(file);
  });
}

function Field({ field, value, onChange }) {
  const common = "mt-1.5 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)]";

  if (field.type === "file") {
    const onPick = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return onChange(field.key, null);
      try {
        onChange(field.key, await readFile(file, field.readAs || "dataUrl"));
      } catch (err) {
        onChange(field.key, null);
        void err;
      }
    };
    return (
      <label className="block">
        <span className="text-sm font-semibold">{field.label}</span>
        {field.hint ? <span className="ml-2 text-xs text-[var(--muted-foreground)]">{field.hint}</span> : null}
        <div className="relative mt-1.5 flex flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-[var(--border)] bg-[var(--background)] px-3 py-6 text-center transition hover:border-[var(--primary)]">
          <Upload className="h-5 w-5 text-[var(--muted-foreground)]" />
          <span className="text-sm font-medium text-[var(--primary)]">
            {value?.name ? value.name : "Choose a file or drop it here"}
          </span>
          {value?.size ? <span className="text-xs text-[var(--muted-foreground)]">{Math.round(value.size / 1024)} KB</span> : null}
          <input type="file" accept={field.accept} onChange={onPick} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
        </div>
      </label>
    );
  }

  return (
    <label className="block">
      <span className="text-sm font-semibold">{field.label}</span>
      {field.hint ? <span className="ml-2 text-xs text-[var(--muted-foreground)]">{field.hint}</span> : null}

      {field.type === "select" ? (
        <select value={value} onChange={(e) => onChange(field.key, e.target.value)} className={`${common} h-11`}>
          {(field.choices || []).map((c) => (
            <option key={String(c.value ?? c)} value={c.value ?? c}>{c.label ?? c}</option>
          ))}
        </select>
      ) : field.type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          spellCheck={false}
          className={`${common} h-40 resize-y py-2 font-mono text-sm`}
        />
      ) : field.type === "toggle" ? (
        <span className="mt-2 flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(field.key, e.target.checked)}
            className="h-4 w-4 accent-[var(--primary)]"
          />
          <span className="text-sm text-[var(--muted-foreground)]">{field.checkboxLabel || "Enabled"}</span>
        </span>
      ) : field.type === "range" ? (
        <span className="mt-2 block">
          <input
            type="range"
            min={field.min ?? 0}
            max={field.max ?? 100}
            step={field.step ?? 1}
            value={value === "" ? field.min ?? 0 : value}
            onChange={(e) => onChange(field.key, e.target.value)}
            className="w-full accent-[var(--primary)]"
          />
          <span className="mt-1 block text-xs font-semibold text-[var(--primary)]">{value}{field.suffix || ""}</span>
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <input
            type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
            value={value}
            min={field.min}
            max={field.max}
            step={field.step}
            inputMode={field.type === "number" ? "decimal" : undefined}
            placeholder={field.placeholder}
            onChange={(e) => onChange(field.key, e.target.value)}
            className={`${common} h-11`}
          />
          {field.suffix ? <span className="text-sm text-[var(--muted-foreground)]">{field.suffix}</span> : null}
        </span>
      )}
    </label>
  );
}
