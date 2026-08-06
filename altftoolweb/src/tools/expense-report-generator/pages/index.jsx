"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, Receipt, RotateCcw, Trash2 } from "lucide-react";

import { CATEGORIES, CASH_LIMIT, PAYMENT_MODES, buildExpenseReport } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const TOGGLE_CLASS =
  "flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)]";
const CHIP_CLASS =
  "rounded bg-[var(--warning-soft)] px-1.5 py-0.5 text-xs font-semibold text-[var(--warning)]";

const START_ITEMS = [
  { id: 1, date: "2026-07-03", category: "air", description: "Delhi to Mumbai return", amount: "8400", tax: "400", mode: "upi", hasReceipt: true, billable: true },
  // Delhi-registered employer, hotel in Mumbai: an interstate stay, so the GST
  // shown is not creditable unless the hotel happens to share the employer's
  // registered state — hotelSameState defaults to false here for that reason.
  { id: 2, date: "2026-07-03", category: "hotel", description: "Two nights, Andheri", amount: "11800", tax: "1800", mode: "card", hasReceipt: true, billable: false, hotelSameState: false },
  { id: 3, date: "2026-07-04", category: "meals", description: "Client dinner", amount: "2360", tax: "360", mode: "cash", hasReceipt: true, billable: false },
  { id: 4, date: "2026-07-04", category: "cab", description: "Airport transfers", amount: "1200", tax: "0", mode: "cash", hasReceipt: false, billable: false },
];

