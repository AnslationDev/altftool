"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, RotateCcw } from "lucide-react";

import { SCENARIOS, computeEducationGst } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  scenarioId: "coaching-classes",
  amount: "50000",
  amountType: "exclusive",
  supplyType: "intra",
};

export default function ToolHome() {
  const [scenarioId, setScenarioId] = useState(DEFAULTS.scenarioId);
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [amountType, setAmountType] = useState(DEFAULTS.amountType);
  const [supplyType, setSupplyType] = useState(DEFAULTS.supplyType);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeEducationGst({
        scenarioId,
        amount: amount.trim() === "" ? Number.NaN : Number(amount),
        amountType,
        supplyType,
      }),
    [scenarioId, amount, amountType, supplyType],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "GST on educational services",
      `Service: ${result.label}`,
      result.exempt ? "Status: EXEMPT from GST" : `Status: taxable at ${result.rate}%`,
      `Authority: ${result.authority}`,
      `Taxable value: ${money(result.taxableValue)}`,
      result.supplyType === "intra"
        ? `CGST: ${money(result.cgst)} | SGST: ${money(result.sgst)}`
        : `IGST: ${money(result.igst)}`,
      `Total GST: ${money(result.totalTax)}`,
      `Invoice total: ${money(result.invoiceTotal)}`,
    ].join("\n");
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
    setScenarioId(DEFAULTS.scenarioId);
    setAmount(DEFAULTS.amount);
    setAmountType(DEFAULTS.amountType);
    setSupplyType(DEFAULTS.supplyType);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Taxable value", DASH],
        ["Total GST", DASH],
        ["Invoice total", DASH],
      ]
    : [
        ["Taxable value", money(result.taxableValue)],
        ...(result.supplyType === "intra"
          ? [
              [`CGST @ ${result.rate / 2}%`, money(result.cgst)],
              [`SGST / UTGST @ ${result.rate / 2}%`, money(result.sgst)],
            ]
          : [[`IGST @ ${result.rate}%`, money(result.igst)]]),
        ["Total GST", money(result.totalTax)],
        ["Invoice total", money(result.invoiceTotal)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          Education &amp; GST
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          GST Calculator for Educational Services
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          School and degree-college fees are exempt; coaching and online courses are taxable, and
          most support services (transport, catering, security, housekeeping) supplied to
          higher-education institutions are taxable too — though admission and examination
          services stay exempt at any level. Pick the supply to see which side of Notification
          12/2017 it falls on and what the tax works out to.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="edu-scenario">
              What is being supplied?
            </label>
            <select
              id="edu-scenario"
              className={`mt-2 ${INPUT_CLASS}`}
              value={scenarioId}
              onChange={(event) => setScenarioId(event.target.value)}
            >
              {SCENARIOS.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="edu-amount">
                Fee or invoice amount (INR)
              </label>
              <input
                id="edu-amount"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="100"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="edu-amount-type">
                Amount is
              </label>
              <select
                id="edu-amount-type"
                className={`mt-2 ${INPUT_CLASS}`}
                value={amountType}
                onChange={(event) => setAmountType(event.target.value)}
              >
                <option value="exclusive">GST exclusive (add tax on top)</option>
                <option value="inclusive">GST inclusive (extract tax from it)</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="edu-supply-type">
                Place of supply
              </label>
              <select
                id="edu-supply-type"
                className={`mt-2 ${INPUT_CLASS}`}
                value={supplyType}
                onChange={(event) => setSupplyType(event.target.value)}
              >
                <option value="intra">Within the same state — CGST + SGST</option>
                <option value="inter">Across states — IGST</option>
              </select>
            </div>
          </div>
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

      <section
        aria-live="polite"
        aria-atomic="true"
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total GST payable
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.totalTax)}
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${
                hasError
                  ? "text-[var(--muted-foreground)]"
                  : result.exempt
                    ? "text-[var(--success)]"
                    : "text-[var(--foreground)]"
              }`}
            >
              {hasError
                ? "Fix the input above to see a result."
                : result.exempt
                  ? "Exempt supply — no GST is charged"
                  : `Taxable at ${result.rate}% — see SAC heading below`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the education GST result"
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
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {hasError ? null : (
          <div className="mt-5 rounded-md bg-[var(--muted)] px-3 py-3 text-sm leading-6 text-[var(--muted-foreground)]">
            <span className="font-semibold text-[var(--foreground)]">{result.authority}.</span>{" "}
            {result.note}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Exempt or taxable at a glance</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Supply
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  GST
                </th>
              </tr>
            </thead>
            <tbody>
              {SCENARIOS.map((scenario) => (
                <tr key={scenario.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{scenario.label}</td>
                  <td
                    className={`py-2 text-right font-semibold ${
                      scenario.exempt ? "text-[var(--success)]" : "text-[var(--foreground)]"
                    }`}
                  >
                    {scenario.exempt ? "Exempt" : `${scenario.rate}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. Exemption depends on the exact facts — who supplies,
        who receives, and whether the qualification is recognised by law. Rates and notification
        entries are amended from time to time, so confirm the current position with your GST
        practitioner before invoicing.
      </p>
    </main>
  );
}
