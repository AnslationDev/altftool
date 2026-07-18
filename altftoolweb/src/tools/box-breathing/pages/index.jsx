"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Brain,
  Check,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Wind,
} from "lucide-react";

const STATS_KEY = "altf:box-breathing:stats";

const PHASES = [
  { id: "inhale", word: "Breathe in", short: "In", freq: 440 },
  { id: "hold1", word: "Hold", short: "Hold", freq: 587.33 },
  { id: "exhale", word: "Breathe out", short: "Out", freq: 349.23 },
  { id: "hold2", word: "Hold", short: "Hold", freq: 293.66 },
];

const PATTERNS = [
  {
    id: "box",
    label: "Box",
    counts: [4, 4, 4, 4],
    when: "You need to steady yourself before something high-pressure.",
  },
  {
    id: "478",
    label: "Relaxing 4-7-8",
    counts: [4, 7, 8, 0],
    when: "You are trying to fall asleep, or coming down from a spike of anxiety.",
  },
  {
    id: "coherent",
    label: "Coherent 5-5",
    counts: [5, 0, 5, 0],
    when: "You want an easy everyday pace at about six breaths a minute.",
  },
  {
    id: "calming",
    label: "Calming 4-6",
    counts: [4, 0, 6, 0],
    when: "You feel wired and want the long exhale to do the work.",
  },
  {
    id: "energizing",
    label: "Energizing 6-2-4-2",
    counts: [6, 2, 4, 2],
    when: "You are flat after lunch and want alertness without more caffeine.",
  },
  {
    id: "custom",
    label: "Custom",
    counts: [4, 4, 4, 4],
    when: "You already know the count that works for you.",
  },
];

