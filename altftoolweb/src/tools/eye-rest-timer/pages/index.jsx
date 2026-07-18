"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  BellOff,
  Check,
  Eye,
  Flame,
  Info,
  Monitor,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";

const STATS_KEY = "altf:eye-rest-timer:stats";
const PREFS_KEY = "altf:eye-rest-timer:prefs";

const BREAK_SECONDS = 20;
const WORK_MIN = 15;
const WORK_MAX = 60;
const DEFAULT_WORK = 20;
const DEFAULT_GOAL = 8;

const EXERCISES = [
  {
    id: "distance",
    name: "Distance gaze",
    text: "Find the furthest thing you can see — out a window if possible — and rest your eyes on it. Let the focus go soft.",
  },
  {
    id: "palming",
    name: "Palming",
    text: "Rub your palms together until warm, cup them over closed eyes without pressing, and breathe slowly in the dark.",
  },
  {
    id: "figure-8",
    name: "Figure-8 tracing",
    text: "Imagine a large figure 8 lying on its side about 3 metres away. Trace it slowly with your eyes, then reverse.",
  },
  {
    id: "near-far",
    name: "Near-far focus shifts",
    text: "Hold a thumb at arm's length, focus on it for 5 seconds, then switch to something far away. Alternate four times.",
  },
  {
    id: "full-blinks",
    name: "Full blinks",
    text: "Take 10 slow, complete blinks. Squeeze gently shut at the bottom of each one to spread a fresh tear film.",
  },
  {
    id: "sweeps",
    name: "Slow sweeps",
    text: "Without moving your head, look far left, then far right, then up, then down. Hold each end for 2 seconds.",
  },
  {
    id: "eye-rolls",
    name: "Eye rolls",
    text: "Roll your eyes in slow, wide circles — five clockwise, five anticlockwise. Keep your jaw and shoulders loose.",
  },
  {
    id: "closed-rest",
    name: "Closed-eye rest",
    text: "Simply close your eyes and let them rest. Notice any tightness around your brow and let it soften.",
  },
];

const pad2 = (n) => String(n).padStart(2, "0");
const dateKey = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const fmtClock = (secs) => {
  const s = Math.max(0, Math.round(secs));
  return `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`;
};

const fmtScreenTime = (secs) => {
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

function ProgressRing({ fraction, label, sub, tone }) {
  const R = 86;
  const C = 2 * Math.PI * R;
  const clamped = Math.min(1, Math.max(0, fraction));
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[240px]">
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="100" cy="100" r={R} fill="none" stroke="var(--muted)" strokeWidth="12" />
        <circle
          cx="100"
          cy="100"
          r={R}
          fill="none"
          stroke={tone}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - clamped)}
          style={{ transition: "stroke-dashoffset 0.3s linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-5xl font-semibold tabular-nums">{label}</p>
        <p className="mt-1 text-xs font-semibold uppercase text-[var(--muted-foreground)]">{sub}</p>
      </div>
    </div>
  );
}

