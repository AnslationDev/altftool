"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Activity, Copy, Pause, Play, RotateCcw, SkipForward, Square } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const pad = (value) => String(value).padStart(2, "0");

const formatClock = (totalSeconds) => {
  const total = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor(total / 60) % 60;
  const s = total % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
};

const clampInt = (value, min, max) => {
  const num = Math.floor(Number(value));
  if (!Number.isFinite(num)) return min;
  return Math.min(max, Math.max(min, num));
};

const DEFAULT_CONFIG = { prepare: 10, work: 20, rest: 10, rounds: 8, sets: 1, setRest: 60 };

const presets = [
  { label: "Tabata 20/10 × 8", config: { prepare: 10, work: 20, rest: 10, rounds: 8, sets: 1, setRest: 60 } },
  { label: "EMOM 60s × 10", config: { prepare: 10, work: 60, rest: 0, rounds: 10, sets: 1, setRest: 60 } },
  { label: "Boxing 3m/1m × 5", config: { prepare: 15, work: 180, rest: 60, rounds: 5, sets: 1, setRest: 90 } },
  { label: "Beginner 30/30 × 6", config: { prepare: 15, work: 30, rest: 30, rounds: 6, sets: 1, setRest: 60 } },
];

const configFields = [
  { key: "prepare", label: "Prepare (sec)", min: 0, max: 300 },
  { key: "work", label: "Work (sec)", min: 1, max: 3600 },
  { key: "rest", label: "Rest (sec)", min: 0, max: 3600 },
  { key: "rounds", label: "Rounds", min: 1, max: 99 },
  { key: "sets", label: "Sets", min: 1, max: 20 },
  { key: "setRest", label: "Rest between sets (sec)", min: 0, max: 3600 },
];

const PHASE_LABELS = { prepare: "PREPARE", work: "WORK", rest: "REST", setrest: "SET REST" };

const buildPhases = (cfg) => {
  const phases = [];
  if (cfg.prepare > 0) phases.push({ type: "prepare", secs: cfg.prepare, round: 0, set: 1 });
  for (let s = 1; s <= cfg.sets; s += 1) {
    for (let r = 1; r <= cfg.rounds; r += 1) {
      phases.push({ type: "work", secs: cfg.work, round: r, set: s });
      const lastRound = r === cfg.rounds;
      const lastSet = s === cfg.sets;
      if (!lastRound) {
        if (cfg.rest > 0) phases.push({ type: "rest", secs: cfg.rest, round: r, set: s });
      } else if (!lastSet && cfg.setRest > 0) {
        phases.push({ type: "setrest", secs: cfg.setRest, round: r, set: s });
      }
    }
  }
  let offset = 0;
  return phases.map((phase) => {
    const withOffset = { ...phase, startOffsetSec: offset };
    offset += phase.secs;
    return withOffset;
  });
};

