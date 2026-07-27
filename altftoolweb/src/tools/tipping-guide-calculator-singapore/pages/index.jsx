"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Receipt, RotateCcw } from "lucide-react";

import {
  CATEGORIES,
  CURRENCY,
  LOCALE,
  QUALITY_LEVELS,
  SERVICE_CHARGE,
  computeTip,
  findCategory,
  isBillBased,
} from "../lib";

const MONEY = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 });

const money = (value) => MONEY.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

/** Presentation only: turn a category's stored range into a readable reference string. */
function describeRange(category) {
  if (category.type === "none") return "Not customary";
  if (category.type === "percent") {
    return category.low === category.high
      ? pct(category.typical)
      : `${pct(category.low)} – ${pct(category.high)}`;
  }
  if (category.type === "roundup") {
    const base = `Round up to the next ${money(category.step)}`;
    return category.high > 0 ? `${base}, up to ${pct(category.high)}` : base;
  }
  return `${money(category.low)} – ${money(category.high)} per ${category.unitLabel}`;
}

const DEFAULT_CATEGORY = "restaurant-table";
const DEFAULT_BILL = "119.90";
const DEFAULT_UNITS = "2";
const DEFAULT_PARTY = "2";
const DEFAULT_ADD_ON = "19.9";

export default function ToolHome() {
  const [categoryId, setCategoryId] = useState(DEFAULT_CATEGORY);
  const [quality, setQuality] = useState("standard");
  const [bill, setBill] = useState(DEFAULT_BILL);
  const [units, setUnits] = useState(DEFAULT_UNITS);
  const [partySize, setPartySize] = useState(DEFAULT_PARTY);
  const [addOnPct, setAddOnPct] = useState(DEFAULT_ADD_ON);
  const [serviceChargeOnBill, setServiceChargeOnBill] = useState(true);
  const [copied, setCopied] = useState(false);

  const category = findCategory(categoryId) ?? CATEGORIES[0];
  const billBased = isBillBased(category);
  const isFlat = category.type === "flat";

  const result = useMemo(() => {
    const billValue = toNumber(bill);
    const unitValue = toNumber(units);
    const partyValue = toNumber(partySize);
    const addOnValue = toNumber(addOnPct);
    if ([billValue, unitValue, partyValue, addOnValue].some(Number.isNaN)) {
      return { error: "Enter valid numbers in every field." };
    }
    return computeTip({
      categoryId,
      quality,
      billAmount: billValue,
      units: unitValue,
      partySize: partyValue,
      addOnPct: addOnValue,
      serviceChargeOnBill,
    });
  }, [categoryId, quality, bill, units, partySize, addOnPct, serviceChargeOnBill]);

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    const lines = [
      `Tipping in Singapore — ${result.category.label}`,
      result.billBased ? `Bill: ${money(result.billAmount)}` : `${result.units} × ${result.category.unitLabel}`,
      `Service: ${result.quality.label}`,
      `Tip: ${money(result.tip)}`,
    ];
    if (result.billBased) {
      lines.push(`Total to pay: ${money(result.total)}`);
      if (result.effectiveRate !== null) lines.push(`Effective rate: ${pct(result.effectiveRate)}`);
    }
    if (result.partySize > 1) lines.push(`Per person: ${money(result.perPerson)}`);
    lines.push(`Customary range: ${money(result.range.low)} – ${money(result.range.high)}`);
    return lines.join("\n");
  }, [result, failed]);

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
    setCategoryId(DEFAULT_CATEGORY);
    setQuality("standard");
    setBill(DEFAULT_BILL);
    setUnits(DEFAULT_UNITS);
    setPartySize(DEFAULT_PARTY);
    setAddOnPct(DEFAULT_ADD_ON);
    setServiceChargeOnBill(true);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Receipt className="h-4 w-4" aria-hidden="true" />
          Singapore tipping
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Tipping Guide Calculator for Singapore</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Singapore mostly does not tip. This shows exactly where that holds, works the 10% service charge and 9% GST out of your bill, and names the few genuine exceptions.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tip-category">
              Service
            </label>
            <select
              id="tip-category"
              className={`mt-2 ${INPUT_CLASS}`}
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
            >
              {CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {billBased ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="tip-bill">
                Bill as printed ({CURRENCY})
              </label>
              <input
                id="tip-bill"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={bill}
                onChange={(event) => setBill(event.target.value)}
              />
            </div>
          ) : null}

          {isFlat ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="tip-units">
                Number of {category.unitLabel}s
              </label>
              <input
                id="tip-units"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={units}
                onChange={(event) => setUnits(event.target.value)}
              />
            </div>
          ) : null}

          <div>
            <label className={LABEL_CLASS} htmlFor="tip-quality">
              How was the service?
            </label>
            <select
              id="tip-quality"
              className={`mt-2 ${INPUT_CLASS}`}
              value={quality}
              onChange={(event) => setQuality(event.target.value)}
            >
              {QUALITY_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="tip-party">
              People splitting it
            </label>
            <input
              id="tip-party"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={partySize}
              onChange={(event) => setPartySize(event.target.value)}
            />
          </div>

          {billBased ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="tip-addon">
                Taxes and service already on the bill (%)
              </label>
              <input
                id="tip-addon"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="60"
                step="0.5"
                value={addOnPct}
                onChange={(event) => setAddOnPct(event.target.value)}
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                The percentage is worked out on the amount before these.
              </p>
            </div>
          ) : null}
        </div>

        {billBased && category.serviceChargeCovers ? (
          <label
            className="mt-4 flex items-start gap-3 rounded-md border border-[var(--border)] p-3 text-sm"
            htmlFor="tip-service-charge"
          >
            <input
              id="tip-service-charge"
              type="checkbox"
              className="mt-0.5 h-5 w-5 accent-[var(--primary)]"
              checked={serviceChargeOnBill}
              onChange={(event) => setServiceChargeOnBill(event.target.checked)}
            />
            <span className="text-[var(--muted-foreground)]">
              A service charge is already printed on my bill.
            </span>
          </label>
        ) : null}
      </section>

      {failed ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Customary tip
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : money(result.tip)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the inputs above to see an amount."
                : `${result.category.label} · usual range ${money(result.range.low)} – ${money(result.range.high)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy the tip calculation"
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Bill as printed", failed || !result.billBased ? DASH : money(result.billAmount)],
            ["Taxes and service already included", failed || !result.billBased ? DASH : money(result.addOnAmount)],
            ["Amount the percentage applies to", failed || !result.billBased ? DASH : money(result.netBill)],
            ["Tip", failed ? DASH : money(result.tip)],
            ["Total to hand over", failed || !result.billBased ? DASH : money(result.total)],
            ["Effective rate on the printed bill", failed || result.effectiveRate === null ? DASH : pct(result.effectiveRate)],
            ["Per person", failed ? DASH : money(result.perPerson)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && result.notes.length > 0 ? (
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note} className="rounded-md bg-[var(--info-soft)] px-3 py-2 text-[var(--info)]">
                {note}
              </li>
            ))}
          </ul>
        ) : null}

        {!failed && result.category.note ? (
          <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">{result.category.note}</p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What is customary in Singapore</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">{SERVICE_CHARGE.note}</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[380px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Service</th>
                <th scope="col" className="py-2 text-right font-semibold">Customary</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map((item) => (
                <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">
                    <button
                      type="button"
                      onClick={() => setCategoryId(item.id)}
                      className="min-h-11 text-left font-semibold text-[var(--foreground)] transition hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    >
                      {item.label}
                    </button>
                  </td>
                  <td className="py-2 text-right text-[var(--muted-foreground)]">{describeRange(item)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational guide to social custom, not a rule. Tipping norms vary by city, venue and
        year, and nothing here is financial or legal advice — check your bill before adding
        anything on top.
      </p>
    </main>
  );
}
