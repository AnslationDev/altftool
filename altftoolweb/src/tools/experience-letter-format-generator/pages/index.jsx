"use client";

import { useMemo, useState } from "react";
import { Award, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  EMPLOYMENT_TYPES,
  LETTER_STYLES,
  buildExperienceLetter,
  buildRoleTimeline,
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

const DEFAULT_ROLES = [
  { id: "role-1", title: "Analyst", fromISO: "2019-06-15", toISO: "2022-03-31" },
  { id: "role-2", title: "Senior Analyst", fromISO: "2022-04-01", toISO: "2026-08-31" },
];

const DEFAULTS = {
  companyName: "Northbridge Services Pvt. Ltd.",
  companyAddress: "4th Floor, Orion Park, Andheri East, Mumbai 400069",
  companyCin: "",
  employeeName: "Priya Nair",
  employeeId: "EMP-4821",
  pronoun: "she",
  employmentType: "full-time",
  joiningDate: "2019-06-15",
  lastWorkingDay: "2026-08-31",
  issueDate: "2026-09-05",
  styleId: "standard",
  duties: "credit risk modelling, portfolio monitoring and regulatory reporting",
  signatoryName: "A. Verma",
  signatoryDesignation: "Head of Human Resources",
  verificationEmail: "hr@northbridge.example",
  verificationPhone: "022-4000 0000",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [nextId, setNextId] = useState(3);
  const [copied, setCopied] = useState("");

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const updateRole = (id, key, value) =>
    setRoles((prev) => prev.map((role) => (role.id === id ? { ...role, [key]: value } : role)));

  const addRole = () => {
    const id = `role-${nextId}`;
    setNextId((value) => value + 1);
    setRoles((prev) => [
      ...prev,
      { id, title: "", fromISO: form.joiningDate, toISO: form.lastWorkingDay },
    ]);
  };

  const removeRole = (id) => setRoles((prev) => (prev.length > 1 ? prev.filter((role) => role.id !== id) : prev));

  const timeline = useMemo(
    () =>
      buildRoleTimeline({
        roles: roles.map((role) => ({ title: role.title, fromISO: role.fromISO, toISO: role.toISO })),
        joiningDateISO: form.joiningDate,
        lastWorkingDayISO: form.lastWorkingDay,
      }),
    [roles, form.joiningDate, form.lastWorkingDay],
  );

  const letter = useMemo(
    () =>
      buildExperienceLetter({
        companyName: form.companyName,
        companyAddress: form.companyAddress,
        companyCin: form.companyCin,
        employeeName: form.employeeName,
        employeeId: form.employeeId,
        pronoun: form.pronoun,
        employmentTypeId: form.employmentType,
        joiningDateISO: form.joiningDate,
        lastWorkingDayISO: form.lastWorkingDay,
        issueDateISO: form.issueDate,
        styleId: form.styleId,
        duties: form.duties,
        signatoryName: form.signatoryName,
        signatoryDesignation: form.signatoryDesignation,
        verificationEmail: form.verificationEmail,
        verificationPhone: form.verificationPhone,
        timeline,
      }),
    [form, timeline],
  );

  const error = timeline.error || letter.error || "";

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
    setRoles(DEFAULT_ROLES);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Award className="h-4 w-4" aria-hidden="true" />
          Exit documents
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Experience Letter Format Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          List each designation with its dates. The tool computes the duration of every stint, checks
          that they add up to the full employment period without gaps or overlaps, and produces a
          certificate a background-verification team can accept as it stands.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Employment period</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="joining-date">Date of joining</label>
            <input id="joining-date" className={INPUT} type="date" value={form.joiningDate} onChange={set("joiningDate")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="last-day">Last working day</label>
            <input id="last-day" className={INPUT} type="date" value={form.lastWorkingDay} onChange={set("lastWorkingDay")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="employment-type">Nature of employment</label>
            <select id="employment-type" className={INPUT} value={form.employmentType} onChange={set("employmentType")}>
              {EMPLOYMENT_TYPES.map((type) => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="style-id">Certificate style</label>
            <select id="style-id" className={INPUT} value={form.styleId} onChange={set("styleId")}>
              {LETTER_STYLES.map((style) => (
                <option key={style.id} value={style.id}>{style.label}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          {(LETTER_STYLES.find((style) => style.id === form.styleId) || LETTER_STYLES[0]).note}
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Designations held</h2>
          <button type="button" onClick={addRole} className={GHOST_BTN} aria-label="Add another designation">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add designation
          </button>
        </div>
        <div className="mt-4 grid gap-5">
          {roles.map((role, index) => (
            <div key={role.id} className="rounded-md border border-[var(--border)] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">Designation {index + 1}</p>
                {roles.length > 1 && (
                  <button type="button" onClick={() => removeRole(role.id)}
                    aria-label={`Remove designation ${index + 1}`}
                    className="inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35">
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </button>
                )}
              </div>
              <div className="mt-3 grid gap-4">
                <div>
                  <label className={LABEL} htmlFor={`title-${role.id}`}>Title</label>
                  <input id={`title-${role.id}`} className={INPUT} value={role.title}
                    onChange={(event) => updateRole(role.id, "title", event.target.value)} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={LABEL} htmlFor={`from-${role.id}`}>From</label>
                    <input id={`from-${role.id}`} className={INPUT} type="date" value={role.fromISO}
                      onChange={(event) => updateRole(role.id, "fromISO", event.target.value)} />
                  </div>
                  <div>
                    <label className={LABEL} htmlFor={`to-${role.id}`}>To</label>
                    <input id={`to-${role.id}`} className={INPUT} type="date" value={role.toISO}
                      onChange={(event) => updateRole(role.id, "toISO", event.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          ))}
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
              Total period certified
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {error ? "—" : timeline.totalTenureText}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error
                ? "Fix the dates above."
                : `${timeline.totalTenure.totalDays} days, of which the designations account for ${timeline.coveredDays}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={GHOST_BTN} aria-label="Copy the one-line verification summary"
              onClick={() => copy(letter.error ? "" : letter.verificationLine, "verify")}>
              {copied === "verify" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied === "verify" ? "Copied!" : "Copy summary line"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!error && (
          <>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Designation</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Period</th>
                    <th scope="col" className="py-2 text-right font-semibold">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {timeline.roles.map((role) => (
                    <tr key={`${role.title}-${role.fromISO}`} className="border-b border-[var(--border)] align-top last:border-0">
                      <td className="py-2 pr-3 font-semibold">{role.title}</td>
                      <td className="py-2 pr-3 text-[var(--muted-foreground)] whitespace-nowrap">
                        {role.fromISO} – {role.toISO}
                      </td>
                      <td className="py-2 text-right">{role.tenureText}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {timeline.issues.length > 0 ? (
              <div role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
                <p className="font-semibold">Fix these before issuing the certificate:</p>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {timeline.issues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-4 rounded-md px-3 py-2 text-sm font-medium text-[var(--success)]">
                The designations cover the whole employment period with no gaps or overlaps.
              </p>
            )}
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Employer and employee details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="company-name">Company name</label>
            <input id="company-name" className={INPUT} value={form.companyName} onChange={set("companyName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="company-cin">CIN / registration number (optional)</label>
            <input id="company-cin" className={INPUT} value={form.companyCin} onChange={set("companyCin")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="employee-name">Employee name</label>
            <input id="employee-name" className={INPUT} value={form.employeeName} onChange={set("employeeName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="employee-id">Employee ID</label>
            <input id="employee-id" className={INPUT} value={form.employeeId} onChange={set("employeeId")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="pronoun">Pronoun used in the letter</label>
            <select id="pronoun" className={INPUT} value={form.pronoun} onChange={set("pronoun")}>
              <option value="she">She / her</option>
              <option value="he">He / his</option>
              <option value="they">They / their</option>
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="issue-date">Date of issue</label>
            <input id="issue-date" className={INPUT} type="date" value={form.issueDate} onChange={set("issueDate")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="signatory-name">Authorised signatory</label>
            <input id="signatory-name" className={INPUT} value={form.signatoryName} onChange={set("signatoryName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="signatory-designation">Signatory's designation</label>
            <input id="signatory-designation" className={INPUT} value={form.signatoryDesignation} onChange={set("signatoryDesignation")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="verification-email">Verification email</label>
            <input id="verification-email" className={INPUT} type="email" value={form.verificationEmail} onChange={set("verificationEmail")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="verification-phone">Verification phone</label>
            <input id="verification-phone" className={INPUT} value={form.verificationPhone} onChange={set("verificationPhone")} />
          </div>
        </div>
        <div className="mt-4">
          <label className={LABEL} htmlFor="company-address">Registered address</label>
          <input id="company-address" className={INPUT} value={form.companyAddress} onChange={set("companyAddress")} />
        </div>
        <div className="mt-4">
          <label className={LABEL} htmlFor="duties">Principal responsibilities (used by the detailed style)</label>
          <textarea id="duties" rows={3} className={AREA} value={form.duties} onChange={set("duties")} />
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Experience certificate</h2>
          <button type="button" className={PRIMARY_BTN} aria-label="Copy the experience certificate"
            onClick={() => copy(letter.error ? "" : letter.body, "letter")}>
            {copied === "letter" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied === "letter" ? "Copied!" : "Copy certificate"}
          </button>
        </div>
        {letter.error ? (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {letter.error}
          </p>
        ) : (
          <>
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">{letter.wordCount} words</p>
            <pre className="mt-3 max-h-[30rem] overflow-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6 whitespace-pre-wrap text-[var(--foreground)]">
              {letter.body}
            </pre>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A template for an employer to issue on its own letterhead, not a substitute for one. Issuing
        or altering an experience certificate you are not authorised to sign is forgery. Several
        state Shops and Establishments Acts require a service certificate on request — check the Act
        that applies to your establishment.
      </p>
    </main>
  );
}
