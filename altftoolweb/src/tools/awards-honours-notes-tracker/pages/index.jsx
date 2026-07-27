"use client";

import { useEffect, useMemo, useState } from "react";
import { Award, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  FIELDS,
  SEED_ENTRIES,
  filterEntries,
  normalizeEntry,
  removeEntry,
  sortEntries,
  summarize,
  toCsv,
  upsertEntry,
} from "../lib";

const STORAGE_KEY = "altft-awards-honours-notes-tracker-v1";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const EMPTY_FORM = { award: "", recipient: "", field: "", year: "", notes: "" };

export default function ToolHome() {
  const [entries, setEntries] = useState(SEED_ENTRIES);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("year");
  const [sortDir, setSortDir] = useState("desc");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setEntries(parsed);
      }
    } catch {
      // ignore corrupted storage
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // storage full/blocked — table still works in memory
    }
  }, [entries, loaded]);

  const visible = useMemo(
    () => sortEntries(filterEntries(entries, query), sortKey, sortDir),
    [entries, query, sortKey, sortDir],
  );
  const stats = useMemo(() => summarize(entries), [entries]);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const addRow = (event) => {
    event.preventDefault();
    const checked = normalizeEntry(form);
    if (checked.error) {
      setFormError(checked.error);
      return;
    }
    setFormError("");
    setEntries((current) => upsertEntry(current, checked.value));
    setForm(EMPTY_FORM);
  };

  const deleteRow = (id) => setEntries((current) => removeEntry(current, id));

  const toggleSort = (key) => {
    if (key === sortKey) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "year" ? "desc" : "asc");
    }
  };

  const copyCsv = async () => {
    try {
      await navigator.clipboard.writeText(toCsv(visible));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setEntries(SEED_ENTRIES);
    setForm(EMPTY_FORM);
    setFormError("");
    setQuery("");
    setSortKey("year");
    setSortDir("desc");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Award className="h-4 w-4" aria-hidden="true" />
          Current affairs
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Awards And Honours Tracker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Keep every &quot;award — recipient — field — year&quot; fact in one revisable table. Rows
          are saved in your browser and export as CSV for your notes.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Add an entry</h2>
        <form onSubmit={addRow} className="mt-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="aw-award">
                Award
              </label>
              <input
                id="aw-award"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={form.award}
                onChange={(event) => setField("award", event.target.value)}
                placeholder="e.g. Nobel Peace Prize"
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="aw-recipient">
                Recipient
              </label>
              <input
                id="aw-recipient"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={form.recipient}
                onChange={(event) => setField("recipient", event.target.value)}
                placeholder="Person or organisation"
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="aw-field">
                Field / category (optional)
              </label>
              <input
                id="aw-field"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={form.field}
                onChange={(event) => setField("field", event.target.value)}
                placeholder="e.g. Literature, Sports, Cinema"
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="aw-year">
                Year
              </label>
              <input
                id="aw-year"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                value={form.year}
                onChange={(event) => setField("year", event.target.value)}
                placeholder="2025"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="aw-notes">
                Notes (optional)
              </label>
              <input
                id="aw-notes"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={form.notes}
                onChange={(event) => setField("notes", event.target.value)}
                placeholder="One-line memory hook"
              />
            </div>
          </div>
          {formError ? (
            <p
              role="alert"
              className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              {formError}
            </p>
          ) : null}
          <button type="submit" className={`mt-4 ${PRIMARY_BTN}`}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add entry
          </button>
        </form>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="w-full sm:max-w-xs">
            <label className={LABEL_CLASS} htmlFor="aw-search">
              Search the table
            </label>
            <input
              id="aw-search"
              className={`mt-2 ${INPUT_CLASS}`}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Award, recipient, year…"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyCsv}
              aria-label="Copy the visible rows as CSV"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy CSV"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the table to the starter rows"
              className={GHOST_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                {FIELDS.map((field) => (
                  <th key={field.key} scope="col" className="py-1 pr-3 font-semibold">
                    <button
                      type="button"
                      onClick={() => toggleSort(field.key)}
                      className="min-h-11 font-semibold uppercase tracking-wide hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 rounded-sm"
                      aria-label={`Sort by ${field.label}`}
                    >
                      {field.label}
                      {sortKey === field.key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                    </button>
                  </th>
                ))}
                <th scope="col" className="py-1 text-right font-semibold">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td
                    colSpan={FIELDS.length + 1}
                    className="py-6 text-center text-[var(--muted-foreground)]"
                  >
                    No entries match. Add one above or clear the search.
                  </td>
                </tr>
              ) : (
                visible.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 pr-3 font-semibold">{row.award}</td>
                    <td className="py-2.5 pr-3">{row.recipient}</td>
                    <td className="py-2.5 pr-3">{row.field || "—"}</td>
                    <td className="py-2.5 pr-3">{row.year}</td>
                    <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">{row.notes || "—"}</td>
                    <td className="py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => deleteRow(row.id)}
                        aria-label={`Delete ${row.award} ${row.year}`}
                        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-[var(--muted-foreground)] transition hover:text-[var(--danger)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Revision summary
        </p>
        <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{stats.total} entries</p>
        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {stats.byYear.map(([year, count]) => (
            <div key={`y-${year}`} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Year {year}</dt>
              <dd className="text-right font-semibold">
                {count} entr{count === 1 ? "y" : "ies"}
              </dd>
            </div>
          ))}
          {stats.byField.map(([field, count]) => (
            <div key={`f-${field}`} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{field}</dt>
              <dd className="text-right font-semibold">
                {count} entr{count === 1 ? "y" : "ies"}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Data stays in this browser only (localStorage) — copy the CSV into your notes for a backup.
        Always verify award facts against the official announcement before the exam; starter rows
        are examples, not a complete list.
      </p>
    </main>
  );
}
