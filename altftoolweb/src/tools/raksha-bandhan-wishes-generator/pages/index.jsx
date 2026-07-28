"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gift, RotateCcw, Shuffle } from "lucide-react";

import {
  FESTIVAL_FACTS,
  LANGUAGES,
  MAX_MESSAGES,
  RELATIONSHIPS,
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
  language: "hindi",
  relationship: "sisterToBrother",
  recipient: "",
  sender: "",
  count: "3",
  seed: 1,
};

export default function ToolHome() {
  const [language, setLanguage] = useState(DEFAULTS.language);
  const [relationship, setRelationship] = useState(DEFAULTS.relationship);
  const [recipient, setRecipient] = useState(DEFAULTS.recipient);
  const [sender, setSender] = useState(DEFAULTS.sender);
  const [count, setCount] = useState(DEFAULTS.count);
  const [seed, setSeed] = useState(DEFAULTS.seed);
  const [copiedId, setCopiedId] = useState("");

  const result = useMemo(
    () =>
      generateWishes({
        language,
        relationship,
        recipientName: recipient,
        senderName: sender,
        count: count === "" ? Number.NaN : Number(count),
        seed,
      }),
    [language, relationship, recipient, sender, count, seed],
  );

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
    setRelationship(DEFAULTS.relationship);
    setRecipient(DEFAULTS.recipient);
    setSender(DEFAULTS.sender);
    setCount(DEFAULTS.count);
    setSeed(DEFAULTS.seed);
    setCopiedId("");
  };

  const languageLabel = LANGUAGES.find((item) => item.id === language)?.label ?? "—";
  const relationshipLabel =
    RELATIONSHIPS.find((item) => item.id === relationship)?.label ?? "—";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gift className="h-4 w-4" aria-hidden="true" />
          Raksha Bandhan
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Raksha Bandhan Wishes Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick the tie you are writing across — sister to brother, brother to sister, between
          sisters, cousins or a sibling living abroad — and get a rakhi message in six languages.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rb-language">
              Language
            </label>
            <select
              id="rb-language"
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
            <label className={LABEL_CLASS} htmlFor="rb-relationship">
              Who are you writing to?
            </label>
            <select
              id="rb-relationship"
              className={`mt-2 ${INPUT_CLASS}`}
              value={relationship}
              onChange={(event) => setRelationship(event.target.value)}
            >
              {RELATIONSHIPS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rb-recipient">
              Their name (optional)
            </label>
            <input
              id="rb-recipient"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              placeholder="Harjeet"
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rb-sender">
              Sign off as (optional)
            </label>
            <input
              id="rb-sender"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              placeholder="Simran"
              value={sender}
              onChange={(event) => setSender(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rb-count">
              How many messages (1-{MAX_MESSAGES})
            </label>
            <input
              id="rb-count"
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
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSeed((value) => value + 1)}
            className={GHOST_BTN}
            aria-label="Shuffle to a different set of messages"
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
            Your rakhi message
          </p>
          <button
            type="button"
            onClick={() => copy("bundle", bundle)}
            aria-label="Copy every generated message"
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
            ["Relationship", result.error ? "—" : relationshipLabel],
            ["Messages ready", result.error ? "—" : NUM.format(result.messages.length)],
            ["Wordings available for this pair", result.error ? "—" : NUM.format(result.available)],
            ["Characters in this message", result.error ? "—" : NUM.format(featured.characters)],
            [
              "SMS parts",
              result.error ? "—" : `${NUM.format(featured.smsSegments)} (${featured.encoding})`,
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
                    aria-label="Copy this message"
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
        <h2 className="text-base font-semibold">The same full moon, different names</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {FESTIVAL_FACTS.alsoCalled.map((name) => (
            <li
              key={name}
              className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)]"
            >
              {name}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
          Raksha Bandhan falls on {FESTIVAL_FACTS.tithi}, in {FESTIVAL_FACTS.gregorianWindow}. Many
          families tie the rakhi in the {FESTIVAL_FACTS.preferredWindow} window.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Dates follow the luni-solar calendar and shift each year, so confirm the purnima timing and
        the Bhadra window in a panchang before fixing a muhurat.
      </p>
    </main>
  );
}
