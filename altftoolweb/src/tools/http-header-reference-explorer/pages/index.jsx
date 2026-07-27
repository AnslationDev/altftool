"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileSearch, RotateCcw } from "lucide-react";

import { CATEGORIES, DIRECTIONS, formatHeader, searchHeaders } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-US");

const DEFAULTS = { query: "", direction: "all", category: "All" };

const DIRECTION_LABELS = {
  all: "All directions",
  request: "Request only",
  response: "Response only",
  both: "Request & response",
};

export default function ToolHome() {
  const [query, setQuery] = useState(DEFAULTS.query);
  const [direction, setDirection] = useState(DEFAULTS.direction);
  const [category, setCategory] = useState(DEFAULTS.category);
  const [copiedName, setCopiedName] = useState("");

  const { results, total } = useMemo(
    () => searchHeaders({ query, direction, category }),
    [query, direction, category],
  );

  const copyHeader = async (header) => {
    try {
      await navigator.clipboard.writeText(formatHeader(header));
      setCopiedName(header.name);
      setTimeout(() => setCopiedName(""), 1500);
    } catch {
      setCopiedName("");
    }
  };

  const reset = () => {
    setQuery(DEFAULTS.query);
    setDirection(DEFAULTS.direction);
    setCategory(DEFAULTS.category);
    setCopiedName("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileSearch className="h-4 w-4" aria-hidden="true" />
          HTTP Toolkit
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          HTTP Header Reference Explorer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Search request and response headers by name, meaning or example value. Directions and
          semantics follow RFC 9110, RFC 9111, RFC 6265 and the Fetch Standard.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="hh-query">
              Search headers
            </label>
            <input
              id="hh-query"
              className={`mt-2 ${INPUT_CLASS}`}
              type="search"
              placeholder="e.g. cache, cors, etag, cookie"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hh-direction">
              Direction
            </label>
            <select
              id="hh-direction"
              className={`mt-2 ${INPUT_CLASS}`}
              value={direction}
              onChange={(event) => setDirection(event.target.value)}
            >
              {DIRECTIONS.map((d) => (
                <option key={d} value={d}>
                  {DIRECTION_LABELS[d]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hh-category">
              Category
            </label>
            <select
              id="hh-category"
              className={`mt-2 ${INPUT_CLASS}`}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={reset}
            aria-label="Reset search and filters"
            className={PRIMARY_BTN}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Matching headers
        </p>
        <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
          {NUM.format(results.length)}
        </p>
        <dl className="mt-2 text-sm text-[var(--muted-foreground)]">
          <div className="flex items-center justify-between gap-4 py-1">
            <dt>Headers in reference</dt>
            <dd className="font-semibold text-[var(--foreground)]">{NUM.format(total)}</dd>
          </div>
        </dl>
      </section>

      {results.length === 0 ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          No headers match that search. Try a shorter term or clear the filters.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {results.map((header) => (
            <li
              key={header.name}
              className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-mono text-lg font-semibold text-[var(--primary)]">
                    {header.name}
                  </h2>
                  <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    {header.direction === "both"
                      ? "Request & response"
                      : `${header.direction} header`}{" "}
                    · {header.category} · {header.spec}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyHeader(header)}
                  aria-label={`Copy details for ${header.name}`}
                  className={GHOST_BTN}
                >
                  {copiedName === header.name ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copiedName === header.name ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="mt-3 text-sm leading-6">{header.description}</p>
              <div className="mt-3 overflow-x-auto rounded-md bg-[var(--muted)] px-3 py-2">
                <code className="whitespace-pre text-xs">{header.example}</code>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Reference covers the most used standard headers; consult the cited RFC for edge-case
        syntax and full ABNF.
      </p>
    </main>
  );
}
