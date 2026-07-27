"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Headset, RotateCcw } from "lucide-react";

import {
  CHANNELS,
  MAX_TARGET_GRADE,
  MIN_TARGET_GRADE,
  SUPPORT_TASKS,
  TONES,
  buildSupportPrompt,
} from "../lib";

const INT = new Intl.NumberFormat("en-US");
const DEC1 = new Intl.NumberFormat("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const DEC2 = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-32 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  taskId: "tone-soften",
  channelId: "email",
  toneId: "warm",
  targetGrade: "8",
  product: "",
  policyNotes: "Returns window is 30 days from delivery. Store credit can be offered up to the order value.",
  draft:
    "Unfortunately we are unable to process your refund request, as the order in question was delivered more than thirty days ago and consequently falls outside the window stipulated in our returns policy. Please do not hesitate to let us know should there be anything further with which we may assist you.",
};

export default function ToolHome() {
  const [taskId, setTaskId] = useState(DEFAULTS.taskId);
  const [draft, setDraft] = useState(DEFAULTS.draft);
  const [channelId, setChannelId] = useState(DEFAULTS.channelId);
  const [toneId, setToneId] = useState(DEFAULTS.toneId);
  const [targetGrade, setTargetGrade] = useState(DEFAULTS.targetGrade);
  const [policyNotes, setPolicyNotes] = useState(DEFAULTS.policyNotes);
  const [product, setProduct] = useState(DEFAULTS.product);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildSupportPrompt({
        taskId,
        draft,
        channelId,
        toneId,
        targetGrade: targetGrade.trim() === "" ? Number.NaN : Number(targetGrade),
        policyNotes,
        product,
      }),
    [taskId, draft, channelId, toneId, targetGrade, policyNotes, product],
  );

  const read = result.readability;

  const copyResult = async () => {
    if (result.error || !result.prompt) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setTaskId(DEFAULTS.taskId);
    setDraft(DEFAULTS.draft);
    setChannelId(DEFAULTS.channelId);
    setToneId(DEFAULTS.toneId);
    setTargetGrade(DEFAULTS.targetGrade);
    setPolicyNotes(DEFAULTS.policyNotes);
    setProduct(DEFAULTS.product);
    setCopied(false);
  };

  const stat = (value) => (result.error ? DASH : value);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Headset className="h-4 w-4" aria-hidden="true" />
          Support writing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Customer Support Prompt Pack</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste a draft reply, macro or set of ticket notes. The tool scores it with the Flesch
          reading-ease and Flesch-Kincaid grade formulas, then builds a rewrite prompt that carries
          your channel limit, tone and reading target into any AI chat.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">What are you writing?</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {SUPPORT_TASKS.map((item) => {
              const active = item.id === taskId;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setTaskId(item.id);
                    setCopied(false);
                  }}
                  className={`min-h-11 rounded-md border px-3 py-2 text-left text-sm transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                    active
                      ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  <span className="block font-semibold text-[var(--foreground)]">{item.label}</span>
                  <span className="mt-0.5 block text-xs leading-5">{item.blurb}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-5">
          <label className={LABEL_CLASS} htmlFor="support-draft">
            Draft reply or ticket notes
          </label>
          <textarea
            id="support-draft"
            className={`mt-2 ${TEXTAREA_CLASS}`}
            rows={6}
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setCopied(false);
            }}
          />
        </div>

        <div className="mt-5">
          <label className={LABEL_CLASS} htmlFor="support-policy">
            Policy and facts the reply may rely on (optional)
          </label>
          <textarea
            id="support-policy"
            className={`mt-2 ${TEXTAREA_CLASS}`}
            rows={3}
            placeholder="Refund window, what you are authorised to offer, SLA times"
            value={policyNotes}
            onChange={(event) => {
              setPolicyNotes(event.target.value);
              setCopied(false);
            }}
          />
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="support-channel">
              Channel
            </label>
            <select
              id="support-channel"
              className={`mt-2 ${INPUT_CLASS}`}
              value={channelId}
              onChange={(event) => {
                setChannelId(event.target.value);
                setCopied(false);
              }}
            >
              {CHANNELS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} ({item.cap} chars)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="support-tone">
              Tone
            </label>
            <select
              id="support-tone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={toneId}
              onChange={(event) => {
                setToneId(event.target.value);
                setCopied(false);
              }}
            >
              {TONES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="support-grade">
              Target reading grade ({MIN_TARGET_GRADE}-{MAX_TARGET_GRADE})
            </label>
            <input
              id="support-grade"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_TARGET_GRADE}
              max={MAX_TARGET_GRADE}
              step="1"
              value={targetGrade}
              onChange={(event) => {
                setTargetGrade(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="support-product">
              Product or team name (optional)
            </label>
            <input
              id="support-product"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="Acme Billing"
              value={product}
              onChange={(event) => {
                setProduct(event.target.value);
                setCopied(false);
              }}
            />
          </div>
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Draft reading grade
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {stat(DEC1.format(read ? read.grade : 0))}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {stat(read ? `${read.bandLabel} — ${read.bandNote}` : "")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the generated customer support rewrite prompt"
              className={GHOST_BTN}
              disabled={Boolean(result.error)}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Flesch reading ease", stat(read ? DEC1.format(read.readingEase) : "")],
            ["Target grade", stat(INT.format(result.targetGrade || 0))],
            [
              "Gap to target",
              stat(result.gradeGap >= 0 ? `+${DEC1.format(result.gradeGap || 0)}` : DEC1.format(result.gradeGap || 0)),
            ],
            ["Words / sentences", stat(read ? `${INT.format(read.wordCount)} / ${INT.format(read.sentenceCount)}` : "")],
            ["Average words per sentence", stat(read ? DEC1.format(read.wordsPerSentence) : "")],
            ["Average syllables per word", stat(read ? DEC2.format(read.syllablesPerWord) : "")],
            [
              "Draft length vs channel cap",
              stat(
                read
                  ? `${INT.format(read.charCount)} / ${INT.format(result.channelCap)} chars${result.draftOverCap ? " (over)" : ""}`
                  : "",
              ),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {result.error ? null : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your rewrite prompt</h2>
          <div className="mt-3 overflow-x-auto">
            <pre className="min-w-0 whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)]">
              {result.prompt}
            </pre>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Readability scores measure sentence and word length only — they cannot tell you whether the
        reply is accurate or kind. Check every rewritten reply against your own policy before it
        reaches a customer.
      </p>
    </main>
  );
}
