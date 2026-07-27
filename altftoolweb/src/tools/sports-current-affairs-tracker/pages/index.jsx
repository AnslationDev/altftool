"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Trash2, Trophy } from "lucide-react";

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

const STORAGE_KEY = "altft-sports-current-affairs-tracker-v1";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const EMPTY_FORM = { tournament: "", sport: "", winner: "", runnerUp: "", venue: "", year: "" };

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
          <Trophy className="h-4 w-4" aria-hidden="true" />
          Current affairs
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Sports Current Affairs Tracker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Keep &quot;tournament — winner — runner-up — venue — year&quot; facts in one revisable
          table. Rows are saved in your browser and export as CSV.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Add a result</h2>
        <form onSubmit={addRow} className="mt-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="sp-tournament">
                Tournament
              </label>
              <input
                id="sp-tournament"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={form.tournament}
                onChange={(event) => setField("tournament", event.target.value)}
                placeholder="e.g. French Open, Asia Cup"
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="sp-sport">
                Sport (optional)
              </label>
              <input
                id="sp-sport"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={form.sport}
                onChange={(event) => setField("sport", event.target.value)}
                placeholder="e.g. Tennis, Cricket, Hockey"
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="sp-winner">
                Winner
              </label>
              <input
                id="sp-winner"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={form.winner}
                onChange={(event) => setField("winner", event.target.value)}
                placeholder="Player, team or country"
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="sp-runnerup">
                Runner-up (optional)
              </label>
              <input
                id="sp-runnerup"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={form.runnerUp}
                onChange={(event) => setField("runnerUp", event.target.value)}
                placeholder="Beaten finalist"
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="sp-venue">
                Venue / host (optional)
              </label>
              <input
                id="sp-venue"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={form.venue}
                onChange={(event) => setField("venue", event.target.value)}
                placeholder="Stadium, city or host country"
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="sp-year">
                Year
              </label>
              <input
                id="sp-year"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                value={form.year}
                onChange={(event) => setField("year", event.target.value)}
                placeholder="2025"
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
            Add result
          </button>
        </form>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="w-full sm:max-w-xs">
            <label className={LABEL_CLASS} htmlFor="sp-search">
              Search the table
            </label>
            <input
              id="sp-search"
              className={`mt-2 ${INPUT_CLASS}`}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tournament, winner, venue…"
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
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                {FIELDS.map((field) => (
                  <th key={field.key} scope="col" className="py-1 pr-3 font-semibold">
                    <button
                      type="button"
                      onClick={() => toggleSort(field.key)}
                      className="min-h-11 rounded-sm font-semibold uppercase tracking-wide hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
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
                    No results match. Add one above or clear the search.
                  </td>
                </tr>
              ) : (
                visible.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 pr-3 font-semibold">{row.tournament}</td>
                    <td className="py-2.5 pr-3">{row.sport || "—"}</td>
                    <td className="py-2.5 pr-3">{row.winner}</td>
                    <td className="py-2.5 pr-3">{row.runnerUp || "—"}</td>
                    <td className="py-2.5 pr-3">{row.venue || "—"}</td>
                    <td className="py-2.5 pr-3">{row.year}</td>
                    <td className="py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => deleteRow(row.id)}
                        aria-label={`Delete ${row.tournament} ${row.year}`}
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
        <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{stats.total} results</p>
        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {stats.byYear.map(([year, count]) => (
            <div key={`y-${year}`} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Year {year}</dt>
              <dd className="text-right font-semibold">
                {count} result{count === 1 ? "" : "s"}
              </dd>
            </div>
          ))}
          {stats.bySport.map(([sport, count]) => (
            <div key={`s-${sport}`} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{sport}</dt>
              <dd className="text-right font-semibold">
                {count} result{count === 1 ? "" : "s"}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Data stays in this browser only (localStorage) — copy the CSV into your notes for a backup.
        Verify results against official tournament sources before the exam; starter rows are
        examples, not a complete list.
      </p>
    </main>
  );
}
