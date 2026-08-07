"use client";

import { useMemo, useState } from "react";
import { Check, Copy, CreditCard, RotateCcw } from "lucide-react";

import {
  GATEWAY_PRESETS,
  buildTicketLadder,
  computeGatewayFee,
  grossUpForNet,
  monthlyCost,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const CURRENCY_LOCALES = {
  USD: "en-US",
  EUR: "en-IE",
  GBP: "en-GB",
  INR: "en-IN",
  AED: "en-AE",
  SGD: "en-SG",
  AUD: "en-AU",
  CAD: "en-CA",
};

const DEFAULTS = {
  amount: "1000",
  currency: "USD",
  percentFee: "2.9",
  fixedFee: "0.30",
  crossBorderPercent: "1.5",
  conversionPercent: "1",
  taxOnFeePercent: "0",
  international: false,
  converted: false,
  targetNet: "1000",
  txPerMonth: "500",
  avgTicket: "80",
  preset: "stripe-us",
};

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [currency, setCurrency] = useState(DEFAULTS.currency);
  const [percentFee, setPercentFee] = useState(DEFAULTS.percentFee);
  const [fixedFee, setFixedFee] = useState(DEFAULTS.fixedFee);
  const [crossBorderPercent, setCrossBorderPercent] = useState(DEFAULTS.crossBorderPercent);
  const [conversionPercent, setConversionPercent] = useState(DEFAULTS.conversionPercent);
  const [taxOnFeePercent, setTaxOnFeePercent] = useState(DEFAULTS.taxOnFeePercent);
  const [international, setInternational] = useState(DEFAULTS.international);
  const [converted, setConverted] = useState(DEFAULTS.converted);
  const [targetNet, setTargetNet] = useState(DEFAULTS.targetNet);
  const [txPerMonth, setTxPerMonth] = useState(DEFAULTS.txPerMonth);
  const [avgTicket, setAvgTicket] = useState(DEFAULTS.avgTicket);
  const [preset, setPreset] = useState(DEFAULTS.preset);
  const [copied, setCopied] = useState(false);

  const money = useMemo(() => {
    const locale = CURRENCY_LOCALES[currency] ?? "en-US";
    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
    return (value) => formatter.format(Number.isFinite(value) ? value : 0);
  }, [currency]);

  const pct = useMemo(() => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }), []);

  const rates = useMemo(
    () => ({
      percentFee: toNumber(percentFee),
      fixedFee: toNumber(fixedFee),
      crossBorderPercent: toNumber(crossBorderPercent),
      conversionPercent: toNumber(conversionPercent),
      taxOnFeePercent: toNumber(taxOnFeePercent),
      international,
      converted,
    }),
    [percentFee, fixedFee, crossBorderPercent, conversionPercent, taxOnFeePercent, international, converted],
  );

  const result = useMemo(
    () => computeGatewayFee({ ...rates, amount: toNumber(amount) }),
    [rates, amount],
  );

  const grossUp = useMemo(
    () => grossUpForNet({ ...rates, targetNet: toNumber(targetNet) }),
    [rates, targetNet],
  );

  const ladder = useMemo(() => buildTicketLadder(rates), [rates]);

  const monthly = useMemo(
    () => monthlyCost(rates, toNumber(txPerMonth), toNumber(avgTicket)),
    [rates, txPerMonth, avgTicket],
  );

  const applyPreset = (id) => {
    setPreset(id);
    const chosen = GATEWAY_PRESETS[id];
    if (!chosen || id === "custom") return;
    setPercentFee(String(chosen.percentFee));
    setFixedFee(String(chosen.fixedFee));
    setCrossBorderPercent(String(chosen.crossBorderPercent));
    setConversionPercent(String(chosen.conversionPercent));
    setTaxOnFeePercent(String(chosen.taxOnFeePercent));
    if (id === "india-domestic") setCurrency("INR");
  };

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Payment Gateway Fee",
      `Charged: ${money(result.amount)}`,
      `Percentage fees: ${pct.format(result.totalPercent)}% = ${money(result.percentPart)}`,
      `Fixed fee: ${money(result.fixedFee)}`,
      `Tax on the fee: ${money(result.taxOnFee)}`,
      `Total cost: ${money(result.totalCost)} (${pct.format(result.effectivePercent)}% of the sale)`,
      `Net settlement: ${money(result.net)}`,
      grossUp.error ? null : `To net ${money(toNumber(targetNet))}, charge ${money(grossUp.chargeAmount)}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [ok, result, money, pct, grossUp, targetNet]);

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
    setAmount(DEFAULTS.amount);
    setCurrency(DEFAULTS.currency);
    setPercentFee(DEFAULTS.percentFee);
    setFixedFee(DEFAULTS.fixedFee);
    setCrossBorderPercent(DEFAULTS.crossBorderPercent);
    setConversionPercent(DEFAULTS.conversionPercent);
    setTaxOnFeePercent(DEFAULTS.taxOnFeePercent);
    setInternational(DEFAULTS.international);
    setConverted(DEFAULTS.converted);
    setTargetNet(DEFAULTS.targetNet);
    setTxPerMonth(DEFAULTS.txPerMonth);
    setAvgTicket(DEFAULTS.avgTicket);
    setPreset(DEFAULTS.preset);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CreditCard className="h-4 w-4" aria-hidden="true" />
          Payments
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Payment Gateway Fee Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          See exactly what settles into your account after the percentage rate, the fixed fee per
          transaction, cross-border and conversion uplifts, and any tax charged on the fee itself.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="pg-preset">Start from published pricing</label>
          <select id="pg-preset" className={`mt-2 ${INPUT_CLASS}`} value={preset} onChange={(e) => applyPreset(e.target.value)}>
            {Object.values(GATEWAY_PRESETS).map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Indicative headline rates only — pricing varies by country, card type and volume, and is
            often negotiated. Check your merchant agreement.
          </p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pg-amount">Amount charged to the customer</label>
            <input id="pg-amount" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pg-currency">Currency</label>
            <select id="pg-currency" className={`mt-2 ${INPUT_CLASS}`} value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {Object.keys(CURRENCY_LOCALES).map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pg-pct">Percentage rate (%)</label>
            <input id="pg-pct" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" max="100" step="0.01" value={percentFee} onChange={(e) => setPercentFee(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pg-fixed">Fixed fee per transaction</label>
            <input id="pg-fixed" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.01" value={fixedFee} onChange={(e) => setFixedFee(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pg-cross">Cross-border uplift (%)</label>
            <input id="pg-cross" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" max="100" step="0.1" value={crossBorderPercent} onChange={(e) => setCrossBorderPercent(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pg-conv">Currency conversion uplift (%)</label>
            <input id="pg-conv" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" max="100" step="0.1" value={conversionPercent} onChange={(e) => setConversionPercent(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pg-tax">Tax charged on the fee (%)</label>
            <input id="pg-tax" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" max="100" step="1" value={taxOnFeePercent} onChange={(e) => setTaxOnFeePercent(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold" htmlFor="pg-intl">
              <input id="pg-intl" type="checkbox" className="h-5 w-5 accent-[var(--primary)]" checked={international} onChange={(e) => setInternational(e.target.checked)} />
              International card
            </label>
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold" htmlFor="pg-conv-on">
              <input id="pg-conv-on" type="checkbox" className="h-5 w-5 accent-[var(--primary)]" checked={converted} onChange={(e) => setConverted(e.target.checked)} />
              Currency conversion applies
            </label>
          </div>
        </div>
      </section>

      {result.error && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Net settlement
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]" aria-live="polite" aria-atomic="true">
              {ok ? money(result.net) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? `${pct.format(result.effectivePercent)}% of the sale goes on fees` : DASH}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the gateway fee breakdown" className={GHOST_BTN} disabled={!summary}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {ok && result.underwater && (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            The fee is larger than the payment — at these rates this ticket size loses money.
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Amount charged", ok ? money(result.amount) : DASH],
            [`Percentage fees (${ok ? pct.format(result.totalPercent) : "—"}%)`, ok ? money(result.percentPart) : DASH],
            ["Fixed fee", ok ? money(result.fixedFee) : DASH],
            ["Cross-border part", ok ? money(result.crossBorderPart) : DASH],
            ["Conversion part", ok ? money(result.conversionPart) : DASH],
            ["Tax on the fee", ok ? money(result.taxOnFee) : DASH],
            ["Total cost of processing", ok ? money(result.totalCost) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Charge more so the fees do not eat your price</h2>
        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="pg-target">Amount you want to receive</label>
          <input id="pg-target" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="1" value={targetNet} onChange={(e) => setTargetNet(e.target.value)} />
        </div>
        {grossUp.error ? (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {grossUp.error}
          </p>
        ) : (
          <dl className="mt-5 divide-y divide-[var(--border)] text-sm" aria-live="polite" aria-atomic="true">
            {[
              ["Charge the customer", money(grossUp.chargeAmount)],
              ["Uplift over your price", `${money(grossUp.uplift)} (${pct.format(grossUp.upliftPercent)}%)`],
              ["Fees on that charge", money(grossUp.fee.totalCost)],
              ["Lands in your account", money(grossUp.fee.net)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      {ladder.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What the fixed fee does to small tickets</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Ticket</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Fee</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Net</th>
                  <th scope="col" className="py-2 text-right font-semibold">Effective</th>
                </tr>
              </thead>
              <tbody>
                {ladder.map((row) => (
                  <tr key={row.amount} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{money(row.amount)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{money(row.totalCost)}</td>
                    <td className="py-2 pr-3 text-right">{money(row.net)}</td>
                    <td className={`py-2 text-right font-semibold ${row.underwater ? "text-[var(--danger)]" : ""}`}>
                      {pct.format(row.effectivePercent)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Monthly cost on your real volume</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pg-txm">Transactions a month</label>
            <input id="pg-txm" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="1" step="1" value={txPerMonth} onChange={(e) => setTxPerMonth(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pg-avg">Average ticket</label>
            <input id="pg-avg" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="1" value={avgTicket} onChange={(e) => setAvgTicket(e.target.value)} />
          </div>
        </div>
        {monthly.error ? (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {monthly.error}
          </p>
        ) : (
          <dl className="mt-5 divide-y divide-[var(--border)] text-sm" aria-live="polite" aria-atomic="true">
            {[
              ["Processed volume", money(monthly.volume)],
              ["Processing cost", money(monthly.cost)],
              ["Settled to you", money(monthly.net)],
              ["Blended rate", `${pct.format(monthly.effectivePercent)}%`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates only. Chargebacks, refunds where the fixed fee is not returned, payout fees and
        interchange-plus pricing can all change the real cost — reconcile against your provider's
        settlement statements, and take tax advice on whether the fee carries GST or VAT in your
        country.
      </p>
    </main>
  );
}
