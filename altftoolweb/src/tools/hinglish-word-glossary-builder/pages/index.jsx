"use client";

import { useMemo, useState } from "react";
import { BookMarked, Check, Copy, Plus, RotateCcw, Search, Trash2 } from "lucide-react";

import {
  EXPORT_FORMATS,
  ORIGINS,
  REGISTERS,
  SEED_GLOSSARY,
  SORT_MODES,
  addEntry,
  formatGlossary,
  glossaryStats,
  removeEntry,
  searchGlossary,
  sortGlossary,
  termSlug,
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

const FORMAT_LABELS = {
  markdown: "Markdown table",
  csv: "CSV spreadsheet",
  json: "JSON",
  text: "Plain text",
};

const SORT_LABELS = {
  alphabetical: "A to Z",
  origin: "Grouped by origin",
  added: "Order added",
};

const seeded = () => SEED_GLOSSARY.map((entry) => ({ ...entry, slug: termSlug(entry.term) }));

const EMPTY_DRAFT = {
  term: "",
  meaning: "",
  example: "",
  origin: "Hindi",
  register: "Casual",
};

export default function ToolHome() {
  const [entries, setEntries] = useState(seeded);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [addError, setAddError] = useState("");
  const [query, setQuery] = useState("");
  const [originFilter, setOriginFilter] = useState("All");
  const [sortMode, setSortMode] = useState("alphabetical");
  const [format, setFormat] = useState("markdown");
  const [title, setTitle] = useState("Hinglish Glossary");
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => glossaryStats(entries), [entries]);
  const visible = useMemo(
    () => sortGlossary(searchGlossary(entries, query, { origin: originFilter }), sortMode),
    [entries, query, originFilter, sortMode],
  );
  const exported = useMemo(() => formatGlossary(entries, format, title), [entries, format, title]);

  const setField = (key) => (event) => setDraft((current) => ({ ...current, [key]: event.target.value }));

  const submit = (event) => {
    event.preventDefault();
    const result = addEntry(entries, draft);
    if (result.error) {
      setAddError(result.error);
      return;
    }
    setEntries(result.entries);
    setDraft(EMPTY_DRAFT);
    setAddError("");
  };

  const copyExport = async () => {
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
    setEntries(seeded());
    setDraft(EMPTY_DRAFT);
    setAddError("");
    setQuery("");
    setOriginFilter("All");
    setSortMode("alphabetical");
    setFormat("markdown");
    setTitle("Hinglish Glossary");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BookMarked className="h-4 w-4" aria-hidden="true" />
          Word reference
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Hinglish Glossary Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Start from 28 common Hinglish and Indian English terms, add your own team, campus or family
          words with meanings and examples, then export the whole thing as a Markdown table, CSV,
          JSON or plain text.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Terms in glossary
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{NUM.format(stats.total)}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {stats.total === 0
                ? "Add your first term below"
                : `${NUM.format(stats.withExample)} have an example sentence (${stats.examplePercent}%)`}
            </p>
          </div>
          <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset the glossary to the starter list">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Distinct origins", stats.total === 0 ? DASH : NUM.format(stats.byOrigin.length)],
            [
              "Most common origin",
              stats.total === 0 ? DASH : `${stats.byOrigin[0].label} (${stats.byOrigin[0].count})`,
            ],
            [
              "Safe for workplace writing",
              stats.total === 0
                ? DASH
                : NUM.format(
                    stats.byRegister
                      .filter((row) => row.label === "Workplace" || row.label === "Neutral")
                      .reduce((sum, row) => sum + row.count, 0),
                  ),
            ],
            ["Average meaning length", stats.total === 0 ? DASH : `${NUM.format(stats.averageMeaningLength)} characters`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <form onSubmit={submit} className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Add a term</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="entry-term">
              Term or phrase
            </label>
            <input
              id="entry-term"
              className={`mt-2 ${INPUT_CLASS}`}
              value={draft.term}
              onChange={setField("term")}
              placeholder="e.g. scene on hai"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="entry-origin">
              Origin
            </label>
            <select id="entry-origin" className={`mt-2 ${INPUT_CLASS}`} value={draft.origin} onChange={setField("origin")}>
              {ORIGINS.map((origin) => (
                <option key={origin} value={origin}>
                  {origin}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="entry-meaning">
              Meaning
            </label>
            <textarea
              id="entry-meaning"
              rows={2}
              className={`mt-2 ${AREA_CLASS}`}
              value={draft.meaning}
              onChange={setField("meaning")}
              placeholder="Explain the sense it carries in Indian usage."
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="entry-example">
              Example sentence (optional)
            </label>
            <textarea
              id="entry-example"
              rows={2}
              className={`mt-2 ${AREA_CLASS}`}
              value={draft.example}
              onChange={setField("example")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="entry-register">
              Register
            </label>
            <select
              id="entry-register"
              className={`mt-2 ${INPUT_CLASS}`}
              value={draft.register}
              onChange={setField("register")}
            >
              {REGISTERS.map((register) => (
                <option key={register} value={register}>
                  {register}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" className={`${PRIMARY_BTN} w-full`}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add to glossary
            </button>
          </div>
        </div>

        {addError && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {addError}
          </p>
        )}
      </form>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Browse</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="glossary-search">
              Search terms, meanings and examples
            </label>
            <div className="relative mt-2">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
                aria-hidden="true"
              />
              <input
                id="glossary-search"
                className={`${INPUT_CLASS} pl-9`}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="jugaad, money, warehouse"
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="glossary-origin">
              Filter by origin
            </label>
            <select
              id="glossary-origin"
              className={`mt-2 ${INPUT_CLASS}`}
              value={originFilter}
              onChange={(event) => setOriginFilter(event.target.value)}
            >
              <option value="All">All origins</option>
              {ORIGINS.map((origin) => (
                <option key={origin} value={origin}>
                  {origin}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="glossary-sort">
              Sort
            </label>
            <select
              id="glossary-sort"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value)}
            >
              {SORT_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {SORT_LABELS[mode]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          Showing {NUM.format(visible.length)} of {NUM.format(stats.total)} terms
        </p>

        <ul className="mt-3 grid gap-3">
          {visible.map((entry) => (
            <li key={entry.slug} className="rounded-md border border-[var(--border)] p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold">{entry.term}</p>
                  <p className="mt-1 text-sm text-[var(--foreground)]">{entry.meaning}</p>
                  {entry.example && (
                    <p className="mt-1 text-sm italic text-[var(--muted-foreground)]">{entry.example}</p>
                  )}
                  <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                    {entry.origin} · {entry.register}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEntries((current) => removeEntry(current, entry.term))}
                  aria-label={`Remove ${entry.term} from the glossary`}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>

        {visible.length === 0 && (
          <p className="mt-3 rounded-md border border-[var(--border)] px-3 py-4 text-sm text-[var(--muted-foreground)]">
            No terms match that search. Clear the search box or change the origin filter.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Export</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="export-title">
              Glossary title
            </label>
            <input
              id="export-title"
              className={`mt-2 ${INPUT_CLASS}`}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="export-format">
              Format
            </label>
            <select
              id="export-format"
              className={`mt-2 ${INPUT_CLASS}`}
              value={format}
              onChange={(event) => setFormat(event.target.value)}
            >
              {EXPORT_FORMATS.map((value) => (
                <option key={value} value={value}>
                  {FORMAT_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {exported.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {exported.error}
          </p>
        ) : (
          <>
            <div className="mt-4">
              <label className={LABEL_CLASS} htmlFor="export-output">
                {FORMAT_LABELS[format]} output ({NUM.format(exported.lines)} lines)
              </label>
              <textarea
                id="export-output"
                rows={8}
                readOnly
                className={`mt-2 ${AREA_CLASS} font-mono text-xs`}
                value={exported.output}
              />
            </div>
            <button type="button" onClick={copyExport} aria-label="Copy the exported glossary" className={`mt-4 ${PRIMARY_BTN}`}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Nothing is uploaded — the glossary lives in this browser tab only, so copy the export before
        you close it. Register labels are editorial guidance, not a rule: check your organisation's
        style guide before using Hinglish in customer-facing or legal documents.
      </p>
    </main>
  );
}
