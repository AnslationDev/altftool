"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Baby, Check, Copy, RotateCcw } from "lucide-react";

import { URGENT_SIGNS, assessByGestation, assessPregnancyWeek } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = { mode: "week", weeks: "20", days: "0", lmp: "", onDate: "" };
const DASH = "—";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [weeks, setWeeks] = useState(DEFAULTS.weeks);
  const [days, setDays] = useState(DEFAULTS.days);
  const [lmp, setLmp] = useState(DEFAULTS.lmp);
  const [onDate, setOnDate] = useState(DEFAULTS.onDate);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (mode === "lmp") {
      return assessPregnancyWeek({ lmpDate: lmp, onDate });
    }
    return assessByGestation({ weeks: toNumber(weeks), days: toNumber(days) });
  }, [mode, weeks, days, lmp, onDate]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Trimester Symptom Guide",
      `Gestational age: ${result.gestationLabel} (${result.trimesterLabel} trimester, ${result.termBand.label})`,
    ];
    if (result.dueDate) {
      lines.push(`Estimated due date: ${result.dueDate} (${result.daysToDue} days away)`);
    }
    lines.push(
      "",
      "Common right now:",
      ...result.activeSymptoms.map((item) => `- ${item.name}`),
      "",
      "Checks usually offered around now:",
      ...(result.currentMilestones.length
        ? result.currentMilestones.map((item) => `- ${item.name}`)
        : ["- none scheduled in this exact week"]),
    );
    if (result.nextMilestone) {
      lines.push("", `Next check: ${result.nextMilestone.name} from week ${result.nextMilestone.from}`);
    }
    return lines.join("\n");
  }, [hasError, result]);

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
    setMode(DEFAULTS.mode);
    setWeeks(DEFAULTS.weeks);
    setDays(DEFAULTS.days);
    setLmp(DEFAULTS.lmp);
    setOnDate(DEFAULTS.onDate);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Baby className="h-4 w-4" aria-hidden="true" />
          Pregnancy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Trimester Symptom Guide</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a gestational week and see what is commonly felt in that window, which antenatal checks
          fall around it, and which signs should never be filed under &ldquo;normal pregnancy&rdquo;.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap gap-2" role="group" aria-label="How to enter your stage of pregnancy">
          {[
            ["week", "I know my week"],
            ["lmp", "Work it out from my last period"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              aria-pressed={mode === value}
              className={
                mode === value
                  ? `${PRIMARY_BTN} flex-1`
                  : `${GHOST_BTN} flex-1 text-[var(--muted-foreground)]`
              }
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "week" ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="tsg-weeks">
                Completed weeks
              </label>
              <input
                id="tsg-weeks"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max="44"
                step="1"
                value={weeks}
                onChange={(event) => setWeeks(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="tsg-days">
                Extra days (0-6)
              </label>
              <input
                id="tsg-days"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max="6"
                step="1"
                value={days}
                onChange={(event) => setDays(event.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="tsg-lmp">
                First day of last period
              </label>
              <input
                id="tsg-lmp"
                className={`mt-2 ${INPUT_CLASS}`}
                type="date"
                value={lmp}
                onChange={(event) => setLmp(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="tsg-on">
                Show the guide for this date
              </label>
              <input
                id="tsg-on"
                className={`mt-2 ${INPUT_CLASS}`}
                type="date"
                value={onDate}
                onChange={(event) => setOnDate(event.target.value)}
              />
            </div>
          </div>
        )}
      </section>

      {hasError && (
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
              Gestational age
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.gestationLabel}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fill in the fields above to see the timeline."
                : `${result.trimesterLabel} trimester · ${result.termBand.label}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy this week's pregnancy summary"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Trimester", hasError ? DASH : `${result.trimesterLabel} (${result.trimester} of 3)`],
            ["Weeks completed", hasError ? DASH : `${result.weeks}w ${result.days}d of 40w`],
            ["Estimated due date", hasError || !result.dueDate ? DASH : result.dueDate],
            [
              "Days until due date",
              hasError || result.daysToDue === null ? DASH : `${result.daysToDue}`,
            ],
            [
              "Progress through 40 weeks",
              hasError ? DASH : `${result.progressPercent.toFixed(0)}%`,
            ],
            ["Symptoms typical this week", hasError ? DASH : `${result.activeSymptoms.length}`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div className="mt-5">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`${result.progressPercent.toFixed(0)} percent through a 40 week pregnancy`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${result.progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </section>

      {!hasError && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Commonly reported at {result.weeks} weeks</h2>
            <ul className="mt-3 divide-y divide-[var(--border)] text-sm">
              {result.activeSymptoms.length === 0 && (
                <li className="py-2.5 text-[var(--muted-foreground)]">
                  Nothing is typical of this exact week in the list above.
                </li>
              )}
              {result.activeSymptoms.map((item) => (
                <li key={item.id} className="py-3">
                  <p className="font-semibold">{item.name}</p>
                  <p className="mt-1 text-[var(--muted-foreground)]">{item.note}</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    Usual window: weeks {item.from}-{item.to}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {result.upcomingSymptoms.length > 0 && (
            <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">Starting in the next four weeks</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {result.upcomingSymptoms.map((item) => (
                  <li key={item.id} className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-[var(--muted-foreground)]">from week {item.from}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Antenatal checks around this point</h2>
            <ul className="mt-3 divide-y divide-[var(--border)] text-sm">
              {result.currentMilestones.length === 0 && (
                <li className="py-2.5 text-[var(--muted-foreground)]">
                  No routine check falls in this exact week.
                </li>
              )}
              {result.currentMilestones.map((item) => (
                <li key={item.id} className="py-3">
                  <p className="font-semibold">{item.name}</p>
                  <p className="mt-1 text-[var(--muted-foreground)]">{item.note}</p>
                </li>
              ))}
            </ul>
            {result.nextMilestone && (
              <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
                Next up: {result.nextMilestone.name}, usually from week {result.nextMilestone.from}.
              </p>
            )}
          </section>
        </>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--danger)]">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          Never wait on these
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--foreground)]">
          {URGENT_SIGNS.map((sign) => (
            <li key={sign} className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-[var(--danger)]">
              {sign}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        General information only, not medical advice or a diagnosis. Symptom timing varies widely and
        screening schedules differ by country and clinic — your midwife or obstetrician is the authority
        on your own care.
      </p>
    </main>
  );
}
