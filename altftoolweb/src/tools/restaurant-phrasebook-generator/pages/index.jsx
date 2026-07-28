"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Utensils } from "lucide-react";

import {
  CATEGORIES,
  CATEGORY_IDS,
  DIETARY_PROFILES,
  LANGUAGES,
  LANGUAGE_KEYS,
  OUTPUT_FORMATS,
  PROFILE_KEYS,
  buildPhrasebook,
  formatPhrasebook,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const FORMAT_LABELS = { card: "Printable card", markdown: "Markdown table", csv: "CSV spreadsheet" };

export default function ToolHome() {
  const [language, setLanguage] = useState("japanese");
  const [categories, setCategories] = useState(CATEGORY_IDS);
  const [profile, setProfile] = useState("vegetarian");
  const [format, setFormat] = useState("card");
  const [copied, setCopied] = useState(false);

  const book = useMemo(
    () => buildPhrasebook({ language, categories, dietaryProfile: profile }),
    [language, categories, profile],
  );
  const exported = useMemo(() => formatPhrasebook(book, format), [book, format]);

  const hasError = Boolean(book.error);

  const toggleCategory = (id) =>
    setCategories((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );

  const copyResult = async () => {
    if (exported.error) return;
    try {
      await navigator.clipboard.writeText(exported.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setLanguage("japanese");
    setCategories(CATEGORY_IDS);
    setProfile("vegetarian");
    setFormat("card");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Utensils className="h-4 w-4" aria-hidden="true" />
          Travel language
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Restaurant Phrasebook Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a language, the situations you need and your dietary profile, and get a short
          phrasebook with the native script and a plain romanisation you can read aloud. Print it,
          copy it into notes, or export it as CSV.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="phrase-language">
              Language
            </label>
            <select
              id="phrase-language"
              className={`mt-2 ${INPUT_CLASS}`}
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              {LANGUAGE_KEYS.map((key) => (
                <option key={key} value={key}>
                  {LANGUAGES[key].label} — {LANGUAGES[key].native}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="phrase-profile">
              Dietary profile
            </label>
            <select
              id="phrase-profile"
              className={`mt-2 ${INPUT_CLASS}`}
              value={profile}
              onChange={(event) => setProfile(event.target.value)}
            >
              {PROFILE_KEYS.map((key) => (
                <option key={key} value={key}>
                  {DIETARY_PROFILES[key].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>Situations to include</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {CATEGORIES.map((category) => (
              <label
                key={category.id}
                htmlFor={`cat-${category.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
              >
                <input
                  id={`cat-${category.id}`}
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--primary)]"
                  checked={categories.includes(category.id)}
                  onChange={() => toggleCategory(category.id)}
                />
                {category.label}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {book.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Phrases in your book
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(book.count)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : `${book.language.label} · ${book.language.script} script · ${book.profile.label}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the phrasebook" className={GHOST_BTN} disabled={hasError}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the choices" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Language", hasError ? DASH : `${book.language.label} (${book.language.native})`],
            ["Situations chosen", hasError ? DASH : NUM.format(book.categories.length)],
            [
              "Needs romanisation",
              hasError ? DASH : book.phrases.some((phrase) => phrase.needsRomanisation) ? "Yes" : "No, Latin script",
            ],
            ["Dietary phrases included", hasError ? DASH : NUM.format(book.phrases.filter((p) => p.category === "dietary").length)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your phrases</h2>
          <ul className="mt-3 grid gap-3">
            {book.phrases.map((phrase) => (
              <li key={phrase.id} className="rounded-md border border-[var(--border)] p-3">
                <p className="text-sm text-[var(--muted-foreground)]">{phrase.english}</p>
                <p className="mt-1 text-lg font-semibold">{phrase.script}</p>
                {phrase.needsRomanisation && (
                  <p className="mt-1 text-sm text-[var(--foreground)]">say: {phrase.roman}</p>
                )}
                {phrase.note && <p className="mt-1 text-xs text-[var(--muted-foreground)]">{phrase.note}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Export</h2>
        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="phrase-format">
            Format
          </label>
          <select
            id="phrase-format"
            className={`mt-2 ${INPUT_CLASS}`}
            value={format}
            onChange={(event) => setFormat(event.target.value)}
          >
            {OUTPUT_FORMATS.map((value) => (
              <option key={value} value={value}>
                {FORMAT_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        {exported.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {exported.error}
          </p>
        ) : (
          <div className="mt-4">
            <label className={LABEL_CLASS} htmlFor="phrase-output">
              {FORMAT_LABELS[format]} ({NUM.format(exported.lines)} lines)
            </label>
            <textarea
              id="phrase-output"
              rows={10}
              readOnly
              className={`mt-2 ${AREA_CLASS} font-mono text-xs`}
              value={exported.output}
            />
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Romanisation is written for an English speaker to read aloud, not as a formal
        transliteration. If you have a serious food allergy, do not rely on a phrasebook alone —
        carry a written allergy card in the local language and confirm with staff, since cooking oil,
        stock and sauces often contain the ingredient you asked about.
      </p>
    </main>
  );
}
