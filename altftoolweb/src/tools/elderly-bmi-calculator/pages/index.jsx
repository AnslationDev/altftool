"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, UserRound } from "lucide-react";

import {
  DESIRABLE_BMI,
  OLDER_ADULT_AGE,
  OLDER_ADULT_BANDS,
  STANDARD_BANDS,
  elderlyBmi,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const DEFAULTS = {
  age: "78",
  sex: "female",
  heightMode: "measured",
  heightCm: "158",
  kneeHeightCm: "48",
  weightKg: "58",
  usualWeightKg: "",
  acutelyIll: false,
};

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const DASH = "—";

const toNum = (raw) => {
  const text = String(raw ?? "").trim();
  if (text === "") return NaN;
  const value = Number(text.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

const toneClass = (tone) => {
  if (tone === "good") return "text-[var(--success)]";
  if (tone === "bad") return "text-[var(--danger)]";
  return "text-[var(--foreground)]";
};

const bandRange = (band) => {
  if (band.min === 0) return `under ${band.max}`;
  if (band.max === Infinity) return `${band.min}+`;
  return `${band.min} – ${band.max}`;
};

const riskTone = (key) => {
  if (key === "low") return "text-[var(--success)]";
  if (key === "medium") return "text-[var(--foreground)]";
  return "text-[var(--danger)]";
};

export default function ToolHome() {
  const [age, setAge] = useState(DEFAULTS.age);
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [heightMode, setHeightMode] = useState(DEFAULTS.heightMode);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [kneeHeightCm, setKneeHeightCm] = useState(DEFAULTS.kneeHeightCm);
  const [weightKg, setWeightKg] = useState(DEFAULTS.weightKg);
  const [usualWeightKg, setUsualWeightKg] = useState(DEFAULTS.usualWeightKg);
  const [acutelyIll, setAcutelyIll] = useState(DEFAULTS.acutelyIll);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const usualRaw = String(usualWeightKg ?? "").trim();
    const usualValue = usualRaw === "" ? undefined : toNum(usualWeightKg);
    if (usualRaw !== "" && Number.isNaN(usualValue)) {
      return { error: "Previous weight must be a number, or left blank." };
    }
    return elderlyBmi({
      weightKg: toNum(weightKg),
      age: toNum(age),
      sex,
      heightMode,
      heightCm: toNum(heightCm),
      kneeHeightCm: toNum(kneeHeightCm),
      usualWeightKg: usualValue,
      acutelyIll,
    });
  }, [weightKg, age, sex, heightMode, heightCm, kneeHeightCm, usualWeightKg, acutelyIll]);

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      "Elderly BMI Calculator",
      `Age ${toNum(age)} · height used ${NUM1.format(result.heightUsedCm)} cm${result.heightEstimated ? " (estimated from knee height)" : ""}`,
      `BMI: ${NUM1.format(result.bmi)} kg/m2`,
      `Age-adjusted (65+): ${result.olderBand.label}`,
      `Standard adult scale: ${result.standardBand.label}`,
      `Desirable weight for this height: ${NUM1.format(result.desirableMinKg)}–${NUM1.format(result.desirableMaxKg)} kg`,
      `MUST malnutrition score: ${result.must.total} (${result.must.risk.label})`,
    ];
    if (result.lossPercent !== null) {
      lines.push(`Weight change: ${NUM1.format(result.lossPercent)}% loss (${NUM1.format(result.lossKg)} kg)`);
    }
    return lines.join("\n");
  }, [ok, result, age]);

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
    setAge(DEFAULTS.age);
    setSex(DEFAULTS.sex);
    setHeightMode(DEFAULTS.heightMode);
    setHeightCm(DEFAULTS.heightCm);
    setKneeHeightCm(DEFAULTS.kneeHeightCm);
    setWeightKg(DEFAULTS.weightKg);
    setUsualWeightKg(DEFAULTS.usualWeightKg);
    setAcutelyIll(DEFAULTS.acutelyIll);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <UserRound className="h-4 w-4" aria-hidden="true" />
          Ages {OLDER_ADULT_AGE}+
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Elderly BMI Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          After 65 a slightly higher BMI is protective, so this reads your number against the
          {" "}{DESIRABLE_BMI.min}–{DESIRABLE_BMI.max} desirable range for older adults, estimates
          stature from knee height when standing is difficult, and scores malnutrition risk with MUST.
        </p>
      </header>

      <section className={CARD}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="ebmi-age">
              Age (years)
            </label>
            <input
              id="ebmi-age"
              className={INPUT}
              type="number"
              inputMode="numeric"
              min="50"
              max="120"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="ebmi-sex">
              Sex
            </label>
            <select
              id="ebmi-sex"
              className={INPUT}
              value={sex}
              onChange={(event) => setSex(event.target.value)}
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">How is height known?</legend>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            {[
              ["measured", "Measured standing height"],
              ["knee", "Estimate from knee height"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={heightMode === value}
                onClick={() => setHeightMode(value)}
                className={`min-h-11 flex-1 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  heightMode === value
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {heightMode === "measured" ? (
            <div>
              <label className={LABEL} htmlFor="ebmi-height">
                Height (cm)
              </label>
              <input
                id="ebmi-height"
                className={INPUT}
                type="number"
                inputMode="decimal"
                min="120"
                max="220"
                step="0.5"
                value={heightCm}
                onChange={(event) => setHeightCm(event.target.value)}
              />
            </div>
          ) : (
            <div>
              <label className={LABEL} htmlFor="ebmi-knee">
                Knee height (cm)
              </label>
              <input
                id="ebmi-knee"
                className={INPUT}
                type="number"
                inputMode="decimal"
                min="30"
                max="70"
                step="0.5"
                value={kneeHeightCm}
                onChange={(event) => setKneeHeightCm(event.target.value)}
                aria-describedby="ebmi-knee-help"
              />
              <p id="ebmi-knee-help" className="mt-1 text-xs text-[var(--muted-foreground)]">
                Sitting with the left knee and ankle bent to 90 degrees, measure from the sole of the
                foot to the top of the thigh just behind the kneecap.
              </p>
            </div>
          )}

          <div>
            <label className={LABEL} htmlFor="ebmi-weight">
              Current weight (kg)
            </label>
            <input
              id="ebmi-weight"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={weightKg}
              onChange={(event) => setWeightKg(event.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="ebmi-usual">
              Weight 3 to 6 months ago (kg, optional)
            </label>
            <input
              id="ebmi-usual"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={usualWeightKg}
              onChange={(event) => setUsualWeightKg(event.target.value)}
              aria-describedby="ebmi-usual-help"
            />
            <p id="ebmi-usual-help" className="mt-1 text-xs text-[var(--muted-foreground)]">
              Unplanned loss is the strongest single warning sign; leave blank if unknown.
            </p>
          </div>
        </div>

        <label className="mt-4 flex min-h-11 items-center gap-3 text-sm font-medium" htmlFor="ebmi-acute">
          <input
            id="ebmi-acute"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={acutelyIll}
            onChange={(event) => setAcutelyIll(event.target.checked)}
          />
          Acutely ill and has had little or no food for more than 5 days
        </label>
      </section>

      {result.error && (
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
              Body Mass Index
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? NUM1.format(result.bmi) : DASH}
            </p>
            <p className={`mt-1 text-sm font-semibold ${ok ? toneClass(result.band.tone) : "text-[var(--muted-foreground)]"}`}>
              {ok ? result.band.label : DASH}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the elderly BMI result"
              className={`${GHOST_BTN} disabled:opacity-50`}
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

        {ok && !result.ageAdjustedApplies && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm">
            Below {OLDER_ADULT_AGE} the standard adult bands still apply, so the headline category
            above uses those. The age-adjusted row is shown for reference.
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Height used", ok ? `${NUM1.format(result.heightUsedCm)} cm${result.heightEstimated ? " (Chumlea estimate)" : ""}` : DASH],
            ["Age-adjusted category (65+)", ok ? result.olderBand.label : DASH],
            ["Standard adult category", ok ? result.standardBand.label : DASH],
            [
              `Desirable weight at BMI ${DESIRABLE_BMI.min}–${DESIRABLE_BMI.max}`,
              ok ? `${NUM1.format(result.desirableMinKg)} – ${NUM1.format(result.desirableMaxKg)} kg` : DASH,
            ],
            [
              "Distance from that range",
              !ok
                ? DASH
                : result.kgToDesirable === 0
                  ? "Inside the range"
                  : `${NUM1.format(result.kgToDesirable)} kg ${result.belowDesirable ? "below" : "above"}`,
            ],
            [
              "Unplanned weight loss",
              !ok || result.lossPercent === null
                ? DASH
                : `${NUM1.format(result.lossPercent)}% (${NUM1.format(result.lossKg)} kg)`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold">MUST malnutrition screening score</h2>
          <p className={`text-sm font-semibold ${ok ? riskTone(result.must.risk.key) : "text-[var(--muted-foreground)]"}`}>
            {ok ? `${result.must.total} — ${result.must.risk.label}` : DASH}
          </p>
        </div>
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {(ok
            ? [
                ["Step 1 · BMI", result.must.bmiText, result.must.bmiScore],
                ["Step 2 · Weight loss", result.must.lossText, result.must.lossScore],
                ["Step 3 · Acute disease", result.must.acuteText, result.must.acuteScore],
              ]
            : [
                ["Step 1 · BMI", DASH, DASH],
                ["Step 2 · Weight loss", DASH, DASH],
                ["Step 3 · Acute disease", DASH, DASH],
              ]
          ).map(([step, text, score]) => (
            <div key={step} className="flex items-start justify-between gap-4 py-2.5">
              <div>
                <dt className="font-semibold">{step}</dt>
                <dd className="text-[var(--muted-foreground)]">{text}</dd>
              </div>
              <dd className="shrink-0 font-semibold">{score}</dd>
            </div>
          ))}
        </dl>
        {ok && (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm">{result.must.risk.action}</p>
        )}
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">Bands compared</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Age-adjusted (65+)</th>
                <th scope="col" className="py-2 pr-3 font-semibold">BMI</th>
                <th scope="col" className="py-2 font-semibold">Standard adult band</th>
              </tr>
            </thead>
            <tbody>
              {OLDER_ADULT_BANDS.map((band, index) => {
                const counterpart = STANDARD_BANDS[index];
                const active = ok && result.olderBand.key === band.key;
                return (
                  <tr
                    key={band.key}
                    className={`border-b border-[var(--border)] last:border-0 ${active ? "bg-[var(--muted)]" : ""}`}
                  >
                    <td className={`py-2 pr-3 font-semibold ${active ? toneClass(band.tone) : ""}`}>
                      {band.label}
                    </td>
                    <td className="py-2 pr-3">{bandRange(band)}</td>
                    <td className="py-2 text-[var(--muted-foreground)]">
                      {counterpart ? `${counterpart.label} ${bandRange(counterpart)}` : DASH}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not a diagnosis. BMI misses muscle loss, fluid retention and oedema, all
        of which are common after 70. A MUST score of 1 or more, or any unplanned weight loss, should
        be discussed with a GP or dietitian.
      </p>
    </main>
  );
}
