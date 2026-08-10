"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, Check, Copy, RotateCcw } from "lucide-react";
import {
  ACTIVITY_LEVELS,
  FAMILY_HISTORY_OPTIONS,
  PREDIABETES_LAB_RANGES,
  assessPrediabetesRisk,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  age: "46",
  sex: "male",
  heightCm: "172",
  weightKg: "82",
  waistCm: "96",
  activity: "mild",
  familyHistory: "one-parent",
  highBloodPressure: true,
  gestationalDiabetes: false,
};

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(copyTimeoutRef.current), []);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const result = useMemo(
    () =>
      assessPrediabetesRisk({
        age: Number(form.age),
        sex: form.sex,
        heightCm: Number(form.heightCm),
        weightKg: Number(form.weightKg),
        waistCm: Number(form.waistCm),
        activity: form.activity,
        familyHistory: form.familyHistory,
        highBloodPressure: form.highBloodPressure,
        gestationalDiabetes: form.gestationalDiabetes,
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Prediabetes risk self-check",
      `ADA/CDC risk test: ${result.adaScore} of ${result.adaMaxScore} — ${result.adaVerdict}`,
      `Indian Diabetes Risk Score: ${result.idrsScore} of ${result.idrsMaxScore} — ${result.idrsBandLabel}`,
      `BMI: ${NUM.format(result.bmi)} kg/m²`,
      `Waist band: ${result.waistBandLabel}`,
      "",
      "Suggested actions:",
      ...result.actions.map((action) => `- ${action.title}: ${action.detail}`),
      "",
      "Screening is not a diagnosis — confirm with a blood test.",
    ].join("\n");
  }, [hasError, result]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  const adaPct = hasError
    ? 0
    : Math.max(0, Math.min(100, (result.adaScore / result.adaMaxScore) * 100));
  const idrsPct = hasError
    ? 0
    : Math.max(0, Math.min(100, (result.idrsScore / result.idrsMaxScore) * 100));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Activity className="h-4 w-4" aria-hidden="true" />
          Diabetes screening
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Prediabetes Risk Self-Check
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Answer eight questions (nine if you have had gestational diabetes) and get two published
          risk scores at once — the ADA/CDC prediabetes risk test and the Indian Diabetes Risk
          Score — plus the lifestyle targets used in the Diabetes Prevention Program.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pd-age">
              Age (years)
            </label>
            <input
              id="pd-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="18"
              max="120"
              value={form.age}
              onChange={(event) => update("age", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pd-sex">
              Sex recorded at birth
            </label>
            <select
              id="pd-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.sex}
              onChange={(event) => update("sex", event.target.value)}
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pd-height">
              Height (cm)
            </label>
            <input
              id="pd-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="100"
              max="250"
              value={form.heightCm}
              onChange={(event) => update("heightCm", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pd-weight">
              Weight (kg)
            </label>
            <input
              id="pd-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="25"
              max="400"
              value={form.weightKg}
              onChange={(event) => update("weightKg", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pd-waist">
              Waist at the navel (cm)
            </label>
            <input
              id="pd-waist"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="40"
              max="250"
              value={form.waistCm}
              onChange={(event) => update("waistCm", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pd-activity">
              Usual physical activity
            </label>
            <select
              id="pd-activity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.activity}
              onChange={(event) => update("activity", event.target.value)}
            >
              {ACTIVITY_LEVELS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pd-family">
              Family history of diabetes
            </label>
            <select
              id="pd-family"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.familyHistory}
              onChange={(event) => update("familyHistory", event.target.value)}
            >
              {FAMILY_HISTORY_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <label
            htmlFor="pd-bp"
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          >
            <input
              id="pd-bp"
              type="checkbox"
              checked={form.highBloodPressure}
              onChange={(event) => update("highBloodPressure", event.target.checked)}
              className="h-5 w-5 accent-[var(--primary)]"
            />
            <span>Ever told you have high blood pressure</span>
          </label>
          {form.sex === "female" && (
            <label
              htmlFor="pd-gdm"
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            >
              <input
                id="pd-gdm"
                type="checkbox"
                checked={form.gestationalDiabetes}
                onChange={(event) => update("gestationalDiabetes", event.target.checked)}
                className="h-5 w-5 accent-[var(--primary)]"
              />
              <span>Diabetes during a pregnancy</span>
            </label>
          )}
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section aria-live="polite" className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              ADA/CDC risk test score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.adaScore} / ${result.adaMaxScore}`}
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${
                !hasError && result.adaHighRisk
                  ? "text-[var(--danger)]"
                  : "text-[var(--muted-foreground)]"
              }`}
            >
              {hasError ? "Fix the inputs above to see your score." : result.adaVerdict}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy prediabetes risk result"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all answers" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
              <span>ADA/CDC test</span>
              <span>High risk at {hasError ? DASH : result.adaThreshold}+</span>
            </div>
            <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${adaPct}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
              <span>Indian Diabetes Risk Score</span>
              <span>{hasError ? DASH : `${result.idrsScore} / ${result.idrsMaxScore}`}</span>
            </div>
            <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${idrsPct}%` }}
              />
            </div>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["ADA/CDC risk test", hasError ? DASH : `${result.adaScore} of ${result.adaMaxScore}`],
            [
              "Indian Diabetes Risk Score",
              hasError ? DASH : `${result.idrsScore} of ${result.idrsMaxScore} — ${result.idrsBandLabel}`,
            ],
            ["Body mass index", hasError ? DASH : `${NUM.format(result.bmi)} kg/m²`],
            ["Waist band", hasError ? DASH : result.waistBandLabel],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">What to do next</h2>
            <ul className="mt-3 space-y-3">
              {result.actions.map((action) => (
                <li
                  key={action.title}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                >
                  <p className="text-sm font-semibold">{action.title}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                    {action.detail}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">How each score was built</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <caption className="sr-only">Points contributed by each answer</caption>
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Item
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[var(--border)]">
                    <th scope="row" colSpan={2} className="py-2 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
                      ADA/CDC risk test
                    </th>
                  </tr>
                  {result.adaParts.map((part) => (
                    <tr key={`ada-${part.label}`} className="border-b border-[var(--border)]">
                      <td className="py-2 pr-3 text-[var(--muted-foreground)]">{part.label}</td>
                      <td className="py-2 text-right font-semibold">{part.points}</td>
                    </tr>
                  ))}
                  <tr className="border-b border-[var(--border)]">
                    <th scope="row" colSpan={2} className="py-2 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
                      Indian Diabetes Risk Score
                    </th>
                  </tr>
                  {result.idrsParts.map((part) => (
                    <tr key={`idrs-${part.label}`} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 text-[var(--muted-foreground)]">{part.label}</td>
                      <td className="py-2 text-right font-semibold">{part.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Blood tests that actually confirm prediabetes</h2>
            <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
              {PREDIABETES_LAB_RANGES.map(([label, range]) => (
                <div key={label} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="font-semibold">{range}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
              Ranges are the American Diabetes Association criteria for prediabetes. Values above
              each range meet the criteria for diabetes.
            </p>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational screening only, not a diagnosis and not medical advice. A questionnaire
        cannot measure your blood glucose — discuss any high score with a doctor and ask for the
        appropriate blood test.
      </p>
    </main>
  );
}
