"use client";

import { useMemo, useState } from "react";
import { CarFront, Check, Copy, RotateCcw } from "lucide-react";

import { IDV_DEPRECIATION_SLABS, computeIdv } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  exShowroom: "800000",
  ageMonths: "30",
  accessories: "20000",
  declaredIdv: "0",
  claimAmount: "50000",
  odRate: "3",
};

const toNumber = (raw) => {
  const text = String(raw ?? "").replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [fields, setFields] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setFields((current) => ({ ...current, [key]: value }));

  const result = useMemo(
    () =>
      computeIdv({
        exShowroomPrice: toNumber(fields.exShowroom),
        ageMonths: toNumber(fields.ageMonths),
        accessoriesValue: toNumber(fields.accessories) || 0,
        declaredIdv: toNumber(fields.declaredIdv) || 0,
        claimAmount: toNumber(fields.claimAmount) || 0,
        odPremiumRate: toNumber(fields.odRate) || 0,
      }),
    [fields],
  );

  const hasError = Boolean(result.error);
  const show = (value, formatter = money) => (hasError ? DASH : formatter(value));

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Motor Insurance IDV Calculator",
      `Ex-showroom listed price: ${money(result.exShowroomPrice)}`,
      `Vehicle age: ${result.ageMonths} months (${result.depreciationBand})`,
      `Depreciation applied: ${pct(result.depreciationRate)}`,
      `IDV of the vehicle: ${money(result.vehicleIdv)}`,
      result.accessoriesValue > 0 ? `IDV of accessories: ${money(result.accessoriesIdv)}` : "",
      `Total IDV: ${money(result.totalIdv)}`,
    ].filter(Boolean);
    if (result.underInsured) {
      lines.push(
        "",
        `Declared IDV: ${money(result.declaredIdv)} — under-insured by ${money(result.underInsuredBy)}`,
        `A ${money(result.claimAmount)} partial-loss claim would pay ${money(result.claimPayable)}`,
      );
    }
    return lines.join("\n");
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
    setFields(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CarFront className="h-4 w-4" aria-hidden="true" />
          Motor insurance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Motor Insurance IDV Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          IDV is the manufacturer&apos;s listed selling price less depreciation for age, and it is
          what a total loss or theft claim pays. This applies the motor tariff slabs and shows what
          declaring a lower IDV would cost you on a claim.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The vehicle</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="idv-price">
              Ex-showroom listed price (INR)
            </label>
            <input
              id="idv-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={fields.exShowroom}
              onChange={(event) => setField("exShowroom", event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Excludes registration charges, road tax and the insurance premium.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="idv-age">
              Age of the vehicle (completed months)
            </label>
            <input
              id="idv-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="600"
              step="1"
              value={fields.ageMonths}
              onChange={(event) => setField("ageMonths", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="idv-accessories">
              Accessories not in the listed price (INR)
            </label>
            <input
              id="idv-accessories"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={fields.accessories}
              onChange={(event) => setField("accessories", event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Fitted CNG kit, music system, alloy wheels and similar add-ons.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="idv-od">
              Own-damage premium rate (% of IDV)
            </label>
            <input
              id="idv-od"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="20"
              step="0.1"
              value={fields.odRate}
              onChange={(event) => setField("odRate", event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[6, 18, 30, 42, 54].map((months) => (
            <button
              key={months}
              type="button"
              onClick={() => setField("ageMonths", String(months))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {months} months
            </button>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Insured Declared Value
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {show(result.totalIdv)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see your figures."
                : `${pct(result.depreciationRate)} depreciation — ${result.depreciationBand}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy insured declared value result"
              className={`${GHOST_BTN} disabled:opacity-40`}
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
            ["IDV of the vehicle", show(result.vehicleIdv)],
            ["IDV of accessories", show(result.accessoriesIdv)],
            ["Total depreciation deducted", show(result.depreciationAmount)],
            ["Payout on total loss or theft", show(result.totalLossPayout)],
            [
              `Own-damage premium at ${hasError ? DASH : pct(result.odPremiumRate)}`,
              show(result.odPremiumAtCorrect),
            ],
            ["Depreciation on replaced metal parts in a claim", show(result.partsDepreciationRate, pct)],
            ["Depreciation on rubber, plastic, tyres and batteries", show(result.rubberPlasticRate, pct)],
            ["Depreciation on glass", show(result.glassRate, pct)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.requiresAgreement && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-xs leading-5 text-[var(--danger)]">
            The vehicle is over five years old, so the tariff does not fix a rate — IDV is mutually
            agreed between you and the insurer after inspection. The {pct(result.depreciationRate)}{" "}
            used above is only an indicative continuation, not a tariff figure.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What happens if you declare a lower IDV</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          A lower IDV cuts the premium but also cuts every claim. Leave the field at 0 to use the
          correct IDV.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="idv-declared">
              IDV you plan to declare (INR)
            </label>
            <input
              id="idv-declared"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={fields.declaredIdv}
              onChange={(event) => setField("declaredIdv", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="idv-claim">
              Partial-loss claim to test (INR)
            </label>
            <input
              id="idv-claim"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5000"
              value={fields.claimAmount}
              onChange={(event) => setField("claimAmount", event.target.value)}
            />
          </div>
        </div>

        {!hasError && (
          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            {[
              ["IDV used on the policy", money(result.declaredIdv)],
              ["Under-insured by", result.underInsured ? money(result.underInsuredBy) : "Nil"],
              ["Proportion a partial-loss claim settles at", pct(result.settlementRatio)],
              ["Claim you would actually receive", money(result.claimPayable)],
              ["Claim shortfall you would bear", money(result.claimShortfall)],
              ["Premium saved by declaring less", money(result.premiumSaved)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        {!hasError && result.underInsured && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-xs leading-5 text-[var(--danger)]">
            Declaring {money(result.declaredIdv)} instead of {money(result.totalIdv)} saves{" "}
            {money(result.premiumSaved)} of premium but costs {money(result.claimShortfall)} on this
            one claim, and caps a total loss or theft payout at {money(result.declaredIdv)}.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Depreciation slabs used to fix IDV</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Age of vehicle
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Depreciation
                </th>
              </tr>
            </thead>
            <tbody>
              {IDV_DEPRECIATION_SLABS.map((slab) => (
                <tr
                  key={slab.label}
                  className={`border-b border-[var(--border)] last:border-0 ${
                    !hasError && result.depreciationBand === slab.label ? "font-semibold" : ""
                  }`}
                >
                  <td className="py-2 pr-3">{slab.label}</td>
                  <td className="py-2 text-right">{slab.rate}%</td>
                </tr>
              ))}
              <tr className="border-b border-[var(--border)] last:border-0">
                <td className="py-2 pr-3">Over 5 years</td>
                <td className="py-2 text-right">Mutually agreed</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. Insurers usually allow the IDV to be set within a band around this
        figure, and add-on covers such as return-to-invoice or zero-depreciation change what a claim
        actually pays. Check the schedule on your own policy document.
      </p>
    </main>
  );
}
