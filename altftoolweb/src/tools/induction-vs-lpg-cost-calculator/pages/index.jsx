"use client";

import { useMemo, useState } from "react";
import { Check, CookingPot, Copy, RotateCcw } from "lucide-react";

import { buildTariffTable, compareInductionVsLpg } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const money2 = (value) => (Number.isFinite(value) ? INR2.format(value) : "—");
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : "—");

const DEFAULTS = {
  cylinderKg: "14.2",
  cylinderPrice: "900",
  daysPerCylinder: "30",
  lpgStoveEfficiencyPercent: "68",
  inductionEfficiencyPercent: "85",
  tariffPerKwh: "8",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

function Field({ id, label, value, onChange, min, max, step, hint }) {
  return (
    <div>
      <label className={LABEL_CLASS} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`mt-2 ${INPUT_CLASS}`}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint ? <p className="mt-1 text-xs text-[var(--muted-foreground)]">{hint}</p> : null}
    </div>
  );
}

export default function ToolHome() {
  const [cylinderKg, setCylinderKg] = useState(DEFAULTS.cylinderKg);
  const [cylinderPrice, setCylinderPrice] = useState(DEFAULTS.cylinderPrice);
  const [daysPerCylinder, setDaysPerCylinder] = useState(DEFAULTS.daysPerCylinder);
  const [lpgEff, setLpgEff] = useState(DEFAULTS.lpgStoveEfficiencyPercent);
  const [indEff, setIndEff] = useState(DEFAULTS.inductionEfficiencyPercent);
  const [tariffPerKwh, setTariffPerKwh] = useState(DEFAULTS.tariffPerKwh);
  const [copied, setCopied] = useState(false);

  const input = useMemo(
    () => ({
      cylinderKg: toNumber(cylinderKg),
      cylinderPrice: toNumber(cylinderPrice),
      daysPerCylinder: toNumber(daysPerCylinder),
      lpgStoveEfficiencyPercent: toNumber(lpgEff),
      inductionEfficiencyPercent: toNumber(indEff),
      tariffPerKwh: toNumber(tariffPerKwh),
    }),
    [cylinderKg, cylinderPrice, daysPerCylinder, lpgEff, indEff, tariffPerKwh],
  );

  const result = useMemo(() => compareInductionVsLpg(input), [input]);
  const table = useMemo(() => buildTariffTable(input), [input]);
  const hasError = Boolean(result.error);

  const verdict = hasError
    ? "—"
    : result.cheaper === "induction"
      ? `Induction is cheaper by ${money(Math.abs(result.monthlyDifference))} a month`
      : result.cheaper === "lpg"
        ? `LPG is cheaper by ${money(Math.abs(result.monthlyDifference))} a month`
        : "The two cost the same";

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Induction vs LPG Cost",
      `Cooking energy needed: ${num(result.usefulKwhPerMonth)} useful kWh a month`,
      `LPG: ${money(result.lpgMonthlyCost)} a month (${money2(result.lpgCostPerUsefulKwh)} per useful kWh)`,
      `Induction: ${money(result.inductionMonthlyCost)} a month, ${num(result.inductionMonthlyKwh)} units (${money2(result.inductionCostPerUsefulKwh)} per useful kWh)`,
      verdict,
      `Break-even electricity tariff: ${money2(result.breakEvenTariff)} per unit`,
    ].join("\n");
  }, [hasError, result, verdict]);

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
    setCylinderKg(DEFAULTS.cylinderKg);
    setCylinderPrice(DEFAULTS.cylinderPrice);
    setDaysPerCylinder(DEFAULTS.daysPerCylinder);
    setLpgEff(DEFAULTS.lpgStoveEfficiencyPercent);
    setIndEff(DEFAULTS.inductionEfficiencyPercent);
    setTariffPerKwh(DEFAULTS.tariffPerKwh);
    setCopied(false);
  };

  const breakdown = hasError
    ? []
    : [
        ["Cooking heat you actually use", `${num(result.usefulKwhPerMonth)} kWh a month`],
        ["LPG price per kg", money2(result.pricePerKgLpg)],
        ["Useful heat from 1 kg of LPG", `${num(result.usefulKwhPerKg)} kWh`],
        ["LPG cost per useful kWh", money2(result.lpgCostPerUsefulKwh)],
        ["Induction cost per useful kWh", money2(result.inductionCostPerUsefulKwh)],
        ["LPG bill", `${money(result.lpgMonthlyCost)}/month · ${money(result.lpgAnnualCost)}/year`],
        ["Induction bill", `${money(result.inductionMonthlyCost)}/month · ${money(result.inductionAnnualCost)}/year`],
        ["Extra units on your meter", `${num(result.inductionMonthlyKwh)} kWh a month`],
        ["Cylinders a year on gas", num(result.cylindersPerYear)],
        ["Break-even electricity tariff", `${money2(result.breakEvenTariff)} per unit`],
        ["Break-even cylinder price", money(result.breakEvenCylinderPrice)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CookingPot className="h-4 w-4" aria-hidden="true" />
          Appliance energy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Induction vs LPG Cost Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Compared on the heat that actually reaches the pot, so the 68% efficiency of a gas burner
          and the 85% of an induction coil are both accounted for.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="il-cyl-kg"
            label="Gas in one cylinder (kg)"
            value={cylinderKg}
            onChange={setCylinderKg}
            min="1"
            max="100"
            step="0.1"
            hint="Domestic Indian cylinder holds 14.2 kg."
          />
          <Field
            id="il-cyl-price"
            label="Price you pay per cylinder (₹)"
            value={cylinderPrice}
            onChange={setCylinderPrice}
            min="1"
            step="10"
            hint="Use the amount actually debited, after any subsidy credit."
          />
          <Field
            id="il-days"
            label="Days one cylinder lasts"
            value={daysPerCylinder}
            onChange={setDaysPerCylinder}
            min="1"
            max="365"
            step="1"
            hint="This is what sets how much cooking you do."
          />
          <Field
            id="il-tariff"
            label="Electricity tariff (₹ per unit)"
            value={tariffPerKwh}
            onChange={setTariffPerKwh}
            min="0"
            step="0.25"
            hint="Use your highest slab rate — cooking sits on top of existing use."
          />
          <Field
            id="il-lpg-eff"
            label="LPG burner efficiency (%)"
            value={lpgEff}
            onChange={setLpgEff}
            min="1"
            max="100"
            step="1"
            hint="IS 4246 floor for open burners is 68%."
          />
          <Field
            id="il-ind-eff"
            label="Induction hob efficiency (%)"
            value={indEff}
            onChange={setIndEff}
            min="1"
            max="100"
            step="1"
            hint="Typically 84-90% with a flat ferrous pan."
          />
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Monthly difference
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : money(Math.abs(result.monthlyDifference))}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{verdict}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy induction versus LPG comparison"
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

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-[var(--border)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              LPG cylinder
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {hasError ? "—" : money(result.lpgMonthlyCost)}
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">per month</p>
          </div>
          <div className="rounded-md border border-[var(--border)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Induction hob
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {hasError ? "—" : money(result.inductionMonthlyCost)}
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">per month</p>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {hasError ? (
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Breakdown</dt>
              <dd className="text-right font-semibold">—</dd>
            </div>
          ) : (
            breakdown.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))
          )}
        </dl>
      </section>

      {!hasError && !table.error && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Where the crossover sits</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Your LPG bill held constant, electricity tariff varied.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Tariff</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Induction</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">LPG</th>
                  <th scope="col" className="py-2 text-right font-semibold">Cheaper</th>
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row) => (
                  <tr key={row.tariff} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">₹{row.tariff}/unit</td>
                    <td className="py-2 pr-3 text-right">{money(row.inductionMonthlyCost)}</td>
                    <td className="py-2 pr-3 text-right">{money(row.lpgMonthlyCost)}</td>
                    <td className="py-2 text-right font-semibold">
                      <span
                        className={
                          row.cheaper === "induction"
                            ? "text-[var(--success)]"
                            : "text-[var(--muted-foreground)]"
                        }
                      >
                        {row.cheaper === "induction" ? "Induction" : row.cheaper === "lpg" ? "LPG" : "Equal"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Running cost only. It excludes the price of the hob, induction-compatible cookware, and the
        fact that induction cannot roast a papad or char a brinjal over an open flame. Tariff slabs
        and cylinder prices change, so re-run this with your own current figures.
      </p>
    </main>
  );
}
