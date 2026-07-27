"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Link2, RotateCcw } from "lucide-react";

import {
  DEFAULT_MAX_LENGTH,
  MAX_MAX_LENGTH,
  MIN_MAX_LENGTH,
  checkSlugs,
  slugify,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULT_TITLES = [
  "10 Ways to Speed Up Your API",
  "10 Ways to Speed Up Your API!",
  "10 ways to speed up your API",
  "Café Münster: A Review",
  "Cafe Munster — A Review",
  "R&D at 100% Capacity",
  "Straße und Gasse",
  "Admin",
  "日本語のタイトル",
].join("\n");

export default function ToolHome() {
  const [text, setText] = useState(DEFAULT_TITLES);
  const [separator, setSeparator] = useState("-");
  const [maxLength, setMaxLength] = useState(String(DEFAULT_MAX_LENGTH));
  const [stripStopWords, setStripStopWords] = useState(false);
  const [copied, setCopied] = useState("");
  const [inspect, setInspect] = useState(null);

  const report = useMemo(
    () =>
      checkSlugs(text.split("\n"), {
        separator,
        maxLength: Number(maxLength),
        stripStopWords,
      }),
    [text, separator, maxLength, stripStopWords],
  );

  const steps = useMemo(() => {
    if (inspect === null) return null;
    const row = report.rows?.find((entry) => entry.index === inspect);
    if (!row) return null;
    return {
      title: row.title,
      steps: slugify(row.title, {
        separator,
        maxLength: Number(maxLength),
        stripStopWords,
      }).steps,
    };
  }, [inspect, report, separator, maxLength, stripStopWords]);

  const summary = useMemo(() => {
    if (report.error) return "";
    return report.rows.map((row) => `${row.slug}\t${row.title}`).join("\n");
  }, [report]);

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
    setText(DEFAULT_TITLES);
    setSeparator("-");
    setMaxLength(String(DEFAULT_MAX_LENGTH));
    setStripStopWords(false);
    setCopied("");
    setInspect(null);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Link2 className="h-4 w-4" aria-hidden="true" />
          Slug hygiene
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">URL Slug Collision Checker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste your titles and see which ones normalise down to the same URL. Accents fold, case
          disappears, punctuation collapses — and two headlines that looked different end up fighting
          over one path.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="slug-titles">
          Titles, one per line
        </label>
        <textarea
          id="slug-titles"
          className={`mt-2 ${AREA_CLASS}`}
          rows={10}
          spellCheck={false}
          value={text}
          onChange={(event) => setText(event.target.value)}
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="slug-sep">
              Separator
            </label>
            <select
              id="slug-sep"
              className={`mt-2 ${INPUT_CLASS}`}
              value={separator}
              onChange={(event) => setSeparator(event.target.value)}
            >
              <option value="-">Hyphen (recommended)</option>
              <option value="_">Underscore</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="slug-max">
              Max length ({MIN_MAX_LENGTH}–{MAX_MAX_LENGTH})
            </label>
            <input
              id="slug-max"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_MAX_LENGTH}
              max={MAX_MAX_LENGTH}
              step="1"
              value={maxLength}
              onChange={(event) => setMaxLength(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold"
              htmlFor="slug-stop"
            >
              <input
                id="slug-stop"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={stripStopWords}
                onChange={(event) => setStripStopWords(event.target.checked)}
              />
              Drop English stop words (the, of, and, to …)
            </label>
          </div>
        </div>
      </section>

      {report.error ? (
        <>
          <p
            role="alert"
            className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {report.error}
          </p>
          <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Colliding titles
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--muted-foreground)]">{DASH}</p>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {["Titles checked", "Distinct slugs", "Needed a suffix", "Warnings"].map((label) => (
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
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Colliding titles
                </p>
                <p
                  className={`mt-1 text-4xl font-semibold ${
                    report.collisionCount > 0 ? "text-[var(--danger)]" : "text-[var(--success)]"
                  }`}
                >
                  {report.collisionCount}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {report.collisionCount === 0
                    ? "Every title produced its own slug."
                    : `${report.groups.length} slug${report.groups.length === 1 ? "" : "s"} claimed by more than one title.`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copy(summary, "all")}
                  aria-label="Copy every generated slug"
                  className={GHOST_BTN}
                >
                  {copied === "all" ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copied === "all" ? "Copied!" : "Copy result"}
                </button>
                <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Titles checked", String(report.total)],
                ["Distinct slugs before suffixes", String(report.uniqueBases)],
                ["Needed a numeric suffix", String(report.collisionCount)],
                ["Titles with an error", String(report.errorCount)],
                ["Titles with a warning", String(report.warningCount)],
                ["Length limit applied", `${report.maxLength} characters`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {report.groups.length > 0 && (
            <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">Collision groups</h2>
              <ul className="mt-3 space-y-4">
                {report.groups.map((group) => (
                  <li key={group.base} className="rounded-md bg-[var(--muted)] p-3">
                    <p className="break-all font-mono text-sm font-semibold text-[var(--primary)]">
                      /{group.base}
                    </p>
                    <ul className="mt-2 space-y-1 text-sm">
                      {group.members.map((member) => (
                        <li key={member.index} className="flex flex-wrap items-baseline gap-2">
                          <span className="text-[var(--muted-foreground)]">line {member.line}</span>
                          <span className="min-w-0 break-words">{member.title}</span>
                          <span className="break-all font-mono text-xs text-[var(--muted-foreground)]">
                            → /{member.slug}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Every title</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[340px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      #
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Title
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Final slug
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Steps
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {report.rows.map((row) => (
                    <tr key={row.index} className="border-b border-[var(--border)] align-top last:border-0">
                      <td className="py-2 pr-3 font-semibold">{row.line}</td>
                      <td className="py-2 pr-3 break-words">{row.title}</td>
                      <td className="py-2 pr-3">
                        <span
                          className={`break-all font-mono ${
                            row.collides ? "text-[var(--danger)]" : "text-[var(--foreground)]"
                          }`}
                        >
                          {row.slug}
                        </span>
                        {row.issues.map((issue) => (
                          <span
                            key={issue.text}
                            className={`mt-1 block text-xs ${
                              issue.level === "error"
                                ? "text-[var(--danger)]"
                                : "text-[var(--muted-foreground)]"
                            }`}
                          >
                            {issue.text}
                          </span>
                        ))}
                      </td>
                      <td className="py-2 text-right">
                        <button
                          type="button"
                          onClick={() => setInspect(inspect === row.index ? null : row.index)}
                          aria-expanded={inspect === row.index}
                          className="min-h-11 rounded-md px-2 text-xs font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                        >
                          {inspect === row.index ? "Hide" : "Show"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {steps && (
              <div className="mt-4 rounded-md bg-[var(--muted)] p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Normalisation of “{steps.title}”
                </p>
                <ol className="mt-2 space-y-1 text-sm">
                  {steps.steps.map(([label, value], position) => (
                    <li key={`${label}-${position}`} className="flex flex-wrap items-baseline gap-2">
                      <span className="text-[var(--muted-foreground)]">{label}</span>
                      <span className="min-w-0 break-all font-mono">{value || "(empty)"}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Slugs are compared case-insensitively because most routers and most case-insensitive database
        collations treat /My-Post and /my-post as the same URL. Suffixes follow the WordPress
        convention: the first title keeps the clean slug, later ones get -2, -3 and so on.
      </p>
    </main>
  );
}
