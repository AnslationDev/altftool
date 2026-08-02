"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Check,
  ClipboardList,
  Copy,
  Eye,
  MessageSquare,
  PhoneCall,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  DISCLAIMER,
  RISK_FACTORS,
  SEVERITY_LEVELS,
  SYMPTOM_GROUPS,
  assessSymptoms,
  buildHandover,
  formatAge,
  formatDuration,
  symptomsInGroup,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";

/* Static class maps — Tailwind cannot see interpolated class names. */
const TONE_PANEL = {
  danger: "bg-[var(--danger-soft)] text-[var(--danger-text)] ring-[var(--danger)]/35",
  warning: "bg-[var(--warning-soft)] text-[var(--warning-text)] ring-[var(--warning)]/35",
  info: "bg-[var(--info-soft)] text-[var(--info-text)] ring-[var(--info)]/35",
  success: "bg-[var(--success-soft)] text-[var(--success-text)] ring-[var(--success)]/35",
};

const LEVEL_TONE = {
  emergency: "danger",
  urgent: "danger",
  sameDay: "warning",
  routine: "info",
  selfCare: "success",
};

const DEFAULTS = {
  symptomIds: ["fever", "cough", "sore_throat"],
  ageYears: "34",
  durationDays: "3",
  severity: "moderate",
  riskFactorIds: [],
};

const toggle = (list, id) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);

