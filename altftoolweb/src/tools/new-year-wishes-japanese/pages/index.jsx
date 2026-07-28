"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Shuffle, Sparkles } from "lucide-react";

import {
  HONORIFICS,
  IMIKOTOBA,
  MAX_MESSAGES,
  MAX_YEAR,
  MIN_YEAR,
  POLITENESS_LEVELS,
  RECIPIENTS,
  REGIONS,
  TIMINGS,
  generateJapaneseNewYearWishes,
  greetingWindow,
  nextSeed,
} from "../lib";

const DEFAULTS = {
  name: "田中",
  honorificId: "sama",
  recipientId: "client",
  politeness: "keigo",
  timing: "after",
  year: "2027",
  count: "3",
  region: "kanto",
  month: "1",
  day: "1",
  includeDateLine: true,
  seed: 11,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const toInt = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isInteger(value) ? value : NaN;
};

export default function ToolHome() {
  const [name, setName] = useState(DEFAULTS.name);
  const [honorificId, setHonorificId] = useState(DEFAULTS.honorificId);
  const [recipientId, setRecipientId] = useState(DEFAULTS.recipientId);
  const [politeness, setPoliteness] = useState(DEFAULTS.politeness);
  const [timing, setTiming] = useState(DEFAULTS.timing);
  const [year, setYear] = useState(DEFAULTS.year);
  const [count, setCount] = useState(DEFAULTS.count);
  const [region, setRegion] = useState(DEFAULTS.region);
  const [month, setMonth] = useState(DEFAULTS.month);
  const [day, setDay] = useState(DEFAULTS.day);
  const [includeDateLine, setIncludeDateLine] = useState(DEFAULTS.includeDateLine);
  const [seed, setSeed] = useState(DEFAULTS.seed);
  const [copiedId, setCopiedId] = useState("");

  const result = useMemo(
    () =>
      generateJapaneseNewYearWishes({
        name,
        honorificId,
        recipientId,
        politeness,
        timing,
        year: toInt(year),
        includeDateLine,
        count: toInt(count),
        seed,
      }),
    [name, honorificId, recipientId, politeness, timing, year, includeDateLine, count, seed],
  );

  const season = useMemo(
    () => greetingWindow({ month: toInt(month), day: toInt(day), region }),
    [month, day, region],
  );

  const hasError = Boolean(result.error);
  const messages = hasError ? [] : result.messages;
  const featured = messages[0] || null;

  const allText = useMemo(() => {
    if (hasError) return "";
    return messages.map((item) => `${item.native}\n\n(${item.romaji})`).join("\n\n———\n\n");
  }, [hasError, messages]);

  const copy = async (text, key) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(key);
      setTimeout(() => setCopiedId(""), 1500);
    } catch {
      setCopiedId("");
    }
  };

  const reset = () => {
    setName(DEFAULTS.name);
    setHonorificId(DEFAULTS.honorificId);
    setRecipientId(DEFAULTS.recipientId);
    setPoliteness(DEFAULTS.politeness);
    setTiming(DEFAULTS.timing);
    setYear(DEFAULTS.year);
    setCount(DEFAULTS.count);
    setRegion(DEFAULTS.region);
    setMonth(DEFAULTS.month);
    setDay(DEFAULTS.day);
    setIncludeDateLine(DEFAULTS.includeDateLine);
    setSeed(DEFAULTS.seed);
    setCopiedId("");
  };

  const details = hasError
    ? [
        ["Register", DASH],
        ["Addressed as", DASH],
        ["Era line", DASH],
        ["Wordings available", DASH],
        ["Correct card on that date", DASH],
      ]
    : [
        ["Register", POLITENESS_LEVELS.find((item) => item.id === result.politeness)?.label || DASH],
        ["Addressed as", name.trim() ? `${name.trim()}${result.honorific.suffix}` : "No name line"],
        ["Era line", result.dateLine ? result.dateLine.native : "Not used before 1 January"],
        ["Wordings available", `${result.delivered} of ${result.poolSize} openings`],
        ["Correct card on that date", season.error ? DASH : season.label],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          年賀状 nengajo
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Japanese New Year Wishes</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a full New Year message from the four parts a real card uses — opening greeting,
          thanks, the request for continued goodwill, and a closing wish — in keigo, polite or
          casual Japanese, with romaji and English.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="jp-name">
              Their name (optional)
            </label>
            <input
              id="jp-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="田中 / Tanaka"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jp-honorific">
              Honorific
            </label>
            <select
              id="jp-honorific"
              className={`mt-2 ${INPUT_CLASS}`}
              value={honorificId}
              onChange={(event) => setHonorificId(event.target.value)}
            >
              {HONORIFICS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jp-recipient">
              Who is it for?
            </label>
            <select
              id="jp-recipient"
              className={`mt-2 ${INPUT_CLASS}`}
              value={recipientId}
              onChange={(event) => setRecipientId(event.target.value)}
            >
              {RECIPIENTS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jp-politeness">
              Politeness level
            </label>
            <select
              id="jp-politeness"
              className={`mt-2 ${INPUT_CLASS}`}
              value={politeness}
              onChange={(event) => setPoliteness(event.target.value)}
            >
              {POLITENESS_LEVELS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jp-timing">
              Sending before or after 1 January?
            </label>
            <select
              id="jp-timing"
              className={`mt-2 ${INPUT_CLASS}`}
              value={timing}
              onChange={(event) => setTiming(event.target.value)}
            >
              {TIMINGS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jp-year">
              Incoming year
            </label>
            <input
              id="jp-year"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_YEAR}
              max={MAX_YEAR}
              step="1"
              value={year}
              onChange={(event) => setYear(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jp-count">
              How many versions
            </label>
            <select
              id="jp-count"
              className={`mt-2 ${INPUT_CLASS}`}
              value={count}
              onChange={(event) => setCount(event.target.value)}
            >
              {Array.from({ length: MAX_MESSAGES }, (_, index) => index + 1).map((value) => (
                <option key={value} value={String(value)}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              htmlFor="jp-dateline"
            >
              <input
                id="jp-dateline"
                type="checkbox"
                checked={includeDateLine}
                onChange={(event) => setIncludeDateLine(event.target.checked)}
                className="h-5 w-5 accent-[var(--primary)]"
              />
              Add the 令和X年 元旦 line
            </label>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Which card is right on the day you send it?</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <div>
            <label className={LABEL_CLASS} htmlFor="jp-month">
              Month
            </label>
            <input
              id="jp-month"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="12"
              step="1"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jp-day">
              Day
            </label>
            <input
              id="jp-day"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="31"
              step="1"
              value={day}
              onChange={(event) => setDay(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jp-region">
              Region
            </label>
            <select
              id="jp-region"
              className={`mt-2 ${INPUT_CLASS}`}
              value={region}
              onChange={(event) => setRegion(event.target.value)}
            >
              {REGIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {season.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {season.error}
          </p>
        ) : (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            <span className="font-semibold">{season.label}.</span> {season.guidance}
          </p>
        )}
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
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Opening greeting
            </p>
            <p className="mt-1 text-3xl font-semibold leading-snug text-[var(--primary)] sm:text-4xl">
              {featured ? featured.opening.native : DASH}
            </p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              {featured ? `${featured.opening.romaji} — ${featured.note}` : DASH}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy(allText, "all")}
              aria-label="Copy every generated Japanese greeting"
              className={PRIMARY_BTN}
              disabled={hasError}
            >
              {copiedId === "all" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copiedId === "all" ? "Copied!" : "Copy all"}
            </button>
            <button type="button" onClick={() => setSeed(nextSeed(seed))} className={GHOST_BTN}>
              <Shuffle className="h-4 w-4" aria-hidden="true" />
              Reshuffle
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {details.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.warnUpward ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            One of these openings is a two-character abbreviation (賀正 / 迎春). Those read as too
            casual for a boss, a teacher or a client — switch the register to keigo.
          </p>
        ) : null}
        {!hasError && result.registerMismatch && !result.warnUpward ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            For a {result.recipient.label.toLowerCase()}, Japanese speakers would usually write in{" "}
            {result.suggestedPoliteness}.
          </p>
        ) : null}
      </section>

      {messages.length > 0 ? (
        <section className="mt-6 space-y-3">
          {messages.map((item) => (
            <article key={item.id} className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-[var(--muted)] px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {item.superiorSafe ? "Safe to send upward" : "Peers and juniors only"}
                </span>
                <button
                  type="button"
                  onClick={() => copy(`${item.native}\n\n(${item.romaji})`, item.id)}
                  aria-label="Copy this Japanese greeting"
                  className={GHOST_BTN}
                >
                  {copiedId === item.id ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copiedId === item.id ? "Copied!" : "Copy"}
                </button>
              </div>
              <ul className="mt-3 space-y-3">
                {item.lines.map((line) => (
                  <li
                    key={line.native}
                    className="border-b border-[var(--border)] pb-3 last:border-0 last:pb-0"
                  >
                    <p className="text-base font-semibold leading-7">{line.native}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">{line.romaji}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">{line.english}</p>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Words traditionally avoided on a nengajo</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Avoid
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Write instead
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Why
                </th>
              </tr>
            </thead>
            <tbody>
              {IMIKOTOBA.map(([avoid, instead, why]) => (
                <tr key={avoid} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{avoid}</td>
                  <td className="py-2 pr-3">{instead}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational guidance on customary usage. If the recipient&rsquo;s family has had a
        bereavement during the year they will normally have sent a mochu notice, and no nengajo
        should be sent — a kanchu-mimai after 8 January is the usual alternative.
      </p>
    </main>
  );
}
