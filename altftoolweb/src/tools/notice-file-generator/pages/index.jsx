"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ScrollText } from "lucide-react";

import { buildNoticeFile, parseDependencyLines } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  productName: "My Product",
  copyrightHolder: "Your Company, Inc.",
  yearFrom: "2024",
  yearTo: "2026",
  developedAt: "The My Product Project",
  developedAtUrl: "https://example.com",
  depsText:
    "React | Meta Platforms, Inc. | https://react.dev\nlodash | OpenJS Foundation and contributors | https://lodash.com",
};

const DASH = "—";

export default function ToolHome() {
  const [productName, setProductName] = useState(DEFAULTS.productName);
  const [copyrightHolder, setCopyrightHolder] = useState(DEFAULTS.copyrightHolder);
  const [yearFrom, setYearFrom] = useState(DEFAULTS.yearFrom);
  const [yearTo, setYearTo] = useState(DEFAULTS.yearTo);
  const [developedAt, setDevelopedAt] = useState(DEFAULTS.developedAt);
  const [developedAtUrl, setDevelopedAtUrl] = useState(DEFAULTS.developedAtUrl);
  const [depsText, setDepsText] = useState(DEFAULTS.depsText);
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => parseDependencyLines(depsText), [depsText]);

  const result = useMemo(
    () =>
      buildNoticeFile({
        productName,
        copyrightHolder,
        yearFrom: yearFrom.trim() === "" ? Number.NaN : Number(yearFrom),
        yearTo: yearTo.trim() === "" ? Number.NaN : Number(yearTo),
        developedAt,
        developedAtUrl,
        deps: parsed.deps,
      }),
    [productName, copyrightHolder, yearFrom, yearTo, developedAt, developedAtUrl, parsed.deps],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.notice);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setProductName(DEFAULTS.productName);
    setCopyrightHolder(DEFAULTS.copyrightHolder);
    setYearFrom(DEFAULTS.yearFrom);
    setYearTo(DEFAULTS.yearTo);
    setDevelopedAt(DEFAULTS.developedAt);
    setDevelopedAtUrl(DEFAULTS.developedAtUrl);
    setDepsText(DEFAULTS.depsText);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Copyright years", DASH],
        ["Attribution blocks", DASH],
        ["Total lines", DASH],
      ]
    : [
        ["Copyright years", result.years],
        ["Attribution blocks", String(result.depCount)],
        ["Total lines", String(result.lineCount)],
        ["Entries skipped (no name)", String(parsed.skipped)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ScrollText className="h-4 w-4" aria-hidden="true" />
          Open source licensing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">NOTICE File Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build an Apache-style NOTICE file — product name, copyright line and one attribution
          block per bundled dependency — as required by section 4(d) of the Apache License 2.0.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="nf-product">
              Product name
            </label>
            <input
              id="nf-product"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={productName}
              onChange={(event) => setProductName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nf-holder">
              Copyright holder
            </label>
            <input
              id="nf-holder"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={copyrightHolder}
              onChange={(event) => setCopyrightHolder(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nf-year-from">
              First copyright year
            </label>
            <input
              id="nf-year-from"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1900"
              max="2999"
              value={yearFrom}
              onChange={(event) => setYearFrom(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nf-year-to">
              Last copyright year
            </label>
            <input
              id="nf-year-to"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1900"
              max="2999"
              value={yearTo}
              onChange={(event) => setYearTo(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nf-devat">
              &quot;Developed at&quot; organisation (optional)
            </label>
            <input
              id="nf-devat"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={developedAt}
              onChange={(event) => setDevelopedAt(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nf-devurl">
              Organisation URL (optional)
            </label>
            <input
              id="nf-devurl"
              className={`mt-2 ${INPUT_CLASS}`}
              type="url"
              value={developedAtUrl}
              onChange={(event) => setDevelopedAtUrl(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="nf-deps">
              Dependencies and attributions — one per line
            </label>
            <textarea
              id="nf-deps"
              className={`mt-2 min-h-32 ${TEXTAREA_CLASS}`}
              spellCheck={false}
              value={depsText}
              onChange={(event) => setDepsText(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Format: Name | Copyright holder | URL | required notice text. Only the name is
              mandatory; lines starting with # are ignored.
            </p>
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
              Generated NOTICE file
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.depCount} attribution${result.depCount === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated NOTICE file"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy NOTICE"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
          <pre className="text-sm leading-6 whitespace-pre">
            <code>{hasError ? DASH : result.notice}</code>
          </pre>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational tool, not legal advice. A NOTICE file carries required attribution notices
        only — full license texts belong in your LICENSE file or a third-party licenses page.
        Confirm distribution obligations with a lawyer where it matters.
      </p>
    </main>
  );
}
