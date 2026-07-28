"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, School } from "lucide-react";
import {
  BOARDS,
  EXTRA_FLAGS,
  GRADES,
  RTE_QUOTA_PERCENT,
  SCENARIOS,
  buildChecklist,
  checklistToText,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  board: "cbse",
  grade: "c1",
  scenario: "fresh",
  dob: "2020-02-10",
  cutoff: "2026-03-31",
  flags: [],
};

const STATUS_STYLE = {
  eligible: "bg-[var(--success)]/10 text-[var(--success)]",
  under: "bg-[var(--danger-soft)] text-[var(--danger)]",
  older: "bg-[var(--muted)] text-[var(--foreground)]",
};

export default function ToolHome() {
  const [board, setBoard] = useState(DEFAULTS.board);
  const [grade, setGrade] = useState(DEFAULTS.grade);
  const [scenario, setScenario] = useState(DEFAULTS.scenario);
  const [dob, setDob] = useState(DEFAULTS.dob);
  const [cutoff, setCutoff] = useState(DEFAULTS.cutoff);
  const [flags, setFlags] = useState(DEFAULTS.flags);
  const [packed, setPacked] = useState([]);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildChecklist({
        boardKey: board,
        gradeKey: grade,
        scenarioKey: scenario,
        flags,
        dob,
        cutoffDate: cutoff,
      }),
    [board, grade, scenario, flags, dob, cutoff],
  );

  const failed = Boolean(result.error);
  const totals = failed ? null : result.totals;
  const ageCheck = failed ? null : result.ageCheck;

  const toggleFlag = (key) => {
    setFlags((list) => (list.includes(key) ? list.filter((item) => item !== key) : [...list, key]));
  };

  const togglePacked = (label) => {
    setPacked((list) =>
      list.includes(label) ? list.filter((item) => item !== label) : [...list, label],
    );
  };

  const packedCount = failed
    ? 0
    : result.sections
        .flatMap((section) => section.items)
        .filter((item) => packed.includes(item.label)).length;

  const copyList = async () => {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(checklistToText(result));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setBoard(DEFAULTS.board);
    setGrade(DEFAULTS.grade);
    setScenario(DEFAULTS.scenario);
    setDob(DEFAULTS.dob);
    setCutoff(DEFAULTS.cutoff);
    setFlags(DEFAULTS.flags);
    setPacked([]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <School className="h-4 w-4" aria-hidden="true" />
          Education documents
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          School Admission Document Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick the board, the class and how the child is joining, and get the exact paperwork —
          including the transfer certificate, migration certificate and {RTE_QUOTA_PERCENT}% quota
          papers — plus an age check against the entry floor for that class.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sadc-board">
              Board
            </label>
            <select
              id="sadc-board"
              className={`mt-2 ${INPUT_CLASS}`}
              value={board}
              onChange={(event) => setBoard(event.target.value)}
            >
              {BOARDS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sadc-grade">
              Class applying for
            </label>
            <select
              id="sadc-grade"
              className={`mt-2 ${INPUT_CLASS}`}
              value={grade}
              onChange={(event) => setGrade(event.target.value)}
            >
              {GRADES.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sadc-scenario">
              How is the child joining?
            </label>
            <select
              id="sadc-scenario"
              className={`mt-2 ${INPUT_CLASS}`}
              value={scenario}
              onChange={(event) => setScenario(event.target.value)}
            >
              {SCENARIOS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sadc-dob">
              Child&apos;s date of birth
            </label>
            <input
              id="sadc-dob"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={dob}
              onChange={(event) => setDob(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sadc-cutoff">
              School&apos;s age cut-off date
            </label>
            <input
              id="sadc-cutoff"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={cutoff}
              onChange={(event) => setCutoff(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-5">
          <p className={LABEL_CLASS}>Anything else that applies</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {EXTRA_FLAGS.map((item) => (
              <div key={item.key} className="flex items-start gap-3">
                <input
                  id={`sadc-flag-${item.key}`}
                  type="checkbox"
                  className="mt-1 h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                  checked={flags.includes(item.key)}
                  onChange={() => toggleFlag(item.key)}
                />
                <label
                  className="text-sm leading-6 text-[var(--muted-foreground)]"
                  htmlFor={`sadc-flag-${item.key}`}
                >
                  {item.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Documents to arrange
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {totals ? totals.total : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {totals
                ? `${totals.mandatory} mandatory, ${totals.optional} conditional · ${packedCount} ticked off`
                : "Fix the inputs above"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyList}
              disabled={failed}
              aria-label="Copy the admission document checklist"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy checklist"}
            </button>
            <button
              type="button"
              onClick={reset}
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
            ["Board", failed ? "—" : result.board],
            ["Class", failed ? "—" : result.grade],
            ["Scenario", failed ? "—" : result.scenario],
            ["Age on the cut-off date", ageCheck ? ageCheck.ageText : "—"],
            [
              "Minimum entry age for this class",
              ageCheck ? `${ageCheck.minAgeYears} years` : "—",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ageCheck && (
          <p className={`mt-4 rounded-md px-3 py-2 text-sm ${STATUS_STYLE[ageCheck.status]}`}>
            {ageCheck.message}
          </p>
        )}
      </section>

      {!failed && (
        <div className="mt-6 space-y-6">
          {result.sections.map((section) => (
            <section
              key={section.title}
              className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
            >
              <h2 className="text-base font-semibold">{section.title}</h2>
              <ul className="mt-3 space-y-3">
                {section.items.map((item) => (
                  <li key={item.label} className="flex items-start gap-3">
                    <input
                      id={`sadc-doc-${item.label.slice(0, 40).replace(/\W+/g, "-")}`}
                      type="checkbox"
                      className="mt-1 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)]"
                      checked={packed.includes(item.label)}
                      onChange={() => togglePacked(item.label)}
                    />
                    <label
                      htmlFor={`sadc-doc-${item.label.slice(0, 40).replace(/\W+/g, "-")}`}
                      className="text-sm leading-6"
                    >
                      <span className={packed.includes(item.label) ? "line-through opacity-70" : ""}>
                        {item.label}
                      </span>
                      {!item.required && (
                        <span className="ml-2 rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--muted-foreground)]">
                          if applicable
                        </span>
                      )}
                      {item.note && (
                        <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                          {item.note}
                        </span>
                      )}
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational guide, not legal advice. Individual schools and state education departments
        add their own requirements — always confirm against the school&apos;s prospectus and your
        state&apos;s RTE rules before the admission window closes.
      </p>
    </main>
  );
}
