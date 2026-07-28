"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Handshake, RotateCcw } from "lucide-react";

import {
  GST_CIRCULAR,
  REASON_OPTIONS,
  SALARY_BASES,
  SALARY_DIVISORS,
  buildShortfallLetter,
  computeShortfall,
  formatLongDate,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : "—");

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA =
  "mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  employeeName: "Priya Nair",
  employeeId: "EMP-4821",
  designation: "Senior Analyst",
  department: "Risk",
  companyName: "Northbridge Services Pvt. Ltd.",
  addressee: "The Head of Human Resources",
  letterDate: "2026-08-12",
  resignationDate: "2026-08-05",
  proposedLastDay: "2026-09-19",
  noticeDays: "90",
  monthlySalary: "60000",
  salaryBasis: "basic",
  divisorId: "30",
  leaveBalanceDays: "12",
  offsetLeave: true,
  reasonId: "offer-deadline",
  reasonText: "",
  askScenarioId: "half",
  handoverPoints: "",
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState("");

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      computeShortfall({
        resignationDateISO: form.resignationDate,
        noticeDays: toNumber(form.noticeDays),
        proposedLastDayISO: form.proposedLastDay,
        monthlySalary: toNumber(form.monthlySalary),
        divisorId: form.divisorId,
        leaveBalanceDays: toNumber(form.leaveBalanceDays) || 0,
        offsetLeave: Boolean(form.offsetLeave),
      }),
    [
      form.resignationDate,
      form.noticeDays,
      form.proposedLastDay,
      form.monthlySalary,
      form.divisorId,
      form.leaveBalanceDays,
      form.offsetLeave,
    ],
  );

  const letter = useMemo(
    () =>
      buildShortfallLetter({
        employeeName: form.employeeName,
        employeeId: form.employeeId,
        designation: form.designation,
        department: form.department,
        companyName: form.companyName,
        addressee: form.addressee,
        letterDateISO: form.letterDate,
        resignationDateISO: form.resignationDate,
        proposedLastDayISO: form.proposedLastDay,
        noticeDays: toNumber(form.noticeDays),
        reasonId: form.reasonId,
        reasonText: form.reasonText,
        handoverPoints: form.handoverPoints,
        askScenarioId: form.askScenarioId,
        salaryBasisId: form.salaryBasis,
        result,
      }),
    [form, result],
  );

  const error = result.error || letter.error || "";

  const copy = async (text, key) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Handshake className="h-4 w-4" aria-hidden="true" />
          Exit documents
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Notice Period Shortfall Negotiation Letter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Price the days you will not serve at your contractual per-day rate, set your leave balance
          against them, compare the waiver options, and take the negotiation to HR in writing.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Dates and contract terms</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="resignation-date">Resignation date</label>
            <input id="resignation-date" className={INPUT} type="date" value={form.resignationDate} onChange={set("resignationDate")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="notice-days">Contractual notice (days)</label>
            <input id="notice-days" className={INPUT} type="number" inputMode="numeric" min="1" step="1"
              value={form.noticeDays} onChange={set("noticeDays")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="proposed-last-day">Last working day you want</label>
            <input id="proposed-last-day" className={INPUT} type="date" value={form.proposedLastDay} onChange={set("proposedLastDay")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="monthly-salary">Monthly salary used for recovery (INR)</label>
            <input id="monthly-salary" className={INPUT} type="number" inputMode="decimal" min="0" step="500"
              value={form.monthlySalary} onChange={set("monthlySalary")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="salary-basis">Which salary component</label>
            <select id="salary-basis" className={INPUT} value={form.salaryBasis} onChange={set("salaryBasis")}>
              {SALARY_BASES.map((basis) => (
                <option key={basis.id} value={basis.id}>{basis.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="divisor">Per-day divisor in the contract</label>
            <select id="divisor" className={INPUT} value={form.divisorId} onChange={set("divisorId")}>
              {SALARY_DIVISORS.map((divisor) => (
                <option key={divisor.id} value={divisor.id}>{divisor.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="leave-balance">Accrued leave balance (days)</label>
            <input id="leave-balance" className={INPUT} type="number" inputMode="decimal" min="0" step="0.5"
              value={form.leaveBalanceDays} onChange={set("leaveBalanceDays")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="ask-scenario">What you are asking for</label>
            <select id="ask-scenario" className={INPUT} value={form.askScenarioId} onChange={set("askScenarioId")}>
              <option value="full">Full waiver of the shortfall</option>
              <option value="half">Half waived, half settled</option>
              <option value="leave-only">Adjust against leave encashment</option>
              <option value="buyout">Buy out the shortfall in cash</option>
            </select>
          </div>
        </div>
        <label className="mt-4 flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="offset-leave">
          <input id="offset-leave" type="checkbox" className="h-5 w-5 accent-[var(--primary)]"
            checked={Boolean(form.offsetLeave)}
            onChange={(event) => setForm((prev) => ({ ...prev, offsetLeave: event.target.checked }))} />
          Set my leave encashment against the recovery
        </label>
      </section>

      {error ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Net amount at stake
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {error ? "—" : money(result.netPayable)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error
                ? "Fix the inputs above."
                : result.noShortfall
                  ? "No shortfall — you are serving the full notice period."
                  : `${result.shortfallDays} unserved days at ${money(result.perDaySalary)} per day, after leave adjustment`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={GHOST_BTN} aria-label="Copy the shortfall working"
              onClick={() =>
                copy(
                  error
                    ? ""
                    : [
                        "Notice period shortfall",
                        `Contractual last day: ${formatLongDate(result.contractualLastDayISO)}`,
                        `Proposed last day: ${formatLongDate(form.proposedLastDay)}`,
                        `Notice served: ${result.servedDays} days (${result.servedSharePct}%)`,
                        `Shortfall: ${result.shortfallDays} days`,
                        `Per-day rate: ${money(result.perDaySalary)}`,
                        `Value of shortfall: ${money(result.grossRecovery)}`,
                        `Leave adjusted: ${money(result.appliedLeaveCredit)}`,
                        `Net at stake: ${money(result.netPayable)}`,
                      ].join("\n"),
                  "working",
                )
              }
            >
              {copied === "working" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied === "working" ? "Copied!" : "Copy working"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Notice would end on", error ? "—" : formatLongDate(result.contractualLastDayISO)],
            ["Notice actually served", error ? "—" : `${result.servedDays} days (${num(result.servedSharePct)}%)`],
            ["Shortfall", error ? "—" : `${result.shortfallDays} days`],
            ["Per-day rate (salary ÷ " + (error ? "—" : result.divisorDays) + ")", error ? "—" : money(result.perDaySalary)],
            ["Value of the shortfall", error ? "—" : money(result.grossRecovery)],
            ["Leave encashment available", error ? "—" : money(result.leaveCredit)],
            ["Leave applied to the shortfall", error ? "—" : `${money(result.appliedLeaveCredit)} (${num(result.leaveDaysUsed)} days)`],
            ["Leave left to be paid out", error ? "—" : money(result.leaveLeftOver)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!error && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">What each landing point costs you</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Outcome</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Days waived</th>
                  <th scope="col" className="py-2 text-right font-semibold">Cash payable</th>
                </tr>
              </thead>
              <tbody>
                {result.scenarios.map((scenario) => (
                  <tr key={scenario.id} className="border-b border-[var(--border)] align-top last:border-0">
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{scenario.label}</span>
                      <span className="block text-xs text-[var(--muted-foreground)]">{scenario.note}</span>
                    </td>
                    <td className="py-2 pr-3 text-right whitespace-nowrap">{num(scenario.waivedDays)}</td>
                    <td className="py-2 text-right whitespace-nowrap font-semibold">{money(scenario.cashPayable)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">{GST_CIRCULAR} confirms no GST applies to notice pay recovery.</p>
        </section>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your case</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="reason-id">Reason for the early release</label>
            <select id="reason-id" className={INPUT} value={form.reasonId} onChange={set("reasonId")}>
              {REASON_OPTIONS.map((reason) => (
                <option key={reason.id} value={reason.id}>{reason.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="addressee">Addressed to</label>
            <input id="addressee" className={INPUT} value={form.addressee} onChange={set("addressee")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="employee-name">Your name</label>
            <input id="employee-name" className={INPUT} value={form.employeeName} onChange={set("employeeName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="employee-id">Employee ID</label>
            <input id="employee-id" className={INPUT} value={form.employeeId} onChange={set("employeeId")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="designation">Designation</label>
            <input id="designation" className={INPUT} value={form.designation} onChange={set("designation")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="department">Department</label>
            <input id="department" className={INPUT} value={form.department} onChange={set("department")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="company-name">Company name</label>
            <input id="company-name" className={INPUT} value={form.companyName} onChange={set("companyName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="letter-date">Letter date</label>
            <input id="letter-date" className={INPUT} type="date" value={form.letterDate} onChange={set("letterDate")} />
          </div>
        </div>
        <div className="mt-4">
          <label className={LABEL} htmlFor="reason-text">Reason in your own words (optional)</label>
          <textarea id="reason-text" rows={2} className={AREA} value={form.reasonText} onChange={set("reasonText")}
            placeholder="Leave blank to use the wording for the reason selected above." />
        </div>
        <div className="mt-4">
          <label className={LABEL} htmlFor="handover-points">Handover points, one per line (optional)</label>
          <textarea id="handover-points" rows={4} className={AREA} value={form.handoverPoints} onChange={set("handoverPoints")}
            placeholder={"Runbooks written for all three pipelines\nTwo shadow sessions done with the successor\nClient introductions completed"} />
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Your negotiation letter</h2>
          <button type="button" className={PRIMARY_BTN} aria-label="Copy the negotiation letter"
            onClick={() => copy(letter.error ? "" : letter.body, "letter")}>
            {copied === "letter" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied === "letter" ? "Copied!" : "Copy letter"}
          </button>
        </div>
        {letter.error ? (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {letter.error}
          </p>
        ) : (
          <>
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">{letter.wordCount} words</p>
            <pre className="mt-3 max-h-[28rem] overflow-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6 whitespace-pre-wrap text-[var(--foreground)]">
              {letter.body}
            </pre>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal or tax advice. The salary component, divisor and leave set-off
        rules come from your appointment letter and company policy; income-tax treatment of recovered
        notice pay is contested, so ask a chartered accountant before relying on any deduction.
      </p>
    </main>
  );
}
