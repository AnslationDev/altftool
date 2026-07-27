"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Fuel, RotateCcw } from "lucide-react";

import {
  DEFAULT_STOVE_EFFICIENCY_PCT,
  DOMESTIC_CYLINDER_KG,
  LPG_GCV_MJ_PER_KG,
  PNG_GCV_MJ_PER_SCM,
  comparePngLpg,
} from "../lib";

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
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);
const money2 = (v) => (Number.isFinite(v) ? INR2.format(v) : DASH);
const num1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);
const num2 = (v) => (Number.isFinite(v) ? NUM2.format(v) : DASH);

const DEFAULTS = {
  basis: "lpg",
  amount: "14.2",
  cylinderPrice: "900",
  cylinderKg: String(DOMESTIC_CYLINDER_KG),
  pngRate: "45",
  pngFixed: "50",
  connection: "6000",
  lpgGcv: String(LPG_GCV_MJ_PER_KG),
  pngGcv: String(PNG_GCV_MJ_PER_SCM),
  lpgEff: String(DEFAULT_STOVE_EFFICIENCY_PCT),
  pngEff: String(DEFAULT_STOVE_EFFICIENCY_PCT),
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
  const [basis, setBasis] = useState(DEFAULTS.basis);
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [cylinderPrice, setCylinderPrice] = useState(DEFAULTS.cylinderPrice);
  const [cylinderKg, setCylinderKg] = useState(DEFAULTS.cylinderKg);
  const [pngRate, setPngRate] = useState(DEFAULTS.pngRate);
  const [pngFixed, setPngFixed] = useState(DEFAULTS.pngFixed);
  const [connection, setConnection] = useState(DEFAULTS.connection);
  const [lpgGcv, setLpgGcv] = useState(DEFAULTS.lpgGcv);
  const [pngGcv, setPngGcv] = useState(DEFAULTS.pngGcv);
  const [lpgEff, setLpgEff] = useState(DEFAULTS.lpgEff);
  const [pngEff, setPngEff] = useState(DEFAULTS.pngEff);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      comparePngLpg({
        basis,
        amount: toNumber(amount),
        cylinderPrice: toNumber(cylinderPrice),
        cylinderKg: toNumber(cylinderKg),
        pngRatePerScm: toNumber(pngRate),
        pngFixedMonthly: toNumber(pngFixed),
        pngConnectionCost: toNumber(connection),
        lpgGcv: toNumber(lpgGcv),
        pngGcv: toNumber(pngGcv),
        lpgEfficiencyPct: toNumber(lpgEff),
        pngEfficiencyPct: toNumber(pngEff),
      }),
    [
      basis,
      amount,
      cylinderPrice,
      cylinderKg,
      pngRate,
      pngFixed,
      connection,
      lpgGcv,
      pngGcv,
      lpgEff,
      pngEff,
    ],
  );

  const failed = Boolean(result.error);
  const pngWins = !failed && result.cheaper === "png";

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "PNG vs LPG Cost Comparison",
      `Same cooking heat: ${num1(result.usefulKwh)} kWh a month into the pan`,
      `LPG: ${num2(result.lpgKgPerMonth)} kg (${num2(result.cylindersPerMonth)} cylinders) — ${money(result.lpgMonthlyCost)} a month`,
      `PNG: ${num2(result.pngScmPerMonth)} SCM + fixed charge — ${money(result.pngMonthlyCost)} a month`,
      `Cost per usable kWh: LPG ${money2(result.lpgCostPerKwh)}, PNG ${money2(result.pngCostPerKwh)}`,
      `Difference: ${money(Math.abs(result.monthlySaving))} a month (${money(Math.abs(result.annualSaving))} a year) in favour of ${result.cheaper === "png" ? "PNG" : result.cheaper === "lpg" ? "LPG" : "neither"}`,
      result.connectionPaybackMonths !== null
        ? `PNG connection cost pays back in ${num1(result.connectionPaybackMonths)} months`
        : "",
      `Equivalence used: 1 kg LPG = ${num2(result.equivalence)} SCM of PNG`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [failed, result]);

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
    setBasis(DEFAULTS.basis);
    setAmount(DEFAULTS.amount);
    setCylinderPrice(DEFAULTS.cylinderPrice);
    setCylinderKg(DEFAULTS.cylinderKg);
    setPngRate(DEFAULTS.pngRate);
    setPngFixed(DEFAULTS.pngFixed);
    setConnection(DEFAULTS.connection);
    setLpgGcv(DEFAULTS.lpgGcv);
    setPngGcv(DEFAULTS.pngGcv);
    setLpgEff(DEFAULTS.lpgEff);
    setPngEff(DEFAULTS.pngEff);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Fuel className="h-4 w-4" aria-hidden="true" />
          Cooking fuel
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          PNG vs LPG Cost Comparison
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Piped gas is billed by cubic metre and cylinder gas by kilogram, so the sticker prices
          cannot be compared directly. This converts both to the same heat delivered into the pan
          and then compares the bills.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gas-basis">
              I know my usage in
            </label>
            <select
              id="gas-basis"
              className={`mt-2 ${INPUT_CLASS}`}
              value={basis}
              onChange={(event) => setBasis(event.target.value)}
            >
              <option value="lpg">LPG kilograms a month</option>
              <option value="png">PNG cubic metres (SCM) a month</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gas-amount">
              {basis === "lpg" ? "LPG used a month (kg)" : "PNG used a month (SCM)"}
            </label>
            <input
              id="gas-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            <p className={HINT_CLASS}>
              {basis === "lpg"
                ? "One standard cylinder is 14.2 kg."
                : "Straight off your piped gas bill."}
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gas-cyl-price">
              LPG cylinder price
            </label>
            <input
              id="gas-cyl-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={cylinderPrice}
              onChange={(event) => setCylinderPrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gas-cyl-kg">
              Cylinder net weight (kg)
            </label>
            <input
              id="gas-cyl-kg"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={cylinderKg}
              onChange={(event) => setCylinderKg(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gas-png-rate">
              PNG rate per SCM
            </label>
            <input
              id="gas-png-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={pngRate}
              onChange={(event) => setPngRate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gas-png-fixed">
              PNG fixed charge a month
            </label>
            <input
              id="gas-png-fixed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={pngFixed}
              onChange={(event) => setPngFixed(event.target.value)}
            />
            <p className={HINT_CLASS}>Meter rent or service charge, if your bill has one.</p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="gas-connection">
              One-time PNG connection cost or deposit
            </label>
            <input
              id="gas-connection"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={connection}
              onChange={(event) => setConnection(event.target.value)}
            />
            <p className={HINT_CLASS}>Used to work out how long the switch takes to repay itself.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced((value) => !value)}
          aria-expanded={showAdvanced}
          className="mt-4 min-h-11 rounded-md px-3 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
        >
          {showAdvanced ? "Hide" : "Show"} calorific values and burner efficiency
        </button>

        {showAdvanced && (
          <div className="mt-3 grid gap-4 border-t border-[var(--border)] pt-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="gas-lpg-gcv">
                LPG calorific value (MJ/kg)
              </label>
              <input
                id="gas-lpg-gcv"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                value={lpgGcv}
                onChange={(event) => setLpgGcv(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="gas-png-gcv">
                PNG calorific value (MJ/SCM)
              </label>
              <input
                id="gas-png-gcv"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                value={pngGcv}
                onChange={(event) => setPngGcv(event.target.value)}
              />
              <p className={HINT_CLASS}>Your piped gas bill states the GCV actually billed.</p>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="gas-lpg-eff">
                LPG burner efficiency (%)
              </label>
              <input
                id="gas-lpg-eff"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="1"
                max="100"
                step="1"
                value={lpgEff}
                onChange={(event) => setLpgEff(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="gas-png-eff">
                PNG burner efficiency (%)
              </label>
              <input
                id="gas-png-eff"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="1"
                max="100"
                step="1"
                value={pngEff}
                onChange={(event) => setPngEff(event.target.value)}
              />
            </div>
          </div>
        )}
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
              You save a month with {failed ? DASH : pngWins ? "piped gas" : "cylinders"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : money(Math.abs(result.monthlySaving))}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the inputs above to compare."
                : `${money(Math.abs(result.annualSaving))} a year on the same amount of cooking`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy gas cost comparison"
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
          <p className="mt-4 rounded-md bg-[var(--success-soft)] px-3 py-2 text-sm font-medium text-[var(--success)]">
            {result.verdict}
          </p>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Cylinder LPG
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {failed ? DASH : money(result.lpgMonthlyCost)}
            </p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {failed
                ? DASH
                : `${num2(result.lpgKgPerMonth)} kg = ${num2(result.cylindersPerMonth)} cylinders a month`}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Piped natural gas
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {failed ? DASH : money(result.pngMonthlyCost)}
            </p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {failed
                ? DASH
                : `${num2(result.pngScmPerMonth)} SCM plus ${money(result.pngFixedMonthly)} fixed`}
            </p>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Useful heat compared", failed ? DASH : `${num1(result.usefulKwh)} kWh a month`],
            ["1 kg LPG is equivalent to", failed ? DASH : `${num2(result.equivalence)} SCM of PNG`],
            ["LPG price per kg", failed ? DASH : money2(result.lpgPricePerKg)],
            ["LPG cost per usable kWh", failed ? DASH : money2(result.lpgCostPerKwh)],
            ["PNG cost per usable kWh", failed ? DASH : money2(result.pngCostPerKwh)],
            ["LPG cost a year", failed ? DASH : money(result.lpgAnnualCost)],
            ["PNG cost a year", failed ? DASH : money(result.pngAnnualCost)],
            [
              "PNG connection cost pays back in",
              failed || result.connectionPaybackMonths === null
                ? DASH
                : `${num1(result.connectionPaybackMonths)} months`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Prices, slab structures and the calorific value billed all vary by city gas distributor and
        change often, so check the current figures on your own bill. Cost is only part of the
        decision: piped gas removes refill bookings and cylinder handling, but it is not portable
        and is only available where the network reaches.
      </p>
    </main>
  );
}
