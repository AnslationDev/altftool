"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Heart, RotateCcw, Shuffle } from "lucide-react";

import {
  LANGUAGES,
  MAX_MESSAGES,
  TONES,
  WHATSAPP_STATUS_LIMIT,
  generateMothersDayMessages,
  secondSundayOfMay,
  variantCountFor,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  languageId: "en",
  toneId: "heartfelt",
  address: "",
  senderName: "",
  count: "3",
  seed: 1,
  year: "2026",
};

const EM_DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copiedId, setCopiedId] = useState("");

  const setField = (key) => (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [key]: value }));
    setCopiedId("");
  };

  const result = useMemo(() => generateMothersDayMessages(form), [form]);
  const failed = Boolean(result.error);
  const available = variantCountFor(form.languageId, form.toneId);
  const dateThisYear = useMemo(() => secondSundayOfMay(form.year), [form.year]);

  const shuffle = () => {
    setForm((current) => ({ ...current, seed: (Number(current.seed) || 0) + 1 }));
    setCopiedId("");
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopiedId("");
  };

  const copy = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(""), 1500);
    } catch {
      setCopiedId("");
    }
  };

  const copyAll = async () => {
    if (failed) return;
    await copy("all", result.messages.map((item) => item.text).join("\n\n---\n\n"));
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Heart className="h-4 w-4" aria-hidden="true" />
          Greeting messages
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Mothers Day Message Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Twenty languages, four tones — a one-liner, a heartfelt message, a full card or an
          understated version that skips the &ldquo;I love you&rdquo; line. Punctuation follows each
          language&apos;s own convention.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="md-language">
              Language
            </label>
            <select
              id="md-language"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.languageId}
              onChange={setField("languageId")}
            >
              {LANGUAGES.map((language) => (
                <option key={language.id} value={language.id}>
                  {language.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="md-tone">
              Tone
            </label>
            <select id="md-tone" className={`mt-2 ${INPUT_CLASS}`} value={form.toneId} onChange={setField("toneId")}>
              {TONES.map((tone) => (
                <option key={tone.id} value={tone.id}>
                  {tone.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="md-address">
              What you call her (optional)
            </label>
            <input
              id="md-address"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="Amma, Aai, Mummy…"
              value={form.address}
              onChange={setField("address")}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Leave blank to use the standard word in the chosen language.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="md-sender">
              Sign off as (optional)
            </label>
            <input
              id="md-sender"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.senderName}
              onChange={setField("senderName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="md-count">
              How many messages
            </label>
            <input
              id="md-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={String(Math.min(MAX_MESSAGES, available || MAX_MESSAGES))}
              step="1"
              value={form.count}
              onChange={setField("count")}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {available} distinct messages available for this combination.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="md-year">
              Year (to look up the date)
            </label>
            <input
              id="md-year"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1900"
              max="2100"
              step="1"
              value={form.year}
              onChange={setField("year")}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {dateThisYear
                ? `Second Sunday of May: ${dateThisYear}`
                : "Enter a four-digit year between 1900 and 2100."}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={shuffle} aria-label="Shuffle to different messages" className={PRIMARY_BTN}>
            <Shuffle className="h-4 w-4" aria-hidden="true" />
            Shuffle
          </button>
          <button
            type="button"
            onClick={copyAll}
            disabled={failed}
            aria-label="Copy every generated message"
            className={`${GHOST_BTN} disabled:opacity-50`}
          >
            {copiedId === "all" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copiedId === "all" ? "Copied!" : "Copy all"}
          </button>
          <button type="button" onClick={reset} aria-label="Reset all options" className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      {failed ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Greeting used
        </p>
        <p className="mt-1 text-2xl font-semibold leading-snug text-[var(--primary)] sm:text-3xl">
          {failed ? EM_DASH : result.greetingUsed}
        </p>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Language", failed ? EM_DASH : result.language.label],
            ["Tone", failed ? EM_DASH : result.tone.label],
            ["Addressed as", failed || !result.addressUsed ? EM_DASH : result.addressUsed],
            ["Longest message", failed ? EM_DASH : `${result.longestLength} characters`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed ? (
        <section className="mt-6 space-y-4">
          {result.messages.map((item, index) => (
            <article key={item.id} className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Message {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => copy(item.id, item.text)}
                  aria-label={`Copy message ${index + 1}`}
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
              <p className="mt-3 whitespace-pre-wrap break-words text-base leading-7">{item.text}</p>
              <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                {item.length} characters ·{" "}
                <span className={item.fitsOneSms ? "text-[var(--success)]" : undefined}>
                  {item.smsSegments} SMS {item.smsSegments === 1 ? "segment" : "segments"} (
                  {item.isUnicode ? "Unicode, 70 per segment" : "GSM-7, 160 per segment"})
                </span>{" "}
                · {item.fitsWhatsAppStatus ? "fits" : "too long for"} a WhatsApp status (
                {WHATSAPP_STATUS_LIMIT} characters)
              </p>
            </article>
          ))}
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Mother&apos;s Day falls on the second Sunday of May in India, the United States and most of
        Europe, but the United Kingdom and Ireland mark Mothering Sunday during Lent, much of the
        Arab world uses 21 March, and Indonesia&apos;s Hari Ibu is 22 December.
      </p>
    </main>
  );
}
