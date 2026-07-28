"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Shuffle, Sun } from "lucide-react";

import {
  ANY_DAY,
  AUDIENCES,
  CHHATH_DAYS,
  FESTIVAL_FACTS,
  LANGUAGES,
  MAX_MESSAGES,
  generateWishes,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  language: "bhojpuri",
  audience: "family",
  day: "sandhyaArghya",
  recipient: "",
  sender: "",
  count: "2",
  seed: 1,
};

export default function ToolHome() {
  const [language, setLanguage] = useState(DEFAULTS.language);
  const [audience, setAudience] = useState(DEFAULTS.audience);
  const [day, setDay] = useState(DEFAULTS.day);
  const [recipient, setRecipient] = useState(DEFAULTS.recipient);
  const [sender, setSender] = useState(DEFAULTS.sender);
  const [count, setCount] = useState(DEFAULTS.count);
  const [seed, setSeed] = useState(DEFAULTS.seed);
  const [copiedId, setCopiedId] = useState("");

  const result = useMemo(
    () =>
      generateWishes({
        language,
        audience,
        day,
        recipientName: recipient,
        senderName: sender,
        count: count === "" ? Number.NaN : Number(count),
        seed,
      }),
    [language, audience, day, recipient, sender, count, seed],
  );

  const featured = result.error ? null : result.messages[0];
  const rest = result.error ? [] : result.messages.slice(1);
  const bundle = result.error ? "" : result.messages.map((item) => item.text).join("\n\n");
  const dayInfo = result.error ? null : result.dayInfo;

  const copy = async (id, text) => {
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
    setLanguage(DEFAULTS.language);
    setAudience(DEFAULTS.audience);
    setDay(DEFAULTS.day);
    setRecipient(DEFAULTS.recipient);
    setSender(DEFAULTS.sender);
    setCount(DEFAULTS.count);
    setSeed(DEFAULTS.seed);
    setCopiedId("");
  };

  const languageLabel = LANGUAGES.find((item) => item.id === language)?.label ?? "—";
  const audienceLabel = AUDIENCES.find((item) => item.id === audience)?.label ?? "—";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Sun className="h-4 w-4" aria-hidden="true" />
          Chhath · {FESTIVAL_FACTS.totalDays} days
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Chhath Puja Wishes Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Chhath runs four days and each one has its own ritual. Pick the day you are writing on and
          get a greeting that names it, in Bhojpuri, Maithili, Hindi or English.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cp-day">
              Which day?
            </label>
            <select
              id="cp-day"
              className={`mt-2 ${INPUT_CLASS}`}
              value={day}
              onChange={(event) => setDay(event.target.value)}
            >
              <option value={ANY_DAY}>Any day of the festival</option>
              {CHHATH_DAYS.map((item) => (
                <option key={item.id} value={item.id}>
                  Day {item.day} — {item.label} ({item.tithi})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cp-language">
              Language
            </label>
            <select
              id="cp-language"
              className={`mt-2 ${INPUT_CLASS}`}
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              {LANGUAGES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} ({item.native})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cp-audience">
              Who is it for?
            </label>
            <select
              id="cp-audience"
              className={`mt-2 ${INPUT_CLASS}`}
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
            >
              {AUDIENCES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cp-count">
              How many messages (1-{MAX_MESSAGES})
            </label>
            <input
              id="cp-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_MESSAGES}
              step="1"
              value={count}
              onChange={(event) => setCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cp-recipient">
              Their name (optional)
            </label>
            <input
              id="cp-recipient"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              placeholder="Sunita"
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cp-sender">
              Sign off as (optional)
            </label>
            <input
              id="cp-sender"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              placeholder="Manoj"
              value={sender}
              onChange={(event) => setSender(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSeed((value) => value + 1)}
            className={GHOST_BTN}
            aria-label="Shuffle to a different set of greetings"
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

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Your Chhath greeting
          </p>
          <button
            type="button"
            onClick={() => copy("bundle", bundle)}
            aria-label="Copy every generated greeting"
            className={PRIMARY_BTN}
            disabled={!bundle}
          >
            {copiedId === "bundle" ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copiedId === "bundle" ? "Copied!" : "Copy all"}
          </button>
        </div>

        <p className="mt-3 whitespace-pre-line text-xl font-semibold leading-8 text-[var(--primary)] sm:text-2xl">
          {featured ? featured.text : "—"}
        </p>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Day",
              result.error ? "—" : dayInfo ? `Day ${dayInfo.day} — ${dayInfo.label}` : "Any day",
            ],
            ["Tithi", result.error || !dayInfo ? "—" : `Kartika shukla ${dayInfo.tithi}`],
            ["Language", result.error ? "—" : languageLabel],
            ["Written for", result.error ? "—" : audienceLabel],
            ["Messages ready", result.error ? "—" : NUM.format(result.messages.length)],
            [
              "Characters / SMS parts",
              result.error
                ? "—"
                : `${NUM.format(featured.characters)} · ${NUM.format(featured.smsSegments)} (${featured.encoding})`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {dayInfo ? (
          <p className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--muted-foreground)]">
            {dayInfo.ritual}.
          </p>
        ) : null}
      </section>

      {rest.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">More wordings</h2>
          <ul className="mt-3 space-y-3">
            {rest.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
              >
                <p className="whitespace-pre-line text-sm leading-6">{item.text}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {NUM.format(item.characters)} characters · {NUM.format(item.smsSegments)} SMS
                    part{item.smsSegments === 1 ? "" : "s"}
                  </span>
                  <button
                    type="button"
                    onClick={() => copy(item.id, item.text)}
                    aria-label="Copy this greeting"
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
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The four days of Chhath</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[360px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Day
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Name
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Tithi
                </th>
                <th scope="col" className="py-2 font-semibold">
                  What happens
                </th>
              </tr>
            </thead>
            <tbody>
              {CHHATH_DAYS.map((item) => (
                <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{item.day}</td>
                  <td className="py-2 pr-3">{item.label}</td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{item.tithi}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{item.ritual}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-4 flex flex-wrap gap-2">
          {FESTIVAL_FACTS.prasad.map((item) => (
            <li
              key={item}
              className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)]"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Chhath runs from {FESTIVAL_FACTS.startTithi} to {FESTIVAL_FACTS.endTithi}, in{" "}
        {FESTIVAL_FACTS.gregorianWindow}, and is kept mainly in {FESTIVAL_FACTS.regions}. A second
        observance, {FESTIVAL_FACTS.secondObservance}, is smaller. The nirjala vrat runs about{" "}
        {FESTIVAL_FACTS.fastHours} hours; anyone with a medical condition should speak to a doctor
        before attempting it.
      </p>
    </main>
  );
}
