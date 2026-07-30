"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, RotateCcw, ShieldAlert } from "lucide-react";
import { AREAS, CHECKLIST, MAX_MINUTES, TOTAL_MINUTES, planKit } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_DONE = ["dev-lock"];
const DEFAULT_MINUTES = "45";

export default function ToolHome() {
  const [done, setDone] = useState(DEFAULT_DONE);
  const [minutes, setMinutes] = useState(DEFAULT_MINUTES);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => planKit({ doneIds: done, minutesAvailable: minutes.trim() === "" ? NaN : Number(minutes) }),
    [done, minutes],
  );
  const ok = !result.error;

  const toggle = (id) => {
    setDone((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      "Student Privacy Starter Kit",
      `Score: ${Math.round(result.percent)}% (${result.band.label})`,
      `Controls done: ${result.completed} of ${result.total}`,
      `Critical controls still open: ${result.openCritical.length}`,
      `Setup time still outstanding: ${result.minutesRemaining} min`,
      "",
      `Next ${result.plan.length} action(s) in ${result.planMinutes} min:`,
      ...result.plan.map((item, index) => `${index + 1}. ${item.title} (${item.minutes} min)`),
      "",
      "Still open:",
      ...result.remaining.map((item) => `- ${item.title}`),
    ];
    return lines.join("\n");
  }, [ok, result]);

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
    setDone(DEFAULT_DONE);
    setMinutes(DEFAULT_MINUTES);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          Campus privacy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Student Privacy Starter Kit
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tick what you have already done on your accounts, devices, campus Wi-Fi and student
          portal. You get a weighted protection score and a plan that fits the time you actually
          have today.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="student-minutes">
              Minutes you can spend today
            </label>
            <input
              id="student-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_MINUTES}
              step="5"
              value={minutes}
              onChange={(event) => {
                setMinutes(event.target.value);
                setCopied(false);
              }}
            />
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              The whole kit takes about {TOTAL_MINUTES} minutes end to end.
            </p>
          </div>
          <div className="flex flex-wrap content-start gap-2 sm:pt-7">
            {[15, 30, 45, 90].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setMinutes(String(preset));
                  setCopied(false);
                }}
                className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                {preset} min
              </button>
            ))}
          </div>
        </div>
      </section>

      {!ok && (
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
              Protection score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${Math.round(result.percent)}%` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? `${result.band.label} — ${result.band.note}` : "Fix the input above to see your score."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy your student privacy score and action plan"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the checklist" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {ok && (
          <div className="mt-4">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Protection score ${Math.round(result.percent)} percent`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.max(0, Math.min(100, result.percent))}%` }}
              />
            </div>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Controls completed", ok ? `${result.completed} of ${result.total}` : DASH],
            ["Protection points earned", ok ? `${result.points} of ${result.maxPoints}` : DASH],
            [
              "Critical controls still open",
              ok ? `${result.openCritical.length}` : DASH,
            ],
            ["Setup time still outstanding", ok ? `${NUM.format(result.minutesRemaining)} min` : DASH],
            [
              "Score after today's plan",
              ok ? `${Math.round(result.projectedPercent)}% (${result.projectedBand.label})` : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">
            Do these next ({result.planMinutes} of {result.budgetMinutes} min)
          </h2>
          {result.plan.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              {result.remaining.length === 0
                ? "Nothing left open — every control in this kit is ticked."
                : "No open item fits that time budget. Allow a little more time to start the next one."}
            </p>
          ) : (
            <ol className="mt-3 space-y-3">
              {result.plan.map((item, index) => (
                <li key={item.id} className="rounded-lg border border-[var(--border)] p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--primary)] px-1.5 text-xs font-bold text-[var(--primary-foreground)]">
                      {index + 1}
                    </span>
                    <span className="text-sm font-semibold">{item.title}</span>
                    {item.critical && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--danger)]">
                        <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                        Critical
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">{item.action}</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {item.area} · about {item.minutes} min
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The full kit</h2>
        {AREAS.map((area) => {
          const areaStat = ok
            ? result.areaBreakdown.find((entry) => entry.area === area)
            : null;
          return (
            <div key={area} className="mt-5 first:mt-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {area}
                </h3>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {areaStat ? `${areaStat.done}/${areaStat.total} done` : DASH}
                </span>
              </div>
              <ul className="mt-2 space-y-2">
                {CHECKLIST.filter((item) => item.area === area).map((item) => {
                  const checked = done.includes(item.id);
                  return (
                    <li key={item.id} className="rounded-lg border border-[var(--border)] p-3">
                      <div className="flex items-start gap-3">
                        <input
                          id={`chk-${item.id}`}
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(item.id)}
                          className="mt-1 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                        />
                        <div className="min-w-0">
                          <label
                            htmlFor={`chk-${item.id}`}
                            className="block cursor-pointer text-sm font-semibold"
                          >
                            {item.title}
                          </label>
                          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{item.action}</p>
                          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                            Why: {item.why}
                          </p>
                          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                            {item.weight} protection point{item.weight === 1 ? "" : "s"} · about{" "}
                            {item.minutes} min
                            {item.critical ? " · critical" : ""}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational guidance only. Your institution's IT policy takes precedence — check with the
        campus IT helpdesk before changing managed device or network settings, and nothing here is
        legal advice.
      </p>
    </main>
  );
}
