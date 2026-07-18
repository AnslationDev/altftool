"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  CalendarClock,
  ChefHat,
  CircleCheck,
  Clock,
  Pause,
  Play,
  Plus,
  RotateCcw,
  TimerReset,
  Trash2,
  Volume2,
  VolumeX,
} from "lucide-react";

const TIMERS_KEY = "altf:kitchen-multi-timer:timers";
const SOUND_KEY = "altf:kitchen-multi-timer:sound";

const dishTags = [
  { emoji: "🍚", label: "Rice and grains" },
  { emoji: "🍳", label: "Eggs" },
  { emoji: "🍝", label: "Pasta and noodles" },
  { emoji: "🍲", label: "Dal and curry" },
  { emoji: "🍗", label: "Meat and roast" },
  { emoji: "🥦", label: "Veggies" },
  { emoji: "🍕", label: "Oven and bakes" },
  { emoji: "🫖", label: "Tea and coffee" },
];

const presets = [
  { name: "Soft-boiled eggs", minutes: 7, emoji: "🍳" },
  { name: "Jammy eggs", minutes: 9, emoji: "🍳" },
  { name: "Hard-boiled eggs", minutes: 12, emoji: "🍳" },
  { name: "White rice", minutes: 12, emoji: "🍚" },
  { name: "Pasta al dente", minutes: 9, emoji: "🍝" },
  { name: "Instant noodles", minutes: 3, emoji: "🍝" },
  { name: "Dal (pressure cook)", minutes: 15, emoji: "🍲" },
  { name: "Tea steep", minutes: 3, emoji: "🫖" },
  { name: "French press coffee", minutes: 4, emoji: "🫖" },
  { name: "Steamed veggies", minutes: 8, emoji: "🥦" },
  { name: "Oatmeal", minutes: 5, emoji: "🍚" },
  { name: "Pizza (oven)", minutes: 12, emoji: "🍕" },
  { name: "Cookies (bake)", minutes: 11, emoji: "🍕" },
  { name: "Roast chicken", minutes: 90, emoji: "🍗" },
];

const makeId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const formatMs = (ms) => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
};

const formatClock = (ts) =>
  new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

const formatWait = (ms) => {
  if (ms <= 0) return "start now";
  const totalMinutes = Math.floor(ms / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0) return `in ${h}h ${m}m`;
  if (totalMinutes > 0) return `in ${totalMinutes} min`;
  return `in ${Math.ceil(ms / 1000)}s`;
};

const remainingOf = (timer, now) =>
  timer.status === "running" ? Math.max(0, timer.endAt - now) : timer.remainingMs;

const actionButtonClass =
  "inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-xs font-semibold transition hover:border-[var(--primary)]";

