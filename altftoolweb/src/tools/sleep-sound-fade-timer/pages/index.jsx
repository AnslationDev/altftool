"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Moon, Pause, Play, RotateCcw } from "lucide-react";

import {
  amplitudeAt,
  DEFAULT_LOOP_SECONDS,
  FADE_CURVES,
  formatClock,
  levelPercentAt,
  LIMITS,
  planFade,
  renderSound,
  silenceClock,
  SOUNDS,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  sound: "brown",
  total: "45",
  fade: "15",
  volume: "60",
  curve: "logarithmic",
  bedtime: "22:45",
};

const DASH = "—";
const TICK_MS = 500;
const GAIN_SMOOTHING_SECONDS = 0.5;
const CHART_POINTS = 90;

export default function ToolHome() {
  const [sound, setSound] = useState(DEFAULTS.sound);
  const [total, setTotal] = useState(DEFAULTS.total);
  const [fade, setFade] = useState(DEFAULTS.fade);
  const [volume, setVolume] = useState(DEFAULTS.volume);
  const [curve, setCurve] = useState(DEFAULTS.curve);
  const [bedtime, setBedtime] = useState(DEFAULTS.bedtime);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [anchor, setAnchor] = useState(0);
  const [audioError, setAudioError] = useState("");
  const [copied, setCopied] = useState(false);

  const audioCtxRef = useRef(null);
  const gainRef = useRef(null);
  const planRef = useRef(null);

  const plan = useMemo(
    () =>
      planFade({
        totalMinutes: Number(total),
        fadeMinutes: Number(fade),
        volumePercent: Number(volume),
        curve,
      }),
    [total, fade, volume, curve],
  );

  const hasError = Boolean(plan.error);
  const totalSeconds = hasError ? 0 : plan.totalSeconds;
  const remaining = hasError ? 0 : totalSeconds - elapsed;
  const finished = !hasError && elapsed >= totalSeconds;
  const currentLevel = hasError ? 0 : levelPercentAt(plan, elapsed);
  const ending = useMemo(
    () => (hasError ? null : silenceClock(bedtime, totalSeconds)),
    [hasError, bedtime, totalSeconds],
  );

  useEffect(() => {
    planRef.current = plan.error ? null : plan;
  }, [plan]);

  useEffect(() => {
    setPlaying(false);
    setElapsed(0);
  }, [totalSeconds]);

  useEffect(() => {
    if (!playing || hasError || typeof window === "undefined") return undefined;
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) {
      setAudioError("This browser does not support the Web Audio API.");
      setPlaying(false);
      return undefined;
    }
    if (!audioCtxRef.current) audioCtxRef.current = new AudioCtor();
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const rendered = renderSound({
      soundId: sound,
      sampleRate: ctx.sampleRate,
      seconds: DEFAULT_LOOP_SECONDS,
      seed: 3,
    });
    if (rendered.error) {
      setAudioError(rendered.error);
      setPlaying(false);
      return undefined;
    }

    const buffer = ctx.createBuffer(1, rendered.length, ctx.sampleRate);
    buffer.copyToChannel(rendered.samples, 0);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    gainRef.current = gain;
    setAudioError("");

    return () => {
      try {
        source.stop();
      } catch {
        /* the source may already have stopped */
      }
      source.disconnect();
      gain.disconnect();
      gainRef.current = null;
    };
  }, [playing, sound, hasError]);

  useEffect(() => {
    if (!playing || hasError) return undefined;
    const id = setInterval(() => {
      const next = Math.min(totalSeconds, (Date.now() - anchor) / 1000);
      setElapsed(next);
      const ctx = audioCtxRef.current;
      const gainNode = gainRef.current;
      const activePlan = planRef.current;
      if (ctx && gainNode && activePlan) {
        gainNode.gain.setTargetAtTime(
          amplitudeAt(activePlan, next),
          ctx.currentTime,
          GAIN_SMOOTHING_SECONDS,
        );
      }
      if (next >= totalSeconds) setPlaying(false);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [playing, anchor, totalSeconds, hasError]);

  useEffect(
    () => () => {
      if (audioCtxRef.current && typeof audioCtxRef.current.close === "function") {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    },
    [],
  );

  const togglePlay = () => {
    if (hasError) return;
    if (playing) {
      setPlaying(false);
      return;
    }
    const from = finished ? 0 : elapsed;
    setElapsed(from);
    setAnchor(Date.now() - from * 1000);
    setPlaying(true);
  };

  const envelope = useMemo(() => {
    if (hasError) return "";
    const points = [];
    for (let i = 0; i <= CHART_POINTS; i += 1) {
      const t = (totalSeconds * i) / CHART_POINTS;
      const x = (i / CHART_POINTS) * 100;
      const y = 100 - levelPercentAt(plan, t);
      points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
    }
    return points.join(" ");
  }, [hasError, plan, totalSeconds]);

  const summary = useMemo(() => {
    if (hasError) return "";
    const chosen = SOUNDS.find((item) => item.id === sound);
    const chosenCurve = FADE_CURVES.find((item) => item.id === curve);
    return [
      "Sleep sound timer",
      `Sound: ${chosen ? chosen.label : sound}`,
      `Total time: ${formatClock(plan.totalSeconds)}`,
      `Steady for ${formatClock(plan.holdSeconds)} at ${plan.volumePercent}% volume`,
      `Then a ${formatClock(plan.fadeSeconds)} ${chosenCurve ? chosenCurve.label.toLowerCase() : curve} fade to silence`,
      ending && !ending.error
        ? `Start ${bedtime} -> silent at ${ending.time}${ending.dayRollover ? " (next day)" : ""}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, plan, sound, curve, ending, bedtime]);

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
    setSound(DEFAULTS.sound);
    setTotal(DEFAULTS.total);
    setFade(DEFAULTS.fade);
    setVolume(DEFAULTS.volume);
    setCurve(DEFAULTS.curve);
    setBedtime(DEFAULTS.bedtime);
    setPlaying(false);
    setElapsed(0);
    setCopied(false);
    setAudioError("");
  };

  const activeSound = SOUNDS.find((item) => item.id === sound);
  const activeCurve = FADE_CURVES.find((item) => item.id === curve);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Moon className="h-4 w-4" aria-hidden="true" />
          Sleep audio
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Sleep Sound Fade Timer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Holds a calming sound at a steady level while you fall asleep, then fades it to complete
          silence over the fade time you choose — so nothing is still playing at 3 a.m.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className={LABEL_CLASS}>Sound</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {SOUNDS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSound(item.id)}
                aria-pressed={sound === item.id}
                className={`min-h-11 rounded-md border px-3 py-2 text-left text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  sound === item.id
                    ? "border-[var(--primary)] bg-[var(--muted)] text-[var(--primary)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </fieldset>
        {activeSound && (
          <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{activeSound.blurb}</p>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sleep-total">
              Total play time (minutes)
            </label>
            <input
              id="sleep-total"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.totalMinutes.min}
              max={LIMITS.totalMinutes.max}
              step="5"
              value={total}
              onChange={(event) => setTotal(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sleep-fade">
              Fade length (minutes)
            </label>
            <input
              id="sleep-fade"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.fadeMinutes.min}
              max={LIMITS.fadeMinutes.max}
              step="1"
              value={fade}
              onChange={(event) => setFade(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sleep-volume">
              Volume (%)
            </label>
            <input
              id="sleep-volume"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.volumePercent.min}
              max={LIMITS.volumePercent.max}
              step="5"
              value={volume}
              onChange={(event) => setVolume(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sleep-curve">
              Fade curve
            </label>
            <select
              id="sleep-curve"
              className={`mt-2 ${INPUT_CLASS}`}
              value={curve}
              onChange={(event) => setCurve(event.target.value)}
            >
              {FADE_CURVES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sleep-bedtime">
              Start time
            </label>
            <input
              id="sleep-bedtime"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={bedtime}
              onChange={(event) => setBedtime(event.target.value)}
            />
          </div>
        </div>
        {activeCurve && (
          <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{activeCurve.blurb}</p>
        )}
      </section>

      {(hasError || audioError) && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error || audioError}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Until silence
            </p>
            <p className="mt-1 font-mono text-5xl font-semibold text-[var(--primary)] tabular-nums">
              {hasError ? DASH : formatClock(remaining)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the settings to start the timer."
                : elapsed >= plan.fadeStartSeconds && !finished
                  ? `Fading — now at ${Math.round(currentLevel)}% of the starting level`
                  : `Steady until ${formatClock(plan.holdSeconds)} in, then a ${formatClock(plan.fadeSeconds)} fade`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Pause the sleep sound" : "Play the sleep sound"}
              className={PRIMARY_BTN}
            >
              {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
              {playing ? "Pause" : finished ? "Play again" : "Play"}
            </button>
            <button type="button" onClick={copyResult} aria-label="Copy the timer settings" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all settings" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <div className="mt-5">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="h-24 w-full rounded-md bg-[var(--muted)]"
              role="img"
              aria-label={`Level holds at 100 percent for ${formatClock(plan.holdSeconds)} then fades to silence over ${formatClock(plan.fadeSeconds)}`}
            >
              <polyline
                points={envelope}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1={(elapsed / (totalSeconds || 1)) * 100}
                y1="0"
                x2={(elapsed / (totalSeconds || 1)) * 100}
                y2="100"
                stroke="var(--foreground)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Total play time", hasError ? DASH : formatClock(plan.totalSeconds)],
            ["Steady period", hasError ? DASH : formatClock(plan.holdSeconds)],
            ["Fade to silence", hasError ? DASH : formatClock(plan.fadeSeconds)],
            ["Fade curve", hasError ? DASH : activeCurve ? activeCurve.label : curve],
            ["Level now", hasError ? DASH : `${Math.round(currentLevel)}% of start`],
            [
              "Silent at",
              hasError || !ending || ending.error
                ? DASH
                : `${ending.time}${ending.dayRollover ? " (next day)" : ""}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Sound is generated in your browser, so the timer keeps working offline — but keep the screen
        awake or the tab open, because a locked phone may suspend audio. This is a comfort tool, not
        a treatment: talk to a doctor about persistent insomnia, tinnitus or snoring.
      </p>
    </main>
  );
}
