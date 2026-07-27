"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GitCompareArrows, RotateCcw } from "lucide-react";

import { checkOverlaps } from "../lib";

const INPUT_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SAMPLE = `10.0.0.0/16
10.0.128.0/17
172.16.0.0/12
192.168.1.10 - 192.168.1.99
192.168.1.50`;

const DEFAULTS = { text: SAMPLE };
const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN");

export default function ToolHome() {
  const [text, setText] = useState(DEFAULTS.text);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => checkOverlaps({ text }), [text]);
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    if (result.overlaps.length === 0) return "No overlaps found.";
    return result.overlaps
      .map(
        (overlap) =>
          `${overlap.a} overlaps ${overlap.b} (${overlap.relation}): ${overlap.overlapStart} – ${overlap.overlapEnd} (${NUM.format(overlap.overlapSize)} addresses)`,
      )
      .join("\n");
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
    setText(DEFAULTS.text);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GitCompareArrows className="h-4 w-4" aria-hidden="true" />
          Networking
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">IP Range Overlap Checker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste CIDR blocks, start–end ranges or single addresses (one per line) and every pair is
          checked for overlap — with the exact intersecting range and its size.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="iro-text">
          Networks to compare (one per line)
        </label>
        <textarea
          id="iro-text"
          className={`mt-2 min-h-40 py-2 font-mono text-sm ${INPUT_CLASS}`}
          value={text}
          onChange={(event) => setText(event.target.value)}
          spellCheck={false}
        />
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Accepted formats: 10.0.0.0/24 · 10.0.0.1 - 10.0.0.99 · 10.0.0.5
        </p>
      </section>

      {hasError ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Overlapping pairs
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                !hasError && result.overlaps.length > 0 ? "text-[var(--danger)]" : "text-[var(--primary)]"
              }`}
            >
              {hasError ? DASH : NUM.format(result.overlaps.length)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : result.overlaps.length === 0
                  ? `No conflicts across ${NUM.format(result.pairsChecked)} pair comparisons — safe to peer or merge.`
                  : `${NUM.format(result.pairsChecked)} pairs checked. Overlapping address space will break routing between these networks.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the overlap report"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy report"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset to the sample networks" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && result.overlaps.length > 0 ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Pair</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Relationship</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Overlapping range</th>
                  <th scope="col" className="py-2 text-right font-semibold">Addresses</th>
                </tr>
              </thead>
              <tbody>
                {result.overlaps.map((overlap) => (
                  <tr key={`${overlap.a}|${overlap.b}`} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-mono text-xs">
                      {overlap.a}
                      <br />
                      {overlap.b}
                    </td>
                    <td className="py-2 pr-3">{overlap.relation}</td>
                    <td className="py-2 pr-3 font-mono text-xs">
                      {overlap.overlapStart} – {overlap.overlapEnd}
                    </td>
                    <td className="py-2 text-right font-semibold">{NUM.format(overlap.overlapSize)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <h2 className="mt-6 text-base font-semibold">Parsed networks</h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Entry</th>
                <th scope="col" className="py-2 pr-3 font-semibold">First address</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Last address</th>
                <th scope="col" className="py-2 text-right font-semibold">Size</th>
              </tr>
            </thead>
            <tbody>
              {(hasError ? [] : result.entries).map((entry, index) => (
                <tr key={`${entry.label}-${index}`} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-mono text-xs">{entry.label}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{entry.start}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{entry.end}</td>
                  <td className="py-2 text-right font-semibold">{NUM.format(entry.size)}</td>
                </tr>
              ))}
              {hasError ? (
                <tr>
                  <td className="py-2 pr-3">{DASH}</td>
                  <td className="py-2 pr-3">{DASH}</td>
                  <td className="py-2 pr-3">{DASH}</td>
                  <td className="py-2 text-right">{DASH}</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {!hasError && result.lineErrors.length > 0 ? (
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[var(--danger)]">
            {result.lineErrors.map((lineError) => (
              <li key={lineError}>{lineError}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Two ranges overlap when each starts at or before the other ends. Cloud providers reject VPC
        peering between overlapping CIDR blocks, and VPNs between them need NAT — check before you
        allocate.
      </p>
    </main>
  );
}
