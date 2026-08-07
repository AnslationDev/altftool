"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Eye, RotateCcw } from "lucide-react";

import { LENS_TYPES, buildAdaptationSchedule, trackLensWear } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  lensType: "monthly",
  opened: "2026-07-05",
  caseChanged: "2026-06-01",
  hours: "10",
  days: "6",
};

/** Real current date as YYYY-MM-DD, read fresh each call — never frozen at build time. */
const todayIso = () => new Date().toISOString().slice(0, 10);

const DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const prettyDate = (iso) => {
  if (!iso) return DASH;
  const ms = Date.parse(`${iso}T00:00:00Z`);
  return Number.isFinite(ms) ? DATE_FMT.format(new Date(ms)) : DASH;
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [lensType, setLensType] = useState(DEFAULTS.lensType);
  const [opened, setOpened] = useState(DEFAULTS.opened);
  const [today, setToday] = useState(todayIso);
  const [caseChanged, setCaseChanged] = useState(DEFAULTS.caseChanged);
  const [hours, setHours] = useState(DEFAULTS.hours);
  const [days, setDays] = useState(DEFAULTS.days);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      trackLensWear({
        lensTypeId: lensType,
        openedDate: opened,
        todayDate: today,
        caseChangedDate: caseChanged,
        hoursPerDay: toNumber(hours),
        daysPerWeek: toNumber(days),
      }),
    [lensType, opened, today, caseChanged, hours, days],
  );

  const adaptation = useMemo(() => buildAdaptationSchedule(7), []);
  const hasError = Boolean(result.error);

  const headline = hasError
    ? DASH
    : result.daysRemaining >= 0
      ? `${result.daysRemaining} day${result.daysRemaining === 1 ? "" : "s"} left`
      : `${Math.abs(result.daysRemaining)} day${Math.abs(result.daysRemaining) === 1 ? "" : "s"} overdue`;

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Contact Lens Wear Tracker",
      `Lens type: ${result.type.label} (${result.replacementDays}-day schedule)`,
      `Opened: ${result.openedDate} · Checked: ${result.todayDate}`,
      `Replace on: ${result.replacementDateIso} (${headline})`,
      `Life used: ${result.percentUsed}%`,
      `Wear so far: ${result.wearingDays} wearing days, about ${result.cumulativeHours} hours`,
      `Weekly wear: ${result.weeklyHours} hours`,
      result.caseDueIso ? `Lens case due: ${result.caseDueIso}` : "Lens case: no date entered",
      `Lenses used per year: ${result.lensesPerYear} (both eyes)`,
    ].join("\n");
  }, [result, hasError, headline]);

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
    setLensType(DEFAULTS.lensType);
    setOpened(DEFAULTS.opened);
    setToday(todayIso());
    setCaseChanged(DEFAULTS.caseChanged);
    setHours(DEFAULTS.hours);
    setDays(DEFAULTS.days);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Replace lenses on", DASH],
        ["Life used", DASH],
        ["Days since opening", DASH],
        ["Wearing days so far", DASH],
        ["Hours on these lenses", DASH],
        ["Weekly wear", DASH],
        ["Lens case due", DASH],
        ["Lenses per year (both eyes)", DASH],
      ]
    : [
        ["Replace lenses on", prettyDate(result.replacementDateIso)],
        ["Life used", `${NUM.format(result.percentUsed)}%`],
        ["Days since opening", `${result.daysElapsed} of ${result.replacementDays}`],
        ["Wearing days so far", String(result.wearingDays)],
        ["Hours on these lenses", `${NUM.format(result.cumulativeHours)} h`],
        ["Weekly wear", `${NUM.format(result.weeklyHours)} h`],
        [
          "Lens case due",
          result.caseDueIso
            ? `${prettyDate(result.caseDueIso)}${
                result.caseDaysRemaining !== null ? ` (${result.caseDaysRemaining} d)` : ""
              }`
            : "Add a date to track",
        ],
        ["Lenses per year (both eyes)", String(result.lensesPerYear)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Eye className="h-4 w-4" aria-hidden="true" />
          Eye care
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Contact Lens Wear Tracker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Count the replacement window from the day the blister was opened, add up the hours actually
          worn, and get the lens case change date the CDC asks for.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="clw-type">
              Lens replacement schedule
            </label>
            <select
              id="clw-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={lensType}
              onChange={(event) => setLensType(event.target.value)}
            >
              {LENS_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label} — {type.replacementDays} day{type.replacementDays === 1 ? "" : "s"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="clw-opened">
              Date the pack was opened
            </label>
            <input
              id="clw-opened"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={opened}
              onChange={(event) => setOpened(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="clw-today">
              Check against this date
            </label>
            <input
              id="clw-today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="clw-case">
              Lens case last replaced
            </label>
            <input
              id="clw-case"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={caseChanged}
              onChange={(event) => setCaseChanged(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="clw-hours">
              Hours worn per wearing day
            </label>
            <input
              id="clw-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="24"
              step="0.5"
              value={hours}
              onChange={(event) => setHours(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="clw-days">
              Wearing days per week
            </label>
            <input
              id="clw-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="7"
              step="1"
              value={days}
              onChange={(event) => setDays(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {hasError ? "Lens status" : result.statusLabel}
            </p>
            <p
              aria-live="polite"
              aria-atomic="true"
              className={`mt-1 text-4xl font-semibold ${
                !hasError && result.status === "overdue" ? "text-[var(--danger)]" : "text-[var(--primary)]"
              }`}
            >
              {headline}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see the schedule." : result.type.note}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the contact lens tracking result"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <div className="mt-5">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`${Math.round(result.percentUsed)} percent of the lens life used`}
            >
              <span
                className={`block h-full ${
                  result.status === "overdue" || result.status === "due"
                    ? "bg-[var(--danger)]"
                    : "bg-[var(--primary)]"
                }`}
                style={{ width: `${result.percentUsed}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Day {result.daysElapsed} of {result.replacementDays}
            </p>
          </div>
        )}

        <dl aria-live="polite" className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.warnings.length > 0 && (
          <ul className="mt-5 space-y-2">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm leading-6 text-[var(--danger)]"
              >
                {warning}
              </li>
            ))}
          </ul>
        )}
      </section>

      {!adaptation.error && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">First-week build-up for a new fit</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            A common build-up starts at 4 hours on day one and adds 2 hours a day up to a 12-hour
            ceiling. Your optician may set a slower or faster schedule.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Day
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Maximum wear
                  </th>
                </tr>
              </thead>
              <tbody>
                {adaptation.rows.map((row) => (
                  <tr key={row.day} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">Day {row.day}</td>
                    <td className="py-2 text-right">{row.hours} h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Follow the replacement schedule and wear time on your own fitting card,
        and see an eye care professional promptly for redness, pain, light sensitivity or blurred
        vision — remove the lenses first.
      </p>
    </main>
  );
}
