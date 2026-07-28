"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Info, Layers, RotateCcw, Zap } from "lucide-react";

import { STATE_TARIFFS, TARIFF_SOURCE_NOTE, explainBillSpike } from "../lib";

const INPUT_CLASS =
  "mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD_CLASS = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const DASH = "—";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const rate = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const units = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const pct = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULTS = {
  stateId: "maharashtra",
  previousUnits: "95",
  previousAmount: "658",
  currentUnits: "190",
  currentAmount: "1760",
  previousFixedCharge: "",
  currentFixedCharge: "",
  previousSurcharge: "0",
  currentSurcharge: "0",
  dutyPercent: "",
};

function blockLabel(from, to) {
  return to === null ? `above ${units.format(from)} units` : `${units.format(from)}–${units.format(to)} units`;
}

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      explainBillSpike({
        stateId: form.stateId,
        previousUnits: form.previousUnits,
        previousAmount: form.previousAmount,
        currentUnits: form.currentUnits,
        currentAmount: form.currentAmount,
        previousFixedCharge: form.previousFixedCharge,
        currentFixedCharge: form.currentFixedCharge,
        previousSurcharge: form.previousSurcharge,
        currentSurcharge: form.currentSurcharge,
        dutyPercent: form.dutyPercent,
      }),
    [form],
  );

  const failed = Boolean(result.error);

  function update(key, value) {
    setForm((previous) => ({ ...previous, [key]: value }));
    setCopied(false);
  }

  function reset() {
    setForm(DEFAULTS);
    setCopied(false);
  }

  async function copySummary() {
    if (failed) return;
    const lines = [
      `Electricity bill change — ${result.stateName}`,
      `Previous month: ${units.format(result.previous.units)} units, ${money.format(result.previous.amountPaid)}`,
      `This month: ${units.format(result.current.units)} units, ${money.format(result.current.amountPaid)}`,
      `Bill ${result.direction} by ${money.format(result.absTotalChange)}; units ${result.unitsDirection} by ${units.format(result.absUnitsChange)}`,
      "",
      ...result.components.map((part) => `${part.label}: ${money.format(part.amount)} (${pct.format(part.sharePercent)}% of the movement)`),
      "",
      `Effective rate: ${rate.format(result.previous.effectiveRate)}/unit -> ${rate.format(result.current.effectiveRate)}/unit`,
      TARIFF_SOURCE_NOTE,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  const headline = failed ? DASH : money.format(result.absTotalChange);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
          <Zap className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          Electricity Bill Spike Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter two months from your electricity bills. This page splits the change in rupees into
          slab creep, genuine extra consumption, fixed charge, fuel surcharge, electricity duty and
          anything else on the bill. Indian domestic supply is telescopic, so crossing a slab
          re-prices only the units above the boundary — which is why a modest rise in units can
          move the bill much further than people expect.
        </p>
      </header>

      <section className="grid gap-4" aria-label="Your two bills">
        <div>
          <label className={LABEL_CLASS} htmlFor="state-id">
            State (indicative domestic LT-1 tariff)
          </label>
          <select
            id="state-id"
            className={INPUT_CLASS}
            value={form.stateId}
            onChange={(event) => update("stateId", event.target.value)}
          >
            {STATE_TARIFFS.map((row) => (
              <option key={row.id} value={row.id}>
                {row.state}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className={CARD_CLASS}>
            <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
              Previous month
            </h2>
            <div className="mt-3 grid gap-3">
              <div>
                <label className={LABEL_CLASS} htmlFor="previous-units">
                  Units consumed (kWh)
                </label>
                <input
                  id="previous-units"
                  className={INPUT_CLASS}
                  type="number"
                  inputMode="decimal"
                  min="1"
                  value={form.previousUnits}
                  onChange={(event) => update("previousUnits", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="previous-amount">
                  Amount paid (₹)
                </label>
                <input
                  id="previous-amount"
                  className={INPUT_CLASS}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={form.previousAmount}
                  onChange={(event) => update("previousAmount", event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className={CARD_CLASS}>
            <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
              This month
            </h2>
            <div className="mt-3 grid gap-3">
              <div>
                <label className={LABEL_CLASS} htmlFor="current-units">
                  Units consumed (kWh)
                </label>
                <input
                  id="current-units"
                  className={INPUT_CLASS}
                  type="number"
                  inputMode="decimal"
                  min="1"
                  value={form.currentUnits}
                  onChange={(event) => update("currentUnits", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="current-amount">
                  Amount paid (₹)
                </label>
                <input
                  id="current-amount"
                  className={INPUT_CLASS}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={form.currentAmount}
                  onChange={(event) => update("currentAmount", event.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <details className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <summary className="cursor-pointer text-sm font-semibold">
            Charges printed on your bill (optional — defaults come from the state table)
          </summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="previous-fixed">
                Previous month fixed / demand charge (₹)
              </label>
              <input
                id="previous-fixed"
                className={INPUT_CLASS}
                type="number"
                inputMode="decimal"
                min="0"
                placeholder="state default"
                value={form.previousFixedCharge}
                onChange={(event) => update("previousFixedCharge", event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="current-fixed">
                This month fixed / demand charge (₹)
              </label>
              <input
                id="current-fixed"
                className={INPUT_CLASS}
                type="number"
                inputMode="decimal"
                min="0"
                placeholder="state default"
                value={form.currentFixedCharge}
                onChange={(event) => update("currentFixedCharge", event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="previous-surcharge">
                Previous month fuel surcharge (₹ per unit)
              </label>
              <input
                id="previous-surcharge"
                className={INPUT_CLASS}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={form.previousSurcharge}
                onChange={(event) => update("previousSurcharge", event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="current-surcharge">
                This month fuel surcharge (₹ per unit)
              </label>
              <input
                id="current-surcharge"
                className={INPUT_CLASS}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={form.currentSurcharge}
                onChange={(event) => update("currentSurcharge", event.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="duty-percent">
                Electricity duty / tax (% of energy + fixed + surcharge)
              </label>
              <input
                id="duty-percent"
                className={INPUT_CLASS}
                type="number"
                inputMode="decimal"
                min="0"
                max="100"
                step="0.1"
                placeholder="state default"
                value={form.dutyPercent}
                onChange={(event) => update("dutyPercent", event.target.value)}
              />
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            FPPPA, FPPCA and FCA are the same thing under different state names — a per-unit fuel
            surcharge re-notified periodically. Leave a field blank to use the state table value.
          </p>
        </details>
      </section>

      {failed ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className={`${CARD_CLASS} mt-6`} aria-label="Result">
        <p className="text-sm text-[var(--muted-foreground)]">
          {failed ? "Bill change" : `Your bill ${result.direction} by`}
        </p>
        <p className="mt-1 text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl">
          {headline}
        </p>

        {failed ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            Fix the input above to see the breakdown.
          </p>
        ) : (
          <>
            <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
              Units {result.unitsDirection} by {units.format(result.absUnitsChange)} (
              {pct.format(result.unitsChangePercent)}%) while the amount{" "}
              {result.direction} {pct.format(result.amountChangePercent)}%. Of the change,{" "}
              <span className="font-semibold text-[var(--foreground)]">
                {money.format(result.slabCreepAmount)}
              </span>{" "}
              is slab creep and{" "}
              <span className="font-semibold text-[var(--foreground)]">
                {money.format(result.extraUsageAmount)}
              </span>{" "}
              is the extra units priced at {rate.format(result.baseMarginalRate)} per unit — the
              rate already in force in the {blockLabel(result.baseMarginalBlock.from, result.baseMarginalBlock.to)}{" "}
              block.
            </p>

            <dl className="mt-5 divide-y divide-[var(--border)]">
              {result.components.map((part) => (
                <div key={part.id} className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="text-sm text-[var(--muted-foreground)]">{part.label}</dt>
                  <dd className="shrink-0 text-right">
                    <span className="text-base font-semibold tabular-nums">
                      {money.format(part.amount)}
                    </span>
                    <span className="ml-2 text-xs text-[var(--muted-foreground)] tabular-nums">
                      {pct.format(part.sharePercent)}%
                    </span>
                  </dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between gap-4 border-t-2 border-[var(--border)] py-2.5">
                <dt className="text-sm font-bold">Total change</dt>
                <dd className="text-base font-bold tabular-nums">{money.format(result.totalChange)}</dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" className={PRIMARY_BTN} onClick={copySummary} aria-label="Copy the bill change breakdown">
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied ? "Copied!" : "Copy breakdown"}
              </button>
              <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset all inputs">
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </>
        )}
      </section>

      <section className={`${CARD_CLASS} mt-4`} aria-label="Per-unit effective rate">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <Layers className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
          Month by month
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[34rem] text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Line</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Previous month</th>
                <th scope="col" className="py-2 text-right font-semibold">This month</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] tabular-nums">
              <tr>
                <th scope="row" className="py-2 pr-3 text-left font-normal text-[var(--muted-foreground)]">Units billed</th>
                <td className="py-2 pr-3 text-right">{failed ? DASH : units.format(result.previous.units)}</td>
                <td className="py-2 text-right">{failed ? DASH : units.format(result.current.units)}</td>
              </tr>
              <tr>
                <th scope="row" className="py-2 pr-3 text-left font-normal text-[var(--muted-foreground)]">Slab energy charge</th>
                <td className="py-2 pr-3 text-right">{failed ? DASH : money.format(result.previous.energyCharge)}</td>
                <td className="py-2 text-right">{failed ? DASH : money.format(result.current.energyCharge)}</td>
              </tr>
              <tr>
                <th scope="row" className="py-2 pr-3 text-left font-normal text-[var(--muted-foreground)]">Fixed / demand charge</th>
                <td className="py-2 pr-3 text-right">{failed ? DASH : money.format(result.previous.fixedCharge)}</td>
                <td className="py-2 text-right">{failed ? DASH : money.format(result.current.fixedCharge)}</td>
              </tr>
              <tr>
                <th scope="row" className="py-2 pr-3 text-left font-normal text-[var(--muted-foreground)]">Fuel surcharge</th>
                <td className="py-2 pr-3 text-right">{failed ? DASH : money.format(result.previous.surcharge)}</td>
                <td className="py-2 text-right">{failed ? DASH : money.format(result.current.surcharge)}</td>
              </tr>
              <tr>
                <th scope="row" className="py-2 pr-3 text-left font-normal text-[var(--muted-foreground)]">
                  Electricity duty{failed ? "" : ` (${pct.format(result.dutyPercent)}%)`}
                </th>
                <td className="py-2 pr-3 text-right">{failed ? DASH : money.format(result.previous.duty)}</td>
                <td className="py-2 text-right">{failed ? DASH : money.format(result.current.duty)}</td>
              </tr>
              <tr>
                <th scope="row" className="py-2 pr-3 text-left font-normal text-[var(--muted-foreground)]">Other charges on your bill</th>
                <td className="py-2 pr-3 text-right">{failed ? DASH : money.format(result.previous.other)}</td>
                <td className="py-2 text-right">{failed ? DASH : money.format(result.current.other)}</td>
              </tr>
              <tr className="font-semibold">
                <th scope="row" className="py-2 pr-3 text-left">Amount paid</th>
                <td className="py-2 pr-3 text-right">{failed ? DASH : money.format(result.previous.amountPaid)}</td>
                <td className="py-2 text-right">{failed ? DASH : money.format(result.current.amountPaid)}</td>
              </tr>
              <tr className="font-semibold">
                <th scope="row" className="py-2 pr-3 text-left">Effective rate per unit</th>
                <td className="py-2 pr-3 text-right">{failed ? DASH : `${rate.format(result.previous.effectiveRate)}`}</td>
                <td className="py-2 text-right">{failed ? DASH : `${rate.format(result.current.effectiveRate)}`}</td>
              </tr>
              <tr>
                <th scope="row" className="py-2 pr-3 text-left font-normal text-[var(--muted-foreground)]">Top slab reached</th>
                <td className="py-2 pr-3 text-right">
                  {failed ? DASH : `${rate.format(result.previous.topSlab.rate)} · ${blockLabel(result.previous.topSlab.from, result.previous.topSlab.to)}`}
                </td>
                <td className="py-2 text-right">
                  {failed ? DASH : `${rate.format(result.current.topSlab.rate)} · ${blockLabel(result.current.topSlab.from, result.current.topSlab.to)}`}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {!failed && result.modelFitOff ? (
          <p className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-xs leading-5 text-[var(--danger)]">
            The modelled charges leave {money.format(result.current.other)} of this month&apos;s bill
            unaccounted for — more than a fifth of it. Your DISCOM&apos;s rates likely differ from the
            indicative table, or the bill carries arrears, a subsidy or a security-deposit line. The
            slab-creep split is approximate until you enter the fixed charge, surcharge and duty
            printed on the bill itself.
          </p>
        ) : null}
      </section>

      <section className={`${CARD_CLASS} mt-4`} aria-label="Tariff used">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <Info className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
          Slabs applied{failed ? "" : ` — ${result.stateName}`}
        </h2>
        {failed ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">{DASH}</p>
        ) : (
          <ul className="mt-3 grid gap-1 text-sm tabular-nums">
            {result.slabs.map((slab, index) => (
              <li key={`${slab.upto ?? "top"}-${index}`} className="flex justify-between gap-4">
                <span className="text-[var(--muted-foreground)]">
                  {slab.upto === null || slab.upto === undefined
                    ? `Above ${units.format(result.slabs[index - 1]?.upto ?? 0)} units`
                    : `Up to ${units.format(slab.upto)} units`}
                </span>
                <span className="font-semibold">{rate.format(slab.rate)} / unit</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">{TARIFF_SOURCE_NOTE}</p>
        <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
          This page reports what the numbers are and which rule produced each one. It does not
          advise you on tariff category, load sanction or any change to your connection.
        </p>
      </section>
    </main>
  );
}
