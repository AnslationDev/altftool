"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Heart, RotateCcw } from "lucide-react";

import {
  CATEGORIES,
  INSTAGRAM_HASHTAGS_PER_POST,
  INSTAGRAM_HASHTAG_MAX_LENGTH,
  filterByCategory,
  generateHashtags,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const ERROR_CLASS =
  "rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]";

const DEFAULTS = { one: "Priya", two: "Rahul", surname: "Mehta", year: "2026" };
const DASH = "—";

const TABS = [{ key: "all", label: "All" }, ...CATEGORIES];

export default function ToolHome() {
  const [one, setOne] = useState(DEFAULTS.one);
  const [two, setTwo] = useState(DEFAULTS.two);
  const [surname, setSurname] = useState(DEFAULTS.surname);
  const [year, setYear] = useState(DEFAULTS.year);
  const [category, setCategory] = useState("all");
  const [copiedTag, setCopiedTag] = useState("");
  const [copiedAll, setCopiedAll] = useState(false);

  const result = useMemo(
    () => generateHashtags({ partnerOne: one, partnerTwo: two, surname, year }),
    [one, two, surname, year],
  );

  const visible = useMemo(() => filterByCategory(result, category), [result, category]);

  const ok = !result.error;

  const allText = useMemo(() => {
    if (!ok) return "";
    return visible.map((item) => `#${item.tag}`).join(" ");
  }, [ok, visible]);

  const copyOne = async (tag) => {
    try {
      await navigator.clipboard.writeText(`#${tag}`);
      setCopiedTag(tag);
      setTimeout(() => setCopiedTag(""), 1500);
    } catch {
      setCopiedTag("");
    }
  };

  const copyAll = async () => {
    if (!allText) return;
    try {
      await navigator.clipboard.writeText(allText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1500);
    } catch {
      setCopiedAll(false);
    }
  };

  const reset = () => {
    setOne(DEFAULTS.one);
    setTwo(DEFAULTS.two);
    setSurname(DEFAULTS.surname);
    setYear(DEFAULTS.year);
    setCategory("all");
    setCopiedTag("");
    setCopiedAll(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Heart className="h-4 w-4" aria-hidden="true" />
          Shaadi social
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Indian Wedding Hashtag Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Blends both first names into portmanteaus and drops them into classic, Hindi and playful
          hashtag formats. Every suggestion is checked against Instagram&apos;s{" "}
          {INSTAGRAM_HASHTAG_MAX_LENGTH}-character hashtag limit so nothing gets cut off.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="wed-one">
              First partner&apos;s name
            </label>
            <input
              id="wed-one"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={one}
              onChange={(event) => setOne(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wed-two">
              Second partner&apos;s name
            </label>
            <input
              id="wed-two"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={two}
              onChange={(event) => setTwo(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wed-surname">
              Shared surname (optional)
            </label>
            <input
              id="wed-surname"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={surname}
              onChange={(event) => setSurname(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wed-year">
              Wedding year (optional)
            </label>
            <input
              id="wed-year"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="2026"
              value={year}
              onChange={(event) => setYear(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        {result.error ? (
          <p role="alert" className={ERROR_CLASS}>
            {result.error}
          </p>
        ) : null}

        <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Hashtags generated
            </p>
            <p className="mt-1 text-5xl font-semibold leading-none text-[var(--primary)]">
              {ok ? result.count : DASH}
            </p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.withinLimitCount} fit Instagram's ${INSTAGRAM_HASHTAG_MAX_LENGTH}-character limit`
                : DASH}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyAll}
              aria-label="Copy every hashtag currently shown"
              className={GHOST_BTN}
            >
              {copiedAll ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copiedAll ? "Copied!" : "Copy all shown"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Name blends found", ok ? result.blends.join(", ") : DASH],
            [
              "Couple",
              ok
                ? `${result.partnerOne} & ${result.partnerTwo}${result.surname ? ` ${result.surname}` : ""}`
                : DASH,
            ],
            ["Year used", ok ? result.year || "not used" : DASH],
            [
              "Tags over the Instagram limit",
              ok ? String(result.count - result.withinLimitCount) : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setCategory(tab.key)}
                aria-pressed={category === tab.key}
                className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  category === tab.key
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {visible.map((item) => (
              <li key={item.tag}>
                <button
                  type="button"
                  onClick={() => copyOne(item.tag)}
                  aria-label={`Copy hashtag ${item.tag}`}
                  className="flex min-h-11 w-full items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <span className="break-all text-sm font-semibold">#{item.tag}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span
                      className={`text-xs ${
                        item.withinInstagramLimit
                          ? "text-[var(--muted-foreground)]"
                          : "font-semibold text-[var(--danger)]"
                      }`}
                    >
                      {item.length}
                    </span>
                    {copiedTag === item.tag ? (
                      <Check className="h-4 w-4 text-[var(--success)]" aria-hidden="true" />
                    ) : (
                      <Copy className="h-4 w-4 text-[var(--muted-foreground)]" aria-hidden="true" />
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {visible.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--muted-foreground)]">
              No hashtags in this category for these names.
            </p>
          ) : null}
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Numbers in grey are the character count after the “#”. Anything over{" "}
        {INSTAGRAM_HASHTAG_MAX_LENGTH} characters is flagged because Instagram will not accept it as
        a single tag, and a feed post takes at most {INSTAGRAM_HASHTAGS_PER_POST} hashtags. Search
        your favourite on Instagram before printing it on signage — someone else may already be
        using it.
      </p>
    </main>
  );
}
