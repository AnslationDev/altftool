"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, Handshake, RotateCcw } from "lucide-react";
import { COMPONENTS, MAX_FIELD_LENGTH, SOURCE, TONES, composeApology } from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const DASH = "—";

const ALL_IDS = COMPONENTS.map((c) => c.id);

const DEFAULTS = {
  recipient: "Priya",
  sender: "Rohan",
  tone: "sincere",
  what: "missing the deadline on the Sharma report",
  impact: "you had to stay back on Friday to cover it",
  cause: "I underestimated the review time and did not flag it early",
  change: "I will send you a status note every Wednesday",
  repair: "I have taken the next two sections myself and they are already done",
};

const FIELDS = [
  {
    id: "what",
    label: "What are you apologising for",
    placeholder: "missing the deadline on the Sharma report",
    required: true,
  },
  {
    id: "impact",
    label: "What did it cost them",
    placeholder: "you had to stay back on Friday to cover it",
    required: false,
  },
  {
    id: "cause",
    label: "What went wrong (factual, not a defence)",
    placeholder: "I underestimated the review time and did not flag it early",
    required: false,
  },
  {
    id: "change",
    label: "What you will do differently",
    placeholder: "I will send you a status note every Wednesday",
    required: false,
  },
  {
    id: "repair",
    label: "How you will put it right",
    placeholder: "I have taken the next two sections myself",
    required: false,
  },
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [recipient, setRecipient] = useState(DEFAULTS.recipient);
  const [sender, setSender] = useState(DEFAULTS.sender);
  const [tone, setTone] = useState(DEFAULTS.tone);
  const [values, setValues] = useState({
    what: DEFAULTS.what,
    impact: DEFAULTS.impact,
    cause: DEFAULTS.cause,
    change: DEFAULTS.change,
    repair: DEFAULTS.repair,
  });
  const [include, setInclude] = useState(ALL_IDS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => composeApology({ recipient, sender, tone, include, ...values }),
    [recipient, sender, tone, include, values],
  );

  const hasError = Boolean(result.error);

  const toggle = (id) => {
    setInclude((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  };

  const setField = (id, value) => {
    setValues((current) => ({ ...current, [id]: value }));
  };

  const copy = async () => {
    if (hasError || !result.text) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setRecipient(DEFAULTS.recipient);
    setSender(DEFAULTS.sender);
    setTone(DEFAULTS.tone);
    setValues({
      what: DEFAULTS.what,
      impact: DEFAULTS.impact,
      cause: DEFAULTS.cause,
      change: DEFAULTS.change,
      repair: DEFAULTS.repair,
    });
    setInclude(ALL_IDS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Handshake className="h-4 w-4" aria-hidden="true" />
          Six-component apology
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Apology Message Composer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build an apology from the six components research identifies as effective — regret,
          responsibility, explanation, repentance, repair and a request for forgiveness — and get
          warned about phrasing that quietly cancels it.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ap-recipient">
              Who are you apologising to
            </label>
            <input
              id="ap-recipient"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={recipient}
              placeholder="Priya"
              onChange={(event) => setRecipient(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ap-sender">
              Your name
            </label>
            <input
              id="ap-sender"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={sender}
              placeholder="Rohan"
              onChange={(event) => setSender(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ap-tone">
              Tone
            </label>
            <select
              id="ap-tone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tone}
              onChange={(event) => setTone(event.target.value)}
            >
              {TONES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {FIELDS.map((field) => (
            <div key={field.id} className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor={`ap-${field.id}`}>
                {field.label}
                {field.required ? " (required)" : ""}
              </label>
              <textarea
                id={`ap-${field.id}`}
                className="mt-2 min-h-[72px] w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                value={values[field.id]}
                maxLength={MAX_FIELD_LENGTH}
                placeholder={field.placeholder}
                onChange={(event) => setField(field.id, event.target.value)}
              />
            </div>
          ))}
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Parts to include</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {COMPONENTS.map((component) => (
              <label
                key={component.id}
                className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                htmlFor={`ap-inc-${component.id}`}
              >
                <input
                  id={`ap-inc-${component.id}`}
                  type="checkbox"
                  className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={include.includes(component.id)}
                  onChange={() => toggle(component.id)}
                />
                <span>
                  <span className="font-semibold">{component.label}</span>
                  <span className="block text-xs text-[var(--muted-foreground)]">
                    {component.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className={GHOST_BTN}
            onClick={() => setInclude(ALL_IDS)}
            aria-label="Include every apology component"
          >
            Select all parts
          </button>
          <button type="button" className={PRIMARY_BTN} onClick={reset} aria-label="Reset all fields">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Completeness score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.score)}/${NUM.format(result.maxScore)}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fill in the required fields to compose the apology."
                : `${result.included.length} of ${COMPONENTS.length} parts present · ${result.wordCount} words`}
            </p>
          </div>
          <button
            type="button"
            className={GHOST_BTN}
            onClick={copy}
            aria-label="Copy the apology message"
            disabled={hasError}
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy apology"}
          </button>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {COMPONENTS.map((component) => {
            const present = !hasError && result.included.some((c) => c.id === component.id);
            const gap = hasError ? null : result.missing.find((m) => m.id === component.id);
            return (
              <div
                key={component.id}
                className="flex items-start justify-between gap-4 py-2.5"
              >
                <dt className="text-[var(--muted-foreground)]">
                  {component.label}
                  {component.weight > 0 && (
                    <span className="ml-2 text-xs">({component.weight} pts)</span>
                  )}
                </dt>
                <dd className="text-right font-semibold">
                  {hasError ? DASH : present ? "Included" : (gap?.reason ?? "Missing")}
                </dd>
              </div>
            );
          })}
        </dl>

        <p className="mt-4 text-xs text-[var(--muted-foreground)]">
          Component list from {SOURCE}. The point weights are our own, derived from the ranking
          reported in that work — responsibility highest, repair next, forgiveness lowest.
        </p>
      </section>

      {!hasError && result.warnings.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--danger)]">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            Phrasing that weakens the apology
          </h2>
          <ul className="mt-3 grid gap-3">
            {result.warnings.map((warning) => (
              <li
                key={warning.id}
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
              >
                <span className="font-semibold">{warning.label}</span>
                <span className="mt-1 block">{warning.why}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your apology</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7">{result.text}</p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything runs in your browser and nothing you type is sent anywhere. This is writing help,
        not legal advice — if the incident could have legal or disciplinary consequences, get advice
        before you put an admission in writing.
      </p>
    </main>
  );
}
