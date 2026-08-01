"use client";

import { useMemo, useState } from "react";
import { Copy, Percent, RotateCcw } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

const SOLVE_OPTIONS = [
  { id: "interest", label: "Interest" },
  { id: "principal", label: "Principal" },
  { id: "rate", label: "Rate" },
  { id: "time", label: "Time" },
];

const TIME_UNITS = [
  { id: "years", label: "Years", short: "years", inYears: 1 },
  { id: "months", label: "Months", short: "months", inYears: 1 / 12 },
  { id: "days365", label: "Days (365-day year)", short: "days", inYears: 1 / 365 },
  { id: "days360", label: "Days (360-day year)", short: "days", inYears: 1 / 360 },
];

const DEFAULTS = {
  principal: "50000",
  rate: "9.5",
  time: "3",
  interest: "",
  unit: "years",
};

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const moneyExact = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const plain = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 4 });

const fmtMoney = (value) => (Number.isFinite(value) ? money.format(value) : "—");
const fmtMoneyExact = (value) => (Number.isFinite(value) ? moneyExact.format(value) : "—");
const fmtNum = (value) => (Number.isFinite(value) ? plain.format(value) : "—");

export default function ToolHome() {
  const [solveFor, setSolveFor] = useState("interest");
  const [form, setForm] = useState(DEFAULTS);
  const { copy: copyToClipboard, isCopied, announcement } = useCopyToClipboard();

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const unit = TIME_UNITS.find((item) => item.id === form.unit) || TIME_UNITS[0];

  const result = useMemo(() => {
    const fields = ["principal", "rate", "time", "interest"].filter((key) => key !== solveFor);

    const names = {
      principal: "the principal",
      rate: "the annual rate",
      time: "the time period",
      interest: "the interest amount",
    };

    const parsed = {};
    for (const key of fields) {
      const raw = String(form[key] ?? "").trim();
      if (raw === "") return { error: `Enter ${names[key]} — the other three values are required.` };
      const value = Number(raw);
      if (!Number.isFinite(value)) return { error: `"${raw}" is not a valid number.` };
      if (value < 0) return { error: "Values cannot be negative." };
      parsed[key] = value;
    }

    let principal = parsed.principal;
    let rate = parsed.rate;
    let timeInput = parsed.time;
    let interest = parsed.interest;
    let timeYears = timeInput === undefined ? undefined : timeInput * unit.inYears;

    if (solveFor === "interest") {
      interest = (principal * rate * timeYears) / 100;
    } else if (solveFor === "principal") {
      const denominator = rate * timeYears;
      if (denominator === 0) {
        return { error: "Principal cannot be found when the rate or the time is 0." };
      }
      principal = (interest * 100) / denominator;
    } else if (solveFor === "rate") {
      const denominator = principal * timeYears;
      if (denominator === 0) {
        return { error: "Rate cannot be found when the principal or the time is 0." };
      }
      rate = (interest * 100) / denominator;
    } else {
      const denominator = principal * rate;
      if (denominator === 0) {
        return { error: "Time cannot be found when the principal or the rate is 0." };
      }
      timeYears = (interest * 100) / denominator;
      timeInput = timeYears / unit.inYears;
    }

    if (![principal, rate, timeYears, interest].every(Number.isFinite)) {
      return { error: "These inputs do not produce a finite result. Check your values." };
    }

    const total = principal + interest;
    const perYear = (principal * rate) / 100;
    const perMonth = perYear / 12;
    // Honour the day-count basis the user picked — a 360-day year makes each
    // day's interest larger, which is the whole point of choosing it.
    const daysInYear = form.unit === "days360" ? 360 : 365;
    const perDay = perYear / daysInYear;

    const rows = [];
    const wholeYears = Math.min(Math.ceil(timeYears), 60);
    for (let year = 1; year <= wholeYears; year += 1) {
      const periodStart = Math.min(year - 1, timeYears);
      const elapsed = Math.min(year, timeYears);
      const cumulative = (principal * rate * elapsed) / 100;
      const previous = (principal * rate * periodStart) / 100;
      rows.push({
        year,
        accrued: cumulative - previous,
        cumulative,
        balance: principal + cumulative,
        // A row covers less than 12 months when the loan term ends mid-year.
        partial: elapsed - periodStart < 0.999999,
      });
    }

    const steps = {
      interest: `SI = P × R × T ÷ 100 = ${fmtNum(principal)} × ${fmtNum(rate)} × ${fmtNum(timeYears)} ÷ 100`,
      principal: `P = SI × 100 ÷ (R × T) = ${fmtNum(interest)} × 100 ÷ (${fmtNum(rate)} × ${fmtNum(timeYears)})`,
      rate: `R = SI × 100 ÷ (P × T) = ${fmtNum(interest)} × 100 ÷ (${fmtNum(principal)} × ${fmtNum(timeYears)})`,
      time: `T = SI × 100 ÷ (P × R) = ${fmtNum(interest)} × 100 ÷ (${fmtNum(principal)} × ${fmtNum(rate)})`,
    };

    return {
      principal,
      rate,
      interest,
      total,
      timeYears,
      timeInput,
      perYear,
      perMonth,
      perDay,
      rows,
      truncated: Math.ceil(timeYears) > 60,
      formula: steps[solveFor],
    };
  }, [form, solveFor, unit]);

  const primary = useMemo(() => {
    if (result.error) return null;
    if (solveFor === "interest") return { label: "Simple interest", value: fmtMoney(result.interest) };
    if (solveFor === "principal") return { label: "Principal required", value: fmtMoney(result.principal) };
    if (solveFor === "rate") return { label: "Annual rate", value: `${fmtNum(result.rate)}%` };
    return {
      label: `Time needed (${unit.short})`,
      value: fmtNum(result.timeInput),
    };
  }, [result, solveFor, unit]);

  const report = useMemo(() => {
    if (result.error) return "";
    return [
      "Simple Interest — detailed",
      `Solving for: ${SOLVE_OPTIONS.find((item) => item.id === solveFor)?.label}`,
      `Principal: ${fmtMoneyExact(result.principal)}`,
      `Annual rate: ${fmtNum(result.rate)}%`,
      `Time: ${fmtNum(result.timeInput)} ${unit.short} (${fmtNum(result.timeYears)} years)`,
      `Simple interest: ${fmtMoneyExact(result.interest)}`,
      `Total amount due: ${fmtMoneyExact(result.total)}`,
      `Formula: ${result.formula}`,
    ].join("\n");
  }, [result, solveFor, unit]);

  const copyResult = () => {
    if (!report) return;
    copyToClipboard("result", report, { label: "Simple interest summary" });
  };

  const reset = () => {
    setForm(DEFAULTS);
    setSolveFor("interest");
  };

  const inputClass =
    "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none disabled:opacity-60";

  const fieldConfig = [
    { key: "principal", label: "Principal (₹)", id: "si-principal" },
    { key: "rate", label: "Annual rate (%)", id: "si-rate" },
    { key: "time", label: `Time (${unit.short})`, id: "si-time" },
    { key: "interest", label: "Simple interest (₹)", id: "si-interest" },
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            <Percent className="h-4 w-4" aria-hidden="true" />
            Interest calculator
          </div>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Simple Interest Calculator (Detailed)
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Built on SI = P × R × T ÷ 100. Choose which of the four values is missing, fill in the rest,
            and get the answer with the rearranged formula and a year-by-year accrual table.
          </p>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-sm font-semibold">Solve for</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {SOLVE_OPTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={solveFor === item.id}
                  onClick={() => setSolveFor(item.id)}
                  className={`min-h-11 rounded-md border px-2 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                    solveFor === item.id
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {fieldConfig.map((field) => (
                <div key={field.key}>
                  <label htmlFor={field.id} className="mb-1.5 block text-sm font-semibold">
                    {field.label}
                  </label>
                  <input
                    id={field.id}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="any"
                    disabled={solveFor === field.key}
                    placeholder={solveFor === field.key ? "solving…" : "0"}
                    value={solveFor === field.key ? "" : form[field.key]}
                    onChange={(event) => setField(field.key, event.target.value)}
                    className={inputClass}
                  />
                </div>
              ))}
              <div>
                <label htmlFor="si-unit" className="mb-1.5 block text-sm font-semibold">
                  Time unit
                </label>
                <select
                  id="si-unit"
                  value={form.unit}
                  onChange={(event) => setField("unit", event.target.value)}
                  className={inputClass}
                >
                  {TIME_UNITS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyResult}
                disabled={Boolean(result.error)}
                aria-label={isCopied("result") ? "Copied the simple interest summary to clipboard" : "Copy simple interest summary"}
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50"
              >
                <Copy className="h-4 w-4" aria-hidden="true" />
                {isCopied("result") ? "Copied!" : "Copy result"}
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset all inputs"
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
              <span className="sr-only" role="status" aria-live="polite">
                {announcement}
              </span>
            </div>
          </section>

          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            {result.error ? (
              <div
                role="alert"
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {result.error}
              </div>
            ) : (
              <div aria-live="polite">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {primary.label}
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
                  {primary.value}
                </p>
                <p className="mt-2 break-words text-sm text-[var(--muted-foreground)]">{result.formula}</p>

                <dl className="mt-5 divide-y divide-[var(--border)] border-y border-[var(--border)]">
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <dt className="text-sm text-[var(--muted-foreground)]">Principal</dt>
                    <dd className="text-sm font-semibold">{fmtMoney(result.principal)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <dt className="text-sm text-[var(--muted-foreground)]">Annual rate</dt>
                    <dd className="text-sm font-semibold">{fmtNum(result.rate)}%</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <dt className="text-sm text-[var(--muted-foreground)]">Time in years</dt>
                    <dd className="text-sm font-semibold">{fmtNum(result.timeYears)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <dt className="text-sm text-[var(--muted-foreground)]">Simple interest</dt>
                    <dd className="text-sm font-semibold text-[var(--success)]">
                      {fmtMoneyExact(result.interest)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2.5">
                    <dt className="text-sm text-[var(--muted-foreground)]">Total amount (P + SI)</dt>
                    <dd className="text-sm font-semibold">{fmtMoneyExact(result.total)}</dd>
                  </div>
                </dl>

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {[
                    ["Interest per year", fmtMoney(result.perYear)],
                    ["Per month", fmtMoney(result.perMonth)],
                    ["Per day", fmtMoneyExact(result.perDay)],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                    >
                      <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                      <p className="mt-1 text-sm font-semibold">{value}</p>
                    </div>
                  ))}
                </div>

                {result.rows.length > 0 && (
                  <>
                    <h2 className="mt-5 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                      Year-by-year accrual
                    </h2>
                    <div className="mt-2 -mx-1 overflow-x-auto">
                      <table className="w-full min-w-[440px] border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                            <th scope="col" className="px-2 py-2 font-semibold">Year</th>
                            <th scope="col" className="px-2 py-2 text-right font-semibold">Interest</th>
                            <th scope="col" className="px-2 py-2 text-right font-semibold">Cumulative</th>
                            <th scope="col" className="px-2 py-2 text-right font-semibold">Amount due</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.rows.map((row) => (
                            <tr key={row.year} className="border-b border-[var(--border)]">
                              <td className="px-2 py-2 font-semibold">
                                Year {row.year}
                                {row.partial ? " (partial)" : ""}
                              </td>
                              <td className="px-2 py-2 text-right text-[var(--success)]">
                                {fmtMoney(row.accrued)}
                              </td>
                              <td className="px-2 py-2 text-right text-[var(--muted-foreground)]">
                                {fmtMoney(row.cumulative)}
                              </td>
                              <td className="px-2 py-2 text-right font-semibold">{fmtMoney(row.balance)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {result.truncated && (
                      <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                        Table capped at the first 60 years.
                      </p>
                    )}
                    {result.rows.some((row) => row.partial) && (
                      <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                        Rows marked &ldquo;(partial)&rdquo; cover less than a full 12 months because the loan
                        term ends partway through that year, so their interest is proportionally lower.
                      </p>
                    )}
                  </>
                )}

                <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                  Simple interest never earns interest on interest. Informational only — your lender may use a
                  different day-count basis or add fees.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
