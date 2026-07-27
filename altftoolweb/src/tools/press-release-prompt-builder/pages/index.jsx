"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MapPin, Newspaper, RotateCcw } from "lucide-react";

import {
  ANNOUNCEMENT_TYPES,
  END_MARK,
  HEADLINE_MAX_CHARS,
  IDEAL_MAX_WORDS,
  IDEAL_MIN_WORDS,
  LIMITS,
  SUBHEAD_MAX_CHARS,
  WORDS_PER_QUOTE,
  buildPressReleasePrompt,
  formatDateline,
  planPressRelease,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  organisation: "Northwind Analytics",
  news: "It has raised a 12 million dollar Series A led by Camber Ventures to expand its supply-chain forecasting platform into Europe.",
  typeId: "funding",
  audience: "logistics and enterprise software trade press",
  city: "Boston",
  region: "",
  isoDate: "2026-09-03",
  spokespersonName: "Dana Okafor",
  spokespersonTitle: "chief executive",
  mediaContact: "Priya Menon, head of communications, press@northwind.example, +1 617 555 0142",
  notes: "",
  totalWords: "450",
  quoteCount: "2",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((previous) => ({ ...previous, [key]: value }));
    setCopied(false);
  };

  const dateline = useMemo(
    () => formatDateline({ city: form.city, region: form.region, isoDate: form.isoDate }),
    [form.city, form.region, form.isoDate],
  );

  const plan = useMemo(
    () => planPressRelease({ totalWords: form.totalWords, quoteCount: form.quoteCount }),
    [form.totalWords, form.quoteCount],
  );

  const result = useMemo(
    () =>
      buildPressReleasePrompt({
        organisation: form.organisation,
        news: form.news,
        audience: form.audience,
        typeId: form.typeId,
        spokespersonName: form.spokespersonName,
        spokespersonTitle: form.spokespersonTitle,
        mediaContact: form.mediaContact,
        notes: form.notes,
        plan,
        dateline,
      }),
    [form, plan, dateline],
  );

  const failed = Boolean(result.error);

  const copyResult = async () => {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  const rows = failed
    ? [
        ["Dateline", DASH],
        ["Total length", DASH],
        ["Lead paragraph", DASH],
        ["Body", DASH],
        ["Quotes", DASH],
        ["Boilerplate", DASH],
        ["Read time", DASH],
        ["Prompt size", DASH],
      ]
    : [
        ["Dateline", result.dateline.dateline.trim()],
        ["Total length", `${NUM.format(result.plan.total)} words`],
        ["Lead paragraph", `${NUM.format(result.plan.lead)} words max`],
        ["Body", `${NUM.format(result.plan.body)} words`],
        [
          "Quotes",
          result.plan.quotes === 0
            ? "None"
            : `${NUM.format(result.plan.quotes)} × ${NUM.format(WORDS_PER_QUOTE)} words = ${NUM.format(result.plan.quoteWords)}`,
        ],
        ["Boilerplate", `${NUM.format(result.plan.boilerplate)} words`],
        ["Read time", `${NUM.format(result.plan.readingSeconds)} seconds`],
        ["Prompt size", `${NUM.format(result.words)} words · ~${NUM.format(result.approxTokens)} tokens`],
      ];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Newspaper className="h-4 w-4" aria-hidden="true" />
          AP-style release prompt
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Press Release Prompt Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the news once. The builder writes the AP dateline, splits a {IDEAL_MIN_WORDS}-{IDEAL_MAX_WORDS} word
          release across the inverted pyramid, and hands you a drafting prompt with every budget and style rule already
          in it.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The announcement</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-org">
              Organisation
            </label>
            <input id="pr-org" type="text" className={`mt-2 ${INPUT_CLASS}`} value={form.organisation} onChange={set("organisation")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-type">
              Kind of announcement
            </label>
            <select id="pr-type" className={`mt-2 ${INPUT_CLASS}`} value={form.typeId} onChange={set("typeId")}>
              {ANNOUNCEMENT_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pr-news">
              The news in one sentence
            </label>
            <textarea id="pr-news" rows={3} className={`mt-2 ${TEXTAREA_CLASS}`} value={form.news} onChange={set("news")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pr-audience">
              Who it is aimed at
            </label>
            <input id="pr-audience" type="text" className={`mt-2 ${INPUT_CLASS}`} value={form.audience} onChange={set("audience")} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <MapPin className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
          Dateline
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-city">
              City
            </label>
            <input id="pr-city" type="text" className={`mt-2 ${INPUT_CLASS}`} value={form.city} onChange={set("city")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-region">
              State or country
            </label>
            <input
              id="pr-region"
              type="text"
              className={`mt-2 ${INPUT_CLASS}`}
              placeholder="Leave blank for stand-alone cities"
              value={form.region}
              onChange={set("region")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-date">
              Release date
            </label>
            <input id="pr-date" type="date" className={`mt-2 ${INPUT_CLASS}`} value={form.isoDate} onChange={set("isoDate")} />
          </div>
        </div>
        {dateline.error ? (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {dateline.error}
          </p>
        ) : (
          <>
            <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 font-semibold break-words">
              {dateline.dateline.trim()}
            </p>
            <ul className="mt-3 space-y-1 text-xs leading-5 text-[var(--muted-foreground)]">
              {dateline.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Length and attribution</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-words">
              Target length in words ({LIMITS.totalWords.min}–{LIMITS.totalWords.max})
            </label>
            <input
              id="pr-words"
              type="number"
              inputMode="numeric"
              min={LIMITS.totalWords.min}
              max={LIMITS.totalWords.max}
              step={10}
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.totalWords}
              onChange={set("totalWords")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-quotes">
              Number of quotes
            </label>
            <select id="pr-quotes" className={`mt-2 ${INPUT_CLASS}`} value={form.quoteCount} onChange={set("quoteCount")}>
              <option value="0">No quote</option>
              <option value="1">1 quote</option>
              <option value="2">2 quotes</option>
              <option value="3">3 quotes</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-speaker">
              Spokesperson name
            </label>
            <input id="pr-speaker" type="text" className={`mt-2 ${INPUT_CLASS}`} value={form.spokespersonName} onChange={set("spokespersonName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-speaker-title">
              Spokesperson title
            </label>
            <input id="pr-speaker-title" type="text" className={`mt-2 ${INPUT_CLASS}`} value={form.spokespersonTitle} onChange={set("spokespersonTitle")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pr-contact">
              Media contact block
            </label>
            <input id="pr-contact" type="text" className={`mt-2 ${INPUT_CLASS}`} value={form.mediaContact} onChange={set("mediaContact")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pr-notes">
              Extra instruction (optional)
            </label>
            <input
              id="pr-notes"
              type="text"
              className={`mt-2 ${INPUT_CLASS}`}
              placeholder="Embargoed until 9am ET; do not name the customer."
              value={form.notes}
              onChange={set("notes")}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Body paragraph budget
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${NUM.format(result.plan.body)} words`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the inputs above to see the structure."
                : `after a ${NUM.format(result.plan.lead)}-word lead, ${NUM.format(result.plan.quoteWords)} words of quotes and ${NUM.format(result.plan.boilerplate)} words of boilerplate`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the finished press release prompt to the clipboard"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset every field to the example release" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {failed && (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {result.error}
          </p>
        )}

        {!failed && result.plan.warnings.length > 0 && (
          <ul role="status" className="mt-4 space-y-2">
            {result.plan.warnings.map((warning) => (
              <li key={warning} className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
                {warning}
              </li>
            ))}
          </ul>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold break-words">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && (
          <div className="mt-5 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
            <pre className="text-sm leading-6 break-words whitespace-pre-wrap text-[var(--foreground)]">{result.text}</pre>
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Headlines are capped at {HEADLINE_MAX_CHARS} characters and subheads at {SUBHEAD_MAX_CHARS} so they survive search
        results and email subject lines, and the prompt closes the release with {END_MARK}. AP style is revised annually —
        check the current Stylebook for publication-critical work. Everything runs in your browser.
      </p>
    </main>
  );
}
