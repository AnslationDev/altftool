"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Volume2 } from "lucide-react";

import {
  MAX_LEVEL_DB,
  MIN_LEVEL_DB,
  REFERENCE_HOURS_PER_WEEK,
  REFERENCE_LEVEL_ADULT_DB,
  REFERENCE_LEVEL_SENSITIVE_DB,
  REFERENCE_SOUNDS,
  buildAllowanceTable,
  computeSafeListening,
  formatHours,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const DEFAULTS = { levelDb: "85", hoursPerDay: "2", daysPerWeek: "7", profile: "adult" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [levelDb, setLevelDb] = useState(DEFAULTS.levelDb);
  const [hoursPerDay, setHoursPerDay] = useState(DEFAULTS.hoursPerDay);
  const [daysPerWeek, setDaysPerWeek] = useState(DEFAULTS.daysPerWeek);
  const [profile, setProfile] = useState(DEFAULTS.profile);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeSafeListening({
        levelDb: toNumber(levelDb),
        hoursPerDay: toNumber(hoursPerDay),
        daysPerWeek: toNumber(daysPerWeek),
        profile,
      }),
    [levelDb, hoursPerDay, daysPerWeek, profile],
  );

  const ok = !result.error;

  const table = useMemo(
    () =>
      buildAllowanceTable(
        [70, 75, 80, 85, 90, 95, 100, 105, 110],
        profile === "sensitive" ? REFERENCE_LEVEL_SENSITIVE_DB : REFERENCE_LEVEL_ADULT_DB,
      ),
    [profile],
  );

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Safe Listening Volume Guide (WHO-ITU H.870)",
      `Listening level: ${levelDb} dB(A)`,
      `Profile reference: ${result.referenceLevelDb} dB(A) for ${REFERENCE_HOURS_PER_WEEK} hours a week`,
      `Allowed listening at this level: ${formatHours(result.allowedWeeklyHours)} per week`,
      `Your listening: ${formatHours(result.actualWeeklyHours)} per week`,
      `Weekly sound allowance used: ${NUM1.format(result.allowanceUsedPercent)}%`,
      result.maxSafeLevelDb === null
        ? "Highest level for your habit: not applicable"
        : `Highest level that would still fit your habit: ${NUM1.format(result.maxSafeLevelDb)} dB(A)`,
      `NIOSH occupational limit at this level: ${formatHours(result.nioshDailyHours)} a day`,
      result.headline,
    ].join("\n");
  }, [ok, result, levelDb]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setLevelDb(DEFAULTS.levelDb);
    setHoursPerDay(DEFAULTS.hoursPerDay);
    setDaysPerWeek(DEFAULTS.daysPerWeek);
    setProfile(DEFAULTS.profile);
    setCopied(false);
  };

  const usedWidth = ok ? Math.max(0, Math.min(100, result.allowanceUsedPercent)) : 0;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Volume2 className="h-4 w-4" aria-hidden="true" />
          Hearing health
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Safe Listening Volume Guide</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The WHO-ITU H.870 standard sets a weekly sound allowance of {REFERENCE_LEVEL_ADULT_DB} dB(A)
          for {REFERENCE_HOURS_PER_WEEK} hours. Because sound energy doubles every 3 dB, the time you
          are allowed halves for every 3 dB you turn up.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="slv-level">
              Listening level, dB(A)
            </label>
            <input
              id="slv-level"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={MIN_LEVEL_DB}
              max={MAX_LEVEL_DB}
              step="1"
              value={levelDb}
              onChange={(event) => setLevelDb(event.target.value)}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {REFERENCE_SOUNDS.map((sound) => (
                <button
                  key={sound.level}
                  type="button"
                  onClick={() => setLevelDb(String(sound.level))}
                  title={sound.label}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {sound.level} dB
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="slv-hours">
              Hours of listening per day
            </label>
            <input
              id="slv-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="24"
              step="0.25"
              value={hoursPerDay}
              onChange={(event) => setHoursPerDay(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="slv-days">
              Days of listening per week
            </label>
            <input
              id="slv-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="7"
              step="1"
              value={daysPerWeek}
              onChange={(event) => setDaysPerWeek(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="slv-profile">
              Listener profile
            </label>
            <select
              id="slv-profile"
              className={`mt-2 ${INPUT_CLASS}`}
              value={profile}
              onChange={(event) => setProfile(event.target.value)}
            >
              <option value="adult">
                Adult — {REFERENCE_LEVEL_ADULT_DB} dB(A) reference
              </option>
              <option value="sensitive">
                Child or sensitive listener — {REFERENCE_LEVEL_SENSITIVE_DB} dB(A) reference
              </option>
            </select>
          </div>
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section aria-live="polite" className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Allowed listening at this level
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok
                ? result.exceedsWeek
                  ? `${formatHours(result.allowedWeeklyHoursCapped)} (physical maximum)`
                  : formatHours(result.allowedWeeklyHours)
                : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? result.exceedsWeek
                  ? `There are only 168 hours in a week — the equal-energy formula alone would suggest ${formatHours(result.allowedWeeklyHours)}.`
                  : "per week, before the sound allowance is used up"
                : "Fix the inputs above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy safe listening result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5">
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={
              ok
                ? `${NUM1.format(result.allowanceUsedPercent)} percent of the weekly sound allowance used`
                : "No result available"
            }
          >
            <span
              className={`block h-full ${
                ok && !result.withinAllowance ? "bg-[var(--danger)]" : "bg-[var(--primary)]"
              }`}
              style={{ width: `${usedWidth}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            {ok
              ? `${NUM1.format(result.allowanceUsedPercent)}% of the weekly sound allowance used · ${result.band}`
              : DASH}
          </p>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Your weekly listening",
              ok ? formatHours(result.actualWeeklyHours) : DASH,
            ],
            [
              "Allowance used",
              ok ? `${NUM1.format(result.allowanceUsedPercent)}%` : DASH,
              ok && !result.withinAllowance ? "text-[var(--danger)]" : "text-[var(--success)]",
            ],
            [
              "Safe listening per day at this level",
              ok
                ? result.exceedsDay
                  ? `${formatHours(result.allowedDailyHoursCapped)} (physical maximum)`
                  : formatHours(result.allowedDailyHours)
                : DASH,
            ],
            [
              "Highest level that still fits your habit",
              ok && result.maxSafeLevelDb !== null
                ? `${NUM1.format(result.maxSafeLevelDb)} dB(A)`
                : DASH,
            ],
            [
              "Difference from the reference level",
              ok ? `${result.dbOverReference >= 0 ? "+" : ""}${NUM1.format(result.dbOverReference)} dB` : DASH,
            ],
            [
              "NIOSH occupational limit at this level",
              ok ? `${formatHours(result.nioshDailyHours)} a day` : DASH,
            ],
          ].map(([label, value, tone]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className={`text-right font-semibold ${tone || ""}`}>{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Allowed time by level</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Reference {ok ? result.referenceLevelDb : REFERENCE_LEVEL_ADULT_DB} dB(A) for{" "}
          {REFERENCE_HOURS_PER_WEEK} hours a week, halving every 3 dB.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Level</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Per week</th>
                <th scope="col" className="py-2 text-right font-semibold">Per day (7 days)</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row) => (
                <tr key={row.level} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{row.level} dB(A)</td>
                  <td className="py-2 pr-3 text-right">
                    {row.exceedsWeek
                      ? `${formatHours(row.weeklyHoursCapped)} (max)`
                      : formatHours(row.weeklyHours)}
                  </td>
                  <td className="py-2 text-right text-[var(--muted-foreground)]">
                    {row.exceedsDay
                      ? `${formatHours(row.dailyHoursCapped)} (max)`
                      : formatHours(row.dailyHours)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not a hearing test or medical advice. Phone volume percentages do not map
        reliably to decibels — output depends on the headphones and the track. If you notice ringing,
        muffled hearing or difficulty following conversation, see an audiologist.
      </p>
    </main>
  );
}
