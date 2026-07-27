"use client";

import { useMemo, useState } from "react";
import { Braces, Check, Copy, RotateCcw } from "lucide-react";

import {
  DEFAULTS,
  OPTION_DEFS,
  OVERRIDE_PRESETS,
  buildPrettierConfig,
  samplePreview,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECKBOX_CLASS =
  "h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const DASH = "—";

const INITIAL_FORM = Object.fromEntries(
  OPTION_DEFS.map((def) => [def.key, def.type === "int" ? String(def.default) : def.default]),
);

export default function ToolHome() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [emitAll, setEmitAll] = useState(false);
  const [presetIds, setPresetIds] = useState([]);
  const [copied, setCopied] = useState(false);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const togglePreset = (id) =>
    setPresetIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );

  const overrides = useMemo(
    () =>
      OVERRIDE_PRESETS.filter((preset) => presetIds.includes(preset.id)).map((preset) => ({
        files: preset.files,
        options: preset.options,
      })),
    [presetIds],
  );

  const result = useMemo(
    () => buildPrettierConfig({ options: form, emitAll, overrides }),
    [form, emitAll, overrides],
  );
  const hasError = Boolean(result.error);

  const preview = useMemo(() => (hasError ? "" : samplePreview(form)), [hasError, form]);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.json);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(INITIAL_FORM);
    setEmitAll(false);
    setPresetIds([]);
    setCopied(false);
  };

  const boolDefs = OPTION_DEFS.filter((def) => def.type === "bool");
  const valueDefs = OPTION_DEFS.filter((def) => def.type !== "bool");

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Braces className="h-4 w-4" aria-hidden="true" />
          Formatting
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Prettier Config Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set every core Prettier 3 option, watch a live sample of what it does to your code, add
          per-file overrides, and copy a clean <code>.prettierrc</code> that only lists what you
          changed.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Options</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {valueDefs.map((def) => (
            <div key={def.key}>
              <label className={LABEL_CLASS} htmlFor={`pr-${def.key}`}>
                {def.label}
                <span className="ml-1 font-normal text-[var(--muted-foreground)]">
                  (default {String(def.default)})
                </span>
              </label>
              {def.type === "int" ? (
                <input
                  id={`pr-${def.key}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min={def.min}
                  max={def.max}
                  step="1"
                  value={form[def.key]}
                  onChange={(event) => set(def.key, event.target.value)}
                />
              ) : (
                <select
                  id={`pr-${def.key}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={form[def.key]}
                  onChange={(event) => set(def.key, event.target.value)}
                >
                  {def.values.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-1 sm:grid-cols-2">
          {boolDefs.map((def) => (
            <label
              key={def.key}
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
              htmlFor={`pr-${def.key}`}
            >
              <input
                id={`pr-${def.key}`}
                type="checkbox"
                className={CHECKBOX_CLASS}
                checked={form[def.key]}
                onChange={(event) => set(def.key, event.target.checked)}
              />
              {def.label}
            </label>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Per-file overrides</h2>
        <div className="mt-3 grid gap-1">
          {OVERRIDE_PRESETS.map((preset) => (
            <label
              key={preset.id}
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
              htmlFor={`pr-ov-${preset.id}`}
            >
              <input
                id={`pr-ov-${preset.id}`}
                type="checkbox"
                className={CHECKBOX_CLASS}
                checked={presetIds.includes(preset.id)}
                onChange={() => togglePreset(preset.id)}
              />
              <span>
                {preset.label}{" "}
                <code className="text-xs text-[var(--muted-foreground)]">{preset.files}</code>
              </span>
            </label>
          ))}
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
            htmlFor="pr-emit-all"
          >
            <input
              id="pr-emit-all"
              type="checkbox"
              className={CHECKBOX_CLASS}
              checked={emitAll}
              onChange={(event) => setEmitAll(event.target.checked)}
            />
            Write every option explicitly, including defaults
          </label>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Generated file
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">.prettierrc</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `${result.changedCount} option${result.changedCount === 1 ? "" : "s"} changed from the Prettier 3 defaults`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated .prettierrc"
              className={`${PRIMARY_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy JSON"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset to Prettier defaults" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--background)]">
            <pre className="p-4 text-xs leading-5">
              <code>{hasError ? DASH : result.json}</code>
            </pre>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Sample with these options
            </p>
            <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--background)]">
              <pre className="p-4 text-xs leading-5">
                <code>{hasError ? DASH : preview}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Save the JSON as <code>.prettierrc</code> (or <code>.prettierrc.json</code>) in your project
        root. The sample is an illustration of the option semantics, not a run of Prettier itself —
        line-width-dependent wrapping is decided by Prettier at format time.
      </p>
    </main>
  );
}
