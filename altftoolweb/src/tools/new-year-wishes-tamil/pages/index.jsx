"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PartyPopper, RotateCcw, Shuffle } from "lucide-react";

import {
  MAX_WISHES,
  OCCASIONS,
  PUTHANDU_USUAL_DATE,
  SCRIPTS,
  TONES,
  WHATSAPP_STATUS_LIMIT,
  generateTamilNewYearWishes,
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
  occasionId: "puthandu",
  toneId: "family",
  script: "tanglish",
  recipientName: "Karthik",
  senderName: "",
  yearName: "",
  count: "3",
  seed: 1,
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

  const result = useMemo(() => generateTamilNewYearWishes(form), [form]);
  const failed = Boolean(result.error);
  const available = variantCountFor(form.occasionId, form.toneId, form.script);

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
    await copy("all", result.wishes.map((wish) => wish.text).join("\n\n---\n\n"));
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PartyPopper className="h-4 w-4" aria-hidden="true" />
          Greeting messages
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Tamil New Year Wishes</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Puthandu greetings for Chithirai 1 (usually {PUTHANDU_USUAL_DATE}) and for 1 January, in
          Tamil script, Tanglish or English — with the recipient&apos;s name inserted and a length check
          before you send.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tny-occasion">
              Occasion
            </label>
            <select
              id="tny-occasion"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.occasionId}
              onChange={setField("occasionId")}
            >
              {OCCASIONS.map((occasion) => (
                <option key={occasion.id} value={occasion.id}>
                  {occasion.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tny-tone">
              Tone
            </label>
            <select id="tny-tone" className={`mt-2 ${INPUT_CLASS}`} value={form.toneId} onChange={setField("toneId")}>
              {TONES.map((tone) => (
                <option key={tone.id} value={tone.id}>
                  {tone.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tny-script">
              Language / script
            </label>
            <select
              id="tny-script"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.script}
              onChange={setField("script")}
            >
              {SCRIPTS.map((script) => (
                <option key={script.id} value={script.id}>
                  {script.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tny-recipient">
              Recipient name (optional)
            </label>
            <input
              id="tny-recipient"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.recipientName}
              onChange={setField("recipientName")}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Not used for short captions, which are written to stand alone.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tny-sender">
              Sign off as (optional)
            </label>
            <input
              id="tny-sender"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.senderName}
              onChange={setField("senderName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tny-year">
              Tamil year name (optional)
            </label>
            <input
              id="tny-year"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="e.g. Vishvavasu"
              value={form.yearName}
              onChange={setField("yearName")}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Used only for Puthandu. The name comes from a 60-year cycle and changes on Chithirai 1.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tny-count">
              How many messages
            </label>
            <input
              id="tny-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={String(Math.min(MAX_WISHES, available || MAX_WISHES))}
              step="1"
              value={form.count}
              onChange={setField("count")}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {available} distinct messages available for this tone and script.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={shuffle} aria-label="Shuffle to a different set of wishes" className={PRIMARY_BTN}>
            <Shuffle className="h-4 w-4" aria-hidden="true" />
            Shuffle
          </button>
          <button
            type="button"
            onClick={copyAll}
            disabled={failed}
            aria-label="Copy every generated wish"
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

      <section aria-live="polite" aria-atomic="true" className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          {!failed && result.tone.id === "status" ? "Occasion (for reference)" : "Greeting used"}
        </p>
        <p className="mt-1 text-2xl font-semibold leading-snug text-[var(--primary)] sm:text-3xl">
          {failed ? EM_DASH : result.tone.id === "status" ? result.occasion.label : result.greetingUsed}
        </p>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Occasion", failed ? EM_DASH : result.occasion.label],
            ["Tone", failed ? EM_DASH : result.tone.label],
            ["Messages generated", failed ? EM_DASH : String(result.wishes.length)],
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
        <section aria-live="polite" className="mt-6 space-y-4">
          {result.wishes.map((wish, index) => (
            <article key={wish.id} className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Message {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => copy(wish.id, wish.text)}
                  aria-label={`Copy message ${index + 1}`}
                  className={GHOST_BTN}
                >
                  {copiedId === wish.id ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copiedId === wish.id ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="mt-3 whitespace-pre-wrap break-words text-base leading-7">{wish.text}</p>
              <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                {wish.length} characters ·{" "}
                <span className={wish.fitsOneSms ? "text-[var(--success)]" : undefined}>
                  {wish.smsSegments} SMS {wish.smsSegments === 1 ? "segment" : "segments"} (
                  {wish.isUnicode ? "Unicode, 70 per segment" : "GSM-7, 160 per segment"})
                </span>{" "}
                · {wish.fitsWhatsAppStatus ? "fits" : "too long for"} a WhatsApp status (
                {WHATSAPP_STATUS_LIMIT} characters)
              </p>
            </article>
          ))}
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Puthandu is set by the sun&apos;s entry into Mesha, so it lands on 14 April in most years and on
        13 or 15 April in others — check a panchangam for the exact date before you schedule messages.
      </p>
    </main>
  );
}
