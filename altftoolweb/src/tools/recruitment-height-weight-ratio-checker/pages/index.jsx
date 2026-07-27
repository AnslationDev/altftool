"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Ruler, RotateCcw, ShieldCheck, X } from "lucide-react";

import {
  buildHeightWeightChart,
  checkRecruitmentStandards,
  feetInchesToCm,
  SCHEMES,
} from "../lib";

const DEFAULTS = {
  schemeId: "army_gd",
  heightCm: "170",
  weightKg: "65",
  chestUnexpandedCm: "80",
  chestExpandedCm: "85",
  customMinHeightCm: "168",
  customChestCm: "79",
  customExpansionCm: "5",
  feet: "5",
  inches: "7",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const num = (v) => (Number.isFinite(v) ? NUM.format(v) : DASH);
const num2 = (v) => (Number.isFinite(v) ? NUM2.format(v) : DASH);

const toNumber = (raw) => {
  const cleaned = String(raw).replace(/,/g, "").trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [schemeId, setSchemeId] = useState(DEFAULTS.schemeId);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [weightKg, setWeightKg] = useState(DEFAULTS.weightKg);
  const [chestUnexpandedCm, setChestUnexpandedCm] = useState(DEFAULTS.chestUnexpandedCm);
  const [chestExpandedCm, setChestExpandedCm] = useState(DEFAULTS.chestExpandedCm);
  const [customMinHeightCm, setCustomMinHeightCm] = useState(DEFAULTS.customMinHeightCm);
  const [customChestCm, setCustomChestCm] = useState(DEFAULTS.customChestCm);
  const [customExpansionCm, setCustomExpansionCm] = useState(DEFAULTS.customExpansionCm);
  const [feet, setFeet] = useState(DEFAULTS.feet);
  const [inches, setInches] = useState(DEFAULTS.inches);
  const [copied, setCopied] = useState(false);

  const scheme = SCHEMES[schemeId] ?? SCHEMES.army_gd;
  const isCustom = schemeId === "custom";
  const showsChest = isCustom || Boolean(scheme.chestUnexpandedCm);

  const result = useMemo(
    () =>
      checkRecruitmentStandards({
        schemeId,
        heightCm: toNumber(heightCm),
        weightKg: toNumber(weightKg),
        chestUnexpandedCm: toNumber(chestUnexpandedCm),
        chestExpandedCm: toNumber(chestExpandedCm),
        customMinHeightCm: isCustom ? toNumber(customMinHeightCm) : NaN,
        customChestCm: isCustom ? toNumber(customChestCm) : NaN,
        customExpansionCm: isCustom ? toNumber(customExpansionCm) : NaN,
      }),
    [
      schemeId,
      heightCm,
      weightKg,
      chestUnexpandedCm,
      chestExpandedCm,
      isCustom,
      customMinHeightCm,
      customChestCm,
      customExpansionCm,
    ],
  );

  const hasError = Boolean(result.error);

  const chart = useMemo(() => {
    if (hasError) return [];
    return buildHeightWeightChart(150, 190, 5, result.bmiMin, result.bmiMax);
  }, [hasError, result]);

  const converted = useMemo(
    () => feetInchesToCm(toNumber(feet), toNumber(inches)),
    [feet, inches],
  );

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `Physical standard check — ${result.scheme.label}`,
      `Height ${num(toNumber(heightCm))} cm, weight ${num(toNumber(weightKg))} kg, BMI ${num2(result.bmi)}`,
      `Accepted weight band for this height: ${num(result.minWeightKg)}–${num(result.maxWeightKg)} kg`,
      `Devine reference weight: ${num(result.idealWeightKg)} kg`,
      "",
      ...result.checks.map(
        (c) => `${c.pass ? "PASS" : "FAIL"} — ${c.label}: need ${c.requirement}, measured ${c.measured}`,
      ),
      "",
      result.allPass
        ? "All checked standards met."
        : `Not met: ${result.failedLabels.join(", ")}`,
    ];
    return lines.join("\n");
  }, [hasError, result, heightCm, weightKg]);

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
    setSchemeId(DEFAULTS.schemeId);
    setHeightCm(DEFAULTS.heightCm);
    setWeightKg(DEFAULTS.weightKg);
    setChestUnexpandedCm(DEFAULTS.chestUnexpandedCm);
    setChestExpandedCm(DEFAULTS.chestExpandedCm);
    setCustomMinHeightCm(DEFAULTS.customMinHeightCm);
    setCustomChestCm(DEFAULTS.customChestCm);
    setCustomExpansionCm(DEFAULTS.customExpansionCm);
    setFeet(DEFAULTS.feet);
    setInches(DEFAULTS.inches);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Ruler className="h-4 w-4" aria-hidden="true" />
          Physical standards
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Height Weight Ratio For Recruitment
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Recruitment boards publish a minimum height and chest, then judge weight as
          &ldquo;proportionate to height&rdquo; using Body Mass Index. This checker turns that into a
          concrete kilogram band for your height and tells you which standards you currently meet.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="scheme">
              Recruitment scheme
            </label>
            <select
              id="scheme"
              className={`mt-2 ${INPUT_CLASS}`}
              value={schemeId}
              onChange={(event) => setSchemeId(event.target.value)}
            >
              {Object.values(SCHEMES).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{scheme.note}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="height">
                Your height (cm)
              </label>
              <input
                id="height"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="100"
                max="260"
                step="0.5"
                value={heightCm}
                onChange={(event) => setHeightCm(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="weight">
                Your weight (kg)
              </label>
              <input
                id="weight"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="20"
                max="300"
                step="0.5"
                value={weightKg}
                onChange={(event) => setWeightKg(event.target.value)}
              />
            </div>
          </div>

          {showsChest && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor="chest-relaxed">
                  Chest relaxed (cm)
                </label>
                <input
                  id="chest-relaxed"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={chestUnexpandedCm}
                  onChange={(event) => setChestUnexpandedCm(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="chest-expanded">
                  Chest fully expanded (cm)
                </label>
                <input
                  id="chest-expanded"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={chestExpandedCm}
                  onChange={(event) => setChestExpandedCm(event.target.value)}
                />
              </div>
            </div>
          )}

          {isCustom && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor="custom-height">
                  Required minimum height (cm)
                </label>
                <input
                  id="custom-height"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={customMinHeightCm}
                  onChange={(event) => setCustomMinHeightCm(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="custom-chest">
                  Required chest, relaxed (cm)
                </label>
                <input
                  id="custom-chest"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={customChestCm}
                  onChange={(event) => setCustomChestCm(event.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS} htmlFor="custom-expansion">
                  Required chest expansion (cm)
                </label>
                <input
                  id="custom-expansion"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={customExpansionCm}
                  onChange={(event) => setCustomExpansionCm(event.target.value)}
                />
              </div>
            </div>
          )}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Accepted weight for your height
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${num(result.minWeightKg)}–${num(result.maxWeightKg)} kg`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `BMI window ${result.bmiMin}–${result.bmiMax} applied to ${num(toNumber(heightCm))} cm`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the physical standard check to clipboard"
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
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Your BMI", hasError ? DASH : num2(result.bmi)],
            [
              "Devine reference weight for this height",
              hasError ? DASH : `${num(result.idealWeightKg)} kg`,
            ],
            [
              "Weight to lose to enter the band",
              hasError ? DASH : result.weightToLoseKg > 0 ? `${num(result.weightToLoseKg)} kg` : "none",
            ],
            [
              "Weight to gain to enter the band",
              hasError ? DASH : result.weightToGainKg > 0 ? `${num(result.weightToGainKg)} kg` : "none",
            ],
            [
              "Standards met",
              hasError ? DASH : `${result.passedCount} of ${result.totalCount}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <ShieldCheck className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
            Standard-by-standard result
          </h2>
          <ul className="mt-3 grid gap-2">
            {result.checks.map((check) => (
              <li
                key={check.id}
                className={`rounded-md px-3 py-2.5 text-sm ${
                  check.pass
                    ? "bg-[var(--success-soft)] text-[var(--success)]"
                    : "bg-[var(--danger-soft)] text-[var(--danger)]"
                }`}
              >
                <span className="flex items-center gap-2 font-semibold">
                  {check.pass ? (
                    <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <X className="h-4 w-4 shrink-0" aria-hidden="true" />
                  )}
                  {check.label}: need {check.requirement}, measured {check.measured}
                </span>
                <span className="mt-1 block text-[var(--foreground)]">{check.detail}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Know your height in feet and inches?</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="feet">
              Feet
            </label>
            <input
              id="feet"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={feet}
              onChange={(event) => setFeet(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="inches">
              Inches
            </label>
            <input
              id="inches"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={inches}
              onChange={(event) => setInches(event.target.value)}
            />
          </div>
        </div>
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">
          That is{" "}
          <span className="font-semibold text-[var(--foreground)]">
            {converted.error ? DASH : `${num(converted.cm)} cm`}
          </span>
          . Copy it into the height field above.
        </p>
      </section>

      {!hasError && chart.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">
            Height to weight chart at BMI {result.bmiMin}–{result.bmiMax}
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[300px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Height
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Minimum weight
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Maximum weight
                  </th>
                </tr>
              </thead>
              <tbody>
                {chart.map((row) => (
                  <tr key={row.heightCm} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{num(row.heightCm)} cm</td>
                    <td className="py-2 pr-3 text-right">{num(row.minKg)} kg</td>
                    <td className="py-2 text-right">{num(row.maxKg)} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Figures shown are the general-category standards published in the schemes&rsquo; own
        notifications; category, regional and trade relaxations exist and change from cycle to
        cycle. Always confirm against the current notification. BMI is a screening measure, not a
        diagnosis — a heavily muscled candidate can read high on BMI and still pass a medical board.
        Informational only, not medical advice.
      </p>
    </main>
  );
}
