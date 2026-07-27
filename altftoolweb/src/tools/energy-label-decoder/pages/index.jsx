"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Tag } from "lucide-react";

import { BEE_ISEER_ANNUAL_HOURS, LABEL_FIELDS, decodeEnergyLabel } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";
const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);
const num1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);
const units = (v) => (Number.isFinite(v) ? `${NUM0.format(v)} kWh` : DASH);
const kg = (v) => (Number.isFinite(v) ? `${NUM0.format(v)} kg` : DASH);
const yrs = (v) => (Number.isFinite(v) ? `${NUM1.format(v)} years` : DASH);

const DEFAULTS = {
  mode: "iseer",
  kwhA: "400",
  kwhB: "250",
  tons: "1.5",
  iseerA: "3.3",
  iseerB: "5.2",
  hours: String(BEE_ISEER_ANNUAL_HOURS),
  tariff: "8",
  priceDiff: "15000",
  life: "10",
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
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [kwhA, setKwhA] = useState(DEFAULTS.kwhA);
  const [kwhB, setKwhB] = useState(DEFAULTS.kwhB);
  const [tons, setTons] = useState(DEFAULTS.tons);
  const [iseerA, setIseerA] = useState(DEFAULTS.iseerA);
  const [iseerB, setIseerB] = useState(DEFAULTS.iseerB);
  const [hours, setHours] = useState(DEFAULTS.hours);
  const [tariff, setTariff] = useState(DEFAULTS.tariff);
  const [priceDiff, setPriceDiff] = useState(DEFAULTS.priceDiff);
  const [life, setLife] = useState(DEFAULTS.life);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      decodeEnergyLabel({
        mode,
        annualKwhA: toNumber(kwhA),
        annualKwhB: toNumber(kwhB),
        capacityTons: toNumber(tons),
        iseerA: toNumber(iseerA),
        iseerB: toNumber(iseerB),
        hoursPerYear: toNumber(hours),
        tariffPerKwh: toNumber(tariff),
        priceDifference: toNumber(priceDiff),
        lifeYears: toNumber(life),
      }),
    [mode, kwhA, kwhB, tons, iseerA, iseerB, hours, tariff, priceDiff, life],
  );

  const failed = Boolean(result.error);
  const betterB = !failed && result.annualKwhSaved > 0;

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Energy Label Decoder",
      mode === "iseer"
        ? `Air conditioner, ${toNumber(tons)} ton, ${toNumber(hours)} cooling hours a year`
        : "Comparing two annual-consumption labels",
      `Model A: ${units(result.modelA.annualKwh)} a year, ${money(result.modelA.annualCost)} to run`,
      `Model B: ${units(result.modelB.annualKwh)} a year, ${money(result.modelB.annualCost)} to run`,
      `Difference: ${units(result.annualKwhSaved)} and ${money(result.annualCostSaved)} a year (${num1(result.efficiencyGainPct)}% less)`,
      result.paybackYears === null
        ? "No price premium to pay back"
        : `Price premium pays back in ${yrs(result.paybackYears)}`,
      `Net gain over ${result.life} years: ${money(result.netLifetimeGain)}`,
      `CO2 avoided over ${result.life} years: ${kg(result.lifetimeCo2SavedKg)}`,
    ].join("\n");
  }, [failed, result, mode, tons, hours]);

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
    setMode(DEFAULTS.mode);
    setKwhA(DEFAULTS.kwhA);
    setKwhB(DEFAULTS.kwhB);
    setTons(DEFAULTS.tons);
    setIseerA(DEFAULTS.iseerA);
    setIseerB(DEFAULTS.iseerB);
    setHours(DEFAULTS.hours);
    setTariff(DEFAULTS.tariff);
    setPriceDiff(DEFAULTS.priceDiff);
    setLife(DEFAULTS.life);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Tag className="h-4 w-4" aria-hidden="true" />
          BEE star label
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Energy Label Decoder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The stars are a band, not a measurement — and the bands get tightened every few years.
          The numbers underneath them, kWh per year or ISEER, are what actually decide your bill.
          Put both models&apos; figures in and see the difference in money.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="lbl-mode">
              What does the label state?
            </label>
            <select
              id="lbl-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              <option value="iseer">ISEER — room air conditioner</option>
              <option value="kwh">kWh per year — fridge, washing machine, TV</option>
            </select>
          </div>

          {mode === "kwh" ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="lbl-kwh-a">
                  Model A: annual consumption (kWh/year)
                </label>
                <input
                  id="lbl-kwh-a"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="5"
                  value={kwhA}
                  onChange={(event) => setKwhA(event.target.value)}
                />
                <p className={HINT_CLASS}>The cheaper or lower-rated model.</p>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="lbl-kwh-b">
                  Model B: annual consumption (kWh/year)
                </label>
                <input
                  id="lbl-kwh-b"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="5"
                  value={kwhB}
                  onChange={(event) => setKwhB(event.target.value)}
                />
                <p className={HINT_CLASS}>The costlier, more efficient model.</p>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="lbl-tons">
                  Cooling capacity (tons)
                </label>
                <input
                  id="lbl-tons"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={tons}
                  onChange={(event) => setTons(event.target.value)}
                />
                <p className={HINT_CLASS}>Both models must be the same capacity to compare.</p>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="lbl-hours">
                  Cooling hours a year
                </label>
                <input
                  id="lbl-hours"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="8760"
                  step="50"
                  value={hours}
                  onChange={(event) => setHours(event.target.value)}
                />
                <p className={HINT_CLASS}>
                  BEE&apos;s own ISEER test assumes {BEE_ISEER_ANNUAL_HOURS} hours a year.
                </p>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="lbl-iseer-a">
                  Model A: ISEER
                </label>
                <input
                  id="lbl-iseer-a"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.05"
                  value={iseerA}
                  onChange={(event) => setIseerA(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="lbl-iseer-b">
                  Model B: ISEER
                </label>
                <input
                  id="lbl-iseer-b"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.05"
                  value={iseerB}
                  onChange={(event) => setIseerB(event.target.value)}
                />
              </div>
            </>
          )}

          <div>
            <label className={LABEL_CLASS} htmlFor="lbl-tariff">
              Electricity tariff (per kWh)
            </label>
            <input
              id="lbl-tariff"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={tariff}
              onChange={(event) => setTariff(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lbl-price">
              How much more model B costs
            </label>
            <input
              id="lbl-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={priceDiff}
              onChange={(event) => setPriceDiff(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="lbl-life">
              Years you expect to keep it
            </label>
            <input
              id="lbl-life"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="30"
              step="1"
              value={life}
              onChange={(event) => setLife(event.target.value)}
            />
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Model B saves a year
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : money(result.annualCostSaved)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the inputs above to decode the labels."
                : `${units(result.annualKwhSaved)} less a year, ${num1(result.efficiencyGainPct)}% more efficient`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy label comparison"
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

        {!failed && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
              betterB && result.paysBackWithinLife
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : "bg-[var(--warning-soft)] text-[var(--warning)]"
            }`}
          >
            {result.verdict}
          </p>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Model A running cost
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {failed ? DASH : money(result.modelA.annualCost)}
            </p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {failed ? DASH : `${units(result.modelA.annualKwh)} a year`}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Model B running cost
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {failed ? DASH : money(result.modelB.annualCost)}
            </p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {failed ? DASH : `${units(result.modelB.annualKwh)} a year`}
            </p>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Monthly running cost, model A", failed ? DASH : money(result.modelA.monthlyCost)],
            ["Monthly running cost, model B", failed ? DASH : money(result.modelB.monthlyCost)],
            [
              "Price premium pays back in",
              failed || result.paybackYears === null ? DASH : yrs(result.paybackYears),
            ],
            [
              `Total saved over ${failed ? DASH : result.life} years`,
              failed ? DASH : money(result.lifetimeCostSaved),
            ],
            ["Less the price premium", failed ? DASH : money(result.priceDifference)],
            ["Net gain", failed ? DASH : money(result.netLifetimeGain)],
            ["Units saved over its life", failed ? DASH : units(result.lifetimeKwhSaved)],
            ["CO2 avoided over its life", failed ? DASH : kg(result.lifetimeCo2SavedKg)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What each part of the label means</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  On the label
                </th>
                <th scope="col" className="py-2 font-semibold">
                  What it actually tells you
                </th>
              </tr>
            </thead>
            <tbody>
              {LABEL_FIELDS.map((row) => (
                <tr key={row.field} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 align-top font-semibold">{row.field}</td>
                  <td className="py-2 align-top text-[var(--muted-foreground)]">{row.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Label figures come from a standard test cycle, and a real household — a fuller fridge, a
        hotter room, longer AC hours — will use more than the printed number. Because BEE revises
        the star bands on a schedule, always compare the kWh or ISEER value between two labels
        rather than the star count, especially when one model has been on the shelf longer.
      </p>
    </main>
  );
}
