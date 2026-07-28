"use client";

import { useMemo, useState } from "react";
import { Banknote, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";
import {
  BANK_RESPONSE_DAYS,
  CHARGE_TYPES,
  GST_RATE_PERCENT,
  RELIEF_OPTIONS,
  buildRefundRequest,
  formatLongDate,
} from "../lib";

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

const DEFAULT_CHARGES = [
  { id: 1, label: CHARGE_TYPES[0], date: "2026-01-05", amount: "500" },
  { id: 2, label: CHARGE_TYPES[3], date: "2026-01-05", amount: "100" },
];

const DEFAULTS = {
  customerName: "Ananya Rao",
  address: "12 Nehru Road, Pune 411001",
  email: "ananya.rao@example.com",
  phone: "98xxxxxx21",
  bankName: "State Bank of India",
  branch: "Deccan Gymkhana branch",
  accountNumber: "3012xxxxxx87",
  cardLastFour: "",
  letterDate: "2026-01-20",
  gstRate: String(GST_RATE_PERCENT),
  gstIncluded: false,
  reasonNote: "",
};

export default function ToolHome() {
  const [customerName, setCustomerName] = useState(DEFAULTS.customerName);
  const [address, setAddress] = useState(DEFAULTS.address);
  const [email, setEmail] = useState(DEFAULTS.email);
  const [phone, setPhone] = useState(DEFAULTS.phone);
  const [bankName, setBankName] = useState(DEFAULTS.bankName);
  const [branch, setBranch] = useState(DEFAULTS.branch);
  const [accountNumber, setAccountNumber] = useState(DEFAULTS.accountNumber);
  const [cardLastFour, setCardLastFour] = useState(DEFAULTS.cardLastFour);
  const [letterDate, setLetterDate] = useState(DEFAULTS.letterDate);
  const [gstRate, setGstRate] = useState(DEFAULTS.gstRate);
  const [gstIncluded, setGstIncluded] = useState(DEFAULTS.gstIncluded);
  const [reasonNote, setReasonNote] = useState(DEFAULTS.reasonNote);
  const [charges, setCharges] = useState(DEFAULT_CHARGES);
  const [reliefs, setReliefs] = useState(RELIEF_OPTIONS.slice(0, 3));
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildRefundRequest({
        customerName,
        address,
        email,
        phone,
        bankName,
        branch,
        accountNumber,
        cardLastFour,
        letterDate,
        charges,
        gstRatePercent: Number(gstRate),
        gstAlreadyIncluded: gstIncluded,
        reasonNote,
        reliefs,
      }),
    [
      customerName,
      address,
      email,
      phone,
      bankName,
      branch,
      accountNumber,
      cardLastFour,
      letterDate,
      charges,
      gstRate,
      gstIncluded,
      reasonNote,
      reliefs,
    ],
  );

  const failed = Boolean(result.error);
  const totals = failed ? null : result.totals;

  const updateCharge = (id, patch) => {
    setCharges((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const addCharge = () => {
    setCharges((rows) => {
      const nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
      return [...rows, { id: nextId, label: CHARGE_TYPES[0], date: "", amount: "" }];
    });
  };

  const removeCharge = (id) => {
    setCharges((rows) => (rows.length > 1 ? rows.filter((row) => row.id !== id) : rows));
  };

  const toggleRelief = (option) => {
    setReliefs((list) =>
      list.includes(option) ? list.filter((item) => item !== option) : [...list, option],
    );
  };

  const copyLetter = async () => {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(result.letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setCustomerName(DEFAULTS.customerName);
    setAddress(DEFAULTS.address);
    setEmail(DEFAULTS.email);
    setPhone(DEFAULTS.phone);
    setBankName(DEFAULTS.bankName);
    setBranch(DEFAULTS.branch);
    setAccountNumber(DEFAULTS.accountNumber);
    setCardLastFour(DEFAULTS.cardLastFour);
    setLetterDate(DEFAULTS.letterDate);
    setGstRate(DEFAULTS.gstRate);
    setGstIncluded(DEFAULTS.gstIncluded);
    setReasonNote(DEFAULTS.reasonNote);
    setCharges(DEFAULT_CHARGES);
    setReliefs(RELIEF_OPTIONS.slice(0, 3));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Banknote className="h-4 w-4" aria-hidden="true" />
          Banking letters
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Excess Charges Refund Request Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          List the charges your bank or card issuer levied without basis, add GST at{" "}
          {GST_RATE_PERCENT}%, and get a formal refund letter with the {BANK_RESPONSE_DAYS}-day
          reply deadline and the RBI Ombudsman escalation window already filled in.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ecr-name">
              Account holder name
            </label>
            <input
              id="ecr-name"
              className={`mt-2 ${INPUT_CLASS}`}
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ecr-address">
              Postal address
            </label>
            <input
              id="ecr-address"
              className={`mt-2 ${INPUT_CLASS}`}
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ecr-email">
              Email
            </label>
            <input
              id="ecr-email"
              type="email"
              className={`mt-2 ${INPUT_CLASS}`}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ecr-phone">
              Phone
            </label>
            <input
              id="ecr-phone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ecr-bank">
              Bank or card issuer
            </label>
            <input
              id="ecr-bank"
              className={`mt-2 ${INPUT_CLASS}`}
              value={bankName}
              onChange={(event) => setBankName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ecr-branch">
              Branch
            </label>
            <input
              id="ecr-branch"
              className={`mt-2 ${INPUT_CLASS}`}
              value={branch}
              onChange={(event) => setBranch(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ecr-account">
              Account number (mask the middle digits)
            </label>
            <input
              id="ecr-account"
              className={`mt-2 ${INPUT_CLASS}`}
              value={accountNumber}
              onChange={(event) => setAccountNumber(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ecr-card">
              Card last 4 digits (if a card charge)
            </label>
            <input
              id="ecr-card"
              className={`mt-2 ${INPUT_CLASS}`}
              inputMode="numeric"
              maxLength={4}
              value={cardLastFour}
              onChange={(event) => setCardLastFour(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ecr-date">
              Letter date
            </label>
            <input
              id="ecr-date"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={letterDate}
              onChange={(event) => setLetterDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ecr-gst">
              GST rate on bank fees (%)
            </label>
            <input
              id="ecr-gst"
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.5"
              className={`mt-2 ${INPUT_CLASS}`}
              value={gstRate}
              onChange={(event) => setGstRate(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3">
          <input
            id="ecr-gst-included"
            type="checkbox"
            className="mt-1 h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={gstIncluded}
            onChange={(event) => setGstIncluded(event.target.checked)}
          />
          <label
            className="text-sm leading-6 text-[var(--muted-foreground)]"
            htmlFor="ecr-gst-included"
          >
            The amounts below already include GST — tick this if you are copying the final debit
            figure straight off the statement.
          </label>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Disputed charges</h2>
          <button
            type="button"
            onClick={addCharge}
            className={GHOST_BTN}
            aria-label="Add another charge row"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add charge
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {charges.map((row, index) => (
            <div
              key={row.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`ecr-label-${row.id}`}>
                    Charge {index + 1} description
                  </label>
                  <select
                    id={`ecr-label-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={
                      CHARGE_TYPES.includes(row.label)
                        ? row.label
                        : CHARGE_TYPES[CHARGE_TYPES.length - 1]
                    }
                    onChange={(event) => updateCharge(row.id, { label: event.target.value })}
                  >
                    {CHARGE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`ecr-cdate-${row.id}`}>
                    Debit date
                  </label>
                  <input
                    id={`ecr-cdate-${row.id}`}
                    type="date"
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={row.date}
                    onChange={(event) => updateCharge(row.id, { date: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`ecr-amount-${row.id}`}>
                    Amount (INR)
                  </label>
                  <input
                    id={`ecr-amount-${row.id}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1"
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={row.amount}
                    onChange={(event) => updateCharge(row.id, { amount: event.target.value })}
                  />
                </div>
              </div>
              {charges.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCharge(row.id)}
                  aria-label={`Remove charge ${index + 1}`}
                  className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-5">
          <p className={LABEL_CLASS}>Relief you are asking for</p>
          <div className="mt-2 space-y-2">
            {RELIEF_OPTIONS.map((option, index) => (
              <div key={option} className="flex items-start gap-3">
                <input
                  id={`ecr-relief-${index}`}
                  type="checkbox"
                  className="mt-1 h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                  checked={reliefs.includes(option)}
                  onChange={() => toggleRelief(option)}
                />
                <label
                  className="text-sm leading-6 text-[var(--muted-foreground)]"
                  htmlFor={`ecr-relief-${index}`}
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <label className={LABEL_CLASS} htmlFor="ecr-reason">
            Why the charge is wrong (optional)
          </label>
          <textarea
            id="ecr-reason"
            rows={3}
            className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            value={reasonNote}
            onChange={(event) => setReasonNote(event.target.value)}
            placeholder="e.g. The card was sold to me as lifetime free by your telecaller on 4 March 2025."
          />
        </div>
      </section>

      {failed && (
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
              Total refund claimed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {totals ? money(totals.totalClaim) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {totals ? `${result.chargeCount} disputed entries` : "Fix the inputs above"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyLetter}
              disabled={failed}
              aria-label="Copy the refund request letter"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy letter"}
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
            ["Charges before GST", totals ? money(totals.totalBase) : "—"],
            [
              `GST at ${totals ? totals.gstRatePercent : GST_RATE_PERCENT}%`,
              totals ? money(totals.totalGst) : "—",
            ],
            ["Total claimed", totals ? money(totals.totalClaim) : "—"],
            ["Bank must reply by", failed ? "—" : formatLongDate(result.replyByDate)],
            [
              "RBI Ombudsman filing deadline",
              failed ? "—" : formatLongDate(result.ombudsmanDeadline),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {totals && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Charge
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Base
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    GST
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {totals.rows.map((row, index) => (
                  <tr
                    key={`${row.label}-${index}`}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="py-2 pr-3">{row.label}</td>
                    <td className="py-2 pr-3 text-right">{money(row.base)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {money(row.gst)}
                    </td>
                    <td className="py-2 text-right font-semibold">{money(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Letter preview</h2>
        <pre className="mt-3 max-h-[28rem] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6">
          {failed ? "—" : result.letter}
        </pre>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template only, not legal advice. Escalation timelines follow the Reserve Bank
        - Integrated Ombudsman Scheme, 2021; check your bank&apos;s current schedule of charges and
        speak to a lawyer or consumer adviser if the amount is significant.
      </p>
    </main>
  );
}
