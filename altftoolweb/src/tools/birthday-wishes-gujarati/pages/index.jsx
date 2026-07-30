"use client";

import { useMemo, useState } from "react";
import { Cake, Check, Copy, RotateCcw, Shuffle } from "lucide-react";

import {
  LANGUAGE,
  MAX_MESSAGES,
  REGISTERS,
  RELATIONSHIPS,
  TONES,
  generateGujaratiBirthdayWishes,
  nextSeed,
} from "../lib";

const DEFAULTS = {
  name: "મીરા",
  relationshipId: "friend",
  register: "auto",
  tone: "any",
  count: "3",
  senderName: "",
  showRoman: true,
  seed: 5,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-60";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const REGISTER_LABEL = {
  respectful: "તમે — respectful",
  casual: "તું — familiar",
};

const toInt = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isInteger(value) ? value : NaN;
};

export default function ToolHome() {
  const [name, setName] = useState(DEFAULTS.name);
  const [relationshipId, setRelationshipId] = useState(DEFAULTS.relationshipId);
  const [register, setRegister] = useState(DEFAULTS.register);
  const [tone, setTone] = useState(DEFAULTS.tone);
  const [count, setCount] = useState(DEFAULTS.count);
  const [senderName, setSenderName] = useState(DEFAULTS.senderName);
  const [showRoman, setShowRoman] = useState(DEFAULTS.showRoman);
  const [seed, setSeed] = useState(DEFAULTS.seed);
  const [copiedId, setCopiedId] = useState("");

  const request = useMemo(
    () => ({
      name,
      relationshipId,
      tone,
      count: toInt(count),
      seed,
      senderName,
    }),
    [name, relationshipId, tone, count, seed, senderName],
  );

  const result = useMemo(
    () => generateGujaratiBirthdayWishes({ ...request, register }),
    [request, register],
  );

  // The same seed and tone give the same wording order in either register, so the
  // opposite-register run lines up by template id and can be shown side by side.
  const otherRegister = result.error
    ? ""
    : result.register === "respectful"
      ? "casual"
      : "respectful";

  const otherByTemplate = useMemo(() => {
    if (!otherRegister) return {};
    const alt = generateGujaratiBirthdayWishes({ ...request, register: otherRegister });
    if (alt.error) return {};
    return Object.fromEntries(alt.messages.map((item) => [item.id, item]));
  }, [request, otherRegister]);

  const hasError = Boolean(result.error);
  const messages = hasError ? [] : result.messages;
  const featured = messages[0] || null;

  const asText = (item) => (showRoman ? `${item.full}\n\n(${item.fullRoman})` : item.full);

  const allText = useMemo(() => {
    if (hasError) return "";
    return messages.map(asText).join("\n\n———\n\n");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasError, messages, showRoman]);

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
    setRelationshipId(DEFAULTS.relationshipId);
    setRegister(DEFAULTS.register);
    setTone(DEFAULTS.tone);
    setCount(DEFAULTS.count);
    setSenderName(DEFAULTS.senderName);
    setShowRoman(DEFAULTS.showRoman);
    setSeed(DEFAULTS.seed);
    setCopiedId("");
  };

  const details = hasError
    ? [
        ["Pronoun used", DASH],
        ["Greeting line", DASH],
        ["Sign-off", DASH],
        ["Wordings available", DASH],
        ["SMS length", DASH],
      ]
    : [
        [
          "Pronoun used",
          `${REGISTERS.find((item) => item.id === result.register)?.pronoun || DASH} (${result.register})`,
        ],
        ["Greeting line", result.salutation.native],
        ["Sign-off", result.closing.native],
        ["Wordings available", `${result.delivered} of ${result.poolSize} matching wordings`],
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
          <Cake className="h-4 w-4" aria-hidden="true" />
          {LANGUAGE.nativeName}
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Gujarati Birthday Wishes Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick the relationship and the tone. Every wording is written out separately for તમે and
          તું, so the possessive and the verb ending are right — with romanisation, an English
          meaning and the SMS length.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gu-name">
              Their name (optional)
            </label>
            <input
              id="gu-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="મીરા"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gu-relationship">
              Who is it for?
            </label>
            <select
              id="gu-relationship"
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
            <label className={LABEL_CLASS} htmlFor="gu-register">
              Politeness
            </label>
            <select
              id="gu-register"
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
            <label className={LABEL_CLASS} htmlFor="gu-tone">
              Tone
            </label>
            <select
              id="gu-tone"
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
            <label className={LABEL_CLASS} htmlFor="gu-count">
              How many messages
            </label>
            <select
              id="gu-count"
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
            <label className={LABEL_CLASS} htmlFor="gu-sender">
              Sign it from (optional)
            </label>
            <input
              id="gu-sender"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={senderName}
              onChange={(event) => setSenderName(event.target.value)}
              placeholder="Your name"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
            htmlFor="gu-roman"
          >
            <input
              id="gu-roman"
              type="checkbox"
              checked={showRoman}
              onChange={(event) => setShowRoman(event.target.checked)}
              className="h-5 w-5 accent-[var(--primary)]"
            />
            Show romanised Gujarati
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
            <p className="mt-1 text-2xl font-semibold leading-snug text-[var(--primary)] sm:text-3xl">
              {featured ? featured.native : DASH}
            </p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              {featured ? featured.english : DASH}
            </p>
          </div>
          <button
            type="button"
            onClick={() => copy(allText, "all")}
            aria-label="Copy every generated Gujarati birthday message"
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

        {!hasError && result.registerOverridden ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            For a {result.relationship.label.toLowerCase()}, Gujarati speakers would usually use the{" "}
            {result.autoRegister === "respectful" ? "તમે" : "તું"} form.
          </p>
        ) : null}
      </section>

      {messages.length > 0 ? (
        <section className="mt-6 space-y-3">
          {messages.map((item) => {
            const alt = otherByTemplate[item.id];
            return (
              <article
                key={item.id}
                className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-[var(--muted)] px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    {item.tone} · {item.sms.segments} SMS
                  </span>
                  <button
                    type="button"
                    onClick={() => copy(asText(item), item.id)}
                    aria-label="Copy this Gujarati birthday message"
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

                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {REGISTER_LABEL[result.register]}
                </p>
                <p className="mt-1 whitespace-pre-line text-lg leading-8">{item.full}</p>

                {showRoman ? (
                  <p className="mt-3 whitespace-pre-line border-t border-[var(--border)] pt-3 text-sm text-[var(--muted-foreground)]">
                    {item.fullRoman}
                  </p>
                ) : null}

                <p className="mt-3 border-t border-[var(--border)] pt-3 text-sm text-[var(--muted-foreground)]">
                  {item.english}
                </p>

                {alt && alt.native !== item.native ? (
                  <div className="mt-3 border-t border-[var(--border)] pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                      Same wish in the other register · {REGISTER_LABEL[otherRegister]}
                    </p>
                    <p className="mt-1 text-base leading-7">{alt.native}</p>
                    {showRoman ? (
                      <p className="mt-1 text-sm text-[var(--muted-foreground)]">{alt.roman}</p>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Gujarati script is sent over SMS as UCS-2, which allows 70 characters in a single message and
        67 per part after that — so a long Gujarati wish can cost two or three SMS. WhatsApp and
        other data messaging apps have no such limit.
      </p>
    </main>
  );
}
