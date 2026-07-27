"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Terminal } from "lucide-react";

import { SHEBANG_OPTIONS, buildBashScaffold } from "../lib";

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
  scriptName: "backup.sh",
  description: "Nightly rsync backup of /srv/data",
  shebang: "env",
  strictMode: true,
  errTrap: true,
  cleanupTrap: true,
  logging: true,
  lock: true,
  requireRoot: false,
  dependencies: "rsync",
  verboseFlag: true,
  dryRunFlag: false,
};

const DASH = "—";

const TOGGLES = [
  ["strictMode", "Strict mode (set -Eeuo pipefail + tight IFS)"],
  ["errTrap", "ERR trap — report failing line number"],
  ["cleanupTrap", "EXIT cleanup trap with mktemp -d scratch dir"],
  ["logging", "Timestamped log() / die() helpers"],
  ["lock", "flock guard — never run two copies at once"],
  ["requireRoot", "Require root (EUID check)"],
  ["verboseFlag", "-v verbose flag"],
  ["dryRunFlag", "-n dry-run flag"],
];

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) =>
    setForm((prev) => ({
      ...prev,
      [key]: event.target.type === "checkbox" ? event.target.checked : event.target.value,
    }));

  const result = useMemo(() => buildBashScaffold(form), [form]);
  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.script);
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
          <Terminal className="h-4 w-4" aria-hidden="true" />
          Shell tooling
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Bash Script Scaffold Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Generate a production-grade bash skeleton — strict mode, ERR and EXIT traps, usage, getopts
          parsing, logging and an optional flock guard — ready for your own logic.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bss-name">
              Script file name
            </label>
            <input
              id="bss-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.scriptName}
              onChange={set("scriptName")}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bss-shebang">
              Shebang
            </label>
            <select id="bss-shebang" className={`mt-2 ${INPUT_CLASS}`} value={form.shebang} onChange={set("shebang")}>
              {SHEBANG_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bss-desc">
              One-line description
            </label>
            <input
              id="bss-desc"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.description}
              onChange={set("description")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bss-deps">
              Required commands (comma or space separated)
            </label>
            <input
              id="bss-deps"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.dependencies}
              onChange={set("dependencies")}
              placeholder="rsync jq curl"
              autoComplete="off"
              spellCheck={false}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Each one gets a <code>command -v</code> check that aborts with a clear message when missing.
            </p>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Safety features</legend>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {TOGGLES.map(([key, label]) => (
              <label
                key={key}
                htmlFor={`bss-${key}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
              >
                <input
                  id={`bss-${key}`}
                  type="checkbox"
                  className={CHECK_CLASS}
                  checked={form[key]}
                  onChange={set(key)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
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
              Generated script
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.lineCount} lines`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated bash script"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy script"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Features included</dt>
            <dd className="text-right font-semibold">
              {hasError ? DASH : result.features.join(", ") || "none"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Size</dt>
            <dd className="text-right font-semibold">{hasError ? DASH : `${result.charCount} characters`}</dd>
          </div>
        </dl>

        <div className="mt-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
          <pre className="min-w-[320px] p-4 text-xs leading-5">
            <code>{hasError ? "# Fix the input above to generate the script." : result.script}</code>
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
        The skeleton encodes common bash safety practice (strict mode, traps, flock). Always review
        and ShellCheck the script after adding your own logic — generated code is a starting point,
        not a guarantee.
      </p>
    </main>
  );
}