const pad2 = (value) => String(value).padStart(2, "0");
const dayKey = (date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

const smoothstep = (t) => t * t * (3 - 2 * t);

const formatClock = (totalSeconds) => {
  const safe = Math.max(0, Math.round(totalSeconds));
  return `${Math.floor(safe / 60)}:${pad2(safe % 60)}`;
};

function computeStreak(days) {
  const cursor = new Date();
  let streak = 0;
  for (let i = 0; i < 400; i += 1) {
    const key = dayKey(cursor);
    if (days[key]) {
      streak += 1;
    } else if (i > 0) {
      break;
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function BreathingSquare({ activeIndex, t }) {
  const x0 = 40;
  const y0 = 40;
  const x1 = 280;
  const y1 = 280;
  const side = x1 - x0;
  const perimeter = side * 4;
  const eased = Math.min(1, Math.max(0, t));

  const corners = [
    [x0, y1],
    [x0, y0],
    [x1, y0],
    [x1, y1],
  ];
  const [sx, sy] = corners[activeIndex];
  const [ex, ey] = corners[(activeIndex + 1) % 4];
  const dotX = sx + (ex - sx) * eased;
  const dotY = sy + (ey - sy) * eased;
  const travelled = (activeIndex + eased) * side;

  return (
    <svg viewBox="0 0 320 320" className="h-full w-full" aria-hidden="true">
      <rect
        x={x0}
        y={y0}
        width={side}
        height={side}
        rx="10"
        fill="none"
        stroke="var(--border)"
        strokeWidth="6"
      />
      <path
        d={`M ${x0} ${y1} L ${x0} ${y0} L ${x1} ${y0} L ${x1} ${y1} Z`}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={perimeter}
        strokeDashoffset={perimeter - travelled}
        opacity="0.85"
      />
      <circle cx={dotX} cy={dotY} r="11" fill="var(--primary)" />
      <circle cx={dotX} cy={dotY} r="19" fill="var(--primary)" opacity="0.18" />
    </svg>
  );
}

function BreathingCircle({ phaseId, t }) {
  const rMin = 46;
  const rMax = 116;
  const eased = smoothstep(Math.min(1, Math.max(0, t)));
  let radius = rMin;
  if (phaseId === "inhale") radius = rMin + eased * (rMax - rMin);
  else if (phaseId === "exhale") radius = rMax - eased * (rMax - rMin);
  else if (phaseId === "hold1") radius = rMax;

  return (
    <svg viewBox="0 0 320 320" className="h-full w-full" aria-hidden="true">
      <circle cx="160" cy="160" r={rMax} fill="none" stroke="var(--border)" strokeWidth="2" />
      <circle cx="160" cy="160" r={radius} fill="var(--primary)" opacity="0.16" />
      <circle
        cx="160"
        cy="160"
        r={radius}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="6"
      />
    </svg>
  );
}

export default function ToolHome() {
  const [patternId, setPatternId] = useState("box");
  const [customCounts, setCustomCounts] = useState([4, 4, 4, 4]);
  const [lengthMode, setLengthMode] = useState("rounds");
  const [roundTarget, setRoundTarget] = useState(8);
  const [minuteTarget, setMinuteTarget] = useState(3);
  const [toneOn, setToneOn] = useState(true);
  const [tickOn, setTickOn] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);
  const [tick, setTick] = useState({ activeIndex: 0, round: 0, remaining: 0, t: 0 });
  const [stats, setStats] = useState({ sessions: 0, totalSeconds: 0, days: {} });

  const audioRef = useRef(null);
  const frameRef = useRef(0);
  const baseRef = useRef(0);
  const accRef = useRef(0);
  const lastPhaseRef = useRef("");
  const lastTickSecondRef = useRef(-1);
  const lastPushRef = useRef(null);
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReduceMotion(media.matches);
      reduceMotionRef.current = media.matches;
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STATS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          setStats({
            sessions: Number(parsed.sessions) || 0,
            totalSeconds: Number(parsed.totalSeconds) || 0,
            days: parsed.days && typeof parsed.days === "object" ? parsed.days : {},
          });
        }
      }
    } catch {}
  }, []);

  const pattern = useMemo(
    () => PATTERNS.find((item) => item.id === patternId) || PATTERNS[0],
    [patternId]
  );

  const counts = useMemo(
    () => (patternId === "custom" ? customCounts : pattern.counts),
    [patternId, customCounts, pattern]
  );

  const activePhases = useMemo(
    () =>
      PHASES.map((phase, index) => ({ ...phase, duration: counts[index] })).filter(
        (phase) => phase.duration > 0
      ),
    [counts]
  );

  const cycleSeconds = useMemo(
    () => counts.reduce((sum, value) => sum + value, 0),
    [counts]
  );

  const isBox = counts[1] > 0 && counts[3] > 0;

  const totalRounds = useMemo(() => {
    if (lengthMode === "rounds") return Math.max(1, roundTarget);
    if (cycleSeconds <= 0) return 1;
    return Math.max(1, Math.round((minuteTarget * 60) / cycleSeconds));
  }, [lengthMode, roundTarget, minuteTarget, cycleSeconds]);

  const sessionSeconds = totalRounds * cycleSeconds;

  const ensureAudio = useCallback(() => {
    try {
      if (!audioRef.current) {
        const Ctor = window.AudioContext || window.webkitAudioContext;
        if (Ctor) audioRef.current = new Ctor();
      }
      if (audioRef.current?.state === "suspended") audioRef.current.resume();
    } catch {}
  }, []);

  const playTone = useCallback((freq, kind) => {
    const ctx = audioRef.current;
    if (!ctx) return;
    try {
      const at = ctx.currentTime + 0.01;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const peak = kind === "tick" ? 0.04 : 0.12;
      const length = kind === "tick" ? 0.05 : 0.45;
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(peak, at + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(at);
      osc.stop(at + length + 0.05);
    } catch {}
  }, []);

  const saveSession = useCallback((seconds) => {
    if (seconds < 5) return;
    setStats((current) => {
      const key = dayKey(new Date());
      const next = {
        sessions: current.sessions + 1,
        totalSeconds: current.totalSeconds + Math.round(seconds),
        days: { ...current.days, [key]: (current.days[key] || 0) + Math.round(seconds) },
      };
      try {
        window.localStorage.setItem(STATS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const stopSession = useCallback(
    (logSeconds) => {
      cancelAnimationFrame(frameRef.current);
      if (logSeconds > 0) saveSession(logSeconds);
      setRunning(false);
      setPaused(false);
      accRef.current = 0;
      lastPhaseRef.current = "";
      lastTickSecondRef.current = -1;
      lastPushRef.current = null;
    },
    [saveSession]
  );

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  useEffect(() => {
    if (!running || paused || finished) return undefined;
    if (!activePhases.length || cycleSeconds <= 0) return undefined;

    let cancelled = false;
    const loop = () => {
      if (cancelled) return;
      const elapsed = accRef.current + (performance.now() - baseRef.current) / 1000;

      if (elapsed >= sessionSeconds) {
        cancelAnimationFrame(frameRef.current);
        setFinished(true);
        setRunning(false);
        setPaused(false);
        saveSession(sessionSeconds);
        if (toneOn) playTone(523.25, "phase");
        return;
      }

      const round = Math.floor(elapsed / cycleSeconds);
      let pos = elapsed - round * cycleSeconds;
      let phase = activePhases[activePhases.length - 1];
      let phaseElapsed = phase.duration;
      let activeIndex = activePhases.length - 1;

      for (let i = 0; i < activePhases.length; i += 1) {
        if (pos < activePhases[i].duration) {
          phase = activePhases[i];
          phaseElapsed = pos;
          activeIndex = i;
          break;
        }
        pos -= activePhases[i].duration;
      }

      const phaseKey = `${round}:${phase.id}`;
      if (phaseKey !== lastPhaseRef.current) {
        lastPhaseRef.current = phaseKey;
        if (toneOn) playTone(phase.freq, "phase");
      }

      if (tickOn) {
        const second = Math.floor(elapsed);
        if (second !== lastTickSecondRef.current) {
          lastTickSecondRef.current = second;
          playTone(1200, "tick");
        }
      }

      const remaining = phase.duration - phaseElapsed;
      const next = {
        activeIndex,
        phaseId: phase.id,
        word: phase.word,
        round,
        remaining,
        t: phase.duration > 0 ? phaseElapsed / phase.duration : 0,
      };

      const prev = lastPushRef.current;
      const shouldSkip =
        reduceMotionRef.current &&
        prev &&
        prev.phaseId === next.phaseId &&
        prev.round === next.round &&
        Math.ceil(prev.remaining) === Math.ceil(next.remaining);

      if (!shouldSkip) {
        lastPushRef.current = next;
        setTick(next);
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frameRef.current);
    };
  }, [
    running,
    paused,
    finished,
    activePhases,
    cycleSeconds,
    sessionSeconds,
    toneOn,
    tickOn,
    playTone,
    saveSession,
  ]);

  const startSession = () => {
    if (cycleSeconds <= 0) return;
    ensureAudio();
    accRef.current = 0;
    baseRef.current = performance.now();
    lastPhaseRef.current = "";
    lastTickSecondRef.current = -1;
    lastPushRef.current = null;
    setTick({ activeIndex: 0, phaseId: activePhases[0].id, word: activePhases[0].word, round: 0, remaining: activePhases[0].duration, t: 0 });
    setFinished(false);
    setPaused(false);
    setRunning(true);
  };

  const togglePause = () => {
    if (paused) {
      baseRef.current = performance.now();
      setPaused(false);
      return;
    }
    accRef.current += (performance.now() - baseRef.current) / 1000;
    setPaused(true);
  };

  const endEarly = () => {
    const elapsed = paused
      ? accRef.current
      : accRef.current + (performance.now() - baseRef.current) / 1000;
    stopSession(elapsed);
  };

  const setCustomCount = (index, value) => {
    setCustomCounts((current) => {
      const next = current.slice();
      next[index] = value;
      return next;
    });
  };

  const weekStrip = useMemo(() => {
    const out = [];
    const cursor = new Date();
    cursor.setDate(cursor.getDate() - 6);
    for (let i = 0; i < 7; i += 1) {
      const key = dayKey(cursor);
      out.push({
        key,
        label: ["S", "M", "T", "W", "T", "F", "S"][cursor.getDay()],
        seconds: stats.days[key] || 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return out;
  }, [stats.days]);

  const peakDay = Math.max(60, ...weekStrip.map((day) => day.seconds));
  const streak = useMemo(() => computeStreak(stats.days), [stats.days]);

  const currentWord = tick.word || activePhases[0]?.word || "Breathe in";
  const displayRemaining = Math.max(0, Math.ceil(tick.remaining || 0));

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Wind className="h-4 w-4" />
            Guided breathwork
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Box Breathing Exercise</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Pick a pattern, follow the dot, and let the count do the thinking. Box breathing to
            steady yourself, 4-7-8 to fall asleep, or a long exhale when you feel wired.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <span className="text-sm font-semibold">Pattern</span>
            <div className="mt-2 grid gap-2">
              {PATTERNS.map((item) => {
                const itemCounts = item.id === "custom" ? customCounts : item.counts;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPatternId(item.id)}
                    disabled={running}
                    className={`rounded-md border px-3 py-2.5 text-left transition disabled:opacity-60 ${
                      patternId === item.id
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">{item.label}</span>
                      <span className="text-xs font-semibold tabular-nums opacity-80">
                        {itemCounts.filter((value) => value > 0).join("-")}
                      </span>
                    </span>
                    <span className="mt-1 block text-[11px] leading-4 opacity-80">{item.when}</span>
                  </button>
                );
              })}
            </div>

            {patternId === "custom" && (
              <div className="mt-4 grid gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                {PHASES.map((phase, index) => (
                  <label key={phase.id} className="block">
                    <span className="flex items-center justify-between text-xs font-semibold">
                      <span>
                        {phase.word}
                        {index === 1 || index === 3 ? " (0 to skip)" : ""}
                      </span>
                      <span className="tabular-nums text-[var(--primary)]">
                        {customCounts[index]}s
                      </span>
                    </span>
                    <input
                      type="range"
                      min={index === 1 || index === 3 ? 0 : 2}
                      max={10}
                      step={1}
                      value={customCounts[index]}
                      disabled={running}
                      onChange={(event) => setCustomCount(index, Number(event.target.value))}
                      className="mt-1.5 w-full accent-[var(--primary)]"
                    />
                  </label>
                ))}
              </div>
            )}

            <div className="mt-5">
              <span className="text-sm font-semibold">Session length</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  { id: "rounds", label: "By rounds" },
                  { id: "minutes", label: "By minutes" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLengthMode(item.id)}
                    disabled={running}
                    className={`rounded-md border px-3 py-2 text-sm font-semibold transition disabled:opacity-60 ${
                      lengthMode === item.id
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <label className="mt-3 block">
                <span className="flex items-center justify-between text-xs font-semibold">
                  <span>{lengthMode === "rounds" ? "Rounds" : "Minutes"}</span>
                  <span className="tabular-nums text-[var(--primary)]">
                    {lengthMode === "rounds" ? roundTarget : minuteTarget}
                  </span>
                </span>
                <input
                  type="range"
                  min={lengthMode === "rounds" ? 2 : 1}
                  max={lengthMode === "rounds" ? 30 : 20}
                  step={1}
                  value={lengthMode === "rounds" ? roundTarget : minuteTarget}
                  disabled={running}
                  onChange={(event) =>
                    lengthMode === "rounds"
                      ? setRoundTarget(Number(event.target.value))
                      : setMinuteTarget(Number(event.target.value))
                  }
                  className="mt-1.5 w-full accent-[var(--primary)]"
                />
              </label>

              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                {totalRounds} rounds x {cycleSeconds}s per breath = about{" "}
                {formatClock(sessionSeconds)}.
              </p>
            </div>

            <div className="mt-5 grid gap-2">
              <button
                type="button"
                onClick={() => setToneOn((current) => !current)}
                aria-pressed={toneOn}
                className="flex items-center justify-between rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm font-semibold transition hover:border-[var(--primary)]"
              >
                <span className="inline-flex items-center gap-2">
                  {toneOn ? (
                    <Volume2 className="h-4 w-4 text-[var(--primary)]" />
                  ) : (
                    <VolumeX className="h-4 w-4 text-[var(--muted-foreground)]" />
                  )}
                  Phase tones
                </span>
                <span className={toneOn ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}>
                  {toneOn ? "On" : "Off"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setTickOn((current) => !current)}
                aria-pressed={tickOn}
                className="flex items-center justify-between rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm font-semibold transition hover:border-[var(--primary)]"
              >
                <span className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-[var(--muted-foreground)]" />
                  Second tick
                </span>
                <span className={tickOn ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}>
                  {tickOn ? "On" : "Off"}
                </span>
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            {finished ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <Sparkles className="h-10 w-10 text-[var(--primary)]" />
                <h2 className="mt-4 text-3xl font-semibold">That is the session</h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--muted-foreground)]">
                  {totalRounds} rounds of {pattern.label.toLowerCase()} breathing, about{" "}
                  {formatClock(sessionSeconds)}. Notice how your shoulders and jaw feel before you
                  go back to the day.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={startSession}
                    className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Go again
                  </button>
                  <button
                    type="button"
                    onClick={() => setFinished(false)}
                    className="btn-secondary min-h-11 px-4 py-2.5 text-sm"
                  >
                    Back to setup
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[420px] flex-col items-center justify-center">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="rounded-full bg-[var(--muted)] px-2.5 py-1 text-[10px] font-semibold uppercase text-[var(--primary)]">
                    {pattern.label} {counts.filter((value) => value > 0).join("-")}
                  </span>
                  {running && (
                    <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px] font-semibold uppercase text-[var(--muted-foreground)]">
                      Round {Math.min(totalRounds, tick.round + 1)} of {totalRounds}
                    </span>
                  )}
                </div>

                {reduceMotion ? (
                  <div className="mt-8 w-full max-w-md text-center">
                    <p className="text-4xl font-semibold">{currentWord}</p>
                    <p className="mt-2 text-7xl font-semibold tabular-nums text-[var(--primary)]">
                      {running ? displayRemaining : counts[0]}
                    </p>
                    <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                      <div
                        className="h-full rounded-full bg-[var(--primary)]"
                        style={{ width: `${Math.min(100, Math.max(0, (tick.t || 0) * 100))}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                      Motion is off because your system asks for reduced motion.
                    </p>
                  </div>
                ) : (
                  <div className="relative mt-6 h-72 w-72">
                    {isBox ? (
                      <BreathingSquare activeIndex={tick.activeIndex || 0} t={tick.t || 0} />
                    ) : (
                      <BreathingCircle phaseId={tick.phaseId || "inhale"} t={tick.t || 0} />
                    )}
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-2xl font-semibold">{currentWord}</p>
                      <p className="text-6xl font-semibold tabular-nums text-[var(--primary)]">
                        {running ? displayRemaining : counts[0]}
                      </p>
                    </div>
                  </div>
                )}

                <p aria-live="polite" className="sr-only">
                  {running ? `${currentWord}, ${displayRemaining} seconds` : "Ready"}
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                  {!running ? (
                    <button
                      type="button"
                      onClick={startSession}
                      className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90"
                    >
                      <Play className="h-4 w-4" />
                      Start breathing
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={togglePause}
                        className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90"
                      >
                        {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                        {paused ? "Resume" : "Pause"}
                      </button>
                      <button
                        type="button"
                        onClick={endEarly}
                        className="btn-secondary min-h-11 px-4 py-2.5 text-sm"
                      >
                        End session
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h2 className="text-lg font-semibold">Your practice</h2>
          <div className="tool-compact-grid mt-4">
            {[
              ["Sessions", stats.sessions],
              ["Total minutes", Math.round(stats.totalSeconds / 60)],
              ["Day streak", streak],
              [
                "Avg session",
                stats.sessions ? `${Math.round(stats.totalSeconds / stats.sessions / 60)} min` : "0 min",
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                <p className="mt-1 text-xl font-semibold text-[var(--primary)]">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
              Last 7 days
            </p>
            <div className="mt-2 flex items-end gap-2">
              {weekStrip.map((day, index) => (
                <div key={day.key} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex h-20 w-full items-end justify-center rounded-md bg-[var(--muted)]">
                    <div
                      className="w-full rounded-md bg-[var(--primary)]"
                      style={{
                        height: `${day.seconds ? Math.max(8, (day.seconds / peakDay) * 100) : 0}%`,
                      }}
                      title={`${Math.round(day.seconds / 60)} min`}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-[var(--muted-foreground)]">
                    {day.label}
                    {index === 6 ? "*" : ""}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-[var(--muted-foreground)]">
              * today. Stored only in this browser.
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="inline-flex items-center gap-2">
              <Brain className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="text-lg font-semibold">Why this works</h2>
            </div>
            <ul className="mt-3 grid gap-2.5 text-sm leading-6 text-[var(--muted-foreground)]">
              <li>
                <span className="font-semibold text-[var(--foreground)]">
                  A longer exhale calms you.
                </span>{" "}
                Breathing out for longer than you breathe in nudges the parasympathetic
                (rest-and-digest) side of the nervous system, which is why 4-7-8 and 4-6 feel
                settling.
              </li>
              <li>
                <span className="font-semibold text-[var(--foreground)]">
                  Equal counts steady you.
                </span>{" "}
                Box breathing is taught to Navy SEALs, police, and other first responders as a way
                to hold composure under acute stress without dropping alertness.
              </li>
              <li>
                <span className="font-semibold text-[var(--foreground)]">
                  Around six breaths a minute is the sweet spot.
                </span>{" "}
                The coherent 5-5 pace lands near the rate where heart rate and breathing sync up,
                which is the basis of most HRV breathing work.
              </li>
              <li>
                <span className="font-semibold text-[var(--foreground)]">4-7-8 for sleep onset.</span>{" "}
                The long hold and longer exhale give you a single, boring thing to count, which
                helps when a racing mind is the thing keeping you awake.
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="inline-flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[var(--anslation-ds-danger)]" />
              <h2 className="text-lg font-semibold">Breathe safely</h2>
            </div>
            <ul className="mt-3 grid gap-2.5 text-sm leading-6 text-[var(--muted-foreground)]">
              <li>
                Stop and breathe normally if you feel lightheaded, dizzy, or get tingling in your
                hands or face. That is a sign to shorten the counts.
              </li>
              <li>
                Never practise breath holds while driving, swimming, or in water of any depth.
              </li>
              <li>
                Go gently and skip the holds if you are pregnant, or if you have asthma, COPD, or
                another respiratory condition.
              </li>
              <li>
                Check with a doctor first if you have cardiovascular problems, uncontrolled blood
                pressure, or a history of panic attacks or fainting.
              </li>
              <li>The counts are a guide, not a target. Never force a breath you do not have.</li>
            </ul>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4">
          <p className="text-xs leading-5 text-[var(--muted-foreground)]">
            This is a guided breathing timer offered for general wellbeing and awareness, not
            medical advice, and it does not diagnose or treat any condition. If you have a
            respiratory, cardiac, or anxiety-related condition, or you are pregnant, consult a
            doctor before starting breathwork.
          </p>
        </section>
      </div>
    </main>
  );
}
