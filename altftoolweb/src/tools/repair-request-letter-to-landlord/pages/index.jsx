"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Trash2, Wrench } from "lucide-react";

import {
  ISSUE_CATALOG,
  SEVERITY_LEVELS,
  buildRepairLetter,
  computeRepairRequest,
  formatLongDate,
  formatMoney,
  parseISODate,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const SMALL_LABEL = "block text-xs font-semibold text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const todayISO = () => new Date().toISOString().slice(0, 10);

const shiftISO = (iso, days) => {
  const date = parseISODate(iso);
  if (!date) return iso;
  return new Date(date.getTime() + days * 86400000).toISOString().slice(0, 10);
};

const buildDefaultIssues = () => {
  const today = todayISO();
  return [
    {
      id: 1,
      description: "Seepage on the bedroom ceiling after rain",
      party: "landlord",
      severity: "major",
      reportedDate: shiftISO(today, -37),
    },
    {
      id: 2,
      description: "No water supply from the overhead tank",
      party: "landlord",
      severity: "urgent",
      reportedDate: shiftISO(today, -3),
    },
    {
      id: 3,
      description: "Choked wash basin drain",
      party: "tenant",
      severity: "minor",
      reportedDate: shiftISO(today, -10),
    },
  ];
};

const buildDefaults = () => ({
  monthlyRent: "30000",
  noticeDate: todayISO(),
  responseDays: "15",
  tenantName: "",
  landlordName: "",
  propertyAddress: "",
  contact: "",
  accessWindow: "",
});

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(buildDefaults);
  const [issues, setIssues] = useState(buildDefaultIssues);
  const [copied, setCopied] = useState("");

  const set = (key) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied("");
  };

  const updateIssue = (id, key, value) => {
    setIssues((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
    setCopied("");
  };

  const addIssue = (preset) => {
    setIssues((prev) => {
      const nextId = prev.reduce((max, row) => Math.max(max, row.id), 0) + 1;
      return [
        ...prev,
        {
          id: nextId,
          description: preset ? preset.label : "",
          party: preset ? preset.party : "landlord",
          severity: "major",
          reportedDate: form.noticeDate,
        },
      ];
    });
    setCopied("");
  };

  const removeIssue = (id) => {
    setIssues((prev) => prev.filter((row) => row.id !== id));
    setCopied("");
  };

  const result = useMemo(
    () =>
      computeRepairRequest({
        issues,
        monthlyRent: toNumber(form.monthlyRent),
        noticeDate: form.noticeDate,
        responseDays: toNumber(form.responseDays),
      }),
    [issues, form.monthlyRent, form.noticeDate, form.responseDays],
  );

  const letter = useMemo(
    () =>
      buildRepairLetter(result, {
        tenantName: form.tenantName.trim() || "[Tenant name]",
        landlordName: form.landlordName.trim() || "[Landlord name]",
        propertyAddress: form.propertyAddress.trim() || "[Property address]",
        contact: form.contact,
        accessWindow: form.accessWindow,
      }),
    [result, form],
  );

  const invalid = Boolean(result.error);

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

  const summary = invalid
    ? ""
    : [
        "Repair request",
        `Letter dated: ${formatLongDate(parseISODate(result.noticeDate))}`,
        `Landlord's repairs: ${result.landlordItems.length}`,
        `Tenant's repairs: ${result.tenantItems.length}`,
        `Urgent items: ${result.urgentCount}`,
        `Oldest item outstanding: ${result.oldestOutstandingDays} days`,
        `Deadline: ${formatLongDate(parseISODate(result.deadlineDate))}`,
        `Rent deduction ceiling: ${formatMoney(result.maxMonthlyDeduction)}`,
      ].join("\n");

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Wrench className="h-4 w-4" aria-hidden="true" />
          Tenancy notice
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Repair Request Letter to Landlord
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Log every pending fault with the date you first reported it, see which side of the Model
          Tenancy Act&rsquo;s repair split it falls on, and send a dated request with a deadline.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Tenancy details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-rent">
              Monthly rent (INR)
            </label>
            <input
              id="rr-rent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={form.monthlyRent}
              onChange={set("monthlyRent")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-response">
              Days for the landlord to act
            </label>
            <input
              id="rr-response"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="90"
              step="1"
              value={form.responseDays}
              onChange={set("responseDays")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-date">
              Date of this letter
            </label>
            <input
              id="rr-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.noticeDate}
              onChange={set("noticeDate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-access">
              Access window (optional)
            </label>
            <input
              id="rr-access"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.accessWindow}
              onChange={set("accessWindow")}
              placeholder="Weekdays after 6 pm, Sundays any time"
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Repair log</h2>
          <button type="button" onClick={() => addIssue(null)} className={GHOST_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add issue
          </button>
        </div>

        <ul className="mt-4 space-y-4">
          {issues.map((row, index) => (
            <li key={row.id} className="rounded-lg border border-[var(--border)] p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                  Issue {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => removeIssue(row.id)}
                  aria-label={`Remove issue ${index + 1}`}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[var(--danger)] transition hover:bg-[var(--danger-soft)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-2">
                <label className={SMALL_LABEL} htmlFor={`rr-desc-${row.id}`}>
                  What is wrong
                </label>
                <input
                  id={`rr-desc-${row.id}`}
                  className={`mt-1 ${INPUT_CLASS}`}
                  type="text"
                  value={row.description}
                  onChange={(event) => updateIssue(row.id, "description", event.target.value)}
                  placeholder="Leaking pipe under the kitchen sink"
                />
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div>
                  <label className={SMALL_LABEL} htmlFor={`rr-party-${row.id}`}>
                    Responsibility
                  </label>
                  <select
                    id={`rr-party-${row.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    value={row.party}
                    onChange={(event) => updateIssue(row.id, "party", event.target.value)}
                  >
                    <option value="landlord">Landlord</option>
                    <option value="tenant">Tenant</option>
                  </select>
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`rr-sev-${row.id}`}>
                    Severity
                  </label>
                  <select
                    id={`rr-sev-${row.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    value={row.severity}
                    onChange={(event) => updateIssue(row.id, "severity", event.target.value)}
                  >
                    {SEVERITY_LEVELS.map((level) => (
                      <option key={level.id} value={level.id}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`rr-reported-${row.id}`}>
                    First reported on
                  </label>
                  <input
                    id={`rr-reported-${row.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="date"
                    value={row.reportedDate}
                    onChange={(event) => updateIssue(row.id, "reportedDate", event.target.value)}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
          Add a common fault
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {ISSUE_CATALOG.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => addIssue(preset)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-left text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      {invalid ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Repairs the landlord must do
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {invalid ? DASH : result.landlordItems.length}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {invalid
                ? "Fix the highlighted input to see the log."
                : `Deadline ${formatLongDate(parseISODate(result.deadlineDate))}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy(summary, "summary")}
              aria-label="Copy the repair log summary"
              className={GHOST_BTN}
              disabled={invalid}
            >
              {copied === "summary" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "summary" ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={() => {
                if (
                  !window.confirm(
                    "Reset everything? This clears the repair log and all saved details.",
                  )
                ) {
                  return;
                }
                setForm(buildDefaults());
                setIssues(buildDefaultIssues());
                setCopied("");
              }}
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
            ["Items you must handle as tenant", invalid ? DASH : result.tenantItems.length],
            ["Urgent items", invalid ? DASH : result.urgentCount],
            [
              "Oldest unresolved complaint",
              invalid ? DASH : `${result.oldestOutstandingDays} days`,
            ],
            [
              "Priority deadline",
              invalid ? DASH : formatLongDate(parseISODate(result.priorityDeadlineDate)),
            ],
            ["Overall deadline", invalid ? DASH : formatLongDate(parseISODate(result.deadlineDate))],
            [
              "Maximum rent set-off in a month",
              invalid
                ? DASH
                : `${formatMoney(result.maxMonthlyDeduction)} (${result.deductionCapPercent}% of rent)`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!invalid && result.rows.length > 0 && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Fault</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Whose</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Open days</th>
                  <th scope="col" className="py-2 text-right font-semibold">Attend by</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.description} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{row.description}</td>
                    <td className="py-2 pr-3 capitalize text-[var(--muted-foreground)]">{row.party}</td>
                    <td className="py-2 pr-3 text-right">
                      {row.outstandingDays === null ? DASH : row.outstandingDays}
                    </td>
                    <td className="py-2 text-right">
                      {row.party === "landlord" ? formatLongDate(parseISODate(row.dueDate)) : DASH}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Parties and premises</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-tenant">
              Your name (tenant)
            </label>
            <input
              id="rr-tenant"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.tenantName}
              onChange={set("tenantName")}
              placeholder="A. Verma"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-landlord">
              Landlord name
            </label>
            <input
              id="rr-landlord"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.landlordName}
              onChange={set("landlordName")}
              placeholder="R. Sharma"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rr-address">
              Premises address
            </label>
            <input
              id="rr-address"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.propertyAddress}
              onChange={set("propertyAddress")}
              placeholder="Flat 4B, Green Acres, Pune 411045"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rr-contact">
              Your contact
            </label>
            <input
              id="rr-contact"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.contact}
              onChange={set("contact")}
              placeholder="98xxxxxx01 / name@example.com"
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Request letter</h2>
          <button
            type="button"
            onClick={() => copy(letter, "letter")}
            aria-label="Copy the repair request letter"
            className={GHOST_BTN}
            disabled={invalid}
          >
            {copied === "letter" ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied === "letter" ? "Copied!" : "Copy letter"}
          </button>
        </div>
        <label className="sr-only" htmlFor="rr-letter">
          Generated repair request letter
        </label>
        <textarea
          id="rr-letter"
          className={`mt-3 ${AREA_CLASS} min-h-[24rem] font-mono text-xs leading-5`}
          value={invalid ? "" : letter}
          readOnly
        />
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. The Model Tenancy Act, 2021 is adopted State by State
        with changes, and your agreement may allocate repairs differently — take advice before
        withholding rent or deducting repair costs.
      </p>
    </main>
  );
}
