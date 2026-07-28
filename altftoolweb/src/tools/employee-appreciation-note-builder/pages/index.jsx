"use client";

import { useMemo, useState } from "react";
import { Award, Check, Copy, RotateCcw } from "lucide-react";

import {
  CHANNELS,
  STRENGTHS,
  TIMELY_WINDOW_DAYS,
  buildAppreciationNote,
} from "../lib";

const INPUT =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  name: "Meera",
  situation: "During the Friday release, when the payment gateway started timing out at 6pm",
  behaviour:
    "you stayed on the call, reproduced the failure in staging and wrote the rollback script yourself",
  impact:
    "checkout was back up in 40 minutes and we avoided roughly 300 failed orders over the weekend",
  eventDate: "2026-07-24",
  today: "2026-07-28",
  channelId: "oneonone",
  strengthId: "ownership",
  senderName: "Arjun",
  closing: "You also wrote it up, so the next person will not start from zero",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(() => buildAppreciationNote(form), [form]);
  const failed = Boolean(result.error);

  const selectedChannel = CHANNELS.find((item) => item.id === form.channelId) || CHANNELS[0];

  const copy = async () => {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(result.note);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Award className="h-4 w-4" aria-hidden="true" />
          Recognition
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Employee Appreciation Note Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Praise that names a situation, an observed behaviour and a measurable impact — the
          Situation-Behaviour-Impact model — instead of another &quot;great job, team&quot;.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="ea-name">
              Who you are thanking
            </label>
            <input id="ea-name" className={`mt-2 ${INPUT}`} value={form.name} onChange={setField("name")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ea-channel">
              Where it will be sent
            </label>
            <select id="ea-channel" className={`mt-2 ${INPUT}`} value={form.channelId} onChange={setField("channelId")}>
              {CHANNELS.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
              {selectedChannel.guidance}
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="ea-situation">
              Situation — when and where it happened
            </label>
            <textarea id="ea-situation" rows={2} className={`mt-2 ${AREA}`} value={form.situation} onChange={setField("situation")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="ea-behaviour">
              Behaviour — what you saw them do
            </label>
            <textarea id="ea-behaviour" rows={2} className={`mt-2 ${AREA}`} value={form.behaviour} onChange={setField("behaviour")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="ea-impact">
              Impact — what changed, with a number if you have one
            </label>
            <textarea id="ea-impact" rows={2} className={`mt-2 ${AREA}`} value={form.impact} onChange={setField("impact")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ea-event">
              Date it happened
            </label>
            <input id="ea-event" type="date" className={`mt-2 ${INPUT}`} value={form.eventDate} onChange={setField("eventDate")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ea-today">
              Date you are sending it
            </label>
            <input id="ea-today" type="date" className={`mt-2 ${INPUT}`} value={form.today} onChange={setField("today")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ea-strength">
              Strength this shows
            </label>
            <select id="ea-strength" className={`mt-2 ${INPUT}`} value={form.strengthId} onChange={setField("strengthId")}>
              {STRENGTHS.map((strength) => (
                <option key={strength.id} value={strength.id}>
                  {strength.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="ea-sender">
              Your name
            </label>
            <input id="ea-sender" className={`mt-2 ${INPUT}`} value={form.senderName} onChange={setField("senderName")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="ea-closing">
              Optional closing line
            </label>
            <input id="ea-closing" className={`mt-2 ${INPUT}`} value={form.closing} onChange={setField("closing")} />
          </div>
        </div>
      </section>

      {failed && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Specificity score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${result.score}/${result.scoreMax}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fill in all three SBI parts above."
                : `${result.wordCount} words · ${result.daysSinceEvent} days after the event`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copy}
              aria-label="Copy the appreciation note"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Channel", failed ? DASH : result.channelLabel],
            ["Target length", failed ? DASH : `${result.minWords}–${result.maxWords} words`],
            ["Event date", failed ? DASH : result.eventDateLabel],
            [
              "Timeliness",
              failed ? DASH : result.isTimely ? `Within ${TIMELY_WINDOW_DAYS} days` : `${result.daysSinceEvent} days late`,
            ],
            ["Measurable impact", failed ? DASH : result.impactHasMetric ? "Yes" : "No number found"],
            [
              "Vague praise words",
              failed ? DASH : result.vagueWordsFound.length ? result.vagueWordsFound.join(", ") : "None",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold break-words">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Your note</h2>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-words rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6">
              {result.note}
            </pre>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Checks</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {result.checklist.map((item) => (
                <li key={item.label} className="flex items-start gap-2">
                  <span
                    aria-hidden="true"
                    className={
                      item.ok
                        ? "mt-0.5 inline-block h-4 w-4 shrink-0 rounded-full bg-[var(--success)]"
                        : "mt-0.5 inline-block h-4 w-4 shrink-0 rounded-full border border-[var(--border)] bg-[var(--muted)]"
                    }
                  />
                  <span className={item.ok ? "" : "text-[var(--muted-foreground)]"}>
                    {item.label}
                    <span className="sr-only">{item.ok ? " — passed" : " — not met"}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The SBI model in one line each</h2>
        <dl className="mt-3 space-y-3 text-sm">
          <div>
            <dt className="font-semibold">Situation</dt>
            <dd className="text-[var(--muted-foreground)]">
              Anchor the moment — the release, the client call, the Tuesday standup. Without it the
              praise could be about anyone.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Behaviour</dt>
            <dd className="text-[var(--muted-foreground)]">
              What you actually observed, in verbs. &quot;You rewrote the runbook&quot; is a
              behaviour; &quot;you are dependable&quot; is a trait.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Impact</dt>
            <dd className="text-[var(--muted-foreground)]">
              What changed for a person, a customer or a number. This is the part people remember
              and repeat in a performance review.
            </dd>
          </div>
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Written recognition is not a substitute for pay, promotion or workload changes. If the same
        person keeps rescuing releases, the note should be followed by a conversation about why.
      </p>
    </main>
  );
}
