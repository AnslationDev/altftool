"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Siren } from "lucide-react";

import { DEFAULT_LEVELS, MAX_LEVELS, MIN_LEVELS, buildSeverityMatrix } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_ORG = "Acme Engineering";
const DEFAULT_COUNT = 4;

const FIELD_DEFS = [
  { key: "summary", label: "One-line summary", rows: 1 },
  { key: "impact", label: "Impact definition", rows: 2 },
  { key: "examples", label: "Examples", rows: 2 },
  { key: "response", label: "First response target", rows: 1 },
  { key: "updates", label: "Status update cadence", rows: 1 },
  { key: "escalation", label: "Escalation path", rows: 2 },
];

const DASH = "—";

export default function ToolHome() {
  const [orgName, setOrgName] = useState(DEFAULT_ORG);
  const [levelCount, setLevelCount] = useState(DEFAULT_COUNT);
  const [levels, setLevels] = useState(() => DEFAULT_LEVELS.map((level) => ({ ...level })));
  const [openLevel, setOpenLevel] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeLevels = useMemo(() => levels.slice(0, levelCount), [levels, levelCount]);

  const result = useMemo(
    () => buildSeverityMatrix({ orgName, levels: activeLevels }),
    [orgName, activeLevels],
  );

  const hasError = Boolean(result.error);

  const updateLevel = (index, key, value) => {
    setLevels((previous) =>
      previous.map((level, i) => (i === index ? { ...level, [key]: value } : level)),
    );
  };

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setOrgName(DEFAULT_ORG);
    setLevelCount(DEFAULT_COUNT);
    setLevels(DEFAULT_LEVELS.map((level) => ({ ...level })));
    setOpenLevel(0);
    setCopied(false);
  };

  const countOptions = [];
  for (let n = MIN_LEVELS; n <= MAX_LEVELS; n += 1) countOptions.push(n);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Siren className="h-4 w-4" aria-hidden="true" />
          Incident response
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Incident Severity Matrix Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Define SEV-1 to SEV-5 for your organisation — impact, first-response target, update
          cadence and escalation path — and export a Markdown matrix ready for your runbook or
          wiki. Defaults follow common SRE and PagerDuty-style conventions.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sev-org">
              Organisation or team name
            </label>
            <input
              id="sev-org"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={orgName}
              onChange={(event) => setOrgName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sev-count">
              Number of severity levels
            </label>
            <select
              id="sev-count"
              className={`mt-2 ${INPUT_CLASS}`}
              value={levelCount}
              onChange={(event) => {
                const next = Number(event.target.value);
                setLevelCount(next);
                setOpenLevel((current) => Math.min(current, next - 1));
              }}
            >
              {countOptions.map((n) => (
                <option key={n} value={n}>
                  {n} levels (SEV-1 to SEV-{n})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Severity levels">
          {activeLevels.map((level, index) => (
            <button
              key={`level-${index}`}
              type="button"
              role="tab"
              aria-selected={openLevel === index}
              onClick={() => setOpenLevel(index)}
              className={`min-h-11 rounded-md px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                openLevel === index
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
              }`}
            >
              {level.name}
            </button>
          ))}
        </div>

        {activeLevels[openLevel] ? (
          <div className="mt-4 grid gap-4">
            <div>
              <label className={LABEL_CLASS} htmlFor="sev-name">
                Level name
              </label>
              <input
                id="sev-name"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={activeLevels[openLevel].name}
                onChange={(event) => updateLevel(openLevel, "name", event.target.value)}
              />
            </div>
            {FIELD_DEFS.map((field) => (
              <div key={field.key}>
                <label className={LABEL_CLASS} htmlFor={`sev-${field.key}`}>
                  {field.label}
                </label>
                {field.rows === 1 ? (
                  <input
                    id={`sev-${field.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={activeLevels[openLevel][field.key]}
                    onChange={(event) => updateLevel(openLevel, field.key, event.target.value)}
                  />
                ) : (
                  <textarea
                    id={`sev-${field.key}`}
                    className={`mt-2 ${AREA_CLASS}`}
                    rows={field.rows}
                    value={activeLevels[openLevel][field.key]}
                    onChange={(event) => updateLevel(openLevel, field.key, event.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        ) : null}
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
              Generated matrix
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.levelCount} levels`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the matrix."
                : "Markdown below is ready to paste into your runbook, wiki or incident tooling."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the severity matrix Markdown"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy Markdown"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the matrix to the default levels"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
          <pre className="min-w-full whitespace-pre p-4 text-xs leading-5 text-[var(--foreground)]">
            {hasError ? DASH : result.markdown}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Severity should always be assigned by current customer impact, never by suspected root
        cause. Adapt the response targets to your on-call coverage — a 15-minute target is only
        honest if someone is actually paged around the clock.
      </p>
    </main>
  );
}
