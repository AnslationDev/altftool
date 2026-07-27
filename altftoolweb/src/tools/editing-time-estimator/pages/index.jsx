"use client";

import { useMemo, useState } from "react";
import { Film, RotateCcw } from "lucide-react";
import { estimateEditingTime, formatDuration } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [rawMinutes, setRawMinutes] = useState("180");
  const [finishedMinutes, setFinishedMinutes] = useState("8");
  const [graphicsCount, setGraphicsCount] = useState("4");
  const [revisionRounds, setRevisionRounds] = useState("2");
  const [hourlyRate, setHourlyRate] = useState("50");

  const result = useMemo(
    () => estimateEditingTime({
      rawMinutes: Number(rawMinutes),
      finishedMinutes: Number(finishedMinutes),
      graphicsCount: Number(graphicsCount),
      revisionRounds: Number(revisionRounds),
      hourlyRate: Number(hourlyRate),
    }),
    [rawMinutes, finishedMinutes, graphicsCount, revisionRounds, hourlyRate],
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Film className="h-4 w-4" aria-hidden="true" /> Video edit planning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Editing Time Estimator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Estimate edit hours from raw footage, final runtime, graphics and revision rounds.</p>
      </header>
      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["Raw footage minutes", rawMinutes, setRawMinutes],
            ["Finished runtime minutes", finishedMinutes, setFinishedMinutes],
            ["Motion graphics count", graphicsCount, setGraphicsCount],
            ["Revision rounds", revisionRounds, setRevisionRounds],
            ["Hourly rate", hourlyRate, setHourlyRate],
          ].map(([label, value, setter]) => (
            <label key={label} className="text-sm font-semibold">{label}
              <input className={`mt-2 ${INPUT_CLASS}`} type="number" min="0" value={value} onChange={(e) => setter(e.target.value)} />
            </label>
          ))}
        </div>
      </section>
      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        {result.error ? <p role="alert" className="text-sm font-semibold text-[var(--danger)]">{result.error}</p> : (
          <>
            <div className="grid gap-4 sm:grid-cols-4">
              <div><p className="text-xs uppercase text-[var(--muted-foreground)]">Total</p><p className="text-2xl font-semibold">{formatDuration(result.totalMinutes)}</p></div>
              <div><p className="text-xs uppercase text-[var(--muted-foreground)]">Working days</p><p className="text-2xl font-semibold">{result.workingDays.toFixed(1)}</p></div>
              <div><p className="text-xs uppercase text-[var(--muted-foreground)]">Edit ratio</p><p className="text-2xl font-semibold">{result.minutesPerFinishedMinute.toFixed(0)}:1</p></div>
              <div><p className="text-xs uppercase text-[var(--muted-foreground)]">Cost</p><p className="text-2xl font-semibold">{result.cost ? `$${Math.round(result.cost)}` : "—"}</p></div>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {result.tasks.map((task) => <li key={task.key} className="flex justify-between border-b border-[var(--border)] py-2"><span>{task.label}</span><span>{formatDuration(task.minutes)}</span></li>)}
            </ul>
          </>
        )}
        <button type="button" className={`mt-4 ${GHOST_BTN}`} onClick={() => { setRawMinutes("180"); setFinishedMinutes("8"); setGraphicsCount("4"); setRevisionRounds("2"); setHourlyRate("50"); }}>
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      </section>
    </main>
  );
}
