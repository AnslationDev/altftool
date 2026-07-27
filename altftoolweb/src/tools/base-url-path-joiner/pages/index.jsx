"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Trash2, Waypoints } from "lucide-react";

import { QUERY_MERGE_MODES, joinUrl } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULT_BASE = "https://api.example.com/v1";
const DEFAULT_SEGMENTS = [
  { id: 1, value: "users" },
  { id: 2, value: "42/orders?limit=20" },
];

const PRESETS = [
  { label: "Absolute segment", base: "https://api.example.com/v1/", segments: ["/v2/users"] },
  { label: "No trailing slash", base: "https://api.example.com/v1", segments: ["users"] },
  { label: "Dot segments", base: "https://cdn.example.com/a/b/c/", segments: ["../../assets/logo.svg"] },
  { label: "Query on the base", base: "https://x.example.com/search?lang=en", segments: ["results?page=2"] },
];

export default function ToolHome() {
  const [base, setBase] = useState(DEFAULT_BASE);
  const [segments, setSegments] = useState(DEFAULT_SEGMENTS);
  const [nextId, setNextId] = useState(3);
  const [keepTrailingSlash, setKeepTrailingSlash] = useState(false);
  const [encodeSegments, setEncodeSegments] = useState(false);
  const [queryMode, setQueryMode] = useState("override");
  const [copied, setCopied] = useState("");

  const result = useMemo(
    () =>
      joinUrl({
        base,
        segments: segments.map((entry) => entry.value),
        keepTrailingSlash,
        encodeSegments,
        queryMode,
      }),
    [base, segments, keepTrailingSlash, encodeSegments, queryMode],
  );

  const addSegment = () => {
    setSegments((current) => [...current, { id: nextId, value: "" }]);
    setNextId((current) => current + 1);
  };

  const updateSegment = (id, value) => {
    setSegments((current) => current.map((entry) => (entry.id === id ? { ...entry, value } : entry)));
  };

  const removeSegment = (id) => {
    setSegments((current) => (current.length <= 1 ? current : current.filter((entry) => entry.id !== id)));
  };

  const applyPreset = (preset) => {
    setBase(preset.base);
    setSegments(preset.segments.map((value, index) => ({ id: index + 1, value })));
    setNextId(preset.segments.length + 1);
    setCopied("");
  };

  const copy = async (value, key) => {
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
    setBase(DEFAULT_BASE);
    setSegments(DEFAULT_SEGMENTS);
    setNextId(3);
    setKeepTrailingSlash(false);
    setEncodeSegments(false);
    setQueryMode("override");
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Waypoints className="h-4 w-4" aria-hidden="true" />
          RFC 3986 §5
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Base URL Path Joiner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Stick a base URL and some path segments together without losing your /v1 prefix. See the
          safe concatenation and the answer your HTTP client would actually compute, side by side.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="join-base">
            Base URL
          </label>
          <input
            id="join-base"
            className={`mt-2 ${INPUT_CLASS} font-mono text-sm`}
            type="text"
            inputMode="url"
            spellCheck={false}
            value={base}
            onChange={(event) => setBase(event.target.value)}
          />
        </div>

        <fieldset className="mt-4">
          <legend className={LABEL_CLASS}>Path segments</legend>
          <div className="mt-2 space-y-2">
            {segments.map((entry, index) => (
              <div key={entry.id} className="flex gap-2">
                <label className="sr-only" htmlFor={`join-seg-${entry.id}`}>
                  Path segment {index + 1}
                </label>
                <input
                  id={`join-seg-${entry.id}`}
                  className={`${INPUT_CLASS} font-mono text-sm`}
                  type="text"
                  spellCheck={false}
                  placeholder="users"
                  value={entry.value}
                  onChange={(event) => updateSegment(entry.id, event.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeSegment(entry.id)}
                  aria-label={`Remove path segment ${index + 1}`}
                  disabled={segments.length <= 1}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] disabled:opacity-40 active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addSegment} className={`mt-2 ${GHOST_BTN}`}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add segment
          </button>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="join-query-mode">
              Duplicate query keys
            </label>
            <select
              id="join-query-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={queryMode}
              onChange={(event) => setQueryMode(event.target.value)}
            >
              {QUERY_MERGE_MODES.map((mode) => (
                <option key={mode.id} value={mode.id}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold"
            htmlFor="join-trailing"
          >
            <input
              id="join-trailing"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={keepTrailingSlash}
              onChange={(event) => setKeepTrailingSlash(event.target.checked)}
            />
            Force a trailing slash
          </label>
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold"
            htmlFor="join-encode"
          >
            <input
              id="join-encode"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={encodeSegments}
              onChange={(event) => setEncodeSegments(event.target.checked)}
            />
            Percent-encode each segment
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
        </div>
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
              Joined URL
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--muted-foreground)]">{DASH}</p>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {["Origin", "Path", "Query", "What fetch would resolve"].map((label) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold text-[var(--muted-foreground)]">{DASH}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      ) : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Joined URL
              </p>
              <p className="mt-1 break-all font-mono text-xl font-semibold text-[var(--primary)] sm:text-2xl">
                {result.joined}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => copy(result.joined, "joined")}
                aria-label="Copy the joined URL"
                className={GHOST_BTN}
              >
                {copied === "joined" ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                {copied === "joined" ? "Copied!" : "Copy result"}
              </button>
              <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>

          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            {[
              ["Origin", result.origin],
              ["Path", result.joinedPath],
              ["Query", result.query ? `?${result.query}` : "(none)"],
              ["Fragment", result.fragment ? `#${result.fragment}` : "(none)"],
              ["Relative reference built", result.reference || "(none)"],
              ["What new URL() / fetch resolves", result.resolved ?? result.resolutionError],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
                <dd className="min-w-0 break-all text-right font-mono font-semibold">{value}</dd>
              </div>
            ))}
          </dl>

          {result.differs ? (
            <div className="mt-5 rounded-md bg-[var(--danger-soft)] px-3 py-3 text-sm text-[var(--danger)]">
              <p className="font-semibold">
                Concatenation and reference resolution disagree.
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 leading-6">
                {result.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-5 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--success)]">
              Both methods agree — this URL is safe to build either way.
            </p>
          )}

          {result.warnings.length > 0 && (
            <ul className="mt-4 space-y-1 text-xs leading-5 text-[var(--danger)]">
              {result.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          )}
          {result.notes.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs leading-5 text-[var(--muted-foreground)]">
              {result.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The three rules that bite</h2>
        <dl className="mt-3 space-y-3 text-sm leading-6">
          {[
            [
              "A leading slash wipes the base path",
              "new URL(\"/v2/users\", \"https://api.example.com/v1/\") is https://api.example.com/v2/users. If your client concatenates a config value that starts with a slash, the API version prefix silently vanishes.",
            ],
            [
              "A missing trailing slash eats a segment",
              "Against a base of .../v1, the reference \"users\" resolves to .../users, because merging drops everything after the last slash of the base. Add the trailing slash to your base and the problem goes away.",
            ],
            [
              "The base query string is discarded",
              "Reference resolution keeps the base query only when the reference is completely empty. Any relative path at all, and the base query is gone.",
            ],
          ].map(([term, detail]) => (
            <div key={term}>
              <dt className="font-semibold">{term}</dt>
              <dd className="mt-1 text-[var(--muted-foreground)]">{detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Dot segments are removed with the algorithm in RFC 3986 section 5.2.4. Resolution is computed
        with the WHATWG URL parser, the same one behind fetch and the browser address bar.
      </p>
    </main>
  );
}
