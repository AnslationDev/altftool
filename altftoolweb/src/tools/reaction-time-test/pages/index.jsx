"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Download,
  History,
  RefreshCcw,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import SafeResponsiveContainer from "@/components/charts/SafeResponsiveContainer";

const STATES = { IDLE: "idle", WAITING: "waiting", GO: "go", RESULT: "result", EARLY: "early" };
const ROUNDS_PER_GAME = 5;
const MAX_DELAY_MS = 5000;
const MIN_DELAY_MS = 500;

function getReactionGrade(ms) {
  if (ms < 150) return { label: "Inhuman", tone: "good", colour: "#059669", desc: "Top 1% — possibly a professional gamer or fighter pilot." };
  if (ms < 200) return { label: "Excellent", tone: "good", colour: "#059669", desc: "Very fast reaction time — well above average." };
  if (ms < 250) return { label: "Good", tone: "good", colour: "#2563eb", desc: "Above average — solid reflexes for most tasks." };
  if (ms < 300) return { label: "Average", tone: "default", colour: "#f59e0b", desc: "Right around the typical human range (200–300ms)." };
  if (ms < 400) return { label: "Below Average", tone: "watch", colour: "#f97316", desc: "Slightly slower than average — could be fatigue or distraction." };
  if (ms < 500) return { label: "Slow", tone: "warn", colour: "#ef4444", desc: "Slower than most. Rest and focus can improve this." };
  return { label: "Very Slow", tone: "warn", colour: "#ef4444", desc: "Unusually slow — check for distractions or health issues." };
}

function formatMs(ms) {
  return `${Math.round(ms)}ms`;
}

function buildSummary(results, avgMs, bestMs, worstMs) {
  const grades = results.map((r) => getReactionGrade(r));
  return [
    "Reaction Time Test Summary",
    `Total rounds: ${results.length}`,
    `Results: ${results.map((r) => formatMs(r)).join(", ")}`,
    `Average: ${formatMs(avgMs)}`,
    `Best: ${formatMs(bestMs)}`,
    `Worst: ${formatMs(worstMs)}`,
    `Overall grade: ${getReactionGrade(avgMs).label}`,
    ...results.map((r, i) => `Round ${i + 1}: ${formatMs(r)} — ${getReactionGrade(r).label}`),
  ].join("\n");
}

function exportCsv(results) {
  const avg = results.length > 0 ? results.reduce((s, r) => s + r, 0) / results.length : 0;
  const best = results.length > 0 ? Math.min(...results) : 0;
  const worst = results.length > 0 ? Math.max(...results) : 0;
  const rows = [
    ["Round", "Reaction Time (ms)", "Grade"],
    ...results.map((r, i) => [i + 1, Math.round(r), getReactionGrade(r).label]),
    ["", "", ""],
    ["Summary", "", ""],
    ["Average", Math.round(avg), getReactionGrade(avg).label],
    ["Best", Math.round(best), getReactionGrade(best).label],
    ["Worst", Math.round(worst), getReactionGrade(worst).label],
  ];
  const csv = rows.map((row) => row.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "reaction-time-test.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function MetricCard({ icon: Icon, label, value, detail, tone = "default" }) {
  const toneClass =
    tone === "good"
      ? "bg-emerald-500/10 text-emerald-600"
      : tone === "warn"
        ? "bg-rose-500/10 text-rose-600"
        : tone === "watch"
          ? "bg-amber-500/10 text-amber-600"
          : "bg-[var(--section-highlight)] text-[var(--primary)]";

  return (
    <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
      <div className="flex min-w-0 items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="break-words text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
          <p className="mt-1 text-xl font-extrabold text-[var(--foreground)]">{value}</p>
          {detail && <p className="mt-1 break-words text-sm leading-5 text-[var(--muted-foreground)]">{detail}</p>}
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children, action }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
        <h3 className="flex items-center gap-2 text-base font-bold text-[var(--foreground)]">
          {Icon && <Icon className="h-5 w-5 shrink-0 text-[var(--primary)]" />}
          {title}
        </h3>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-sm shadow-lg">
      <p className="font-semibold text-[var(--foreground)]">Round {item.round}</p>
      <p className="text-[var(--primary)]">{formatMs(item.time)}</p>
      <p className="text-[var(--muted-foreground)]">{item.grade}</p>
    </div>
  );
}

