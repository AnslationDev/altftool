"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Image as ImageIcon, RotateCcw, TriangleAlert } from "lucide-react";

import { LICENSES, PLATFORMS, buildAttribution } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const FORMATS = [
  ["plain", "Plain text"],
  ["html", "HTML"],
  ["markdown", "Markdown"],
];

const DEFAULTS = {
  platform: "unsplash",
  license: "stock-standard",
  title: "",
  titleUrl: "",
  author: "Jane Doe",
  authorUrl: "https://unsplash.com/@janedoe",
  sourceName: "",
  sourceUrl: "",
  year: "",
  modified: false,
  modificationNote: "",
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [format, setFormat] = useState("plain");
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  // Title/source/year are TASL-only fields (hidden for "pattern" platforms
  // like Unsplash). Without clearing them on switch, a stale override typed
  // for one platform silently carries into another platform's credit line —
  // e.g. a custom Source name/link stays applied after switching away from
  // the platform it was typed for, even though the field is no longer shown.
  const setPlatform = (event) => {
    const value = event.target.value;
    setForm((prev) => ({
      ...prev,
      platform: value,
      title: "",
      titleUrl: "",
      sourceName: "",
      sourceUrl: "",
      year: "",
    }));
    setCopied(false);
  };

  const result = useMemo(() => buildAttribution(form), [form]);
  const output = result.error ? "" : result[format === "markdown" ? "markdown" : format];

  const copyResult = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setFormat("plain");
    setCopied(false);
  };

  const platform = PLATFORMS[form.platform];
  const showTasl = platform && platform.style === "cc";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ImageIcon className="h-4 w-4" aria-hidden="true" />
          Image credits
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Stock Photo Attribution Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a credit line that matches the licence you actually hold — the Creative Commons
          TASL sentence, or the short house format each stock library publishes — in plain text,
          HTML or Markdown.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="attr-platform">
              Where did the image come from?
            </label>
            <select
              id="attr-platform"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.platform}
              onChange={setPlatform}
            >
              {Object.entries(PLATFORMS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="attr-license">
              Licence on the image
            </label>
            <select
              id="attr-license"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.license}
              onChange={set("license")}
            >
              {Object.entries(LICENSES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.code}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="attr-author">
              Photographer / creator
            </label>
            <input
              id="attr-author"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.author}
              onChange={set("author")}
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="attr-author-url">
              Creator profile link
            </label>
            <input
              id="attr-author-url"
              className={`mt-2 ${INPUT_CLASS}`}
              type="url"
              inputMode="url"
              value={form.authorUrl}
              onChange={set("authorUrl")}
              placeholder="https://…"
            />
          </div>

          {showTasl && (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="attr-title">
                  Image title
                </label>
                <input
                  id="attr-title"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  value={form.title}
                  onChange={set("title")}
                  placeholder="Mountain Sunrise"
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="attr-title-url">
                  Link to the image page
                </label>
                <input
                  id="attr-title-url"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="url"
                  inputMode="url"
                  value={form.titleUrl}
                  onChange={set("titleUrl")}
                  placeholder="https://…"
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="attr-source">
                  Source name (optional override)
                </label>
                <input
                  id="attr-source"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  value={form.sourceName}
                  onChange={set("sourceName")}
                  placeholder={platform.sourceName || "Wikimedia Commons"}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="attr-source-url">
                  Source link
                </label>
                <input
                  id="attr-source-url"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="url"
                  inputMode="url"
                  value={form.sourceUrl}
                  onChange={set("sourceUrl")}
                  placeholder="https://…"
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="attr-year">
                  Year (optional)
                </label>
                <input
                  id="attr-year"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  inputMode="numeric"
                  value={form.year}
                  onChange={set("year")}
                  placeholder="2024"
                />
              </div>
            </>
          )}

          <div>
            <label className={LABEL_CLASS} htmlFor="attr-mod-note">
              What did you change? (optional)
            </label>
            <input
              id="attr-mod-note"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.modificationNote}
              onChange={set("modificationNote")}
              placeholder="cropped and converted to greyscale"
            />
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium text-[var(--foreground)]"
          htmlFor="attr-modified"
        >
          <input
            id="attr-modified"
            type="checkbox"
            className="h-5 w-5 rounded border border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={form.modified}
            onChange={set("modified")}
          />
          I modified this image (crop, colour, composite)
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
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Credit line
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--muted-foreground)]">{DASH}</p>
            <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
              {["Attribution status", "Licence"].map((label) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold text-[var(--muted-foreground)]">{DASH}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      ) : (
        <section
          className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          aria-live="polite"
          role="status"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Credit line
              </p>
              <p className="mt-1 break-words text-xl font-semibold leading-8 text-[var(--primary)] sm:text-2xl">
                {result.plain}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyResult}
                aria-label="Copy the generated credit line"
                className={GHOST_BTN}
              >
                {copied ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                {copied ? "Copied!" : "Copy result"}
              </button>
              <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Output format">
              {FORMATS.map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setFormat(key);
                    setCopied(false);
                  }}
                  aria-pressed={format === key}
                  className={
                    format === key
                      ? "min-h-11 rounded-md bg-[var(--primary)] px-3 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                      : "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  }
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="sr-only" htmlFor="attr-output">
              Generated credit line
            </label>
            <textarea
              id="attr-output"
              readOnly
              rows={4}
              value={output}
              className="mt-3 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            />
          </div>

          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            {[
              ["Attribution status", result.requirement],
              ["Licence", result.licenseName],
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>

          {result.ignoredUrls.length > 0 && (
            <ul className="mt-4 space-y-2">
              {result.ignoredUrls.map((note) => (
                <li
                  key={note}
                  className="flex items-start gap-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
                >
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          )}

          {result.notes.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {result.notes.map((note) => (
                <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2">
                  {note}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. The licence page attached to the individual image
        always overrides a generated credit line — check it before you publish, and consult a
        lawyer for anything contested.
      </p>
    </main>
  );
}
