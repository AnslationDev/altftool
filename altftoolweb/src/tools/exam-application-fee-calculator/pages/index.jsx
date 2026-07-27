"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, ReceiptIndianRupee, RotateCcw, Trash2 } from "lucide-react";

import {
  CATEGORIES,
  EXAMS,
  MAX_ROWS,
  STATUS_FLAGS,
  computeFeeTotal,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_PROFILE = {
  categoryId: "general",
  female: false,
  transgender: false,
  pwbd: false,
  exServiceman: false,
  minority: false,
  ebc: false,
};

const DEFAULT_ROWS = [
  { id: 1, examId: "ssc", quantity: "1", overrideFee: "", appearsInExam: true },
  { id: 2, examId: "ibps", quantity: "1", overrideFee: "", appearsInExam: true },
];

const DASH = "—";

export default function ToolHome() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [nextId, setNextId] = useState(3);
  const [charge, setCharge] = useState("0");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeFeeTotal({
        rows: rows.map((row) => ({
          id: row.id,
          examId: row.examId,
          quantity: row.quantity.trim() === "" ? 0 : Number(row.quantity),
          overrideFee: row.overrideFee,
          appearsInExam: row.appearsInExam,
        })),
        profile,
        chargePerTransaction: charge,
      }),
    [rows, profile, charge],
  );

  const hasError = Boolean(result.error);

  const setProfileField = (field, value) => {
    setCopied(false);
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const setRowField = (id, field, value) => {
    setCopied(false);
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const addRow = () => {
    if (rows.length >= MAX_ROWS) return;
    setCopied(false);
    setRows((prev) => [
      ...prev,
      { id: nextId, examId: "ssc", quantity: "1", overrideFee: "", appearsInExam: true },
    ]);
    setNextId((prev) => prev + 1);
  };

  const removeRow = (id) => {
    setCopied(false);
    setRows((prev) => (prev.length > 1 ? prev.filter((row) => row.id !== id) : prev));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Exam application fee total",
      ...result.rows.map(
        (row) =>
          `${row.exam.label}: ${row.quantity} x ${INR.format(row.unitFee)} = ${INR.format(row.paid)} (${row.band}${row.refunded ? `, ${INR.format(row.refunded)} refundable` : ""})`,
      ),
      `Fees paid: ${INR.format(result.feePaid)}`,
      `Bank charges: ${INR.format(result.bankCharges)}`,
      `Refundable: ${INR.format(result.refundable)}`,
      `Net cost after refunds: ${INR.format(result.net)}`,
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
    setProfile(DEFAULT_PROFILE);
    setRows(DEFAULT_ROWS);
    setNextId(3);
    setCharge("0");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ReceiptIndianRupee className="h-4 w-4" aria-hidden="true" />
          Application Help
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Application Fee Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Add each exam you plan to apply for and see the total outlay — with the category and
          status concessions each notification allows, and the refundable RRB portion netted out.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your candidate profile</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fee-category">
              Category
            </label>
            <select
              id="fee-category"
              className={`mt-2 ${INPUT_CLASS}`}
              value={profile.categoryId}
              onChange={(event) => setProfileField("categoryId", event.target.value)}
            >
              {CATEGORIES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <fieldset className="min-w-0">
            <legend className={LABEL_CLASS}>Status (concession grounds)</legend>
            <div className="mt-2 grid gap-x-4 sm:grid-cols-1">
              {STATUS_FLAGS.map((flag) => (
                <label
                  key={flag.id}
                  className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                  htmlFor={`fee-flag-${flag.id}`}
                >
                  <input
                    id={`fee-flag-${flag.id}`}
                    type="checkbox"
                    className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                    checked={Boolean(profile[flag.id])}
                    onChange={(event) => setProfileField(flag.id, event.target.checked)}
                  />
                  {flag.label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Exams you are applying for</h2>
          <button
            type="button"
            onClick={addRow}
            disabled={rows.length >= MAX_ROWS}
            aria-label="Add another exam row"
            className={`${GHOST_BTN} disabled:opacity-50`}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add exam
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {rows.map((row, index) => (
            <div
              key={row.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`fee-exam-${row.id}`}>
                    Exam {index + 1}
                  </label>
                  <select
                    id={`fee-exam-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={row.examId}
                    onChange={(event) => setRowField(row.id, "examId", event.target.value)}
                  >
                    {EXAMS.map((exam) => (
                      <option key={exam.id} value={exam.id}>
                        {exam.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`fee-qty-${row.id}`}>
                    Applications
                  </label>
                  <input
                    id={`fee-qty-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    value={row.quantity}
                    onChange={(event) => setRowField(row.id, "quantity", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`fee-override-${row.id}`}>
                    Fee per application (optional override, INR)
                  </label>
                  <input
                    id={`fee-override-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="50"
                    placeholder="From the notification"
                    value={row.overrideFee}
                    onChange={(event) => setRowField(row.id, "overrideFee", event.target.value)}
                  />
                </div>
                <div className="flex flex-col justify-end gap-2">
                  <label
                    className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                    htmlFor={`fee-appears-${row.id}`}
                  >
                    <input
                      id={`fee-appears-${row.id}`}
                      type="checkbox"
                      className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                      checked={row.appearsInExam}
                      onChange={(event) =>
                        setRowField(row.id, "appearsInExam", event.target.checked)
                      }
                    />
                    Will appear in the exam (counts refundable fees)
                  </label>
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length <= 1}
                    aria-label={`Remove exam row ${index + 1}`}
                    className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-md border border-[var(--border)] px-3 text-sm font-semibold text-[var(--danger)] transition hover:border-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="fee-charge">
            Bank / gateway charge per payment (INR)
          </label>
          <input
            id="fee-charge"
            className={`mt-2 ${INPUT_CLASS} sm:max-w-xs`}
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={charge}
            onChange={(event) => {
              setCopied(false);
              setCharge(event.target.value);
            }}
          />
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
              Net cost after refunds
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : INR.format(result.net)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a total."
                : `${NUM.format(result.applications)} application${result.applications === 1 ? "" : "s"} across ${NUM.format(result.rows.length)} exam${result.rows.length === 1 ? "" : "s"}, ${NUM.format(result.concessionRows)} at a concession rate.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the fee breakdown"
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
          {(hasError
            ? [
                ["Fees paid at application", DASH],
                ["Bank charges", DASH],
                ["Total outlay", DASH],
                ["Refundable after appearing", DASH],
              ]
            : [
                ["Fees paid at application", INR.format(result.feePaid)],
                ["Bank charges", INR.format(result.bankCharges)],
                ["Total outlay", INR.format(result.outlay)],
                ["Refundable after appearing", INR.format(result.refundable)],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.rows.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Exam
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Band
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Paid
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Refundable
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">
                      {row.exam.label}
                      {row.overridden ? (
                        <span className="ml-1 text-xs text-[var(--muted-foreground)]">
                          (fee overridden)
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-3 text-right">{row.band}</td>
                    <td className="py-2 pr-3 text-right font-semibold">{INR.format(row.paid)}</td>
                    <td className="py-2 text-right font-semibold">{INR.format(row.refunded)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. Fees and exemption rules change from notification to notification —
        use the override field to enter the exact figure printed in the notice you are applying
        under, and treat that notice as final.
      </p>
    </main>
  );
}
