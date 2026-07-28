"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Shuffle, UserRound } from "lucide-react";

import {
  MAX_MESSAGES,
  RELATIONSHIPS,
  TONES,
  WHATSAPP_STATUS_LIMIT,
  fathersDayJune,
  fathersDaySeptember,
  generateFathersDayMessages,
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
  toneId: "heartfelt",
  relationshipId: "dad",
  address: "",
  senderName: "",
  includeRelationshipLine: true,
  count: "3",
  seed: 1,
  year: "2026",
};

const EM_DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copiedId, setCopiedId] = useState("");

  const setField = (key) => (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    setForm((current) => ({ ...current, [key]: value }));
    setCopiedId("");
  };

  const result = useMemo(() => generateFathersDayMessages(form), [form]);
  const failed = Boolean(result.error);
  const available = variantCountFor(form.toneId, form.relationshipId);
  const juneDate = useMemo(() => fathersDayJune(form.year), [form.year]);
  const septemberDate = useMemo(() => fathersDaySeptember(form.year), [form.year]);

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
          <UserRound className="h-4 w-4" aria-hidden="true" />
          Greeting messages
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Fathers Day Message Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Heartfelt, funny, proud or a short caption — written for a dad, father-in-law,
          grandfather, stepdad, partner, mentor, or a father you are remembering.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fd-relationship">
              Who is it for?
            </label>
            <select
              id="fd-relationship"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.relationshipId}
              onChange={setField("relationshipId")}
            >
              {RELATIONSHIPS.map((relationship) => (
                <option key={relationship.id} value={relationship.id}>
                  {relationship.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fd-tone">
              Tone
            </label>
            <select id="fd-tone" className={`mt-2 ${INPUT_CLASS}`} value={form.toneId} onChange={setField("toneId")}>
              {TONES.map((tone) => (
                <option key={tone.id} value={tone.id}>
                  {tone.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fd-address">
              What you call him (optional)
            </label>
            <input
              id="fd-address"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="Dad, Papa, Appa, Baba…"
              value={form.address}
              onChange={setField("address")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fd-sender">
              Sign off as (optional)
            </label>
            <input
              id="fd-sender"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.senderName}
              onChange={setField("senderName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fd-count">
              How many messages
            </label>
            <input
              id="fd-count"
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
            <label className={LABEL_CLASS} htmlFor="fd-year">
              Year (to look up the date)
            </label>
            <input
              id="fd-year"
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
              {juneDate
                ? `India, US, UK: ${juneDate} · Australia and NZ: ${septemberDate}`
                : "Enter a four-digit year between 1900 and 2100."}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <input
            id="fd-relline"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={form.includeRelationshipLine}
            onChange={setField("includeRelationshipLine")}
          />
          <label className="text-sm text-[var(--muted-foreground)]" htmlFor="fd-relline">
            Include the line written specifically for this relationship
          </label>
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
          Opening line
        </p>
        <p className="mt-1 text-2xl font-semibold leading-snug text-[var(--primary)] sm:text-3xl">
          {failed ? EM_DASH : result.greetingUsed}
        </p>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Written for", failed ? EM_DASH : result.relationship.label],
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
                  {item.smsSegments} SMS {item.smsSegments === 1 ? "segment" : "segments"}
                </span>{" "}
                · {item.fitsWhatsAppStatus ? "fits" : "too long for"} a WhatsApp status (
                {WHATSAPP_STATUS_LIMIT} characters)
              </p>
            </article>
          ))}
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Father&apos;s Day is the third Sunday of June in India, the US, the UK and much of Asia; the
        first Sunday of September in Australia and New Zealand; and 19 March in Italy, Spain and
        Portugal.
      </p>
    </main>
  );
}
