"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Wheat } from "lucide-react";

import { computeMspRealisation, PDPS_CAP_PCT } from "../lib";

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

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const money2 = (value) => INR2.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  msp: "2300",
  price: "2350",
  qty: "50",
  feePct: "2",
  commPct: "2.5",
  labour: "15",
  gunny: "10",
  transport: "4000",
  other: "0",
  pdps: false,
};

export default function ToolHome() {
  const [msp, setMsp] = useState(DEFAULTS.msp);
  const [price, setPrice] = useState(DEFAULTS.price);
  const [qty, setQty] = useState(DEFAULTS.qty);
  const [feePct, setFeePct] = useState(DEFAULTS.feePct);
  const [commPct, setCommPct] = useState(DEFAULTS.commPct);
  const [labour, setLabour] = useState(DEFAULTS.labour);
  const [gunny, setGunny] = useState(DEFAULTS.gunny);
  const [transport, setTransport] = useState(DEFAULTS.transport);
  const [other, setOther] = useState(DEFAULTS.other);
  const [pdps, setPdps] = useState(DEFAULTS.pdps);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeMspRealisation({
        mspPerQuintal: msp,
        mandiPricePerQuintal: price,
        quantityQuintals: qty,
        mandiFeePct: feePct,
        commissionPct: commPct,
        labourPerQuintal: labour,
        gunnyPerQuintal: gunny,
        transportTotal: transport,
        otherTotal: other,
        applyPdps: pdps,
      }),
    [msp, price, qty, feePct, commPct, labour, gunny, transport, other, pdps],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "MSP Realisation Calculator",
      `Notified MSP: ${money2(result.msp)}/quintal`,
      `Mandi price: ${money2(result.mandiPrice)}/quintal`,
      `Deductions: ${money2(result.deductionsPerQuintal)}/quintal (${pct(result.deductionSharePct)} of price)`,
      `Net realisation: ${money2(result.netPerQuintal)}/quintal`,
      `Gap vs MSP: ${money2(result.gapPerQuintal)}/quintal`,
      `Quantity: ${NUM.format(result.quantityQuintals)} quintals`,
      `Net amount received: ${money(result.netTotal)}`,
      `Value at MSP: ${money(result.mspTotal)}`,
      result.pdpsApplied ? `PDPS support: ${money(result.pdpsTotal)}` : null,
      `Break-even mandi price to match MSP: ${result.breakEvenPrice === null ? "n/a" : `${money2(result.breakEvenPrice)}/quintal`}`,
    ]
      .filter(Boolean)
      .join("\n");
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
    setMsp(DEFAULTS.msp);
    setPrice(DEFAULTS.price);
    setQty(DEFAULTS.qty);
    setFeePct(DEFAULTS.feePct);
    setCommPct(DEFAULTS.commPct);
    setLabour(DEFAULTS.labour);
    setGunny(DEFAULTS.gunny);
    setTransport(DEFAULTS.transport);
    setOther(DEFAULTS.other);
    setPdps(DEFAULTS.pdps);
    setCopied(false);
  };

  const fields = [
    { id: "msp-value", label: "Notified MSP (₹ per quintal)", value: msp, set: setMsp, step: "1" },
    { id: "msp-price", label: "Mandi price offered (₹ per quintal)", value: price, set: setPrice, step: "1" },
    { id: "msp-qty", label: "Quantity sold (quintals)", value: qty, set: setQty, step: "0.5" },
    { id: "msp-fee", label: "Market fee / cess (% of price)", value: feePct, set: setFeePct, step: "0.05" },
    { id: "msp-comm", label: "Commission agent (% of price)", value: commPct, set: setCommPct, step: "0.05" },
    { id: "msp-labour", label: "Hamali, weighing, loading (₹ per quintal)", value: labour, set: setLabour, step: "1" },
    { id: "msp-gunny", label: "Gunny bags / bardana (₹ per quintal)", value: gunny, set: setGunny, step: "1" },
    { id: "msp-transport", label: "Transport for the whole lot (₹)", value: transport, set: setTransport, step: "100" },
    { id: "msp-other", label: "Other lump-sum costs (₹)", value: other, set: setOther, step: "100" },
  ];

  const showValue = (formatter, value) => (hasError ? DASH : formatter(value));

  const gapPositive = !hasError && result.gapPerQuintal >= 0;

  const rows = hasError
    ? []
    : [
        ["Gross value at the mandi price", money(result.grossTotal)],
        ["Total deductions", `- ${money(result.deductionsTotal)}`],
        ["Net amount you take home", money(result.netTotal)],
        ["Value of the same lot at MSP", money(result.mspTotal)],
        ["Shortfall / surplus against MSP", money(result.gapTotal)],
        ["Net as a share of MSP", pct(result.realisationPct)],
        ["Deductions as a share of the price", pct(result.deductionSharePct)],
        [
          "Mandi price needed so net equals MSP",
          result.breakEvenPrice === null ? DASH : `${money2(result.breakEvenPrice)} / quintal`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Wheat className="h-4 w-4" aria-hidden="true" />
          Mandi vs MSP
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">MSP Realisation Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          MSP is a gross price per quintal. Subtract the market fee, commission, hamali, bardana and
          transport that a mandi sale actually carries, and see what share of MSP you really keep.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.id}>
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step={field.step}
                value={field.value}
                onChange={(event) => field.set(event.target.value)}
              />
            </div>
          ))}
        </div>

        <label
          htmlFor="msp-pdps"
          className="mt-4 flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
        >
          <input
            id="msp-pdps"
            type="checkbox"
            checked={pdps}
            onChange={(event) => setPdps(event.target.checked)}
            className="h-5 w-5 accent-[var(--primary)]"
          />
          <span>
            I am registered under a Price Deficiency Payment Scheme (PDPS) — add the deficiency
            payment, capped at {PDPS_CAP_PCT}% of MSP
          </span>
        </label>
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
              Net realisation per quintal
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {showValue(money2, result.netPerQuintal)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your realisation."
                : `${pct(result.realisationPct)} of the ${money2(result.msp)} MSP · ${result.verdict}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy MSP realisation result"
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

        <p
          className={`mt-4 rounded-md px-3 py-2 text-sm font-semibold ${
            hasError
              ? "bg-[var(--muted)] text-[var(--muted-foreground)]"
              : gapPositive
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : "bg-[var(--danger-soft)] text-[var(--danger)]"
          }`}
        >
          {hasError
            ? `Gap against MSP: ${DASH}`
            : `${gapPositive ? "Above" : "Below"} MSP by ${money2(Math.abs(result.gapPerQuintal))} per quintal (${money(Math.abs(result.gapTotal))} on this lot)`}
        </p>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(hasError
            ? [
                ["Gross value at the mandi price", DASH],
                ["Total deductions", DASH],
                ["Net amount you take home", DASH],
                ["Value of the same lot at MSP", DASH],
                ["Shortfall / surplus against MSP", DASH],
                ["Net as a share of MSP", DASH],
                ["Deductions as a share of the price", DASH],
                ["Mandi price needed so net equals MSP", DASH],
              ]
            : rows
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.pdpsApplied && (
          <div className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm">
            <p className="font-semibold">
              PDPS support: {money2(result.pdpsPerQuintal)} per quintal ({money(result.pdpsTotal)} in
              total)
            </p>
            <p className="mt-1 text-[var(--muted-foreground)]">
              {result.pdpsCapped
                ? `The MSP gap exceeds the ${PDPS_CAP_PCT}% cap, so the payment is limited to ${money2(result.pdpsCap)} per quintal.`
                : `Within the ${PDPS_CAP_PCT}% cap of ${money2(result.pdpsCap)} per quintal.`}{" "}
              Net with support: {money2(result.netWithSupportPerQuintal)} per quintal.
            </p>
          </div>
        )}
      </section>

      {!hasError && result.breakdown.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Where the deduction goes</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Charge</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Per quintal</th>
                  <th scope="col" className="py-2 text-right font-semibold">On this lot</th>
                </tr>
              </thead>
              <tbody>
                {result.breakdown.map((row) => (
                  <tr key={row.label} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{row.label}</td>
                    <td className="py-2 pr-3 text-right font-semibold">{money2(row.perQuintal)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {money(row.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        MSP is notified per crop, grade and season by the CCEA on CACP recommendations — check the
        current rate before relying on this. Market fee and commission rates are set by each State
        APMC Act and vary widely. Informational only.
      </p>
    </main>
  );
}
