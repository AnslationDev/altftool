"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, UserPlus } from "lucide-react";

import {
  DOC_FORMATS,
  RAMP_HORIZONS_DAYS,
  ROLE_FAMILIES,
  SENIORITY_LEVELS,
  buildOnboardingPrompt,
  formatHours,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  roleTitle: "Backend Engineer",
  roleFamilyId: "engineering",
  teamName: "Payments",
  companyName: "",
  seniorityId: "mid",
  formatId: "runbook",
  accessText:
    "GitHub organisation\nAWS read-only console\nPagerDuty schedule\nStaging database\nSlack channels: #payments, #incidents",
  hoursPerDay: "5",
  days: "5",
  notes: "",
};

export default function ToolHome() {
  const [roleTitle, setRoleTitle] = useState(DEFAULTS.roleTitle);
  const [roleFamilyId, setRoleFamilyId] = useState(DEFAULTS.roleFamilyId);
  const [teamName, setTeamName] = useState(DEFAULTS.teamName);
  const [companyName, setCompanyName] = useState(DEFAULTS.companyName);
  const [seniorityId, setSeniorityId] = useState(DEFAULTS.seniorityId);
  const [formatId, setFormatId] = useState(DEFAULTS.formatId);
  const [accessText, setAccessText] = useState(DEFAULTS.accessText);
  const [hoursPerDay, setHoursPerDay] = useState(DEFAULTS.hoursPerDay);
  const [days, setDays] = useState(DEFAULTS.days);
  const [notes, setNotes] = useState(DEFAULTS.notes);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildOnboardingPrompt({
        roleTitle,
        roleFamilyId,
        teamName,
        companyName,
        seniorityId,
        formatId,
        accessText,
        hoursPerDay: Number(hoursPerDay),
        days: Number(days),
        notes,
      }),
    [
      roleTitle,
      roleFamilyId,
      teamName,
      companyName,
      seniorityId,
      formatId,
      accessText,
      hoursPerDay,
      days,
      notes,
    ],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setRoleTitle(DEFAULTS.roleTitle);
    setRoleFamilyId(DEFAULTS.roleFamilyId);
    setTeamName(DEFAULTS.teamName);
    setCompanyName(DEFAULTS.companyName);
    setSeniorityId(DEFAULTS.seniorityId);
    setFormatId(DEFAULTS.formatId);
    setAccessText(DEFAULTS.accessText);
    setHoursPerDay(DEFAULTS.hoursPerDay);
    setDays(DEFAULTS.days);
    setNotes(DEFAULTS.notes);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Onboarding days", DASH],
        ["Hours per day", DASH],
        ["Role family", DASH],
        ["Reader level", DASH],
        ["Output format", DASH],
        ["Access items to cover", DASH],
        ["Prompt length", DASH],
      ]
    : [
        ["Onboarding days", NUM.format(result.schedule.days)],
        ["Hours per day", formatHours(result.schedule.hoursPerDay)],
        ["Role family", result.family.label],
        ["Reader level", result.seniority.label],
        ["Output format", result.format.label],
        ["Access items to cover", NUM.format(result.accessItems.length)],
        [
          "Prompt length",
          `${NUM.format(result.words)} words · ~${NUM.format(result.approxTokens)} tokens`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          People operations
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Onboarding Doc Prompt Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Give it the role, team and access list. It splits the week&apos;s available hours
          across the six standard onboarding sections in quarter-hour blocks, then writes an
          AI prompt that produces a first-week document with a real timetable, a named first
          deliverable and {RAMP_HORIZONS_DAYS.join("/")}-day checkpoints.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ob-title">
              Job title
            </label>
            <input
              id="ob-title"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={roleTitle}
              onChange={(event) => setRoleTitle(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ob-family">
              Role family
            </label>
            <select
              id="ob-family"
              className={`mt-2 ${INPUT_CLASS}`}
              value={roleFamilyId}
              onChange={(event) => setRoleFamilyId(event.target.value)}
            >
              {ROLE_FAMILIES.map((family) => (
                <option key={family.id} value={family.id}>
                  {family.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ob-team">
              Team (optional)
            </label>
            <input
              id="ob-team"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={teamName}
              onChange={(event) => setTeamName(event.target.value)}
              placeholder="e.g. Payments"
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ob-company">
              Company (optional)
            </label>
            <input
              id="ob-company"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ob-seniority">
              Seniority
            </label>
            <select
              id="ob-seniority"
              className={`mt-2 ${INPUT_CLASS}`}
              value={seniorityId}
              onChange={(event) => setSeniorityId(event.target.value)}
            >
              {SENIORITY_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ob-format">
              Output format
            </label>
            <select
              id="ob-format"
              className={`mt-2 ${INPUT_CLASS}`}
              value={formatId}
              onChange={(event) => setFormatId(event.target.value)}
            >
              {DOC_FORMATS.map((format) => (
                <option key={format.id} value={format.id}>
                  {format.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ob-hours">
              Productive hours per day
            </label>
            <input
              id="ob-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="1"
              max="12"
              step="0.5"
              inputMode="decimal"
              value={hoursPerDay}
              onChange={(event) => setHoursPerDay(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ob-days">
              Onboarding days
            </label>
            <input
              id="ob-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="1"
              max="10"
              step="1"
              inputMode="numeric"
              value={days}
              onChange={(event) => setDays(event.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ob-access">
              Accounts, tools and access — one per line
            </label>
            <textarea
              id="ob-access"
              className={`mt-2 ${AREA_CLASS}`}
              rows={5}
              value={accessText}
              onChange={(event) => setAccessText(event.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ob-notes">
              Extra instruction (optional)
            </label>
            <input
              id="ob-notes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="e.g. the hire is remote in a +5:30 time zone"
            />
          </div>
        </div>
      </section>

      {hasError ? (
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
              Onboarding time to schedule
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : formatHours(result.schedule.totalHours)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `Split across ${result.schedule.allocations.length} sections in 15-minute blocks, with nothing left unaccounted for.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated onboarding document prompt"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy prompt"}
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

        {!hasError ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[30rem] text-left text-sm">
              <caption className="pb-2 text-left text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                Week timetable
              </caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-medium">
                    Section
                  </th>
                  <th scope="col" className="py-2 pr-3 font-medium">
                    When
                  </th>
                  <th scope="col" className="py-2 pr-3 font-medium">
                    Time
                  </th>
                  <th scope="col" className="py-2 font-medium">
                    Share
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.allocations.map((allocation) => (
                  <tr key={allocation.id} className="border-b border-[var(--border)] last:border-0">
                    <th scope="row" className="py-2 pr-3 font-medium">
                      {allocation.label}
                    </th>
                    <td className="py-2 pr-3 whitespace-nowrap">{allocation.dayWindow}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {formatHours(allocation.hours)}
                    </td>
                    <td className="py-2 whitespace-nowrap">{PCT.format(allocation.percent)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="mt-5">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
            Generated prompt
          </h2>
          <div className="mt-2 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
            <pre className="text-sm leading-6 break-words whitespace-pre-wrap text-[var(--foreground)]">
              {hasError ? DASH : result.text}
            </pre>
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Hours are apportioned by the largest-remainder method on quarter-hour units, so the
        section times always add back to the exact total. Anything the tool cannot know — links,
        people, policies — is marked TODO(fill) in the prompt rather than invented, so the draft
        is safe to hand to a reviewer.
      </p>
    </main>
  );
}
