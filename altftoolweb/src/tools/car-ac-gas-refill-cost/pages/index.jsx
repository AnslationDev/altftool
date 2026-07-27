"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Snowflake } from "lucide-react";

import {
  REFRIGERANTS,
  SERVICE_EXTRAS,
  SERVICE_PARTS,
  VEHICLE_CLASSES,
  compareRefrigerantCost,
  estimateAcServiceCost,
  getRefrigerant,
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
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULTS = {
  refrigerant: "r134a",
  vehicleClass: "hatchback",
  chargeGrams: "450",
  pricePerGram: "1.6",
  labourCost: "1000",
  partIds: ["oring"],
  extraIds: ["vacuum", "leakTest"],
  applyGst: true,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [refrigerant, setRefrigerant] = useState(DEFAULTS.refrigerant);
  const [vehicleClass, setVehicleClass] = useState(DEFAULTS.vehicleClass);
  const [chargeGrams, setChargeGrams] = useState(DEFAULTS.chargeGrams);
  const [pricePerGram, setPricePerGram] = useState(DEFAULTS.pricePerGram);
  const [labourCost, setLabourCost] = useState(DEFAULTS.labourCost);
  const [partIds, setPartIds] = useState(DEFAULTS.partIds);
  const [extraIds, setExtraIds] = useState(DEFAULTS.extraIds);
  const [applyGst, setApplyGst] = useState(DEFAULTS.applyGst);
  const [copied, setCopied] = useState(false);

  const estimate = useMemo(
    () =>
      estimateAcServiceCost({
        refrigerant,
        chargeGrams: toNumber(chargeGrams),
        pricePerGram: toNumber(pricePerGram),
        labourCost: toNumber(labourCost),
        partIds,
        extraIds,
        applyGst,
      }),
    [refrigerant, chargeGrams, pricePerGram, labourCost, partIds, extraIds, applyGst],
  );

  const comparison = useMemo(
    () =>
      compareRefrigerantCost({
        chargeGrams: toNumber(chargeGrams),
        labourCost: toNumber(labourCost),
      }),
    [chargeGrams, labourCost],
  );

  const summary = useMemo(() => {
    if (estimate.error) return "";
    return [
      "Car AC Gas Refill Cost",
      `Refrigerant: ${estimate.refrigerantLabel}`,
      `Charge: ${estimate.chargeGrams} g at ${INR2.format(estimate.pricePerGram)}/g = ${INR.format(estimate.gasCost)}`,
      `Labour: ${INR.format(estimate.labourCost)}`,
      `Parts: ${INR.format(estimate.partsCost)}`,
      `Service extras: ${INR.format(estimate.extrasCost)}`,
      `Subtotal: ${INR.format(estimate.subtotal)}`,
      `GST at ${estimate.gstRatePercent}%: ${INR.format(estimate.gstAmount)}`,
      `Total: ${INR.format(estimate.total)}`,
    ].join("\n");
  }, [estimate]);

  const togglePart = (id) => {
    setPartIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
    setCopied(false);
  };

  const toggleExtra = (id) => {
    setExtraIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
    setCopied(false);
  };

  const applyVehicleClass = (id) => {
    setVehicleClass(id);
    const found = VEHICLE_CLASSES.find((item) => item.id === id);
    if (found) setChargeGrams(String(found.typicalGrams));
    setCopied(false);
  };

  const applyRefrigerant = (id) => {
    setRefrigerant(id);
    const found = getRefrigerant(id);
    if (found) setPricePerGram(String(found.defaultPricePerGram));
    setCopied(false);
  };

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
    setRefrigerant(DEFAULTS.refrigerant);
    setVehicleClass(DEFAULTS.vehicleClass);
    setChargeGrams(DEFAULTS.chargeGrams);
    setPricePerGram(DEFAULTS.pricePerGram);
    setLabourCost(DEFAULTS.labourCost);
    setPartIds(DEFAULTS.partIds);
    setExtraIds(DEFAULTS.extraIds);
    setApplyGst(DEFAULTS.applyGst);
    setCopied(false);
  };

  const ok = !estimate.error;
  const selectedRefrigerant = getRefrigerant(refrigerant);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Snowflake className="h-4 w-4" aria-hidden="true" />
          Car maintenance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Car AC Gas Refill Cost</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build the regas bill line by line — gas by weight, labour, parts and 18% GST — and see why
          a newer car running R1234yf costs several times more to recharge than an R134a one.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ac-refrigerant">
              Refrigerant
            </label>
            <select
              id="ac-refrigerant"
              className={`mt-2 ${INPUT_CLASS}`}
              value={refrigerant}
              onChange={(event) => applyRefrigerant(event.target.value)}
            >
              {REFRIGERANTS.map((gas) => (
                <option key={gas.id} value={gas.id}>
                  {gas.label} — GWP {gas.globalWarmingPotential}
                </option>
              ))}
            </select>
            {selectedRefrigerant ? (
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                {selectedRefrigerant.fitment} {selectedRefrigerant.note}
              </p>
            ) : null}
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ac-class">
              Vehicle size
            </label>
            <select
              id="ac-class"
              className={`mt-2 ${INPUT_CLASS}`}
              value={vehicleClass}
              onChange={(event) => applyVehicleClass(event.target.value)}
            >
              {VEHICLE_CLASSES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} ({item.rangeText})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ac-grams">
              Charge weight (grams)
            </label>
            <input
              id="ac-grams"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="3000"
              step="10"
              value={chargeGrams}
              onChange={(event) => {
                setChargeGrams(event.target.value);
                setCopied(false);
              }}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              The exact figure is on the underbonnet AC label.
            </p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ac-rate">
              Gas rate (₹ per gram)
            </label>
            <input
              id="ac-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={pricePerGram}
              onChange={(event) => {
                setPricePerGram(event.target.value);
                setCopied(false);
              }}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ac-labour">
              Labour (₹)
            </label>
            <input
              id="ac-labour"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="100"
              value={labourCost}
              onChange={(event) => {
                setLabourCost(event.target.value);
                setCopied(false);
              }}
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="ac-gst"
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
            >
              <input
                id="ac-gst"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={applyGst}
                onChange={(event) => {
                  setApplyGst(event.target.checked);
                  setCopied(false);
                }}
              />
              <span className="font-medium">Add 18% GST on the invoice</span>
            </label>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Parts being replaced</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {SERVICE_PARTS.map((part) => {
              const active = partIds.includes(part.id);
              return (
                <label
                  key={part.id}
                  htmlFor={`part-${part.id}`}
                  className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 text-sm transition ${
                    active
                      ? "border-[var(--primary)] bg-[var(--muted)]"
                      : "border-[var(--border)] bg-[var(--background)]"
                  }`}
                >
                  <input
                    id={`part-${part.id}`}
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
                    checked={active}
                    onChange={() => togglePart(part.id)}
                  />
                  <span>
                    <span className="block font-medium">
                      {part.label} · {INR.format(part.defaultCost)}
                    </span>
                    <span className="block text-xs text-[var(--muted-foreground)]">{part.why}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Service bay charges</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {SERVICE_EXTRAS.map((extra) => {
              const active = extraIds.includes(extra.id);
              return (
                <label
                  key={extra.id}
                  htmlFor={`extra-${extra.id}`}
                  className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition ${
                    active
                      ? "border-[var(--primary)] bg-[var(--muted)]"
                      : "border-[var(--border)] bg-[var(--background)]"
                  }`}
                >
                  <input
                    id={`extra-${extra.id}`}
                    type="checkbox"
                    className="h-4 w-4 accent-[var(--primary)]"
                    checked={active}
                    onChange={() => toggleExtra(extra.id)}
                  />
                  <span className="font-medium">
                    {extra.label} · {INR.format(extra.defaultCost)}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </section>

      {estimate.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {estimate.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Estimated bill
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? INR.format(estimate.total) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${estimate.chargeGrams} g of ${estimate.refrigerantLabel}, all in`
                : "Fix the input above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy AC regas cost estimate"
              className={GHOST_BTN}
              disabled={!ok}
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Refrigerant", ok ? INR.format(estimate.gasCost) : DASH],
            ["Labour", ok ? INR.format(estimate.labourCost) : DASH],
            ["Parts", ok ? INR.format(estimate.partsCost) : DASH],
            ["Service bay charges", ok ? INR.format(estimate.extrasCost) : DASH],
            ["Subtotal before tax", ok ? INR.format(estimate.subtotal) : DASH],
            [
              `GST${ok && estimate.gstRatePercent ? ` at ${estimate.gstRatePercent}%` : ""}`,
              ok ? INR.format(estimate.gstAmount) : DASH,
            ],
            ["All-in cost per gram", ok ? INR2.format(estimate.costPerGramAllIn) : DASH],
            [
              "Climate impact of the charge",
              ok ? `${NUM.format(estimate.co2EquivalentKg)} kg CO2e` : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok && Array.isArray(comparison) ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Same job, each refrigerant</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Gas
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Rate / g
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Gas cost
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Total incl. GST
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 text-right">{INR2.format(row.pricePerGram)}</td>
                    <td className="py-2 pr-3 text-right">{INR.format(row.gasCost)}</td>
                    <td className="py-2 text-right font-semibold">{INR.format(row.totalWithGst)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Uses the same charge weight and labour you entered, with indicative market rates per
            gram.
          </p>
        </section>
      ) : null}

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Before you pay for a regas</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--muted-foreground)]">
            {estimate.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Indicative estimate only. Gas rates, labour and parts prices vary widely by city and
        workshop — replace the defaults with the quote you have been given.
      </p>
    </main>
  );
}
