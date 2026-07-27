"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileCode, RotateCcw } from "lucide-react";

import { CASE_STYLES, auditIconNames, buildRenamePlan } from "../lib";

const NUM = new Intl.NumberFormat("en-US");
const PCT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const DASH = "—";

const DEFAULTS = {
  names: [
    "ArrowLeft.svg",
    "arrow-right.svg",
    "arrow_up.svg",
    "chevronDown-24.svg",
    "Chevron-Down-24.svg",
    "user profile.svg",
    "con.svg",
  ].join("\n"),
  style: "kebab",
  prefix: "",
  extension: "svg",
  requiredSuffixes: "",
  splitDigits: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-xs leading-5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const LEVEL_CLASS = {
  error: "bg-[var(--danger-soft)] text-[var(--danger)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  info: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

export default function ToolHome() {
  const [names, setNames] = useState(DEFAULTS.names);
  const [style, setStyle] = useState(DEFAULTS.style);
  const [prefix, setPrefix] = useState(DEFAULTS.prefix);
  const [extension, setExtension] = useState(DEFAULTS.extension);
  const [requiredSuffixes, setRequiredSuffixes] = useState(DEFAULTS.requiredSuffixes);
  const [splitDigits, setSplitDigits] = useState(DEFAULTS.splitDigits);
  const [copied, setCopied] = useState(false);

  const report = useMemo(
    () => auditIconNames({ names, style, prefix, extension, requiredSuffixes, splitDigits }),
    [names, style, prefix, extension, requiredSuffixes, splitDigits],
  );

  const plan = useMemo(() => buildRenamePlan(report), [report]);

  const copyResult = async () => {
    if (report.error || !plan) return;
    try {
      await navigator.clipboard.writeText(plan);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setNames(DEFAULTS.names);
    setStyle(DEFAULTS.style);
    setPrefix(DEFAULTS.prefix);
    setExtension(DEFAULTS.extension);
    setRequiredSuffixes(DEFAULTS.requiredSuffixes);
    setSplitDigits(DEFAULTS.splitDigits);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileCode className="h-4 w-4" aria-hidden="true" />
          Naming audit
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Icon Naming Consistency Checker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste your icon file names and get a per-file verdict against one naming convention, plus
          the corrected name and a ready-to-run list of git mv commands.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="icn-names">
          Icon file names (one per line)
        </label>
        <textarea
          id="icn-names"
          className={`mt-2 ${AREA_CLASS}`}
          rows={9}
          spellCheck={false}
          value={names}
          onChange={(event) => setNames(event.target.value)}
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="icn-style">
              Naming convention
            </label>
            <select
              id="icn-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={style}
              onChange={(event) => setStyle(event.target.value)}
            >
              {CASE_STYLES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name} — {entry.example}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="icn-ext">
              Required extension (blank to allow any)
            </label>
            <input
              id="icn-ext"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              spellCheck={false}
              value={extension}
              onChange={(event) => setExtension(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="icn-prefix">
              Required prefix (blank for none)
            </label>
            <input
              id="icn-prefix"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              spellCheck={false}
              placeholder="icon"
              value={prefix}
              onChange={(event) => setPrefix(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="icn-suffix">
              Allowed final token, comma separated
            </label>
            <input
              id="icn-suffix"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              spellCheck={false}
              placeholder="16, 24, 32"
              value={requiredSuffixes}
              onChange={(event) => setRequiredSuffixes(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex min-h-11 items-center gap-3">
          <input
            id="icn-digits"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={splitDigits}
            onChange={(event) => setSplitDigits(event.target.checked)}
          />
          <label className="text-sm text-[var(--foreground)]" htmlFor="icn-digits">
            Treat a digit run as its own word (arrowLeft24 becomes arrow-left-24)
          </label>
        </div>
      </section>

      {report.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {report.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Names already conforming
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {report.error ? DASH : `${PCT.format(report.conformance)}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {report.error
                ? "Paste some file names to audit"
                : `${NUM.format(report.okCount)} of ${NUM.format(report.total)} pass; ${NUM.format(report.issueCount)} need renaming`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the git mv rename plan"
              className={GHOST_BTN}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy rename plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the tool" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Current name</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Suggested</th>
                <th scope="col" className="py-2 font-semibold">Problems</th>
              </tr>
            </thead>
            <tbody>
              {report.error ? (
                <tr>
                  <td className="py-2 pr-3">{DASH}</td>
                  <td className="py-2 pr-3">{DASH}</td>
                  <td className="py-2">{DASH}</td>
                </tr>
              ) : (
                report.rows.map((row, index) => (
                  <tr
                    key={`${row.original}-${index}`}
                    className="border-b border-[var(--border)] align-top last:border-0"
                  >
                    <td className="py-2 pr-3 font-mono text-xs break-all">{row.original}</td>
                    <td
                      className={`py-2 pr-3 font-mono text-xs break-all ${row.ok ? "text-[var(--muted-foreground)]" : "font-semibold text-[var(--primary)]"}`}
                    >
                      {row.suggestion}
                    </td>
                    <td className="py-2">
                      {row.ok ? (
                        <span className="inline-block rounded-md bg-[var(--success-soft)] px-2 py-1 text-xs font-semibold text-[var(--success)]">
                          ok
                        </span>
                      ) : (
                        <span className="flex flex-wrap gap-1">
                          {row.issues.map((issue) => (
                            <span
                              key={issue}
                              className="rounded-md bg-[var(--warning-soft)] px-2 py-1 text-xs font-semibold text-[var(--warning)]"
                            >
                              {report.issueLabels[issue]}
                            </span>
                          ))}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!report.error && report.issues.length > 0 && (
          <ul className="mt-5 space-y-2">
            {report.issues.map((issue) => (
              <li
                key={issue.message}
                role={issue.level === "error" ? "alert" : undefined}
                className={`rounded-md px-3 py-2 text-sm font-medium ${LEVEL_CLASS[issue.level]}`}
              >
                {issue.message}
              </li>
            ))}
          </ul>
        )}
      </section>

      {!report.error && plan && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Rename plan</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Run these from the icon directory. Check the collision warnings first — git mv will
            overwrite a target that already exists.
          </p>
          <div className="mt-3 overflow-x-auto">
            <pre className="min-w-full whitespace-pre rounded-md bg-[var(--muted)] p-3 font-mono text-xs leading-5">
              {plan}
            </pre>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        File names are capped at 255 characters per path component on ext4, APFS and NTFS. Names that
        differ only by letter case collide on default macOS and Windows volumes, and the MS-DOS device
        names con, prn, aux, nul, com1-9 and lpt1-9 cannot be created on Windows at all.
      </p>
    </main>
  );
}
