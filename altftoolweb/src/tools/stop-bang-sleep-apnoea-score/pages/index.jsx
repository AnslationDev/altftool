"use client";

import { useMemo, useState } from "react";
import { Bed, Check, Copy, RotateCcw } from "lucide-react";
import { ITEM_META, RISK_BANDS, STOPBANG_MAX, computeStopBang } from "../lib";

const DEFAULTS = {
  snoring: true,
  tired: true,
  observed: false,
  pressure: false,
  weightKg: "92",
  heightCm: "175",
  age: "54",
  neckCm: "42",
  sex: "male",
};

const YES_NO_KEYS = ["snoring", "tired", "observed", "pressure"];

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

  const setValue = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const setField = (key) => (event) => setValue(key, event.target.value);

  const result = useMemo(
    () =>
      computeStopBang({
        snoring: form.snoring,
        tired: form.tired,
        observed: form.observed,
        pressure: form.pressure,
        weightKg: Number(form.weightKg),
        heightCm: Number(form.heightCm),
        age: Number(form.age),
        neckCm: Number(form.neckCm),
        sex: form.sex,
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "STOP-BANG Sleep Apnoea Score",
      `Score: ${result.score} of ${result.max}`,
      `Risk band: ${result.band}`,
      `STOP subscore: ${result.stopScore} of 4`,
      `BMI: ${NUM1.format(result.bmi)} · Neck: ${result.neckCm} cm · Age: ${result.age}`,
      result.refinedHighRisk
        ? `Meets the refined high-risk criteria (${result.refinedTriggers.join(", ")})`
        : "Does not meet the refined high-risk criteria",
      "",
      ...result.breakdown.map((row) => `${row.letter} — ${row.question} ${row.yes ? "Yes (+1)" : "No (0)"}`),
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

  const barPct = hasError ? 0 : Math.round((result.score / STOPBANG_MAX) * 100);
  const isHigh = !hasError && result.band === "High risk";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Bed className="h-4 w-4" aria-hidden="true" />
          Sleep screening
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          STOP-BANG Sleep Apnoea Score
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Snoring, Tiredness, Observed apnoea, Pressure, BMI, Age, Neck and Gender — eight items
          worth one point each. The total out of 8 puts you in a low, intermediate or high risk band
          for moderate-to-severe obstructive sleep apnoea.
        </p>
      </header>

      <section className={CARD}>
        <h2 className="text-base font-semibold">S · T · O · P</h2>
        <div className="mt-4 grid gap-3">
          {YES_NO_KEYS.map((key) => {
            const meta = ITEM_META[key];
            const inputId = `sb-${key}`;
            return (
              <label
                key={key}
                htmlFor={inputId}
                className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                  form[key]
                    ? "border-[var(--primary)] bg-[var(--primary)]/10"
                    : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                }`}
              >
                <input
                  id={inputId}
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={form[key]}
                  onChange={(event) => setValue(key, event.target.checked)}
                />
                <span className="text-sm">
                  <span className="font-semibold">
                    {meta.letter} — {meta.question}
                  </span>
                  <span className="mt-0.5 block text-[var(--muted-foreground)]">{meta.help}</span>
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">B · A · N · G</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          These four are worked out from your measurements rather than answered yes or no.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="sb-weight">
              Weight (kg)
            </label>
            <input
              id="sb-weight"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="20"
              max="400"
              step="0.5"
              value={form.weightKg}
              onChange={setField("weightKg")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="sb-height">
              Height (cm)
            </label>
            <input
              id="sb-height"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="100"
              max="250"
              step="0.5"
              value={form.heightCm}
              onChange={setField("heightCm")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="sb-age">
              Age (years)
            </label>
            <input
              id="sb-age"
              className={FIELD}
              type="number"
              inputMode="numeric"
              min="18"
              max="120"
              step="1"
              value={form.age}
              onChange={setField("age")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="sb-neck">
              Neck circumference (cm)
            </label>
            <input
              id="sb-neck"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="20"
              max="80"
              step="0.5"
              value={form.neckCm}
              onChange={setField("neckCm")}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Measured at the level of the Adam&apos;s apple, or read off your shirt collar size.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="sb-sex">
              Sex
            </label>
            <select id="sb-sex" className={FIELD} value={form.sex} onChange={setField("sex")}>
              <option value="male">Male</option>
              <option value="female">Female</option>
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
              STOP-BANG score
            </p>
            <p className="mt-1 text-5xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.score}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a score." : `out of ${result.max} · ${result.band}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy STOP-BANG score and breakdown"
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
            className={`block h-full ${isHigh ? "bg-[var(--danger)]" : "bg-[var(--primary)]"}`}
            style={{ width: `${Math.max(0, Math.min(100, barPct))}%` }}
          />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Risk band", hasError ? DASH : result.band],
            ["STOP subscore (first four items)", hasError ? DASH : `${result.stopScore} of 4`],
            ["Body mass index", hasError ? DASH : `${NUM1.format(result.bmi)} kg/m²`],
            [
              "Refined high-risk criteria",
              hasError ? DASH : result.refinedHighRisk ? `Met — ${result.refinedTriggers.join(", ")}` : "Not met",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.bandNote && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {result.bandNote}
          </p>
        )}
      </section>

      {!hasError && (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">Item by item</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Item</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Question</th>
                  <th scope="col" className="py-2 text-right font-semibold">Point</th>
                </tr>
              </thead>
              <tbody>
                {result.breakdown.map((row) => (
                  <tr key={row.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.letter}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.question}</td>
                    <td
                      className={`py-2 text-right font-semibold ${
                        row.yes ? "text-[var(--danger)]" : "text-[var(--success)]"
                      }`}
                    >
                      {row.yes ? "Yes +1" : "No 0"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">Risk bands</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Score</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Band</th>
                <th scope="col" className="py-2 font-semibold">What it means</th>
              </tr>
            </thead>
            <tbody>
              {RISK_BANDS.map((band) => (
                <tr key={band.label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">
                    {band.min}-{band.max}
                  </td>
                  <td className="py-2 pr-3">{band.label}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{band.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. STOP-BANG is a screening questionnaire designed to be sensitive rather
        than precise, so it over-identifies on purpose; obstructive sleep apnoea is diagnosed by a
        sleep study, not by a score. Discuss any raised result with a doctor, especially before
        surgery or if you fall asleep while driving.
      </p>
    </main>
  );
}
