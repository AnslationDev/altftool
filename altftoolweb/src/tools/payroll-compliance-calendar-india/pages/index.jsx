"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, Check, Copy, RotateCcw } from "lucide-react";

import {
  MONTH_NAMES,
  PT_STATES,
  buildAnnualDueDates,
  buildMonthlyDueDates,
  computeDelayCost,
  financialYearOf,
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
const NUM = new Intl.NumberFormat("en-IN");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  year: "2026",
  month: "6",
  state: "MH",
  referenceDate: "2026-07-01",
  scheme: "epf",
  amount: "250000",
  dueDate: "2026-07-15",
  paidDate: "2026-08-20",
};

const YEARS = [2024, 2025, 2026, 2027, 2028];

const STATUS_TEXT = {
  overdue: "text-[var(--danger)]",
  "due-today": "text-[var(--danger)]",
  "due-soon": "text-[var(--primary)]",
  upcoming: "text-[var(--success)]",
  unknown: "text-[var(--muted-foreground)]",
};

const STATUS_LABEL = {
  overdue: "Overdue",
  "due-today": "Due today",
  "due-soon": "Due soon",
  upcoming: "Upcoming",
  unknown: "—",
};

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const monthly = useMemo(
    () =>
      buildMonthlyDueDates({
        year: Number(form.year),
        month: Number(form.month),
        state: form.state,
        referenceDate: form.referenceDate || null,
      }),
    [form.year, form.month, form.state, form.referenceDate],
  );

  const annual = useMemo(() => {
    const month = Number(form.month);
    const year = Number(form.year);
    if (!Number.isInteger(month) || month < 1 || month > 12) return { error: "—" };
    return buildAnnualDueDates({
      startYear: financialYearOf(year, month).startYear,
      referenceDate: form.referenceDate || null,
    });
  }, [form.year, form.month, form.referenceDate]);

  const delay = useMemo(
    () =>
      computeDelayCost({
        scheme: form.scheme,
        amount: toNumber(form.amount),
        dueDate: form.dueDate,
        paidDate: form.paidDate,
      }),
    [form.scheme, form.amount, form.dueDate, form.paidDate],
  );

  const monthlyError = monthly.error || null;
  const delayError = delay.error || null;

  const headlineDue = monthlyError ? null : monthly.items[0];

  const copyText = () => {
    if (monthlyError) return "";
    const lines = [
      `Payroll compliance calendar — ${monthly.wageMonthLabel} (FY ${monthly.financialYear})`,
      "",
      "Monthly deadlines:",
      ...monthly.items.map(
        (item) =>
          `  ${item.dueDateLabel} — ${item.label} [${item.rule}]${item.weekend ? " (falls on a weekend)" : ""}`,
      ),
    ];
    if (!annual.error) {
      lines.push("", `Financial year ${annual.financialYear} deadlines:`);
      annual.items.forEach((item) => {
        lines.push(`  ${item.dueDateLabel} — ${item.label} [${item.rule}]`);
      });
    }
    if (!delayError) {
      lines.push(
        "",
        `Late deposit cost (${form.scheme.toUpperCase()}): ${delay.days} day(s) late, interest ${INR2.format(delay.interest)}${delay.damages ? `, damages ${INR2.format(delay.damages)}` : ""}, total ${INR2.format(delay.total)}`,
      );
    }
    return lines.join("\n");
  };

  const handleCopy = async () => {
    const text = copyText();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-6 px-4 py-6">
      <section className="grid gap-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--foreground)]">
          <CalendarCheck aria-hidden="true" className="h-5 w-5 text-[var(--primary)]" />
          Wage month
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <label className={LABEL_CLASS} htmlFor="pc-month">
              Wage month
            </label>
            <select className={INPUT_CLASS} id="pc-month" onChange={set("month")} value={form.month}>
              {MONTH_NAMES.map((name, index) => (
                <option key={name} value={String(index + 1)}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-1.5">
            <label className={LABEL_CLASS} htmlFor="pc-year">
              Year
            </label>
            <select className={INPUT_CLASS} id="pc-year" onChange={set("year")} value={form.year}>
              {YEARS.map((year) => (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-1.5">
            <label className={LABEL_CLASS} htmlFor="pc-state">
              Professional tax state
            </label>
            <select className={INPUT_CLASS} id="pc-state" onChange={set("state")} value={form.state}>
              {PT_STATES.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-1.5">
            <label className={LABEL_CLASS} htmlFor="pc-today">
              Treat this date as today
            </label>
            <input
              className={INPUT_CLASS}
              id="pc-today"
              onChange={set("referenceDate")}
              type="date"
              value={form.referenceDate}
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        {monthlyError ? (
          <p
            className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-semibold text-[var(--danger)]"
            role="alert"
          >
            {monthlyError}
          </p>
        ) : null}

        <p className="mt-1 text-sm font-semibold text-[var(--muted-foreground)]">
          Next statutory deadline
        </p>
        <p className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
          {monthlyError ? "—" : headlineDue.dueDateLabel}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {monthlyError
            ? "—"
            : `${headlineDue.label} · ${monthly.wageMonthLabel} wages · FY ${monthly.financialYear}`}
        </p>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="grid gap-0.5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Deadlines this cycle
            </dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {monthlyError ? "—" : NUM.format(monthly.items.length)}
            </dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Days to next deadline
            </dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {monthlyError || headlineDue.daysRemaining === null
                ? "—"
                : `${NUM.format(headlineDue.daysRemaining)} day(s)`}
            </dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Financial year
            </dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {monthlyError ? "—" : monthly.financialYear}
            </dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Professional tax state
            </dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {monthlyError ? "—" : monthly.ptStateName}
            </dd>
          </div>
        </dl>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            aria-label="Copy the compliance calendar to the clipboard"
            className={PRIMARY_BTN}
            onClick={handleCopy}
            type="button"
          >
            {copied ? (
              <Check aria-hidden="true" className="h-4 w-4" />
            ) : (
              <Copy aria-hidden="true" className="h-4 w-4" />
            )}
            {copied ? "Copied!" : "Copy calendar"}
          </button>
          <button aria-label="Reset all inputs" className={GHOST_BTN} onClick={reset} type="button">
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            Reset
          </button>
        </div>
      </section>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-lg font-bold text-[var(--foreground)]">
          Monthly deadlines {monthlyError ? "" : `for ${monthly.wageMonthLabel} wages`}
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="py-2 pr-3 font-semibold text-[var(--muted-foreground)]" scope="col">
                  Due date
                </th>
                <th className="py-2 pr-3 font-semibold text-[var(--muted-foreground)]" scope="col">
                  Obligation
                </th>
                <th className="py-2 pr-3 font-semibold text-[var(--muted-foreground)]" scope="col">
                  Rule
                </th>
                <th className="py-2 font-semibold text-[var(--muted-foreground)]" scope="col">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {monthlyError ? (
                <tr>
                  <td className="py-3 text-[var(--muted-foreground)]" colSpan={4}>
                    —
                  </td>
                </tr>
              ) : (
                monthly.items.map((item) => (
                  <tr className="border-b border-[var(--border)] align-top" key={item.id}>
                    <td className="py-3 pr-3 font-semibold whitespace-nowrap text-[var(--foreground)]">
                      {item.dueDateLabel}
                      {item.weekend ? (
                        <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                          Falls on a weekend
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3 pr-3 text-[var(--foreground)]">
                      {item.label}
                      <span className="block text-xs text-[var(--muted-foreground)]">{item.note}</span>
                    </td>
                    <td className="py-3 pr-3 text-xs text-[var(--muted-foreground)]">{item.rule}</td>
                    <td className={`py-3 font-semibold ${STATUS_TEXT[item.status]}`}>
                      {STATUS_LABEL[item.status]}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-lg font-bold text-[var(--foreground)]">
          Financial year deadlines {annual.error ? "" : `— FY ${annual.financialYear}`}
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="py-2 pr-3 font-semibold text-[var(--muted-foreground)]" scope="col">
                  Due date
                </th>
                <th className="py-2 pr-3 font-semibold text-[var(--muted-foreground)]" scope="col">
                  Filing
                </th>
                <th className="py-2 font-semibold text-[var(--muted-foreground)]" scope="col">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {annual.error ? (
                <tr>
                  <td className="py-3 text-[var(--muted-foreground)]" colSpan={3}>
                    —
                  </td>
                </tr>
              ) : (
                annual.items.map((item) => (
                  <tr className="border-b border-[var(--border)] align-top" key={item.id}>
                    <td className="py-3 pr-3 font-semibold whitespace-nowrap text-[var(--foreground)]">
                      {item.dueDateLabel}
                    </td>
                    <td className="py-3 pr-3 text-[var(--foreground)]">
                      {item.label}
                      <span className="block text-xs text-[var(--muted-foreground)]">{item.note}</span>
                    </td>
                    <td className={`py-3 font-semibold ${STATUS_TEXT[item.status]}`}>
                      {STATUS_LABEL[item.status]}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-lg font-bold text-[var(--foreground)]">What a late deposit costs</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <label className={LABEL_CLASS} htmlFor="pc-scheme">
              Scheme
            </label>
            <select className={INPUT_CLASS} id="pc-scheme" onChange={set("scheme")} value={form.scheme}>
              <option value="epf">EPF (12% interest + Section 14B damages)</option>
              <option value="esi">ESI (12% interest)</option>
              <option value="tds">Salary TDS (1.5% per month or part)</option>
            </select>
          </div>

          <div className="grid gap-1.5">
            <label className={LABEL_CLASS} htmlFor="pc-amount">
              Amount payable (₹)
            </label>
            <input
              className={INPUT_CLASS}
              id="pc-amount"
              inputMode="decimal"
              onChange={set("amount")}
              type="text"
              value={form.amount}
            />
          </div>

          <div className="grid gap-1.5">
            <label className={LABEL_CLASS} htmlFor="pc-due">
              Statutory due date
            </label>
            <input
              className={INPUT_CLASS}
              id="pc-due"
              onChange={set("dueDate")}
              type="date"
              value={form.dueDate}
            />
          </div>

          <div className="grid gap-1.5">
            <label className={LABEL_CLASS} htmlFor="pc-paid">
              Date actually paid
            </label>
            <input
              className={INPUT_CLASS}
              id="pc-paid"
              onChange={set("paidDate")}
              type="date"
              value={form.paidDate}
            />
          </div>
        </div>

        {delayError ? (
          <p
            className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-semibold text-[var(--danger)]"
            role="alert"
          >
            {delayError}
          </p>
        ) : null}

        <div>
          <p className="text-sm font-semibold text-[var(--muted-foreground)]">Extra cost of the delay</p>
          <p className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
            {delayError ? "—" : INR.format(delay.total)}
          </p>
        </div>

        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-0.5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Days late
            </dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {delayError ? "—" : NUM.format(delay.days)}
            </dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {form.scheme === "tds" ? "Months or part months" : "Interest"}
            </dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {delayError
                ? "—"
                : form.scheme === "tds"
                  ? NUM.format(delay.monthsOrPart)
                  : INR2.format(delay.interest)}
            </dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {form.scheme === "tds" ? "Interest at 1.5% per month" : "Section 14B damages"}
            </dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {delayError
                ? "—"
                : form.scheme === "tds"
                  ? INR2.format(delay.interest)
                  : INR2.format(delay.damages)}
            </dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Damages rate applied
            </dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {delayError || !delay.damagesRatePct ? "—" : `${delay.damagesRatePct}% per year`}
            </dd>
          </div>
        </dl>
      </section>

      <p className="text-xs text-[var(--muted-foreground)]">
        Dates follow the central rules cited beside each row. Where a due date falls on a weekend or a
        declared holiday, most portals still accept payment only up to that date, so plan for the working
        day before. State professional tax rules change from time to time — confirm with your state
        authority before filing.
      </p>
    </div>
  );
}
