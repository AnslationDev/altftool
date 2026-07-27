"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Copyright, RotateCcw } from "lucide-react";

import { MEDIA_TYPES, RIGHTS_PHRASES, SYMBOL_STYLES, buildCopyrightNotice } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  // Read once on mount: the clock is an input to the pure lib, never used inside it.
  const [currentYear] = useState(() => String(new Date().getFullYear()));
  const defaults = useMemo(
    () => ({
      owner: "Northwind Studio",
      startYear: String(Number(currentYear) - 5),
      mediaType: "website",
      symbolStyle: "symbol",
      rightsPhrase: "all",
      useRange: true,
    }),
    [currentYear],
  );

  const [form, setForm] = useState(defaults);
  const [copied, setCopied] = useState("");

  const set = (key) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied("");
  };

  const result = useMemo(() => buildCopyrightNotice({ ...form, currentYear }), [form, currentYear]);

  const copyValue = async (key, value) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setForm(defaults);
    setCopied("");
  };

  const snippets = result.error
    ? []
    : [
        ["plain", "Plain text", result.plain],
        ["html", "HTML", result.html],
        ["meta", "HTML meta tag", result.metaTag],
        ["source", "Source-code header", result.sourceComment],
        ...(result.phonogramLine ? [["phonogram", "Sound-recording line", result.phonogramLine]] : []),
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Copyright className="h-4 w-4" aria-hidden="true" />
          Rights notice
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Copyright Notice Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a notice with the three elements the law actually names — symbol, year of first
          publication and owner — then copy it as plain text, HTML, a meta tag or a source-file
          header.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cn-owner">
              Copyright owner
            </label>
            <input
              id="cn-owner"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.owner}
              onChange={set("owner")}
              placeholder="Northwind Studio Ltd"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cn-start">
              Year of first publication
            </label>
            <input
              id="cn-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1000"
              max={currentYear}
              step="1"
              value={form.startYear}
              onChange={set("startYear")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cn-media">
              What is it going on?
            </label>
            <select id="cn-media" className={`mt-2 ${INPUT_CLASS}`} value={form.mediaType} onChange={set("mediaType")}>
              {Object.entries(MEDIA_TYPES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cn-symbol">
              Symbol style
            </label>
            <select
              id="cn-symbol"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.symbolStyle}
              onChange={set("symbolStyle")}
            >
              {Object.entries(SYMBOL_STYLES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cn-phrase">
              Rights phrase
            </label>
            <select
              id="cn-phrase"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.rightsPhrase}
              onChange={set("rightsPhrase")}
            >
              {Object.entries(RIGHTS_PHRASES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium" htmlFor="cn-range">
          <input
            id="cn-range"
            type="checkbox"
            className="h-5 w-5 shrink-0 rounded border border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={Boolean(form.useRange)}
            onChange={set("useRange")}
          />
          Show a year range up to {currentYear} (for work that is still being updated)
        </label>
      </section>

      {result.error ? (
        <>
          <p
            role="alert"
            className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
          <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Notice</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--muted-foreground)]">{DASH}</p>
            <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
              {["Year shown", "Owner", "Where it goes"].map((label) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold text-[var(--muted-foreground)]">{DASH}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Notice</p>
                <p className="mt-1 break-words text-xl font-semibold leading-8 text-[var(--primary)] sm:text-2xl">
                  {result.plain}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copyValue("main", result.plain)}
                  aria-label="Copy the copyright notice"
                  className={GHOST_BTN}
                >
                  {copied === "main" ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copied === "main" ? "Copied!" : "Copy result"}
                </button>
                <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                [
                  "Year shown",
                  result.showRange ? `${result.yearText} (range)` : `${result.yearText} (first publication)`,
                ],
                ["Owner", result.owner],
                ["Where it goes", result.placement],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Copy for each place it goes</h2>
            <ul className="mt-3 space-y-3">
              {snippets.map(([key, label, value]) => (
                <li key={key} className="rounded-md bg-[var(--muted)] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                      {label}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyValue(key, value)}
                      aria-label={`Copy the ${label} version`}
                      className="inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    >
                      {copied === key ? (
                        <Check className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Copy className="h-4 w-4" aria-hidden="true" />
                      )}
                      {copied === key ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <div className="mt-1 overflow-x-auto">
                    <code className="block whitespace-pre font-mono text-xs leading-6 text-[var(--foreground)]">
                      {value}
                    </code>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">What the notice does and does not do</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {result.notes.map((note) => (
                <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2">
                  {note}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Ownership of a work made by employees, contractors
        or collaborators depends on your contracts — check who actually owns the copyright before
        you put a name in the notice.
      </p>
    </main>
  );
}
