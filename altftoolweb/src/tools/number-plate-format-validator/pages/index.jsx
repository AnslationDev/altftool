"use client";

import { useMemo, useState } from "react";
import { Check, CircleAlert, CircleCheck, Copy, RotateCcw, ScanLine } from "lucide-react";
import { DIPLOMATIC_CODES, PATTERNS, STATE_CODES, validatePlate, validatePlates } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "min-h-[8rem] w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_SINGLE = "MH 12 AB 1234";
const DEFAULT_BATCH = ["MH 12 AB 1234", "DL 8C AF 5010", "22BH1234AA", "13 CD 1234", "XY12AB1234"].join(
  "\n",
);

const PATTERN_ROWS = [
  ["Standard state series", "MH 12 AB 1234", PATTERNS.standard],
  ["Bharat (BH) series", "22 BH 1234 AA", PATTERNS.bh],
  ["Diplomatic", "13 CD 1234", PATTERNS.diplomatic],
  ["Defence", "↑12A 123456B", PATTERNS.defence],
];

const PART_LABELS = {
  state: "State code",
  rto: "RTO office code",
  series: "Letter series",
  number: "Serial",
  year: "Year",
  code: "Mission type",
  country: "Country code",
  class: "Vehicle class",
  serial: "Serial",
  check: "Check letter",
};

