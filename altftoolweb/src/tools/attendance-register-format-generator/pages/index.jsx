"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ClipboardList, Copy, RotateCcw } from "lucide-react";

import { MONTH_NAMES, WEEKDAY_NAMES, buildAttendanceRegister, registerToCsv } from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";

const DEFAULTS = {
  establishment: "Sunrise Textiles Pvt Ltd",
  address: "Plot 14, MIDC Phase II, Pune 411019",
  year: "2026",
  month: "4",
  employees:
    "E001, Asha Rao\nE002, Ravi Kumar\nE003, Meena Joshi\nE004, Suresh Patil\nE005, Farida Sheikh",
  weeklyOff: "0",
  holidays: "",
  overtime: true,
};

const DASH = "—";

export default function ToolHome() {
  const [establishment, setEstablishment] = useState(DEFAULTS.establishment);
  const [address, setAddress] = useState(DEFAULTS.address);
  const [year, setYear] = useState(DEFAULTS.year);
  const [month, setMonth] = useState(DEFAULTS.month);
  const [employees, setEmployees] = useState(DEFAULTS.employees);
  const [weeklyOff, setWeeklyOff] = useState(DEFAULTS.weeklyOff);
  const [holidays, setHolidays] = useState(DEFAULTS.holidays);
  const [overtime, setOvertime] = useState(DEFAULTS.overtime);
  const [copied, setCopied] = useState(false);

  // Jump to the live wage month only after mount, so server and client markup match.
  useEffect(() => {
    const now = new Date();
    setYear(String(now.getFullYear()));
    setMonth(String(now.getMonth() + 1));
  }, []);

  const register = useMemo(
    () =>
      buildAttendanceRegister({
        establishment,
        address,
        year: Number(year),
        month: Number(month),
        employees,
        weeklyOffDay: weeklyOff === "" ? null : Number(weeklyOff),
        holidays,
        includeOvertime: overtime,
      }),
    [establishment, address, year, month, employees, weeklyOff, holidays, overtime],
  );

  const hasError = Boolean(register.error);
  const csv = useMemo(() => (hasError ? "" : registerToCsv(register)), [register, hasError]);

  const copyResult = async () => {
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
    setEstablishment(DEFAULTS.establishment);
    setAddress(DEFAULTS.address);
    setYear(DEFAULTS.year);
    setMonth(DEFAULTS.month);
    setEmployees(DEFAULTS.employees);
    setWeeklyOff(DEFAULTS.weeklyOff);
    setHolidays(DEFAULTS.holidays);
    setOvertime(DEFAULTS.overtime);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          Labour compliance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Attendance Register Format Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Lay out a Form D style attendance register for any wage month — one column per calendar
          day, weekly offs and paid holidays pre-marked, and a printed legend so the sheet reads the
          same to your supervisor and to an inspector.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="att-establishment">
              Name of establishment
            </label>
            <input
              id="att-establishment"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={establishment}
              onChange={(event) => setEstablishment(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="att-address">
              Address or LIN (optional)
            </label>
            <input
              id="att-address"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="att-month">
              Wage month
            </label>
            <select
              id="att-month"
              className={`mt-2 ${INPUT_CLASS}`}
              value={month}
              onChange={(event) => setMonth(event.target.value)}
            >
              {MONTH_NAMES.map((label, index) => (
                <option key={label} value={String(index + 1)}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="att-year">
              Year
            </label>
            <input
              id="att-year"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1900"
              max="2200"
              step="1"
              value={year}
              onChange={(event) => setYear(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="att-weeklyoff">
              Weekly off day
            </label>
            <select
              id="att-weeklyoff"
              className={`mt-2 ${INPUT_CLASS}`}
              value={weeklyOff}
              onChange={(event) => setWeeklyOff(event.target.value)}
            >
              {WEEKDAY_NAMES.map((label, index) => (
                <option key={label} value={String(index)}>
                  {label}
                </option>
              ))}
              <option value="">No fixed weekly off</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="att-holidays">
              Paid holiday dates (day numbers)
            </label>
            <input
              id="att-holidays"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              inputMode="numeric"
              placeholder="e.g. 1, 14, 26"
              value={holidays}
              onChange={(event) => setHolidays(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="att-employees">
              Employees — one per line, as &quot;code, name&quot;
            </label>
            <textarea
              id="att-employees"
              className={`mt-2 ${AREA_CLASS}`}
              rows={6}
              value={employees}
              onChange={(event) => setEmployees(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label
              className="inline-flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold"
              htmlFor="att-overtime"
            >
              <input
                id="att-overtime"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--primary)]/25"
                checked={overtime}
                onChange={(event) => setOvertime(event.target.checked)}
              />
              Include the overtime hours column
            </label>
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {register.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Scheduled working days
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(register.workingDays)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to generate the register."
                : `${register.monthLabel} · ${NUM.format(register.employeeCount)} employees on the sheet`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy attendance register as CSV"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy CSV"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the register inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Days in the wage month", hasError ? DASH : NUM.format(register.totalDays)],
            [
              "Weekly offs",
              hasError
                ? DASH
                : `${NUM.format(register.weeklyOffCount)} (${register.weeklyOffLabel})`,
            ],
            ["Paid holidays marked", hasError ? DASH : NUM.format(register.holidayCount)],
            ["Rows on the register", hasError ? DASH : NUM.format(register.employeeCount)],
            ["Columns per row", hasError ? DASH : NUM.format(register.totalColumns)],
            [
              "Preserve the register for",
              hasError ? DASH : `${register.retentionYears} years after the last entry`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">{register.establishment}</h2>
          {register.address && (
            <p className="text-sm text-[var(--muted-foreground)]">{register.address}</p>
          )}
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Attendance register — wage month {register.monthLabel}
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                  <th scope="col" className="whitespace-nowrap px-2 py-2 font-semibold">
                    Sl.
                  </th>
                  <th scope="col" className="whitespace-nowrap px-2 py-2 font-semibold">
                    Code
                  </th>
                  <th scope="col" className="whitespace-nowrap px-2 py-2 font-semibold">
                    Name of employee
                  </th>
                  {register.dayColumns.map((column) => (
                    <th
                      key={column.day}
                      scope="col"
                      className={`px-1 py-2 text-center font-semibold ${
                        column.isWeeklyOff || column.isHoliday
                          ? "text-[var(--primary)]"
                          : "text-[var(--muted-foreground)]"
                      }`}
                      title={`${column.day} — ${column.weekdayFull}`}
                    >
                      <span className="block">{column.day}</span>
                      <span className="block text-[10px] font-normal">{column.weekday}</span>
                    </th>
                  ))}
                  <th scope="col" className="whitespace-nowrap px-2 py-2 text-center font-semibold">
                    Worked
                  </th>
                  <th scope="col" className="whitespace-nowrap px-2 py-2 text-center font-semibold">
                    Absent
                  </th>
                  {register.includeOvertime && (
                    <th
                      scope="col"
                      className="whitespace-nowrap px-2 py-2 text-center font-semibold"
                    >
                      OT hrs
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {register.rows.map((row) => (
                  <tr
                    key={`${row.sl}-${row.code}`}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="px-2 py-2 font-semibold">{row.sl}</td>
                    <td className="whitespace-nowrap px-2 py-2">{row.code}</td>
                    <td className="whitespace-nowrap px-2 py-2">{row.name}</td>
                    {register.dayColumns.map((column) => (
                      <td
                        key={column.day}
                        className={`px-1 py-2 text-center ${
                          column.defaultMark
                            ? "font-semibold text-[var(--primary)]"
                            : "text-[var(--muted-foreground)]"
                        }`}
                      >
                        {column.defaultMark || ""}
                      </td>
                    ))}
                    <td className="px-2 py-2" />
                    <td className="px-2 py-2" />
                    {register.includeOvertime && <td className="px-2 py-2" />}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="mt-5 text-sm font-semibold">Legend</h3>
          <ul className="mt-2 grid gap-1 text-sm text-[var(--muted-foreground)] sm:grid-cols-2">
            {register.legend.map(([code, meaning]) => (
              <li key={code}>
                <span className="font-semibold text-[var(--foreground)]">{code}</span> — {meaning}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template only. The column headings follow the combined Form D attendance
        register introduced by the Ease of Compliance to Maintain Registers under various Labour
        Laws Rules, 2017; your state Shops and Establishments rules or a sector-specific rule may
        require extra columns. Confirm the format with your labour law adviser before filing.
      </p>
    </main>
  );
}
