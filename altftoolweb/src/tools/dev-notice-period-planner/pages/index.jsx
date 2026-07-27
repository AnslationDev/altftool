"use client";

import { useMemo, useState } from "react";
import { Briefcase, Check, Copy, RotateCcw } from "lucide-react";

import {
  COMMON_NOTICE_DAYS,
  DAY_BASIS_OPTIONS,
  MAX_NOTICE_DAYS,
  RECOVERY_BASIS_OPTIONS,
  noticePlanMarkdown,
  planNoticePeriod,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const num = (value) => (value.trim() === "" ? Number.NaN : Number(value));

const DEFAULTS = {
  resignationDate: "2026-08-03",
  contractNoticeDays: "90",
  servedNoticeDays: "60",
  monthlyBasic: "60000",
  monthlyGross: "120000",
  monthlyCtc: "150000",
  recoveryBasis: "basic",
  dayBasis: "calendar-30",
  leaveBalanceDays: "12",
  leaveOffsetsShortfall: true,
};

export default function ToolHome() {
  const [resignationDate, setResignationDate] = useState(DEFAULTS.resignationDate);
  const [contractNoticeDays, setContractNoticeDays] = useState(DEFAULTS.contractNoticeDays);
  const [servedNoticeDays, setServedNoticeDays] = useState(DEFAULTS.servedNoticeDays);
  const [monthlyBasic, setMonthlyBasic] = useState(DEFAULTS.monthlyBasic);
  const [monthlyGross, setMonthlyGross] = useState(DEFAULTS.monthlyGross);
  const [monthlyCtc, setMonthlyCtc] = useState(DEFAULTS.monthlyCtc);
  const [recoveryBasis, setRecoveryBasis] = useState(DEFAULTS.recoveryBasis);
  const [dayBasis, setDayBasis] = useState(DEFAULTS.dayBasis);
  const [leaveBalanceDays, setLeaveBalanceDays] = useState(DEFAULTS.leaveBalanceDays);
  const [leaveOffsetsShortfall, setLeaveOffsetsShortfall] = useState(
    DEFAULTS.leaveOffsetsShortfall,
  );
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      planNoticePeriod({
        resignationDate,
        contractNoticeDays: num(contractNoticeDays),
        servedNoticeDays: num(servedNoticeDays),
        monthlyBasic: num(monthlyBasic),
        monthlyGross: num(monthlyGross),
        monthlyCtc: num(monthlyCtc),
        recoveryBasis,
        dayBasis,
        leaveBalanceDays: num(leaveBalanceDays),
        leaveOffsetsShortfall,
      }),
    [
      resignationDate,
      contractNoticeDays,
      servedNoticeDays,
      monthlyBasic,
      monthlyGross,
      monthlyCtc,
      recoveryBasis,
      dayBasis,
      leaveBalanceDays,
      leaveOffsetsShortfall,
    ],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return noticePlanMarkdown(result, {
      resignationDate,
      contractNoticeDays,
      servedNoticeDays,
    });
  }, [hasError, result, resignationDate, contractNoticeDays, servedNoticeDays]);

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
    setResignationDate(DEFAULTS.resignationDate);
    setContractNoticeDays(DEFAULTS.contractNoticeDays);
    setServedNoticeDays(DEFAULTS.servedNoticeDays);
    setMonthlyBasic(DEFAULTS.monthlyBasic);
    setMonthlyGross(DEFAULTS.monthlyGross);
    setMonthlyCtc(DEFAULTS.monthlyCtc);
    setRecoveryBasis(DEFAULTS.recoveryBasis);
    setDayBasis(DEFAULTS.dayBasis);
    setLeaveBalanceDays(DEFAULTS.leaveBalanceDays);
    setLeaveOffsetsShortfall(DEFAULTS.leaveOffsetsShortfall);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Full-notice last working day", DASH],
        ["Notice shortfall", DASH],
        ["Buyout (notice recovery)", DASH],
        ["Leave encashment", DASH],
        ["Net full-and-final impact", DASH],
      ]
    : [
        [
          "Full-notice last working day",
          `${result.fullNoticeLwd} (${result.fullNoticeLwdDay})`,
        ],
        [
          "Notice shortfall",
          `${NUM.format(result.shortfallDays)} days (${NUM.format(result.chargeableShortfallDays)} chargeable)`,
        ],
        ["Recovery per day", money(result.recoveryPerDay)],
        ["Buyout (notice recovery)", money(result.grossRecovery)],
        ["GST on recovery", money(result.gstOnRecovery)],
        [
          "Leave used to offset shortfall",
          `${NUM.format(result.leaveDaysUsedForOffset)} days (worth ${money(result.leaveOffsetValue)})`,
        ],
        [
          "Leave encashment",
          `${NUM.format(result.leaveDaysEncashed)} days = ${money(result.leaveEncashment)}`,
        ],
        ["Net full-and-final impact", money(result.netSettlement)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Briefcase className="h-4 w-4" aria-hidden="true" />
          India tech careers
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Dev Notice Period Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Plan an Indian notice period end to end: last working day, shortfall buyout at your
          contract&apos;s per-day rate, leave offset and encashment, plus a dated handover
          schedule. Notice recovery attracts no GST (CBIC Circular 178/10/2022-GST).
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="np-date">
              Resignation date
            </label>
            <input
              id="np-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={resignationDate}
              onChange={(event) => setResignationDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="np-contract">
              Contractual notice (days, 0–{MAX_NOTICE_DAYS})
            </label>
            <input
              id="np-contract"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_NOTICE_DAYS}
              value={contractNoticeDays}
              onChange={(event) => setContractNoticeDays(event.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {COMMON_NOTICE_DAYS.map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setContractNoticeDays(String(days))}
                  aria-label={`Set contractual notice to ${days} days`}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="np-served">
              Days you will actually serve
            </label>
            <input
              id="np-served"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_NOTICE_DAYS}
              value={servedNoticeDays}
              onChange={(event) => setServedNoticeDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="np-leave">
              Earned leave balance (days)
            </label>
            <input
              id="np-leave"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="365"
              value={leaveBalanceDays}
              onChange={(event) => setLeaveBalanceDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="np-basic">
              Monthly basic salary (INR)
            </label>
            <input
              id="np-basic"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={monthlyBasic}
              onChange={(event) => setMonthlyBasic(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="np-gross">
              Monthly gross salary (INR)
            </label>
            <input
              id="np-gross"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={monthlyGross}
              onChange={(event) => setMonthlyGross(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="np-ctc">
              Monthly CTC (INR)
            </label>
            <input
              id="np-ctc"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={monthlyCtc}
              onChange={(event) => setMonthlyCtc(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="np-recovery-basis">
              Recovery charged on
            </label>
            <select
              id="np-recovery-basis"
              className={`mt-2 ${INPUT_CLASS}`}
              value={recoveryBasis}
              onChange={(event) => setRecoveryBasis(event.target.value)}
            >
              {RECOVERY_BASIS_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Read your appointment letter — basic is the most common.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="np-day-basis">
              Per-day pay derived as
            </label>
            <select
              id="np-day-basis"
              className={`mt-2 ${INPUT_CLASS}`}
              value={dayBasis}
              onChange={(event) => setDayBasis(event.target.value)}
            >
              {DAY_BASIS_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
          htmlFor="np-offset"
        >
          <input
            id="np-offset"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={leaveOffsetsShortfall}
            onChange={(event) => setLeaveOffsetsShortfall(event.target.checked)}
          />
          My employer lets earned leave offset the notice shortfall (check your HR policy)
        </label>
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
              Your last working day
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.actualLwd}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `A ${result.actualLwdDay}, after serving ${servedNoticeDays} of ${contractNoticeDays} contractual days.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the notice period plan as Markdown"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Handover schedule</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Phase</th>
                <th scope="col" className="py-2 pr-3 font-semibold">From</th>
                <th scope="col" className="py-2 pr-3 font-semibold">To</th>
                <th scope="col" className="py-2 text-right font-semibold">Days</th>
              </tr>
            </thead>
            <tbody>
              {hasError || result.handover.length === 0 ? (
                <tr>
                  <td className="py-2 pr-3">{DASH}</td>
                  <td className="py-2 pr-3">{DASH}</td>
                  <td className="py-2 pr-3">{DASH}</td>
                  <td className="py-2 text-right">{DASH}</td>
                </tr>
              ) : (
                result.handover.map((phase) => (
                  <tr key={phase.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{phase.label}</td>
                    <td className="py-2 pr-3">{phase.start}</td>
                    <td className="py-2 pr-3">{phase.end}</td>
                    <td className="py-2 text-right">{NUM.format(phase.days)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Notice length, recovery basis and leave offset all come
        from your employment contract and HR policy, not statute — verify the final
        full-and-final statement with HR before signing off.
      </p>
    </main>
  );
}
