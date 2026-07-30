"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Eraser, RotateCcw } from "lucide-react";

import {
  PARAM_NOTES,
  SITE_SPECIFIC_GROUPS,
  TRACKING_GROUPS,
  TRACKING_PREFIXES,
  stripTracking,
} from "../lib";

const TEXTAREA_CLASS =
  "min-h-[8rem] w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none sm:text-sm";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_INPUT = [
  "https://example.com/article?utm_source=newsletter&utm_medium=email&utm_campaign=july&id=42&fbclid=IwAR2xa",
  "https://shop.example.com/product?gclid=CjwKCAjw&mc_eid=8f2a1b&colour=blue",
  "https://www.amazon.in/dp/B0EXAMPLE?tag=someone-21&th=1&psc=1&ref_=nav_cart",
].join("\n");

const NUM = new Intl.NumberFormat("en-IN");

export default function ToolHome() {
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [aggressive, setAggressive] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => stripTracking(input, { aggressive }), [input, aggressive]);
  const hasError = Boolean(result.error);

  const copy = async () => {
    if (hasError || !result.cleanedText) return;
    try {
      await navigator.clipboard.writeText(result.cleanedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setInput(DEFAULT_INPUT);
    setAggressive(false);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 text-[var(--foreground)]">
      <header className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)] text-[var(--primary)]">
          <Eraser className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">URL Tracking Parameter Stripper</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Removes utm_, gclid, fbclid, msclkid, mc_eid and hundreds of other attribution
            parameters, leaving the part of the link that actually loads the page. Everything the
            filter keeps is passed through with its original encoding untouched, and no link ever
            leaves your browser.
          </p>
        </div>
      </header>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="tp-input">Links, one per line</label>
        <textarea
          id="tp-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="https://example.com/page?utm_source=…"
          spellCheck={false}
          className={`${TEXTAREA_CLASS} mt-1.5`}
        />

        <label
          htmlFor="tp-aggressive"
          className="mt-4 flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
        >
          <input
            id="tp-aggressive"
            type="checkbox"
            checked={aggressive}
            onChange={(e) => setAggressive(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
          />
          <span>
            <span className="font-medium">Also strip site-specific tags</span>
            <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
              Amazon affiliate and carousel tags, YouTube share ids, marketplace attribution. These
              are safe for reading but they change who is credited for the click, so they are off by
              default.
            </span>
          </span>
        </label>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        {hasError && (
          <p role="alert" className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            {result.error}
          </p>
        )}

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[var(--muted-foreground)]">Parameters removed</p>
            <p className={`text-4xl font-extrabold tabular-nums ${hasError ? "text-[var(--muted-foreground)]" : "text-[var(--primary)]"}`}>
              {hasError ? "—" : NUM.format(result.totalRemoved)}
            </p>
            <p className="mt-1 text-sm font-semibold">
              {hasError ? "—" : `across ${NUM.format(result.totalLinks)} link${result.totalLinks === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copy}
              disabled={hasError || !result.cleanedText}
              aria-label="Copy the cleaned links to the clipboard"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset to the sample links" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">Characters saved</dt>
                <dd className="text-right font-semibold">{NUM.format(result.savedChars)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">Lines that could not be read</dt>
                <dd className="text-right font-semibold">{NUM.format(result.failed)}</dd>
              </div>
            </dl>

            <div className="mt-5">
              <label className={LABEL_CLASS} htmlFor="tp-output">Cleaned links</label>
              <textarea
                id="tp-output"
                readOnly
                value={result.cleanedText}
                spellCheck={false}
                className={`${TEXTAREA_CLASS} mt-1.5`}
              />
            </div>

            <ul className="mt-5 grid gap-3">
              {result.results.map((row, index) => (
                <li
                  key={`${row.input}-${index}`}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                >
                  {row.error ? (
                    <>
                      <p className="font-mono text-xs break-all text-[var(--muted-foreground)]">{row.input}</p>
                      <p role="alert" className="mt-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
                        {row.error}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-mono text-xs break-all">{row.cleaned}</p>
                      {row.removed.length ? (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {row.removed.map((param) => (
                            <span
                              key={`${param.key}-${param.where}`}
                              title={PARAM_NOTES[param.key] ?? `${param.group}${param.where === "fragment" ? " (from the fragment)" : ""}`}
                              className="rounded-full bg-[var(--danger-soft)] px-2 py-0.5 font-mono text-xs text-[var(--danger)]"
                            >
                              −{param.key}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-[var(--muted-foreground)]">Nothing to remove on this one.</p>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What gets removed, and why</h2>
        <div className="mt-3 grid gap-3">
          {TRACKING_GROUPS.map((group) => (
            <div key={group.id} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
              <p className="text-sm font-semibold">{group.label}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{group.note}</p>
              <p className="mt-2 font-mono text-xs break-all text-[var(--muted-foreground)]">
                {group.params.slice(0, 12).join(", ")}
                {group.params.length > 12 ? ` … +${group.params.length - 12} more` : ""}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
          Anything beginning{" "}
          <span className="font-mono text-xs">{TRACKING_PREFIXES.slice(0, 8).join(", ")}</span> is
          removed by prefix as well, which covers the custom fields platforms invent.
        </p>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Only with the deeper clean</h2>
        <div className="mt-3 grid gap-3">
          {SITE_SPECIFIC_GROUPS.map((group) => (
            <div key={group.id} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
              <p className="text-sm font-semibold">{group.label}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{group.note}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A stripped link points at the same page; only the attribution is gone. A few sites do put
        working state in a query parameter — a search term, a page number, a video start time — so
        open the result once before sharing it widely. Parameters that survive are passed through
        exactly as you pasted them.
      </p>
    </main>
  );
}
