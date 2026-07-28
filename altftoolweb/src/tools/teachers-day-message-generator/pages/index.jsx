"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, RotateCcw, Shuffle } from "lucide-react";

import {
  LANGUAGES,
  MAX_MESSAGES,
  MESSAGE_TYPES,
  OCCASIONS,
  WHATSAPP_STATUS_LIMIT,
  generateTeachersDayMessages,
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
  typeId: "card",
  occasionId: "india",
  teacherName: "Mrs Iyer",
  senderName: "",
  subject: "",
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

  const result = useMemo(() => generateTeachersDayMessages(form), [form]);
  const failed = Boolean(result.error);
  const available = variantCountFor(form.languageId, form.typeId);

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
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          Greeting messages
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Teachers Day Message Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Short notes, card messages, speech openers and social posts for 5 September and World
          Teachers&apos; Day — in English, Hindi, Marathi, Bengali, Tamil, Telugu, Kannada or Gujarati.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="td-language">
              Language
            </label>
            <select
              id="td-language"
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
            <label className={LABEL_CLASS} htmlFor="td-type">
              Message type
            </label>
            <select id="td-type" className={`mt-2 ${INPUT_CLASS}`} value={form.typeId} onChange={setField("typeId")}>
              {MESSAGE_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="td-occasion">
              Occasion
            </label>
            <select
              id="td-occasion"
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
            <label className={LABEL_CLASS} htmlFor="td-teacher">
              Teacher&apos;s name (optional)
            </label>
            <input
              id="td-teacher"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.teacherName}
              onChange={setField("teacherName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="td-sender">
              Sign off as (optional)
            </label>
            <input
              id="td-sender"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="Aarav, Class 10-B"
              value={form.senderName}
              onChange={setField("senderName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="td-subject">
              Subject taught (optional)
            </label>
            <input
              id="td-subject"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="Physics"
              value={form.subject}
              onChange={setField("subject")}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">Used in the social post only.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="td-count">
              How many messages
            </label>
            <input
              id="td-count"
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
            ["Message type", failed ? EM_DASH : result.type.label],
            ["Messages generated", failed ? EM_DASH : String(result.messages.length)],
            ["Longest message", failed ? EM_DASH : `${result.longestLength} characters`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed ? (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">{result.occasion.note}</p>
        ) : null}
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
        Add one specific memory of your own — a question the teacher answered, a habit they fixed —
        before you send it. That single line is what makes the message theirs rather than generic.
      </p>
    </main>
  );
}
