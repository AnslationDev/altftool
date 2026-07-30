"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PartyPopper, RotateCcw, Shuffle, Volume2 } from "lucide-react";

import {
  ACCENTS,
  GENDERS,
  LANGUAGE,
  MAX_MESSAGES,
  MAX_YEAR,
  MIN_YEAR,
  OCCASIONS,
  REGISTERS,
  RELATIONSHIPS,
  TONES,
  generateSpanishNewYearWishes,
  nextSeed,
} from "../lib";

const DEFAULTS = {
  name: "Lucía",
  senderName: "",
  relationshipId: "friend",
  register: "auto",
  gender: "x",
  occasionId: "ano-nuevo",
  tone: "any",
  count: "3",
  year: "2027",
  accent: "latam",
  showPronunciation: true,
  showPlain: false,
  seed: 5,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-60";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECKBOX_LABEL =
  "flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)]";

const DASH = "—";

const toInt = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isInteger(value) ? value : NaN;
};

export default function ToolHome() {
  const [name, setName] = useState(DEFAULTS.name);
  const [senderName, setSenderName] = useState(DEFAULTS.senderName);
  const [relationshipId, setRelationshipId] = useState(DEFAULTS.relationshipId);
  const [register, setRegister] = useState(DEFAULTS.register);
  const [gender, setGender] = useState(DEFAULTS.gender);
  const [occasionId, setOccasionId] = useState(DEFAULTS.occasionId);
  const [tone, setTone] = useState(DEFAULTS.tone);
  const [count, setCount] = useState(DEFAULTS.count);
  const [year, setYear] = useState(DEFAULTS.year);
  const [accent, setAccent] = useState(DEFAULTS.accent);
  const [showPronunciation, setShowPronunciation] = useState(DEFAULTS.showPronunciation);
  const [showPlain, setShowPlain] = useState(DEFAULTS.showPlain);
  const [seed, setSeed] = useState(DEFAULTS.seed);
  const [copiedId, setCopiedId] = useState("");

  const result = useMemo(
    () =>
      generateSpanishNewYearWishes({
        name,
        senderName,
        relationshipId,
        register,
        gender,
        occasionId,
        tone,
        count: toInt(count),
        year: toInt(year),
        seed,
        accent,
      }),
    [name, senderName, relationshipId, register, gender, occasionId, tone, count, year, seed, accent],
  );

  const hasError = Boolean(result.error);
  const messages = hasError ? [] : result.messages;
  const featured = messages[0] || null;

  const blockFor = (item) => {
    const parts = [item.full];
    if (showPronunciation) parts.push(`[${item.pronunciation}]`);
    parts.push(item.fullEnglish);
    return parts.join("\n\n");
  };

  const allText = useMemo(
    () => messages.map(blockFor).join("\n\n———\n\n"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [messages, showPronunciation],
  );

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
    setSenderName(DEFAULTS.senderName);
    setRelationshipId(DEFAULTS.relationshipId);
    setRegister(DEFAULTS.register);
    setGender(DEFAULTS.gender);
    setOccasionId(DEFAULTS.occasionId);
    setTone(DEFAULTS.tone);
    setCount(DEFAULTS.count);
    setYear(DEFAULTS.year);
    setAccent(DEFAULTS.accent);
    setShowPronunciation(DEFAULTS.showPronunciation);
    setShowPlain(DEFAULTS.showPlain);
    setSeed(DEFAULTS.seed);
    setCopiedId("");
  };

  const details = hasError
    ? [
        ["Address form", DASH],
        ["Salutation", DASH],
        ["Sign-off", DASH],
        ["Wordings available", DASH],
        ["SMS length", DASH],
      ]
    : [
        ["Address form", `${result.pronoun} (${result.number})`],
        ["Salutation", result.greeting.es],
        ["Sign-off", result.closing.es.split("\n")[0]],
        ["Wordings available", `${result.delivered} of ${result.poolSize} that fit`],
        [
          "SMS length",
          featured
            ? `${featured.sms.units} ${featured.sms.encoding} units · ${featured.sms.segments} SMS`
            : DASH,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PartyPopper className="h-4 w-4" aria-hidden="true" />
          {LANGUAGE.nativeName}
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Spanish New Year Wishes Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Every wording is written out four times — for tú, usted, vosotros and ustedes — because
          the pronoun, the object clitic and the verb ending all move together. Each message comes
          with a pronunciation guide, an English meaning and its SMS length.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="es-name">
              Their name (optional)
            </label>
            <input
              id="es-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Lucía"
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="es-relationship">
              Who is it for?
            </label>
            <select
              id="es-relationship"
              className={`mt-2 ${INPUT_CLASS}`}
              value={relationshipId}
              onChange={(event) => setRelationshipId(event.target.value)}
            >
              {RELATIONSHIPS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="es-register">
              Address form
            </label>
            <select
              id="es-register"
              className={`mt-2 ${INPUT_CLASS}`}
              value={register}
              onChange={(event) => setRegister(event.target.value)}
            >
              <option value="auto">Automatic (match the relationship)</option>
              {REGISTERS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="es-gender">
              Grammatical gender
            </label>
            <select
              id="es-gender"
              className={`mt-2 ${INPUT_CLASS}`}
              value={gender}
              onChange={(event) => setGender(event.target.value)}
            >
              {GENDERS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="es-occasion">
              Occasion
            </label>
            <select
              id="es-occasion"
              className={`mt-2 ${INPUT_CLASS}`}
              value={occasionId}
              onChange={(event) => setOccasionId(event.target.value)}
            >
              {OCCASIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="es-tone">
              Tone
            </label>
            <select
              id="es-tone"
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
            <label className={LABEL_CLASS} htmlFor="es-year">
              Which year
            </label>
            <input
              id="es-year"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_YEAR}
              max={MAX_YEAR}
              value={year}
              onChange={(event) => setYear(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="es-count">
              How many messages
            </label>
            <select
              id="es-count"
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

          <div>
            <label className={LABEL_CLASS} htmlFor="es-sender">
              Sign it from (optional)
            </label>
            <input
              id="es-sender"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={senderName}
              onChange={(event) => setSenderName(event.target.value)}
              placeholder="Your name"
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="es-accent">
              Pronunciation guide
            </label>
            <select
              id="es-accent"
              className={`mt-2 ${INPUT_CLASS}`}
              value={accent}
              onChange={(event) => setAccent(event.target.value)}
            >
              {ACCENTS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <label className={CHECKBOX_LABEL} htmlFor="es-pron">
            <input
              id="es-pron"
              type="checkbox"
              checked={showPronunciation}
              onChange={(event) => setShowPronunciation(event.target.checked)}
              className="h-5 w-5 accent-[var(--primary)]"
            />
            Show pronunciation
          </label>
          <label className={CHECKBOX_LABEL} htmlFor="es-plain">
            <input
              id="es-plain"
              type="checkbox"
              checked={showPlain}
              onChange={(event) => setShowPlain(event.target.checked)}
              className="h-5 w-5 accent-[var(--primary)]"
            />
            Show SMS-safe version
          </label>
          <button type="button" onClick={() => setSeed(nextSeed(seed))} className={GHOST_BTN}>
            <Shuffle className="h-4 w-4" aria-hidden="true" />
            Other wordings
          </button>
          <button type="button" onClick={reset} aria-label="Reset all fields" className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Your message
            </p>
            <p className="mt-1 whitespace-pre-line text-2xl font-semibold leading-snug text-[var(--primary)] sm:text-3xl">
              {featured ? featured.spanish : DASH}
            </p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              {featured ? featured.english : DASH}
            </p>
          </div>
          <button
            type="button"
            onClick={() => copy(allText, "all")}
            aria-label="Copy every generated Spanish New Year message"
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
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {details.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {result.registerOverridden
              ? `For a ${result.relationship.label.toLowerCase()}, Spanish speakers would normally use ${
                  REGISTERS.find((item) => item.id === result.autoRegister)?.pronoun
                }. ${result.registerNote}`
              : result.registerNote}
          </p>
        ) : null}
      </section>

      {messages.length > 0 ? (
        <section className="mt-6 space-y-3">
          {messages.map((item) => (
            <article
              key={item.id}
              className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-[var(--muted)] px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {item.toneLabel} · {result.pronoun} · {item.sms.segments} SMS
                </span>
                <button
                  type="button"
                  onClick={() => copy(blockFor(item), item.id)}
                  aria-label="Copy this Spanish New Year message"
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

              <p className="mt-3 whitespace-pre-line text-lg leading-8">{item.full}</p>

              {showPronunciation ? (
                <p className="mt-3 flex gap-2 whitespace-pre-line border-t border-[var(--border)] pt-3 text-sm text-[var(--muted-foreground)]">
                  <Volume2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{item.pronunciation}</span>
                </p>
              ) : null}

              <p className="mt-3 whitespace-pre-line border-t border-[var(--border)] pt-3 text-sm text-[var(--muted-foreground)]">
                {item.fullEnglish}
              </p>

              {showPlain && item.plainDiffers ? (
                <div className="mt-3 border-t border-[var(--border)] pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    SMS-safe · {item.smsPlain.units} {item.smsPlain.encoding} units ·{" "}
                    {item.smsPlain.segments} SMS
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm text-[var(--muted-foreground)]">
                    {item.plain}
                  </p>
                </div>
              ) : null}
            </article>
          ))}
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Spanish ñ, é, ü, ¡ and ¿ are all in the GSM 03.38 alphabet, but á, í, ó and ú are not — one
        of them pushes the whole message to UCS-2, cutting a single SMS from 160 characters to 70.
        The SMS-safe version drops only those four accents and never touches ñ, because "ano" and
        "año" are different words. WhatsApp and other data apps have no such limit.
      </p>
    </main>
  );
}
