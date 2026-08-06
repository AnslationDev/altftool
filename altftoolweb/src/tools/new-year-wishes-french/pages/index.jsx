"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PartyPopper, RotateCcw, Shuffle } from "lucide-react";

import {
  ADDRESS_FORMS,
  GENDERS,
  MAX_MESSAGES,
  MAX_YEAR,
  MIN_YEAR,
  RECIPIENTS,
  TIMINGS,
  TONES,
  generateFrenchNewYearWishes,
  nextSeed,
} from "../lib";

const DEFAULTS = {
  name: "Camille",
  gender: "feminine",
  recipientId: "colleague",
  address: "auto",
  timing: "after",
  tone: "any",
  year: "2027",
  count: "3",
  senderName: "",
  seed: 7,
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
  const [gender, setGender] = useState(DEFAULTS.gender);
  const [recipientId, setRecipientId] = useState(DEFAULTS.recipientId);
  const [address, setAddress] = useState(DEFAULTS.address);
  const [timing, setTiming] = useState(DEFAULTS.timing);
  const [tone, setTone] = useState(DEFAULTS.tone);
  const [year, setYear] = useState(DEFAULTS.year);
  const [count, setCount] = useState(DEFAULTS.count);
  const [senderName, setSenderName] = useState(DEFAULTS.senderName);
  const [seed, setSeed] = useState(DEFAULTS.seed);
  const [copiedId, setCopiedId] = useState("");

  const result = useMemo(
    () =>
      generateFrenchNewYearWishes({
        name,
        gender,
        recipientId,
        address,
        timing,
        tone,
        year: toInt(year),
        count: toInt(count),
        seed,
        senderName,
      }),
    [name, gender, recipientId, address, timing, tone, year, count, seed, senderName],
  );

  const isGroup = recipientId === "group";
  const hasError = Boolean(result.error);
  const messages = hasError ? [] : result.messages;
  const featured = messages[0] || null;

  const allText = useMemo(() => {
    if (hasError) return "";
    return messages.map((item) => item.full).join("\n\n———\n\n");
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
    setGender(DEFAULTS.gender);
    setRecipientId(DEFAULTS.recipientId);
    setAddress(DEFAULTS.address);
    setTiming(DEFAULTS.timing);
    setTone(DEFAULTS.tone);
    setYear(DEFAULTS.year);
    setCount(DEFAULTS.count);
    setSenderName(DEFAULTS.senderName);
    setSeed(DEFAULTS.seed);
    setCopiedId("");
  };

  const details = hasError
    ? [
        ["Address form", DASH],
        ["Salutation", DASH],
        ["Sign-off", DASH],
        ["Messages ready", DASH],
        ["Days in the year", DASH],
      ]
    : [
        ["Address form", `${result.pronoun} (${result.recipient.label.toLowerCase()})`],
        ["Salutation", result.salutation],
        ["Sign-off", result.signoff],
        ["Messages ready", `${result.delivered} of ${result.poolSize} matching wordings`],
        ["Days in the year", `${result.days}${result.leapYear ? " (année bissextile)" : ""}`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PartyPopper className="h-4 w-4" aria-hidden="true" />
          Bonne année
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">French New Year Wishes</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick who you are writing to and when you are sending it. Every wording is stored in both
          the tu and the vous form, so the verbs and the cher/chère agreement come out right.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fr-name">
              Their name (optional)
            </label>
            <input
              id="fr-name"
              className={`mt-2 ${INPUT_CLASS} ${isGroup ? "opacity-60" : ""}`}
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Camille"
              disabled={isGroup}
              aria-describedby={isGroup ? "fr-name-hint" : undefined}
            />
            {isGroup ? (
              <p id="fr-name-hint" className="mt-1.5 text-xs text-[var(--muted-foreground)]">
                Group salutations (e.g. &ldquo;Chers tous,&rdquo;) don&rsquo;t address one person by
                name, so this field is ignored while &ldquo;A whole group&rdquo; is selected.
              </p>
            ) : null}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fr-gender">
              Cher or chère
            </label>
            <select
              id="fr-gender"
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
            <label className={LABEL_CLASS} htmlFor="fr-recipient">
              Who is it for?
            </label>
            <select
              id="fr-recipient"
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
            <label className={LABEL_CLASS} htmlFor="fr-address">
              Address form
            </label>
            <select
              id="fr-address"
              className={`mt-2 ${INPUT_CLASS}`}
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            >
              <option value="auto">Automatic (match the relationship)</option>
              {ADDRESS_FORMS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fr-timing">
              When are you sending it?
            </label>
            <select
              id="fr-timing"
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
            <label className={LABEL_CLASS} htmlFor="fr-tone">
              Tone
            </label>
            <select
              id="fr-tone"
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
            <label className={LABEL_CLASS} htmlFor="fr-year">
              Incoming year
            </label>
            <input
              id="fr-year"
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
            <label className={LABEL_CLASS} htmlFor="fr-count">
              How many messages
            </label>
            <select
              id="fr-count"
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
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="fr-sender">
              Sign it from (optional)
            </label>
            <input
              id="fr-sender"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={senderName}
              onChange={(event) => setSenderName(event.target.value)}
              placeholder="Your name"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Your message
            </p>
            <p className="mt-1 whitespace-pre-line text-2xl font-semibold leading-snug text-[var(--primary)] sm:text-3xl">
              {featured ? featured.body : DASH}
            </p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              {featured ? featured.english : DASH}
            </p>
          </div>
          <button
            type="button"
            onClick={() => copy(allText, "all")}
            aria-label="Copy every generated French message"
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
      </section>

      {messages.length > 0 ? (
        <section className="mt-6 space-y-3">
          {messages.map((item) => (
            <article
              key={item.id}
              className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-[var(--muted)] px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {item.tone}
                </span>
                <button
                  type="button"
                  onClick={() => copy(item.full, item.id)}
                  aria-label={`Copy the ${item.tone} message`}
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
              <p className="mt-3 whitespace-pre-line text-base leading-7">{item.full}</p>
              <p className="mt-3 border-t border-[var(--border)] pt-3 text-sm text-[var(--muted-foreground)]">
                {item.english}
              </p>
            </article>
          ))}
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        In France, New Year wishes are exchanged throughout January and are considered late only
        after 31 janvier. Before midnight on 31 December, stay with &ldquo;Bonnes fêtes de fin
        d&rsquo;année&rdquo; — this tool switches the wording for you.
      </p>
    </main>
  );
}
