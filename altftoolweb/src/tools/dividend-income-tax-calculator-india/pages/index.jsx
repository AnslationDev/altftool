"use client";

import { useMemo, useState } from "react";
import { Check, Coins, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  ADVANCE_TAX_THRESHOLD,
  HEALTH_EDUCATION_CESS,
  MAX_SURCHARGE_ON_DIVIDEND,
  SLAB_RATES,
  SURCHARGE_RATES,
  TDS_THRESHOLD_194,
  computeDividendTax,
} from "../lib";

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

const DEFAULT_ROWS = [
  { id: 1, name: "Large-cap stock", amount: "60000" },
  { id: 2, name: "Dividend fund", amount: "8000" },
];

const toNumber = (raw) => {
  const text = String(raw ?? "").replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [nextId, setNextId] = useState(3);
  const [interestExpense, setInterestExpense] = useState("20000");
  const [slabRate, setSlabRate] = useState("30");
  const [surcharge, setSurcharge] = useState("0");
  const [panFurnished, setPanFurnished] = useState(true);
  const [formFiled, setFormFiled] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeDividendTax({
        companies: rows.map((row) => ({ name: row.name, amount: toNumber(row.amount) })),
        interestExpense: toNumber(interestExpense) || 0,
        slabRatePercent: toNumber(slabRate),
        surchargePercent: toNumber(surcharge),
        panFurnished,
        formFiled,
      }),
    [rows, interestExpense, slabRate, surcharge, panFurnished, formFiled],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Dividend Income Tax Calculator (India)",
      `Gross dividend: ${money(result.grossDividend)}`,
      `Interest deduction allowed (capped at 20%): ${money(result.allowedInterest)}`,
      `Taxable dividend: ${money(result.taxableDividend)}`,
      `Tax at ${pct(result.slabRatePercent)} slab: ${money(result.baseTax)}`,
      `Surcharge: ${money(result.surcharge)}`,
      `Cess at ${HEALTH_EDUCATION_CESS}%: ${money(result.cess)}`,
      `Total tax: ${money(result.totalTax)}`,
      `TDS already deducted: ${money(result.totalTds)}`,
      result.refundDue > 0
        ? `Refund due: ${money(result.refundDue)}`
        : `Balance tax payable: ${money(result.balancePayable)}`,
      `Effective tax rate on dividend: ${pct(result.effectiveTaxRate)}`,
    ].join("\n");
  }, [hasError, result]);

  const updateRow = (id, key, value) => {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [key]: value } : row)),
    );
  };

  const addRow = () => {
    setRows((current) => [...current, { id: nextId, name: "", amount: "" }]);
    setNextId((value) => value + 1);
  };

  const removeRow = (id) => {
    setRows((current) => (current.length > 1 ? current.filter((row) => row.id !== id) : current));
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
    setRows(DEFAULT_ROWS);
    setNextId(3);
    setInterestExpense("20000");
    setSlabRate("30");
    setSurcharge("0");
    setPanFurnished(true);
    setFormFiled(false);
    setCopied(false);
  };

  const show = (value, formatter = money) => (hasError ? DASH : formatter(value));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Coins className="h-4 w-4" aria-hidden="true" />
          Dividend tax
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Dividend Income Tax Calculator India
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Dividend is taxed at your slab rate as income from other sources. This works out the tax,
          the interest deduction you may claim (capped at 20% of the dividend under section 57) and
          the section 194 TDS already withheld, company by company.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Dividend received in the financial year</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          TDS is checked per company: a payer deducts only when its own payout crosses{" "}
          {money(TDS_THRESHOLD_194)} for the year.
        </p>

        <div className="mt-4 space-y-3">
          {rows.map((row, index) => (
            <div key={row.id} className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`div-name-${row.id}`}>
                    Company or fund {index + 1}
                  </label>
                  <input
                    id={`div-name-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    placeholder="e.g. ITC"
                    value={row.name}
                    onChange={(event) => updateRow(row.id, "name", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`div-amount-${row.id}`}>
                    Dividend received (INR)
                  </label>
                  <input
                    id={`div-amount-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="100"
                    value={row.amount}
                    onChange={(event) => updateRow(row.id, "amount", event.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length === 1}
                  aria-label={`Remove company ${index + 1}`}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] disabled:opacity-40 active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 sm:w-11"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  <span className="sm:hidden">Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={addRow} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add another payer
        </button>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your tax position</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="div-interest">
              Interest on money borrowed to invest (INR)
            </label>
            <input
              id="div-interest"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={interestExpense}
              onChange={(event) => setInterestExpense(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="div-slab">
              Your marginal slab rate
            </label>
            <select
              id="div-slab"
              className={`mt-2 ${INPUT_CLASS}`}
              value={slabRate}
              onChange={(event) => setSlabRate(event.target.value)}
            >
              {SLAB_RATES.map((rate) => (
                <option key={rate} value={String(rate)}>
                  {rate}%
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="div-surcharge">
              Surcharge on total income
            </label>
            <select
              id="div-surcharge"
              className={`mt-2 ${INPUT_CLASS}`}
              value={surcharge}
              onChange={(event) => setSurcharge(event.target.value)}
            >
              {SURCHARGE_RATES.map((rate) => (
                <option key={rate} value={String(rate)}>
                  {rate}%
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Surcharge on dividend is capped at {MAX_SURCHARGE_ON_DIVIDEND}%.
            </p>
          </div>
          <fieldset className="rounded-md border border-[var(--border)] p-3">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Deduction status
            </legend>
            <label
              className="flex min-h-11 items-center gap-2 text-sm"
              htmlFor="div-pan"
            >
              <input
                id="div-pan"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={panFurnished}
                onChange={(event) => setPanFurnished(event.target.checked)}
              />
              PAN furnished to the registrar
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm" htmlFor="div-15g">
              <input
                id="div-15g"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={formFiled}
                onChange={(event) => setFormFiled(event.target.checked)}
              />
              Form 15G / 15H filed for nil TDS
            </label>
          </fieldset>
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
              Total tax on dividend income
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {show(result.totalTax)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see your figures."
                : `${pct(result.effectiveTaxRate)} of the ${money(result.grossDividend)} you received`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy dividend tax result"
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
            ["Gross dividend received", show(result.grossDividend)],
            [
              "Interest deduction allowed (max 20%)",
              hasError
                ? DASH
                : `${money(result.allowedInterest)} of ${money(result.interestExpense)}`,
            ],
            ["Interest disallowed", show(result.disallowedInterest)],
            ["Taxable dividend", show(result.taxableDividend)],
            [
              `Income tax at ${hasError ? DASH : pct(result.slabRatePercent)}`,
              show(result.baseTax),
            ],
            [
              `Surcharge at ${hasError ? DASH : pct(result.effectiveSurchargeRate)}`,
              show(result.surcharge),
            ],
            [`Health and education cess at ${HEALTH_EDUCATION_CESS}%`, show(result.cess)],
            ["TDS already deducted under section 194", show(result.totalTds)],
            [
              result.refundDue > 0 ? "Refund due" : "Balance tax payable",
              show(result.refundDue > 0 ? result.refundDue : result.balancePayable),
            ],
            ["Dividend left after tax", show(result.netInHand)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.advanceTaxApplies && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            Balance tax is {money(ADVANCE_TAX_THRESHOLD)} or more, so advance tax instalments apply
            under section 208. Dividend is estimated only after it is declared, so the instalment
            due immediately after receipt is the one to watch.
          </p>
        )}
        {!hasError && result.surchargeCapped && (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            Your surcharge slab is {pct(result.surchargePercent)}, but surcharge on dividend income
            is restricted to {MAX_SURCHARGE_ON_DIVIDEND}%.
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">TDS company by company</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Payer
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Dividend
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Rate
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    TDS
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.perCompany.map((row, index) => (
                  <tr
                    key={`${row.name}-${index}`}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="py-2 pr-3 font-semibold">{row.name}</td>
                    <td className="py-2 pr-3 text-right">{money(row.amount)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {row.tdsDeducted ? pct(row.tdsRate) : "Nil"}
                    </td>
                    <td className="py-2 text-right">{money(row.tds)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            Every rupee of dividend is taxable even where no TDS was deducted. Check the deducted
            amounts against your Form 26AS and Annual Information Statement before filing.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate for resident individuals only. It ignores rebates, other heads of
        income and the marginal relief that can apply at surcharge boundaries. Speak to a chartered
        accountant before relying on it for a return.
      </p>
    </main>
  );
}
