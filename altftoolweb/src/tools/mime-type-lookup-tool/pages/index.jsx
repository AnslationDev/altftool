"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileType, RotateCcw } from "lucide-react";

import {
  CHARSET_GUIDANCE,
  MIME_TABLE,
  formatEntry,
  lookupByExtension,
  lookupByMime,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = { mode: "extension", query: "json" };
const DASH = "—";

const CHARSET_BADGE = {
  "utf-8-recommended": "Declare charset=utf-8",
  "utf-8-implicit": "UTF-8 fixed by spec",
  binary: "Binary — no charset",
};

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [query, setQuery] = useState(DEFAULTS.query);
  const [copiedMime, setCopiedMime] = useState("");

  const result = useMemo(
    () => (mode === "extension" ? lookupByExtension(query) : lookupByMime(query)),
    [mode, query],
  );

  const hasError = Boolean(result.error);
  const entries = hasError ? [] : result.entries;
  const first = entries[0];

  const copyEntry = async (entry) => {
    const text = formatEntry(entry);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMime(entry.mime);
      setTimeout(() => setCopiedMime(""), 1500);
    } catch {
      setCopiedMime("");
    }
  };

  const reset = () => {
    setMode(DEFAULTS.mode);
    setQuery(DEFAULTS.query);
    setCopiedMime("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileType className="h-4 w-4" aria-hidden="true" />
          HTTP Toolkit
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">MIME Type Lookup Tool</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Find the correct Content-Type for a file extension — or every extension a MIME type
          maps to — with charset guidance from RFC 6838 and a note on whether wire compression
          helps.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mime-mode">
              Look up by
            </label>
            <select
              id="mime-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              <option value="extension">File extension → MIME type</option>
              <option value="mime">MIME type → extensions</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mime-query">
              {mode === "extension" ? "File extension or filename" : "MIME type"}
            </label>
            <input
              id="mime-query"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              spellCheck={false}
              placeholder={mode === "extension" ? "e.g. .png or report.pdf" : "e.g. application/json"}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(mode === "extension"
            ? ["json", "svg", "woff2", "csv", "webp", "mp4"]
            : ["text/html", "application/json", "image/avif", "font/woff2"]
          ).map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => setQuery(sample)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-sm text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {sample}
            </button>
          ))}
          <button
            type="button"
            onClick={reset}
            aria-label="Reset lookup to defaults"
            className={GHOST_BTN}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
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
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          {mode === "extension" ? "MIME type" : "Best match"}
        </p>
        <p className="mt-1 break-all font-mono text-2xl font-semibold text-[var(--primary)] sm:text-3xl">
          {first ? first.mime : DASH}
        </p>
        {!hasError && result.exact === false ? (
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            No exact match — showing {entries.length} partial match{entries.length === 1 ? "" : "es"}.
          </p>
        ) : null}

        <div className="mt-5 space-y-4">
          {entries.map((entry) => (
            <article
              key={entry.mime}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="break-all font-mono text-base font-semibold">{entry.mime}</h2>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">{entry.note}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyEntry(entry)}
                  aria-label={`Copy Content-Type details for ${entry.mime}`}
                  className={GHOST_BTN}
                >
                  {copiedMime === entry.mime ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copiedMime === entry.mime ? "Copied!" : "Copy"}
                </button>
              </div>
              <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
                <div className="flex items-center justify-between gap-4 py-2">
                  <dt className="text-[var(--muted-foreground)]">Extensions</dt>
                  <dd className="text-right font-mono font-semibold">
                    {entry.extensions.length
                      ? entry.extensions.map((e) => `.${e}`).join(", ")
                      : "(none conventional)"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-2">
                  <dt className="text-[var(--muted-foreground)]">Kind</dt>
                  <dd className="text-right font-semibold">{entry.kind}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-2">
                  <dt className="text-[var(--muted-foreground)]">Charset</dt>
                  <dd className="text-right font-semibold">{CHARSET_BADGE[entry.charset]}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-2">
                  <dt className="text-[var(--muted-foreground)]">Wire compression</dt>
                  <dd
                    className={`text-right font-semibold ${entry.compressible ? "text-[var(--success)]" : "text-[var(--muted-foreground)]"}`}
                  >
                    {entry.compressible ? "Helps (gzip/br)" : "Not useful — already compressed"}
                  </dd>
                </div>
              </dl>
              <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                {CHARSET_GUIDANCE[entry.charset]}
              </p>
            </article>
          ))}
          {!first ? (
            <p className="text-sm text-[var(--muted-foreground)]">
              Fix the input above to see a result.
            </p>
          ) : null}
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Reference covers {MIME_TABLE.length} common web MIME types from the IANA Media Types
        registry and de-facto server config. For anything unknown, serve
        application/octet-stream so browsers download instead of guessing.
      </p>
    </main>
  );
}
