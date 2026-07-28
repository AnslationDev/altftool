"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Check, Copy, RotateCcw } from "lucide-react";

import { GST_SCHEMES, QRMP_GROUPS, buildComplianceCalendar } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-medium";

const DASH = "—";

const todayIso = () => new Date().toISOString().slice(0, 10);

const currentFyStartYear = () => {
  const now = new Date();
  return now.getUTCMonth() >= 3 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
};

const prettyDate = (iso) => {
  const ms = Date.parse(`${iso}T00:00:00Z`);
  if (Number.isNaN(ms)) return iso;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(ms));
};

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function ToolHome() {
  const [fyStartYear, setFyStartYear] = useState(() => String(currentFyStartYear()));
  const [today, setToday] = useState(todayIso);
  const [gstScheme, setGstScheme] = useState("monthly");
  const [qrmpGroup, setQrmpGroup] = useState("x");
  const [turnover, setTurnover] = useState("5000000");
  const [presumptive, setPresumptive] = useState(true);
  const [deductsTds, setDeductsTds] = useState(false);
  const [hasEmployees, setHasEmployees] = useState(false);
  const [taxAudit, setTaxAudit] = useState(false);
  const [onlyUpcoming, setOnlyUpcoming] = useState(true);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildComplianceCalendar({
        fyStartYear: Number(fyStartYear),
        gstScheme,
        qrmpGroup,
        turnover: Number(turnover),
        presumptive,
        deductsTds,
        hasEmployees,
        taxAudit,
        today,
      }),
    [
      fyStartYear,
      gstScheme,
      qrmpGroup,
      turnover,
      presumptive,
      deductsTds,
      hasEmployees,
      taxAudit,
      today,
    ],
  );

  const visibleItems = useMemo(() => {
    if (result.error) return [];
    return onlyUpcoming ? result.items.filter((item) => !item.overdue) : result.items;
  }, [result, onlyUpcoming]);

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      `Compliance calendar — ${result.fyLabel}`,
      `${result.totalItems} filings, ${result.upcomingCount} still due as at ${today}`,
      "",
      ...result.items.map((item) => `${item.date}  ${item.form.padEnd(12)} ${item.title}`),
    ].join("\n");
  }, [result, today]);

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
    setFyStartYear(String(currentFyStartYear()));
    setToday(todayIso());
    setGstScheme("monthly");
    setQrmpGroup("x");
    setTurnover("5000000");
    setPresumptive(true);
    setDeductsTds(false);
    setHasEmployees(false);
    setTaxAudit(false);
    setOnlyUpcoming(true);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          Proprietorship
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Compliance Calendar for Sole Proprietorship
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tick off the registrations you actually hold and get every GST, TDS, advance tax, ITR and
          labour due date for the financial year, in order, with the next one first.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cal-fy">
              Financial year starting (April of)
            </label>
            <input
              id="cal-fy"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="2017"
              max="2035"
              step="1"
              value={fyStartYear}
              onChange={(event) => setFyStartYear(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cal-today">
              Today&apos;s date
            </label>
            <input
              id="cal-today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cal-gst">
              GST registration
            </label>
            <select
              id="cal-gst"
              className={`mt-2 ${INPUT_CLASS}`}
              value={gstScheme}
              onChange={(event) => setGstScheme(event.target.value)}
            >
              {GST_SCHEMES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          {gstScheme === "qrmp" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="cal-group">
                QRMP state group
              </label>
              <select
                id="cal-group"
                className={`mt-2 ${INPUT_CLASS}`}
                value={qrmpGroup}
                onChange={(event) => setQrmpGroup(event.target.value)}
              >
                {QRMP_GROUPS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="cal-turnover">
              Annual turnover (INR)
            </label>
            <input
              id="cal-turnover"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="100000"
              value={turnover}
              onChange={(event) => setTurnover(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            What else applies to you
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {[
              ["cal-presumptive", "Taxed presumptively (44AD / 44ADA)", presumptive, setPresumptive],
              ["cal-tds", "I deduct TDS on payments", deductsTds, setDeductsTds],
              ["cal-emp", "I have employees on EPF / ESI", hasEmployees, setHasEmployees],
              ["cal-audit", "A tax audit under 44AB applies", taxAudit, setTaxAudit],
            ].map(([id, label, value, setter]) => (
              <label key={id} className={CHECK_ROW} htmlFor={id}>
                <input
                  id={id}
                  type="checkbox"
                  checked={value}
                  onChange={(event) => setter(event.target.checked)}
                  className="h-5 w-5 accent-[var(--primary)]"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {result.error ? (
        <>
          <p
            role="alert"
            className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
          <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Next filing due
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--muted-foreground)]">{DASH}</p>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {["Filings in the year", "Still due", "Due in the next 30 days"].map((item) => (
                <div key={item} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{item}</dt>
                  <dd className="text-right font-semibold">{DASH}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Next filing due
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {result.nextDue ? prettyDate(result.nextDue.date) : "Nothing left"}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {result.nextDue
                    ? `${result.nextDue.form} · ${result.nextDue.title} · in ${result.nextDue.daysAway} days`
                    : `Every ${result.fyLabel} filing in this list is already past its date`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy the whole compliance calendar"
                  className={GHOST_BTN}
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
                ["Financial year", `${result.fyLabel} (${prettyDate(result.fyStart)} to ${prettyDate(result.fyEnd)})`],
                ["Filings in the year", String(result.totalItems)],
                ["Still due", String(result.upcomingCount)],
                ["Due in the next 30 days", String(result.next30Count)],
                ["Already past their date", String(result.overdueCount)],
                ["Turnover entered", INR.format(Number(turnover) || 0)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(result.byAuthority).map(([authority, count]) => (
                <span
                  key={authority}
                  className="rounded-md bg-[var(--muted)] px-2.5 py-1 text-xs font-semibold text-[var(--muted-foreground)]"
                >
                  {authority}: {count}
                </span>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">The calendar</h2>
              <button
                type="button"
                onClick={() => setOnlyUpcoming((value) => !value)}
                aria-pressed={onlyUpcoming}
                className="min-h-11 rounded-md px-3 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                {onlyUpcoming ? "Show past dates too" : "Hide past dates"}
              </button>
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[340px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Date
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Form
                    </th>
                    <th scope="col" className="py-2 font-semibold">
                      What is due
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleItems.map((item) => (
                    <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2.5 pr-3 whitespace-nowrap font-semibold">
                        {prettyDate(item.date)}
                        <span
                          className={`mt-0.5 block text-xs font-medium ${item.overdue ? "text-[var(--danger)]" : "text-[var(--muted-foreground)]"}`}
                        >
                          {item.overdue ? `${Math.abs(item.daysAway)}d ago` : `in ${item.daysAway}d`}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap">
                        <span className="rounded-md bg-[var(--muted)] px-2 py-1 text-xs font-semibold">
                          {item.form}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span className="font-medium">{item.title}</span>
                        {item.note ? (
                          <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                            {item.note}
                          </span>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {visibleItems.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                Nothing left in {result.fyLabel}. Switch the filter to see the dates that have
                already passed.
              </p>
            ) : null}
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax or legal advice. These are the statutory dates — the CBIC and
        the CBDT extend individual deadlines by notification most years, professional tax is
        state-specific, and a chartered accountant should confirm which filings actually apply to
        your registrations.
      </p>
    </main>
  );
}
