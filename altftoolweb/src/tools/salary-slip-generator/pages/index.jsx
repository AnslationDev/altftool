"use client";

import { useMemo, useState } from "react";
import { Copy, FileText, Plus, Printer, RotateCcw, Trash2 } from "lucide-react";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const money = (value) => inr.format(Number.isFinite(value) ? Math.round(value) : 0);
const monthFmt = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" });

const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigits(n) {
  if (n < 20) return ONES[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return `${TENS[tens]}${ones ? ` ${ONES[ones]}` : ""}`;
}

/** Whole number to words in the Indian numbering system. */
function numberToWords(value) {
  const n = Math.floor(Math.abs(Number(value) || 0));
  if (n === 0) return "Zero";
  if (n > 999999999) return "";
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const hundred = Math.floor((n % 1000) / 100);
  const rest = n % 100;
  const parts = [];
  if (crore) parts.push(`${twoDigits(crore)} Crore`);
  if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
  if (hundred) parts.push(`${ONES[hundred]} Hundred`);
  if (rest) parts.push(twoDigits(rest));
  return parts.join(" ");
}

const DEFAULT_EARNINGS = [
  { id: "e1", label: "Basic salary", amount: "30000" },
  { id: "e2", label: "House rent allowance", amount: "15000" },
  { id: "e3", label: "Conveyance allowance", amount: "1600" },
  { id: "e4", label: "Special allowance", amount: "8400" },
];

const DEFAULT_DEDUCTIONS = [
  { id: "d1", label: "Provident fund", amount: "3600" },
  { id: "d2", label: "Professional tax", amount: "200" },
  { id: "d3", label: "TDS", amount: "2500" },
];

const DEFAULTS = {
  companyName: "",
  companyAddress: "",
  employeeName: "",
  employeeId: "",
  designation: "",
  department: "",
  pan: "",
  uan: "",
  bankAccount: "",
  payMonth: "2026-06",
  totalDays: "30",
  paidDays: "30",
  prorate: true,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const num = (value) => {
  const parsed = Number(String(value).trim() === "" ? 0 : value);
  return Number.isFinite(parsed) ? parsed : NaN;
};

function parsePayMonth(value) {
  const match = /^(\d{4})-(\d{2})$/.exec(String(value).trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (year < 1970 || year > 2100 || month < 1 || month > 12) return null;
  return new Date(year, month - 1, 1);
}

export default function ToolHome() {
  const [companyName, setCompanyName] = useState(DEFAULTS.companyName);
  const [companyAddress, setCompanyAddress] = useState(DEFAULTS.companyAddress);
  const [employeeName, setEmployeeName] = useState(DEFAULTS.employeeName);
  const [employeeId, setEmployeeId] = useState(DEFAULTS.employeeId);
  const [designation, setDesignation] = useState(DEFAULTS.designation);
  const [department, setDepartment] = useState(DEFAULTS.department);
  const [pan, setPan] = useState(DEFAULTS.pan);
  const [uan, setUan] = useState(DEFAULTS.uan);
  const [bankAccount, setBankAccount] = useState(DEFAULTS.bankAccount);
  const [payMonth, setPayMonth] = useState(DEFAULTS.payMonth);
  const [totalDays, setTotalDays] = useState(DEFAULTS.totalDays);
  const [paidDays, setPaidDays] = useState(DEFAULTS.paidDays);
  const [prorate, setProrate] = useState(DEFAULTS.prorate);
  const [earnings, setEarnings] = useState(DEFAULT_EARNINGS);
  const [deductions, setDeductions] = useState(DEFAULT_DEDUCTIONS);
  const [copied, setCopied] = useState(false);
  // Ids are derived from the rows themselves rather than a ref counter: the
  // updater stays pure, so StrictMode's double-invoke can't skip or collide ids.
  const nextId = (rows) =>
    `r${rows.reduce((max, row) => Math.max(max, Number(String(row.id).slice(1)) || 0), 100) + 1}`;

  const updateRow = (setter) => (id, field, value) =>
    setter((rows) => rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));

  const addRow = (setter, label) => () =>
    setter((rows) => [...rows, { id: nextId(rows), label, amount: "0" }]);

  const removeRow = (setter) => (id) => setter((rows) => rows.filter((row) => row.id !== id));

  const updateEarning = updateRow(setEarnings);
  const updateDeduction = updateRow(setDeductions);

  const validation = useMemo(() => {
    for (const row of earnings) {
      const value = num(row.amount);
      if (!Number.isFinite(value)) return `Earning "${row.label || "untitled"}" must be a number.`;
      if (value < 0) return `Earning "${row.label || "untitled"}" cannot be negative.`;
      if (value > 1e10) return `Earning "${row.label || "untitled"}" is unrealistically large.`;
    }
    for (const row of deductions) {
      const value = num(row.amount);
      if (!Number.isFinite(value)) return `Deduction "${row.label || "untitled"}" must be a number.`;
      if (value < 0) return `Deduction "${row.label || "untitled"}" cannot be negative.`;
      if (value > 1e10) return `Deduction "${row.label || "untitled"}" is unrealistically large.`;
    }
    const total = num(totalDays);
    const paid = num(paidDays);
    if (!Number.isFinite(total) || total <= 0 || total > 31) {
      return "Total days in the month must be between 1 and 31.";
    }
    if (!Number.isFinite(paid) || paid < 0 || paid > total) {
      return "Paid days must be between 0 and the total days in the month.";
    }
    if (!parsePayMonth(payMonth)) return "Pick a valid pay month.";
    return "";
  }, [earnings, deductions, totalDays, paidDays, payMonth]);

  const result = useMemo(() => {
    if (validation) return null;
    const total = num(totalDays);
    const paid = num(paidDays);
    const factor = prorate && total > 0 ? paid / total : 1;

    const earningRows = earnings.map((row) => ({
      id: row.id,
      label: row.label.trim() || "Earning",
      amount: Math.round(num(row.amount) * factor),
    }));
    const deductionRows = deductions.map((row) => ({
      id: row.id,
      label: row.label.trim() || "Deduction",
      amount: Math.round(num(row.amount)),
    }));

    const grossEarnings = earningRows.reduce((sum, row) => sum + row.amount, 0);
    const totalDeductions = deductionRows.reduce((sum, row) => sum + row.amount, 0);
    const netPay = grossEarnings - totalDeductions;

    return {
      earningRows,
      deductionRows,
      grossEarnings,
      totalDeductions,
      netPay,
      factor,
      lopDays: Math.max(0, total - paid),
      // Spell out the sign too — a slip showing "-₹4,200" next to a positive
      // amount in words is a document nobody can act on.
      netWords:
        netPay < 0
          ? `Minus ${numberToWords(Math.abs(netPay))}`
          : numberToWords(netPay),
      period: monthFmt.format(parsePayMonth(payMonth)),
      annualisedCtc: grossEarnings * 12,
    };
  }, [validation, earnings, deductions, totalDays, paidDays, prorate, payMonth]);

  const plainText = useMemo(() => {
    if (!result) return "";
    return [
      `SALARY SLIP — ${result.period}`,
      companyName.trim() ? companyName.trim() : "",
      "",
      `Employee: ${employeeName.trim() || "____________"}`,
      employeeId.trim() ? `Employee ID: ${employeeId.trim()}` : "",
      designation.trim() ? `Designation: ${designation.trim()}` : "",
      `Paid days: ${paidDays} of ${totalDays}${result.lopDays ? ` (LOP ${result.lopDays})` : ""}`,
      "",
      "EARNINGS",
      ...result.earningRows.map((row) => `  ${row.label}: ${money(row.amount)}`),
      `  Gross earnings: ${money(result.grossEarnings)}`,
      "",
      "DEDUCTIONS",
      ...result.deductionRows.map((row) => `  ${row.label}: ${money(row.amount)}`),
      `  Total deductions: ${money(result.totalDeductions)}`,
      "",
      `NET PAY: ${money(result.netPay)}`,
      `In words: Rupees ${result.netWords} only`,
    ]
      .filter((line) => line !== "")
      .join("\n");
  }, [result, companyName, employeeName, employeeId, designation, paidDays, totalDays]);

  const copyAll = async () => {
    if (!plainText) return;
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const printSlip = () => {
    if (typeof window !== "undefined") window.print();
  };

  const reset = () => {
    setCompanyName(DEFAULTS.companyName);
    setCompanyAddress(DEFAULTS.companyAddress);
    setEmployeeName(DEFAULTS.employeeName);
    setEmployeeId(DEFAULTS.employeeId);
    setDesignation(DEFAULTS.designation);
    setDepartment(DEFAULTS.department);
    setPan(DEFAULTS.pan);
    setUan(DEFAULTS.uan);
    setBankAccount(DEFAULTS.bankAccount);
    setPayMonth(DEFAULTS.payMonth);
    setTotalDays(DEFAULTS.totalDays);
    setPaidDays(DEFAULTS.paidDays);
    setProrate(DEFAULTS.prorate);
    setEarnings(DEFAULT_EARNINGS);
    setDeductions(DEFAULT_DEDUCTIONS);
    setCopied(false);
  };

  const renderRows = (rows, update, remove, prefix) => (
    <div className="grid gap-2">
      {rows.map((row, index) => (
        <div key={row.id} className="grid grid-cols-[minmax(0,1fr)_96px_44px] gap-2 sm:grid-cols-[minmax(0,1fr)_120px_44px]">
          <div className="min-w-0">
            <label htmlFor={`${prefix}-label-${row.id}`} className="sr-only">
              {prefix === "earn" ? "Earning" : "Deduction"} {index + 1} name
            </label>
            <input
              id={`${prefix}-label-${row.id}`}
              type="text"
              value={row.label}
              onChange={(event) => update(row.id, "label", event.target.value)}
              placeholder={prefix === "earn" ? "Allowance name" : "Deduction name"}
              className={INPUT_CLASS}
            />
          </div>
          <div className="min-w-0">
            <label htmlFor={`${prefix}-amount-${row.id}`} className="sr-only">
              {prefix === "earn" ? "Earning" : "Deduction"} {index + 1} amount
            </label>
            <input
              id={`${prefix}-amount-${row.id}`}
              type="number"
              inputMode="decimal"
              min="0"
              value={row.amount}
              onChange={(event) => update(row.id, "amount", event.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          <button
            type="button"
            onClick={() => remove(row.id)}
            aria-label={`Remove ${row.label || "row"}`}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6 print:bg-white print:p-0">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 sm:p-6 print:hidden">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            <FileText className="h-4 w-4" aria-hidden="true" />
            Documents
          </div>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Salary Slip Generator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Build a clean monthly payslip: add your own earning and deduction heads, prorate for loss
            of pay, and get the net pay with the amount spelled out in words.
          </p>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,400px)_1fr]">
          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 print:hidden">
            <div className="grid gap-5">
              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="ss-company" className="block text-sm font-semibold">
                      Company name
                    </label>
                    <input
                      id="ss-company"
                      type="text"
                      value={companyName}
                      onChange={(event) => setCompanyName(event.target.value)}
                      placeholder="Employer name"
                      className={`mt-2 ${INPUT_CLASS}`}
                    />
                  </div>
                  <div>
                    <label htmlFor="ss-month" className="block text-sm font-semibold">
                      Pay month
                    </label>
                    <input
                      id="ss-month"
                      type="month"
                      value={payMonth}
                      onChange={(event) => setPayMonth(event.target.value)}
                      className={`mt-2 ${INPUT_CLASS}`}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="ss-company-address" className="block text-sm font-semibold">
                    Company address (optional)
                  </label>
                  <textarea
                    id="ss-company-address"
                    rows={2}
                    value={companyAddress}
                    onChange={(event) => setCompanyAddress(event.target.value)}
                    className={`mt-2 ${TEXTAREA_CLASS}`}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="ss-name" className="block text-sm font-semibold">
                      Employee name
                    </label>
                    <input
                      id="ss-name"
                      type="text"
                      value={employeeName}
                      onChange={(event) => setEmployeeName(event.target.value)}
                      className={`mt-2 ${INPUT_CLASS}`}
                    />
                  </div>
                  <div>
                    <label htmlFor="ss-empid" className="block text-sm font-semibold">
                      Employee ID
                    </label>
                    <input
                      id="ss-empid"
                      type="text"
                      value={employeeId}
                      onChange={(event) => setEmployeeId(event.target.value)}
                      className={`mt-2 ${INPUT_CLASS}`}
                    />
                  </div>
                  <div>
                    <label htmlFor="ss-designation" className="block text-sm font-semibold">
                      Designation
                    </label>
                    <input
                      id="ss-designation"
                      type="text"
                      value={designation}
                      onChange={(event) => setDesignation(event.target.value)}
                      className={`mt-2 ${INPUT_CLASS}`}
                    />
                  </div>
                  <div>
                    <label htmlFor="ss-department" className="block text-sm font-semibold">
                      Department
                    </label>
                    <input
                      id="ss-department"
                      type="text"
                      value={department}
                      onChange={(event) => setDepartment(event.target.value)}
                      className={`mt-2 ${INPUT_CLASS}`}
                    />
                  </div>
                  <div>
                    <label htmlFor="ss-pan" className="block text-sm font-semibold">
                      PAN (optional)
                    </label>
                    <input
                      id="ss-pan"
                      type="text"
                      value={pan}
                      onChange={(event) => setPan(event.target.value.toUpperCase())}
                      maxLength={10}
                      className={`mt-2 ${INPUT_CLASS} uppercase`}
                    />
                  </div>
                  <div>
                    <label htmlFor="ss-uan" className="block text-sm font-semibold">
                      UAN (optional)
                    </label>
                    <input
                      id="ss-uan"
                      type="text"
                      value={uan}
                      onChange={(event) => setUan(event.target.value)}
                      className={`mt-2 ${INPUT_CLASS}`}
                    />
                  </div>
                  <div>
                    <label htmlFor="ss-bank" className="block text-sm font-semibold">
                      Bank account (optional)
                    </label>
                    <input
                      id="ss-bank"
                      type="text"
                      value={bankAccount}
                      onChange={(event) => setBankAccount(event.target.value)}
                      placeholder="XXXX1234"
                      className={`mt-2 ${INPUT_CLASS}`}
                    />
                  </div>
                  <div>
                    <label htmlFor="ss-total-days" className="block text-sm font-semibold">
                      Days in month
                    </label>
                    <input
                      id="ss-total-days"
                      type="number"
                      inputMode="numeric"
                      min="1"
                      max="31"
                      value={totalDays}
                      onChange={(event) => setTotalDays(event.target.value)}
                      className={`mt-2 ${INPUT_CLASS}`}
                    />
                  </div>
                  <div>
                    <label htmlFor="ss-paid-days" className="block text-sm font-semibold">
                      Paid days
                    </label>
                    <input
                      id="ss-paid-days"
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max="31"
                      value={paidDays}
                      onChange={(event) => setPaidDays(event.target.value)}
                      className={`mt-2 ${INPUT_CLASS}`}
                    />
                  </div>
                </div>

                <label
                  htmlFor="ss-prorate"
                  className="flex items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                >
                  <input
                    id="ss-prorate"
                    type="checkbox"
                    checked={prorate}
                    onChange={(event) => setProrate(event.target.checked)}
                    className="mt-0.5 h-5 w-5 accent-[var(--primary)]"
                  />
                  <span className="text-sm">
                    <span className="font-semibold">Prorate earnings for loss of pay</span>
                    <span className="mt-0.5 block text-[var(--muted-foreground)]">
                      Each earning head is scaled by paid days ÷ days in month.
                    </span>
                  </span>
                </label>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold">Earnings</h2>
                  <button
                    type="button"
                    onClick={addRow(setEarnings, "Other allowance")}
                    aria-label="Add an earning row"
                    className="inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-xs font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Add row
                  </button>
                </div>
                {renderRows(earnings, updateEarning, removeRow(setEarnings), "earn")}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold">Deductions</h2>
                  <button
                    type="button"
                    onClick={addRow(setDeductions, "Other deduction")}
                    aria-label="Add a deduction row"
                    className="inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-xs font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Add row
                  </button>
                </div>
                {renderRows(deductions, updateDeduction, removeRow(setDeductions), "deduct")}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyAll}
                  disabled={!result}
                  aria-label="Copy salary slip as text"
                  className={`${PRIMARY_BTN} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  {copied ? "Copied!" : "Copy result"}
                </button>
                <button
                  type="button"
                  onClick={printSlip}
                  disabled={!result}
                  aria-label="Print or save the salary slip as PDF"
                  className={`${GHOST_BTN} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <Printer className="h-4 w-4" aria-hidden="true" />
                  Print
                </button>
                <button type="button" onClick={reset} aria-label="Reset all fields" className={GHOST_BTN}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 print:hidden">
              {validation ? (
                <p
                  role="alert"
                  className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
                >
                  {validation}
                </p>
              ) : (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Net pay for {result.period}
                  </p>
                  <p className="mt-2 text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
                    {money(result.netPay)}
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    Rupees {result.netWords} only
                  </p>

                  {result.netPay < 0 && (
                    <p
                      role="alert"
                      className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
                    >
                      Deductions exceed gross earnings, so the net pay is negative. Check the deduction
                      amounts before issuing this slip.
                    </p>
                  )}

                  <dl className="mt-5 divide-y divide-[var(--border)] border-t border-[var(--border)]">
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm text-[var(--muted-foreground)]">Gross earnings</dt>
                      <dd className="text-sm font-semibold">{money(result.grossEarnings)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm text-[var(--muted-foreground)]">Total deductions</dt>
                      <dd className="text-sm font-semibold">- {money(result.totalDeductions)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm text-[var(--muted-foreground)]">Loss of pay days</dt>
                      <dd className="text-sm font-semibold">{result.lopDays}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-sm text-[var(--muted-foreground)]">
                        Gross annualised (12 x this month)
                      </dt>
                      <dd className="text-sm font-semibold">{money(result.annualisedCtc)}</dd>
                    </div>
                  </dl>
                </>
              )}
            </div>

            {result && (
              <article className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 print:rounded-none print:bg-white print:text-black print:ring-0 print:outline print:outline-1">
                <div className="border-b border-[var(--border)] pb-3 text-center">
                  <h2 className="text-lg font-semibold">{companyName.trim() || "Company name"}</h2>
                  {companyAddress.trim() && (
                    <p className="mt-1 whitespace-pre-line text-xs text-[var(--muted-foreground)] print:text-black">
                      {companyAddress.trim()}
                    </p>
                  )}
                  <p className="mt-2 text-sm font-semibold uppercase tracking-wide">
                    Salary slip for {result.period}
                  </p>
                </div>

                <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  {[
                    ["Employee name", employeeName.trim() || "____________"],
                    ["Employee ID", employeeId.trim() || "—"],
                    ["Designation", designation.trim() || "—"],
                    ["Department", department.trim() || "—"],
                    ["PAN", pan.trim() || "—"],
                    ["UAN", uan.trim() || "—"],
                    ["Bank account", bankAccount.trim() || "—"],
                    ["Paid days", `${paidDays} of ${totalDays}`],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-3 border-b border-[var(--border)] py-1">
                      <dt className="text-[var(--muted-foreground)] print:text-black">{label}</dt>
                      <dd className="text-right font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div>
                    <h3 className="border-b border-[var(--border)] pb-2 text-sm font-semibold uppercase tracking-wide">
                      Earnings
                    </h3>
                    <ul className="mt-2 text-sm">
                      {result.earningRows.map((row) => (
                        <li key={row.id} className="flex justify-between gap-3 py-1">
                          <span className="text-[var(--muted-foreground)] print:text-black">{row.label}</span>
                          <span className="font-medium">{money(row.amount)}</span>
                        </li>
                      ))}
                      <li className="mt-1 flex justify-between gap-3 border-t border-[var(--border)] py-2 text-sm font-semibold">
                        <span>Gross earnings</span>
                        <span>{money(result.grossEarnings)}</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="border-b border-[var(--border)] pb-2 text-sm font-semibold uppercase tracking-wide">
                      Deductions
                    </h3>
                    <ul className="mt-2 text-sm">
                      {result.deductionRows.map((row) => (
                        <li key={row.id} className="flex justify-between gap-3 py-1">
                          <span className="text-[var(--muted-foreground)] print:text-black">{row.label}</span>
                          <span className="font-medium">{money(row.amount)}</span>
                        </li>
                      ))}
                      <li className="mt-1 flex justify-between gap-3 border-t border-[var(--border)] py-2 text-sm font-semibold">
                        <span>Total deductions</span>
                        <span>{money(result.totalDeductions)}</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-5 rounded-md bg-[var(--muted)] p-4 print:bg-white print:outline print:outline-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold uppercase tracking-wide">Net pay</span>
                    <span className="text-2xl font-semibold text-[var(--primary)] print:text-black">
                      {money(result.netPay)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)] print:text-black">
                    Rupees {result.netWords} only
                  </p>
                </div>

                <p className="mt-5 text-xs text-[var(--muted-foreground)] print:text-black">
                  This is a computer-generated salary slip and does not require a signature.
                </p>
              </article>
            )}

            <p className="text-xs text-[var(--muted-foreground)] print:hidden">
              Everything is calculated in your browser and nothing is uploaded. Use this only for
              salaries actually paid — it is a formatting tool, not a payroll or statutory compliance
              system.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