export default function ToolHome() {
  const [timers, setTimers] = useState([]);
  const [now, setNow] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [dishName, setDishName] = useState("");
  const [minutes, setMinutes] = useState(10);
  const [seconds, setSeconds] = useState(0);
  const [dishEmoji, setDishEmoji] = useState("🍲");
  const [readyAt, setReadyAt] = useState("");
  const audioRef = useRef(null);

  useEffect(() => {
    const nowTs = Date.now();
    try {
      const raw = window.localStorage.getItem(TIMERS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setTimers(
            parsed
              .filter((t) => t && typeof t.totalMs === "number" && t.totalMs > 0)
              .map((t) =>
                t.status === "running" && (!t.endAt || t.endAt <= nowTs)
                  ? { ...t, status: "done", remainingMs: 0, endAt: null }
                  : t
              )
          );
        }
      }
      if (window.localStorage.getItem(SOUND_KEY) === "off") setSoundOn(false);
    } catch {
      /* storage unavailable */
    }
    const defaultReady = new Date(nowTs + 45 * 60000);
    setReadyAt(
      `${String(defaultReady.getHours()).padStart(2, "0")}:${String(defaultReady.getMinutes()).padStart(2, "0")}`
    );
    setNow(nowTs);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(TIMERS_KEY, JSON.stringify(timers));
    } catch {
      /* storage unavailable */
    }
  }, [timers, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(SOUND_KEY, soundOn ? "on" : "off");
    } catch {
      /* storage unavailable */
    }
  }, [soundOn, hydrated]);

  const ensureAudio = useCallback(() => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      if (!audioRef.current) audioRef.current = new Ctx();
      if (audioRef.current.state === "suspended") audioRef.current.resume();
      return audioRef.current;
    } catch {
      return null;
    }
  }, []);

  const playChime = useCallback(() => {
    const ctx = audioRef.current || ensureAudio();
    if (!ctx) return;
    const start = ctx.currentTime + 0.05;
    [0, 1, 2].forEach((round) => {
      [880, 1174.66].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = start + round * 0.85 + i * 0.22;
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.65);
      });
    });
  }, [ensureAudio]);

  const anyRunning = useMemo(() => timers.some((t) => t.status === "running"), [timers]);

  useEffect(() => {
    if (!timers.length) return undefined;
    let reduced = false;
    try {
      reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      /* no matchMedia */
    }
    const id = setInterval(() => setNow(Date.now()), reduced ? 1000 : 500);
    return () => clearInterval(id);
  }, [timers.length, anyRunning]);

  useEffect(() => {
    if (!now) return;
    const expired = timers.some((t) => t.status === "running" && t.endAt - now <= 0);
    if (!expired) return;
    setTimers((prev) =>
      prev.map((t) =>
        t.status === "running" && t.endAt - now <= 0
          ? { ...t, status: "done", remainingMs: 0, endAt: null }
          : t
      )
    );
    if (soundOn) playChime();
  }, [now, timers, soundOn, playChime]);

  const addTimer = useCallback(
    (name, totalMs, emoji, autostart) => {
      ensureAudio();
      const startTs = Date.now();
      setTimers((prev) => [
        ...prev,
        {
          id: makeId(),
          name: name.trim() || `Dish ${prev.length + 1}`,
          emoji,
          totalMs,
          status: autostart ? "running" : "paused",
          endAt: autostart ? startTs + totalMs : null,
          remainingMs: totalMs,
        },
      ]);
      setNow(startTs);
    },
    [ensureAudio]
  );

  const handleAddFromForm = (autostart) => {
    const totalMs = (Math.max(0, minutes) * 60 + Math.max(0, seconds)) * 1000;
    if (totalMs <= 0) return;
    addTimer(dishName, totalMs, dishEmoji, autostart);
    setDishName("");
  };

  const pauseTimer = (id) => {
    const ts = Date.now();
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id && t.status === "running"
          ? { ...t, status: "paused", remainingMs: Math.max(0, t.endAt - ts), endAt: null }
          : t
      )
    );
  };

  const resumeTimer = (id) => {
    ensureAudio();
    const ts = Date.now();
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id && t.status === "paused" && t.remainingMs > 0
          ? { ...t, status: "running", endAt: ts + t.remainingMs }
          : t
      )
    );
  };

  const restartTimer = (id) => {
    ensureAudio();
    const ts = Date.now();
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: "running", endAt: ts + t.totalMs, remainingMs: t.totalMs } : t
      )
    );
  };

  const extendTimer = (id) => {
    ensureAudio();
    const ts = Date.now();
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (t.status === "running") return { ...t, endAt: t.endAt + 60000 };
        if (t.status === "paused") return { ...t, remainingMs: t.remainingMs + 60000 };
        return { ...t, status: "running", endAt: ts + 60000, remainingMs: 60000 };
      })
    );
  };

  const deleteTimer = (id) => setTimers((prev) => prev.filter((t) => t.id !== id));

  const pauseAll = () => {
    const ts = Date.now();
    setTimers((prev) =>
      prev.map((t) =>
        t.status === "running"
          ? { ...t, status: "paused", remainingMs: Math.max(0, t.endAt - ts), endAt: null }
          : t
      )
    );
  };

  const resumeAll = () => {
    ensureAudio();
    const ts = Date.now();
    setTimers((prev) =>
      prev.map((t) =>
        t.status === "paused" && t.remainingMs > 0
          ? { ...t, status: "running", endAt: ts + t.remainingMs }
          : t
      )
    );
  };

  const clearFinished = () => setTimers((prev) => prev.filter((t) => t.status !== "done"));

  const runningCount = timers.filter((t) => t.status === "running").length;
  const pausedCount = timers.filter((t) => t.status === "paused").length;
  const doneTimers = timers.filter((t) => t.status === "done");

  const nextUp = useMemo(() => {
    const running = timers.filter((t) => t.status === "running");
    if (!running.length) return null;
    return running.reduce((min, t) => (t.endAt < min.endAt ? t : min), running[0]);
  }, [timers]);

  const plan = useMemo(() => {
    if (!readyAt || !now) return null;
    const [hh, mm] = readyAt.split(":").map(Number);
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
    const target = new Date(now);
    target.setHours(hh, mm, 0, 0);
    let targetMs = target.getTime();
    if (targetMs <= now) targetMs += 24 * 3600 * 1000;
    const pending = timers
      .filter((t) => t.status === "paused" && t.remainingMs > 0)
      .map((t) => ({ timer: t, startAt: targetMs - t.remainingMs }))
      .sort((a, b) => a.startAt - b.startAt);
    const cooking = timers
      .filter((t) => t.status === "running")
      .map((t) => ({ timer: t, finishAt: t.endAt, deltaMs: t.endAt - targetMs }))
      .sort((a, b) => a.finishAt - b.finishAt);
    return { targetMs, pending, cooking };
  }, [timers, readyAt, now]);

  const summary = useMemo(() => {
    if (!timers.length) return "Tap a preset or add a dish to get cooking.";
    const parts = [`${timers.length} ${timers.length === 1 ? "dish" : "dishes"}`];
    if (nextUp) parts.push(`next up: ${nextUp.name} in ${formatMs(remainingOf(nextUp, now))}`);
    else if (doneTimers.length === timers.length) parts.push("everything is done");
    return parts.join(" · ");
  }, [timers, nextUp, now, doneTimers.length]);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <TimerReset className="h-4 w-4" />
            Kitchen companion
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Kitchen Multi-Timer</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Run a named timer for every dish on the stove at once — rice, dal, eggs, the roast — with
            real cook-time presets, per-dish chimes, and a planner that tells you when to start each
            dish so everything lands on the table together.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="grid content-start gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="text-lg font-semibold">Add a dish timer</h2>
              <div className="mt-4 grid gap-4">
                <label className="block">
                  <span className="text-sm font-semibold">Dish name</span>
                  <input
                    type="text"
                    value={dishName}
                    maxLength={40}
                    placeholder="e.g. Basmati rice"
                    onChange={(event) => setDishName(event.target.value)}
                    className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-sm font-semibold">Minutes</span>
                    <input
                      type="number"
                      min={0}
                      max={599}
                      value={minutes}
                      onChange={(event) =>
                        setMinutes(Math.min(599, Math.max(0, Math.round(Number(event.target.value) || 0))))
                      }
                      className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold">Seconds</span>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={seconds}
                      onChange={(event) =>
                        setSeconds(Math.min(59, Math.max(0, Math.round(Number(event.target.value) || 0))))
                      }
                      className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                    />
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[1, 5, 10].map((step) => (
                    <button
                      key={step}
                      type="button"
                      onClick={() => setMinutes((prev) => Math.min(599, prev + step))}
                      className={actionButtonClass}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {step} min
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setMinutes(0);
                      setSeconds(0);
                    }}
                    className={actionButtonClass}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Clear
                  </button>
                </div>
                <fieldset>
                  <legend className="text-sm font-semibold">Dish tag</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {dishTags.map((tag) => (
                      <button
                        key={tag.emoji}
                        type="button"
                        title={tag.label}
                        aria-label={tag.label}
                        aria-pressed={dishEmoji === tag.emoji}
                        onClick={() => setDishEmoji(tag.emoji)}
                        className={`flex h-10 w-10 items-center justify-center rounded-md border text-lg transition ${
                          dishEmoji === tag.emoji
                            ? "border-[var(--primary)] bg-[var(--muted)]"
                            : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                        }`}
                      >
                        {tag.emoji}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddFromForm(true)}
                    disabled={minutes * 60 + seconds <= 0}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Play className="h-4 w-4" />
                    Add &amp; start
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddFromForm(false)}
                    disabled={minutes * 60 + seconds <= 0}
                    className="btn-secondary min-h-11 justify-center px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    Stage for later
                  </button>
                </div>
                <p className="text-xs leading-5 text-[var(--muted-foreground)]">
                  Staged dishes wait quietly until you start them — perfect for the finish-together
                  planner below.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="text-lg font-semibold">Real cook-time presets</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                One tap adds the dish and starts the clock.
              </p>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {presets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => addTimer(preset.name, preset.minutes * 60000, preset.emoji, true)}
                    className="flex items-center justify-between gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-sm transition hover:border-[var(--primary)]"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span aria-hidden="true">{preset.emoji}</span>
                      <span className="truncate font-semibold">{preset.name}</span>
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-[var(--primary)]">
                      {preset.minutes} min
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                Typical times for standard portions — always double-check against your recipe.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Your dish timers</h2>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]" aria-live="polite">
                  {summary}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSoundOn((prev) => !prev)}
                  aria-pressed={soundOn}
                  className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                >
                  {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  {soundOn ? "Sound on" : "Muted"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    ensureAudio();
                    playChime();
                  }}
                  className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                >
                  <Bell className="h-4 w-4" />
                  Test chime
                </button>
                {runningCount > 0 && (
                  <button type="button" onClick={pauseAll} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                    <Pause className="h-4 w-4" />
                    Pause all
                  </button>
                )}
                {pausedCount > 0 && (
                  <button type="button" onClick={resumeAll} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                    <Play className="h-4 w-4" />
                    Start all
                  </button>
                )}
                {doneTimers.length > 0 && (
                  <button type="button" onClick={clearFinished} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                    <Trash2 className="h-4 w-4" />
                    Clear finished
                  </button>
                )}
              </div>
            </div>

            <p aria-live="polite" className="sr-only">
              {doneTimers.length ? `Finished: ${doneTimers.map((t) => t.name).join(", ")}` : ""}
            </p>

            {timers.length === 0 ? (
              <div className="mt-6 flex flex-col items-center gap-3 rounded-md border border-dashed border-[var(--border)] bg-[var(--muted)] px-6 py-12 text-center">
                <ChefHat className="h-8 w-8 text-[var(--primary)]" />
                <p className="font-semibold">Nothing on the stove yet</p>
                <p className="max-w-sm text-sm text-[var(--muted-foreground)]">
                  Tap a preset like Jammy eggs or White rice, or add your own dish with a custom time.
                </p>
              </div>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {timers.map((timer) => {
                  const remaining = remainingOf(timer, now);
                  const done = timer.status === "done";
                  const percent = timer.totalMs
                    ? Math.min(100, Math.max(0, 100 * (1 - remaining / timer.totalMs)))
                    : 0;
                  return (
                    <article
                      key={timer.id}
                      className={`rounded-lg border p-4 shadow-[var(--anslation-ds-shadow-sm)] ${
                        done
                          ? "border-[var(--anslation-ds-success)] bg-[var(--anslation-ds-success-soft)]"
                          : "border-[var(--border)] bg-[var(--background)]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="text-2xl" aria-hidden="true">
                            {timer.emoji}
                          </span>
                          <div className="min-w-0">
                            <p
                              className={`truncate text-sm font-semibold ${done ? "motion-safe:animate-pulse" : ""}`}
                            >
                              {timer.name}
                            </p>
                            <p className="text-xs text-[var(--muted-foreground)]">
                              {formatMs(timer.totalMs)} total
                            </p>
                          </div>
                        </div>
                        <span
                          className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold ${
                            done
                              ? "border-[var(--anslation-ds-success)] text-[var(--anslation-ds-success)]"
                              : timer.status === "running"
                                ? "border-[var(--primary)] text-[var(--primary)]"
                                : "border-[var(--border)] text-[var(--muted-foreground)]"
                          }`}
                        >
                          {done ? "Done" : timer.status === "running" ? "Cooking" : "Paused"}
                        </span>
                      </div>

                      {done ? (
                        <p className="mt-3 flex items-center gap-2 text-lg font-semibold text-[var(--anslation-ds-success)]">
                          <CircleCheck className="h-5 w-5" />
                          Take it off the heat!
                        </p>
                      ) : (
                        <p className="mt-3 text-3xl font-semibold tabular-nums">{formatMs(remaining)}</p>
                      )}

                      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                        <div
                          className="h-full rounded-full transition-[width] duration-300"
                          style={{
                            width: `${done ? 100 : percent}%`,
                            background: done ? "var(--anslation-ds-success)" : "var(--primary)",
                          }}
                        />
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {timer.status === "running" && (
                          <button type="button" onClick={() => pauseTimer(timer.id)} className={actionButtonClass}>
                            <Pause className="h-3.5 w-3.5" />
                            Pause
                          </button>
                        )}
                        {timer.status === "paused" && (
                          <button type="button" onClick={() => resumeTimer(timer.id)} className={actionButtonClass}>
                            <Play className="h-3.5 w-3.5" />
                            Start
                          </button>
                        )}
                        <button type="button" onClick={() => extendTimer(timer.id)} className={actionButtonClass}>
                          <Plus className="h-3.5 w-3.5" />
                          1 min
                        </button>
                        <button type="button" onClick={() => restartTimer(timer.id)} className={actionButtonClass}>
                          <RotateCcw className="h-3.5 w-3.5" />
                          Restart
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTimer(timer.id)}
                          aria-label={`Delete ${timer.name} timer`}
                          className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-xs font-semibold transition hover:border-[var(--anslation-ds-danger)] hover:text-[var(--anslation-ds-danger)]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-[var(--muted-foreground)]">
              <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Each timer is pinned to a target clock time, so it stays accurate even if this tab
              sleeps in the background — and your timers survive a page refresh.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
                <CalendarClock className="h-4 w-4" />
                Finish-together planner
              </div>
              <h2 className="text-lg font-semibold">When should each dish go on?</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
                Pick the moment everything should hit the table. We work backwards from each staged
                dish’s cook time and give you a start schedule — longest cook first.
              </p>
            </div>
            <label className="block">
              <span className="text-sm font-semibold">Everything ready at</span>
              <input
                type="time"
                value={readyAt}
                onChange={(event) => setReadyAt(event.target.value)}
                className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)] sm:w-44"
              />
            </label>
          </div>

          {plan && plan.pending.length > 0 && (
            <ol className="mt-5 grid gap-2">
              {plan.pending.map((row, index) => {
                const waitMs = row.startAt - now;
                return (
                  <li
                    key={row.timer.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-semibold text-[var(--primary)]">
                        {index + 1}
                      </span>
                      <span className="text-xl" aria-hidden="true">
                        {row.timer.emoji}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{row.timer.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {formatMs(row.timer.remainingMs)} cook time
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-semibold">Start at {formatClock(row.startAt)}</p>
                        <p
                          className={`text-xs font-semibold ${
                            waitMs <= 0 ? "text-[var(--anslation-ds-danger)]" : "text-[var(--muted-foreground)]"
                          }`}
                        >
                          {formatWait(waitMs)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => resumeTimer(row.timer.id)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[var(--primary)] px-3 text-xs font-semibold text-[var(--primary-foreground)]"
                      >
                        <Play className="h-3.5 w-3.5" />
                        Start
                      </button>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          {plan && plan.cooking.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Already cooking</p>
              <ul className="mt-2 grid gap-2">
                {plan.cooking.map((row) => {
                  const late = row.deltaMs > 60000;
                  const early = row.deltaMs < -60000;
                  return (
                    <li
                      key={row.timer.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="text-xl" aria-hidden="true">
                          {row.timer.emoji}
                        </span>
                        <p className="truncate text-sm font-semibold">{row.timer.name}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-[var(--muted-foreground)]">
                          finishes {formatClock(row.finishAt)}
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
                            late
                              ? "border-[var(--anslation-ds-danger)] text-[var(--anslation-ds-danger)]"
                              : early
                                ? "border-[var(--border)] text-[var(--muted-foreground)]"
                                : "border-[var(--anslation-ds-success)] text-[var(--anslation-ds-success)]"
                          }`}
                        >
                          {late
                            ? `${Math.ceil(row.deltaMs / 60000)} min late`
                            : early
                              ? `${Math.ceil(-row.deltaMs / 60000)} min early`
                              : "on target"}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {plan && plan.pending.length === 0 && plan.cooking.length === 0 && (
            <p className="mt-5 rounded-md border border-dashed border-[var(--border)] bg-[var(--muted)] px-4 py-6 text-center text-sm text-[var(--muted-foreground)]">
              Stage a few dishes first — add them with “Stage for later”, and this schedule fills in
              automatically.
            </p>
          )}

          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
            How it works: start time = ready time − cook time. Start each dish when its slot comes up
            (the Start button is right there), and everything finishes together.
          </p>
        </section>
      </div>
    </main>
  );
}
