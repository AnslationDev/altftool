"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Pipette, RotateCcw } from "lucide-react";

import {
  DEFAULT_CHARGELESS_LENGTH_M,
  DEFAULT_INCLUDED_PIPE_M,
  DEFAULT_MAX_PIPE_LENGTH_M,
  DEFAULT_MAX_VERTICAL_RISE_M,
  DEFAULT_TOPUP_GRAMS_PER_METRE,
  PIPE_GRADES,
  estimatePipingCost,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";
const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);
const m = (v) => (Number.isFinite(v) ? `${NUM1.format(v)} m` : DASH);

const DEFAULTS = {
  grade: PIPE_GRADES[0].value,
  pipeRun: "8",
  included: String(DEFAULT_INCLUDED_PIPE_M),
  pipeRate: "850",
  drainRun: "8",
  drainRate: "80",
  cableRate: "90",
  holes: "1",
  holeRate: "350",
  stand: "1200",
  base: "1500",
  rise: "0",
  chargeless: String(DEFAULT_CHARGELESS_LENGTH_M),
  gramsPerM: String(DEFAULT_TOPUP_GRAMS_PER_METRE),
  gasPrice: "3000",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNum = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [grade, setGrade] = useState(DEFAULTS.grade);
  const [pipeRun, setPipeRun] = useState(DEFAULTS.pipeRun);
  const [included, setIncluded] = useState(DEFAULTS.included);
  const [pipeRate, setPipeRate] = useState(DEFAULTS.pipeRate);
  const [drainRun, setDrainRun] = useState(DEFAULTS.drainRun);
  const [drainRate, setDrainRate] = useState(DEFAULTS.drainRate);
  const [cableRate, setCableRate] = useState(DEFAULTS.cableRate);
  const [holes, setHoles] = useState(DEFAULTS.holes);
  const [holeRate, setHoleRate] = useState(DEFAULTS.holeRate);
  const [stand, setStand] = useState(DEFAULTS.stand);
  const [base, setBase] = useState(DEFAULTS.base);
  const [rise, setRise] = useState(DEFAULTS.rise);
  const [chargeless, setChargeless] = useState(DEFAULTS.chargeless);
  const [gramsPerM, setGramsPerM] = useState(DEFAULTS.gramsPerM);
  const [gasPrice, setGasPrice] = useState(DEFAULTS.gasPrice);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      estimatePipingCost({
        pipeRunM: toNum(pipeRun),
        includedPipeM: toNum(included),
        pipeRatePerM: toNum(pipeRate),
        drainRunM: toNum(drainRun),
        includedDrainM: toNum(included),
        drainRatePerM: toNum(drainRate),
        cableRatePerM: toNum(cableRate),
        coreHoles: toNum(holes),
        coreRate: toNum(holeRate),
        standCost: toNum(stand),
        installationBase: toNum(base),
        verticalRiseM: toNum(rise),
        chargelessLengthM: toNum(chargeless),
        topUpGramsPerMetre: toNum(gramsPerM),
        refrigerantPricePerKg: toNum(gasPrice),
        maxPipeLengthM: DEFAULT_MAX_PIPE_LENGTH_M,
        maxVerticalRiseM: DEFAULT_MAX_VERTICAL_RISE_M,
      }),
    [
      pipeRun,
      included,
      pipeRate,
      drainRun,
      drainRate,
      cableRate,
      holes,
      holeRate,
      stand,
      base,
      rise,
      chargeless,
      gramsPerM,
      gasPrice,
    ],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "AC Copper Pipe Cost Estimator",
      `Copper run: ${m(toNum(pipeRun))} (${m(result.extraPipeM)} chargeable)`,
      ...result.items.map(([label, value]) => `${label}: ${money(value)}`),
      `Total: ${money(result.total)}`,
      `Extras over the standard installation: ${money(result.extraOverStandard)}`,
      ...result.warnings.map((w) => `Note: ${w}`),
    ].join("\n");
  }, [hasError, result, pipeRun]);

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
    setGrade(DEFAULTS.grade);
    setPipeRun(DEFAULTS.pipeRun);
    setIncluded(DEFAULTS.included);
    setPipeRate(DEFAULTS.pipeRate);
    setDrainRun(DEFAULTS.drainRun);
    setDrainRate(DEFAULTS.drainRate);
    setCableRate(DEFAULTS.cableRate);
    setHoles(DEFAULTS.holes);
    setHoleRate(DEFAULTS.holeRate);
    setStand(DEFAULTS.stand);
    setBase(DEFAULTS.base);
    setRise(DEFAULTS.rise);
    setChargeless(DEFAULTS.chargeless);
    setGramsPerM(DEFAULTS.gramsPerM);
    setGasPrice(DEFAULTS.gasPrice);
    setCopied(false);
  };

  const fields = [
    ["acp-piperun", "Copper run indoor to outdoor (m)", pipeRun, setPipeRun, "0.5"],
    ["acp-included", "Length included free (m)", included, setIncluded, "0.5"],
    ["acp-piperate", "Copper pair rate (₹ per m)", pipeRate, setPipeRate, "25"],
    ["acp-drainrun", "Drain pipe run (m)", drainRun, setDrainRun, "0.5"],
    ["acp-drainrate", "Drain pipe rate (₹ per m)", drainRate, setDrainRate, "5"],
    ["acp-cablerate", "Interconnecting cable rate (₹ per m)", cableRate, setCableRate, "5"],
    ["acp-holes", "Core-drilled wall holes", holes, setHoles, "1"],
    ["acp-holerate", "Core drilling rate (₹ per hole)", holeRate, setHoleRate, "25"],
    ["acp-stand", "Outdoor unit stand or bracket (₹)", stand, setStand, "50"],
    ["acp-base", "Installation labour (₹)", base, setBase, "50"],
    ["acp-rise", "Height difference between units (m)", rise, setRise, "0.5"],
    ["acp-chargeless", "Chargeless pipe length from the manual (m)", chargeless, setChargeless, "0.5"],
    ["acp-grams", "Top-up refrigerant (g per extra m)", gramsPerM, setGramsPerM, "1"],
    ["acp-gasprice", "Refrigerant price (₹ per kg)", gasPrice, setGasPrice, "100"],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Pipette className="h-4 w-4" aria-hidden="true" />
          AC installation
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          AC Copper Pipe Cost Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The free installation covers a few metres of copper. Everything past that — pipe, drain,
          cable, core holes and the gas top-up a long line needs — is billed separately. Price it
          before the technician arrives.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="mb-4">
          <label className={LABEL_CLASS} htmlFor="acp-grade">
            Copper pair size for your capacity
          </label>
          <select
            id="acp-grade"
            className={`mt-2 ${INPUT_CLASS}`}
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
          >
            {PIPE_GRADES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Larger pairs cost more per metre — set the rate below to the price quoted for this size.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map(([id, label, value, setter, step]) => (
            <div key={id}>
              <label className={LABEL_CLASS} htmlFor={id}>
                {label}
              </label>
              <input
                id={id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step={step}
                value={value}
                onChange={(e) => setter(e.target.value)}
              />
            </div>
          ))}
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
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total installation cost
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.total)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the estimate."
                : `${money(result.extraOverStandard)} of it is material and extras beyond the labour charge`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy AC piping cost estimate"
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

        {!hasError &&
          result.warnings.map((warning) => (
            <p
              key={warning}
              className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
            >
              {warning}
            </p>
          ))}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(hasError
            ? [
                ["Extra copper pair", DASH],
                ["Extra drain pipe", DASH],
                ["Extra interconnecting cable", DASH],
                ["Core drilling", DASH],
                ["Outdoor unit stand or bracket", DASH],
                ["Refrigerant top-up", DASH],
                ["Installation labour", DASH],
              ]
            : result.items.map(([label, value]) => [label, money(value)])
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="font-semibold">Total</dt>
            <dd className="text-right font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.total)}
            </dd>
          </div>
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Rates are yours to set — copper moves with the commodity market and labour is
        city-dependent. Chargeless length, top-up grams per metre and the maximum pipe run differ by
        model: take them from your unit's installation manual rather than the defaults here, and
        insist on a nitrogen pressure test and vacuum before the gas is released.
      </p>
    </main>
  );
}
