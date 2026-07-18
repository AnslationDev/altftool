"use client";

import { useMemo, useState } from "react";
import {
  CalendarCheck,
  Copy,
  GraduationCap,
  RotateCcw,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const EPS = 1e-9;
const requiredPresets = [65, 70, 75, 80, 85];

const formatPct = (value) =>
  `${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 }).format(
    Number.isFinite(value) ? value : 0
  )}%`;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function ToolHome() {
  const [attended, setAttended] = useState(42);
  const [total, setTotal] = useState(50);
  const [required, setRequired] = useState(75);
  const [remaining, setRemaining] = useState("");
  const [copied, setCopied] = useState(false);

  const T = Math.max(Math.floor(Number(total) || 0), 0);
  const rawA = Math.max(Math.floor(Number(attended) || 0), 0);
  const A = Math.min(rawA, T);
  const attendedOverflow = rawA > T;
  const reqPct = clamp(Number(required) || 0, 1, 100);
  const p = reqPct / 100;
  const R = Math.max(Math.floor(Number(remaining) || 0), 0);
  const hasPlanner = remaining !== "" && R > 0;

  const result = useMemo(() => {
    if (T === 0) return null;
    const current = (A / T) * 100;
    const onTrack = current >= reqPct - EPS;

    if (onTrack) {
      const rawSkip = A / p - T;
      const skippable = Math.max(Math.floor(rawSkip + EPS), 0);
      return {
        current,
        onTrack,
        skippable,
        rawSkip,
        impossible: false,
      };
    }

    const impossible = p >= 1 - EPS;
    const rawNeed = impossible ? 0 : (p * T - A) / (1 - p);
    const needed = impossible ? 0 : Math.max(Math.ceil(rawNeed - EPS), 0);
    return { current, onTrack, needed, rawNeed, impossible };
  }, [A, T, p, reqPct]);

  const planner = useMemo(() => {
    if (!result || !hasPlanner) return null;
    const finalTotal = T + R;
    const attendAllPct = ((A + R) / finalTotal) * 100;
    const skipAllPct = (A / finalTotal) * 100;
    const maxBunks = clamp(Math.floor(A + R - p * finalTotal + EPS), 0, R);
    return {
      finalTotal,
      attendAllPct,
      skipAllPct,
      maxBunks,
      perfectNotEnough: attendAllPct < reqPct - EPS,
    };
  }, [A, R, T, hasPlanner, p, reqPct, result]);

  const whatIf = useMemo(() => {
    if (!result) return [];
    return Array.from({ length: 10 }, (_, index) => {
      const n = index + 1;
      return {
        n,
        attendAll: ((A + n) / (T + n)) * 100,
        skipAll: (A / (T + n)) * 100,
        alternate: ((A + Math.ceil(n / 2)) / (T + n)) * 100,
      };
    });
  }, [A, T, result]);

  const answerText = !result
    ? ""
    : result.onTrack
      ? result.skippable > 0
        ? `You can skip the next ${result.skippable} class${result.skippable === 1 ? "" : "es"} and still stay at or above ${formatPct(reqPct)}. Bunks in the bank.`
        : `You are at target, but with zero margin — skip even one class and you dip below ${formatPct(reqPct)}.`
      : result.impossible
        ? `A ${formatPct(reqPct)} target with missed classes on record is mathematically out of reach — every class already held counts.`
        : `Attend the next ${result.needed} class${result.needed === 1 ? "" : "es"} in a row to climb back to ${formatPct(reqPct)}. No detours.`;

  const algebraText = !result
    ? ""
    : result.onTrack
      ? `Algebra: ${A} / (${T} + z) ≥ ${p} → z ≤ ${A} / ${p} − ${T} = ${result.rawSkip.toFixed(2)} → z = ${result.skippable}`
      : result.impossible
        ? `Algebra: (${A} + x) / (${T} + x) < 100% whenever x is finite and ${A} < ${T}`
        : `Algebra: (${A} + x) / (${T} + x) ≥ ${p} → x ≥ (${p} × ${T} − ${A}) / (1 − ${p}) = ${result.rawNeed.toFixed(2)} → x = ${result.needed}`;

  const summary = useMemo(
    () =>
      [
        "Attendance Calculator Summary",
        `Attended: ${A} of ${T} classes`,
        result ? `Current attendance: ${formatPct(result.current)}` : "Current attendance: —",
        `Required: ${formatPct(reqPct)}`,
        answerText,
        algebraText,
        planner
          ? `With ${R} classes left: attend all → ${formatPct(planner.attendAllPct)}, skip all → ${formatPct(planner.skipAllPct)}, max safe bunks → ${planner.maxBunks}`
          : "",
        `Generated: ${new Date().toLocaleString()}`,
      ]
        .filter(Boolean)
        .join("\n"),
    [A, R, T, algebraText, answerText, planner, reqPct, result]
  );

  const copySummary = async () => {
    const success = await safeCopyText(summary);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const statusColor = result && result.onTrack ? "var(--anslation-ds-success)" : "var(--anslation-ds-danger)";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <CalendarCheck className="h-4 w-4" />
            Student essential
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Attendance Percentage Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Know exactly where you stand against the attendance cutoff — how many classes to attend to
            recover, or how many you can safely skip without a visit to the department office.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="grid gap-5">
              <label className="block">
                <span className="text-sm font-semibold">Classes attended</span>
                <input
                  type="number"
                  min={0}
                  value={attended}
                  onChange={(event) => setAttended(Number(event.target.value))}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Total classes held</span>
                <input
                  type="number"
                  min={0}
                  value={total}
                  onChange={(event) => setTotal(Number(event.target.value))}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
                {attendedOverflow && (
                  <span className="mt-1 block text-xs font-semibold" style={{ color: "var(--anslation-ds-danger)" }}>
                    Attended can&apos;t exceed total held — calculating with {T}.
                  </span>
                )}
              </label>

              <div>
                <label className="block" htmlFor="required-pct">
                  <span className="text-sm font-semibold">Required percentage</span>
                  <input
                    id="required-pct"
                    type="number"
                    min={1}
                    max={100}
                    value={required}
                    onChange={(event) => setRequired(Number(event.target.value))}
                    className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {requiredPresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRequired(preset)}
                      className={`rounded-md border px-3 py-1.5 text-sm font-semibold transition ${
                        reqPct === preset
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                      }`}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
              </div>

              <label className="block border-t border-[var(--border)] pt-5">
                <span className="text-sm font-semibold">Classes remaining this semester (optional)</span>
                <input
                  type="number"
                  min={0}
                  value={remaining}
                  placeholder="e.g. 30"
                  onChange={(event) => setRemaining(event.target.value)}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
                <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                  Fill this in to unlock the semester-end planner below.
                </span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setAttended(42);
                  setTotal(50);
                  setRequired(75);
                  setRemaining("");
                }}
                className="inline-flex items-center gap-1 justify-self-start text-xs font-semibold text-[var(--primary)]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                Your attendance right now
              </p>
              <button type="button" onClick={copySummary} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                <Copy className="h-4 w-4" />
                {copied ? "Copied" : "Copy result"}
              </button>
            </div>

            <div aria-live="polite" className="mt-4">
              {!result ? (
                <div className="rounded-md bg-[var(--muted)] p-5 text-sm text-[var(--muted-foreground)]">
                  Enter how many classes were held to see where you stand.
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="inline-block rounded-lg bg-[var(--muted)] p-5">
                      <p className="text-4xl font-semibold" style={{ color: statusColor }}>
                        {formatPct(result.current)}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--muted-foreground)]">
                      {result.onTrack ? (
                        <TrendingUp className="h-4 w-4" style={{ color: "var(--anslation-ds-success)" }} />
                      ) : (
                        <TrendingDown className="h-4 w-4" style={{ color: "var(--anslation-ds-danger)" }} />
                      )}
                      {result.onTrack ? "Safe zone" : "Catch-up mode"} · target {formatPct(reqPct)}
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="relative h-3 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${clamp(result.current, 0, 100)}%`,
                          background: statusColor,
                        }}
                      />
                      <div
                        aria-hidden="true"
                        className="absolute top-0 h-full w-0.5"
                        style={{ left: `${clamp(reqPct, 0, 100)}%`, background: "var(--foreground)" }}
                      />
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-[var(--muted-foreground)]">
                      <span>
                        {A} of {T} attended
                      </span>
                      <span>marker = {formatPct(reqPct)} target</span>
                    </div>
                  </div>

                  <div className="mt-6 rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-[var(--primary)]" />
                      <h3 className="font-semibold">The smart answer</h3>
                    </div>
                    <p className="mt-2 text-sm leading-6">{answerText}</p>
                    <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{algebraText}</p>
                  </div>

                  {planner && (
                    <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-[var(--primary)]" />
                        <h3 className="font-semibold">Semester-end planner · {R} classes left</h3>
                      </div>
                      <div className="tool-compact-grid mt-3">
                        <div className="rounded-md bg-[var(--muted)] p-3">
                          <p className="text-xs text-[var(--muted-foreground)]">Max bunks you can afford</p>
                          <p className="mt-1 font-semibold">{planner.maxBunks} of {R}</p>
                        </div>
                        <div className="rounded-md bg-[var(--muted)] p-3">
                          <p className="text-xs text-[var(--muted-foreground)]">Attend everything</p>
                          <p className="mt-1 font-semibold" style={{ color: "var(--anslation-ds-success)" }}>
                            {formatPct(planner.attendAllPct)}
                          </p>
                        </div>
                        <div className="rounded-md bg-[var(--muted)] p-3">
                          <p className="text-xs text-[var(--muted-foreground)]">Skip everything</p>
                          <p className="mt-1 font-semibold" style={{ color: "var(--anslation-ds-danger)" }}>
                            {formatPct(planner.skipAllPct)}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                        {planner.perfectNotEnough
                          ? `Heads-up: even with perfect attendance you finish at ${formatPct(planner.attendAllPct)} — below the ${formatPct(reqPct)} cutoff. Time to talk to your coordinator about condonation.`
                          : `Final total will be ${planner.finalTotal} classes. Stay within ${planner.maxBunks} bunk${planner.maxBunks === 1 ? "" : "s"} and you graduate the semester at or above ${formatPct(reqPct)}.`}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        {result && (
          <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <h2 className="text-lg font-semibold">What-if: the next 10 classes</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Three futures for every count of upcoming classes — full attendance, full bunk, and the
              classic attend-one-skip-one strategy.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    <th className="px-3 py-2">Next classes</th>
                    <th className="px-3 py-2">Attend all</th>
                    <th className="px-3 py-2">Skip all</th>
                    <th className="px-3 py-2">Alternate (1 on, 1 off)</th>
                  </tr>
                </thead>
                <tbody>
                  {whatIf.map((row) => (
                    <tr key={row.n} className="border-b border-[var(--border)] last:border-b-0">
                      <td className="px-3 py-2 font-semibold">+{row.n}</td>
                      <td className="px-3 py-2" style={{ color: row.attendAll >= reqPct ? "var(--anslation-ds-success)" : "var(--anslation-ds-danger)" }}>
                        {formatPct(row.attendAll)}
                      </td>
                      <td className="px-3 py-2" style={{ color: row.skipAll >= reqPct ? "var(--anslation-ds-success)" : "var(--anslation-ds-danger)" }}>
                        {formatPct(row.skipAll)}
                      </td>
                      <td className="px-3 py-2" style={{ color: row.alternate >= reqPct ? "var(--anslation-ds-success)" : "var(--anslation-ds-danger)" }}>
                        {formatPct(row.alternate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