export default function ToolHome() {
  const [symptomIds, setSymptomIds] = useState(DEFAULTS.symptomIds);
  const [ageYears, setAgeYears] = useState(DEFAULTS.ageYears);
  const [durationDays, setDurationDays] = useState(DEFAULTS.durationDays);
  const [severity, setSeverity] = useState(DEFAULTS.severity);
  const [riskFactorIds, setRiskFactorIds] = useState(DEFAULTS.riskFactorIds);
  const { copy, isCopied, announcement } = useCopyToClipboard();

  const result = useMemo(
    () =>
      assessSymptoms({
        symptomIds,
        ageYears: ageYears === "" ? Number.NaN : Number(ageYears),
        durationDays: durationDays === "" ? Number.NaN : Number(durationDays),
        severity,
        riskFactorIds,
      }),
    [symptomIds, ageYears, durationDays, severity, riskFactorIds],
  );

  const handover = useMemo(() => (result.error ? "" : buildHandover(result)), [result]);

  const copyResult = async () => {
    if (!handover) return;
    await copy("symptom-summary", handover, { label: "Summary" });
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset every field? This will discard your selected symptoms, age, duration, severity and risk factors, and cannot be undone.",
      )
    ) {
      return;
    }
    setSymptomIds(DEFAULTS.symptomIds);
    setAgeYears(DEFAULTS.ageYears);
    setDurationDays(DEFAULTS.durationDays);
    setSeverity(DEFAULTS.severity);
    setRiskFactorIds(DEFAULTS.riskFactorIds);
  };

  const tone = result.error ? "danger" : LEVEL_TONE[result.level.key];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Activity className="h-4 w-4" aria-hidden="true" />
          Red-flag triage
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Symptom Checker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Describe what is going on and this runs it against a fixed list of published warning-sign
          rules to answer one question: how quickly should you be seen? Every rule that matched is
          shown with its reasoning. Nothing is scored or guessed, and nothing leaves your browser.
        </p>
      </header>

      <div
        className="mb-6 flex items-start gap-3 rounded-xl bg-[var(--danger-soft)] p-4 text-sm leading-6 text-[var(--danger-text)] ring-1 ring-[var(--danger)]/35"
        role="note"
      >
        <PhoneCall className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <p>
          <strong className="font-semibold">Do not use this page in an emergency.</strong> If someone
          is unresponsive, struggling to breathe, has chest pain, is bleeding heavily, has a rash
          that does not fade under pressure, or has a face or limb that has suddenly stopped working,
          call your local emergency number now.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      <section className={`${CARD} mb-6`} aria-labelledby="about-you">
        <h2 id="about-you" className="mb-4 text-lg font-semibold">
          About you
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={LABEL_CLASS} htmlFor="sc-age">
              Age in years
            </label>
            <input
              id="sc-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="130"
              step="0.25"
              value={ageYears}
              onChange={(event) => setAgeYears(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              For a baby use a fraction — 0.25 is three months.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sc-duration">
              How many days so far
            </label>
            <input
              id="sc-duration"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="3650"
              step="1"
              value={durationDays}
              onChange={(event) => setDurationDays(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">Use 0 if it started today.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sc-severity">
              Overall severity
            </label>
            <select
              id="sc-severity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={severity}
              onChange={(event) => setSeverity(event.target.value)}
            >
              {SEVERITY_LEVELS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {SEVERITY_LEVELS.find((item) => item.key === severity)?.hint}
            </p>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>Anything else that applies</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {RISK_FACTORS.map((item) => (
              <label
                key={item.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm leading-5"
                htmlFor={`risk-${item.id}`}
              >
                <input
                  id={`risk-${item.id}`}
                  type="checkbox"
                  className="h-4 w-4 shrink-0 accent-[var(--primary)]"
                  checked={riskFactorIds.includes(item.id)}
                  onChange={() => setRiskFactorIds((list) => toggle(list, item.id))}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {/* ------------------------------------------------------------------ */}
      <section className={`${CARD} mb-6`} aria-labelledby="symptoms">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="symptoms" className="text-lg font-semibold">
            Symptoms
          </h2>
          <span className="text-sm text-[var(--muted-foreground)]">{symptomIds.length} selected</span>
        </div>

        <div className="space-y-5">
          {SYMPTOM_GROUPS.map((group) => {
            const items = symptomsInGroup(group.id);
            if (items.length === 0) return null;
            return (
              <fieldset key={group.id}>
                <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {group.label}
                </legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {items.map((item) => (
                    <label
                      key={item.id}
                      htmlFor={`sym-${item.id}`}
                      className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm leading-5"
                    >
                      <input
                        id={`sym-${item.id}`}
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--primary)]"
                        checked={symptomIds.includes(item.id)}
                        onChange={() => setSymptomIds((list) => toggle(list, item.id))}
                      />
                      <span className="flex-1">
                        {item.label}
                        {item.redFlag ? (
                          <span className="ml-1 inline-flex items-center align-middle text-[var(--danger)]">
                            <ShieldAlert className="h-3.5 w-3.5" aria-label="warning sign" />
                          </span>
                        ) : null}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            );
          })}
        </div>

        <p className="mt-4 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
          <ShieldAlert className="h-3.5 w-3.5 text-[var(--danger)]" aria-hidden="true" />
          marks a recognised warning sign that triggers at least one rule on its own.
        </p>
      </section>

      {/* ------------------------------------------------------------------ */}
      {result.error ? (
        <div
          role="alert"
          className="rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </div>
      ) : (
        <>
          <section className={`mb-6 rounded-xl p-5 ring-1 ${TONE_PANEL[tone]}`} aria-live="polite">
            <p className="text-xs font-semibold uppercase tracking-wide">Suggested urgency</p>
            <p className="mt-1 text-2xl font-semibold">{result.level.label}</p>
            <p className="mt-2 text-sm font-medium leading-6">{result.level.action}</p>
            <p className="mt-1 text-sm leading-6">{result.level.timeframe}</p>
            <p className="mt-3 border-t border-current/20 pt-3 text-xs leading-5">
              {formatAge(result.ageYears)} · {formatDuration(result.durationDays)} ·{" "}
              {result.severity.label} · {result.selected.length} symptom
              {result.selected.length === 1 ? "" : "s"}
            </p>
          </section>

          <section className={`${CARD} mb-6`} aria-labelledby="why">
            <h2 id="why" className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <AlertTriangle className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
              Why this band
            </h2>

            {result.firedRules.length === 0 ? (
              <p className="text-sm leading-6 text-[var(--muted-foreground)]">
                No warning-sign rule matched what you described. The band comes from severity and
                duration alone: {result.baseline.why}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      <th scope="col" className="py-2 pr-3 font-semibold">
                        Band
                      </th>
                      <th scope="col" className="py-2 pr-3 font-semibold">
                        Rule that matched
                      </th>
                      <th scope="col" className="py-2 font-semibold">
                        Reasoning
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.firedRules.map((rule) => (
                      <tr key={rule.id} className="border-b border-[var(--border)] align-top">
                        <td className="py-3 pr-3 whitespace-nowrap">
                          <span
                            className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${TONE_PANEL[LEVEL_TONE[rule.level]]}`}
                          >
                            {rule.levelLabel}
                          </span>
                        </td>
                        <td className="py-3 pr-3 font-medium">{rule.title}</td>
                        <td className="py-3 leading-6 text-[var(--muted-foreground)]">{rule.why}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {result.escalations.length > 0 && (
              <div className="mt-4 rounded-md bg-[var(--muted)] p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Adjustments applied
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6">
                  {result.escalations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
              Baseline before any rule fired: <strong>{result.baseline.label}</strong>.{" "}
              {result.baseline.why}
            </p>
          </section>

          <section className={`${CARD} mb-6`} aria-labelledby="watch">
            <h2 id="watch" className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <Eye className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
              Get seen sooner if any of this happens
            </h2>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-6">
              {result.watchFor.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className={`${CARD} mb-6`} aria-labelledby="questions">
            <h2 id="questions" className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <MessageSquare className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
              Worth asking when you are seen
            </h2>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-6">
              {result.questions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className={`${CARD} mb-6`} aria-labelledby="handover">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 id="handover" className="flex items-center gap-2 text-lg font-semibold">
                <ClipboardList className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
                Summary to read out
              </h2>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={PRIMARY_BTN}
                  onClick={copyResult}
                  aria-label={isCopied("symptom-summary") ? "Copied" : "Copy the summary to read out"}
                >
                  {isCopied("symptom-summary") ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {isCopied("symptom-summary") ? "Copied" : "Copy summary"}
                </button>
                <button type="button" className={GHOST_BTN} onClick={reset}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
                <span className="sr-only" role="status" aria-live="polite">
                  {announcement}
                </span>
              </div>
            </div>
            <pre className="overflow-x-auto rounded-md bg-[var(--muted)] p-4 text-xs leading-6 text-[var(--foreground)]">
              {handover}
            </pre>
          </section>
        </>
      )}

      <p className="rounded-xl bg-[var(--muted)] p-4 text-xs leading-6 text-[var(--muted-foreground)]">
        {DISCLAIMER}
      </p>
    </main>
  );
}
