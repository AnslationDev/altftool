"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileCode2, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  HEADER_PRESETS,
  NODE_BUNDLERS,
  REDIRECT_STATUSES,
  buildNetlifyToml,
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

const DEFAULT_BUILD = {
  buildCommand: "npm run build",
  publishDir: "dist",
  baseDir: "",
  nodeVersion: "20",
  functionsDir: "",
  nodeBundler: "",
};

const EMPTY_REDIRECT = { from: "", to: "", status: "301", force: false };
const EMPTY_EDGE = { path: "", functionName: "" };

export default function ToolHome() {
  const [build, setBuild] = useState(DEFAULT_BUILD);
  const [spaFallback, setSpaFallback] = useState(true);
  const [redirects, setRedirects] = useState([{ ...EMPTY_REDIRECT }]);
  const [presetIds, setPresetIds] = useState(["security"]);
  const [edgeFunctions, setEdgeFunctions] = useState([{ ...EMPTY_EDGE }]);
  const [copied, setCopied] = useState(false);

  const setBuildField = (key, value) => setBuild((current) => ({ ...current, [key]: value }));

  const setRedirectField = (index, key, value) =>
    setRedirects((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)),
    );

  const setEdgeField = (index, key, value) =>
    setEdgeFunctions((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)),
    );

  const togglePreset = (id) =>
    setPresetIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );

  const result = useMemo(
    () =>
      buildNetlifyToml({
        ...build,
        spaFallback,
        redirects,
        headerPresetIds: presetIds,
        edgeFunctions,
      }),
    [build, spaFallback, redirects, presetIds, edgeFunctions],
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
    setBuild(DEFAULT_BUILD);
    setSpaFallback(true);
    setRedirects([{ ...EMPTY_REDIRECT }]);
    setPresetIds(["security"]);
    setEdgeFunctions([{ ...EMPTY_EDGE }]);
    setCopied(false);
  };

  const buildFields = [
    ["buildCommand", "Build command", "npm run build"],
    ["publishDir", "Publish directory", "dist"],
    ["baseDir", "Base directory (monorepo, optional)", "apps/web"],
    ["nodeVersion", "Node version (optional)", "20"],
    ["functionsDir", "Functions directory (optional)", "netlify/functions"],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileCode2 className="h-4 w-4" aria-hidden="true" />
          Deployment config
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Netlify TOML Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Assemble a <code>netlify.toml</code> with build settings, redirects, security headers,
          serverless functions and edge function routes — with paths, statuses and TOML syntax
          validated before you copy.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Build settings</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {buildFields.map(([key, label, placeholder]) => (
            <div key={key}>
              <label className={LABEL_CLASS} htmlFor={`nt-${key}`}>
                {label}
              </label>
              <input
                id={`nt-${key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                placeholder={placeholder}
                value={build[key]}
                onChange={(event) => setBuildField(key, event.target.value)}
              />
            </div>
          ))}
          <div>
            <label className={LABEL_CLASS} htmlFor="nt-bundler">
              Functions bundler
            </label>
            <select
              id="nt-bundler"
              className={`mt-2 ${INPUT_CLASS}`}
              value={build.nodeBundler}
              onChange={(event) => setBuildField("nodeBundler", event.target.value)}
            >
              {NODE_BUNDLERS.map((value) => (
                <option key={value || "default"} value={value}>
                  {value === "" ? "Netlify default" : value}
                </option>
              ))}
            </select>
          </div>
        </div>
        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm"
          htmlFor="nt-spa"
        >
          <input
            id="nt-spa"
            type="checkbox"
            className={CHECKBOX_CLASS}
            checked={spaFallback}
            onChange={(event) => setSpaFallback(event.target.checked)}
          />
          Single-page app fallback (<code>{"/* → /index.html"}</code> with status 200)
        </label>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Redirects</h2>
          <button
            type="button"
            onClick={() => setRedirects((current) => [...current, { ...EMPTY_REDIRECT }])}
            aria-label="Add a redirect row"
            className={GHOST_BTN}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add
          </button>
        </div>
        <div className="mt-3 grid gap-4">
          {redirects.map((row, index) => (
            <div
              key={`redirect-${index}`}
              className="grid gap-3 rounded-lg border border-[var(--border)] p-3 sm:grid-cols-2"
            >
              <div>
                <label className={LABEL_CLASS} htmlFor={`nt-r-from-${index}`}>
                  From
                </label>
                <input
                  id={`nt-r-from-${index}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  placeholder="/old-page"
                  value={row.from}
                  onChange={(event) => setRedirectField(index, "from", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`nt-r-to-${index}`}>
                  To
                </label>
                <input
                  id={`nt-r-to-${index}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  placeholder="/new-page"
                  value={row.to}
                  onChange={(event) => setRedirectField(index, "to", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`nt-r-status-${index}`}>
                  Status
                </label>
                <select
                  id={`nt-r-status-${index}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={row.status}
                  onChange={(event) => setRedirectField(index, "status", event.target.value)}
                >
                  {REDIRECT_STATUSES.map((option) => (
                    <option key={option.code} value={String(option.code)}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end justify-between gap-3">
                <label
                  className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                  htmlFor={`nt-r-force-${index}`}
                >
                  <input
                    id={`nt-r-force-${index}`}
                    type="checkbox"
                    className={CHECKBOX_CLASS}
                    checked={row.force}
                    onChange={(event) => setRedirectField(index, "force", event.target.checked)}
                  />
                  Force (shadow existing files)
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setRedirects((current) => current.filter((_, rowIndex) => rowIndex !== index))
                  }
                  aria-label={`Remove redirect ${index + 1}`}
                  className={GHOST_BTN}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Header presets</h2>
        <div className="mt-3 grid gap-1">
          {HEADER_PRESETS.map((preset) => (
            <label
              key={preset.id}
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
              htmlFor={`nt-h-${preset.id}`}
            >
              <input
                id={`nt-h-${preset.id}`}
                type="checkbox"
                className={CHECKBOX_CLASS}
                checked={presetIds.includes(preset.id)}
                onChange={() => togglePreset(preset.id)}
              />
              <span>
                {preset.label}{" "}
                <code className="text-xs text-[var(--muted-foreground)]">{preset.path}</code>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Edge functions</h2>
          <button
            type="button"
            onClick={() => setEdgeFunctions((current) => [...current, { ...EMPTY_EDGE }])}
            aria-label="Add an edge function row"
            className={GHOST_BTN}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add
          </button>
        </div>
        <div className="mt-3 grid gap-4">
          {edgeFunctions.map((row, index) => (
            <div
              key={`edge-${index}`}
              className="grid gap-3 rounded-lg border border-[var(--border)] p-3 sm:grid-cols-[1fr_1fr_auto]"
            >
              <div>
                <label className={LABEL_CLASS} htmlFor={`nt-e-path-${index}`}>
                  Path
                </label>
                <input
                  id={`nt-e-path-${index}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  placeholder="/api/*"
                  value={row.path}
                  onChange={(event) => setEdgeField(index, "path", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`nt-e-fn-${index}`}>
                  Function name
                </label>
                <input
                  id={`nt-e-fn-${index}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  placeholder="auth"
                  value={row.functionName}
                  onChange={(event) => setEdgeField(index, "functionName", event.target.value)}
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() =>
                    setEdgeFunctions((current) =>
                      current.filter((_, rowIndex) => rowIndex !== index),
                    )
                  }
                  aria-label={`Remove edge function ${index + 1}`}
                  className={GHOST_BTN}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
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
            <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">netlify.toml</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `${result.sectionCount} section${result.sectionCount === 1 ? "" : "s"}, ${result.redirectCount} redirect${result.redirectCount === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated netlify.toml"
              className={`${PRIMARY_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy file"}
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
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Save the file as <code>netlify.toml</code> in your repository root (or the base directory in
        a monorepo). Settings here override the Netlify UI for the same keys, and redirect rules are
        processed top to bottom — the first match wins.
      </p>
    </main>
  );
}
