"use client";

import { useMemo, useState } from "react";
import { Check, Copy, LogOut, RotateCcw } from "lucide-react";

import {
  NOTICE_UNITS,
  WEEK_PATTERNS,
  buildResignationLetter,
  computeNoticeSchedule,
  formatLongDate,
  formatShortDate,
} from "../lib";

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA =
  "mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const REASON_TONES = [
  { id: "growth", label: "New role / career growth" },
  { id: "neutral", label: "New opportunity (neutral)" },
  { id: "relocation", label: "Relocation" },
  { id: "study", label: "Returning to study" },
  { id: "personal", label: "Personal reasons (unspecified)" },
  { id: "none", label: "Give no reason at all" },
];

const DEFAULTS = {
  employeeName: "Priya Nair",
  employeeId: "EMP-4821",
  designation: "Senior Analyst",
  department: "Risk",
  managerName: "Mr. A. Verma",
  companyName: "Northbridge Services Pvt. Ltd.",
  companyAddress: "Andheri East, Mumbai 400069",
  resignationDate: "2026-08-05",
  noticeValue: "2",
  noticeUnit: "months",
  leaveAdjustDays: "0",
  buyoutDays: "0",
  weekPattern: "5",
  reasonTone: "growth",
  handoverTo: "Karan Mehta",
  personalEmail: "priya.nair@example.com",
  personalPhone: "98xxxxxx77",
  gratitudeNote: "",
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState("");

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const schedule = useMemo(
    () =>
      computeNoticeSchedule({
        resignationDateISO: form.resignationDate,
        noticeValue: toNumber(form.noticeValue),
        noticeUnit: form.noticeUnit,
        leaveAdjustDays: toNumber(form.leaveAdjustDays) || 0,
        buyoutDays: toNumber(form.buyoutDays) || 0,
        weekPattern: form.weekPattern,
      }),
    [
      form.resignationDate,
      form.noticeValue,
      form.noticeUnit,
      form.leaveAdjustDays,
      form.buyoutDays,
      form.weekPattern,
    ],
  );

  const letter = useMemo(
    () =>
      buildResignationLetter({
        employeeName: form.employeeName,
        employeeId: form.employeeId,
        designation: form.designation,
        department: form.department,
        managerName: form.managerName,
        companyName: form.companyName,
        companyAddress: form.companyAddress,
        resignationDateISO: form.resignationDate,
        schedule,
        reasonTone: form.reasonTone,
        handoverTo: form.handoverTo,
        personalEmail: form.personalEmail,
        personalPhone: form.personalPhone,
        gratitudeNote: form.gratitudeNote,
      }),
    [form, schedule],
  );

  const error = schedule.error || letter.error || "";

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
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Exit documents
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Resignation Letter Generator by Notice Period
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the date you are resigning and the notice your contract requires. The tool adds
          calendar months correctly, subtracts leave adjusted against notice and any bought-out days,
          and writes the letter around the resulting last working day.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Notice period</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="resignation-date">Date you submit the resignation</label>
            <input id="resignation-date" className={INPUT} type="date" value={form.resignationDate} onChange={set("resignationDate")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="week-pattern">Your working week</label>
            <select id="week-pattern" className={INPUT} value={form.weekPattern} onChange={set("weekPattern")}>
              {WEEK_PATTERNS.map((pattern) => (
                <option key={pattern.id} value={pattern.id}>{pattern.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="notice-value">Notice period in the contract</label>
            <input id="notice-value" className={INPUT} type="number" inputMode="decimal" min="0" step="1"
              value={form.noticeValue} onChange={set("noticeValue")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="notice-unit">Notice unit</label>
            <select id="notice-unit" className={INPUT} value={form.noticeUnit} onChange={set("noticeUnit")}>
              {NOTICE_UNITS.map((unit) => (
                <option key={unit.id} value={unit.id}>{unit.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="leave-days">Leave adjusted against notice (days)</label>
            <input id="leave-days" className={INPUT} type="number" inputMode="decimal" min="0" step="1"
              value={form.leaveAdjustDays} onChange={set("leaveAdjustDays")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="buyout-days">Days you want bought out or waived</label>
            <input id="buyout-days" className={INPUT} type="number" inputMode="decimal" min="0" step="1"
              value={form.buyoutDays} onChange={set("buyoutDays")} />
          </div>
        </div>
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
              Your last working day
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {error ? "—" : formatLongDate(schedule.lastWorkingDayISO)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error
                ? "Fix the notice inputs above."
                : `${schedule.servedDays} calendar days from today, about ${schedule.workingDaysServed} working days`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={GHOST_BTN} aria-label="Copy the notice period dates"
              onClick={() =>
                copy(
                  error
                    ? ""
                    : [
                        "Notice period plan",
                        `Resignation submitted: ${formatShortDate(form.resignationDate)}`,
                        `Notice ends per contract: ${formatShortDate(schedule.contractualEndISO)}`,
                        `Last working day: ${formatShortDate(schedule.lastWorkingDayISO)}`,
                        `Days served: ${schedule.servedDays} calendar / ${schedule.workingDaysServed} working`,
                        `Shortfall requested: ${schedule.reductionDays} days`,
                      ].join("\n"),
                  "dates",
                )
              }
            >
              {copied === "dates" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied === "dates" ? "Copied!" : "Copy dates"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Notice starts", error ? "—" : formatShortDate(schedule.noticeStartISO)],
            ["Full notice would end on", error ? "—" : formatShortDate(schedule.contractualEndISO)],
            ["Contractual notice length", error ? "—" : `${schedule.contractualDays} calendar days`],
            ["Leave adjusted against notice", error ? "—" : `${schedule.leaveAdjustDays} days`],
            ["Days bought out or waived", error ? "—" : `${schedule.buyoutDays} days`],
            ["Notice actually served", error ? "—" : `${schedule.servedDays} calendar days`],
            ["Working days available for handover", error ? "—" : `${schedule.workingDaysServed} days`],
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
          <h2 className="text-base font-semibold">Suggested handover schedule</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Phase</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Dates</th>
                  <th scope="col" className="py-2 font-semibold">Focus</th>
                </tr>
              </thead>
              <tbody>
                {schedule.milestones.map((phase) => (
                  <tr key={phase.key} className="border-b border-[var(--border)] align-top last:border-0">
                    <td className="py-2 pr-3 font-semibold">{phase.title}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {formatShortDate(phase.startISO)} – {formatShortDate(phase.endISO)}
                    </td>
                    <td className="py-2 text-[var(--muted-foreground)]">{phase.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Letter details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
            <label className={LABEL} htmlFor="department">Department / team</label>
            <input id="department" className={INPUT} value={form.department} onChange={set("department")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="manager-name">Addressed to (manager / HR)</label>
            <input id="manager-name" className={INPUT} value={form.managerName} onChange={set("managerName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="company-name">Company name</label>
            <input id="company-name" className={INPUT} value={form.companyName} onChange={set("companyName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="company-address">Company address</label>
            <input id="company-address" className={INPUT} value={form.companyAddress} onChange={set("companyAddress")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="handover-to">Handing over to (optional)</label>
            <input id="handover-to" className={INPUT} value={form.handoverTo} onChange={set("handoverTo")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="reason-tone">Reason stated in the letter</label>
            <select id="reason-tone" className={INPUT} value={form.reasonTone} onChange={set("reasonTone")}>
              {REASON_TONES.map((tone) => (
                <option key={tone.id} value={tone.id}>{tone.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="personal-email">Personal email</label>
            <input id="personal-email" className={INPUT} type="email" value={form.personalEmail} onChange={set("personalEmail")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="personal-phone">Personal phone</label>
            <input id="personal-phone" className={INPUT} value={form.personalPhone} onChange={set("personalPhone")} />
          </div>
        </div>
        <div className="mt-4">
          <label className={LABEL} htmlFor="gratitude">Closing note in your own words (optional)</label>
          <textarea id="gratitude" rows={3} className={AREA} value={form.gratitudeNote} onChange={set("gratitudeNote")}
            placeholder="Leave blank to use a neutral thank-you paragraph." />
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Your resignation letter</h2>
          <button type="button" className={PRIMARY_BTN} aria-label="Copy the resignation letter"
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
        Informational only, not legal or HR advice. Your notice length, leave-adjustment rules and
        buyout terms come from your appointment letter and the applicable state Shops and
        Establishments Act — confirm them with HR before you commit to a date in writing.
      </p>
    </main>
  );
}
