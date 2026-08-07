"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Check, Copy, RotateCcw } from "lucide-react";

import { convertLines } from "../lib";

const INPUT_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SAMPLE = `192.168.1.0/26
10.0.0.5 - 10.0.0.16
172.16.5.0 0.0.0.255
8.8.8.8`;

const DEFAULTS = { text: SAMPLE };
const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN");

export default function ToolHome() {
  const [text, setText] = useState(DEFAULTS.text);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => convertLines({ text }), [text]);
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return result.results
      .map(
        (row) =>
          `${row.input}  =>  range ${row.start} - ${row.end}  |  CIDR ${row.cidrs.join(" + ")}${row.wildcard ? `  |  wildcard ${row.wildcard}` : ""}`,
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
          <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
          Networking
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">CIDR to IP Range Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste CIDR blocks, start–end ranges or Cisco wildcard entries in bulk. Each line is
          converted to all three forms, and arbitrary ranges are split into the minimal set of CIDR
          blocks.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="c2r-text">
          Entries to convert (one per line)
        </label>
        <textarea
          id="c2r-text"
          className={`mt-2 min-h-40 py-2 font-mono text-sm ${INPUT_CLASS}`}
          value={text}
          onChange={(event) => setText(event.target.value)}
          spellCheck={false}
        />
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Accepted formats: 10.0.0.0/24 · 10.0.0.1 - 10.0.0.99 · 172.16.5.0 0.0.0.255 (wildcard) ·
          10.0.0.5
        </p>
      </section>

      {hasError ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      ) : null}

      <section aria-live="polite" role="status" className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Entries converted
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.results.length)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the conversion table"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy results"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset to the sample entries" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Input</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Start – end range</th>
                <th scope="col" className="py-2 pr-3 font-semibold">CIDR block(s)</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Wildcard entry</th>
                <th scope="col" className="py-2 text-right font-semibold">Addresses</th>
              </tr>
            </thead>
            <tbody>
              {(hasError ? [] : result.results).map((row, index) => (
                <tr key={`${row.input}-${index}`} className="border-b border-[var(--border)] last:border-0 align-top">
                  <td className="py-2 pr-3 font-mono text-xs">
                    {row.input}
                    <span className="mt-0.5 block text-[var(--muted-foreground)]">{row.format}</span>
                  </td>
                  <td className="py-2 pr-3 font-mono text-xs">
                    {row.start} – {row.end}
                  </td>
                  <td className="py-2 pr-3 font-mono text-xs">
                    {row.cidrs.map((cidrBlock) => (
                      <span key={cidrBlock} className="block">
                        {cidrBlock}
                      </span>
                    ))}
                  </td>
                  <td className="py-2 pr-3 font-mono text-xs">{row.wildcard ?? DASH}</td>
                  <td className="py-2 text-right font-semibold">{NUM.format(row.size)}</td>
                </tr>
              ))}
              {hasError ? (
                <tr>
                  <td className="py-2 pr-3">{DASH}</td>
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
        Ranges that do not align to a power-of-two boundary cannot be one CIDR block; they are
        decomposed with the standard greedy algorithm into the fewest blocks. Wildcard entries are
        shown only where the range is exactly one CIDR, since non-contiguous wildcards match
        scattered addresses.
      </p>
    </main>
  );
}