export default function ToolHome() {
  const [phase, setPhase] = useState("idle");
  const [paused, setPaused] = useState(false);
  const [targetEpoch, setTargetEpoch] = useState(0);
  const [remaining, setRemaining] = useState(DEFAULT_WORK * 60);
  const [workMins, setWorkMins] = useState(DEFAULT_WORK);
  const [goal, setGoal] = useState(DEFAULT_GOAL);
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [notifyState, setNotifyState] = useState("unsupported");
  const [stats, setStats] = useState({});
  const [today, setToday] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const audioRef = useRef(null);
  const titleRef = useRef("");
  const phaseRef = useRef("idle");
  const soundRef = useRef(true);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    soundRef.current = soundOn;
  }, [soundOn]);

  useEffect(() => {
    titleRef.current = document.title;
    setToday(dateKey(new Date()));
    try {
      const stored = JSON.parse(window.localStorage.getItem(STATS_KEY) || "{}");
      if (stored && typeof stored === "object" && !Array.isArray(stored)) setStats(stored);
    } catch {
      /* ignore */
    }
    try {
      const prefs = JSON.parse(window.localStorage.getItem(PREFS_KEY) || "null");
      if (Number.isFinite(prefs?.workMins) && prefs.workMins >= WORK_MIN && prefs.workMins <= WORK_MAX) {
        setWorkMins(prefs.workMins);
        setRemaining(prefs.workMins * 60);
      }
      if (Number.isFinite(prefs?.goal) && prefs.goal >= 1 && prefs.goal <= 40) setGoal(prefs.goal);
      if (typeof prefs?.soundOn === "boolean") setSoundOn(prefs.soundOn);
    } catch {
      /* ignore */
    }
    if ("Notification" in window) setNotifyState(Notification.permission);
    setHydrated(true);
    return () => {
      document.title = titleRef.current;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const keys = Object.keys(stats).sort();
      const pruned = {};
      keys.slice(-60).forEach((k) => {
        pruned[k] = stats[k];
      });
      window.localStorage.setItem(STATS_KEY, JSON.stringify(pruned));
    } catch {
      /* ignore */
    }
  }, [stats, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(PREFS_KEY, JSON.stringify({ workMins, goal, soundOn }));
    } catch {
      /* ignore */
    }
  }, [workMins, goal, soundOn, hydrated]);

  const chime = useCallback((kind) => {
    if (!soundRef.current) return;
    try {
      if (!audioRef.current) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        audioRef.current = new Ctx();
      }
      const ctx = audioRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const notes = kind === "break" ? [523.25, 659.25, 783.99] : [783.99, 523.25];
      notes.forEach((freq, i) => {
        const start = ctx.currentTime + i * 0.18;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.12, start + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.9);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.95);
      });
    } catch {
      /* ignore */
    }
  }, []);

  const notify = useCallback((title, body) => {
    try {
      if (!("Notification" in window)) return;
      if (Notification.permission !== "granted") return;
      if (!document.hidden) return;
      const n = new Notification(title, { body, tag: "altf-eye-rest", silent: true });
      window.setTimeout(() => n.close(), 8000);
    } catch {
      /* ignore */
    }
  }, []);

  const addStat = useCallback((key, patch) => {
    setStats((prev) => {
      const day = prev[key] || { breaks: 0, workSeconds: 0 };
      return {
        ...prev,
        [key]: {
          breaks: day.breaks + (patch.breaks || 0),
          workSeconds: day.workSeconds + (patch.workSeconds || 0),
        },
      };
    });
  }, []);

  const beginWork = useCallback((mins) => {
    setPhase("work");
    setPaused(false);
    setTargetEpoch(Date.now() + mins * 60000);
    setRemaining(mins * 60);
  }, []);

  const beginBreak = useCallback(() => {
    setExerciseIdx((i) => (i + 1) % EXERCISES.length);
    setPhase("break");
    setPaused(false);
    setTargetEpoch(Date.now() + BREAK_SECONDS * 1000);
    setRemaining(BREAK_SECONDS);
  }, []);

  const finishWork = useCallback(() => {
    addStat(dateKey(new Date()), { workSeconds: workMins * 60 });
    chime("break");
    notify("Time to rest your eyes", `Look at something 20 feet away for ${BREAK_SECONDS} seconds.`);
    beginBreak();
  }, [addStat, beginBreak, chime, notify, workMins]);

  const finishBreak = useCallback(() => {
    addStat(dateKey(new Date()), { breaks: 1 });
    chime("work");
    notify("Break done", "Back to work — your next break is queued.");
    beginWork(workMins);
  }, [addStat, beginWork, chime, notify, workMins]);

  useEffect(() => {
    if (phase === "idle" || paused) return undefined;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      const ms = targetEpoch - Date.now();
      if (ms <= 0) {
        cancelled = true;
        if (phaseRef.current === "work") finishWork();
        else finishBreak();
        return;
      }
      setRemaining(ms / 1000);
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [phase, paused, targetEpoch, finishWork, finishBreak]);

  const clock = fmtClock(remaining);

  useEffect(() => {
    if (phase === "idle") {
      document.title = titleRef.current;
      return undefined;
    }
    const prefix = paused ? "Paused" : phase === "work" ? "Focus" : "Eye break";
    document.title = `${clock} · ${prefix}`;
    return undefined;
  }, [phase, paused, clock]);

  const start = () => {
    chime("work");
    beginWork(workMins);
  };

  const pause = () => {
    setPaused(true);
    setRemaining(Math.max(0, (targetEpoch - Date.now()) / 1000));
  };

  const resume = () => {
    setTargetEpoch(Date.now() + remaining * 1000);
    setPaused(false);
  };

  const stop = () => {
    if (phase === "work" && !paused) {
      const done = workMins * 60 - Math.max(0, (targetEpoch - Date.now()) / 1000);
      if (done > 30) addStat(dateKey(new Date()), { workSeconds: done });
    }
    setPhase("idle");
    setPaused(false);
    setRemaining(workMins * 60);
  };

  const breakNow = () => {
    chime("break");
    beginBreak();
  };

  const skipBreak = () => {
    beginWork(workMins);
  };

  const requestNotify = async () => {
    try {
      if (!("Notification" in window)) {
        setNotifyState("unsupported");
        return;
      }
      const result = await Notification.requestPermission();
      setNotifyState(result);
    } catch {
      setNotifyState("denied");
    }
  };

  const history = useMemo(() => {
    if (!today) return [];
    const [y, m, d] = today.split("-").map(Number);
    const base = new Date(y, m - 1, d);
    const rows = [];
    for (let i = 6; i >= 0; i -= 1) {
      const day = new Date(base.getFullYear(), base.getMonth(), base.getDate() - i);
      const key = dateKey(day);
      const entry = stats[key] || { breaks: 0, workSeconds: 0 };
      rows.push({
        key,
        label: day.toLocaleDateString("en-IN", { weekday: "short" }).slice(0, 2),
        breaks: entry.breaks,
        workSeconds: entry.workSeconds,
        isToday: i === 0,
        hit: entry.breaks >= goal,
      });
    }
    return rows;
  }, [stats, today, goal]);

  const streak = useMemo(() => {
    if (!today) return 0;
    const [y, m, d] = today.split("-").map(Number);
    const base = new Date(y, m - 1, d);
    let count = 0;
    for (let i = 0; i < 365; i += 1) {
      const day = new Date(base.getFullYear(), base.getMonth(), base.getDate() - i);
      const entry = stats[dateKey(day)];
      if (entry && entry.breaks >= goal) count += 1;
      else if (i > 0) break;
      else if (!entry || entry.breaks < goal) continue;
    }
    return count;
  }, [stats, today, goal]);

  const todayStats = stats[today] || { breaks: 0, workSeconds: 0 };
  const historyMax = Math.max(goal, ...history.map((h) => h.breaks), 1);
  const exercise = EXERCISES[exerciseIdx];
  const fraction =
    phase === "break"
      ? remaining / BREAK_SECONDS
      : phase === "work"
        ? remaining / (workMins * 60)
        : 1;
  const tone = phase === "break" ? "var(--anslation-ds-success)" : "var(--primary)";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Eye className="h-4 w-4" />
            Screen break timer
          </div>
          <h1 className="text-4xl font-semibold leading-tight">20-20-20 Eye Rest Timer</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Every 20 minutes, look at something 20 feet (about 6 metres) away for 20 seconds. It is the
            simplest habit for screen-tired eyes, and the hardest to remember — so this timer runs the loop for
            you, chimes at both ends, and hands you a different eye exercise each break.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[1fr_380px]">
          <div
            className={`rounded-lg border bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] ${
              phase === "break" ? "altf-eye-break" : ""
            }`}
            style={{ borderColor: phase === "break" ? "var(--anslation-ds-success)" : "var(--border)" }}
          >
            {phase === "break" ? (
              <div className="text-center">
                <p
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "var(--anslation-ds-success)" }}
                >
                  Eye break
                </p>
                <h2 className="mt-2 text-3xl font-semibold leading-tight">
                  Look at something 20 feet away
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
                  About 6 metres — the far wall, a window, the end of the corridor. Let your focus go all the
                  way out and stay there.
                </p>
                <div className="my-6">
                  <ProgressRing
                    fraction={fraction}
                    label={String(Math.max(0, Math.ceil(remaining)))}
                    sub="seconds left"
                    tone={tone}
                  />
                </div>
                <div className="mx-auto max-w-md rounded-md bg-[var(--muted)] p-4 text-left">
                  <p className="text-xs font-semibold uppercase text-[var(--primary)]">
                    This break: {exercise.name}
                  </p>
                  <p className="mt-1.5 text-sm leading-6 text-[var(--muted-foreground)]">{exercise.text}</p>
                </div>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <button type="button" onClick={skipBreak} className="btn-secondary min-h-11 px-4 text-sm">
                    <SkipForward className="h-4 w-4" />
                    Skip to work
                  </button>
                  <button type="button" onClick={stop} className="btn-secondary min-h-11 px-4 text-sm">
                    <RotateCcw className="h-4 w-4" />
                    Stop
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {phase === "idle" ? "Ready" : paused ? "Paused" : "Focus time"}
                </p>
                <h2 className="mt-2 text-2xl font-semibold leading-tight">
                  {phase === "idle"
                    ? `Next break in ${workMins} minutes`
                    : paused
                      ? "Timer paused"
                      : "Keep working — the chime will find you"}
                </h2>
                <div className="my-6">
                  <ProgressRing
                    fraction={fraction}
                    label={clock}
                    sub={phase === "idle" ? "until first break" : "until your break"}
                    tone={tone}
                  />
                </div>
                <div className="flex flex-wrap justify-center gap-2" aria-live="polite">
                  {phase === "idle" ? (
                    <button
                      type="button"
                      onClick={start}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-6 text-sm font-semibold text-[var(--primary-foreground)]"
                    >
                      <Play className="h-4 w-4" />
                      Start the loop
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={paused ? resume : pause}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--primary-foreground)]"
                      >
                        {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                        {paused ? "Resume" : "Pause"}
                      </button>
                      <button type="button" onClick={breakNow} className="btn-secondary min-h-11 px-4 text-sm">
                        <Eye className="h-4 w-4" />
                        Break now
                      </button>
                      <button type="button" onClick={stop} className="btn-secondary min-h-11 px-4 text-sm">
                        <RotateCcw className="h-4 w-4" />
                        Stop
                      </button>
                    </>
                  )}
                </div>
                {phase === "idle" && (
                  <p className="mt-4 text-xs text-[var(--muted-foreground)]">
                    The timer keeps correct time in a background tab, and the tab title shows the countdown.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="text-lg font-semibold">Settings</h2>
              <label className="mt-4 block">
                <span className="flex items-center justify-between text-sm font-semibold">
                  Work interval
                  <span className="text-[var(--primary)]">{workMins} min</span>
                </span>
                <input
                  type="range"
                  min={WORK_MIN}
                  max={WORK_MAX}
                  step={5}
                  value={workMins}
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    setWorkMins(next);
                    if (phase === "idle") setRemaining(next * 60);
                  }}
                  className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--muted)] accent-[var(--primary)]"
                />
                <span className="mt-1 flex justify-between text-xs text-[var(--muted-foreground)]">
                  <span>15 min</span>
                  <span>60 min</span>
                </span>
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {[20, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => {
                      setWorkMins(mins);
                      if (phase === "idle") setRemaining(mins * 60);
                    }}
                    className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                      workMins === mins
                        ? "border-[var(--primary)] text-[var(--primary)]"
                        : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                20 minutes is the rule as written. Longer intervals interrupt less but rest less — the break
                itself stays at 20 seconds either way.
              </p>

              <label className="mt-5 block">
                <span className="text-sm font-semibold">Daily break goal</span>
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={goal}
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    if (Number.isFinite(next) && next >= 1 && next <= 40) setGoal(Math.round(next));
                  }}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
                <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                  Hit this many breaks to keep your streak alive. Eight is roughly a focused work day at 20
                  minute intervals.
                </span>
              </label>

              <div className="mt-5 grid gap-2">
                <button
                  type="button"
                  onClick={() => setSoundOn((v) => !v)}
                  className="btn-secondary min-h-11 justify-start px-3 text-sm"
                  aria-pressed={soundOn}
                >
                  {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  Chime {soundOn ? "on" : "off"}
                </button>

                {notifyState === "granted" ? (
                  <p className="flex items-center gap-2 rounded-md bg-[var(--muted)] px-3 py-2.5 text-sm text-[var(--muted-foreground)]">
                    <Bell className="h-4 w-4" style={{ color: "var(--anslation-ds-success)" }} />
                    Notifications on — you will be pinged only when this tab is hidden.
                  </p>
                ) : notifyState === "denied" ? (
                  <p className="flex items-start gap-2 rounded-md bg-[var(--muted)] px-3 py-2.5 text-xs leading-5 text-[var(--muted-foreground)]">
                    <BellOff className="mt-0.5 h-4 w-4 shrink-0" />
                    Notifications are blocked for this site. The chime and the tab title still work — re-enable
                    them in your browser site settings if you want them back.
                  </p>
                ) : notifyState === "unsupported" ? (
                  <p className="flex items-start gap-2 rounded-md bg-[var(--muted)] px-3 py-2.5 text-xs leading-5 text-[var(--muted-foreground)]">
                    <BellOff className="mt-0.5 h-4 w-4 shrink-0" />
                    This browser does not support notifications. The chime and tab title still work.
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={requestNotify}
                    className="btn-secondary min-h-11 justify-start px-3 text-sm"
                  >
                    <Bell className="h-4 w-4" />
                    Enable notifications
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="text-lg font-semibold">Today</h2>
              <div className="mt-3 grid grid-cols-3 gap-3" aria-live="polite">
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-2xl font-semibold text-[var(--primary)]">{todayStats.breaks}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    break{todayStats.breaks === 1 ? "" : "s"} of {goal}
                  </p>
                </div>
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-2xl font-semibold">{fmtScreenTime(todayStats.workSeconds)}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">screen time tracked</p>
                </div>
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="flex items-center gap-1 text-2xl font-semibold">
                    <Flame
                      className="h-5 w-5"
                      style={{ color: streak > 0 ? "var(--anslation-ds-warning)" : "var(--muted-foreground)" }}
                    />
                    {streak}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">day streak</p>
                </div>
              </div>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (todayStats.breaks / goal) * 100)}%`,
                    background:
                      todayStats.breaks >= goal ? "var(--anslation-ds-success)" : "var(--primary)",
                  }}
                />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase text-[var(--muted-foreground)]">Last 7 days</p>
              <div className="mt-2 grid grid-cols-7 gap-2">
                {history.map((day) => {
                  const height = day.breaks > 0 ? Math.max(8, (day.breaks / historyMax) * 100) : 3;
                  return (
                    <div key={day.key} className="flex flex-col items-center gap-1.5">
                      <span className="text-xs font-semibold text-[var(--muted-foreground)]">{day.breaks}</span>
                      <div className="flex h-20 w-full items-end rounded-md bg-[var(--muted)] px-1 pb-1 pt-1">
                        <div
                          className="w-full rounded-sm transition-all"
                          style={{
                            height: `${height}%`,
                            background: day.hit ? "var(--anslation-ds-success)" : "var(--primary)",
                            opacity: day.breaks > 0 ? 1 : 0.35,
                          }}
                        />
                      </div>
                      <span
                        className={`text-xs ${
                          day.isToday ? "font-semibold text-[var(--primary)]" : "text-[var(--muted-foreground)]"
                        }`}
                      >
                        {day.isToday ? "Today" : day.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h2 className="text-lg font-semibold">The eight break exercises</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            One rotates in on every break, so you are not doing the same thing forty times a day.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {EXERCISES.map((ex, i) => (
              <div
                key={ex.id}
                className={`rounded-md border p-3 transition ${
                  i === exerciseIdx && phase === "break"
                    ? "border-[var(--primary)] bg-[var(--muted)]"
                    : "border-[var(--border)] bg-[var(--background)]"
                }`}
              >
                <p className="text-sm font-semibold">{ex.name}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{ex.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-[var(--primary)]" />
              <h2 className="text-lg font-semibold">Digital eye strain, briefly</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Computer vision syndrome is what happens when eyes hold a single near focus for hours. It is
              common, uncomfortable, and reversible — it is not damage to your eyes.
            </p>
            <p className="mt-4 text-xs font-semibold uppercase text-[var(--muted-foreground)]">Symptoms</p>
            <ul className="mt-2 grid gap-1.5 text-sm leading-6 text-[var(--muted-foreground)]">
              {[
                "Dry, gritty, or burning eyes",
                "Blurred vision, especially when you look up from the screen",
                "Headaches around the brow and temples",
                "Neck and shoulder ache from leaning in",
                "Trouble refocusing between near and far",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-[var(--primary)]" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs font-semibold uppercase text-[var(--muted-foreground)]">Why it happens</p>
            <div className="mt-2 grid gap-2">
              <div className="rounded-md bg-[var(--muted)] p-3">
                <p className="text-sm font-semibold">Your blink rate collapses</p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                  Studies put the drop at roughly two thirds — from about 15-20 blinks a minute down to 5-7 while
                  concentrating on a screen. Fewer blinks and more incomplete blinks mean the tear film breaks up
                  and the eye dries out. That single mechanism explains most of the dryness and blur.
                </p>
              </div>
              <div className="rounded-md bg-[var(--muted)] p-3">
                <p className="text-sm font-semibold">Your focusing muscle never lets go</p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                  Holding near focus keeps the ciliary muscle contracted for hours. Looking 20 feet away lets it
                  relax to its resting state — which is the entire point of the rule, and why the distance
                  matters more than the exercise.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-[var(--primary)]" />
              <h2 className="text-lg font-semibold">Set the desk up once</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Breaks fix the strain you earn. Ergonomics stops you earning it in the first place.
            </p>
            <div className="mt-4 grid gap-2">
              {[
                [
                  "Screen an arm's length away",
                  "About 50-70 cm from your eyes. If text is too small at that distance, raise the font size rather than lean in.",
                ],
                [
                  "Top of the screen at or below eye level",
                  "You should look slightly down, around 10-20 degrees. A downward gaze covers more of the eye with the lid and slows evaporation.",
                ],
                [
                  "Kill the glare",
                  "Position windows to the side rather than in front of or behind the screen, and match screen brightness to the room instead of outshining it.",
                ],
                [
                  "Watch the air",
                  "Air conditioning, fans, and heaters aimed at your face dry eyes fast. Redirect the vent; some humidity in the room helps.",
                ],
                [
                  "Blink on purpose",
                  "A few full, complete blinks every so often does more for dryness than any screen filter.",
                ],
              ].map(([title, text]) => (
                <div key={title} className="rounded-md bg-[var(--muted)] p-3">
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{text}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[var(--muted-foreground)]">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Your break counts and screen time stay on your device in this browser. Nothing is uploaded.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-5">
          <p className="text-sm leading-6 text-[var(--muted-foreground)]">
            The 20-20-20 rule is a comfort habit for awareness, not medical advice. Screen use causes eye strain,
            not permanent eye damage — but persistent blurred vision, eye pain, double vision, flashes,
            floaters, headaches that do not settle, or strain despite regular breaks deserve an eye examination.
            An uncorrected prescription, dry eye disease, or a binocular vision problem can all masquerade as
            plain screen fatigue, and none of them are fixed by a timer. See an optometrist or ophthalmologist.
          </p>
        </section>
      </div>

      <style>{`
        .altf-eye-break { animation: altf-eye-fade 0.4s ease-out; }
        @keyframes altf-eye-fade {
          from { opacity: 0.4; transform: scale(0.99); }
          to { opacity: 1; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .altf-eye-break { animation: none; }
        }
      `}</style>
    </main>
  );
}
