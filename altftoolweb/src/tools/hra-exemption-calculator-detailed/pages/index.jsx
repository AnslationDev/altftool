"use client";

import { useCallback, useMemo, useState } from "react";
import { safeCopyText } from "@/shared/utils/clipboard";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const money = (value) => inr.format(Number.isFinite(value) ? value : 0);

const FY_MONTHS = [
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
  "January",
  "February",
  "March",
];

const METRO_RATE = 0.5;
const NON_METRO_RATE = 0.4;
const PAN_RENT_THRESHOLD = 100000;

const makePeriod = (label, overrides = {}) => ({
  id: `period-${Math.random().toString(36).slice(2, 9)}`,
  label,
  months: "12",
  metro: true,
  basic: "50000",
  da: "0",
  commission: "0",
  hra: "20000",
  rent: "22000",
  ...overrides,
});

const DEFAULT_PERIODS = [
  {
    id: "period-1",
    label: "Full year",
    months: "12",
    metro: true,
    basic: "50000",
    da: "0",
    commission: "0",
    hra: "20000",
    rent: "22000",
  },
];

const toNumber = (value) => {
  const parsed = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

export default function ToolHome() {
  const [periods, setPeriods] = useState(DEFAULT_PERIODS);
  const [copied, setCopied] = useState(false);

  const updatePeriod = useCallback((id, key, value) => {
    setPeriods((prev) => prev.map((p) => (p.id === id ? { ...p, [key]: value } : p)));
    setCopied(false);
  }, []);

  const addPeriod = () => {
    setPeriods((prev) => {
      if (prev.length >= 4) return prev;
      return [
        ...prev,
        makePeriod(`Period ${prev.length + 1}`, { months: "6", metro: false, rent: "15000" }),
      ];
    });
    setCopied(false);
  };

  const removePeriod = (id) => {
    setPeriods((prev) => (prev.length > 1 ? prev.filter((p) => p.id !== id) : prev));
    setCopied(false);
  };

  const calc = useMemo(() => {
    const errors = [];
    const parsed = periods.map((period, index) => {
      const months = Math.round(toNumber(period.months));
      const basic = toNumber(period.basic);
      const da = toNumber(period.da);
      const commission = toNumber(period.commission);
      const hra = toNumber(period.hra);
      const rent = toNumber(period.rent);
      const name = period.label || `Period ${index + 1}`;

      const numbers = { months, basic, da, commission, hra, rent };
      Object.entries(numbers).forEach(([key, value]) => {
        if (!Number.isFinite(value) || value < 0) {
          errors.push(`${name}: enter a valid non-negative number for ${key === "hra" ? "HRA received" : key}.`);
        }
      });
      if (Number.isFinite(months) && (months < 1 || months > 12)) {
        errors.push(`${name}: months must be between 1 and 12.`);
      }

      const salary = (basic || 0) + (da || 0) + (commission || 0);
      const rate = period.metro ? METRO_RATE : NON_METRO_RATE;
      const limbHra = hra || 0;
      const limbRent = Math.max(0, (rent || 0) - 0.1 * salary);
      const limbSalary = rate * salary;
      const monthlyExempt = Math.max(0, Math.min(limbHra, limbRent, limbSalary));
      const safeMonths = Number.isFinite(months) && months > 0 ? Math.min(12, months) : 0;

      return {
        ...period,
        name,
        months: safeMonths,
        salary,
        rate,
        limbHra,
        limbRent,
        limbSalary,
        monthlyExempt,
        totalHra: limbHra * safeMonths,
        totalRent: (rent || 0) * safeMonths,
        totalExempt: monthlyExempt * safeMonths,
        leastLimb:
          monthlyExempt === limbHra
            ? "Actual HRA received"
            : monthlyExempt === limbRent
              ? "Rent paid minus 10% of salary"
              : `${period.metro ? "50%" : "40%"} of salary`,
      };
    });

    const totalMonths = parsed.reduce((sum, p) => sum + p.months, 0);
    if (totalMonths > 12) {
      errors.push("Total months across all periods cannot exceed 12 in one financial year.");
    }

    const totalHra = parsed.reduce((sum, p) => sum + p.totalHra, 0);
    const totalRent = parsed.reduce((sum, p) => sum + p.totalRent, 0);
    const totalExempt = parsed.reduce((sum, p) => sum + p.totalExempt, 0);
    const taxableHra = Math.max(0, totalHra - totalExempt);

    const monthly = [];
    let cursor = 0;
    parsed.forEach((period) => {
      for (let i = 0; i < period.months && cursor < 12; i += 1) {
        monthly.push({
          key: `${period.id}-${i}`,
          month: FY_MONTHS[cursor],
          periodName: period.name,
          hra: period.limbHra,
          rent: toNumber(period.rent) || 0,
          exempt: period.monthlyExempt,
          taxable: Math.max(0, period.limbHra - period.monthlyExempt),
        });
        cursor += 1;
      }
    });

    return {
      errors,
      parsed,
      totalMonths,
      totalHra,
      totalRent,
      totalExempt,
      taxableHra,
      monthly,
      panNeeded: totalRent > PAN_RENT_THRESHOLD,
    };
  }, [periods]);

  const report = useMemo(() => {
    if (calc.errors.length) return "";
    const lines = ["HRA Exemption Calculation", ""];
    calc.parsed.forEach((p) => {
      lines.push(
        `${p.name} (${p.months} month${p.months === 1 ? "" : "s"}, ${p.metro ? "metro" : "non-metro"})`,
        `  Monthly salary (basic + DA + commission): ${money(p.salary)}`,
        `  1. Actual HRA received: ${money(p.limbHra)} / month`,
        `  2. Rent paid minus 10% of salary: ${money(p.limbRent)} / month`,
        `  3. ${p.metro ? "50%" : "40%"} of salary: ${money(p.limbSalary)} / month`,
        `  Least of the three: ${money(p.monthlyExempt)} / month (${p.leastLimb})`,
        `  Period exemption: ${money(p.totalExempt)}`,
        ""
      );
    });
    lines.push(
      `Total HRA received: ${money(calc.totalHra)}`,
      `Total rent paid: ${money(calc.totalRent)}`,
      `Exempt under section 10(13A): ${money(calc.totalExempt)}`,
      `Taxable HRA: ${money(calc.taxableHra)}`,
      "",
      "HRA exemption is available only under the old tax regime.",
      "Informational only — verify with your employer or tax adviser."
    );
    return lines.join("\n");
  }, [calc]);

  const copyReport = async () => {
    if (!report) return;
    const ok = await safeCopyText(report);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const inputClass =
    "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
          <h1 className="text-2xl font-semibold sm:text-3xl">Detailed HRA Exemption Calculator</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            Section 10(13A) exempts the least of three amounts: actual HRA received, rent paid over
            10% of salary, and 50% of salary in a metro city (40% elsewhere). Enter your monthly
            figures — add a second period if your rent, salary or city changed mid-year.
          </p>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold">Monthly figures</h2>
              <span className="text-xs text-[var(--muted-foreground)]">
                {calc.totalMonths} of 12 months covered
              </span>
            </div>

            <div className="mt-4 grid gap-5">
              {periods.map((period, index) => (
                <div
                  key={period.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label htmlFor={`hra-label-${period.id}`} className="text-sm font-semibold">
                      Period {index + 1}
                    </label>
                    {periods.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removePeriod(period.id)}
                        className="min-h-11 rounded-md px-2 text-xs font-semibold text-[var(--danger)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                  <input
                    id={`hra-label-${period.id}`}
                    type="text"
                    value={period.label}
                    onChange={(e) => updatePeriod(period.id, "label", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Bengaluru, Apr–Sep"
                  />

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor={`hra-months-${period.id}`} className="text-sm font-semibold">
                        Months in this period
                      </label>
                      <input
                        id={`hra-months-${period.id}`}
                        type="number"
                        inputMode="numeric"
                        min="1"
                        max="12"
                        step="1"
                        value={period.months}
                        onChange={(e) => updatePeriod(period.id, "months", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor={`hra-city-${period.id}`} className="text-sm font-semibold">
                        City type
                      </label>
                      <select
                        id={`hra-city-${period.id}`}
                        value={period.metro ? "metro" : "non-metro"}
                        onChange={(e) => updatePeriod(period.id, "metro", e.target.value === "metro")}
                        className={inputClass}
                      >
                        <option value="metro">Metro — Delhi, Mumbai, Kolkata, Chennai (50%)</option>
                        <option value="non-metro">Any other city (40%)</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`hra-basic-${period.id}`} className="text-sm font-semibold">
                        Monthly basic salary (₹)
                      </label>
                      <input
                        id={`hra-basic-${period.id}`}
                        type="number"
                        inputMode="numeric"
                        min="0"
                        step="1000"
                        value={period.basic}
                        onChange={(e) => updatePeriod(period.id, "basic", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor={`hra-da-${period.id}`} className="text-sm font-semibold">
                        Monthly DA in retirement benefits (₹)
                      </label>
                      <input
                        id={`hra-da-${period.id}`}
                        type="number"
                        inputMode="numeric"
                        min="0"
                        step="500"
                        value={period.da}
                        onChange={(e) => updatePeriod(period.id, "da", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor={`hra-comm-${period.id}`} className="text-sm font-semibold">
                        Monthly turnover commission (₹)
                      </label>
                      <input
                        id={`hra-comm-${period.id}`}
                        type="number"
                        inputMode="numeric"
                        min="0"
                        step="500"
                        value={period.commission}
                        onChange={(e) => updatePeriod(period.id, "commission", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor={`hra-hra-${period.id}`} className="text-sm font-semibold">
                        Monthly HRA received (₹)
                      </label>
                      <input
                        id={`hra-hra-${period.id}`}
                        type="number"
                        inputMode="numeric"
                        min="0"
                        step="500"
                        value={period.hra}
                        onChange={(e) => updatePeriod(period.id, "hra", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor={`hra-rent-${period.id}`} className="text-sm font-semibold">
                        Monthly rent paid (₹)
                      </label>
                      <input
                        id={`hra-rent-${period.id}`}
                        type="number"
                        inputMode="numeric"
                        min="0"
                        step="500"
                        value={period.rent}
                        onChange={(e) => updatePeriod(period.id, "rent", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={addPeriod}
                disabled={periods.length >= 4}
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] disabled:opacity-50 motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                Add another period
              </button>
              <button
                type="button"
                onClick={() => {
                  setPeriods(DEFAULT_PERIODS);
                  setCopied(false);
                }}
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                Reset
              </button>
            </div>
          </section>

          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            {calc.errors.length ? (
              <div
                role="alert"
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {calc.errors[0]}
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Exempt under section 10(13A)
                </p>
                <p className="mt-2 text-4xl font-semibold text-[var(--primary)]">
                  {money(calc.totalExempt)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  for the year, out of {money(calc.totalHra)} HRA received
                </p>

                <dl className="mt-5 grid gap-2">
                  {[
                    ["Total HRA received", money(calc.totalHra)],
                    ["Total rent paid", money(calc.totalRent)],
                    ["Exempt HRA", money(calc.totalExempt)],
                    ["Taxable HRA", money(calc.taxableHra)],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                    >
                      <dt className="text-[var(--muted-foreground)]">{label}</dt>
                      <dd className="font-semibold">{value}</dd>
                    </div>
                  ))}
                </dl>

                <h3 className="mt-6 text-sm font-semibold">Least-of-three per period (monthly)</h3>
                <div className="mt-2 grid gap-3">
                  {calc.parsed.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                    >
                      <p className="text-sm font-semibold">
                        {p.name} · {p.months} month{p.months === 1 ? "" : "s"} ·{" "}
                        {p.metro ? "metro" : "non-metro"}
                      </p>
                      <ul className="mt-2 grid gap-1 text-sm text-[var(--muted-foreground)]">
                        <li className="flex justify-between gap-3">
                          <span>1. Actual HRA received</span>
                          <span className="font-medium text-[var(--foreground)]">
                            {money(p.limbHra)}
                          </span>
                        </li>
                        <li className="flex justify-between gap-3">
                          <span>2. Rent − 10% of salary</span>
                          <span className="font-medium text-[var(--foreground)]">
                            {money(p.limbRent)}
                          </span>
                        </li>
                        <li className="flex justify-between gap-3">
                          <span>3. {p.metro ? "50%" : "40%"} of salary</span>
                          <span className="font-medium text-[var(--foreground)]">
                            {money(p.limbSalary)}
                          </span>
                        </li>
                      </ul>
                      <p className="mt-2 text-sm">
                        Least is{" "}
                        <span className="font-semibold text-[var(--success)]">
                          {money(p.monthlyExempt)}
                        </span>{" "}
                        a month — {p.leastLimb}. Period total {money(p.totalExempt)}.
                      </p>
                    </div>
                  ))}
                </div>

                {calc.monthly.length ? (
                  <>
                    <h3 className="mt-6 text-sm font-semibold">Month-by-month breakdown</h3>
                    <div className="mt-2 overflow-x-auto">
                      <table className="w-full min-w-[340px] border-collapse text-sm">
                        <thead>
                          <tr className="text-left text-xs uppercase text-[var(--muted-foreground)]">
                            <th className="py-2 pr-2 font-semibold">Month</th>
                            <th className="py-2 pr-2 text-right font-semibold">HRA</th>
                            <th className="py-2 pr-2 text-right font-semibold">Rent</th>
                            <th className="py-2 pr-2 text-right font-semibold">Exempt</th>
                            <th className="py-2 text-right font-semibold">Taxable</th>
                          </tr>
                        </thead>
                        <tbody>
                          {calc.monthly.map((row) => (
                            <tr key={row.key} className="border-t border-[var(--border)]">
                              <td className="py-2 pr-2">{row.month}</td>
                              <td className="py-2 pr-2 text-right">{money(row.hra)}</td>
                              <td className="py-2 pr-2 text-right">{money(row.rent)}</td>
                              <td className="py-2 pr-2 text-right font-semibold">
                                {money(row.exempt)}
                              </td>
                              <td className="py-2 text-right">{money(row.taxable)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : null}

                <button
                  type="button"
                  onClick={copyReport}
                  aria-label="Copy the HRA exemption calculation"
                  className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {copied ? "Copied!" : "Copy result"}
                </button>

                <div className="mt-5 grid gap-2 text-xs leading-6 text-[var(--muted-foreground)]">
                  {calc.panNeeded ? (
                    <p>
                      Annual rent of {money(calc.totalRent)} crosses {money(PAN_RENT_THRESHOLD)}, so
                      your employer will ask for the landlord&apos;s PAN to allow the exemption.
                    </p>
                  ) : null}
                  <p>
                    Salary here means basic pay plus dearness allowance that forms part of retirement
                    benefits, plus commission fixed as a percentage of turnover. HRA exemption is
                    available only under the old tax regime.
                  </p>
                  <p>Informational only — confirm with your employer or a tax adviser.</p>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
