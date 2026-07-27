"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Globe, RotateCcw } from "lucide-react";

import { DESTINATIONS, QUALIFICATIONS, getEquivalence } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = { qualificationId: "bachelor-3yr", destinationId: "us" };
const DASH = "—";

export default function ToolHome() {
  const [qualificationId, setQualificationId] = useState(DEFAULTS.qualificationId);
  const [destinationId, setDestinationId] = useState(DEFAULTS.destinationId);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => getEquivalence({ qualificationId, destinationId }),
    [qualificationId, destinationId],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Degree equivalence",
      `Qualification: ${result.qualification}`,
      `Destination: ${result.destination}`,
      `Equivalence: ${result.verdict}`,
      result.note,
    ].join("\n");
  }, [hasError, result]);

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
    setQualificationId(DEFAULTS.qualificationId);
    setDestinationId(DEFAULTS.destinationId);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Globe className="h-4 w-4" aria-hidden="true" />
          Grade Conversion
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Degree Equivalence Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          How Indian qualifications map to the US, UK, Canada, Australia and Germany — based on
          the practice of ECCTIS, WES-style evaluators, ECA agencies, the AQF and Anabin.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="deq-qual">
              Indian qualification
            </label>
            <select
              id="deq-qual"
              className={`mt-2 ${INPUT_CLASS}`}
              value={qualificationId}
              onChange={(event) => setQualificationId(event.target.value)}
            >
              {QUALIFICATIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="deq-dest">
              Destination country
            </label>
            <select
              id="deq-dest"
              className={`mt-2 ${INPUT_CLASS}`}
              value={destinationId}
              onChange={(event) => setDestinationId(event.target.value)}
            >
              {DESTINATIONS.map((option) => (
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
              {hasError ? "Equivalence" : `In ${result.destination}`}
            </p>
            <p className="mt-1 text-2xl font-semibold leading-snug text-[var(--primary)] sm:text-3xl">
              {hasError ? DASH : result.verdict}
            </p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a result." : result.note}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the degree equivalence result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset selections to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">
            {result.qualification} across all destinations
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Country
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Typical equivalence
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.allDestinations.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-b border-[var(--border)] last:border-0 ${
                      row.id === destinationId ? "bg-[var(--muted)]" : ""
                    }`}
                  >
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2">{row.verdict}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational summary of typical recognition practice — not an official evaluation or
        immigration advice. Universities, licensing bodies and credential evaluators (WES, ECE,
        ECCTIS, uni-assist) make the binding decision, so always obtain the official assessment
        the institution names.
      </p>
    </main>
  );
}
