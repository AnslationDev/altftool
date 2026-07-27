"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  MAX_CARRY_FORWARD_ADULT,
  QUALIFYING_DAYS,
  WORKER_TYPES,
  buildLeaveRegister,
  registerToCsv,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const days = (value) => (Number.isFinite(value) ? `${NUM.format(value)} days` : "—");
const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_LEAVE = [
  { id: 1, from: "2026-03-02", to: "2026-03-06", daysTaken: "5", remark: "Family function" },
  { id: 2, from: "2026-06-15", to: "2026-06-19", daysTaken: "5", remark: "Annual leave" },
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
  const [year, setYear] = useState("2026");
  const [workerType, setWorkerType] = useState("adult");
  const [daysWorked, setDaysWorked] = useState("260");
  const [joinedMidYear, setJoinedMidYear] = useState(false);
  const [daysInRemainder, setDaysInRemainder] = useState("180");
  const [broughtForward, setBroughtForward] = useState("8");
  const [refused, setRefused] = useState("0");
  const [averageDailyWage, setAverageDailyWage] = useState("900");
  const [leaveRows, setLeaveRows] = useState(DEFAULT_LEAVE);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildLeaveRegister({
        daysWorked: toNumber(daysWorked),
        workerType,
        joinedMidYear,
        daysInRemainder: toNumber(daysInRemainder),
        broughtForward: toNumber(broughtForward),
        refusedLeaveCarried: toNumber(refused),
        averageDailyWage: toNumber(averageDailyWage),
        availed: leaveRows.map((row) => ({
          from: row.from,
          to: row.to,
          days: toNumber(row.daysTaken),
          remark: row.remark,
        })),
      }),
    [
      daysWorked,
      workerType,
      joinedMidYear,
      daysInRemainder,
      broughtForward,
      refused,
      averageDailyWage,
      leaveRows,
    ],
  );

  const failed = Boolean(result.error);

  const csv = useMemo(
    () => (failed ? "" : registerToCsv(result, { employer, worker, year })),
    [result, failed, employer, worker, year],
  );

  const updateRow = (id, field, value) => {
    setLeaveRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const addRow = () => {
    setLeaveRows((current) => {
      const nextId = current.reduce((max, row) => Math.max(max, row.id), 0) + 1;
      return [...current, { id: nextId, from: "", to: "", daysTaken: "1", remark: "" }];
    });
  };

  const removeRow = (id) => {
    setLeaveRows((current) => current.filter((row) => row.id !== id));
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
    setYear("2026");
    setWorkerType("adult");
    setDaysWorked("260");
    setJoinedMidYear(false);
    setDaysInRemainder("180");
    setBroughtForward("8");
    setRefused("0");
    setAverageDailyWage("900");
    setLeaveRows(DEFAULT_LEAVE);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          Labour compliance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Leave Register Format Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Earns leave at one day for every 20 days worked as section 79 of the Factories Act 1948
          prescribes, applies the 30-day carry-forward cap, and lays out entitlement, leave availed
          and the running balance in the register format an inspector expects.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Worker and attendance</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lr-employer">
              Establishment name
            </label>
            <input
              id="lr-employer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={employer}
              onChange={(event) => setEmployer(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lr-worker">
              Worker name
            </label>
            <input
              id="lr-worker"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="Full name as in the muster roll"
              value={worker}
              onChange={(event) => setWorker(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lr-year">
              Calendar year
            </label>
            <input
              id="lr-year"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              inputMode="numeric"
              value={year}
              onChange={(event) => setYear(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lr-type">
              Worker category
            </label>
            <select
              id="lr-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={workerType}
              onChange={(event) => setWorkerType(event.target.value)}
            >
              {WORKER_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lr-days">
              Days actually worked in the year
            </label>
            <input
              id="lr-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="366"
              step="1"
              value={daysWorked}
              onChange={(event) => setDaysWorked(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lr-bf">
              Leave brought forward (days)
            </label>
            <input
              id="lr-bf"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="365"
              step="0.5"
              value={broughtForward}
              onChange={(event) => setBroughtForward(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lr-refused">
              Refused leave carried over (days)
            </label>
            <input
              id="lr-refused"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="365"
              step="0.5"
              value={refused}
              onChange={(event) => setRefused(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Leave the employer refused carries over beyond the {MAX_CARRY_FORWARD_ADULT}-day cap.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lr-wage">
              Average daily wage (INR)
            </label>
            <input
              id="lr-wage"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={averageDailyWage}
              onChange={(event) => setAverageDailyWage(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
          <label className="flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="lr-mid">
            <input
              id="lr-mid"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={joinedMidYear}
              onChange={(event) => setJoinedMidYear(event.target.checked)}
            />
            Worker joined part-way through the year
          </label>
          {joinedMidYear ? (
            <div className="mt-3">
              <label className={LABEL_CLASS} htmlFor="lr-remainder">
                Calendar days left in the year on the joining date
              </label>
              <input
                id="lr-remainder"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="1"
                max="366"
                step="1"
                value={daysInRemainder}
                onChange={(event) => setDaysInRemainder(event.target.value)}
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Section 79(2) asks for two-thirds of these days instead of the usual{" "}
                {QUALIFYING_DAYS}-day test.
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Leave availed</h2>
          <button type="button" onClick={addRow} className={GHOST_BTN} aria-label="Add a leave spell">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add spell
          </button>
        </div>

        {leaveRows.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            No leave recorded yet — the whole credit is still open.
          </p>
        ) : (
          <div className="mt-4 grid gap-4">
            {leaveRows.map((row, index) => (
              <div
                key={row.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Spell {index + 1}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    aria-label={`Remove leave spell ${index + 1}`}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[var(--muted-foreground)] transition hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-2 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`lr-from-${row.id}`}>
                      Leave from
                    </label>
                    <input
                      id={`lr-from-${row.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="date"
                      value={row.from}
                      onChange={(event) => updateRow(row.id, "from", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`lr-to-${row.id}`}>
                      Leave to
                    </label>
                    <input
                      id={`lr-to-${row.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="date"
                      value={row.to}
                      onChange={(event) => updateRow(row.id, "to", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`lr-days-${row.id}`}>
                      Days debited
                    </label>
                    <input
                      id={`lr-days-${row.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="decimal"
                      min="0.5"
                      step="0.5"
                      value={row.daysTaken}
                      onChange={(event) => updateRow(row.id, "daysTaken", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`lr-remark-${row.id}`}>
                      Remark
                    </label>
                    <input
                      id={`lr-remark-${row.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="text"
                      value={row.remark}
                      onChange={(event) => updateRow(row.id, "remark", event.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
              Leave balance at close
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? "—" : days(result.totals.closingBalance)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the highlighted problem to build the register."
                : `${days(result.totalCredit)} credited, ${days(result.totals.availed)} availed`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyCsv}
              disabled={failed}
              aria-label="Copy the leave register as CSV"
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
            [
              "Qualifying test",
              failed ? "—" : `${result.entitlement.qualifies ? "Met" : "Not met"} — ${result.entitlement.reason}`,
            ],
            ["Leave earned this year", failed ? "—" : days(result.earnedDays)],
            ["Opening balance (after cap)", failed ? "—" : days(result.openingBalance)],
            ["Total credit", failed ? "—" : days(result.totalCredit)],
            ["Leave availed", failed ? "—" : days(result.totals.availed)],
            ["Carried to next year", failed ? "—" : days(result.totals.carryToNextYear)],
            ["Balance lapsing", failed ? "—" : days(result.totals.lapsing)],
            ["Value of the balance at average daily wage", failed ? "—" : money(result.totals.encashmentValue)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
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

      {!failed && result.rows.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Register preview</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  {["S. No.", "From", "To", "Days", "Balance after", "Remark"].map((column) => (
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
                    <td className="py-2 pr-3 whitespace-nowrap">{row.from || "—"}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{row.to || "—"}</td>
                    <td className="py-2 pr-3 font-semibold">{NUM.format(row.days)}</td>
                    <td
                      className={`py-2 pr-3 font-semibold ${
                        row.overdrawn ? "text-[var(--danger)]" : "text-[var(--foreground)]"
                      }`}
                    >
                      {NUM.format(row.balanceAfter)}
                    </td>
                    <td className="py-2 text-[var(--muted-foreground)]">{row.remark || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational format only. Shops and establishments Acts, state factory rules and company
        policy often grant more leave than the Factories Act minimum and use their own register
        form — check the rules that apply to you or ask a labour law adviser before filing.
      </p>
    </main>
  );
}
