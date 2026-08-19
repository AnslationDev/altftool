"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShieldAlert } from "lucide-react";

import {
  FRAMEWORKS,
  GAC_APPEAL_DAYS,
  OFFICER_ROLES,
  buildGrievanceBlock,
  computeDeadlines,
} from "../lib";

const DASH = "—";

const DT_FMT = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

const prettyDateTime = (value) => {
  if (!value) return DASH;
  const parsed = Date.parse(`${value}:00Z`);
  return Number.isNaN(parsed) ? DASH : DT_FMT.format(new Date(parsed));
};

const nowLocalIso = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "min-h-20 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none";

const DEFAULTS = {
  companyName: "Nirvi Retail Private Limited",
  websiteName: "nirvi.store",
  officerRole: "grievanceOfficer",
  officerName: "Ms. Ananya Rao",
  officerDesignation: "Head of Customer Experience",
  officerEmail: "grievance@nirvi.store",
  officerPhone: "+91 22 4000 1299",
  officerAddress: "12 Palm Court, Andheri East, Mumbai 400069, Maharashtra, India",
  officeHours: "Monday to Friday, 10:00 to 18:00 IST",
  escalationEmail: "appeals@nirvi.store",
  lastUpdated: "",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [frameworks, setFrameworks] = useState(["ecommerce"]);
  const [receivedAt, setReceivedAt] = useState(() => nowLocalIso());
  const [format, setFormat] = useState("text");
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const toggleFramework = (key) => (event) => {
    const checked = event.target.checked;
    setFrameworks((current) =>
      checked
        ? FRAMEWORKS.filter((item) => item.key === key || current.includes(item.key)).map(
            (item) => item.key,
          )
        : current.filter((entry) => entry !== key),
    );
  };

  const block = useMemo(() => buildGrievanceBlock({ ...form, frameworks }), [form, frameworks]);
  const deadlines = useMemo(
    () => computeDeadlines({ receivedAt, frameworks }),
    [receivedAt, frameworks],
  );

  const ok = !block.error;
  const output = ok ? (format === "html" ? block.html : block.text) : "";

  const copyOutput = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setFrameworks(["ecommerce"]);
    setReceivedAt(nowLocalIso());
    setFormat("text");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--primary)] uppercase">
          <ShieldAlert className="h-4 w-4" aria-hidden="true" />
          Ecommerce compliance
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Grievance Officer Details Block Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Rule 4(6) of the Consumer Protection (E-Commerce) Rules, 2020 requires the grievance
          officer&apos;s name, contact details and designation to be displayed, with a 48-hour
          acknowledgement and one-month redressal. Intermediaries work to 24 hours and 15 days.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Which frameworks apply</h2>
        <div className="mt-3 space-y-1">
          {FRAMEWORKS.map((framework) => (
            <label key={framework.key} className="flex min-h-11 items-start gap-3 py-1 text-sm">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)]"
                checked={frameworks.includes(framework.key)}
                onChange={toggleFramework(framework.key)}
              />
              <span>
                <span className="font-semibold">{framework.label}</span>
                <span className="block text-xs text-[var(--muted-foreground)]">
                  {framework.who} · {framework.citation}
                </span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Officer details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="god-company">
              Legal name of the business
            </label>
            <input
              id="god-company"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.companyName}
              onChange={set("companyName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="god-site">
              Website or app the block applies to
            </label>
            <input
              id="god-site"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.websiteName}
              onChange={set("websiteName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="god-role">
              Role held
            </label>
            <select
              id="god-role"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.officerRole}
              onChange={set("officerRole")}
            >
              {OFFICER_ROLES.map((role) => (
                <option key={role.key} value={role.key}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="god-name">
              Officer&apos;s name
            </label>
            <input
              id="god-name"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.officerName}
              onChange={set("officerName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="god-designation">
              Designation
            </label>
            <input
              id="god-designation"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.officerDesignation}
              onChange={set("officerDesignation")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="god-email">
              Email
            </label>
            <input
              id="god-email"
              className={`mt-2 ${INPUT_CLASS}`}
              type="email"
              value={form.officerEmail}
              onChange={set("officerEmail")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="god-phone">
              Phone
            </label>
            <input
              id="god-phone"
              className={`mt-2 ${INPUT_CLASS}`}
              type="tel"
              value={form.officerPhone}
              onChange={set("officerPhone")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="god-escalation">
              Escalation email
            </label>
            <input
              id="god-escalation"
              className={`mt-2 ${INPUT_CLASS}`}
              type="email"
              value={form.escalationEmail}
              onChange={set("escalationEmail")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="god-address">
              Postal address for the officer
            </label>
            <textarea
              id="god-address"
              className={`mt-2 ${AREA_CLASS}`}
              value={form.officerAddress}
              onChange={set("officerAddress")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="god-hours">
              Office hours
            </label>
            <input
              id="god-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.officeHours}
              onChange={set("officeHours")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="god-updated">
              Last updated (as you want it shown)
            </label>
            <input
              id="god-updated"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.lastUpdated}
              onChange={set("lastUpdated")}
            />
          </div>
        </div>
      </section>

      {block.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {block.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Response deadline calculator</h2>
        <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter when a complaint arrived and see the acknowledgement and redressal deadlines each
          selected framework imposes.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="god-received">
              Complaint received at
            </label>
            <input
              id="god-received"
              className={`mt-2 ${INPUT_CLASS}`}
              type="datetime-local"
              value={receivedAt}
              onChange={(event) => setReceivedAt(event.target.value)}
            />
          </div>
        </div>

        {deadlines.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {deadlines.error}
          </p>
        ) : (
          <>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
                  Tightest acknowledgement deadline
                </p>
                <p className="mt-1 text-2xl font-semibold text-[var(--primary)] sm:text-3xl">
                  {deadlines.tightestAcknowledgement
                    ? prettyDateTime(deadlines.tightestAcknowledgement.acknowledgeBy)
                    : DASH}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
                  Tightest resolution deadline
                </p>
                <p className="mt-1 text-2xl font-semibold text-[var(--primary)] sm:text-3xl">
                  {deadlines.tightestResolution
                    ? prettyDateTime(deadlines.tightestResolution.resolveBy)
                    : DASH}
                </p>
              </div>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide text-[var(--muted-foreground)] uppercase">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Framework
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Acknowledge by
                    </th>
                    <th scope="col" className="py-2 font-semibold">
                      Resolve by
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {deadlines.rows.map((row) => (
                    <tr key={row.key} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">
                        <span className="font-semibold">{row.label}</span>
                        <span className="block text-xs text-[var(--muted-foreground)]">
                          {row.citation}
                        </span>
                      </td>
                      <td className="py-2 pr-3">
                        {row.acknowledgeBy ? prettyDateTime(row.acknowledgeBy) : DASH}
                      </td>
                      <td className="py-2">
                        {row.resolveBy ? prettyDateTime(row.resolveBy) : row.resolveLabel}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {frameworks.includes("itRules") || frameworks.includes("itUrgent") ? (
              <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                A complainant may appeal a Grievance Officer&apos;s decision to a Grievance Appellate
                Committee within {GAC_APPEAL_DAYS} days under Rule 3A of the IT Rules, 2021.
              </p>
            ) : null}
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
              Fields published
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? block.fieldCount : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? block.complete
                  ? "Name, designation and contact details are all present"
                  : `${block.missing.length} mandatory field(s) still missing`
                : "Fix the input above"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyOutput}
              aria-label="Copy the grievance officer disclosure block"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy block"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset every field"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {ok && block.missing.length > 0 ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            Still needed: {block.missing.join(", ")}.
          </p>
        ) : null}
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Disclosure block</h2>
            <div className="flex gap-2">
              {[
                ["text", "Plain text"],
                ["html", "HTML"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFormat(key)}
                  aria-pressed={format === key}
                  className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none ${
                    format === key
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3 overflow-x-auto">
            <pre className="w-full font-mono text-xs leading-6 whitespace-pre-wrap text-[var(--foreground)] sm:text-sm">
              {output}
            </pre>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Which framework binds you depends on what your business
        actually does, and a significant social media intermediary or a Significant Data Fiduciary
        carries additional obligations, including officers resident in India. Have counsel confirm
        the wording before you publish it.
      </p>
    </main>
  );
}
