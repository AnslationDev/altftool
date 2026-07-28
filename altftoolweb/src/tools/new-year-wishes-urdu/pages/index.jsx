"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MoonStar, RotateCcw } from "lucide-react";

import {
  NAME_MAX_LENGTH,
  OCCASIONS,
  RELATIONSHIPS,
  SCRIPTS,
  TONES,
  buildWishes,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const DEFAULTS = {
  occasionId: "gregorian",
  toneId: "all",
  relationshipId: "family",
  script: "native",
  recipientName: "Ayesha",
  senderName: "Faisal",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md px-3 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

export default function ToolHome() {
  const [occasionId, setOccasionId] = useState(DEFAULTS.occasionId);
  const [toneId, setToneId] = useState(DEFAULTS.toneId);
  const [relationshipId, setRelationshipId] = useState(DEFAULTS.relationshipId);
  const [script, setScript] = useState(DEFAULTS.script);
  const [recipientName, setRecipientName] = useState(DEFAULTS.recipientName);
  const [senderName, setSenderName] = useState(DEFAULTS.senderName);
  const [selectedId, setSelectedId] = useState("");
  const [copiedId, setCopiedId] = useState("");

  const result = useMemo(
    () =>
      buildWishes({
        occasionId,
        toneId,
        relationshipId,
        script,
        recipientName,
        senderName,
      }),
    [occasionId, toneId, relationshipId, script, recipientName, senderName],
  );

  const featured = result.error
    ? null
    : result.items.find((item) => item.id === selectedId) || result.items[0];

  const occasionNote = (OCCASIONS.find((item) => item.id === occasionId) || {}).note || "";

  const copyText = async (id, text) => {
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
    setOccasionId(DEFAULTS.occasionId);
    setToneId(DEFAULTS.toneId);
    setRelationshipId(DEFAULTS.relationshipId);
    setScript(DEFAULTS.script);
    setRecipientName(DEFAULTS.recipientName);
    setSenderName(DEFAULTS.senderName);
    setSelectedId("");
    setCopiedId("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MoonStar className="h-4 w-4" aria-hidden="true" />
          Naya saal mubarak
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Urdu New Year Wishes</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          January and Hijri new year messages in Urdu script and Roman Urdu, with the English
          meaning and the exact SMS length of every message.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="nyu-occasion">
              Occasion
            </label>
            <select
              id="nyu-occasion"
              className={`mt-2 ${INPUT_CLASS}`}
              value={occasionId}
              onChange={(event) => {
                setOccasionId(event.target.value);
                setSelectedId("");
              }}
            >
              {OCCASIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nyu-tone">
              Tone
            </label>
            <select
              id="nyu-tone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={toneId}
              onChange={(event) => {
                setToneId(event.target.value);
                setSelectedId("");
              }}
            >
              {TONES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nyu-relationship">
              Who is it for
            </label>
            <select
              id="nyu-relationship"
              className={`mt-2 ${INPUT_CLASS}`}
              value={relationshipId}
              onChange={(event) => setRelationshipId(event.target.value)}
            >
              {RELATIONSHIPS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nyu-script">
              Script
            </label>
            <select
              id="nyu-script"
              className={`mt-2 ${INPUT_CLASS}`}
              value={script}
              onChange={(event) => setScript(event.target.value)}
            >
              {SCRIPTS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nyu-to">
              Recipient name (optional)
            </label>
            <input
              id="nyu-to"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              maxLength={NAME_MAX_LENGTH + 10}
              value={recipientName}
              onChange={(event) => setRecipientName(event.target.value)}
              placeholder="Ayesha"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nyu-from">
              Your name (optional)
            </label>
            <input
              id="nyu-from"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              maxLength={NAME_MAX_LENGTH + 10}
              value={senderName}
              onChange={(event) => setSenderName(event.target.value)}
              placeholder="Faisal"
            />
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">{occasionNote}</p>
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Characters in this message
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {featured ? NUM.format(featured.characters) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {featured
                ? `${featured.sms.segments} SMS ${featured.sms.segments === 1 ? "part" : "parts"} · ${featured.sms.encoding}`
                : DASH}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copyText("featured", featured ? featured.message : "")}
              aria-label="Copy the selected Urdu new year message"
              className={GHOST_BTN}
            >
              {copiedId === "featured" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copiedId === "featured" ? "Copied!" : "Copy message"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all options"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <p
          dir="auto"
          className="mt-5 whitespace-pre-line rounded-lg bg-[var(--muted)] p-4 text-xl leading-loose"
        >
          {featured ? featured.message : DASH}
        </p>
        {featured ? (
          <p className="mt-2 text-sm italic leading-6 text-[var(--muted-foreground)]">
            {featured.english}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Messages matched", featured ? NUM.format(result.count) : DASH],
            ["Words", featured ? NUM.format(featured.words) : DASH],
            ["Tone", featured ? featured.toneLabel : DASH],
            ["SMS alphabet", featured ? featured.sms.encoding : DASH],
            [
              "Billable units",
              featured
                ? `${NUM.format(featured.sms.units)} of ${NUM.format(featured.sms.perSegment)} per part`
                : DASH,
            ],
            ["SMS parts", featured ? NUM.format(featured.sms.segments) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {featured ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">All matching messages</h2>
          <ul className="mt-3 space-y-3">
            {result.items.map((item) => (
              <li
                key={item.id}
                className={`rounded-lg border p-4 ${
                  item.id === featured.id ? "border-[var(--primary)]" : "border-[var(--border)]"
                }`}
              >
                <p dir="auto" className="whitespace-pre-line text-base leading-loose">
                  {item.message}
                </p>
                <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                  {item.english}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[var(--muted)] px-2.5 py-1 text-xs font-semibold text-[var(--muted-foreground)]">
                    {item.toneLabel}
                  </span>
                  <span className="rounded-full bg-[var(--muted)] px-2.5 py-1 text-xs font-semibold text-[var(--muted-foreground)]">
                    {NUM.format(item.characters)} chars · {item.sms.segments} SMS
                  </span>
                  <button type="button" onClick={() => setSelectedId(item.id)} className={CHIP_BTN}>
                    Feature this
                  </button>
                  <button
                    type="button"
                    onClick={() => copyText(item.id, item.message)}
                    aria-label={`Copy this ${item.toneLabel.toLowerCase()} message`}
                    className={CHIP_BTN}
                  >
                    {copiedId === item.id ? "Copied!" : "Copy"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Roman Urdu has no single official spelling standard, so adjust the transliteration to what
        your contacts use. SMS lengths follow the 3GPP 140-byte payload rule, so Urdu script is
        billed at 70 characters per part while plain Roman text gets 160.
      </p>
    </main>
  );
}
