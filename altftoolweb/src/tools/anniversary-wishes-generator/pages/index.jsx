"use client";

import { useMemo, useState } from "react";
import { Check, Copy, HeartHandshake, RotateCcw, Shuffle } from "lucide-react";

import {
  LANGUAGES,
  MAX_WISHES,
  MAX_YEARS,
  MIN_YEARS,
  RELATIONS,
  TONES,
  generateAnniversaryWishes,
} from "../lib";

const DEFAULTS = {
  names: "Rahul & Priya",
  relation: "friends",
  years: 25,
  language: "en",
  tone: "heartfelt",
  includeSymbol: true,
  count: 2,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const EM_DASH = "—";
const NUM = new Intl.NumberFormat("en-IN");

export default function ToolHome() {
  const [names, setNames] = useState(DEFAULTS.names);
  const [relation, setRelation] = useState(DEFAULTS.relation);
  const [years, setYears] = useState(String(DEFAULTS.years));
  const [language, setLanguage] = useState(DEFAULTS.language);
  const [tone, setTone] = useState(DEFAULTS.tone);
  const [includeSymbol, setIncludeSymbol] = useState(DEFAULTS.includeSymbol);
  const [count, setCount] = useState(String(DEFAULTS.count));
  const [seed, setSeed] = useState(0);
  const [copiedId, setCopiedId] = useState("");

  const result = useMemo(
    () =>
      generateAnniversaryWishes({
        names,
        relation,
        years: years.trim() === "" ? Number.NaN : Number(years),
        language,
        tone,
        includeSymbol,
        count: Number(count),
        variantSeed: seed,
      }),
    [names, relation, years, language, tone, includeSymbol, count, seed],
  );

  const allText = useMemo(() => {
    if (result.error) return "";
    return result.messages.map((message) => message.text).join("\n\n---\n\n");
  }, [result]);

  const copy = async (text, id) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(""), 1500);
    } catch {
      setCopiedId("");
    }
  };

  const reset = () => {
    setNames(DEFAULTS.names);
    setRelation(DEFAULTS.relation);
    setYears(String(DEFAULTS.years));
    setLanguage(DEFAULTS.language);
    setTone(DEFAULTS.tone);
    setIncludeSymbol(DEFAULTS.includeSymbol);
    setCount(String(DEFAULTS.count));
    setSeed(0);
    setCopiedId("");
  };

  const facts = result.error ? null : result.facts;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <HeartHandshake className="h-4 w-4" aria-hidden="true" />
          Anniversary
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Anniversary Wishes Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a ready-to-send anniversary message from the number of years, your relationship to
          the couple and the language — with the traditional gift symbol and jubilee name for that
          year worked in.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="an-names">
              Names on the card
            </label>
            <input
              id="an-names"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={names}
              onChange={(event) => setNames(event.target.value)}
              placeholder="Rahul & Priya"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="an-years">
              Years married
            </label>
            <input
              id="an-years"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_YEARS}
              max={MAX_YEARS}
              step="1"
              value={years}
              onChange={(event) => setYears(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="an-relation">
              Who is the message for
            </label>
            <select
              id="an-relation"
              className={`mt-2 ${INPUT_CLASS}`}
              value={relation}
              onChange={(event) => setRelation(event.target.value)}
            >
              {RELATIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="an-language">
              Language
            </label>
            <select
              id="an-language"
              className={`mt-2 ${INPUT_CLASS}`}
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              {LANGUAGES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="an-tone">
              Tone
            </label>
            <select
              id="an-tone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tone}
              onChange={(event) => setTone(event.target.value)}
            >
              {TONES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="an-count">
              How many variants
            </label>
            <select
              id="an-count"
              className={`mt-2 ${INPUT_CLASS}`}
              value={count}
              onChange={(event) => setCount(event.target.value)}
            >
              {Array.from({ length: MAX_WISHES }, (_, index) => index + 1).map((value) => (
                <option key={value} value={String(value)}>
                  {NUM.format(value)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              htmlFor="an-symbol"
            >
              <input
                id="an-symbol"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={includeSymbol}
                onChange={(event) => setIncludeSymbol(event.target.checked)}
              />
              Mention the traditional gift
            </label>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSeed((value) => value + 1)}
            className={GHOST_BTN}
            aria-label="Show different anniversary wording"
          >
            <Shuffle className="h-4 w-4" aria-hidden="true" />
            Shuffle wording
          </button>
          <button type="button" onClick={reset} className={GHOST_BTN} aria-label="Reset all inputs">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Anniversary
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {facts ? facts.ordinalEn : EM_DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {facts
                ? `${NUM.format(facts.years)} year${facts.years === 1 ? "" : "s"} of marriage`
                : "Fix the input to see the milestone"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => copy(allText, "all")}
            aria-label="Copy all anniversary messages"
            className={PRIMARY_BTN}
            disabled={Boolean(result.error)}
          >
            {copiedId === "all" ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copiedId === "all" ? "Copied!" : "Copy all"}
          </button>
        </div>

        {result.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
        ) : (
          <>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Traditional gift symbol", facts.traditional ?? "No symbol assigned to this year"],
                ["Modern gift symbol", facts.modern ?? "No symbol assigned to this year"],
                ["Named jubilee", facts.jubilee ? facts.jubilee.en : "Not a jubilee year"],
                ["Salutation", result.salutation],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            <ul className="mt-5 space-y-3">
              {result.messages.map((message) => (
                <li
                  key={message.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
                >
                  <p lang={result.lang} className="whitespace-pre-line text-base leading-8">
                    {message.text}
                  </p>
                  <button
                    type="button"
                    onClick={() => copy(message.text, message.id)}
                    aria-label="Copy this anniversary message"
                    className={`mt-3 ${GHOST_BTN}`}
                  >
                    {copiedId === message.id ? (
                      <Check className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Copy className="h-4 w-4" aria-hidden="true" />
                    )}
                    {copiedId === message.id ? "Copied!" : "Copy"}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Gift symbols are conventions rather than rules, and regional lists differ — the UK list gives
        linen for year 4 where the US list gives fruit and flowers. Treat them as a prompt, not an
        obligation.
      </p>
    </main>
  );
}