const START_SETUP = { advance: "10000", approvalLimit: "10000", gstRegistered: true };

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [setup, setSetup] = useState(START_SETUP);
  const [items, setItems] = useState(START_ITEMS);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setSetup((current) => ({ ...current, [key]: value }));

  const updateItem = (id, key, value) =>
    setItems((current) => current.map((item) => (item.id === id ? { ...item, [key]: value } : item)));

  const addItem = () =>
    setItems((current) => {
      const nextId = current.reduce((max, item) => Math.max(max, item.id), 0) + 1;
      return [
        ...current,
        { id: nextId, date: "", category: "other", description: "", amount: "", tax: "", mode: "upi", hasReceipt: true, billable: false, hotelSameState: false },
      ];
    });

  const removeItem = (id) => setItems((current) => current.filter((item) => item.id !== id));

  const report = useMemo(() => {
    const advance = setup.advance.trim() === "" ? 0 : toNumber(setup.advance);
    if (Number.isNaN(advance)) return { error: "Enter a valid advance amount, or leave it blank." };
    const approvalLimit = setup.approvalLimit.trim() === "" ? 0 : toNumber(setup.approvalLimit);
    if (Number.isNaN(approvalLimit)) return { error: "Enter a valid approval limit, or leave it blank." };

    const lines = items
      .filter((item) => String(item.amount).trim() !== "")
      .map((item) => ({
        date: item.date,
        category: item.category,
        description: item.description,
        amount: toNumber(item.amount),
        tax: String(item.tax).trim() === "" ? 0 : toNumber(item.tax),
        mode: item.mode,
        hasReceipt: item.hasReceipt,
        billable: item.billable,
        hotelSameState: item.hotelSameState,
      }));

    return buildExpenseReport({
      items: lines,
      advance,
      approvalLimit,
      gstRegistered: setup.gstRegistered,
    });
  }, [setup, items]);

  const ok = !report.error;

  const copy = async () => {
    if (!ok) return;
    const lines = report.rows.map(
      (row) => `${row.line}. ${row.date || "-"} ${row.categoryLabel} — ${row.description || "-"} ${row.amount}`,
    );
    const text = [
      "Expense report",
      ...lines,
      `Total claimed ${money(report.gross)}`,
      `Reimbursable ${money(report.reimbursable)}`,
      `Advance ${money(report.advance)}`,
      report.netPayable >= 0
        ? `Payable to employee ${money(report.dueToEmployee)}`
        : `Recoverable from employee ${money(report.dueFromEmployee)}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset the report? This clears every expense line you have entered and replaces them with the sample data — this cannot be undone.",
      )
    ) {
      return;
    }
    setSetup(START_SETUP);
    setItems(START_ITEMS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Receipt className="h-4 w-4" aria-hidden="true" />
          Claim &amp; settle
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Expense Report Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your bills and get the claim your finance team needs: category totals, the GST you can
          actually take credit for, the advance settled off, and a flag on any cash payment that
          crosses the ₹{CASH_LIMIT.toLocaleString("en-IN")} limit.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Report settings</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="er-advance">
              Advance already drawn (₹)
            </label>
            <input
              id="er-advance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={setup.advance}
              onChange={(event) => setField("advance", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="er-limit">
              Extra approval needed above (₹)
            </label>
            <input
              id="er-limit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={setup.approvalLimit}
              onChange={(event) => setField("approvalLimit", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={TOGGLE_CLASS} htmlFor="er-gst">
              <input
                id="er-gst"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={setup.gstRegistered}
                onChange={(event) => setField("gstRegistered", event.target.checked)}
              />
              Employer is GST registered and claims input tax credit
            </label>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Expense lines</h2>
          <button type="button" onClick={addItem} aria-label="Add an expense line" className={GHOST_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add line
          </button>
        </div>

        <div className="mt-4 grid gap-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-lg border border-[var(--border)] p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`er-date-${item.id}`}>
                    Date
                  </label>
                  <input
                    id={`er-date-${item.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="date"
                    value={item.date}
                    onChange={(event) => updateItem(item.id, "date", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`er-cat-${item.id}`}>
                    Category
                  </label>
                  <select
                    id={`er-cat-${item.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={item.category}
                    onChange={(event) => updateItem(item.id, "category", event.target.value)}
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category.key} value={category.key}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`er-desc-${item.id}`}>
                    Description
                  </label>
                  <input
                    id={`er-desc-${item.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={item.description}
                    onChange={(event) => updateItem(item.id, "description", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`er-amt-${item.id}`}>
                    Bill total (₹)
                  </label>
                  <input
                    id={`er-amt-${item.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={item.amount}
                    onChange={(event) => updateItem(item.id, "amount", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`er-tax-${item.id}`}>
                    GST on the bill (₹)
                  </label>
                  <input
                    id={`er-tax-${item.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={item.tax}
                    onChange={(event) => updateItem(item.id, "tax", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`er-mode-${item.id}`}>
                    Paid by
                  </label>
                  <select
                    id={`er-mode-${item.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={item.mode}
                    onChange={(event) => updateItem(item.id, "mode", event.target.value)}
                  >
                    {PAYMENT_MODES.map((mode) => (
                      <option key={mode.key} value={mode.key}>
                        {mode.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid content-end gap-3">
                  <label className={TOGGLE_CLASS} htmlFor={`er-rcpt-${item.id}`}>
                    <input
                      id={`er-rcpt-${item.id}`}
                      type="checkbox"
                      className="h-5 w-5 accent-[var(--primary)]"
                      checked={item.hasReceipt}
                      onChange={(event) => updateItem(item.id, "hasReceipt", event.target.checked)}
                    />
                    Receipt attached
                  </label>
                </div>
                <div className="sm:col-span-2">
                  <label className={TOGGLE_CLASS} htmlFor={`er-bill-${item.id}`}>
                    <input
                      id={`er-bill-${item.id}`}
                      type="checkbox"
                      className="h-5 w-5 accent-[var(--primary)]"
                      checked={item.billable}
                      onChange={(event) => updateItem(item.id, "billable", event.target.checked)}
                    />
                    Rebillable to a client
                  </label>
                </div>
                {item.category === "hotel" && (
                  <div className="sm:col-span-2">
                    <label className={TOGGLE_CLASS} htmlFor={`er-samestate-${item.id}`}>
                      <input
                        id={`er-samestate-${item.id}`}
                        type="checkbox"
                        className="h-5 w-5 accent-[var(--primary)]"
                        checked={Boolean(item.hotelSameState)}
                        onChange={(event) => updateItem(item.id, "hotelSameState", event.target.checked)}
                      />
                      Hotel is in the state where the company is GST-registered
                    </label>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      Place of supply for a hotel stay is the hotel&apos;s own location, not your billing
                      address. Leave unchecked for an interstate trip — the GST shown is then treated as a
                      cost, not a credit.
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Remove expense line ${item.id}`}
                  className={GHOST_BTN}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="rounded-md bg-[var(--muted)] px-3 py-3 text-sm text-[var(--muted-foreground)]">
              No lines yet. Add your first bill.
            </p>
          )}
        </div>
      </section>

      {report.error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {report.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {ok && report.netPayable < 0 ? "Recoverable from employee" : "Payable to employee"}
            </p>
            <p className="mt-1 text-3xl font-semibold leading-tight text-[var(--primary)] sm:text-4xl">
              {ok ? money(report.netPayable < 0 ? report.dueFromEmployee : report.dueToEmployee) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${report.lineCount} lines · ${money(report.gross)} claimed · ${money(report.advance)} advance`
                : "Fix the inputs above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copy}
              disabled={!ok}
              aria-label="Copy the expense report"
              className={`${GHOST_BTN} disabled:opacity-40`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the report" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            ["Total claimed", ok ? money(report.gross) : "—"],
            ["Reimbursable to you", ok ? money(report.reimbursable) : "—"],
            ["Already on company card", ok ? money(report.companyPaid) : "—"],
            ["GST on bills", ok ? money(report.taxTotal) : "—"],
            ["Input credit available", ok ? money(report.creditableTax) : "—"],
            ["GST that is a cost", ok ? money(report.blockedTax) : "—"],
            ["Rebillable to clients", ok ? money(report.billableTotal) : "—"],
            ["Net cost to company", ok ? money(report.netCost) : "—"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-md bg-[var(--muted)] px-3 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                {label}
              </dt>
              <dd className="mt-1 text-base font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && report.flags.cashLimit > 0 && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]"
          >
            {report.flags.cashLimit} cash payment{report.flags.cashLimit > 1 ? "s" : ""} exceed ₹
            {CASH_LIMIT.toLocaleString("en-IN")}. Section 40A(3) can disallow the expenditure unless
            it was paid by account payee cheque, draft or an electronic mode.
          </p>
        )}
        {ok && report.flags.missingReceipts > 0 && (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]"
          >
            {report.flags.missingReceipts} line{report.flags.missingReceipts > 1 ? "s have" : " has"} no
            receipt attached. Without a bill the payment can be treated as taxable salary rather than a
            reimbursement.
          </p>
        )}
        {ok && report.flags.needsApproval > 0 && (
          <p
            role="status"
            aria-live="polite"
            className="mt-3 rounded-md bg-[var(--info-soft)] px-3 py-2 text-sm font-medium text-[var(--foreground)]"
          >
            {report.flags.needsApproval} line{report.flags.needsApproval > 1 ? "s need" : " needs"} the
            extra sign-off set above.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Line detail</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">#</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Date</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Category</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Base</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">GST</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Total</th>
                <th scope="col" className="py-2 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {ok && report.rows.length > 0 ? (
                report.rows.map((row) => (
                  <tr key={row.line} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 tabular-nums">{row.line}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{row.date || "—"}</td>
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{row.categoryLabel}</span>
                      {row.description && (
                        <span className="block text-xs text-[var(--muted-foreground)]">{row.description}</span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums">{money(row.base)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{money(row.tax)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums font-semibold">{money(row.amount)}</td>
                    <td className="py-2">
                      <span className="flex flex-wrap gap-1">
                        {row.tax > 0 && !row.creditAvailable && <span className={CHIP_CLASS}>no credit</span>}
                        {row.cashLimitBreach && <span className={CHIP_CLASS}>cash limit</span>}
                        {row.missingReceipt && <span className={CHIP_CLASS}>no receipt</span>}
                        {row.needsApproval && <span className={CHIP_CLASS}>approval</span>}
                        {row.paidByCompany && <span className={CHIP_CLASS}>company paid</span>}
                        {row.billable && <span className={CHIP_CLASS}>rebillable</span>}
                      </span>
                      {row.tax > 0 && row.itcNote && (
                        <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                          {row.itcNote}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-3 text-[var(--muted-foreground)]" colSpan={7}>
                    —
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <h2 className="mt-6 text-base font-semibold">Totals by category</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Category</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Amount</th>
                <th scope="col" className="py-2 text-right font-semibold">Share</th>
              </tr>
            </thead>
            <tbody>
              {ok && report.byCategory.length > 0 ? (
                report.byCategory.map((row) => (
                  <tr key={row.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{money(row.amount)}</td>
                    <td className="py-2 text-right tabular-nums">{row.share}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-3 text-[var(--muted-foreground)]" colSpan={3}>
                    —
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Input tax credit needs a tax invoice carrying your employer&apos;s GSTIN, and Section 17(5) of
        the CGST Act blocks it on food, outdoor catering, club membership and most vehicle hire. This
        page is informational and not tax advice — confirm the treatment of any line with your finance
        team or a chartered accountant.
      </p>
    </main>
  );
}
