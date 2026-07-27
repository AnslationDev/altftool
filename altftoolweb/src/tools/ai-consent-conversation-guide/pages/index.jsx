"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Handshake, RotateCcw } from "lucide-react";
import {
  AUDIENCES,
  INVOLVEMENT_LEVELS,
  MODIFIERS,
  TONE_OPTIONS,
  buildDisclosurePlan,
} from "../lib";

const DEFAULTS = {
  recipient: "Priya",
  work: "the launch blog post",
  toolName: "ChatGPT",
  humanWork: "checked every fact and rewrote the opening myself",
  involvement: "drafting",
  audience: "client",
  tone: "plain",
  modifiers: ["confidential"],
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [recipient, setRecipient] = useState(DEFAULTS.recipient);
  const [work, setWork] = useState(DEFAULTS.work);
  const [toolName, setToolName] = useState(DEFAULTS.toolName);
  const [humanWork, setHumanWork] = useState(DEFAULTS.humanWork);
  const [involvement, setInvolvement] = useState(DEFAULTS.involvement);
  const [audience, setAudience] = useState(DEFAULTS.audience);
  const [tone, setTone] = useState(DEFAULTS.tone);
  const [modifiers, setModifiers] = useState(DEFAULTS.modifiers);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      buildDisclosurePlan({
        recipient,
        work,
        toolName,
        humanWork,
        involvement,
        audience,
        tone,
        modifiers,
      }),
    [recipient, work, toolName, humanWork, involvement, audience, tone, modifiers],
  );

  const hasError = Boolean(plan.error);
  const dash = "—";

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(plan.script);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setRecipient(DEFAULTS.recipient);
    setWork(DEFAULTS.work);
    setToolName(DEFAULTS.toolName);
    setHumanWork(DEFAULTS.humanWork);
    setInvolvement(DEFAULTS.involvement);
    setAudience(DEFAULTS.audience);
    setTone(DEFAULTS.tone);
    setModifiers(DEFAULTS.modifiers);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Handshake className="h-4 w-4" aria-hidden="true" />
          AI disclosure
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          AI Consent Conversation Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Describe how AI was involved and who the work is going to. You get a disclosure tier —
          from nothing needed to formal sign-off — plus a script you can send as it stands.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="disc-recipient">
              Who are you telling?
            </label>
            <input
              id="disc-recipient"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="disc-work">
              What is the work?
            </label>
            <input
              id="disc-work"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={work}
              onChange={(event) => setWork(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="disc-involvement">
              How was the AI used?
            </label>
            <select
              id="disc-involvement"
              className={`mt-2 ${INPUT_CLASS}`}
              value={involvement}
              onChange={(event) => setInvolvement(event.target.value)}
            >
              {INVOLVEMENT_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="disc-audience">
              Who receives it?
            </label>
            <select
              id="disc-audience"
              className={`mt-2 ${INPUT_CLASS}`}
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
            >
              {AUDIENCES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="disc-tool">
              Tool used (optional)
            </label>
            <input
              id="disc-tool"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={toolName}
              onChange={(event) => setToolName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="disc-tone">
              Tone
            </label>
            <select
              id="disc-tone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tone}
              onChange={(event) => setTone(event.target.value)}
            >
              {TONE_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="disc-human">
              What did you personally do? (optional)
            </label>
            <input
              id="disc-human"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="checked every fact and rewrote the opening myself"
              value={humanWork}
              onChange={(event) => setHumanWork(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Anything else true here?</h2>
        <div className="mt-3 grid gap-2">
          {MODIFIERS.map((item) => (
            <label
              key={item.id}
              htmlFor={`mod-${item.id}`}
              className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm transition hover:border-[var(--primary)]"
            >
              <input
                id={`mod-${item.id}`}
                type="checkbox"
                className="mt-1 h-4 w-4 accent-[var(--primary)]"
                checked={modifiers.includes(item.id)}
                onChange={() =>
                  setModifiers((list) =>
                    list.includes(item.id)
                      ? list.filter((entry) => entry !== item.id)
                      : [...list, item.id],
                  )
                }
              />
              <span className="font-medium">{item.label}</span>
            </label>
          ))}
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Disclosure needed
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {hasError ? dash : plan.tier.label}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? dash : plan.tier.action}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the disclosure script"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy script"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Disclosure score", hasError ? dash : `${plan.score} of a possible ${plan.maxScore}`],
            ["AI involvement", hasError ? dash : plan.level.label],
            ["Audience", hasError ? dash : plan.audience.label],
            ["Aggravating factors", hasError ? dash : String(plan.activeModifiers.length)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && plan.obligations.length > 0 && (
          <div className="mt-5">
            <h2 className="text-sm font-semibold">What this triggers</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
              {plan.obligations.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        )}

        {!hasError && (
          <div className="mt-5">
            <h2 className="text-sm font-semibold">Before you send</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
              {plan.checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {!hasError && (
          <div className="mt-5">
            <h2 className="text-sm font-semibold">Your script</h2>
            <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-xs leading-5">
              {plan.script}
            </pre>
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational guidance, not legal advice. Your contract, employer policy and sector rules
        come first — where a filing, a regulator or a client agreement is involved, have the wording
        checked by someone qualified.
      </p>
    </main>
  );
}
