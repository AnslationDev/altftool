"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ReceiptIndianRupee, RotateCcw } from "lucide-react";

import {
  ATM_CHARGE_CEILING,
  ATM_CHARGE_CEILING_LEGACY,
  FREE_OWN_BANK_ATM_TXNS,
  METRO_CENTRES,
  estimateBankCharges,
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
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const money2 = (value) => INR2.format(Number.isFinite(value) ? value : 0);
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  requiredBalance: "10000",
  balanceMaintained: "6000",
  monthsShort: "6",
  shortfallChargePercent: "6",
  shortfallFloorCharge: "50",
  shortfallCapCharge: "600",
  ownBankAtmTxns: "8",
  otherBankAtmTxns: "5",
  atmChargePerTxn: String(ATM_CHARGE_CEILING),
  returnCount: "2",
  returnCharge: "500",
  debitCardAnnualFee: "200",
  smsChargePerQuarter: "15",
};

const BALANCE_FIELDS = [
  { key: "requiredBalance", id: "bce-req", label: "Required monthly average balance", step: "500" },
  { key: "balanceMaintained", id: "bce-held", label: "Average balance you actually keep", step: "500" },
  { key: "monthsShort", id: "bce-months", label: "Months below the requirement (0-12)", step: "1" },
  {
    key: "shortfallChargePercent",
    id: "bce-pct",
    label: "Bank's penalty, as % of the shortfall",
    step: "0.5",
  },
  { key: "shortfallFloorCharge", id: "bce-floor", label: "Minimum penalty per month", step: "10" },
  { key: "shortfallCapCharge", id: "bce-cap", label: "Maximum penalty per month", step: "50" },
];

const OTHER_FIELDS = [
  { key: "ownBankAtmTxns", id: "bce-own", label: "Own-bank ATM uses per month", step: "1" },
  { key: "otherBankAtmTxns", id: "bce-other", label: "Other-bank ATM uses per month", step: "1" },
  { key: "atmChargePerTxn", id: "bce-atmfee", label: "Charge per excess ATM use", step: "1" },
  { key: "returnCount", id: "bce-ret", label: "Cheque / NACH returns in the year", step: "1" },
  { key: "returnCharge", id: "bce-retfee", label: "Charge per return", step: "50" },
  { key: "debitCardAnnualFee", id: "bce-card", label: "Debit card annual fee", step: "50" },
  { key: "smsChargePerQuarter", id: "bce-sms", label: "SMS alert charge per quarter", step: "5" },
];

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [isMetro, setIsMetro] = useState(true);
  const [isBsbda, setIsBsbda] = useState(false);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  const result = useMemo(() => {
    const numeric = {};
    Object.keys(DEFAULTS).forEach((key) => {
      numeric[key] = toNumber(values[key]);
    });
    return estimateBankCharges({ ...numeric, isMetro, isBsbda });
  }, [values, isMetro, isBsbda]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Bank Charges and Penalty Estimator",
      `Total cost for the year: ${money2(result.total)}`,
      `Charges before GST: ${money2(result.subtotal)}`,
      `GST at ${result.gstPercent}%: ${money2(result.gst)}`,
      `Average per month: ${money2(result.monthlyAverage)}`,
      `Avoidable with better habits: ${money2(result.avoidableTotal)}`,
      "",
      ...result.lines.map((line) => `${line.label}: ${money2(line.amount)}`),
    ];
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
    setValues(DEFAULTS);
    setIsMetro(true);
    setIsBsbda(false);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ReceiptIndianRupee className="h-4 w-4" aria-hidden="true" />
          Banking India
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Bank Charges and Penalty Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Add up what a savings account really costs you in a year — minimum balance penalties
          charged on the shortfall, ATM uses past the RBI free limit, return charges, card and SMS
          fees, and 18% GST on all of it.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Minimum balance</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          RBI requires the penalty to be a percentage of the shortfall, not a flat fee. Take the
          percentage, floor and cap from your bank&apos;s schedule of charges.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {BALANCE_FIELDS.map((field) => (
            <div key={field.key}>
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
                value={values[field.key]}
                onChange={setField(field.key)}
              />
            </div>
          ))}
        </div>

        <h2 className="mt-6 text-base font-semibold">ATM, returns and fixed fees</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {OTHER_FIELDS.map((field) => (
            <div key={field.key}>
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
                value={values[field.key]}
                onChange={setField(field.key)}
              />
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-3">
          <label
            className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            htmlFor="bce-metro"
          >
            <input
              id="bce-metro"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={isMetro}
              onChange={(event) => setIsMetro(event.target.checked)}
            />
            <span>I bank in a metro centre ({METRO_CENTRES.join(", ")})</span>
          </label>
          <label
            className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            htmlFor="bce-bsbda"
          >
            <input
              id="bce-bsbda"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={isBsbda}
              onChange={(event) => setIsBsbda(event.target.checked)}
            />
            <span>This is a Basic Savings Bank Deposit Account (no minimum balance)</span>
          </label>
        </div>
      </section>

      {hasError ? (
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
              Cost of this account for a year
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money2(result.total)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the total."
                : `About ${money2(result.monthlyAverage)} a month, GST included`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy bank charges estimate"
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Balance shortfall each month", hasError ? DASH : money(result.shortfall)],
            [
              "Penalty per month on that shortfall",
              hasError ? DASH : money2(result.monthlyShortfallPenalty),
            ],
            [
              "Chargeable ATM uses per month",
              hasError ? DASH : String(result.chargeableAtmTxnsMonth),
            ],
            ["Charges before GST", hasError ? DASH : money2(result.subtotal)],
            [
              `GST at ${hasError ? DASH : result.gstPercent}%`,
              hasError ? DASH : money2(result.gst),
            ],
            ["Total payable for the year", hasError ? DASH : money2(result.total)],
            [
              "Of which you could avoid entirely",
              hasError ? DASH : `${money2(result.avoidableTotal)} (${result.avoidableShare}%)`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.ceilingBreached && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.ceilingNote}
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Where the money goes</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Charge
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Year
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.lines.map((line) => (
                  <tr key={line.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 pr-3">
                      <span className="font-semibold">{line.label}</span>
                      <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                        {line.detail}
                      </span>
                    </td>
                    <td className="py-2.5 text-right align-top font-semibold">
                      {money2(line.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            Free ATM allowance: {FREE_OWN_BANK_ATM_TXNS} own-bank uses and{" "}
            {result.freeOtherBankTxns} other-bank uses a month, counting balance enquiries as well as
            withdrawals. The RBI ceiling on the excess charge is ₹{ATM_CHARGE_CEILING} from 1 May
            2025, up from ₹{ATM_CHARGE_CEILING_LEGACY}.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        An estimate, not a bank statement. Charge structures differ by bank and account variant, and
        return charges are not capped by the RBI — confirm every figure against your bank&apos;s
        current schedule of charges before relying on it.
      </p>
    </main>
  );
}
