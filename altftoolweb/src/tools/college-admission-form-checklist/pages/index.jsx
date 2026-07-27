"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, School, Trash2 } from "lucide-react";

import {
  FEE_STEPS,
  addDays,
  buildDocumentList,
  computeReadiness,
  computeUgcRefund,
  summariseApplications,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const SMALL_LABEL = "block text-xs font-medium text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm";

const CLAIM_OPTIONS = [
  { key: "category", label: "Claiming a reserved category seat" },
  { key: "feeConcession", label: "Claiming a fee concession or EWS" },
  { key: "pwd", label: "Claiming under the PwD quota" },
  { key: "stateQuota", label: "Applying for a state quota seat" },
  { key: "gapYear", label: "There is a gap between school and this admission" },
];

const DEFAULT_CLAIMS = {
  category: false,
  feeConcession: false,
  pwd: false,
  stateQuota: false,
  gapYear: false,
};

const ANCHOR_TODAY = "2026-07-26";

function todayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function seedApplications(today) {
  return [
    { id: "app-1", name: "Central university, CUET counselling", deadline: addDays(today, 6), fee: "1000" },
    { id: "app-2", name: "State engineering college", deadline: addDays(today, 14), fee: "1500" },
    { id: "app-3", name: "Private university, direct form", deadline: addDays(today, 25), fee: "1200" },
  ];
}

const STATUS_STYLE = {
  passed: "text-[var(--muted-foreground)]",
  urgent: "text-[var(--danger)]",
  open: "text-[var(--success)]",
  unset: "text-[var(--muted-foreground)]",
};

export default function ToolHome() {
  const [today, setToday] = useState(ANCHOR_TODAY);
  const [applications, setApplications] = useState(() => seedApplications(ANCHOR_TODAY));
  const [claims, setClaims] = useState(DEFAULT_CLAIMS);
  const [haveIds, setHaveIds] = useState([]);
  const [feePaid, setFeePaid] = useState("120000");
  const [lastDateOfAdmission, setLastDateOfAdmission] = useState(addDays(ANCHOR_TODAY, 40));
  const [withdrawalDate, setWithdrawalDate] = useState(addDays(ANCHOR_TODAY, 20));
  const [copied, setCopied] = useState(false);

  // Move the calendar onto the visitor's own clock after hydration, never during render.
  useEffect(() => {
    const now = todayISO();
    setToday(now);
    setApplications(seedApplications(now));
    setLastDateOfAdmission(addDays(now, 40));
    setWithdrawalDate(addDays(now, 20));
  }, []);

  const toggleClaim = (key) => setClaims((current) => ({ ...current, [key]: !current[key] }));
  const toggleHave = (id) =>
    setHaveIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );

  const updateApplication = (id, field, value) =>
    setApplications((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );

  const addApplication = () =>
    setApplications((current) => {
      // The new id is derived from the current list, never from a ref.
      const used = current
        .map((row) => Number(String(row.id).replace("app-", "")))
        .filter((value) => Number.isFinite(value));
      const nextNumber = used.length === 0 ? 1 : Math.max(...used) + 1;
      return [...current, { id: `app-${nextNumber}`, name: "", deadline: "", fee: "" }];
    });

  const removeApplication = (id) =>
    setApplications((current) => current.filter((row) => row.id !== id));

  const summary = useMemo(
    () => summariseApplications(applications, today),
    [applications, today],
  );

  const documents = useMemo(() => buildDocumentList(claims), [claims]);
  const readiness = useMemo(() => computeReadiness(documents, haveIds), [documents, haveIds]);

  const refund = useMemo(
    () =>
      computeUgcRefund({
        feePaid: feePaid === "" ? 0 : Number(feePaid),
        lastDateOfAdmission,
        withdrawalDate,
      }),
    [feePaid, lastDateOfAdmission, withdrawalDate],
  );

  const summaryError = Boolean(summary.error);
  const refundError = Boolean(refund.error);

  const groups = useMemo(() => {
    const map = new Map();
    documents.forEach((doc) => {
      const key = doc.group || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(doc);
    });
    return Array.from(map, ([name, items]) => ({ name, items }));
  }, [documents]);

  const copyText = useMemo(() => {
    if (summaryError) return "";
    const lines = ["College Admission Tracker", `Today: ${today}`, "", "Applications:"];
    summary.rows.forEach((row) => {
      lines.push(
        `- ${row.name} | ${row.deadline || "no deadline set"}${
          row.daysLeft === null ? "" : ` (${row.daysLeft} days)`
        } | fee ${row.fee}`,
      );
    });
    lines.push(`Total application fees: ${summary.totalFee}`);
    if (!refundError) {
      lines.push(
        "",
        `If you withdraw ${refund.describedAs}: ${refund.percent}% band, refund ${refund.refund}, forfeited ${refund.forfeited}.`,
      );
    }
    lines.push("", "Documents:");
    groups.forEach((group) => {
      lines.push(`-- ${group.name} --`);
      group.items.forEach((doc) =>
        lines.push(`[${haveIds.includes(doc.id) ? "x" : " "}] ${doc.label}`),
      );
    });
    return lines.join("\n");
  }, [summaryError, summary, today, refundError, refund, groups, haveIds]);

  const copyResult = async () => {
    if (!copyText) return;
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    const now = todayISO();
    setToday(now);
    setApplications(seedApplications(now));
    setClaims(DEFAULT_CLAIMS);
    setHaveIds([]);
    setFeePaid("120000");
    setLastDateOfAdmission(addDays(now, 40));
    setWithdrawalDate(addDays(now, 20));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <School className="h-4 w-4" aria-hidden="true" />
          Admissions
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          College Admission Form Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Every application in one list with its deadline and fee, one shared document pile, and the
          UGC refund slab worked out for the day you might withdraw.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="w-full sm:w-56">
            <label className={LABEL_CLASS} htmlFor="caf-today">
              Today&apos;s date
            </label>
            <input
              id="caf-today"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
          <button type="button" onClick={addApplication} className={GHOST_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add an application
          </button>
        </div>

        <ul className="mt-4 grid gap-4">
          {applications.map((row, index) => (
            <li
              key={row.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={SMALL_LABEL} htmlFor={`caf-name-${row.id}`}>
                    College or application {index + 1}
                  </label>
                  <input
                    id={`caf-name-${row.id}`}
                    type="text"
                    className={`mt-1 ${INPUT_CLASS}`}
                    value={row.name}
                    placeholder="Name of the college or common form"
                    onChange={(event) => updateApplication(row.id, "name", event.target.value)}
                  />
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`caf-deadline-${row.id}`}>
                    Last date to apply
                  </label>
                  <input
                    id={`caf-deadline-${row.id}`}
                    type="date"
                    className={`mt-1 ${INPUT_CLASS}`}
                    value={row.deadline}
                    onChange={(event) => updateApplication(row.id, "deadline", event.target.value)}
                  />
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`caf-fee-${row.id}`}>
                    Application fee (INR)
                  </label>
                  <input
                    id={`caf-fee-${row.id}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="50"
                    className={`mt-1 ${INPUT_CLASS}`}
                    value={row.fee}
                    onChange={(event) => updateApplication(row.id, "fee", event.target.value)}
                  />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold">
                  {summaryError || !summary.rows[index] ? (
                    <span className="text-[var(--muted-foreground)]">{DASH}</span>
                  ) : (
                    <span className={STATUS_STYLE[summary.rows[index].status]}>
                      {summary.rows[index].daysLeft === null
                        ? "No deadline set"
                        : summary.rows[index].daysLeft < 0
                          ? `Closed ${Math.abs(summary.rows[index].daysLeft)} day(s) ago`
                          : `${summary.rows[index].daysLeft} day(s) left`}
                    </span>
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => removeApplication(row.id)}
                  aria-label={`Remove application ${index + 1}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>

        {applications.length === 0 && (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            No applications yet — add one to start the countdown.
          </p>
        )}
      </section>

      {summaryError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {summary.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Days to the next closing date
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {summaryError || summary.daysToNext === null ? DASH : summary.daysToNext}
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--muted-foreground)]">
              {summaryError
                ? "Fix the entry above to see the countdown."
                : summary.next
                  ? `${summary.next.name} — ${summary.next.deadline}`
                  : "Nothing still open in this list."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the admission tracker"
              className={GHOST_BTN}
              disabled={summaryError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy tracker"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Applications tracked", summaryError ? DASH : String(summary.count)],
            ["Total application fees", summaryError ? DASH : money(summary.totalFee)],
            ["Closing within three days", summaryError ? DASH : String(summary.urgent)],
            ["Already closed", summaryError ? DASH : String(summary.overdue)],
            ["Documents ready", `${readiness.have} of ${readiness.total}`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-4">
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={`${readiness.percent} percent of the documents are ready`}
          >
            <span
              className={`block h-full ${readiness.ready ? "bg-[var(--success)]" : "bg-[var(--primary)]"}`}
              style={{ width: `${readiness.percent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            {readiness.percent}% of the document pile is ready
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">If you withdraw after paying — the UGC refund slab</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="caf-feepaid">
              Fee already paid (INR)
            </label>
            <input
              id="caf-feepaid"
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              className={`mt-2 ${INPUT_CLASS}`}
              value={feePaid}
              onChange={(event) => setFeePaid(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="caf-lastdate">
              Notified last date of admission
            </label>
            <input
              id="caf-lastdate"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={lastDateOfAdmission}
              onChange={(event) => setLastDateOfAdmission(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="caf-withdraw">
              Date you give notice of withdrawal
            </label>
            <input
              id="caf-withdraw"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={withdrawalDate}
              onChange={(event) => setWithdrawalDate(event.target.value)}
            />
          </div>
        </div>

        {refundError ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {refund.error}
          </p>
        ) : null}

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["Timing", refundError ? DASH : refund.describedAs],
            ["Slab that applies", refundError ? DASH : refund.slab.label],
            ["Refund percentage", refundError ? DASH : `${refund.percent}%`],
            ["Processing charge kept", refundError ? DASH : money(refund.processingCharge)],
            ["Refund you receive", refundError ? DASH : money(refund.refund)],
            ["Forfeited", refundError ? DASH : money(refund.forfeited)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The fee steps, in order</h2>
        <ol className="mt-3 grid gap-2 text-sm">
          {FEE_STEPS.map((step, index) => (
            <li
              key={step.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
            >
              <p className="font-semibold">
                {index + 1}. {step.label}
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{step.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Which claims apply to you?
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {CLAIM_OPTIONS.map((option) => (
              <label key={option.key} className={CHECK_ROW} htmlFor={`caf-c-${option.key}`}>
                <input
                  id={`caf-c-${option.key}`}
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={claims[option.key]}
                  onChange={() => toggleClaim(option.key)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {groups.map((group) => (
        <section
          key={group.name}
          className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        >
          <h2 className="text-base font-semibold">{group.name}</h2>
          <ul className="mt-3 grid gap-3">
            {group.items.map((doc) => (
              <li key={doc.id}>
                <label className={CHECK_ROW} htmlFor={`caf-d-${doc.id}`}>
                  <input
                    id={`caf-d-${doc.id}`}
                    type="checkbox"
                    className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                    checked={haveIds.includes(doc.id)}
                    onChange={() => toggleHave(doc.id)}
                  />
                  <span className="min-w-0">
                    <span className="block font-semibold">{doc.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                      {doc.detail}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and nothing here is legal advice. Refund slabs, document lists and
        deadlines are set by the UGC and by each institution and do change — read the prospectus and
        the admission notice, and take a dispute over a withheld refund to the institution's
        grievance mechanism.
      </p>
    </main>
  );
}
