"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlarmClock, BellRing, Pause, Play, Plus, RotateCcw, Trash2 } from "lucide-react";

const STORAGE_KEY = "altf:countdown-timer:timers";
const PRESET_MINUTES = [1, 3, 5, 10, 15, 30, 60];
const VALID_STATUSES = ["idle", "running", "paused", "done"];

const pad = (value) => String(value).padStart(2, "0");

const formatRemaining = (ms) => {
  const total = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor(total / 60) % 60;
  const s = total % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};

const splitDuration = (ms) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    hours: Math.floor(total / 3600),
    minutes: Math.floor(total / 60) % 60,
    seconds: total % 60,
  };
};

const clampInt = (value, min, max) => {
  const num = Math.floor(Number(value));
  if (!Number.isFinite(num)) return min;
  return Math.min(max, Math.max(min, num));
};

const makeId = () => `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function DurationFields({ idPrefix, hours, minutes, seconds, onChange }) {
  const fields = [
    { key: "hours", label: "Hours", value: hours, max: 99 },
    { key: "minutes", label: "Min", value: minutes, max: 59 },
    { key: "seconds", label: "Sec", value: seconds, max: 59 },
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {fields.map((field) => (
        <label key={field.key} className="block">
          <span className="text-xs font-semibold text-[var(--muted-foreground)]">{field.label}</span>
          <input
            id={`${idPrefix}-${field.key}`}
            type="number"
            min={0}
            max={field.max}
            value={field.value}
            onChange={(event) => onChange(field.key, clampInt(event.target.value, 0, field.max))}
            className="mt-1 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
          />
        </label>
      ))}
    </div>
  );
}

function ProgressRing({ fraction, danger, label }) {
  const pct = Math.min(100, Math.max(0, fraction * 100));
  const color = danger ? "var(--anslation-ds-danger)" : "var(--primary)";
  return (
    <div
      className="relative h-28 w-28 shrink-0 rounded-full"
      style={{ background: `conic-gradient(${color} ${pct}%, var(--muted) 0)` }}
      role="img"
      aria-label={label}
    >
      <div className="absolute inset-[7px] flex items-center justify-center rounded-full bg-[var(--card)]">
        <span className="font-mono text-lg font-semibold tabular-nums">{label}</span>
      </div>
    </div>
  );
}

export default function ToolHome() {
  const [timers, setTimers] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [form, setForm] = useState({ name: "", hours: 0, minutes: 5, seconds: 0 });

  const audioRef = useRef(null);
  const baseTitleRef = useRef("");
  const timersRef = useRef([]);

  const ensureAudio = useCallback(() => {
    try {
      if (!audioRef.current) {
        const Ctor = window.AudioContext || window.webkitAudioContext;
        if (Ctor) audioRef.current = new Ctor();
      }
      if (audioRef.current?.state === "suspended") audioRef.current.resume();
    } catch {}
  }, []);

  const playTripleBeep = useCallback(() => {
    const ctx = audioRef.current;
    if (!ctx) return;
    try {
      if (ctx.state === "suspended") ctx.resume();
      const start = ctx.currentTime + 0.02;
      [0, 0.24, 0.48].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.0001, start + offset);
        gain.gain.exponentialRampToValueAtTime(0.25, start + offset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + offset + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start + offset);
        osc.stop(start + offset + 0.22);
      });
    } catch {}
  }, []);

  useEffect(() => {
    baseTitleRef.current = document.title;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    updateMotion();
    media.addEventListener?.("change", updateMotion);

    let stored = null;
    try {
      stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
    } catch {}
    const nowMs = Date.now();
    if (Array.isArray(stored) && stored.length > 0) {
      const restored = stored
        .filter(
          (t) =>
            t &&
            typeof t.id === "string" &&
            typeof t.name === "string" &&
            Number.isFinite(t.durationMs) &&
            t.durationMs > 0 &&
            VALID_STATUSES.includes(t.status)
        )
        .map((t) => {
          const acknowledged = t.acknowledged !== false;
          if (t.status === "running") {
            if (!Number.isFinite(t.targetAt) || t.targetAt <= nowMs) {
              return { ...t, status: "done", targetAt: null, remainingMs: 0, acknowledged: false };
            }
            return { ...t, remainingMs: t.targetAt - nowMs, acknowledged };
          }
          const remainingMs = Number.isFinite(t.remainingMs) ? Math.max(0, t.remainingMs) : t.durationMs;
          return { ...t, targetAt: null, remainingMs, acknowledged };
        });
      setTimers(restored);
    } else {
      setTimers([
        {
          id: makeId(),
          name: "Quick timer",
          durationMs: 5 * 60000,
          status: "idle",
          targetAt: null,
          remainingMs: 5 * 60000,
          acknowledged: true,
        },
      ]);
    }
    setNow(nowMs);
    setHydrated(true);

    return () => {
      media.removeEventListener?.("change", updateMotion);
      if (baseTitleRef.current) document.title = baseTitleRef.current;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
    } catch {}
  }, [timers, hydrated]);

  const anyActive = useMemo(
    () => timers.some((t) => t.status === "running" || (t.status === "done" && !t.acknowledged)),
    [timers]
  );

  useEffect(() => {
    timersRef.current = timers;
  }, [timers]);

  useEffect(() => {
    if (!anyActive) return undefined;
    const check = () => {
      const nowMs = Date.now();
      setNow(nowMs);
      const expired = timersRef.current.some(
        (t) => t.status === "running" && Number.isFinite(t.targetAt) && t.targetAt <= nowMs
      );
      if (!expired) return;
      setTimers((prev) =>
        prev.map((t) =>
          t.status === "running" && Number.isFinite(t.targetAt) && t.targetAt <= nowMs
            ? { ...t, status: "done", targetAt: null, remainingMs: 0, acknowledged: false }
            : t
        )
      );
      playTripleBeep();
    };
    const id = window.setInterval(check, 250);
    return () => window.clearInterval(id);
  }, [anyActive, playTripleBeep]);

  useEffect(() => {
    if (!hydrated) return;
    const base = baseTitleRef.current;
    const unacknowledged = timers.some((t) => t.status === "done" && !t.acknowledged);
    if (unacknowledged) {
      document.title = Math.floor(now / 1000) % 2 === 0 ? "⏰ Time's up!" : base;
    } else if (document.title !== base) {
      document.title = base;
    }
  }, [timers, now, hydrated]);

  const patchTimer = useCallback((id, patch) => {
    setTimers((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const addTimer = () => {
    const totalMs = (form.hours * 3600 + form.minutes * 60 + form.seconds) * 1000;
    if (totalMs <= 0) return;
    ensureAudio();
    const name = form.name.trim() || `Timer ${timers.length + 1}`;
    setTimers((prev) => [
      ...prev,
      {
        id: makeId(),
        name,
        durationMs: totalMs,
        status: "idle",
        targetAt: null,
        remainingMs: totalMs,
        acknowledged: true,
      },
    ]);
    setForm((prev) => ({ ...prev, name: "" }));
  };

  const startTimer = (timer) => {
    ensureAudio();
    const base = timer.status === "paused" ? timer.remainingMs : timer.durationMs;
    if (base <= 0) return;
    patchTimer(timer.id, { status: "running", targetAt: Date.now() + base, acknowledged: true });
    setNow(Date.now());
  };

  const pauseTimer = (timer) => {
    if (timer.status !== "running") return;
    patchTimer(timer.id, {
      status: "paused",
      remainingMs: Math.max(0, (timer.targetAt ?? Date.now()) - Date.now()),
      targetAt: null,
    });
  };

  const resetTimer = (timer) => {
    patchTimer(timer.id, {
      status: "idle",
      targetAt: null,
      remainingMs: timer.durationMs,
      acknowledged: true,
    });
  };

  const deleteTimer = (id) => {
    setTimers((prev) => prev.filter((t) => t.id !== id));
  };

  const setCardDuration = (timer, key, value) => {
    const parts = { ...splitDuration(timer.durationMs), [key]: value };
    const totalMs = (parts.hours * 3600 + parts.minutes * 60 + parts.seconds) * 1000;
    patchTimer(timer.id, { durationMs: totalMs, remainingMs: totalMs });
  };

  const runningCount = timers.filter((t) => t.status === "running").length;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <AlarmClock className="h-4 w-4" />
            Multi-timer
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Countdown Timer</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Run several named countdowns at once for cooking, workouts, study sprints, and meetings.
            Each timer counts down to a fixed target time, so it stays accurate even in background
            tabs, and running timers survive a page reload.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="h-fit rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <h2 className="text-sm font-semibold uppercase text-[var(--muted-foreground)]">New timer</h2>
            <label className="mt-4 block">
              <span className="text-sm font-semibold">Timer name</span>
              <input
                type="text"
                value={form.name}
                maxLength={40}
                placeholder="e.g. Pasta, Meeting, Break"
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
              />
            </label>

            <div className="mt-4">
              <span className="text-sm font-semibold">Duration</span>
              <div className="mt-2">
                <DurationFields
                  idPrefix="new-timer"
                  hours={form.hours}
                  minutes={form.minutes}
                  seconds={form.seconds}
                  onChange={(key, value) => setForm((prev) => ({ ...prev, [key]: value }))}
                />
              </div>
            </div>

            <div className="mt-4">
              <span className="text-sm font-semibold">Quick presets</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {PRESET_MINUTES.map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, hours: Math.floor(minutes / 60), minutes: minutes % 60, seconds: 0 }))}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                  >
                    {minutes} min
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={addTimer}
              disabled={form.hours * 3600 + form.minutes * 60 + form.seconds <= 0}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add timer
            </button>

            <p className="mt-4 rounded-md bg-[var(--muted)] p-3 text-xs leading-5 text-[var(--muted-foreground)]">
              {runningCount > 0
                ? `${runningCount} timer${runningCount > 1 ? "s" : ""} running. You can leave this tab — each timer tracks a fixed end time.`
                : "Timers are saved in your browser, so a reload never loses a running countdown."}
            </p>
          </div>

          <div>
            {timers.length === 0 ? (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-[var(--anslation-ds-shadow-sm)]">
                <p className="text-sm text-[var(--muted-foreground)]">No timers yet. Create your first one on the left.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {timers.map((timer) => {
                  const remaining =
                    timer.status === "running" && Number.isFinite(timer.targetAt)
                      ? Math.max(0, timer.targetAt - now)
                      : timer.remainingMs;
                  const fraction = timer.durationMs > 0 ? remaining / timer.durationMs : 0;
                  const isDoneAlert = timer.status === "done" && !timer.acknowledged;
                  const blinkOn = isDoneAlert && !reducedMotion && Math.floor(now / 500) % 2 === 0;
                  const parts = splitDuration(timer.durationMs);
                  return (
                    <div
                      key={timer.id}
                      className="rounded-lg border bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] transition-colors"
                      style={{
                        borderColor: isDoneAlert ? "var(--anslation-ds-danger)" : "var(--border)",
                        background: isDoneAlert && (blinkOn || reducedMotion) ? "var(--anslation-ds-danger-soft)" : "var(--card)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{timer.name}</p>
                          <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                            {timer.status === "running" && Number.isFinite(timer.targetAt)
                              ? `Ends ${new Date(timer.targetAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                              : `Total ${formatRemaining(timer.durationMs)}`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteTimer(timer.id)}
                          aria-label={`Delete ${timer.name}`}
                          className="rounded-md border border-[var(--border)] p-2 text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-4 flex items-center gap-4">
                        <ProgressRing
                          fraction={timer.status === "idle" ? 1 : fraction}
                          danger={timer.status === "done"}
                          label={formatRemaining(remaining)}
                        />
                        <div className="min-w-0 flex-1" aria-live="polite">
                          {timer.status === "done" ? (
                            <p className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--anslation-ds-danger)" }}>
                              <BellRing className="h-4 w-4" />
                              Time&apos;s up!
                            </p>
                          ) : (
                            <p className="text-sm text-[var(--muted-foreground)]">
                              {timer.status === "running"
                                ? "Counting down"
                                : timer.status === "paused"
                                  ? "Paused"
                                  : "Ready to start"}
                            </p>
                          )}
                          <div className="mt-3 flex flex-wrap gap-2">
                            {timer.status === "running" ? (
                              <button type="button" onClick={() => pauseTimer(timer)} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                                <Pause className="h-4 w-4" />
                                Pause
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => startTimer(timer)}
                                className="inline-flex min-h-9 items-center gap-2 rounded-md bg-[var(--primary)] px-3 py-1.5 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90"
                              >
                                <Play className="h-4 w-4" />
                                {timer.status === "paused" ? "Resume" : timer.status === "done" ? "Restart" : "Start"}
                              </button>
                            )}
                            <button type="button" onClick={() => resetTimer(timer)} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                              <RotateCcw className="h-4 w-4" />
                              {timer.status === "done" ? "Dismiss" : "Reset"}
                            </button>
                          </div>
                        </div>
                      </div>

                      {timer.status === "idle" && (
                        <div className="mt-4 border-t border-[var(--border)] pt-4">
                          <DurationFields
                            idPrefix={timer.id}
                            hours={parts.hours}
                            minutes={parts.minutes}
                            seconds={parts.seconds}
                            onChange={(key, value) => setCardDuration(timer, key, value)}
                          />
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {PRESET_MINUTES.map((minutes) => (
                              <button
                                key={minutes}
                                type="button"
                                onClick={() =>
                                  patchTimer(timer.id, { durationMs: minutes * 60000, remainingMs: minutes * 60000 })
                                }
                                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                              >
                                {minutes}m
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
