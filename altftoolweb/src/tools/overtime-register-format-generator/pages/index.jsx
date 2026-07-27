"use client";

import { useMemo, useState } from "react";
import { Check, Clock4, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  DEFAULT_NORMAL_DAILY_HOURS,
  DEFAULT_WAGE_DAYS_PER_MONTH,
  MAX_QUARTERLY_OVERTIME_HOURS,
  OVERTIME_RATE_MULTIPLIER,
  REGISTER_COLUMNS,
  buildOvertimeRegister,
  registerToCsv,
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
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const money2 = (value) => (Number.isFinite(value) ? INR2.format(value) : "—");
const hrs = (value) => (Number.isFinite(value) ? `${NUM.format(value)} h` : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_ROWS = [
  { id: 1, date: "2026-07-06", normalHours: "8", overtimeHours: "2", paymentDate: "2026-08-07" },
  { id: 2, date: "2026-07-13", normalHours: "8", overtimeHours: "3", paymentDate: "2026-08-07" },
  { id: 3, date: "2026-07-20", normalHours: "8", overtimeHours: "1.5", paymentDate: "2026-08-07" },
];

const toNumber = (raw) => {
  const text = String(raw ?? "").replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [employer, setEmployer] = useState("Nirmal Engineering Works");
  const [worker, setWorker] = useState("");
  const [designation, setDesignation] = useState("Machine Operator");
  const [wagePeriod, setWagePeriod] = useState("July 2026");
  const [monthlyWage, setMonthlyWage] = useState("26000");
  const [wageDays, setWageDays] = useState(String(DEFAULT_WAGE_DAYS_PER_MONTH));
  const [normalDailyHours, setNormalDailyHours] = useState(String(DEFAULT_NORMAL_DAILY_HOURS));
  const [multiplier, setMultiplier] = useState(String(OVERTIME_RATE_MULTIPLIER));
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildOvertimeRegister({
        monthlyWage: toNumber(monthlyWage),
        wageDays: toNumber(wageDays),
        normalDailyHours: toNumber(normalDailyHours),
        overtimeMultiplier: toNumber(multiplier),
        entries: rows.map((row) => ({
          date: row.date,
          normalHours: toNumber(row.normalHours),
          overtimeHours: toNumber(row.overtimeHours),
          paymentDate: row.paymentDate,
        })),
      }),
    [monthlyWage, wageDays, normalDailyHours, multiplier, rows],
  );

  const failed = Boolean(result.error);

  const csv = useMemo(
    () => (failed ? "" : registerToCsv(result, { employer, worker, designation, wagePeriod })),
    [result, failed, employer, worker, designation, wagePeriod],
  );

  const updateRow = (id, field, value) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const addRow = () => {
    setRows((current) => {
      const nextId = current.reduce((max, row) => Math.max(max, row.id), 0) + 1;
      const last = current[current.length - 1];
      return [
        ...current,
        {
          id: nextId,
          date: "",
          normalHours: normalDailyHours,
          overtimeHours: "1",
          paymentDate: last ? last.paymentDate : "",
        },
      ];
    });
  };

  const removeRow = (id) => {
    setRows((current) => (current.length > 1 ? current.filter((row) => row.id !== id) : current));
  };

  const copyCsv = async () => {
    if (!csv) return;
    try {
      await navigator.clipboard.writeText(csv);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setEmployer("Nirmal Engineering Works");
    setWorker("");
    setDesignation("Machine Operator");
    setWagePeriod("July 2026");
    setMonthlyWage("26000");
    setWageDays(String(DEFAULT_WAGE_DAYS_PER_MONTH));
    setNormalDailyHours(String(DEFAULT_NORMAL_DAILY_HOURS));
    setMultiplier(String(OVERTIME_RATE_MULTIPLIER));
    setRows(DEFAULT_ROWS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Clock4 className="h-4 w-4" aria-hidden="true" />
          Labour compliance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Overtime Register Format Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Records overtime day by day, prices it at twice the ordinary rate as s.59(1) of the
          Factories Act 1948 requires, and lays it out in the Form IV columns — hours, rate, wages
          and the date the overtime wages were paid.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Establishment and wage basis</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ot-employer">
              Establishment name
            </label>
            <input
              id="ot-employer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={employer}
              onChange={(event) => setEmployer(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ot-worker">
              Worker name
            </label>
            <input
              id="ot-worker"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="Full name as in the muster roll"
              value={worker}
              onChange={(event) => setWorker(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ot-designation">
              Designation
            </label>
            <input
              id="ot-designation"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={designation}
              onChange={(event) => setDesignation(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ot-period">
              Wage period
            </label>
            <input
              id="ot-period"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={wagePeriod}
              onChange={(event) => setWagePeriod(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ot-wage">
              Monthly wage (INR)
            </label>
            <input
              id="ot-wage"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={monthlyWage}
              onChange={(event) => setMonthlyWage(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ot-days">
              Paid days in the wage period
            </label>
            <input
              id="ot-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="31"
              step="1"
              value={wageDays}
              onChange={(event) => setWageDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ot-hours">
              Normal hours in a working day
            </label>
            <input
              id="ot-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="12"
              step="0.5"
              value={normalDailyHours}
              onChange={(event) => setNormalDailyHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ot-mult">
              Overtime multiplier
            </label>
            <input
              id="ot-mult"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="3"
              step="0.25"
              value={multiplier}
              onChange={(event) => setMultiplier(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Statutory rate is 2× the ordinary rate.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Overtime entries</h2>
          <button type="button" onClick={addRow} className={GHOST_BTN} aria-label="Add a register row">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add day
          </button>
        </div>

        <div className="mt-4 grid gap-4">
          {rows.map((row, index) => (
            <div
              key={row.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Row {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  aria-label={`Remove row ${index + 1}`}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[var(--muted-foreground)] transition hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-2 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`ot-date-${row.id}`}>
                    Date worked
                  </label>
                  <input
                    id={`ot-date-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="date"
                    value={row.date}
                    onChange={(event) => updateRow(row.id, "date", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`ot-pay-${row.id}`}>
                    Date overtime wages paid
                  </label>
                  <input
                    id={`ot-pay-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="date"
                    value={row.paymentDate}
                    onChange={(event) => updateRow(row.id, "paymentDate", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`ot-normal-${row.id}`}>
                    Normal hours
                  </label>
                  <input
                    id={`ot-normal-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="24"
                    step="0.25"
                    value={row.normalHours}
                    onChange={(event) => updateRow(row.id, "normalHours", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`ot-extra-${row.id}`}>
                    Overtime hours
                  </label>
                  <input
                    id={`ot-extra-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="24"
                    step="0.25"
                    value={row.overtimeHours}
                    onChange={(event) => updateRow(row.id, "overtimeHours", event.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {failed ? (
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
              Total overtime wages payable
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? "—" : money(result.totals.overtimeWages)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the highlighted problem to price the register."
                : `${hrs(result.totals.overtimeHours)} of overtime across ${result.totals.days} day(s)`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyCsv}
              disabled={failed}
              aria-label="Copy the overtime register as CSV"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy register"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the register" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Ordinary rate per hour", failed ? "—" : money2(result.hourlyRate)],
            ["Overtime rate per hour", failed ? "—" : money2(result.overtimeRate)],
            ["Normal hours recorded", failed ? "—" : hrs(result.totals.normalHours)],
            ["Overtime hours recorded", failed ? "—" : hrs(result.totals.overtimeHours)],
            ["Average overtime per day", failed ? "—" : hrs(result.totals.averageOvertimePerDay)],
            ["Quarterly ceiling", `${MAX_QUARTERLY_OVERTIME_HOURS} h per quarter (s.64(4)(v))`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && result.warnings.length > 0 ? (
          <ul className="mt-4 grid gap-2">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
              >
                {warning}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {!failed ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Register preview</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  {REGISTER_COLUMNS.map((column) => (
                    <th key={column} scope="col" className="py-2 pr-3 font-semibold whitespace-nowrap">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.serial} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{row.serial}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{row.date}</td>
                    <td className="py-2 pr-3">{NUM.format(row.normalHours)}</td>
                    <td className="py-2 pr-3 font-semibold">{NUM.format(row.overtimeHours)}</td>
                    <td className="py-2 pr-3">{NUM.format(row.totalHours)}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{money2(row.hourlyRate)}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{money2(row.overtimeRate)}</td>
                    <td className="py-2 pr-3 whitespace-nowrap font-semibold">{money2(row.overtimeWages)}</td>
                    <td className="py-2 whitespace-nowrap text-[var(--muted-foreground)]">
                      {row.paymentDate || "not paid"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational format only. State factory rules, shops and establishments Acts and settlement
        agreements may prescribe a different register form, a different wage divisor or a higher
        overtime rate — check the rules that apply to your establishment or ask a labour law adviser.
      </p>
    </main>
  );
}
