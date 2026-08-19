"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Linkedin, RotateCcw } from "lucide-react";

import {
  HEADLINE_MAX_CHARS,
  PREVIEW_CHARS,
  SEPARATORS,
  generateHeadlines,
} from "../lib";

const INPUT =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  role: "Senior Data Analyst",
  outcome: "Turning messy retail data into weekly decisions",
  proof: "ex-Flipkart · 4 dashboards used by 200+ store managers",
  audience: "retail teams",
  seeking: "analytics roles in Bengaluru",
  availability: "Available from September",
  keywords: "SQL, Power BI, retail analytics, Python",
  separatorId: "pipe",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState("");

  const setField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(() => generateHeadlines(form), [form]);
  const failed = Boolean(result.error);

  const copy = async (what, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Linkedin className="h-4 w-4" aria-hidden="true" />
          Profile copy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">LinkedIn Headline Writer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Six headline patterns built from your role, the value you deliver and one piece of proof —
          each measured against the {HEADLINE_MAX_CHARS}-character limit and the part that survives
          truncation in search.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="lh-role">
              Role you want to be found for
            </label>
            <input id="lh-role" className={`mt-2 ${INPUT}`} value={form.role} onChange={setField("role")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="lh-audience">
              Who you do it for
            </label>
            <input id="lh-audience" className={`mt-2 ${INPUT}`} value={form.audience} onChange={setField("audience")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="lh-outcome">
              The value you deliver
            </label>
            <input id="lh-outcome" className={`mt-2 ${INPUT}`} value={form.outcome} onChange={setField("outcome")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="lh-proof">
              Proof — a number, an employer, a shipped thing
            </label>
            <input id="lh-proof" className={`mt-2 ${INPUT}`} value={form.proof} onChange={setField("proof")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="lh-keywords">
              Search keywords (comma separated)
            </label>
            <input id="lh-keywords" className={`mt-2 ${INPUT}`} value={form.keywords} onChange={setField("keywords")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="lh-seeking">
              What you are seeking (optional)
            </label>
            <input id="lh-seeking" className={`mt-2 ${INPUT}`} value={form.seeking} onChange={setField("seeking")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="lh-availability">
              Availability (optional)
            </label>
            <input id="lh-availability" className={`mt-2 ${INPUT}`} value={form.availability} onChange={setField("availability")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="lh-separator">
              Separator
            </label>
            <select id="lh-separator" className={`mt-2 ${INPUT}`} value={form.separatorId} onChange={setField("separatorId")}>
              {SEPARATORS.map((separator) => (
                <option key={separator.id} value={separator.id}>
                  {separator.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {failed && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      )}

      <section aria-live="polite" aria-atomic="true" className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Best-scoring option
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${result.best.score}/${result.best.scoreMax}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed ? "Add a role and a value line." : `${result.best.label} · ${result.best.chars} characters`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("best", failed ? "" : result.best.text)}
              aria-label="Copy the best-scoring headline"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied === "best" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied === "best" ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Best headline", failed ? DASH : result.best.text],
            ["Visible in search", failed ? DASH : result.best.preview],
            ["Characters left", failed ? DASH : String(result.best.remaining)],
            ["Options generated", failed ? DASH : String(result.headlines.length)],
            ["Average length", failed ? DASH : `${result.averageChars} characters`],
            ["Keywords used", failed ? DASH : result.keywords.length ? result.keywords.join(", ") : "None"],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold break-words">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && (
        <section className="mt-6 space-y-4">
          {result.headlines.map((headline) => (
            <article key={headline.id} className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold">{headline.label}</h2>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {headline.chars} / {HEADLINE_MAX_CHARS} characters · score {headline.score}/
                    {headline.scoreMax}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copy(headline.id, headline.text)}
                  aria-label={`Copy the ${headline.label} headline`}
                  className={GHOST_BTN}
                >
                  {copied === headline.id ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                  {copied === headline.id ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="mt-3 break-words rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6">
                {headline.text}
              </p>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">{headline.note}</p>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Search preview: <span className="text-[var(--foreground)]">{headline.preview}</span>
              </p>
              {headline.overLimit && (
                <p className="mt-2 text-xs font-semibold text-[var(--danger)]">
                  Over the {HEADLINE_MAX_CHARS}-character limit by {Math.abs(headline.remaining)}.
                </p>
              )}
              <ul className="mt-3 grid gap-1.5 text-xs sm:grid-cols-2">
                {headline.points.map((point) => (
                  <li key={point.label} className="flex items-start gap-2">
                    <span
                      aria-hidden="true"
                      className={
                        point.ok
                          ? "mt-0.5 inline-block h-3 w-3 shrink-0 rounded-full bg-[var(--success)]"
                          : "mt-0.5 inline-block h-3 w-3 shrink-0 rounded-full border border-[var(--border)] bg-[var(--muted)]"
                      }
                    />
                    <span className={point.ok ? "" : "text-[var(--muted-foreground)]"}>
                      {point.label}
                      <span className="sr-only">{point.ok ? " — passed" : " — not met"}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The headline field holds {HEADLINE_MAX_CHARS} characters, but comments, search results and
        connection requests show far less — roughly the first {PREVIEW_CHARS}. Put the role and the
        number at the front and treat the rest as a bonus.
      </p>
    </main>
  );
}
