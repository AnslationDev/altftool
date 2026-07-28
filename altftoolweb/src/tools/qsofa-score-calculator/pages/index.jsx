"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Stethoscope } from "lucide-react";

import {
  GCS_MAX,
  GCS_MIN,
  POSITIVE_SCORE,
  RESP_RATE_THRESHOLD,
  SYSTOLIC_THRESHOLD_MMHG,
  calculateQsofa,
} from "../lib";

const DEFAULTS = { respiratoryRate: "24", systolicBp: "96", gcs: "15" };
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TONE_CLASS = {
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  success: "bg-[var(--success-soft)] text-[var(--success)]",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const result = useMemo(() => calculateQsofa(form), [form]);
  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "qSOFA (Sepsis-3) score",
      ...result.criteria.map((item) => `${item.met ? "1" : "0"} — ${item.label} (${item.value})`),
      `Total: ${result.score} of ${result.maxScore}`,
      `Result: ${result.band.label}`,
      "Educational use only — qSOFA is a prompt to reassess, not a diagnosis of sepsis.",
    ].join("\n");
  }, [ok, result]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
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
          <Stethoscope className="h-4 w-4" aria-hidden="true" />
          Clinical scores
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">qSOFA Score Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The three bedside criteria defined in Sepsis-3: respiratory rate {RESP_RATE_THRESHOLD} or
          more, systolic pressure {SYSTOLIC_THRESHOLD_MMHG} mmHg or less, and altered mentation. One
          point each, {POSITIVE_SCORE} or more is positive.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="qsofa-rr">
              Respiratory rate (breaths per minute)
            </label>
            <input
              id="qsofa-rr"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="80"
              step="1"
              value={form.respiratoryRate}
              onChange={setField("respiratoryRate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="qsofa-sbp">
              Systolic blood pressure (mmHg)
            </label>
            <input
              id="qsofa-sbp"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="30"
              max="300"
              step="1"
              value={form.systolicBp}
              onChange={setField("systolicBp")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="qsofa-gcs">
              Glasgow Coma Scale total ({GCS_MIN}–{GCS_MAX})
            </label>
            <input
              id="qsofa-gcs"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={GCS_MIN}
              max={GCS_MAX}
              step="1"
              value={form.gcs}
              onChange={setField("gcs")}
            />
          </div>
        </div>
      </section>

      {result.error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              qSOFA total
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${result.score} / ${result.maxScore}` : DASH}
            </p>
            {ok ? (
              <span
                className={`mt-2 inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${
                  TONE_CLASS[result.band.tone]
                }`}
              >
                {result.band.label}
              </span>
            ) : (
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Fix the inputs above to see a score.
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the qSOFA score"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(ok
            ? result.criteria.map((item) => [
                item.label,
                `${item.value} · ${item.met ? "1 point" : "0 points"}`,
              ])
            : [
                [`Respiratory rate ${RESP_RATE_THRESHOLD} breaths/min or more`, DASH],
                [`Systolic blood pressure ${SYSTOLIC_THRESHOLD_MMHG} mmHg or less`, DASH],
                ["Altered mentation (GCS below 15)", DASH],
              ]
          ).map(([label, figure]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{figure}</dd>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Positive threshold</dt>
            <dd className="text-right font-semibold">
              {ok ? (result.positive ? `Met (${POSITIVE_SCORE}+)` : `Not met (${POSITIVE_SCORE}+)`) : DASH}
            </dd>
          </div>
        </dl>

        {ok && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.band.note}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What qSOFA is and is not</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>
            It was derived in Sepsis-3 (JAMA, 2016) to flag patients with suspected infection outside
            the ICU who are at higher risk of a poor outcome.
          </li>
          <li>
            It does not diagnose sepsis. Sepsis is defined as life-threatening organ dysfunction from
            a dysregulated host response, scored with the full SOFA.
          </li>
          <li>
            The 2021 Surviving Sepsis Campaign guideline recommends against using qSOFA on its own as
            a screening tool in preference to SIRS, NEWS or MEWS, because its sensitivity is low.
          </li>
          <li>A score of 0 or 1 never overrides clinical concern about a deteriorating patient.</li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Educational and revision use only. This is not medical advice and must not be used to make
        care decisions. If you are worried that someone has sepsis, seek emergency medical help
        immediately.
      </p>
    </main>
  );
}
