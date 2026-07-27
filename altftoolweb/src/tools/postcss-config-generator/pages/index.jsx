"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileCog, RotateCcw } from "lucide-react";

import {
  FORMATS,
  NESTING_OPTIONS,
  PRESET_ENV_STAGE_MAX,
  PRESET_ENV_STAGE_MIN,
  buildPostcssConfig,
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

const DEFAULTS = {
  format: "esm",
  useImport: true,
  nesting: "postcss-nesting",
  usePresetEnv: false,
  presetEnvStage: "2",
  useAutoprefixer: true,
  browsers: "",
  useMinify: true,
  minifyProdOnly: true,
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const result = useMemo(
    () =>
      buildPostcssConfig({
        format: form.format,
        useImport: form.useImport,
        nesting: form.nesting,
        usePresetEnv: form.usePresetEnv,
        presetEnvStage: form.presetEnvStage,
        useAutoprefixer: form.useAutoprefixer,
        browsers: form.browsers,
        useMinify: form.useMinify,
        minifyProdOnly: form.minifyProdOnly,
      }),
    [form],
  );
  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  const toggles = [
    ["useImport", "postcss-import — inline @import files (runs first)"],
    ["usePresetEnv", "postcss-preset-env — transpile modern CSS features"],
    ["useAutoprefixer", "autoprefixer — add vendor prefixes"],
    ["useMinify", "cssnano — minify the output (runs last)"],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileCog className="h-4 w-4" aria-hidden="true" />
          Build tooling
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">PostCSS Config Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick your plugins and get a ready-to-paste <code>postcss.config</code> file with the
          pipeline in the correct order — imports first, nesting flattened before prefixing, and
          minification last.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Plugins</h2>
        <div className="mt-3 grid gap-1">
          {toggles.map(([key, label]) => (
            <label
              key={key}
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
              htmlFor={`pc-${key}`}
            >
              <input
                id={`pc-${key}`}
                type="checkbox"
                className={CHECKBOX_CLASS}
                checked={form[key]}
                onChange={(event) => set(key, event.target.checked)}
              />
              {label}
            </label>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-nesting">
              Nesting plugin
            </label>
            <select
              id="pc-nesting"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.nesting}
              onChange={(event) => set("nesting", event.target.value)}
            >
              {NESTING_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {form.usePresetEnv && (
            <div>
              <label className={LABEL_CLASS} htmlFor="pc-stage">
                preset-env stage ({PRESET_ENV_STAGE_MIN}–{PRESET_ENV_STAGE_MAX})
              </label>
              <input
                id="pc-stage"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min={PRESET_ENV_STAGE_MIN}
                max={PRESET_ENV_STAGE_MAX}
                step="1"
                value={form.presetEnvStage}
                onChange={(event) => set("presetEnvStage", event.target.value)}
              />
            </div>
          )}
          {form.useAutoprefixer && (
            <div className={form.usePresetEnv ? "sm:col-span-2" : ""}>
              <label className={LABEL_CLASS} htmlFor="pc-browsers">
                Browserslist override (comma-separated, blank = project default)
              </label>
              <input
                id="pc-browsers"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                placeholder="last 2 versions, not dead"
                value={form.browsers}
                onChange={(event) => set("browsers", event.target.value)}
              />
            </div>
          )}
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-format">
              Output format
            </label>
            <select
              id="pc-format"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.format}
              onChange={(event) => set("format", event.target.value)}
            >
              {FORMATS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {form.useMinify && (
          <label
            className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm"
            htmlFor="pc-prodonly"
          >
            <input
              id="pc-prodonly"
              type="checkbox"
              className={CHECKBOX_CLASS}
              checked={form.minifyProdOnly}
              onChange={(event) => set("minifyProdOnly", event.target.checked)}
            />
            Minify only when <code>NODE_ENV === &quot;production&quot;</code>
          </label>
        )}
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      {!hasError && result.warnings.length > 0 && (
        <div className="mt-6 grid gap-2">
          {result.warnings.map((warning) => (
            <p
              key={warning}
              className="rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
            >
              {warning}
            </p>
          ))}
        </div>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Generated file
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.filename}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to generate the config."
                : `${result.pluginNames.length} plugin${result.pluginNames.length === 1 ? "" : "s"}: ${result.pluginNames.join(" → ")}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated PostCSS config"
              className={`${PRIMARY_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy config"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset to defaults" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--background)]">
          <pre className="p-4 text-xs leading-5">
            <code>{hasError ? DASH : result.text}</code>
          </pre>
        </div>

        {!hasError && (
          <dl className="mt-4 text-sm">
            <div className="py-2">
              <dt className="text-[var(--muted-foreground)]">Install the dependencies</dt>
              <dd className="mt-1 overflow-x-auto rounded-md bg-[var(--muted)] px-3 py-2 font-mono text-xs">
                {result.installCommand}
              </dd>
            </div>
          </dl>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        PostCSS runs plugins top to bottom, so order matters: <code>postcss-import</code> must see
        the file first, nesting has to be flattened before prefixing, and <code>cssnano</code>{" "}
        should compress the final result. Frameworks such as Next.js and Vite pick this file up
        automatically via postcss-load-config.
      </p>
    </main>
  );
}
