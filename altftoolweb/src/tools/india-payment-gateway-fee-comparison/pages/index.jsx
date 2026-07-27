"use client";

import { useMemo, useState } from "react";
import { Check, Copy, IndianRupee, RotateCcw } from "lucide-react";

import {
  DEFAULT_MIX,
  GATEWAY_DEFAULTS,
  GST_RATE_PCT,
  RAILS,
  compareGateways,
  zeroMdrSharePct,
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
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const money = (value) => INR.format(value);
const money2 = (value) => INR2.format(value);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const seedGateways = () =>
  GATEWAY_DEFAULTS.map((gateway) => ({
    ...gateway,
    rates: { ...gateway.rates },
    enabled: true,
  }));

const seedMix = () =>
  Object.fromEntries(RAILS.map((rail) => [rail.id, String(DEFAULT_MIX[rail.id] ?? 0)]));

export default function ToolHome() {
  const [monthlyVolume, setMonthlyVolume] = useState("2500000");
  const [averageTicket, setAverageTicket] = useState("1200");
  const [mix, setMix] = useState(seedMix);
  const [gateways, setGateways] = useState(seedGateways);
  const [copied, setCopied] = useState(false);

  const numericMix = useMemo(
    () => Object.fromEntries(RAILS.map((rail) => [rail.id, toNumber(mix[rail.id])])),
    [mix],
  );

  const comparison = useMemo(
    () =>
      compareGateways({
        monthlyVolume: toNumber(monthlyVolume),
        averageTicket: toNumber(averageTicket),
        mix: numericMix,
        gateways: gateways.filter((gateway) => gateway.enabled),
      }),
    [monthlyVolume, averageTicket, numericMix, gateways],
  );

  const hasError = Boolean(comparison.error);
  const zeroShare = zeroMdrSharePct(numericMix);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "India payment gateway fee comparison",
      `Monthly volume: ${money(toNumber(monthlyVolume))}`,
      `Average ticket: ${money(toNumber(averageTicket))} (${NUM.format(comparison.totalTxns)} transactions)`,
      `Zero-MDR share (UPI + RuPay debit): ${NUM.format(zeroShare)}%`,
      "",
      ...comparison.results.map(
        (row) =>
          `${row.name}: ${money(row.totalFee)}/month incl GST · ${NUM.format(row.effectiveRatePct)}% effective · ${money2(row.costPerTxn)}/txn`,
      ),
      "",
      `Cheapest: ${comparison.cheapest.name}. Gap to dearest: ${money(comparison.spread)}/month (${money(comparison.annualSpread)}/year).`,
    ].join("\n");
  }, [hasError, comparison, monthlyVolume, averageTicket, zeroShare]);

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
    setMonthlyVolume("2500000");
    setAverageTicket("1200");
    setMix(seedMix());
    setGateways(seedGateways());
    setCopied(false);
  };

  const updateRate = (gatewayId, railId, value) => {
    setGateways((prev) =>
      prev.map((gateway) =>
        gateway.id === gatewayId
          ? { ...gateway, rates: { ...gateway.rates, [railId]: toNumber(value) } }
          : gateway,
      ),
    );
  };

  const toggleGateway = (gatewayId) => {
    setGateways((prev) =>
      prev.map((gateway) =>
        gateway.id === gatewayId ? { ...gateway, enabled: !gateway.enabled } : gateway,
      ),
    );
  };

  const mixTotal = RAILS.reduce((sum, rail) => {
    const value = numericMix[rail.id];
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <IndianRupee className="h-4 w-4" aria-hidden="true" />
          Payments
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          India Payment Gateway Fee Comparison
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Headline rates mean nothing until they meet your payment mix. Enter your volume, ticket size
          and the split across UPI, cards and netbanking to see what each gateway actually costs after
          {` ${GST_RATE_PCT}%`} GST — with UPI and RuPay debit correctly charged at zero.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pg-volume">
              Monthly processed volume (INR)
            </label>
            <input
              id="pg-volume"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={monthlyVolume}
              onChange={(event) => setMonthlyVolume(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pg-ticket">
              Average ticket size (INR)
            </label>
            <input
              id="pg-ticket"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="50"
              value={averageTicket}
              onChange={(event) => setAverageTicket(event.target.value)}
            />
          </div>
        </div>

        <h2 className="mt-6 text-sm font-semibold">
          Payment mix — share of value on each rail (must total 100%)
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {RAILS.map((rail) => (
            <div key={rail.id}>
              <label className={LABEL_CLASS} htmlFor={`mix-${rail.id}`}>
                {rail.label} (%)
                {rail.zeroMdr ? (
                  <span className="ml-2 rounded-full bg-[var(--muted)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--success)]">
                    zero MDR
                  </span>
                ) : null}
              </label>
              <input
                id={`mix-${rail.id}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="100"
                step="1"
                value={mix[rail.id]}
                onChange={(event) => setMix((prev) => ({ ...prev, [rail.id]: event.target.value }))}
              />
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          Current total: {NUM.format(mixTotal)}%
        </p>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {comparison.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Cheapest monthly cost
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(comparison.cheapest.totalFee)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to compare."
                : `${comparison.cheapest.name} · ${NUM.format(comparison.cheapest.effectiveRatePct)}% effective rate`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the gateway fee comparison"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy comparison"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Transactions per month", hasError ? DASH : NUM.format(comparison.totalTxns)],
            ["Volume on zero-MDR rails", hasError ? DASH : `${NUM.format(zeroShare)}%`],
            [
              "Cost per transaction (cheapest)",
              hasError ? DASH : money2(comparison.cheapest.costPerTxn),
            ],
            [
              "Net settlement after fees (cheapest)",
              hasError ? DASH : money(comparison.cheapest.netSettlement),
            ],
            ["Gap between cheapest and dearest", hasError ? DASH : `${money(comparison.spread)} / month`],
            ["Same gap over a year", hasError ? DASH : money(comparison.annualSpread)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Ranked by monthly cost</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[460px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Gateway</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Fee ex GST</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">GST</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Total / month</th>
                  <th scope="col" className="py-2 text-right font-semibold">Effective</th>
                </tr>
              </thead>
              <tbody>
                {comparison.results.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.name}</td>
                    <td className="py-2 pr-3 text-right">{money(row.feeExGst)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{money(row.gst)}</td>
                    <td className="py-2 pr-3 text-right font-semibold">{money(row.totalFee)}</td>
                    <td className="py-2 text-right">{NUM.format(row.effectiveRatePct)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Rate cards (edit to match your quote)</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Seeded with commonly advertised standard-plan pricing. Anyone processing serious volume
          negotiates below these, so overwrite them with the numbers on your own agreement.
        </p>
        <div className="mt-4 space-y-4">
          {gateways.map((gateway) => (
            <div key={gateway.id} className="rounded-lg border border-[var(--border)] p-3">
              <label className="flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor={`gw-${gateway.id}`}>
                <input
                  id={`gw-${gateway.id}`}
                  type="checkbox"
                  checked={gateway.enabled}
                  onChange={() => toggleGateway(gateway.id)}
                  className="h-5 w-5 accent-[var(--primary)]"
                />
                {gateway.name}
                {gateway.flatFeePerTxn > 0 ? (
                  <span className="text-xs font-normal text-[var(--muted-foreground)]">
                    + {money2(gateway.flatFeePerTxn)} per transaction
                  </span>
                ) : null}
              </label>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {RAILS.filter((rail) => !rail.zeroMdr).map((rail) => (
                  <div key={rail.id}>
                    <label
                      className="block text-xs font-semibold text-[var(--muted-foreground)]"
                      htmlFor={`rate-${gateway.id}-${rail.id}`}
                    >
                      {rail.label} (%)
                    </label>
                    <input
                      id={`rate-${gateway.id}-${rail.id}`}
                      className={`mt-1 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      max="20"
                      step="0.05"
                      value={gateway.rates[rail.id]}
                      onChange={(event) => updateRate(gateway.id, rail.id, event.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax or financial advice. Real invoices may also carry setup fees,
        annual maintenance, chargeback and refund handling charges, payout charges on instant
        settlement, and TDS or TCS obligations. Confirm the final numbers with your gateway and your
        chartered accountant.
      </p>
    </main>
  );
}
