"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Receipt, RotateCcw } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const DEFAULTS = {
  outIgst: 10000,
  outCgst: 20000,
  outSgst: 20000,
  itcIgst: 30000,
  itcCgst: 8000,
  itcSgst: 15000,
  optimise: true,
};

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

/**
 * Set off input tax credit under section 49 read with rule 88A:
 * IGST credit goes to IGST liability first, the balance to CGST/SGST in any order;
 * CGST and SGST credit clear their own head first and may touch IGST only after
 * the IGST credit is exhausted. CGST credit can never pay SGST, and vice versa.
 */
function settleItc(liability, credit, optimise) {
  const due = { ...liability };
  const available = { ...credit };
  const used = { ii: 0, ic: 0, is: 0, cc: 0, ci: 0, ss: 0, si: 0 };
  const take = (pool, need) => Math.max(0, Math.min(pool, need));

  let amount = take(available.igst, due.igst);
  used.ii = amount;
  available.igst -= amount;
  due.igst -= amount;

  if (optimise) {
    const shortfallCgst = Math.max(0, due.cgst - available.cgst);
    const shortfallSgst = Math.max(0, due.sgst - available.sgst);
    amount = take(available.igst, shortfallCgst);
    used.ic += amount;
    available.igst -= amount;
    due.cgst -= amount;
    amount = take(available.igst, shortfallSgst);
    used.is += amount;
    available.igst -= amount;
    due.sgst -= amount;
  }

  amount = take(available.igst, due.cgst);
  used.ic += amount;
  available.igst -= amount;
  due.cgst -= amount;

  amount = take(available.igst, due.sgst);
  used.is += amount;
  available.igst -= amount;
  due.sgst -= amount;

  amount = take(available.cgst, due.cgst);
  used.cc = amount;
  available.cgst -= amount;
  due.cgst -= amount;

  amount = take(available.sgst, due.sgst);
  used.ss = amount;
  available.sgst -= amount;
  due.sgst -= amount;

  if (available.igst <= 0) {
    amount = take(available.cgst, due.igst);
    used.ci = amount;
    available.cgst -= amount;
    due.igst -= amount;

    amount = take(available.sgst, due.igst);
    used.si = amount;
    available.sgst -= amount;
    due.igst -= amount;
  }

  return {
    used,
    cash: due,
    carryForward: available,
    totalCash: due.igst + due.cgst + due.sgst,
    totalCarry: available.igst + available.cgst + available.sgst,
  };
}