export default function ToolHome() {
  const [mode, setMode] = useState("single");
  const [single, setSingle] = useState(DEFAULT_SINGLE);
  const [batch, setBatch] = useState(DEFAULT_BATCH);
  const [copied, setCopied] = useState(false);

  const one = useMemo(() => validatePlate(single), [single]);
  const many = useMemo(() => validatePlates(batch), [batch]);

  const batchFailed = mode === "batch" && Boolean(many.error);
  const singleFailed = mode === "single" && !one.valid;
  const showError = batchFailed || singleFailed;
  const errorText = batchFailed ? many.error : one.reason;

  const summary = useMemo(() => {
    if (mode === "single") {
      if (!one.valid) return "";
      return [
        "Number Plate Format Validator",
        `Input: ${one.input}`,
        `Format: ${one.formatLabel}`,
        `Canonical: ${one.canonical}`,
        `Compact: ${one.compact}`,
        one.explain,
      ].join("\n");
    }
    if (many.error) return "";
    return [
      `Checked ${many.total} numbers — ${many.validCount} valid, ${many.invalidCount} invalid`,
      ...many.results.map(
        (row) =>
          `${row.valid ? "OK  " : "BAD "} ${row.input} — ${row.valid ? `${row.formatLabel}: ${row.canonical}` : row.reason}`,
      ),
    ].join("\n");
  }, [mode, one, many]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setMode("single");
    setSingle(DEFAULT_SINGLE);
    setBatch(DEFAULT_BATCH);
    setCopied(false);
  };

  const stateList = Object.entries(STATE_CODES);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ScanLine className="h-4 w-4" aria-hidden="true" />
          Vehicle compliance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Number Plate Format Validator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Check an Indian registration number against the standard state series, the BH series,
          diplomatic plates and defence plates. It parses the parts, flags a bad state code, and
          gives you the regular expression behind each format.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          {[
            ["single", "One number"],
            ["batch", "A list"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              aria-pressed={mode === value}
              className={
                mode === value
                  ? PRIMARY_BTN
                  : "inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              }
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "single" ? (
          <div>
            <label className={LABEL_CLASS} htmlFor="plate">
              Registration number
            </label>
            <input
              id="plate"
              className={`mt-2 font-mono uppercase ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              spellCheck="false"
              placeholder="MH 12 AB 1234"
              value={single}
              onChange={(event) => setSingle(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Spaces, hyphens and the defence arrow are ignored.
            </p>
          </div>
        ) : (
          <div>
            <label className={LABEL_CLASS} htmlFor="plates">
              One registration number per line
            </label>
            <textarea
              id="plates"
              className={`mt-2 ${AREA_CLASS}`}
              spellCheck="false"
              value={batch}
              onChange={(event) => setBatch(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">Up to 500 lines at a time.</p>
          </div>
        )}
      </section>

      {showError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {errorText}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {mode === "single" ? "Canonical form" : "Batch result"}
            </p>
            <p
              className={`mt-1 font-mono text-3xl font-semibold sm:text-4xl ${
                mode === "single"
                  ? one.valid
                    ? "text-[var(--primary)]"
                    : "text-[var(--danger)]"
                  : "text-[var(--primary)]"
              }`}
            >
              {mode === "single"
                ? one.valid
                  ? one.canonical
                  : "—"
                : many.error
                  ? "—"
                  : `${many.validCount} / ${many.total}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {mode === "single"
                ? one.valid
                  ? one.formatLabel
                  : "Not a recognised format"
                : many.error
                  ? "Nothing to check"
                  : `${many.invalidCount} did not parse`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the validation result"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the input" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {mode === "single" && (
          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            {[
              ["Input", one.input || "—"],
              ["Compact form", one.valid ? one.compact : "—"],
              ["Format", one.valid ? one.formatLabel : "—"],
              ["State or issuer", one.valid ? one.stateName || one.formatLabel : "—"],
              ...(one.valid && one.parts
                ? Object.entries(one.parts).map(([key, value]) => [
                    PART_LABELS[key] || key,
                    value || "none",
                  ])
                : [["Components", "—"]]),
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-mono font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        {mode === "single" && one.valid && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {one.explain}
          </p>
        )}

        {mode === "single" &&
          one.valid &&
          one.notes?.length > 0 && (
            <ul className="mt-3 grid gap-2 text-xs leading-5 text-[var(--muted-foreground)]">
              {one.notes.map((note) => (
                <li key={note} className="flex gap-2">
                  <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          )}

        {mode === "batch" && !many.error && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[440px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Input</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Result</th>
                  <th scope="col" className="py-2 font-semibold">Detail</th>
                </tr>
              </thead>
              <tbody>
                {many.results.map((row) => (
                  <tr key={`${row.index}-${row.input}`} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 pr-3 font-mono">{row.input}</td>
                    <td className="py-2.5 pr-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold ${
                          row.valid
                            ? "bg-[var(--muted)] text-[var(--success)]"
                            : "bg-[var(--danger-soft)] text-[var(--danger)]"
                        }`}
                      >
                        {row.valid ? (
                          <CircleCheck className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <CircleAlert className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        {row.valid ? "Valid" : "Invalid"}
                      </span>
                    </td>
                    <td className="py-2.5 text-xs leading-5 text-[var(--muted-foreground)]">
                      {row.valid ? `${row.formatLabel} · ${row.canonical}` : row.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Patterns used</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Format</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Example</th>
                <th scope="col" className="py-2 font-semibold">Regular expression</th>
              </tr>
            </thead>
            <tbody>
              {PATTERN_ROWS.map(([label, example, pattern]) => (
                <tr key={label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2.5 pr-3 font-semibold">{label}</td>
                  <td className="py-2.5 pr-3 font-mono text-xs">{example}</td>
                  <td className="py-2.5 font-mono text-xs break-all text-[var(--muted-foreground)]">
                    {pattern}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Diplomatic suffixes: {Object.entries(DIPLOMATIC_CODES).map(([code, text]) => `${code} — ${text}`).join("; ")}.
        </p>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">
          State and union territory codes ({stateList.length})
        </h2>
        <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          {stateList.map(([code, info]) => (
            <li key={code} className="flex items-baseline gap-2">
              <span className="font-mono font-semibold">{code}</span>
              <span className="text-[var(--muted-foreground)]">
                {info.name}
                {info.status === "legacy" ? " (legacy)" : ""}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        This checks the shape of a registration number only. A number can be perfectly well formed and
        still belong to no vehicle — use the official Parivahan or mParivahan service to confirm that a
        registration actually exists.
      </p>
    </main>
  );
}
