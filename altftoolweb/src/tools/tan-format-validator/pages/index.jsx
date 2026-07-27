"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, Check, Copy, RotateCcw, X } from "lucide-react";

import {
  SECTION_272BB_PENALTY,
  TAN_LOCATION_CODES,
  validateTan,
  validateTanList,
} from "../lib";

const COUNT = new Intl.NumberFormat("en-IN");
const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const DEFAULTS = {
  tan: "MUMM12345B",
  bulk: "MUMM12345B\nDELH99999A\nPNEA1234X",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [tan, setTan] = useState(DEFAULTS.tan);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulk, setBulk] = useState(DEFAULTS.bulk);
  const [copied, setCopied] = useState(false);

  const single = useMemo(() => validateTan(tan), [tan]);
  const batch = useMemo(() => (bulkMode ? validateTanList(bulk) : null), [bulkMode, bulk]);

  const summary = useMemo(() => {
    if (bulkMode) {
      if (!batch || batch.error) return "";
      return [
        "TAN format check",
        `Checked: ${batch.total}`,
        `Valid structure: ${batch.validCount}`,
        `Invalid: ${batch.invalidCount}`,
        "",
        ...batch.results.map(
          (result) => `${result.normalized || "(empty)"} — ${result.valid ? "valid structure" : result.errors[0]}`,
        ),
      ].join("\n");
    }
    if (!single.valid) return "";
    return [
      "TAN format check",
      `TAN: ${single.normalized}`,
      "Structure: valid (AAAA99999A)",
      `Location code: ${single.parts.locationCode}${single.parts.locationCity ? ` (${single.parts.locationCity})` : ""}`,
      `Deductor name initial: ${single.parts.nameInitial}`,
      `Serial: ${single.parts.serial}`,
      `Last letter: ${single.parts.checkLetter}`,
    ].join("\n");
  }, [bulkMode, batch, single]);

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
    setTan(DEFAULTS.tan);
    setBulk(DEFAULTS.bulk);
    setBulkMode(false);
    setCopied(false);
  };

  const singleError = !single.valid;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BadgeCheck className="h-4 w-4" aria-hidden="true" />
          Section 203A
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">TAN Format Validator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A Tax Deduction and Collection Account Number is always four letters, five digits and one
          letter. This runs entirely in your browser — nothing is sent anywhere — and points at the
          exact character that is wrong.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setBulkMode(false)}
            aria-pressed={!bulkMode}
            className={`min-h-11 rounded-md px-4 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
              bulkMode
                ? "border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                : "bg-[var(--primary)] text-[var(--primary-foreground)]"
            }`}
          >
            Single TAN
          </button>
          <button
            type="button"
            onClick={() => setBulkMode(true)}
            aria-pressed={bulkMode}
            className={`min-h-11 rounded-md px-4 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
              bulkMode
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
            }`}
          >
            Bulk list
          </button>
        </div>

        {bulkMode ? (
          <div className="mt-4">
            <label className={LABEL_CLASS} htmlFor="tan-bulk">
              One TAN per line
            </label>
            <textarea
              id="tan-bulk"
              rows={6}
              className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm uppercase tracking-wide text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              value={bulk}
              onChange={(event) => setBulk(event.target.value)}
              spellCheck={false}
            />
          </div>
        ) : (
          <div className="mt-4">
            <label className={LABEL_CLASS} htmlFor="tan-single">
              TAN
            </label>
            <input
              id="tan-single"
              className={`mt-2 font-mono uppercase tracking-[0.2em] ${INPUT_CLASS}`}
              type="text"
              inputMode="text"
              autoComplete="off"
              spellCheck={false}
              maxLength={20}
              placeholder="AAAA99999A"
              value={tan}
              onChange={(event) => setTan(event.target.value)}
            />
          </div>
        )}
      </section>

      {!bulkMode && singleError ? (
        <div
          role="alert"
          className="mt-6 space-y-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {single.errors.map((message) => (
            <p key={message}>{message}</p>
          ))}
          {single.suggestion ? <p>Did you mean {single.suggestion}?</p> : null}
        </div>
      ) : null}

      {!bulkMode && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Structure
              </p>
              <p
                className={`mt-1 break-all font-mono text-3xl font-semibold sm:text-4xl ${
                  singleError ? "text-[var(--muted-foreground)]" : "text-[var(--primary)]"
                }`}
              >
                {singleError ? "—" : single.parts.grouped}
              </p>
              <p
                className={`mt-1 text-sm font-semibold ${
                  singleError ? "text-[var(--danger)]" : "text-[var(--success)]"
                }`}
              >
                {singleError ? "Not a valid TAN structure" : "Valid TAN structure"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyResult}
                aria-label="Copy TAN validation result"
                className={GHOST_BTN}
                disabled={!summary}
              >
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied ? "Copied!" : "Copy result"}
              </button>
              <button type="button" onClick={reset} aria-label="Reset the validator" className={PRIMARY_BTN}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>

          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            {[
              ["Location code (positions 1-3)", singleError ? "—" : single.parts.locationCode],
              [
                "Income-tax office city",
                singleError
                  ? "—"
                  : single.parts.locationCity || "Not in our reference list — still a valid code",
              ],
              ["Deductor name initial (position 4)", singleError ? "—" : single.parts.nameInitial],
              ["Serial (positions 5-9)", singleError ? "—" : single.parts.serial],
              ["Final letter (position 10)", singleError ? "—" : single.parts.checkLetter],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {bulkMode && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          {batch?.error ? (
            <p
              role="alert"
              className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              {batch.error}
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Valid structures
                  </p>
                  <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                    {COUNT.format(batch.validCount)}
                    <span className="text-lg text-[var(--muted-foreground)]"> / {COUNT.format(batch.total)}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={copyResult}
                    aria-label="Copy bulk TAN validation result"
                    className={GHOST_BTN}
                  >
                    {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                    {copied ? "Copied!" : "Copy result"}
                  </button>
                  <button type="button" onClick={reset} aria-label="Reset the validator" className={PRIMARY_BTN}>
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Reset
                  </button>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[320px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      <th scope="col" className="py-2 pr-3 font-semibold">TAN</th>
                      <th scope="col" className="py-2 pr-3 font-semibold">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batch.results.map((result, index) => (
                      <tr
                        key={`${result.normalized}-${index}`}
                        className="border-b border-[var(--border)] last:border-0 align-top"
                      >
                        <td className="py-2 pr-3 font-mono font-semibold">{result.normalized || "—"}</td>
                        <td className="py-2 pr-3">
                          <span
                            className={`inline-flex items-center gap-1.5 font-semibold ${
                              result.valid ? "text-[var(--success)]" : "text-[var(--danger)]"
                            }`}
                          >
                            {result.valid ? (
                              <Check className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <X className="h-4 w-4" aria-hidden="true" />
                            )}
                            {result.valid ? "Valid structure" : "Invalid"}
                          </span>
                          {!result.valid && (
                            <span className="block text-[var(--muted-foreground)]">{result.errors[0]}</span>
                          )}
                          {result.valid && result.parts.locationCity && (
                            <span className="block text-[var(--muted-foreground)]">
                              {result.parts.locationCity}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Common location codes</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          The first three letters point to the income-tax office that allotted the TAN. This list is
          for reference only; a code that is not listed does not make a TAN invalid.
        </p>
        <ul className="mt-3 grid gap-x-4 gap-y-1.5 text-sm sm:grid-cols-2">
          {Object.entries(TAN_LOCATION_CODES).map(([code, city]) => (
            <li key={code} className="flex items-center justify-between gap-3">
              <span className="font-mono font-semibold">{code}</span>
              <span className="text-[var(--muted-foreground)]">{city}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A TAN carries no published checksum, so passing this check proves the shape is right, not
        that the number exists. Confirm a real TAN through the Income Tax e-filing portal&apos;s Know
        your TAN service. Failing to apply for or wrongly quoting a TAN attracts a penalty of{" "}
        {INR.format(SECTION_272BB_PENALTY)} under section 272BB.
      </p>
    </main>
  );
}
