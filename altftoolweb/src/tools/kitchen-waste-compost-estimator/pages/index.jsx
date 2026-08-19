"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sprout } from "lucide-react";

import {
  BROWN_MATERIALS,
  GREEN_MATERIALS,
  TARGET_CN_RATIO,
  estimateCompost,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const kg = (v) => (Number.isFinite(v) ? `${NUM1.format(v)} kg` : DASH);
const kg2 = (v) => (Number.isFinite(v) ? `${NUM2.format(v)} kg` : DASH);
const pct = (v) => (Number.isFinite(v) ? `${NUM1.format(v)}%` : DASH);
const litres = (v) => (Number.isFinite(v) ? `${NUM1.format(v)} litres` : DASH);
const ratio = (v) => (Number.isFinite(v) ? `${NUM1.format(v)}:1` : DASH);

const DEFAULTS = {
  waste: "3",
  green: "mixed-kitchen",
  brown: "dry-leaves",
  target: String(TARGET_CN_RATIO),
  cycle: "12",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [waste, setWaste] = useState(DEFAULTS.waste);
  const [green, setGreen] = useState(DEFAULTS.green);
  const [brown, setBrown] = useState(DEFAULTS.brown);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [cycle, setCycle] = useState(DEFAULTS.cycle);
  const [copied, setCopied] = useState(false);

  const greenMaterial =
    GREEN_MATERIALS.find((item) => item.id === green) ?? GREEN_MATERIALS[0];
  const brownMaterial =
    BROWN_MATERIALS.find((item) => item.id === brown) ?? BROWN_MATERIALS[0];

  const result = useMemo(
    () =>
      estimateCompost({
        kitchenWasteKgPerWeek: toNumber(waste),
        greenCn: greenMaterial.cn,
        greenMoisture: greenMaterial.moisture,
        brownCn: brownMaterial.cn,
        brownMoisture: brownMaterial.moisture,
        targetCn: toNumber(target),
        cycleWeeks: toNumber(cycle),
      }),
    [waste, greenMaterial, brownMaterial, target, cycle],
  );

  const failed = Boolean(result.error);
  const noBrownsNeeded = !failed && result.brownsRatio === 0;

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Kitchen Waste Compost Estimator",
      `Kitchen waste: ${kg(result.greenWetPerWeek)} a week (${kg(result.kitchenWastePerYear)} a year)`,
      `${brownMaterial.label} to add: ${kg2(result.brownWetPerWeek)} a week (${kg(result.brownsPerYear)} a year)`,
      `Starting C:N ratio: ${ratio(result.actualStartingCn)} at ${pct(result.startingMoisturePct)} moisture`,
      `Finished compost: ${kg2(result.finishedWetPerWeek)} a week, ${kg(result.compostPerYear)} a year`,
      `Yield: ${pct(result.yieldPct)} of the wet feedstock`,
      `Diverted from landfill: ${kg(result.totalFeedstockPerYear)} a year`,
      `Nitrogen in the compost: ${kg2(result.nitrogenPerYear)} a year, about ${kg2(result.ureaEquivalentPerYear)} of urea`,
      `Bin size for a ${result.cycleWeeks}-week batch: ${litres(result.binVolumeLitres)}`,
    ].join("\n");
  }, [failed, result, brownMaterial]);

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
    setWaste(DEFAULTS.waste);
    setGreen(DEFAULTS.green);
    setBrown(DEFAULTS.brown);
    setTarget(DEFAULTS.target);
    setCycle(DEFAULTS.cycle);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Sprout className="h-4 w-4" aria-hidden="true" />
          Home composting
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Kitchen Waste Compost Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Kitchen scraps alone are too nitrogen-rich to compost well. This works out how much dry
          brown material balances them to a healthy carbon-to-nitrogen ratio, and how much finished
          compost comes out at the other end.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="comp-waste">
              Kitchen waste a week (kg)
            </label>
            <input
              id="comp-waste"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={waste}
              onChange={(event) => setWaste(event.target.value)}
            />
            <p className={HINT_CLASS}>Weigh one bin bag to get a realistic figure.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="comp-green">
              What the waste mostly is
            </label>
            <select
              id="comp-green"
              className={`mt-2 ${INPUT_CLASS}`}
              value={green}
              onChange={(event) => setGreen(event.target.value)}
            >
              {GREEN_MATERIALS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} (C:N {item.cn}:1)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="comp-brown">
              Brown material you can add
            </label>
            <select
              id="comp-brown"
              className={`mt-2 ${INPUT_CLASS}`}
              value={brown}
              onChange={(event) => setBrown(event.target.value)}
            >
              {BROWN_MATERIALS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} (C:N {item.cn}:1)
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>
              The higher the C:N, the less of it you need by weight.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="comp-target">
              Target starting C:N ratio
            </label>
            <input
              id="comp-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="10"
              max="60"
              step="1"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
            <p className={HINT_CLASS}>25 to 30 is the range a pile heats up best in.</p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="comp-cycle">
              Weeks a batch takes to mature
            </label>
            <input
              id="comp-cycle"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="104"
              step="1"
              value={cycle}
              onChange={(event) => setCycle(event.target.value)}
            />
            <p className={HINT_CLASS}>
              8 to 12 weeks for a turned hot pile, 6 months or more for a cold heap.
            </p>
          </div>
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        role="status"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Finished compost a year
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : kg(result.compostPerYear)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the inputs above to see an estimate."
                : `${pct(result.yieldPct)} of the ${kg(result.totalFeedstockPerYear)} you put in`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy compost estimate"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {noBrownsNeeded && (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
            These greens already sit at or above your target C:N, so no brown material is needed to
            balance them. Adding some anyway still helps airflow and soaks up moisture.
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [`${brownMaterial.label} to add a week`, failed ? DASH : kg2(result.brownWetPerWeek)],
            [`${brownMaterial.label} to add a year`, failed ? DASH : kg(result.brownsPerYear)],
            ["Blend by dry weight", failed ? DASH : `1 part greens to ${NUM2.format(result.brownsRatio)} parts browns`],
            ["Starting C:N ratio", failed ? DASH : ratio(result.actualStartingCn)],
            ["Starting moisture", failed ? DASH : pct(result.startingMoisturePct)],
            ["Compost produced a week", failed ? DASH : kg2(result.finishedWetPerWeek)],
            ["Mass lost to water and CO2 a year", failed ? DASH : kg(result.massLostPerYear)],
            ["Kitchen waste kept out of landfill a year", failed ? DASH : kg(result.kitchenWastePerYear)],
            ["Total material diverted a year", failed ? DASH : kg(result.totalFeedstockPerYear)],
            ["Nitrogen in the finished compost", failed ? DASH : `${kg2(result.nitrogenPerYear)} a year (${pct(result.nitrogenPctOfDryCompost)} of dry weight)`],
            ["Equivalent urea by nitrogen", failed ? DASH : `${kg2(result.ureaEquivalentPerYear)} a year`],
            ["Finished compost C:N", failed ? DASH : ratio(result.finishedCn)],
            [
              `Bin volume for a ${failed ? DASH : result.cycleWeeks}-week batch`,
              failed ? DASH : litres(result.binVolumeLitres),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">C:N ratios of common materials</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Material
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  C:N
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Moisture
                </th>
              </tr>
            </thead>
            <tbody>
              {[...GREEN_MATERIALS, ...BROWN_MATERIALS].map((item) => (
                <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-medium">{item.label}</td>
                  <td className="py-2 pr-3 text-right whitespace-nowrap">{item.cn}:1</td>
                  <td className="py-2 text-right whitespace-nowrap text-[var(--muted-foreground)]">
                    {NUM1.format(item.moisture * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        An estimate built on typical values. Real yield depends on how well the pile is aerated,
        how wet it stays and what goes in — meat, dairy and oily food attract pests in a home bin
        and are best left out of a passive heap.
      </p>
    </main>
  );
}
