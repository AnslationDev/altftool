"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Shuffle, Sunrise } from "lucide-react";

import {
  AUDIENCES,
  FESTIVAL_FACTS,
  GUDI_PARTS,
  MAX_MESSAGES,
  PACHADI_TASTES,
  TRADITIONS,
  generateWishes,
  languagesFor,
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
  tradition: "ugadi",
  language: "telugu",
  audience: "family",
  recipient: "",
  sender: "",
  count: "2",
  seed: 1,
};

export default function ToolHome() {
  const [tradition, setTradition] = useState(DEFAULTS.tradition);
  const [language, setLanguage] = useState(DEFAULTS.language);
  const [audience, setAudience] = useState(DEFAULTS.audience);
  const [recipient, setRecipient] = useState(DEFAULTS.recipient);
  const [sender, setSender] = useState(DEFAULTS.sender);
  const [count, setCount] = useState(DEFAULTS.count);
  const [seed, setSeed] = useState(DEFAULTS.seed);
  const [copiedId, setCopiedId] = useState("");

  const allowedLanguages = useMemo(() => languagesFor(tradition), [tradition]);

  const result = useMemo(
    () =>
      generateWishes({
        tradition,
        language,
        audience,
        recipientName: recipient,
        senderName: sender,
        count: count === "" ? Number.NaN : Number(count),
        seed,
      }),
    [tradition, language, audience, recipient, sender, count, seed],
  );

  const traditionMeta = TRADITIONS.find((item) => item.id === tradition) ?? TRADITIONS[0];
  const featured = result.error ? null : result.messages[0];
  const rest = result.error ? [] : result.messages.slice(1);
  const bundle = result.error ? "" : result.messages.map((item) => item.text).join("\n\n");

  const changeTradition = (nextTradition) => {
    setTradition(nextTradition);
    const next = languagesFor(nextTradition);
    if (!next.some((item) => item.id === language)) {
      setLanguage(next[0].id);
    }
  };

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
    setTradition(DEFAULTS.tradition);
    setLanguage(DEFAULTS.language);
    setAudience(DEFAULTS.audience);
    setRecipient(DEFAULTS.recipient);
    setSender(DEFAULTS.sender);
    setCount(DEFAULTS.count);
    setSeed(DEFAULTS.seed);
    setCopiedId("");
  };

  const languageLabel = allowedLanguages.find((item) => item.id === language)?.label ?? "—";
  const audienceLabel = AUDIENCES.find((item) => item.id === audience)?.label ?? "—";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Sunrise className="h-4 w-4" aria-hidden="true" />
          {FESTIVAL_FACTS.tithi}
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Ugadi and Gudi Padwa Wishes Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          One tithi, two names. Choose Ugadi or Gudi Padwa, pick the language your family actually
          reads, and get a new year greeting sized for WhatsApp or SMS.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ug-tradition">
              Which tradition?
            </label>
            <select
              id="ug-tradition"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tradition}
              onChange={(event) => changeTradition(event.target.value)}
            >
              {TRADITIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} — {item.regions}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ug-language">
              Language
            </label>
            <select
              id="ug-language"
              className={`mt-2 ${INPUT_CLASS}`}
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              {allowedLanguages.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} ({item.native})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ug-audience">
              Who is it for?
            </label>
            <select
              id="ug-audience"
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
            <label className={LABEL_CLASS} htmlFor="ug-count">
              How many messages (1-{MAX_MESSAGES})
            </label>
            <input
              id="ug-count"
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
            <label className={LABEL_CLASS} htmlFor="ug-recipient">
              Their name (optional)
            </label>
            <input
              id="ug-recipient"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              placeholder="Sridevi"
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ug-sender">
              Sign off as (optional)
            </label>
            <input
              id="ug-sender"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              placeholder="Ravi"
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
            Your new year greeting
          </p>
          <button
            type="button"
            onClick={() => copy("bundle", bundle)}
            aria-label={copiedId === "bundle" ? "Copied" : "Copy every generated greeting"}
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
            ["Tradition", result.error ? "—" : traditionMeta.label],
            ["Language", result.error ? "—" : languageLabel],
            ["Written for", result.error ? "—" : audienceLabel],
            ["Messages ready", result.error ? "—" : NUM.format(result.messages.length)],
            ["Wordings available for this pair", result.error ? "—" : NUM.format(result.available)],
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
                    aria-label={copiedId === item.id ? "Copied" : "Copy this greeting"}
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
        <h2 className="text-base font-semibold">The six tastes of Ugadi Pachadi</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Taste
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Ingredient
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Stands for
                </th>
              </tr>
            </thead>
            <tbody>
              {PACHADI_TASTES.map((item) => (
                <tr key={item.taste} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{item.taste}</td>
                  <td className="py-2 pr-3">{item.ingredient}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{item.stands}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="mt-5 text-sm font-semibold">What goes into a gudi</h3>
        <ul className="mt-2 flex flex-wrap gap-2">
          {GUDI_PARTS.map((item) => (
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
        Both festivals fall on {FESTIVAL_FACTS.tithi}, in {FESTIVAL_FACTS.gregorianWindow}. The
        almanac names each year from a repeating cycle of {FESTIVAL_FACTS.samvatsaraCycle}{" "}
        samvatsaras, announced at {FESTIVAL_FACTS.panchangaReading} — check a panchang for the
        current year&apos;s name and date.
      </p>
    </main>
  );
}
