"use client";

import { useMemo, useState } from "react";
import { Check, Copy, NotebookPen, Plus, RotateCcw, Trash2 } from "lucide-react";

import { EXPENSE_HEADS, buildPettyCashBook } from "../lib";

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

const START_ROWS = [
  { id: 1, date: "2026-07-02", voucher: "PV-01", particulars: "Auto fare to bank", head: "Conveyance & Travel", amount: "450" },
  { id: 2, date: "2026-07-05", voucher: "PV-02", particulars: "Letterheads and files", head: "Printing & Stationery", amount: "1200" },
  { id: 3, date: "2026-07-09", voucher: "PV-03", particulars: "Speed post to auditor", head: "Postage & Courier", amount: "320" },
  { id: 4, date: "2026-07-14", voucher: "PV-04", particulars: "Pantry supplies", head: "Refreshments & Pantry", amount: "780" },
];

const START_SETUP = {
  imprest: "10000",
  openingBalance: "10000",
  topUps: "0",
  periodStart: "2026-07-01",
  periodEnd: "2026-07-31",
  physicalCount: "",
};

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [setup, setSetup] = useState(START_SETUP);
  const [rows, setRows] = useState(START_ROWS);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setSetup((current) => ({ ...current, [key]: value }));

  const updateRow = (id, key, value) =>
    setRows((current) => current.map((row) => (row.id === id ? { ...row, [key]: value } : row)));

  const addRow = () =>
    setRows((current) => {
      // Derive the next id from the rows already in state — never from a ref.
      const nextId = current.reduce((max, row) => Math.max(max, row.id), 0) + 1;
      return [
        ...current,
        { id: nextId, date: "", voucher: `PV-${String(nextId).padStart(2, "0")}`, particulars: "", head: EXPENSE_HEADS[0], amount: "" },
      ];
    });

  const removeRow = (id) => setRows((current) => current.filter((row) => row.id !== id));

  const book = useMemo(() => {
    const imprest = toNumber(setup.imprest);
    if (Number.isNaN(imprest)) return { error: "Enter the imprest float in rupees." };
    const opening = setup.openingBalance.trim() === "" ? imprest : toNumber(setup.openingBalance);
    if (Number.isNaN(opening)) return { error: "Enter valid opening cash in hand." };
    const topUps = setup.topUps.trim() === "" ? 0 : toNumber(setup.topUps);
    if (Number.isNaN(topUps)) return { error: "Enter valid extra cash received, or leave it blank." };
    const count = setup.physicalCount.trim() === "" ? null : toNumber(setup.physicalCount);
    if (count !== null && Number.isNaN(count)) {
      return { error: "Enter a valid counted cash figure, or leave it blank." };
    }

    const entries = rows
      .filter((row) => String(row.amount).trim() !== "")
      .map((row) => ({
        date: row.date,
        voucher: row.voucher,
        particulars: row.particulars,
        head: row.head,
        amount: toNumber(row.amount),
      }));

    return buildPettyCashBook({
      imprest,
      openingBalance: opening,
      topUps,
      entries,
      physicalCount: count,
      periodStart: setup.periodStart,
      periodEnd: setup.periodEnd,
    });
  }, [setup, rows]);

  const ok = !book.error;
  const flagged = ok ? book.rows.filter((row) => row.duplicate || row.outOfPeriod) : [];

  const copy = async () => {
    if (!ok) return;
    const lines = book.rows.map(
      (row) =>
        `${row.line}. ${row.date || "-"} ${row.voucher || "-"} ${row.particulars || row.head} — ${row.amount} (bal ${row.balance})`,
    );
    const text = [
      `Petty cash book — imprest ${money(book.imprest)}`,
      `Cash available ${money(book.cashAvailable)}`,
      ...lines,
      `Total payments ${money(book.totalPayments)}`,
      `Closing balance ${money(book.closingBalance)}`,
      `Reimbursement due ${money(book.reimbursement)}`,
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
    setSetup(START_SETUP);
    setRows(START_ROWS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <NotebookPen className="h-4 w-4" aria-hidden="true" />
          Imprest system
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Petty Cash Book Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Post your vouchers against a fixed float and get the running balance, the totals by expense
          head for your journal entry, and the exact reimbursement that restores the imprest.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Float and period</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-imprest">
              Imprest float (₹)
            </label>
            <input
              id="pc-imprest"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={setup.imprest}
              onChange={(event) => setField("imprest", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-opening">
              Opening cash in hand (₹)
            </label>
            <input
              id="pc-opening"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={setup.openingBalance}
              onChange={(event) => setField("openingBalance", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-topups">
              Extra cash received (₹)
            </label>
            <input
              id="pc-topups"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={setup.topUps}
              onChange={(event) => setField("topUps", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-count">
              Cash counted at close (₹, optional)
            </label>
            <input
              id="pc-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={setup.physicalCount}
              onChange={(event) => setField("physicalCount", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-start">
              Period from
            </label>
            <input
              id="pc-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={setup.periodStart}
              onChange={(event) => setField("periodStart", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-end">
              Period to
            </label>
            <input
              id="pc-end"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={setup.periodEnd}
              onChange={(event) => setField("periodEnd", event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Vouchers</h2>
          <button type="button" onClick={addRow} aria-label="Add a voucher row" className={GHOST_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add voucher
          </button>
        </div>

        <div className="mt-4 grid gap-4">
          {rows.map((row) => (
            <div key={row.id} className="rounded-lg border border-[var(--border)] p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`pc-date-${row.id}`}>
                    Date
                  </label>
                  <input
                    id={`pc-date-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="date"
                    value={row.date}
                    onChange={(event) => updateRow(row.id, "date", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`pc-voucher-${row.id}`}>
                    Voucher no.
                  </label>
                  <input
                    id={`pc-voucher-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.voucher}
                    onChange={(event) => updateRow(row.id, "voucher", event.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`pc-part-${row.id}`}>
                    Particulars
                  </label>
                  <input
                    id={`pc-part-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.particulars}
                    onChange={(event) => updateRow(row.id, "particulars", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`pc-head-${row.id}`}>
                    Expense head
                  </label>
                  <select
                    id={`pc-head-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={row.head}
                    onChange={(event) => updateRow(row.id, "head", event.target.value)}
                  >
                    {EXPENSE_HEADS.map((head) => (
                      <option key={head} value={head}>
                        {head}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`pc-amt-${row.id}`}>
                    Amount (₹)
                  </label>
                  <input
                    id={`pc-amt-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={row.amount}
                    onChange={(event) => updateRow(row.id, "amount", event.target.value)}
                  />
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  aria-label={`Remove voucher ${row.voucher || row.id}`}
                  className={GHOST_BTN}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="rounded-md bg-[var(--muted)] px-3 py-3 text-sm text-[var(--muted-foreground)]">
              No vouchers yet. Add one to start the book.
            </p>
          )}
        </div>
      </section>

      {book.error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {book.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Reimbursement to claim
            </p>
            <p className="mt-1 text-3xl font-semibold leading-tight text-[var(--primary)] sm:text-4xl">
              {ok ? money(book.reimbursement) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${book.voucherCount} vouchers · float ${book.utilisation}% used`
                : "Fix the inputs above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copy}
              disabled={!ok}
              aria-label="Copy the petty cash book"
              className={`${GHOST_BTN} disabled:opacity-40`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the book" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            ["Cash available", ok ? money(book.cashAvailable) : "—"],
            ["Total payments", ok ? money(book.totalPayments) : "—"],
            ["Closing balance", ok ? money(book.closingBalance) : "—"],
            [
              "Cash count difference",
              ok && book.countDifference !== null ? money(book.countDifference) : "—",
            ],
          ].map(([label, value]) => (
            <div key={label} className="rounded-md bg-[var(--muted)] px-3 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                {label}
              </dt>
              <dd className="mt-1 text-base font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && book.overdrawnAt !== null && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            Voucher {book.overdrawnAt} takes the balance below zero. The float cannot pay for it —
            record a top-up or move the payment to the main cash book.
          </p>
        )}

        {ok && book.proved === false && (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
            Counted cash differs from the book by {money(book.countDifference)}. Recount, then look
            for a missing voucher or an unrecorded top-up.
          </p>
        )}

        {ok && book.proved === true && (
          <p className="mt-4 rounded-md bg-[var(--success-soft)] px-3 py-2 text-sm font-medium text-[var(--success)]">
            Counted cash agrees with the book exactly.
          </p>
        )}

        {ok && flagged.length > 0 && (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
            Check {flagged.length} voucher{flagged.length > 1 ? "s" : ""}: repeated voucher numbers or
            dates outside the period are marked in the ledger below.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Ledger</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">#</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Date</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Voucher</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Particulars</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Head</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Payment</th>
                <th scope="col" className="py-2 text-right font-semibold">Balance</th>
              </tr>
            </thead>
            <tbody>
              {ok && book.rows.length > 0 ? (
                book.rows.map((row) => (
                  <tr key={row.line} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 tabular-nums">{row.line}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{row.date || "—"}</td>
                    <td className="py-2 pr-3">
                      {row.voucher || "—"}
                      {row.duplicate && (
                        <span className="ml-1 rounded bg-[var(--warning-soft)] px-1 text-xs font-semibold text-[var(--warning)]">
                          repeat
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-3">
                      {row.particulars || "—"}
                      {row.outOfPeriod && (
                        <span className="ml-1 rounded bg-[var(--warning-soft)] px-1 text-xs font-semibold text-[var(--warning)]">
                          outside period
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-3">{row.head}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{money(row.amount)}</td>
                    <td
                      className={`py-2 text-right tabular-nums ${row.balance < 0 ? "font-semibold text-[var(--danger)]" : ""}`}
                    >
                      {money(row.balance)}
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

        <h2 className="mt-6 text-base font-semibold">Totals by expense head</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Head</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Amount</th>
                <th scope="col" className="py-2 text-right font-semibold">Share</th>
              </tr>
            </thead>
            <tbody>
              {ok && book.byHead.length > 0 ? (
                book.byHead.map((item) => (
                  <tr key={item.head} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{item.head}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{money(item.amount)}</td>
                    <td className="py-2 text-right tabular-nums">{item.share}%</td>
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
        Keep the signed vouchers with the book — the head totals are what get journalised, and an
        auditor will trace them back to the paper. This page is a working aid, not accounting or tax
        advice; your accountant decides how each head is posted.
      </p>
    </main>
  );
}
