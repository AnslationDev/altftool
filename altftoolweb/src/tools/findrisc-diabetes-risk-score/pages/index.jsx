"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Droplet, RotateCcw } from "lucide-react";
import {
  ACTIVITY_OPTIONS,
  BP_MED_OPTIONS,
  DIET_OPTIONS,
  FAMILY_OPTIONS,
  FINDRISC_MAX,
  HIGH_GLUCOSE_OPTIONS,
  RISK_BANDS,
  computeFindrisc,
} from "../lib";

const DEFAULTS = {
  age: "48",
  weightKg: "82",
  heightCm: "172",
  waistCm: "96",
  sex: "male",
  activity: "yes",
  diet: "daily",
  bpMedication: "no",
  highGlucose: "no",
  familyHistory: "none",
};

const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const FIELD =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const result = useMemo(
    () =>
      computeFindrisc({
        age: Number(form.age),
        weightKg: Number(form.weightKg),
        heightCm: Number(form.heightCm),
        waistCm: Number(form.waistCm),
        sex: form.sex,
        activity: form.activity,
        diet: form.diet,
        bpMedication: form.bpMedication,
        highGlucose: form.highGlucose,
        familyHistory: form.familyHistory,
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "FINDRISC Diabetes Risk Score",
      `Score: ${result.score} of ${result.max}`,
      `Risk band: ${result.band}`,
      `10-year risk of type 2 diabetes: ${result.risk}`,
      `BMI: ${NUM1.format(result.bmi)}`,
      "",
      ...result.breakdown.map((row) => `${row.question}: ${row.answer} (+${row.points})`),
    ].join("\n");
  }, [hasError, result]);

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

  const barPct = hasError ? 0 : Math.round((result.score / FINDRISC_MAX) * 100);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Droplet className="h-4 w-4" aria-hidden="true" />
          Risk questionnaire
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          FINDRISC Diabetes Risk Score
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Eight questions about age, body size, activity, diet and family history give a score out
          of 26 and the matching 10-year risk band for type 2 diabetes. No blood test needed.
        </p>
      </header>

      <section className={CARD}>
        <h2 className="text-base font-semibold">About you</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="fd-age">
              Age (years)
            </label>
            <input
              id="fd-age"
              className={FIELD}
              type="number"
              inputMode="numeric"
              min="18"
              max="120"
              step="1"
              value={form.age}
              onChange={set("age")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="fd-sex">
              Sex (for the waist cut-offs)
            </label>
            <select id="fd-sex" className={FIELD} value={form.sex} onChange={set("sex")}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="fd-weight">
              Weight (kg)
            </label>
            <input
              id="fd-weight"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="20"
              max="400"
              step="0.5"
              value={form.weightKg}
              onChange={set("weightKg")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="fd-height">
              Height (cm)
            </label>
            <input
              id="fd-height"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="100"
              max="250"
              step="0.5"
              value={form.heightCm}
              onChange={set("heightCm")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="fd-waist">
              Waist circumference at navel level (cm)
            </label>
            <input
              id="fd-waist"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="40"
              max="250"
              step="0.5"
              value={form.waistCm}
              onChange={set("waistCm")}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Measure with the tape below the ribs and above the hip bone, at the end of a normal
              breath out.
            </p>
          </div>
        </div>
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">Habits and history</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="fd-activity">
              At least 30 minutes of physical activity daily?
            </label>
            <select id="fd-activity" className={FIELD} value={form.activity} onChange={set("activity")}>
              {ACTIVITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="fd-diet">
              How often do you eat vegetables, fruit or berries?
            </label>
            <select id="fd-diet" className={FIELD} value={form.diet} onChange={set("diet")}>
              {DIET_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="fd-bp">
              Ever taken regular blood pressure medication?
            </label>
            <select id="fd-bp" className={FIELD} value={form.bpMedication} onChange={set("bpMedication")}>
              {BP_MED_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="fd-glucose">
              Ever found to have high blood glucose?
            </label>
            <select id="fd-glucose" className={FIELD} value={form.highGlucose} onChange={set("highGlucose")}>
              {HIGH_GLUCOSE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Counts a health check, an illness or pregnancy.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="fd-family">
              Family diagnosed with diabetes (type 1 or type 2)?
            </label>
            <select id="fd-family" className={FIELD} value={form.familyHistory} onChange={set("familyHistory")}>
              {FAMILY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
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

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              FINDRISC score
            </p>
            <p className="mt-1 text-5xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.score}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a score." : `out of ${result.max} · ${result.band} risk`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy FINDRISC score and breakdown"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all answers" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
          <span
            className="block h-full bg-[var(--primary)]"
            style={{ width: `${Math.max(0, Math.min(100, barPct))}%` }}
          />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Risk band", hasError ? DASH : result.band],
            ["10-year risk of type 2 diabetes", hasError ? DASH : result.risk],
            ["Body mass index", hasError ? DASH : `${NUM1.format(result.bmi)} kg/m²`],
            ["Biggest single contributor", hasError ? DASH : `${result.topContributor.question} (+${result.topContributor.points})`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">Where your points came from</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Question</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Your answer</th>
                  <th scope="col" className="py-2 text-right font-semibold">Points</th>
                </tr>
              </thead>
              <tbody>
                {result.breakdown.map((row) => (
                  <tr key={row.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.question}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.answer}</td>
                    <td className="py-2 text-right font-semibold">
                      {row.points} / {row.max}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">FINDRISC risk bands</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Score</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Band</th>
                <th scope="col" className="py-2 font-semibold">10-year risk</th>
              </tr>
            </thead>
            <tbody>
              {RISK_BANDS.map((band) => (
                <tr key={band.label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">
                    {band.min}-{band.max}
                  </td>
                  <td className="py-2 pr-3">{band.label}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">
                    {band.risk} ({band.percent}%)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not a diagnosis. FINDRISC estimates risk in adults who do not already
        have diabetes; only a fasting glucose, oral glucose tolerance test or HbA1c can diagnose it.
        Discuss a raised score, or any symptoms such as thirst, frequent urination or unexplained
        weight loss, with a doctor.
      </p>
    </main>
  );
}
