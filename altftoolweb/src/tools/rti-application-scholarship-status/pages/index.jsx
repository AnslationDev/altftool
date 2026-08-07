"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, RotateCcw } from "lucide-react";

import {
  APPLICATION_FEE_INR,
  AUTHORITY_LEVELS,
  COMMON_QUERIES,
  PENALTY_CAP_INR,
  PENALTY_PER_DAY_INR,
  PROBLEM_TYPES,
  buildScholarshipRti,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const ERROR_CLASS =
  "rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DEFAULTS = {
  studentName: "Priya Das",
  address: "23 Station Road, Cuttack 753001",
  phone: "+91 94370 00000",
  email: "priya.das@example.com",
  authorityName: "Directorate of ST and SC Development, Government of Odisha",
  levelId: "state",
  schemeName: "Post Matric Scholarship for SC Students",
  academicYear: "2025-26",
  applicationId: "OD2025PM0012345",
  instituteName: "Ravenshaw University",
  appliedDate: "2025-08-15",
  problemId: "sanctioned-not-paid",
  commonQueryIds: ["guidelines", "fund-release", "grievance-action"],
  filedDate: "2026-08-03",
  asOnDate: "2026-08-03",
  isBpl: false,
  wantsInspection: false,
};

export default function ToolHome() {
  const [studentName, setStudentName] = useState(DEFAULTS.studentName);
  const [address, setAddress] = useState(DEFAULTS.address);
  const [phone, setPhone] = useState(DEFAULTS.phone);
  const [email, setEmail] = useState(DEFAULTS.email);
  const [authorityName, setAuthorityName] = useState(DEFAULTS.authorityName);
  const [levelId, setLevelId] = useState(DEFAULTS.levelId);
  const [schemeName, setSchemeName] = useState(DEFAULTS.schemeName);
  const [academicYear, setAcademicYear] = useState(DEFAULTS.academicYear);
  const [applicationId, setApplicationId] = useState(DEFAULTS.applicationId);
  const [instituteName, setInstituteName] = useState(DEFAULTS.instituteName);
  const [appliedDate, setAppliedDate] = useState(DEFAULTS.appliedDate);
  const [problemId, setProblemId] = useState(DEFAULTS.problemId);
  const [commonQueryIds, setCommonQueryIds] = useState(DEFAULTS.commonQueryIds);
  const [filedDate, setFiledDate] = useState(DEFAULTS.filedDate);
  const [asOnDate, setAsOnDate] = useState(DEFAULTS.asOnDate);
  const [isBpl, setIsBpl] = useState(DEFAULTS.isBpl);
  const [wantsInspection, setWantsInspection] = useState(DEFAULTS.wantsInspection);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildScholarshipRti({
        studentName,
        address,
        phone,
        email,
        authorityName,
        levelId,
        schemeName,
        academicYear,
        applicationId,
        instituteName,
        appliedDate,
        problemId,
        commonQueryIds,
        filedDate,
        asOnDate,
        isBpl,
        wantsInspection,
      }),
    [
      studentName,
      address,
      phone,
      email,
      authorityName,
      levelId,
      schemeName,
      academicYear,
      applicationId,
      instituteName,
      appliedDate,
      problemId,
      commonQueryIds,
      filedDate,
      asOnDate,
      isBpl,
      wantsInspection,
    ],
  );

  const hasError = Boolean(result.error);

  const toggleQuery = (id) => {
    setCommonQueryIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const copyApplication = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.application);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    if (!window.confirm("Reset all fields? This clears your entered application details and cannot be undone.")) {
      return;
    }
    setStudentName(DEFAULTS.studentName);
    setAddress(DEFAULTS.address);
    setPhone(DEFAULTS.phone);
    setEmail(DEFAULTS.email);
    setAuthorityName(DEFAULTS.authorityName);
    setLevelId(DEFAULTS.levelId);
    setSchemeName(DEFAULTS.schemeName);
    setAcademicYear(DEFAULTS.academicYear);
    setApplicationId(DEFAULTS.applicationId);
    setInstituteName(DEFAULTS.instituteName);
    setAppliedDate(DEFAULTS.appliedDate);
    setProblemId(DEFAULTS.problemId);
    setCommonQueryIds(DEFAULTS.commonQueryIds);
    setFiledDate(DEFAULTS.filedDate);
    setAsOnDate(DEFAULTS.asOnDate);
    setIsBpl(DEFAULTS.isBpl);
    setWantsInspection(DEFAULTS.wantsInspection);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          RTI drafting
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          RTI Application Draft for Scholarship Status
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A scholarship file leaves a dated record at every stage — institute verification, district
          and state verification, sanction, and the DBT payment push. This asks for that record,
          and for the reasons a rejection must carry under Section 4(1)(d) of the RTI Act.
        </p>
      </header>

      <section className={CARD} aria-labelledby="student-heading">
        <h2 id="student-heading" className="text-base font-semibold">
          Student and application details
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sc-name">
              Student name
            </label>
            <input
              id="sc-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={studentName}
              onChange={(event) => setStudentName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sc-appid">
              Portal application number
            </label>
            <input
              id="sc-appid"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={applicationId}
              onChange={(event) => setApplicationId(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sc-scheme">
              Scholarship scheme
            </label>
            <input
              id="sc-scheme"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={schemeName}
              onChange={(event) => setSchemeName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sc-year">
              Academic year
            </label>
            <input
              id="sc-year"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={academicYear}
              onChange={(event) => setAcademicYear(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sc-institute">
              Institute name
            </label>
            <input
              id="sc-institute"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={instituteName}
              onChange={(event) => setInstituteName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sc-applied">
              Scholarship applied on
            </label>
            <input
              id="sc-applied"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={appliedDate}
              onChange={(event) => setAppliedDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sc-ason">
              Pendency measured on
            </label>
            <input
              id="sc-ason"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={asOnDate}
              onChange={(event) => setAsOnDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sc-filed">
              RTI filed on
            </label>
            <input
              id="sc-filed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={filedDate}
              onChange={(event) => setFiledDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sc-phone">
              Phone
            </label>
            <input
              id="sc-phone"
              className={`mt-2 ${INPUT_CLASS}`}
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sc-email">
              Email
            </label>
            <input
              id="sc-email"
              className={`mt-2 ${INPUT_CLASS}`}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sc-address">
              Postal address for the reply
            </label>
            <textarea
              id="sc-address"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={2}
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sc-authority">
              Office you are writing to
            </label>
            <input
              id="sc-authority"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={authorityName}
              onChange={(event) => setAuthorityName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sc-level">
              Level that office sits at
            </label>
            <select
              id="sc-level"
              className={`mt-2 ${INPUT_CLASS}`}
              value={levelId}
              onChange={(event) => setLevelId(event.target.value)}
            >
              {AUTHORITY_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sc-problem">
              What has gone wrong
            </label>
            <select
              id="sc-problem"
              className={`mt-2 ${INPUT_CLASS}`}
              value={problemId}
              onChange={(event) => setProblemId(event.target.value)}
            >
              {PROBLEM_TYPES.map((problem) => (
                <option key={problem.id} value={problem.id}>
                  {problem.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>Extra questions to add</legend>
          <div className="mt-2 grid gap-1">
            {COMMON_QUERIES.map((query) => (
              <label
                key={query.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                htmlFor={`sc-q-${query.id}`}
              >
                <input
                  id={`sc-q-${query.id}`}
                  type="checkbox"
                  className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={commonQueryIds.includes(query.id)}
                  onChange={() => toggleQuery(query.id)}
                />
                {query.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-1 sm:grid-cols-2">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="sc-bpl">
            <input
              id="sc-bpl"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={isBpl}
              onChange={(event) => setIsBpl(event.target.checked)}
            />
            I hold a BPL card (fee exempt)
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm" htmlFor="sc-inspect">
            <input
              id="sc-inspect"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={wantsInspection}
              onChange={(event) => setWantsInspection(event.target.checked)}
            />
            Ask to inspect the file first
          </label>
        </div>
      </section>

      {hasError ? (
        <p role="alert" className={`mt-6 ${ERROR_CLASS}`}>
          {result.error}
        </p>
      ) : null}

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Pending for
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {hasError ? DASH : result.pendency.text}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `${NUM.format(result.pendency.totalDays)} days since the application · ${result.queryCount} questions`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyApplication}
              disabled={hasError}
              aria-label={copied ? "Copied" : "Copy the RTI application"}
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy application"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset every field to its default"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Transfer by (Section 6(3))", hasError ? DASH : result.timeline.transferBy.long],
            ["Reply due (Section 7(1))", hasError ? DASH : result.timeline.replyDue.long],
            ["First appeal by (Section 19(1))", hasError ? DASH : result.timeline.firstAppealBy.long],
            ["Appeal decided by", hasError ? DASH : result.timeline.faaDecisionDue.long],
            ["Outer limit with recorded reasons", hasError ? DASH : result.timeline.faaExtendedDue.long],
            ["Second appeal by (Section 19(3))", hasError ? DASH : result.timeline.secondAppealBy.long],
            ["Application fee", hasError ? DASH : isBpl ? "Nil (Section 7(5))" : `Rs ${APPLICATION_FEE_INR}`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError ? (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">{result.levelNote}</p>
        ) : null}

        <div className="mt-5 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 whitespace-pre-wrap">
          {hasError ? DASH : result.application}
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template, not legal advice. Section 4(1)(d) of the RTI Act 2005 requires a
        public authority to provide reasons for its administrative decisions to affected persons,
        which is what makes a recorded rejection ground obtainable. The fee is Rs{" "}
        {APPLICATION_FEE_INR} under Rule 3 of the RTI Rules 2012 and nil for a BPL cardholder under
        Section 7(5). Missing the reply deadline makes the information free under Section 7(6) and
        exposes the PIO to a penalty of Rs {PENALTY_PER_DAY_INR} per day up to Rs {PENALTY_CAP_INR}
        {" "}under Section 20(1). Keep pursuing the portal grievance in parallel; the RTI records
        the facts, it does not release the payment by itself.
      </p>
    </main>
  );
}