export default function ToolHome() {
  const [outIgst, setOutIgst] = useState(String(DEFAULTS.outIgst));
  const [outCgst, setOutCgst] = useState(String(DEFAULTS.outCgst));
  const [outSgst, setOutSgst] = useState(String(DEFAULTS.outSgst));
  const [itcIgst, setItcIgst] = useState(String(DEFAULTS.itcIgst));
  const [itcCgst, setItcCgst] = useState(String(DEFAULTS.itcCgst));
  const [itcSgst, setItcSgst] = useState(String(DEFAULTS.itcSgst));
  const [optimise, setOptimise] = useState(DEFAULTS.optimise);
  const [copied, setCopied] = useState(false);

  const calc = useMemo(() => {
    const values = [outIgst, outCgst, outSgst, itcIgst, itcCgst, itcSgst].map(toNumber);
    if (values.some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every field." };
    }
    if (values.some((value) => value < 0)) {
      return { error: "Tax and credit amounts cannot be negative." };
    }
    const [oi, oc, os, ci, cc, cs] = values;
    if (oi + oc + os <= 0) {
      return { error: "Enter at least one output tax liability to set credit against." };
    }

    const liability = { igst: oi, cgst: oc, sgst: os };
    const credit = { igst: ci, cgst: cc, sgst: cs };
    const result = settleItc(liability, credit, optimise);
    const sequential = settleItc(liability, credit, false);

    return {
      liability,
      credit,
      ...result,
      totalLiability: oi + oc + os,
      totalCredit: ci + cc + cs,
      sequentialCash: sequential.totalCash,
      // Round to paise before diffing: chained subtraction across settleItc's several
      // floating-point steps can leave a ~1e-13 residue even when both allocations are
      // truly identical, which would otherwise render as a false "saves ₹0.00" claim.
      cashSaved: Math.max(0, Math.round((sequential.totalCash - result.totalCash) * 100) / 100),
    };
  }, [outIgst, outCgst, outSgst, itcIgst, itcCgst, itcSgst, optimise]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "GST Input Tax Credit Calculator",
      `Output tax — IGST ${money(calc.liability.igst)}, CGST ${money(
        calc.liability.cgst,
      )}, SGST ${money(calc.liability.sgst)}`,
      `Input tax credit — IGST ${money(calc.credit.igst)}, CGST ${money(
        calc.credit.cgst,
      )}, SGST ${money(calc.credit.sgst)}`,
      `IGST credit used: IGST ${money(calc.used.ii)}, CGST ${money(calc.used.ic)}, SGST ${money(
        calc.used.is,
      )}`,
      `CGST credit used: CGST ${money(calc.used.cc)}, IGST ${money(calc.used.ci)}`,
      `SGST credit used: SGST ${money(calc.used.ss)}, IGST ${money(calc.used.si)}`,
      `Cash payable — IGST ${money(calc.cash.igst)}, CGST ${money(calc.cash.cgst)}, SGST ${money(
        calc.cash.sgst,
      )}`,
      `Total GST payable in cash: ${money(calc.totalCash)}`,
      `Credit carried forward: ${money(calc.totalCarry)}`,
    ].join("\n");
  }, [calc]);

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
    setOutIgst(String(DEFAULTS.outIgst));
    setOutCgst(String(DEFAULTS.outCgst));
    setOutSgst(String(DEFAULTS.outSgst));
    setItcIgst(String(DEFAULTS.itcIgst));
    setItcCgst(String(DEFAULTS.itcCgst));
    setItcSgst(String(DEFAULTS.itcSgst));
    setOptimise(DEFAULTS.optimise);
    setCopied(false);
  };

  const liabilityFields = [
    ["itc-out-igst", "Output IGST (INR)", outIgst, setOutIgst],
    ["itc-out-cgst", "Output CGST (INR)", outCgst, setOutCgst],
    ["itc-out-sgst", "Output SGST / UTGST (INR)", outSgst, setOutSgst],
  ];
  const creditFields = [
    ["itc-in-igst", "IGST credit available (INR)", itcIgst, setItcIgst],
    ["itc-in-cgst", "CGST credit available (INR)", itcCgst, setItcCgst],
    ["itc-in-sgst", "SGST / UTGST credit available (INR)", itcSgst, setItcSgst],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Receipt className="h-4 w-4" aria-hidden="true" />
          GST returns
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          GST Input Tax Credit Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your output tax and the credit sitting in the electronic credit ledger. The
          calculator applies the statutory set-off order — IGST credit first, then CGST and SGST
          against their own heads — and shows exactly how much GST you must still pay in cash.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Output tax liability</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {liabilityFields.map(([id, label, value, setter]) => (
            <div key={id}>
              <label className={LABEL_CLASS} htmlFor={id}>
                {label}
              </label>
              <input
                id={id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="100"
                value={value}
                onChange={(event) => setter(event.target.value)}
              />
            </div>
          ))}
        </div>

        <h2 className="mt-6 text-base font-semibold">Input tax credit available</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {creditFields.map(([id, label, value, setter]) => (
            <div key={id}>
              <label className={LABEL_CLASS} htmlFor={id}>
                {label}
              </label>
              <input
                id={id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="100"
                value={value}
                onChange={(event) => setter(event.target.value)}
              />
            </div>
          ))}
        </div>

        <label className="mt-5 flex items-center gap-3 text-sm font-semibold" htmlFor="itc-optimise">
          <input
            id="itc-optimise"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={optimise}
            onChange={(event) => setOptimise(event.target.checked)}
          />
          Spread the balance IGST credit to minimise cash outgo (allowed by rule 88A)
        </label>
      </section>

      {calc.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {calc.error}
        </p>
      ) : (
        <>
          <section aria-live="polite" className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  GST payable in cash
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {money(calc.totalCash)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  On {money(calc.totalLiability)} of output tax, after using{" "}
                  {money(calc.totalCredit - calc.totalCarry)} of credit
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy input tax credit set-off result"
                  className={GHOST_BTN}
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
                ["Cash payable — IGST", money(calc.cash.igst)],
                ["Cash payable — CGST", money(calc.cash.cgst)],
                ["Cash payable — SGST / UTGST", money(calc.cash.sgst)],
                ["Total output tax", money(calc.totalLiability)],
                ["Total credit available", money(calc.totalCredit)],
                ["Credit utilised", money(calc.totalCredit - calc.totalCarry)],
                ["Credit carried forward", money(calc.totalCarry)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            {calc.cashSaved > 0 && (
              <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
                Spreading the balance IGST credit across CGST and SGST saves{" "}
                <span className="font-semibold text-[var(--success)]">{money(calc.cashSaved)}</span>{" "}
                of cash compared with setting it off against CGST first.
              </p>
            )}
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Set-off working</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Credit used
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      IGST due
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      CGST due
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      SGST due
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["IGST credit", calc.used.ii, calc.used.ic, calc.used.is],
                    ["CGST credit", calc.used.ci, calc.used.cc, null],
                    ["SGST / UTGST credit", calc.used.si, null, calc.used.ss],
                    ["Balance paid in cash", calc.cash.igst, calc.cash.cgst, calc.cash.sgst],
                  ].map(([label, a, b, c]) => (
                    <tr key={label} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{label}</td>
                      <td className="py-2 pr-3 text-right">{money(a)}</td>
                      <td className="py-2 pr-3 text-right">
                        {b === null ? (
                          <span className="text-[var(--muted-foreground)]">not allowed</span>
                        ) : (
                          money(b)
                        )}
                      </td>
                      <td className="py-2 text-right">
                        {c === null ? (
                          <span className="text-[var(--muted-foreground)]">not allowed</span>
                        ) : (
                          money(c)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
              CGST credit can never be set off against SGST, and SGST credit can never be set off
              against CGST. Both may pay IGST only once the IGST credit is fully used.
            </p>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. Cess is set off only against cess, blocked credits under section
        17(5) must be excluded, and credit is available only for invoices reflected in GSTR-2B.
      </p>
    </main>
  );
}
