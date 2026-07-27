"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Dumbbell, RotateCcw } from "lucide-react";

import {
  CHANNELS,
  LANGUAGES,
  PROMPT_KINDS,
  TONES,
  buildGymPrompt,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN");
const DASH = "—";

const DEFAULTS = {
  gymName: "Iron Yard Fitness",
  city: "Pune",
  audience: "first-time lifters aged 22 to 32 who work desk jobs nearby",
  offer: "a three-month strength membership with two intro sessions",
  price: "12000",
  days: "90",
  kind: "membership-offer",
  channel: "whatsapp",
  tone: "direct",
  language: "hinglish",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [gymName, setGymName] = useState(DEFAULTS.gymName);
  const [city, setCity] = useState(DEFAULTS.city);
  const [audience, setAudience] = useState(DEFAULTS.audience);
  const [offer, setOffer] = useState(DEFAULTS.offer);
  const [price, setPrice] = useState(DEFAULTS.price);
  const [days, setDays] = useState(DEFAULTS.days);
  const [kind, setKind] = useState(DEFAULTS.kind);
  const [channel, setChannel] = useState(DEFAULTS.channel);
  const [tone, setTone] = useState(DEFAULTS.tone);
  const [language, setLanguage] = useState(DEFAULTS.language);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildGymPrompt({
        gymName,
        city,
        audience,
        offer,
        priceInr: Number(price),
        durationDays: Number(days),
        kind,
        channel,
        tone,
        language,
      }),
    [gymName, city, audience, offer, price, days, kind, channel, tone, language],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setGymName(DEFAULTS.gymName);
    setCity(DEFAULTS.city);
    setAudience(DEFAULTS.audience);
    setOffer(DEFAULTS.offer);
    setPrice(DEFAULTS.price);
    setDays(DEFAULTS.days);
    setKind(DEFAULTS.kind);
    setChannel(DEFAULTS.channel);
    setTone(DEFAULTS.tone);
    setLanguage(DEFAULTS.language);
    setCopied(false);
  };

  const rows = [
    ["Words in the prompt", hasError ? DASH : NUM.format(result.wordCount)],
    ["Message type", hasError ? DASH : result.kind.label],
    [
      "Copy limit for this channel",
      hasError ? DASH : result.channel.limit ? `${NUM.format(result.channel.limit)} characters` : "None",
    ],
    ["Offer cost per day", hasError || result.perDay === 0 ? DASH : INR.format(result.perDay)],
    [
      "Monthly equivalent",
      hasError || result.perMonth === 0 ? DASH : INR.format(result.perMonth),
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Dumbbell className="h-4 w-4" aria-hidden="true" />
          Gym marketing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Gym Marketing Prompt Pack
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn your gym details into a structured prompt that already carries the channel character
          limit and the real per-day and per-month cost of the package, so the copy you get back
          cannot quietly invent a price.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gym-name">
              Gym or studio name
            </label>
            <input
              id="gym-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={gymName}
              onChange={(event) => setGymName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gym-city">
              City or locality
            </label>
            <input
              id="gym-city"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={city}
              onChange={(event) => setCity(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="gym-audience">
            Who is this message for?
          </label>
          <textarea
            id="gym-audience"
            className={`mt-2 ${AREA_CLASS}`}
            rows={2}
            value={audience}
            onChange={(event) => setAudience(event.target.value)}
          />
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="gym-offer">
            What is being sold or described?
          </label>
          <textarea
            id="gym-offer"
            className={`mt-2 ${AREA_CLASS}`}
            rows={2}
            value={offer}
            onChange={(event) => setOffer(event.target.value)}
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gym-price">
              Package price (INR, 0 if not quoting one)
            </label>
            <input
              id="gym-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gym-days">
              Package length (days)
            </label>
            <input
              id="gym-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="1095"
              step="1"
              value={days}
              onChange={(event) => setDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gym-kind">
              Message type
            </label>
            <select
              id="gym-kind"
              className={`mt-2 ${INPUT_CLASS}`}
              value={kind}
              onChange={(event) => setKind(event.target.value)}
            >
              {PROMPT_KINDS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gym-channel">
              Channel
            </label>
            <select
              id="gym-channel"
              className={`mt-2 ${INPUT_CLASS}`}
              value={channel}
              onChange={(event) => setChannel(event.target.value)}
            >
              {CHANNELS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gym-tone">
              Tone
            </label>
            <select
              id="gym-tone"
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
            <label className={LABEL_CLASS} htmlFor="gym-language">
              Language
            </label>
            <select
              id="gym-language"
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
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Prompt length
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.charCount)} chars`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the fields above to build a prompt."
                : `Ready to paste into any chat assistant`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated prompt"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset every field"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
          <pre className="whitespace-pre-wrap break-words p-3 font-mono text-xs leading-6 text-[var(--foreground)] sm:text-sm">
            {hasError ? DASH : result.prompt}
          </pre>
        </div>

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.channel.limitNote}
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Always read the generated copy before sending it. Marketing messages sent to Indian mobile
        numbers must follow your operator and DLT registration rules, and WhatsApp template messages
        need approval before the first send.
      </p>
    </main>
  );
}
