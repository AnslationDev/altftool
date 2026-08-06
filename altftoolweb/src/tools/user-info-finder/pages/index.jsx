"use client";

import { useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Database,
  RotateCcw,
  Search,
  UserSearch,
} from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  DEFAULT_PAGE_SIZE,
  MATCH_WEIGHTS,
  SAMPLE_CSV,
  buildFacets,
  parseRecords,
  profileColumns,
  searchRecords,
  toCsv,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-40";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";

const DEFAULT_QUERY = "role:Admin";

export default function ToolHome() {
  const [raw, setRaw] = useState(SAMPLE_CSV);
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState("relevance");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const { copy: copyToClipboard, isCopied, announcement, reset: resetCopyState } = useCopyToClipboard();

  const parsed = useMemo(() => parseRecords(raw), [raw]);

  const profile = useMemo(
    () => (parsed.error ? [] : profileColumns(parsed.columns, parsed.rows)),
    [parsed],
  );

  const facets = useMemo(
    () => (parsed.error ? [] : buildFacets(parsed.columns, parsed.rows)),
    [parsed],
  );

  const found = useMemo(() => {
    if (parsed.error) return { error: parsed.error };
    return searchRecords({
      columns: parsed.columns,
      rows: parsed.rows,
      query,
      filters,
      sortBy,
      sortDir,
      page,
      pageSize,
    });
  }, [parsed, query, filters, sortBy, sortDir, page, pageSize]);

  const loadFile = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRaw(String(reader.result || ""));
      setFilters({});
      setPage(1);
    };
    reader.readAsText(file);
  };

  const toggleFacet = (column, value) => {
    setPage(1);
    setFilters((current) => {
      const list = current[column] || [];
      const next = list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
      const updated = { ...current };
      if (next.length === 0) delete updated[column];
      else updated[column] = next;
      return updated;
    });
  };

  const copyResult = () => {
    if (found.error || !found.results || found.results.length === 0) return;
    copyToClipboard("results", toCsv(parsed.columns, found.results.map((item) => item.row)), {
      label: "Results CSV",
    });
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset every field? This will replace your pasted or uploaded records with the sample data and cannot be undone.",
      )
    ) {
      return;
    }
    setRaw(SAMPLE_CSV);
    setQuery(DEFAULT_QUERY);
    setFilters({});
    setSortBy("relevance");
    setSortDir("asc");
    setPage(1);
    setPageSize(DEFAULT_PAGE_SIZE);
    resetCopyState();
  };

  const activeFilterCount = Object.values(filters).reduce((total, list) => total + list.length, 0);

  const matchedFields = (hits) => new Set(hits.map((hit) => hit.field));

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <UserSearch className="h-4 w-4" aria-hidden="true" />
          Local directory search
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">User Info Finder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Load your own user list — a CSV export from a CRM, an admin panel or a support tool, or a
          JSON array — and search it with field queries, phrases, exclusions and one-click filters.
          It works out what each column holds, ranks matches by a fixed published rule and shows you
          which field matched.
        </p>
      </header>

      <div
        className="mb-6 rounded-xl bg-[var(--info-soft)] p-4 text-sm leading-6 text-[var(--info)] ring-1 ring-[var(--info)]/35"
        role="note"
      >
        <strong className="font-semibold">This does not look people up.</strong> There is no
        people-search database behind this page and it makes no network request. It searches the
        records you paste in, and nothing else — if a detail is not in your file, it will not appear
        here. Your data never leaves the browser.
      </div>

      {/* ---------------------------- data source ------------------------- */}
      <section className={`${CARD} mb-6`} aria-labelledby="source">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="source" className="flex items-center gap-2 text-lg font-semibold">
            <Database className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
            Your records
          </h2>
          <div className="flex flex-wrap gap-2">
            <label
              htmlFor="uif-file"
              className={`${GHOST_BTN} cursor-pointer`}
            >
              Load a file
            </label>
            <input
              id="uif-file"
              type="file"
              accept=".csv,.tsv,.txt,.json,text/csv,application/json"
              className="sr-only"
              onChange={loadFile}
            />
            <button
              type="button"
              className={GHOST_BTN}
              onClick={() => {
                setRaw(SAMPLE_CSV);
                setFilters({});
                setPage(1);
              }}
            >
              Use sample data
            </button>
          </div>
        </div>

        <label className={LABEL_CLASS} htmlFor="uif-data">
          Paste CSV, TSV or a JSON array
        </label>
        <textarea
          id="uif-data"
          className={`mt-2 ${TEXTAREA_CLASS}`}
          rows={8}
          value={raw}
          onChange={(event) => {
            setRaw(event.target.value);
            setFilters({});
            setPage(1);
          }}
          spellCheck={false}
          placeholder={"name,email,city\nAda Lovelace,ada@example.com,London"}
        />

        {parsed.error ? (
          <div
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {parsed.error}
          </div>
        ) : (
          <>
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">
              Read {parsed.rows.length} record{parsed.rows.length === 1 ? "" : "s"} and{" "}
              {parsed.columns.length} field{parsed.columns.length === 1 ? "" : "s"} as {parsed.format}
              .{" "}
              {parsed.truncated
                ? `Only the first ${parsed.rows.length} of ${parsed.totalSeen} rows are loaded.`
                : ""}
            </p>
            {parsed.notes.length > 0 && (
              <ul className="mt-2 space-y-1">
                {parsed.notes.map((note) => (
                  <li
                    key={note}
                    className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-xs leading-5 text-[var(--warning)]"
                  >
                    {note}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      {/* ------------------------------ search ---------------------------- */}
      {!parsed.error && (
        <section className={`${CARD} mb-6`} aria-labelledby="search">
          <h2 id="search" className="mb-4 text-lg font-semibold">
            Search
          </h2>

          <label className={LABEL_CLASS} htmlFor="uif-query">
            Query
          </label>
          <div className="relative mt-2">
            <Search
              className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[var(--muted-foreground)]"
              aria-hidden="true"
            />
            <input
              id="uif-query"
              className={`${INPUT_CLASS} pl-9`}
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder='e.g. city:Berlin plan:Team -role:Viewer "ada lovelace"'
            />
          </div>
          <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
            <code>field:value</code> searches one field. <code>&quot;two words&quot;</code> keeps a
            phrase together. <code>-term</code> removes rows that match. Several terms must all
            match. Fields available: {parsed.columns.join(", ")}.
          </p>

          {facets.length > 0 && (
            <div className="mt-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className={LABEL_CLASS}>Filters</p>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    className="min-h-11 text-sm font-semibold text-[var(--primary)] underline"
                    onClick={() => {
                      setFilters({});
                      setPage(1);
                    }}
                  >
                    Clear {activeFilterCount} filter{activeFilterCount === 1 ? "" : "s"}
                  </button>
                )}
              </div>
              {facets.map((facet) => (
                <div key={facet.column}>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    {facet.column}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {facet.values.map((item) => {
                      const active = (filters[facet.column] || []).includes(item.value);
                      return (
                        <button
                          key={item.value}
                          type="button"
                          aria-pressed={active}
                          onClick={() => toggleFacet(facet.column, item.value)}
                          className={
                            active
                              ? "inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--primary)] px-3 text-xs font-semibold text-[var(--primary-foreground)]"
                              : "inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--foreground)] hover:border-[var(--primary)]"
                          }
                        >
                          {item.value}
                          <span className="opacity-70">{item.count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div>
              <label className={LABEL_CLASS} htmlFor="uif-sort">
                Sort by
              </label>
              <select
                id="uif-sort"
                className={`mt-2 ${INPUT_CLASS}`}
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value);
                  setPage(1);
                }}
              >
                <option value="relevance">Best match</option>
                {parsed.columns.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="uif-dir">
                Direction
              </label>
              <select
                id="uif-dir"
                className={`mt-2 ${INPUT_CLASS}`}
                value={sortDir}
                onChange={(event) => setSortDir(event.target.value)}
                disabled={sortBy === "relevance"}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="uif-size">
                Rows per page
              </label>
              <select
                id="uif-size"
                className={`mt-2 ${INPUT_CLASS}`}
                value={String(pageSize)}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={String(size)}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>
      )}

      {/* ----------------------------- results ---------------------------- */}
      {found.error ? (
        <div
          role="alert"
          className="mb-6 rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm font-medium text-[var(--danger)]"
        >
          {found.error}
        </div>
      ) : (
        <section className={`${CARD} mb-6`} aria-labelledby="results">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 id="results" className="text-lg font-semibold">
              {found.total} of {found.scanned} record{found.scanned === 1 ? "" : "s"}
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={PRIMARY_BTN}
                onClick={copyResult}
                disabled={found.results.length === 0}
              >
                {isCopied("results") ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                {isCopied("results") ? "Copied" : "Copy this page as CSV"}
              </button>
              <button type="button" className={PRIMARY_BTN} onClick={reset}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>
          <span aria-live="polite" role="status" className="sr-only">
            {announcement}
          </span>

          {found.results.length === 0 ? (
            <p className="rounded-md bg-[var(--muted)] px-3 py-6 text-center text-sm text-[var(--muted-foreground)]">
              Nothing in your data matches that query. Try removing a term, or check the field name
              spelling.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      #
                    </th>
                    {parsed.columns.map((column) => (
                      <th key={column} scope="col" className="py-2 pr-3 font-semibold">
                        {column}
                      </th>
                    ))}
                    <th scope="col" className="py-2 font-semibold">
                      Matched
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {found.results.map((item, index) => {
                    const hitFields = matchedFields(item.hits);
                    return (
                      <tr key={item.row.__id} className="border-b border-[var(--border)] align-top">
                        <td className="py-3 pr-3 text-[var(--muted-foreground)]">
                          {(found.page - 1) * found.pageSize + index + 1}
                        </td>
                        {parsed.columns.map((column) => (
                          <td key={column} className="py-3 pr-3">
                            <span
                              className={
                                hitFields.has(column)
                                  ? "rounded bg-[var(--success-soft)] px-1 font-medium text-[var(--success)]"
                                  : ""
                              }
                            >
                              {item.row[column] === "" ? (
                                <span className="text-[var(--muted-foreground)]">—</span>
                              ) : (
                                item.row[column]
                              )}
                            </span>
                          </td>
                        ))}
                        <td className="py-3 text-xs text-[var(--muted-foreground)]">
                          {item.hits.length === 0
                            ? "all rows"
                            : item.hits
                                .map((hit) => `${hit.field} (${hit.kind})`)
                                .join(", ")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {found.pageCount > 1 && (
            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                className={GHOST_BTN}
                disabled={found.page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Previous
              </button>
              <span className="text-sm text-[var(--muted-foreground)]">
                Page {found.page} of {found.pageCount}
              </span>
              <button
                type="button"
                className={GHOST_BTN}
                disabled={found.page >= found.pageCount}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}

          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
            Ranking is a fixed rule, not a model:{" "}
            {MATCH_WEIGHTS.map((item) => `${item.score} when the ${item.label}`).join(", ")}. Scores
            for each term are added together, and equal scores keep the original file order.
          </p>
        </section>
      )}

      {/* ---------------------------- field profile ----------------------- */}
      {!parsed.error && profile.length > 0 && (
        <section className={CARD} aria-labelledby="profile">
          <h2 id="profile" className="mb-4 text-lg font-semibold">
            What is in each field
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Field
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Looks like
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Filled
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Blank
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Distinct
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Does not fit the type
                  </th>
                </tr>
              </thead>
              <tbody>
                {profile.map((item) => (
                  <tr key={item.column} className="border-b border-[var(--border)] align-top">
                    <td className="py-3 pr-3 font-medium">{item.column}</td>
                    <td className="py-3 pr-3 text-[var(--muted-foreground)]">{item.typeLabel}</td>
                    <td className="py-3 pr-3">{item.filled}</td>
                    <td className="py-3 pr-3">{item.empty}</td>
                    <td className="py-3 pr-3">{item.distinct}</td>
                    <td className="py-3">
                      {item.invalidCount === 0 ? (
                        <span className="text-[var(--muted-foreground)]">none</span>
                      ) : (
                        <span className="text-[var(--danger)]">
                          {item.invalidCount}: {item.invalid.slice(0, 3).join(", ")}
                          {item.invalidCount > 3 ? "…" : ""}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
            A field is labelled with a type when at least 80% of its filled values match that shape.
            The last column then lists the values that do not — which is usually where the broken
            email addresses and the phone numbers with a stray letter in them are hiding.
          </p>
        </section>
      )}
    </main>
  );
}
