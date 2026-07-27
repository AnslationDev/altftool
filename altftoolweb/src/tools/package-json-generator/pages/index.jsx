"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Package, RotateCcw } from "lucide-react";

import { ENGINES_PRESETS, LICENSE_OPTIONS, TYPE_OPTIONS, buildPackageJson } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const CHECK_CLASS =
  "h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  name: "my-package",
  version: "1.0.0",
  description: "A small, well-behaved package",
  type: "module",
  entryPoint: "index.js",
  addExports: true,
  scriptsText: "test = node --test\nbuild = tsc\nlint = eslint .",
  keywordsText: "",
  author: "",
  license: "MIT",
  isPrivate: false,
  repositoryUrl: "",
  enginesNode: ">=18",
  addSideEffectsFalse: false,
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) =>
    setForm((prev) => ({
      ...prev,
      [key]: event.target.type === "checkbox" ? event.target.checked : event.target.value,
    }));

  const result = useMemo(() => buildPackageJson(form), [form]);
  const hasError = Boolean(result.error);

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
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Package className="h-4 w-4" aria-hidden="true" />
          Package management
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Package JSON Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a package.json that passes npm&apos;s real rules — name and SemVer validation, module
          type, exports map, scripts, engines and license — with warnings for the classic traps.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pj-name">
              Package name
            </label>
            <input
              id="pj-name"
              className={`mt-2 ${INPUT_CLASS} font-mono`}
              type="text"
              value={form.name}
              onChange={set("name")}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pj-version">
              Version (SemVer)
            </label>
            <input
              id="pj-version"
              className={`mt-2 ${INPUT_CLASS} font-mono`}
              type="text"
              value={form.version}
              onChange={set("version")}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pj-desc">
              Description
            </label>
            <input id="pj-desc" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.description} onChange={set("description")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pj-type">
              Module type
            </label>
            <select id="pj-type" className={`mt-2 ${INPUT_CLASS}`} value={form.type} onChange={set("type")}>
              {TYPE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pj-entry">
              Entry point (main)
            </label>
            <input
              id="pj-entry"
              className={`mt-2 ${INPUT_CLASS} font-mono`}
              type="text"
              value={form.entryPoint}
              onChange={set("entryPoint")}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pj-license">
              License (SPDX)
            </label>
            <select id="pj-license" className={`mt-2 ${INPUT_CLASS}`} value={form.license} onChange={set("license")}>
              {LICENSE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pj-engines">
              engines.node
            </label>
            <input
              id="pj-engines"
              className={`mt-2 ${INPUT_CLASS} font-mono`}
              type="text"
              value={form.enginesNode}
              onChange={set("enginesNode")}
              list="pj-engines-list"
              autoComplete="off"
              spellCheck={false}
            />
            <datalist id="pj-engines-list">
              {ENGINES_PRESETS.map((preset) => (
                <option key={preset} value={preset} />
              ))}
            </datalist>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pj-author">
              Author (optional)
            </label>
            <input id="pj-author" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.author} onChange={set("author")} placeholder="Jane Doe <jane@example.com>" />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pj-repo">
              Repository URL (optional)
            </label>
            <input
              id="pj-repo"
              className={`mt-2 ${INPUT_CLASS} font-mono`}
              type="text"
              value={form.repositoryUrl}
              onChange={set("repositoryUrl")}
              placeholder="https://github.com/user/repo"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pj-scripts">
              Scripts — one per line, name = command
            </label>
            <textarea
              id="pj-scripts"
              className="mt-2 min-h-[6rem] w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              value={form.scriptsText}
              onChange={set("scriptsText")}
              spellCheck={false}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pj-keywords">
              Keywords (comma separated, optional)
            </label>
            <input id="pj-keywords" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.keywordsText} onChange={set("keywordsText")} />
          </div>
        </div>

        <div className="mt-4 grid gap-1 sm:grid-cols-3">
          <label htmlFor="pj-private" className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input id="pj-private" type="checkbox" className={CHECK_CLASS} checked={form.isPrivate} onChange={set("isPrivate")} />
            &quot;private&quot;: true (never publish)
          </label>
          <label htmlFor="pj-exports" className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input id="pj-exports" type="checkbox" className={CHECK_CLASS} checked={form.addExports} onChange={set("addExports")} />
            Add &quot;exports&quot; map
          </label>
          <label htmlFor="pj-sideeffects" className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input
              id="pj-sideeffects"
              type="checkbox"
              className={CHECK_CLASS}
              checked={form.addSideEffectsFalse}
              onChange={set("addSideEffectsFalse")}
            />
            &quot;sideEffects&quot;: false (tree-shaking)
          </label>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              package.json
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.fieldCount} fields`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated package.json"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy JSON"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Scripts defined</dt>
            <dd className="text-right font-semibold">{hasError ? DASH : result.scriptCount}</dd>
          </div>
        </dl>

        <div className="mt-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
          <pre className="min-w-[320px] p-4 text-xs leading-5">
            <code>{hasError ? "// Fix the input above to generate package.json." : result.json}</code>
          </pre>
        </div>

        {!hasError && result.warnings.length > 0 ? (
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning} className="flex gap-2">
                <span aria-hidden="true" className="text-[var(--primary)]">
                  •
                </span>
                {warning}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Validation follows npm&apos;s published rules (name ≤ 214 chars, lowercase, URL-safe) and
        SemVer 2.0.0. License choice is informational — consult the SPDX list and your own counsel
        for licensing decisions.
      </p>
    </main>
  );
}
