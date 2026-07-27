"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gauge, RotateCcw } from "lucide-react";

import {
  DEFAULT_AIR_LOSS_PSI_PER_MONTH,
  FUEL_PENALTY_PER_PSI,
  NITROGEN_LOSS_FACTOR,
  compareNitrogenVsAir,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  targetPsi: "33",
  monthsBetweenChecks: "3",
  airLossPsiPerMonth: String(DEFAULT_AIR_LOSS_PSI_PER_MONTH),
  annualKm: "12000",
  kmPerLitre: "15",
  fuelPricePerLitre: "105",
  setCost: "24000",
  baseLifeKm: "40000",
  tyres: "4",
  nitrogenFillCostPerTyre: "100",
  airFillCostPerTyre: "0",
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [targetPsi, setTargetPsi] = useState(DEFAULTS.targetPsi);
  const [monthsBetweenChecks, setMonthsBetweenChecks] = useState(DEFAULTS.monthsBetweenChecks);
  const [airLossPsiPerMonth, setAirLossPsiPerMonth] = useState(DEFAULTS.airLossPsiPerMonth);
  const [annualKm, setAnnualKm] = useState(DEFAULTS.annualKm);
  const [kmPerLitre, setKmPerLitre] = useState(DEFAULTS.kmPerLitre);
  const [fuelPricePerLitre, setFuelPricePerLitre] = useState(DEFAULTS.fuelPricePerLitre);
  const [setCost, setSetCost] = useState(DEFAULTS.setCost);
  const [baseLifeKm, setBaseLifeKm] = useState(DEFAULTS.baseLifeKm);
  const [tyres, setTyres] = useState(DEFAULTS.tyres);
  const [nitrogenFillCostPerTyre, setNitrogenFillCostPerTyre] = useState(
    DEFAULTS.nitrogenFillCostPerTyre,
  );
  const [airFillCostPerTyre, setAirFillCostPerTyre] = useState(DEFAULTS.airFillCostPerTyre);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      compareNitrogenVsAir({
        targetPsi: toNumber(targetPsi),
        monthsBetweenChecks: toNumber(monthsBetweenChecks),
        airLossPsiPerMonth: toNumber(airLossPsiPerMonth),
        annualKm: toNumber(annualKm),
        kmPerLitre: toNumber(kmPerLitre),
        fuelPricePerLitre: toNumber(fuelPricePerLitre),
        setCost: toNumber(setCost),
        baseLifeKm: toNumber(baseLifeKm),
        tyres: toNumber(tyres),
        nitrogenFillCostPerTyre: toNumber(nitrogenFillCostPerTyre),
        airFillCostPerTyre: toNumber(airFillCostPerTyre),
      }),
    [
      targetPsi,
      monthsBetweenChecks,
      airLossPsiPerMonth,
      annualKm,
      kmPerLitre,
      fuelPricePerLitre,
      setCost,
      baseLifeKm,
      tyres,
      nitrogenFillCostPerTyre,
      airFillCostPerTyre,
    ],
  );

  const hasError = Boolean(result.error);
  const dash = "—";

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Nitrogen vs Air Tyre Cost",
      `Placard pressure ${targetPsi} psi, topped up every ${monthsBetweenChecks} month(s), ${result.tyres} tyres`,
      `Average deficit on air: ${num(result.air.avgDeficitPsi)} psi (${num(result.air.percentUnder)}% under)`,
      `Average deficit on nitrogen: ${num(result.nitrogen.avgDeficitPsi)} psi (${num(result.nitrogen.percentUnder)}% under)`,
      `Air: extra fuel ${money(result.air.extraFuelCost)} + tyre wear ${money(result.air.annualTyreCost)} + filling ${money(result.air.annualServiceCost)} = ${money(result.air.totalAnnualCost)} a year`,
      `Nitrogen: extra fuel ${money(result.nitrogen.extraFuelCost)} + tyre wear ${money(result.nitrogen.annualTyreCost)} + filling ${money(result.nitrogen.annualServiceCost)} = ${money(result.nitrogen.totalAnnualCost)} a year`,
      `Net: ${result.nitrogenWins ? "nitrogen saves" : "nitrogen costs"} ${money(Math.abs(result.netAnnualSaving))} a year`,
      `Break-even nitrogen charge: ${money(result.breakEvenFillCostPerTyre)} per tyre per fill`,
    ].join("\n");
  }, [hasError, result, targetPsi, monthsBetweenChecks]);

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
    setTargetPsi(DEFAULTS.targetPsi);
    setMonthsBetweenChecks(DEFAULTS.monthsBetweenChecks);
    setAirLossPsiPerMonth(DEFAULTS.airLossPsiPerMonth);
    setAnnualKm(DEFAULTS.annualKm);
    setKmPerLitre(DEFAULTS.kmPerLitre);
    setFuelPricePerLitre(DEFAULTS.fuelPricePerLitre);
    setSetCost(DEFAULTS.setCost);
    setBaseLifeKm(DEFAULTS.baseLifeKm);
    setTyres(DEFAULTS.tyres);
    setNitrogenFillCostPerTyre(DEFAULTS.nitrogenFillCostPerTyre);
    setAirFillCostPerTyre(DEFAULTS.airFillCostPerTyre);
    setCopied(false);
  };

  const columns = hasError ? [] : [result.air, result.nitrogen];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Gauge className="h-4 w-4" aria-hidden="true" />
          Tyres &amp; wheels
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Nitrogen vs Air Tyre Cost</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Nitrogen leaks more slowly than air, so the tyres sit closer to the placard pressure between
          top-ups. This works out what that is worth in fuel and tread — and whether it covers the
          filling charge.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">How you run the tyres</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="nt-psi">
              Placard cold pressure (psi)
            </label>
            <input
              id="nt-psi"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={targetPsi}
              onChange={(event) => setTargetPsi(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nt-months">
              You actually top up every (months)
            </label>
            <input
              id="nt-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.25"
              max="24"
              step="0.25"
              value={monthsBetweenChecks}
              onChange={(event) => setMonthsBetweenChecks(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nt-loss">
              Pressure lost on air (psi per month)
            </label>
            <input
              id="nt-loss"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={airLossPsiPerMonth}
              onChange={(event) => setAirLossPsiPerMonth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nt-tyres">
              Tyres on the vehicle
            </label>
            <input
              id="nt-tyres"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="12"
              step="1"
              value={tyres}
              onChange={(event) => setTyres(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nt-n2">
              Nitrogen charge per tyre per fill (INR)
            </label>
            <input
              id="nt-n2"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={nitrogenFillCostPerTyre}
              onChange={(event) => setNitrogenFillCostPerTyre(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nt-air">
              Air charge per tyre per top-up (INR)
            </label>
            <input
              id="nt-air"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={airFillCostPerTyre}
              onChange={(event) => setAirFillCostPerTyre(event.target.value)}
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            ["1", "Monthly"],
            ["3", "Quarterly"],
            ["6", "Twice a year"],
            ["12", "Once a year"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMonthsBetweenChecks(value)}
              aria-pressed={monthsBetweenChecks === value}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Running costs</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="nt-km">
              Distance a year (km)
            </label>
            <input
              id="nt-km"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="500"
              value={annualKm}
              onChange={(event) => setAnnualKm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nt-kmpl">
              Fuel economy (km per litre)
            </label>
            <input
              id="nt-kmpl"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.5"
              value={kmPerLitre}
              onChange={(event) => setKmPerLitre(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nt-fuel">
              Fuel price (INR per litre)
            </label>
            <input
              id="nt-fuel"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={fuelPricePerLitre}
              onChange={(event) => setFuelPricePerLitre(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nt-set">
              Cost of a set of tyres, fitted (INR)
            </label>
            <input
              id="nt-set"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1000"
              value={setCost}
              onChange={(event) => setSetCost(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="nt-life">
              Tread life at correct pressure (km)
            </label>
            <input
              id="nt-life"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1000"
              value={baseLifeKm}
              onChange={(event) => setBaseLifeKm(event.target.value)}
            />
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              {hasError || result.nitrogenWins ? "Nitrogen saves a year" : "Nitrogen costs you a year"}
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                hasError ? "text-[var(--primary)]" : result.nitrogenWins ? "text-[var(--success)]" : "text-[var(--danger)]"
              }`}
            >
              {hasError ? dash : money(Math.abs(result.netAnnualSaving))}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? dash
                : `Break-even charge is ${money(result.breakEvenFillCostPerTyre)} per tyre per fill`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the nitrogen versus air comparison"
              className={GHOST_BTN}
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
            [
              "Average deficit on air",
              hasError ? dash : `${num(result.air.avgDeficitPsi)} psi (${num(result.air.percentUnder)}% under)`,
            ],
            [
              "Average deficit on nitrogen",
              hasError
                ? dash
                : `${num(result.nitrogen.avgDeficitPsi)} psi (${num(result.nitrogen.percentUnder)}% under)`,
            ],
            ["Deficit nitrogen removes", hasError ? dash : `${num(result.deficitReductionPsi)} psi`],
            ["Fills a year", hasError ? dash : `${num(result.eventsPerYear)} × ${result.tyres} tyres`],
            ["Total cost on air", hasError ? dash : `${money(result.air.totalAnnualCost)} a year`],
            ["Total cost on nitrogen", hasError ? dash : `${money(result.nitrogen.totalAnnualCost)} a year`],
            [
              "Over five years",
              hasError
                ? dash
                : `${result.savingOverFiveYears >= 0 ? "saves " : "costs "}${money(Math.abs(result.savingOverFiveYears))}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError &&
          result.notes.map((note) => (
            <p
              key={note}
              className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
            >
              {note}
            </p>
          ))}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Where the money goes</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Per year</th>
                  {columns.map((column) => (
                    <th key={column.label} scope="col" className="py-2 pr-3 text-right font-semibold">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Loss rate", (column) => `${num(column.lossPsiPerMonth)} psi/mo`],
                  ["Fuel penalty", (column) => `${num(column.fuelPenaltyPercent)}%`],
                  ["Extra fuel", (column) => money(column.extraFuelCost)],
                  ["Tread life", (column) => `${NUM0.format(column.effectiveLifeKm)} km`],
                  ["Tyre wear cost", (column) => money(column.annualTyreCost)],
                  ["Filling charges", (column) => money(column.annualServiceCost)],
                  ["Total", (column) => money(column.totalAnnualCost)],
                ].map(([label, render]) => (
                  <tr key={label} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{label}</td>
                    {columns.map((column) => (
                      <td key={column.label} className="py-2 pr-3 text-right">
                        {render(column)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            Fuel penalty uses the US Department of Energy figure of about{" "}
            {NUM.format(FUEL_PENALTY_PER_PSI * 100)}% of fuel economy per psi of under-inflation, and
            nitrogen is modelled as losing {num(NITROGEN_LOSS_FACTOR * 100)}% of the air loss rate.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A cost model, not a test result. Nitrogen changes only how fast a tyre loses pressure — it does
        not stop punctures, slow rubber ageing or replace a monthly pressure check. Topping up nitrogen
        tyres with ordinary air in an emergency is safe; it just dilutes the purity.
      </p>
    </main>
  );
}
