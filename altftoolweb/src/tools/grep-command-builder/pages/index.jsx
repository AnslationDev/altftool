"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Terminal } from "lucide-react";

import { COMMON_FLAGS, buildGrepCommand } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_CLASS =
  "h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const DEFAULTS = {
  engine: "ripgrep",
  pattern: "TODO|FIXME",
  searchPath: "src",
  flags: {
    ignoreCase: true,
    wordMatch: false,
    invertMatch: false,
    fixedStrings: false,
    lineNumbers: true,
    countOnly: false,
    filesOnly: false,
  },
  recursive: true,
  extendedRegex: true,
  hidden: false,
  smartCase: false,
  contextBefore: "0",
  contextAfter: "2",
  includeGlobs: "*.js, *.jsx",
  excludeGlobs: "node_modules/**",
};

const DASH = "—";

export default function ToolHome() {
  const [engine, setEngine] = useState(DEFAULTS.engine);
  const [pattern, setPattern] = useState(DEFAULTS.pattern);
  const [searchPath, setSearchPath] = useState(DEFAULTS.searchPath);
  const [flags, setFlags] = useState(DEFAULTS.flags);
  const [recursive, setRecursive] = useState(DEFAULTS.recursive);
  const [extendedRegex, setExtendedRegex] = useState(DEFAULTS.extendedRegex);
  const [hidden, setHidden] = useState(DEFAULTS.hidden);
  const [smartCase, setSmartCase] = useState(DEFAULTS.smartCase);
  const [contextBefore, setContextBefore] = useState(DEFAULTS.contextBefore);
  const [contextAfter, setContextAfter] = useState(DEFAULTS.contextAfter);
  const [includeGlobs, setIncludeGlobs] = useState(DEFAULTS.includeGlobs);
  const [excludeGlobs, setExcludeGlobs] = useState(DEFAULTS.excludeGlobs);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildGrepCommand({
        engine,
        pattern,
        searchPath,
        ...flags,
        recursive,
        extendedRegex,
        hidden,
        smartCase,
        contextBefore: contextBefore.trim() === "" ? 0 : Number(contextBefore),
        contextAfter: contextAfter.trim() === "" ? 0 : Number(contextAfter),
        includeGlobs,
        excludeGlobs,
      }),
    [
      engine,
      pattern,
      searchPath,
      flags,
      recursive,
      extendedRegex,
      hidden,
      smartCase,
      contextBefore,
      contextAfter,
      includeGlobs,
      excludeGlobs,
    ],
  );

  const hasError = Boolean(result.error);

  const toggleFlag = (key) => setFlags((prev) => ({ ...prev, [key]: !prev[key] }));

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setEngine(DEFAULTS.engine);
    setPattern(DEFAULTS.pattern);
    setSearchPath(DEFAULTS.searchPath);
    setFlags(DEFAULTS.flags);
    setRecursive(DEFAULTS.recursive);
    setExtendedRegex(DEFAULTS.extendedRegex);
    setHidden(DEFAULTS.hidden);
    setSmartCase(DEFAULTS.smartCase);
    setContextBefore(DEFAULTS.contextBefore);
    setContextAfter(DEFAULTS.contextAfter);
    setIncludeGlobs(DEFAULTS.includeGlobs);
    setExcludeGlobs(DEFAULTS.excludeGlobs);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Terminal className="h-4 w-4" aria-hidden="true" />
          Shell tooling
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Grep Command Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick your flags, globs and context lines and get a correctly quoted grep or ripgrep
          command you can paste straight into a POSIX shell.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gcb-engine">
              Engine
            </label>
            <select
              id="gcb-engine"
              className={`mt-2 ${INPUT_CLASS}`}
              value={engine}
              onChange={(event) => setEngine(event.target.value)}
            >
              <option value="grep">GNU grep</option>
              <option value="ripgrep">ripgrep (rg)</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gcb-path">
              File or directory to search
            </label>
            <input
              id="gcb-path"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={searchPath}
              onChange={(event) => setSearchPath(event.target.value)}
              placeholder="."
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="gcb-pattern">
              Search pattern
            </label>
            <input
              id="gcb-pattern"
              className={`mt-2 font-mono ${INPUT_CLASS}`}
              type="text"
              value={pattern}
              onChange={(event) => setPattern(event.target.value)}
              placeholder="TODO|FIXME"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gcb-before">
              Context lines before (-B)
            </label>
            <input
              id="gcb-before"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={contextBefore}
              onChange={(event) => setContextBefore(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gcb-after">
              Context lines after (-A)
            </label>
            <input
              id="gcb-after"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={contextAfter}
              onChange={(event) => setContextAfter(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gcb-include">
              Include globs (comma separated)
            </label>
            <input
              id="gcb-include"
              className={`mt-2 font-mono ${INPUT_CLASS}`}
              type="text"
              value={includeGlobs}
              onChange={(event) => setIncludeGlobs(event.target.value)}
              placeholder="*.js, *.ts"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gcb-exclude">
              Exclude globs (comma separated)
            </label>
            <input
              id="gcb-exclude"
              className={`mt-2 font-mono ${INPUT_CLASS}`}
              type="text"
              value={excludeGlobs}
              onChange={(event) => setExcludeGlobs(event.target.value)}
              placeholder="node_modules/**"
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Matching and output flags</legend>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {COMMON_FLAGS.map(({ key, label }) => (
              <label
                key={key}
                htmlFor={`gcb-flag-${key}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
              >
                <input
                  id={`gcb-flag-${key}`}
                  type="checkbox"
                  className={CHECK_CLASS}
                  checked={flags[key]}
                  onChange={() => toggleFlag(key)}
                />
                {label}
              </label>
            ))}
            {engine === "grep" ? (
              <>
                <label
                  htmlFor="gcb-recursive"
                  className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                >
                  <input
                    id="gcb-recursive"
                    type="checkbox"
                    className={CHECK_CLASS}
                    checked={recursive}
                    onChange={(event) => setRecursive(event.target.checked)}
                  />
                  Recurse into directories (-r)
                </label>
                <label
                  htmlFor="gcb-extended"
                  className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                >
                  <input
                    id="gcb-extended"
                    type="checkbox"
                    className={CHECK_CLASS}
                    checked={extendedRegex}
                    onChange={(event) => setExtendedRegex(event.target.checked)}
                  />
                  Extended regex (-E)
                </label>
              </>
            ) : (
              <>
                <label
                  htmlFor="gcb-hidden"
                  className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                >
                  <input
                    id="gcb-hidden"
                    type="checkbox"
                    className={CHECK_CLASS}
                    checked={hidden}
                    onChange={(event) => setHidden(event.target.checked)}
                  />
                  Search hidden files (--hidden)
                </label>
                <label
                  htmlFor="gcb-smart"
                  className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                >
                  <input
                    id="gcb-smart"
                    type="checkbox"
                    className={CHECK_CLASS}
                    checked={smartCase}
                    onChange={(event) => setSmartCase(event.target.checked)}
                  />
                  Smart case (-S)
                </label>
              </>
            )}
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
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Your command
            </p>
            <div className="mt-2 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
              <code className="whitespace-pre font-mono text-sm text-[var(--primary)]">
                {hasError ? DASH : result.command}
              </code>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated command"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy command"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && result.notes.length > 0 ? (
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Engine", engine === "ripgrep" ? "ripgrep (rg)" : "GNU grep"],
            ["Pattern quoting", "POSIX single quotes; embedded quotes escaped as '\\''"],
            [
              "Recursion",
              engine === "ripgrep"
                ? "ripgrep recurses by default"
                : recursive
                  ? "-r descends into directories"
                  : "current file/dir only",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Flag mappings follow the GNU grep manual and ripgrep 14 help text. Always dry-run a
        destructive pipeline (for example anything piped to xargs rm) before trusting it.
      </p>
    </main>
  );
}
