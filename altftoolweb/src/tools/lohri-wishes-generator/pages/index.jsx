"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Flame, RotateCcw, Shuffle } from "lucide-react";

import {
  FESTIVAL_FACTS,
  LANGUAGES,
  MAX_MESSAGES,
  OCCASIONS,
  daysUntilLohri,
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
  language: "punjabiGurmukhi",
  occasion: "family",
  recipient: "",
  sender: "",
  count: "3",
  seed: 1,
};

export default function ToolHome() {
  const [language, setLanguage] = useState(DEFAULTS.language);
  const [occasion, setOccasion] = useState(DEFAULTS.occasion);
  const [recipient, setRecipient] = useState(DEFAULTS.recipient);
  const [sender, setSender] = useState(DEFAULTS.sender);
  const [count, setCount] = useState(DEFAULTS.count);
  const [seed, setSeed] = useState(DEFAULTS.seed);
  const [refDate, setRefDate] = useState("");
  const [copiedId, setCopiedId] = useState("");

  // Set on the client only, so the server-rendered markup and the first client
  // render agree.
  useEffect(() => {
    const now = new Date();
    const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate(),
    ).padStart(2, "0")}`;
    setRefDate(iso);
  }, []);

  const result = useMemo(
    () =>
      generateWishes({
        language,
        occasion,
        recipientName: recipient,
        senderName: sender,
        count: count === "" ? Number.NaN : Number(count),
        seed,
      }),
    [language, occasion, recipient, sender, count, seed],
  );

  const countdown = useMemo(() => (refDate ? daysUntilLohri(refDate) : null), [refDate]);

  const featured = result.error ? null : result.messages[0];
  const rest = result.error ? [] : result.messages.slice(1);
  const bundle = result.error ? "" : result.messages.map((item) => item.text).join("\n\n");

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
    setOccasion(DEFAULTS.occasion);
    setRecipient(DEFAULTS.recipient);
    setSender(DEFAULTS.sender);
    setCount(DEFAULTS.count);
    setSeed(DEFAULTS.seed);
    setCopiedId("");
  };

  const languageLabel = LANGUAGES.find((item) => item.id === language)?.label ?? "—";
  const occasionLabel = OCCASIONS.find((item) => item.id === occasion)?.label ?? "—";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Flame className="h-4 w-4" aria-hidden="true" />
          Lohri · {FESTIVAL_FACTS.date}
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Lohri Wishes Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Gurmukhi, Roman Punjabi, Hindi and English wordings — including the special first Lohri of
          a newborn and of a newly married couple.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lh-language">
              Language
            </label>
            <select
              id="lh-language"
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
            <label className={LABEL_CLASS} htmlFor="lh-occasion">
              Occasion
            </label>
            <select
              id="lh-occasion"
              className={`mt-2 ${INPUT_CLASS}`}
              value={occasion}
              onChange={(event) => setOccasion(event.target.value)}
            >
              {OCCASIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lh-recipient">
              Their name (optional)
            </label>
            <input
              id="lh-recipient"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              placeholder="Jasleen"
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lh-sender">
              Sign off as (optional)
            </label>
            <input
              id="lh-sender"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              placeholder="Bua"
              value={sender}
              onChange={(event) => setSender(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lh-count">
              How many messages (1-{MAX_MESSAGES})
            </label>
            <input
              id="lh-count"
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
            <label className={LABEL_CLASS} htmlFor="lh-date">
              Count down from
            </label>
            <input
              id="lh-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={refDate}
              onChange={(event) => setRefDate(event.target.value)}
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

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        role="status"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Your Lohri greeting
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
            ["Language", result.error ? "—" : languageLabel],
            ["Occasion", result.error ? "—" : occasionLabel],
            ["Messages ready", result.error ? "—" : NUM.format(result.messages.length)],
            ["Wordings available for this pair", result.error ? "—" : NUM.format(result.available)],
            [
              "Characters / SMS parts",
              result.error
                ? "—"
                : `${NUM.format(featured.characters)} · ${NUM.format(featured.smsSegments)} (${featured.encoding})`,
            ],
            [
              "Next Lohri",
              !countdown || countdown.error
                ? "—"
                : `${countdown.lohriDate} · ${NUM.format(countdown.daysAway)} day${countdown.daysAway === 1 ? "" : "s"} away`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {countdown && countdown.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {countdown.error}
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
        <h2 className="text-base font-semibold">What goes into the fire</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {FESTIVAL_FACTS.prasad.map((item) => (
            <li
              key={item}
              className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)]"
            >
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
          Lohri is a solar-calendar festival, so it sits on {FESTIVAL_FACTS.date} almost every year
          and is followed by {FESTIVAL_FACTS.nextDay}. It marks the {FESTIVAL_FACTS.season}.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Because Lohri follows the solar year rather than the lunar one, the date barely drifts —
        but the traditional songs remembering {FESTIVAL_FACTS.folkFigure} vary by district, so check
        with family before printing anything on an invitation.
      </p>
    </main>
  );
}
