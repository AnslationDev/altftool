"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, SquareTerminal } from "lucide-react";

import { RUNNERS, buildNpmScripts } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  scriptsText: "lint = eslint .\ntest = node --test\npretest = npm run lint\nbuild = tsc",
  combinedName: "check",
  combinedMembers: "lint, test",
  combinedMode: "sequential",
  runner: "npm-run-all",
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(() => buildNpmScripts(form), [form]);
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
          <SquareTerminal className="h-4 w-4" aria-hidden="true" />
          Package management
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">npm Scripts Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Compose a scripts block with automatic pre/post hooks, a combined sequential or parallel
          runner, and an audit for commands that break on Windows (cmd.exe).
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="ns-scripts">
            Scripts — one per line, name = command
          </label>
          <textarea
            id="ns-scripts"
            className="mt-2 min-h-[8rem] w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            value={form.scriptsText}
            onChange={set("scriptsText")}
            spellCheck={false}
          />
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Name one <code>pre&lt;name&gt;</code> or <code>post&lt;name&gt;</code> and npm runs it
            automatically around <code>&lt;name&gt;</code>.
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ns-combined">
              Combined script name (blank = none)
            </label>
            <input
              id="ns-combined"
              className={`mt-2 ${INPUT_CLASS} font-mono`}
              type="text"
              value={form.combinedName}
              onChange={set("combinedName")}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ns-members">
              Member scripts (comma separated)
            </label>
            <input
              id="ns-members"
              className={`mt-2 ${INPUT_CLASS} font-mono`}
              type="text"
              value={form.combinedMembers}
              onChange={set("combinedMembers")}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ns-mode">
              Execution
            </label>
            <select id="ns-mode" className={`mt-2 ${INPUT_CLASS}`} value={form.combinedMode} onChange={set("combinedMode")}>
              <option value="sequential">sequential — one after another</option>
              <option value="parallel">parallel — all at once</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ns-runner">
              Runner
            </label>
            <select id="ns-runner" className={`mt-2 ${INPUT_CLASS}`} value={form.runner} onChange={set("runner")}>
              {RUNNERS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
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
              scripts block
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.scriptCount} scripts`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the scripts JSON"
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

        <div className="mt-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
          <pre className="min-w-[320px] p-4 text-xs leading-5">
            <code>{hasError ? "// Fix the input above to build the scripts block." : result.json}</code>
          </pre>
        </div>

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Dev dependencies needed</dt>
            <dd className="text-right font-mono font-semibold">
              {hasError ? DASH : result.installHint || "none"}
            </dd>
          </div>
        </dl>

        {!hasError && result.hookNotes.length > 0 ? (
          <ul className="mt-4 space-y-2 text-sm text-[var(--success)]">
            {result.hookNotes.map((note) => (
              <li key={note} className="flex gap-2">
                <span aria-hidden="true">•</span>
                {note}
              </li>
            ))}
          </ul>
        ) : null}

        {!hasError && result.warnings.length > 0 ? (
          <ul className="mt-3 space-y-2 text-sm text-[var(--danger)]">
            {result.warnings.map((warning) => (
              <li key={warning} className="flex gap-2">
                <span aria-hidden="true">•</span>
                {warning}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Hook and lifecycle behaviour follows the npm scripts documentation. The Windows audit
        assumes npm&apos;s default script-shell (cmd.exe); teams that set script-shell to bash have
        fewer constraints.
      </p>
    </main>
  );
}
