"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, RotateCcw } from "lucide-react";

import { LEVELS, ROLES, buildTrainingPlan, formatPlanText } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  roleId: "general",
  levelId: "beginner",
  hoursPerWeek: "2",
};

const DASH = "—";

export default function ToolHome() {
  const [roleId, setRoleId] = useState(DEFAULTS.roleId);
  const [levelId, setLevelId] = useState(DEFAULTS.levelId);
  const [hoursPerWeek, setHoursPerWeek] = useState(DEFAULTS.hoursPerWeek);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildTrainingPlan({
        roleId,
        levelId,
        hoursPerWeek: hoursPerWeek.trim() === "" ? Number.NaN : Number(hoursPerWeek),
      }),
    [roleId, levelId, hoursPerWeek],
  );

  const hasError = Boolean(result.error);
  const planText = useMemo(() => formatPlanText(result), [result]);

  const copyResult = async () => {
    if (hasError || !planText) return;
    try {
      await navigator.clipboard.writeText(planText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setRoleId(DEFAULTS.roleId);
    setLevelId(DEFAULTS.levelId);
    setHoursPerWeek(DEFAULTS.hoursPerWeek);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          AI Business
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          AI Training Plan Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a role, a starting level and a weekly time budget; get a sequenced module plan —
          foundations, applied practice, governance — packed into numbered weeks.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tpb-role">
              Role
            </label>
            <select
              id="tpb-role"
              className={`mt-2 ${INPUT_CLASS}`}
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
            >
              {ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tpb-level">
              Current skill level
            </label>
            <select
              id="tpb-level"
              className={`mt-2 ${INPUT_CLASS}`}
              value={levelId}
              onChange={(e) => setLevelId(e.target.value)}
            >
              {LEVELS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tpb-hours">
              Time budget (hours per week, 1–10)
            </label>
            <input
              id="tpb-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="10"
              step="0.5"
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(e.target.value)}
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Plan length
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.weekCount} weeks`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a plan."
                : `${result.totalHours} hours of modules at ${result.hoursPerWeek} h/week for ${result.roleLabel.toLowerCase()}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the training plan as text"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
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

        {hasError ? (
          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Modules</dt>
              <dd className="text-right font-semibold">{DASH}</dd>
            </div>
          </dl>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Week
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Module
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Hours
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Outcome
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.modules.map((m) => (
                  <tr key={m.id} className="border-b border-[var(--border)] align-top last:border-0">
                    <td className="whitespace-nowrap py-2 pr-3 font-semibold">
                      {m.startWeek === m.endWeek ? m.startWeek : `${m.startWeek}–${m.endWeek}`}
                    </td>
                    <td className="py-2 pr-3">{m.title}</td>
                    <td className="py-2 pr-3">{m.hours}</td>
                    <td className="py-2 text-[var(--muted-foreground)]">{m.outcome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Modules are 1–4 hour blocks sequenced foundations → applied practice → governance. Adjust
        titles and hours to your own materials; the schedule packs whole modules in order into your
        weekly budget.
      </p>
    </main>
  );
}