export default function ReactionTimeTest() {
  const [phase, setPhase] = useState(STATES.IDLE);
  const [results, setResults] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);
  const [round, setRound] = useState(0);
  const [waitingStart, setWaitingStart] = useState(null);
  const [goStart, setGoStart] = useState(null);
  const [allTimeResults, setAllTimeResults] = useState([]);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const avgMs = useMemo(() => {
    if (results.length === 0) return 0;
    return results.reduce((s, r) => s + r, 0) / results.length;
  }, [results]);

  const bestMs = useMemo(() => (results.length > 0 ? Math.min(...results) : 0), [results]);
  const worstMs = useMemo(() => (results.length > 0 ? Math.max(...results) : 0), [results]);

  const allTimeAvg = useMemo(() => {
    if (allTimeResults.length === 0) return 0;
    return allTimeResults.reduce((s, r) => s + r, 0) / allTimeResults.length;
  }, [allTimeResults]);

  const allTimeBest = useMemo(() => (allTimeResults.length > 0 ? Math.min(...allTimeResults) : 0), [allTimeResults]);

  const chartData = useMemo(
    () => results.map((r, i) => ({ round: i + 1, time: r, grade: getReactionGrade(r).label, colour: getReactionGrade(r).colour })),
    [results]
  );

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const startRound = useCallback(() => {
    cleanup();
    setPhase(STATES.WAITING);
    setCurrentResult(null);
    const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
    timerRef.current = setTimeout(() => {
      startTimeRef.current = performance.now();
      setPhase(STATES.GO);
      setGoStart(performance.now());
    }, delay);
  }, [cleanup]);

  const handleStart = useCallback(() => {
    setResults([]);
    setRound(1);
    setAllTimeResults((prev) => [...prev]);
    startRound();
  }, [startRound]);

  const handleClick = useCallback(() => {
    if (phase === STATES.WAITING) {
      cleanup();
      setPhase(STATES.EARLY);
      setCurrentResult(null);
      return;
    }

    if (phase === STATES.GO) {
      const elapsed = performance.now() - startTimeRef.current;
      cleanup();
      setCurrentResult(elapsed);
      setResults((prev) => {
        const next = [...prev, elapsed];
        setAllTimeResults((allPrev) => [...allPrev, elapsed]);
        return next;
      });
      setPhase(STATES.RESULT);
      return;
    }

    if (phase === STATES.EARLY) {
      setPhase(STATES.IDLE);
      setRound(0);
      return;
    }

    if (phase === STATES.RESULT) {
      if (round >= ROUNDS_PER_GAME) {
        setPhase(STATES.IDLE);
        setRound(0);
        return;
      }
      setRound((prev) => prev + 1);
      startRound();
      return;
    }

    if (phase === STATES.IDLE) {
      handleStart();
      return;
    }
  }, [phase, round, cleanup, startRound, handleStart]);

  useEffect(() => {
    const handler = (e) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        handleClick();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleClick]);

  const handleResetAll = () => {
    cleanup();
    setPhase(STATES.IDLE);
    setResults([]);
    setCurrentResult(null);
    setRound(0);
    setAllTimeResults([]);
  };

  const bgColour =
    phase === STATES.GO
      ? "bg-emerald-500"
      : phase === STATES.EARLY
        ? "bg-rose-500"
        : phase === STATES.WAITING
          ? "bg-amber-400"
          : phase === STATES.RESULT
            ? "bg-blue-600"
            : "bg-[var(--primary)]";

  const areaText =
    phase === STATES.IDLE
      ? "Click or Press Space to Start"
      : phase === STATES.WAITING
        ? "Wait for Green…"
        : phase === STATES.GO
          ? "CLICK NOW!"
          : phase === STATES.EARLY
            ? "Too Early! Click to Try Again"
            : phase === STATES.RESULT && round >= ROUNDS_PER_GAME
              ? `Game Over — Click for Summary`
              : `Round ${round}/${ROUNDS_PER_GAME} — Click for Next`;

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)] transition-colors py-6 px-4">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
            <Zap className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Reaction Time Test
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-[var(--muted-foreground)]">
            Test your reflexes. Wait for the screen to turn green, then click as fast as you can. Your reaction time is measured in milliseconds.
          </p>
        </header>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard
            icon={Target}
            label="Current Best"
            value={results.length > 0 ? formatMs(bestMs) : "—"}
            detail={results.length > 0 ? getReactionGrade(bestMs).desc : "Complete a round to see"}
            tone={bestMs > 0 && bestMs < 250 ? "good" : bestMs >= 400 ? "warn" : "default"}
          />
          <MetricCard
            icon={Clock}
            label="Average"
            value={results.length > 0 ? formatMs(avgMs) : "—"}
            detail={results.length > 0 ? getReactionGrade(avgMs).label : "Complete rounds to see"}
            tone={avgMs > 0 && avgMs < 250 ? "good" : avgMs >= 400 ? "warn" : "default"}
          />
          <MetricCard
            icon={History}
            label="All-Time Best"
            value={allTimeBest > 0 ? formatMs(allTimeBest) : "—"}
            detail={allTimeResults.length > 0 ? `${allTimeResults.length} total rounds played` : "No history yet"}
            tone={allTimeBest > 0 && allTimeBest < 200 ? "good" : "default"}
          />
          <MetricCard
            icon={Trophy}
            label="Round"
            value={results.length > 0 ? `${results.length} / ${ROUNDS_PER_GAME}` : "0 / 5"}
            detail={phase === STATES.GO ? "GO — CLICK NOW!" : phase === STATES.WAITING ? "Waiting…" : "Click the area below"}
            tone={phase === STATES.GO ? "good" : phase === STATES.EARLY ? "warn" : "default"}
          />
        </div>

        {/* Reaction Area */}
        <div
          onClick={handleClick}
          className={`relative mb-6 flex h-80 w-full cursor-pointer select-none items-center justify-center rounded-3xl border-4 border-transparent transition-all duration-150 sm:h-96 ${bgColour} ${
            phase === STATES.GO
              ? "scale-[1.01] shadow-2xl shadow-emerald-500/30"
              : phase === STATES.EARLY
                ? "scale-[1.01] shadow-2xl shadow-rose-500/30"
                : "shadow-lg hover:shadow-xl"
          }`}
          role="button"
          tabIndex={0}
          aria-label="Reaction time test area"
        >
          <div className="text-center">
            {phase === STATES.RESULT && currentResult !== null ? (
              <>
                <p className="text-6xl font-extrabold text-white drop-shadow-lg sm:text-7xl">
                  {formatMs(currentResult)}
                </p>
                <p className="mt-2 text-lg font-bold text-white/90">
                  {getReactionGrade(currentResult).label}
                </p>
                <p className="mt-1 text-sm text-white/70">{getReactionGrade(currentResult).desc}</p>
              </>
            ) : (
              <>
                <p className="text-3xl font-extrabold text-white drop-shadow-lg sm:text-5xl">
                  {areaText}
                </p>
                {phase === STATES.WAITING && (
                  <p className="mt-3 text-sm text-white/70">Do not click until you see green</p>
                )}
              </>
            )}
          </div>

          {/* Round indicator dots */}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {Array.from({ length: ROUNDS_PER_GAME }, (_, i) => (
              <div
                key={i}
                className={`h-3 w-3 rounded-full transition-all ${
                  i < results.length
                    ? "bg-white shadow-md"
                    : i === results.length && (phase === STATES.WAITING || phase === STATES.GO)
                      ? "bg-white/50 animate-pulse"
                      : "bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Keyboard hint */}
        <p className="mb-6 text-center text-xs text-[var(--muted-foreground)]">
          Press <kbd className="rounded border border-[var(--border)] bg-[var(--card)] px-1.5 py-0.5 text-[var(--foreground)] font-mono text-xs">Space</kbd> or <kbd className="rounded border border-[var(--border)] bg-[var(--card)] px-1.5 py-0.5 text-[var(--foreground)] font-mono text-xs">Enter</kbd> to start and click
        </p>

        {/* Results + Chart */}
        {results.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.6fr)]">
            <SectionCard
              title="Round History"
              icon={History}
              action={
                <button onClick={() => exportCsv(results)} className="flex items-center gap-1.5 rounded-lg bg-[var(--primary)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors">
                  <Download className="h-3.5 w-3.5" />
                  CSV
                </button>
              }
            >
              <div className="space-y-2">
                {results.map((r, i) => {
                  const grade = getReactionGrade(r);
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                    >
                      <span className="w-12 text-sm font-bold text-[var(--muted-foreground)]">#{i + 1}</span>
                      <span className={`text-lg font-extrabold`} style={{ color: grade.colour }}>
                        {formatMs(r)}
                      </span>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                        grade.tone === "good"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : grade.tone === "warn"
                            ? "bg-rose-500/10 text-rose-600"
                            : grade.tone === "watch"
                              ? "bg-amber-500/10 text-amber-600"
                              : "bg-[var(--section-highlight)] text-[var(--primary)]"
                      }`}>
                        {grade.label}
                      </span>
                      <span className="ml-auto text-xs text-[var(--muted-foreground)]">{grade.desc.split("—")[0]}</span>
                      {r === bestMs && results.length > 1 && (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                          BEST
                        </span>
                      )}
                      {r === worstMs && results.length > 1 && (
                        <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                          WORST
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {results.length >= ROUNDS_PER_GAME && (
                <div className="mt-4 rounded-xl border-2 border-[var(--primary)]/30 bg-[var(--primary)]/5 p-4 text-center">
                  <p className="text-sm font-bold text-[var(--foreground)]">Game Complete!</p>
                  <p className="mt-1 text-2xl font-extrabold text-[var(--primary)]">{formatMs(avgMs)} average</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {getReactionGrade(avgMs).label} — {getReactionGrade(avgMs).desc}
                  </p>
                  <button
                    onClick={handleStart}
                    className="btn-primary mt-3 rounded-lg px-6 py-2 text-sm font-semibold"
                  >
                    Play Again
                  </button>
                </div>
              )}
            </SectionCard>

            <div className="space-y-6">
              <SectionCard title="Performance Chart" icon={BarChart3}>
                <div className="h-64">
                  <SafeResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ left: 5, right: 5, top: 5, bottom: 5 }}>
                      <XAxis dataKey="round" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} label={{ value: "Round", position: "bottom", fontSize: 11, fill: "var(--muted-foreground)" }} />
                      <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={(v) => `${v}ms`} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="time" radius={[6, 6, 0, 0]} name="Reaction Time">
                        {chartData.map((d, i) => (
                          <Cell key={i} fill={d.colour} />
                        ))}
                      </Bar>
                    </BarChart>
                  </SafeResponsiveContainer>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--muted-foreground)]">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-600" /> Excellent</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-600" /> Good</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Average</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" /> Slow</span>
                </div>
              </SectionCard>

              <SectionCard title="How It Works" icon={Zap} action={
                <button onClick={handleResetAll} className="flex items-center gap-1.5 rounded-lg bg-[var(--primary)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors">
                  <RefreshCcw className="h-3.5 w-3.5" />
                  Reset All
                </button>
              }>
                <div className="space-y-3">
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="mb-1 text-sm font-bold text-[var(--foreground)]">1. Wait</p>
                    <p className="text-sm text-[var(--muted-foreground)]">After clicking start, the screen turns amber. Do NOT click yet.</p>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="mb-1 text-sm font-bold text-[var(--foreground)]">2. React</p>
                    <p className="text-sm text-[var(--muted-foreground)]">When it turns green, click or tap as fast as you can.</p>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="mb-1 text-sm font-bold text-[var(--foreground)]">3. Repeat</p>
                    <p className="text-sm text-[var(--muted-foreground)]">Complete {ROUNDS_PER_GAME} rounds to get your average score.</p>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Reaction Time Benchmarks" icon={Target}>
                <div className="space-y-2">
                  {[
                    { label: "Professional gamer", range: "150–180ms", colour: "bg-emerald-500" },
                    { label: "Average human", range: "200–300ms", colour: "bg-blue-500" },
                    { label: "Audio stimulus", range: "160ms", colour: "bg-purple-500" },
                    { label: "Visual stimulus", range: "250ms", colour: "bg-amber-500" },
                    { label: "Average driver", range: "300–400ms", colour: "bg-orange-500" },
                    { label: "Senior / distracted", range: "400–600ms", colour: "bg-rose-500" },
                  ].map((bench) => (
                    <div key={bench.label} className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2">
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${bench.colour}`} />
                      <span className="min-w-0 flex-1 text-sm font-medium text-[var(--foreground)]">{bench.label}</span>
                      <span className="shrink-0 text-xs font-bold text-[var(--muted-foreground)]">{bench.range}</span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
          All data is processed in your browser. Your reaction times are never stored or uploaded.
        </p>
      </div>
    </div>
  );
}