export default function ToolHome() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [session, setSession] = useState(null);
  const [now, setNow] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [copied, setCopied] = useState(false);

  const audioRef = useRef(null);
  const sessionRef = useRef(null);
  const lastWholeSecRef = useRef(null);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  const ensureAudio = useCallback(() => {
    try {
      if (!audioRef.current) {
        const Ctor = window.AudioContext || window.webkitAudioContext;
        if (Ctor) audioRef.current = new Ctor();
      }
      if (audioRef.current?.state === "suspended") audioRef.current.resume();
    } catch {}
  }, []);

  const playCue = useCallback((kind) => {
    const ctx = audioRef.current;
    if (!ctx) return;
    try {
      if (ctx.state === "suspended") ctx.resume();
      const base = ctx.currentTime + 0.02;
      const tone = (offset, freq, dur, gainValue) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, base + offset);
        gain.gain.exponentialRampToValueAtTime(gainValue, base + offset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, base + offset + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(base + offset);
        osc.stop(base + offset + dur + 0.05);
      };
      if (kind === "tick") tone(0, 660, 0.09, 0.15);
      else if (kind === "work") tone(0, 1245, 0.3, 0.26);
      else if (kind === "done") {
        tone(0, 880, 0.18, 0.24);
        tone(0.26, 1175, 0.3, 0.24);
      }
    } catch {}
  }, []);

  const phases = useMemo(() => buildPhases(config), [config]);
  const totalSeconds = useMemo(
    () => phases.reduce((sum, phase) => sum + phase.secs, 0),
    [phases]
  );

  const tick = useCallback(() => {
    const s = sessionRef.current;
    const list = s?.phases || [];
    if (!s || s.status !== "running" || list.length === 0) return;
    const nowMs = Date.now();
    setNow(nowMs);
    let { idx, endsAt } = s;
    let status = s.status;
    const cues = [];
    while (status === "running" && endsAt <= nowMs) {
      if (idx + 1 >= list.length) {
        status = "done";
        cues.push("done");
        break;
      }
      idx += 1;
      endsAt += list[idx].secs * 1000;
      if (list[idx].type === "work") cues.push("work");
      lastWholeSecRef.current = null;
    }
    if (status === "running") {
      const wholeRemaining = Math.ceil((endsAt - nowMs) / 1000);
      if (wholeRemaining !== lastWholeSecRef.current) {
        lastWholeSecRef.current = wholeRemaining;
        if (wholeRemaining >= 1 && wholeRemaining <= 3) cues.push("tick");
      }
    }
    if (idx !== s.idx || endsAt !== s.endsAt || status !== s.status) {
      setSession({ ...s, idx, endsAt, status });
    }
    cues.forEach(playCue);
  }, [playCue]);

  const isRunning = session?.status === "running";

  useEffect(() => {
    if (!isRunning) return undefined;
    const id = window.setInterval(tick, 200);
    return () => window.clearInterval(id);
  }, [isRunning, tick]);

  const startSession = () => {
    if (phases.length === 0 || totalSeconds <= 0) return;
    ensureAudio();
    lastWholeSecRef.current = null;
    const nowMs = Date.now();
    setNow(nowMs);
    setSession({
      idx: 0,
      endsAt: nowMs + phases[0].secs * 1000,
      status: "running",
      pausedRemainingMs: 0,
      phases,
      cfg: config,
    });
    if (phases[0].type === "work") playCue("work");
  };

  const pauseSession = () => {
    const s = sessionRef.current;
    if (!s || s.status !== "running") return;
    setSession({ ...s, status: "paused", pausedRemainingMs: Math.max(0, s.endsAt - Date.now()) });
  };

  const resumeSession = () => {
    const s = sessionRef.current;
    if (!s || s.status !== "paused") return;
    ensureAudio();
    setNow(Date.now());
    setSession({ ...s, status: "running", endsAt: Date.now() + s.pausedRemainingMs });
  };

  const skipPhase = () => {
    const s = sessionRef.current;
    const list = s?.phases || [];
    if (!s || s.status === "done") return;
    ensureAudio();
    lastWholeSecRef.current = null;
    if (s.idx + 1 >= list.length) {
      setSession({ ...s, status: "done" });
      playCue("done");
      return;
    }
    const idx = s.idx + 1;
    const nowMs = Date.now();
    setNow(nowMs);
    setSession({ ...s, idx, endsAt: nowMs + list[idx].secs * 1000, status: "running", pausedRemainingMs: 0 });
    if (list[idx].type === "work") playCue("work");
  };

  const endSession = () => setSession(null);

  const breakdown = useMemo(() => {
    const workCount = config.rounds * config.sets;
    const restCount = phases.filter((phase) => phase.type === "rest").length;
    const setRestCount = phases.filter((phase) => phase.type === "setrest").length;
    const parts = [];
    if (config.prepare > 0) parts.push(`${config.prepare}s prepare`);
    parts.push(`${workCount} × ${config.work}s work`);
    if (restCount > 0) parts.push(`${restCount} × ${config.rest}s rest`);
    if (setRestCount > 0) parts.push(`${setRestCount} × ${config.setRest}s set rest`);
    return `${parts.join(" + ")} = ${formatClock(totalSeconds)}`;
  }, [config, phases, totalSeconds]);

  const planText = useMemo(
    () =>
      [
        "HIIT / Tabata Workout Plan",
        breakdown,
        "",
        ...phases.map(
          (phase, index) =>
            `${index + 1}. ${PHASE_LABELS[phase.type]} — ${phase.secs}s${
              phase.type === "work" || phase.type === "rest"
                ? ` (round ${phase.round}/${config.rounds}${config.sets > 1 ? `, set ${phase.set}/${config.sets}` : ""})`
                : ""
            }`
        ),
        "",
        `Total: ${formatClock(totalSeconds)}`,
        `Generated: ${new Date().toLocaleString()}`,
      ].join("\n"),
    [phases, breakdown, totalSeconds, config]
  );

  const copyPlan = async () => {
    const success = await safeCopyText(planText);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const activePhases = session ? session.phases : phases;
  const activeConfig = session ? session.cfg : config;
  const sessionTotalSeconds = activePhases.reduce((sum, phase) => sum + phase.secs, 0);
  const phase =
    session && activePhases.length > 0 ? activePhases[Math.min(session.idx, activePhases.length - 1)] : null;
  const nextPhase =
    session && session.status !== "done" && session.idx + 1 < activePhases.length
      ? activePhases[session.idx + 1]
      : null;
  const remainingMs = !session
    ? 0
    : session.status === "paused"
      ? session.pausedRemainingMs
      : session.status === "done"
        ? 0
        : Math.max(0, session.endsAt - now);
  const remainingWhole = Math.ceil(remainingMs / 1000);
  const elapsedSeconds = !session
    ? 0
    : session.status === "done" || !phase
      ? sessionTotalSeconds
      : phase.startOffsetSec + phase.secs - remainingMs / 1000;
  const progressPct = sessionTotalSeconds > 0 ? Math.min(100, Math.max(0, (elapsedSeconds / sessionTotalSeconds) * 100)) : 0;
  const isDone = session?.status === "done";
  const flashDim =
    session?.status === "running" && remainingMs <= 3000 && !reducedMotion && Math.floor(now / 250) % 2 === 0;

  const phaseCardClass = isDone
    ? "bg-[var(--card)] border-[var(--border)]"
    : phase?.type === "work"
      ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]"
      : phase?.type === "prepare"
        ? "bg-[var(--card)] border-[var(--primary)]"
        : "bg-[var(--muted)] border-[var(--border)]";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Activity className="h-4 w-4" />
            Interval training
          </div>
          <h1 className="text-4xl font-semibold leading-tight">HIIT &amp; Tabata Timer</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Build work/rest intervals with rounds and sets, then train with big phase displays and
            audio cues. Phase changes are scheduled against the clock, so timing never drifts — even
            on long workouts.
          </p>
        </section>

        {session === null ? (
          <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase text-[var(--muted-foreground)]">Intervals</h2>
                <button
                  type="button"
                  onClick={() => setConfig(DEFAULT_CONFIG)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {configFields.map((field) => (
                  <label key={field.key} className="block">
                    <span className="text-sm font-semibold">{field.label}</span>
                    <input
                      type="number"
                      min={field.min}
                      max={field.max}
                      value={config[field.key]}
                      onChange={(event) =>
                        setConfig((prev) => ({
                          ...prev,
                          [field.key]: clampInt(event.target.value, field.min, field.max),
                        }))
                      }
                      className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                    />
                  </label>
                ))}
              </div>

              <div className="mt-5">
                <span className="text-sm font-semibold">Presets</span>
                <div className="mt-2 grid gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setConfig(preset.config)}
                      className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Workout summary</p>
                <button type="button" onClick={copyPlan} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy plan"}
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-end gap-4">
                <div className="rounded-lg bg-[var(--muted)] p-5">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Total duration</p>
                  <p className="mt-1 font-mono text-4xl font-semibold tabular-nums text-[var(--primary)]">
                    {formatClock(totalSeconds)}
                  </p>
                </div>
                <div className="text-sm leading-6 text-[var(--muted-foreground)]">
                  <p>{phases.length} phases · {config.rounds * config.sets} work intervals</p>
                  <p className="mt-1">{breakdown}</p>
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase text-[var(--muted-foreground)]">Interval map</p>
                <div className="flex h-3 w-full overflow-hidden rounded-full border border-[var(--border)]">
                  {phases.map((phase2, index) => (
                    <div
                      key={`${phase2.type}-${index}`}
                      title={`${PHASE_LABELS[phase2.type]} ${phase2.secs}s`}
                      style={{
                        flexBasis: `${(phase2.secs / Math.max(1, totalSeconds)) * 100}%`,
                        background:
                          phase2.type === "work"
                            ? "var(--primary)"
                            : phase2.type === "prepare"
                              ? "var(--border)"
                              : "var(--muted)",
                      }}
                    />
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-[var(--muted-foreground)]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--primary)" }} />
                    Work
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full border border-[var(--border)]" style={{ background: "var(--muted)" }} />
                    Rest
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--border)" }} />
                    Prepare
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={startSession}
                disabled={totalSeconds <= 0}
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-6 py-3 text-base font-semibold text-[var(--primary-foreground)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                <Play className="h-5 w-5" />
                Start workout
              </button>
            </div>
          </section>
        ) : (
          <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div
              className={`flex min-h-[46vh] flex-col items-center justify-center rounded-lg border p-8 text-center transition-colors ${phaseCardClass}`}
              aria-live="polite"
            >
              <p
                className="text-2xl font-semibold uppercase tracking-[0.3em] sm:text-3xl"
                style={isDone ? { color: "var(--anslation-ds-success)" } : phase?.type === "prepare" ? { color: "var(--primary)" } : undefined}
              >
                {isDone ? "DONE" : phase ? PHASE_LABELS[phase.type] : ""}
              </p>
              <p
                className={`mt-4 font-mono font-semibold tabular-nums leading-none ${flashDim ? "opacity-60" : ""} ${
                  isDone ? "text-6xl sm:text-7xl" : "text-8xl sm:text-9xl"
                }`}
              >
                {isDone ? formatClock(sessionTotalSeconds) : remainingWhole >= 60 ? formatClock(remainingWhole) : remainingWhole}
              </p>
              <p className="mt-4 text-sm font-semibold uppercase tracking-wide opacity-80">
                {isDone
                  ? "Workout complete — great job!"
                  : phase && phase.round > 0
                    ? `Round ${phase.round}/${activeConfig.rounds}${activeConfig.sets > 1 ? ` · Set ${phase.set}/${activeConfig.sets}` : ""}`
                    : "Get ready"}
              </p>
              {nextPhase && (
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide opacity-70">
                  Next: {PHASE_LABELS[nextPhase.type]} · {nextPhase.secs}s
                </p>
              )}
              {session.status === "paused" && (
                <p className="mt-3 rounded-full border border-current px-3 py-1 text-xs font-semibold uppercase">Paused</p>
              )}
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--muted-foreground)]">
                <span>Overall progress</span>
                <span className="font-mono tabular-nums">
                  {formatClock(elapsedSeconds)} / {formatClock(sessionTotalSeconds)}
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                <div className="h-full rounded-full" style={{ width: `${progressPct}%`, background: "var(--primary)" }} />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {!isDone &&
                (session.status === "running" ? (
                  <button type="button" onClick={pauseSession} className="btn-secondary min-h-12 px-5 py-3 text-sm">
                    <Pause className="h-4 w-4" />
                    Pause
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={resumeSession}
                    className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90"
                  >
                    <Play className="h-4 w-4" />
                    Resume
                  </button>
                ))}
              {!isDone && (
                <button type="button" onClick={skipPhase} className="btn-secondary min-h-12 px-5 py-3 text-sm">
                  <SkipForward className="h-4 w-4" />
                  Skip phase
                </button>
              )}
              <button type="button" onClick={endSession} className="btn-secondary min-h-12 px-5 py-3 text-sm">
                <Square className="h-4 w-4" />
                {isDone ? "Back to setup" : "End workout"}
              </button>
            </div>
          </section>
        )}

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4">
          <p className="text-xs leading-5 text-[var(--muted-foreground)]">
            Interval timings and totals are estimates for training awareness, not medical advice.
            Adjust intensity to your own fitness level and consult a doctor before starting a new
            exercise program.
          </p>
        </section>
      </div>
    </main>
  );
}
