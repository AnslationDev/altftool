"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Stamp } from "lucide-react";

import {
  DEFAULT_DENOMINATIONS,
  STAMP_DENOMINATIONS,
  splitStampDuty,
  stampPurchaseCost,
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

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const money2 = (value) => (Number.isFinite(value) ? INR2.format(value) : "—");
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = { duty: "47200", fee: "20" };

export default function ToolHome() {
  const [duty, setDuty] = useState(DEFAULTS.duty);
  const [fee, setFee] = useState(DEFAULTS.fee);
  const [selected, setSelected] = useState(() => new Set(DEFAULT_DENOMINATIONS));
  const [copied, setCopied] = useState(false);

  const denominations = useMemo(
    () => STAMP_DENOMINATIONS.filter((value) => selected.has(value)),
    [selected],
  );

  const result = useMemo(
    () => splitStampDuty({ duty: Number(duty), denominations }),
    [duty, denominations],
  );

  const cost = useMemo(() => {
    if (result.error) return { error: result.error };
    return stampPurchaseCost({
      payable: result.payable,
      totalSheets: result.totalSheets,
      perSheetServiceFee: Number(fee),
    });
  }, [result, fee]);

  const errorMessage = result.error || cost.error || "";
  const ok = !errorMessage;

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      "Stamp Paper Denomination Split",
      `Stamp duty payable: ${money(result.duty)}`,
      `Sheets to buy: ${result.totalSheets}`,
      ...result.sheets.map(
        (row) => `  ${row.count} x ${money(row.value)} = ${money(row.subtotal)}`,
      ),
      `Total face value: ${money(result.payable)}`,
      `Excess over duty: ${money(result.excess)}`,
      `Vendor service fee: ${money2(cost.serviceTotal)}`,
      `Cash to carry: ${money2(cost.grandTotal)}`,
    ];
    return lines.join("\n");
  }, [ok, result, cost]);

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
    setDuty(DEFAULTS.duty);
    setFee(DEFAULTS.fee);
    setSelected(new Set(DEFAULT_DENOMINATIONS));
    setCopied(false);
  };

  const toggle = (value) => {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Stamp className="h-4 w-4" aria-hidden="true" />
          Legal utilities
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Stamp Paper Denomination Splitter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the stamp duty payable and get the smallest set of non-judicial stamp papers that
          covers it, along with the excess you cannot avoid because of the fixed denomination ladder.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="stamp-duty">
              Stamp duty payable (INR)
            </label>
            <input
              id="stamp-duty"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={duty}
              onChange={(event) => setDuty(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stamp-fee">
              Vendor writing / service fee per sheet (INR)
            </label>
            <input
              id="stamp-fee"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={fee}
              onChange={(event) => setFee(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Denominations your vendor stocks
          </legend>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Untick anything the counter has run out of and the split is recalculated around it.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {STAMP_DENOMINATIONS.map((value) => {
              const active = selected.has(value);
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle(value)}
                  className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                    active
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {money(value)}
                </button>
              );
            })}
          </div>
        </fieldset>
      </section>

      {errorMessage ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {errorMessage}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Stamp papers to buy
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${result.totalSheets} ${result.totalSheets === 1 ? "sheet" : "sheets"}` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `Face value ${money(result.payable)} against duty of ${money(result.duty)}`
                : "Fix the input above to see a split."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the stamp paper split"
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
            ["Stamp duty payable", ok ? money(result.duty) : DASH],
            ["Total face value bought", ok ? money(result.payable) : DASH],
            [
              "Excess over duty",
              ok ? (result.exact ? `${money(0)} (exact match)` : money(result.excess)) : DASH,
            ],
            ["Largest sheet needed", ok ? money(result.largestSheet) : DASH],
            ["Vendor service fee total", ok ? money2(cost.serviceTotal) : DASH],
            ["Cash to carry to the counter", ok ? money2(cost.grandTotal) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Sheet-by-sheet breakdown</h2>
        {ok ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Denomination
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Sheets
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.sheets.map((row) => (
                  <tr key={row.value} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{money(row.value)}</td>
                    <td className="py-2 pr-3 text-right">{row.count}</td>
                    <td className="py-2 text-right">{money(row.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-[var(--border)]">
                  <td className="py-2 pr-3 font-semibold">Total</td>
                  <td className="py-2 pr-3 text-right font-semibold">{result.totalSheets}</td>
                  <td className="py-2 text-right font-semibold">{money(result.payable)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{DASH}</p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Stamp duty rates, the denominations actually stocked
        and the acceptance of physical paper over e-stamping all vary by state — confirm the
        chargeable duty with the sub-registrar or your advocate before you buy.
      </p>
    </main>
  );
}
