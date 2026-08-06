"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Pause, Play, RotateCcw, Waves } from "lucide-react";

import {
  amplitudeAt,
  DEFAULT_CROSSFADE_SECONDS,
  DEFAULT_LOOP_SECONDS,
  formatClock,
  generateNoise,
  LIMITS,
  NOISE_TYPES,
  percentAt,
  planSession,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  type: "pink",
  session: "60",
  ramp: "5",
  fade: "2",
  startVolume: "10",
  targetVolume: "60",
};

const DASH = "—";
const TICK_MS = 250;
const GAIN_SMOOTHING_SECONDS = 0.3;
const CHART_POINTS = 80;

export default function ToolHome() {
  const [type, setType] = useState(DEFAULTS.type);
  const [session, setSession] = useState(DEFAULTS.session);
  const [ramp, setRamp] = useState(DEFAULTS.ramp);
  const [fade, setFade] = useState(DEFAULTS.fade);
  const [startVolume, setStartVolume] = useState(DEFAULTS.startVolume);
  const [targetVolume, setTargetVolume] = useState(DEFAULTS.targetVolume);
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
      planSession({
        sessionMinutes: Number(session),
        rampMinutes: Number(ramp),
        fadeOutMinutes: Number(fade),
        startVolumePercent: Number(startVolume),
        targetVolumePercent: Number(targetVolume),
      }),
    [session, ramp, fade, startVolume, targetVolume],
  );

  const hasError = Boolean(plan.error);
  const totalSeconds = hasError ? 0 : plan.totalSeconds;
  const currentPercent = hasError ? 0 : percentAt(plan, elapsed);
  const finished = !hasError && elapsed >= totalSeconds;

  // The actual playable/looped buffer is shorter than DEFAULT_LOOP_SECONDS —
  // generateNoise trims a crossfade tail so the loop point is inaudible.
  // Compute the real length once (it does not depend on noise colour or
  // sample rate) instead of displaying the raw requested length.
  const loopSeconds = useMemo(() => {
    const noise = generateNoise({ seconds: DEFAULT_LOOP_SECONDS, seed: 1, sampleRate: 44100 });
    return noise.error ? DEFAULT_LOOP_SECONDS - DEFAULT_CROSSFADE_SECONDS : noise.seconds;
  }, []);

  useEffect(() => {
    planRef.current = plan.error ? null : plan;
  }, [plan]);

  useEffect(() => {
    setPlaying(false);
    setElapsed(0);
  }, [totalSeconds]);

  // Owns the audio graph. Rebuilt when playback starts or the noise colour changes.
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

    const noise = generateNoise({
      type,
      sampleRate: ctx.sampleRate,
      seconds: DEFAULT_LOOP_SECONDS,
      seed: 1,
    });
    if (noise.error) {
      setAudioError(noise.error);
      setPlaying(false);
      return undefined;
    }

    const buffer = ctx.createBuffer(1, noise.length, ctx.sampleRate);
    buffer.copyToChannel(noise.samples, 0);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const gain = ctx.createGain();
    // Seed the new gain node at the envelope's current amplitude (not 0) so
    // switching noise colour mid-session doesn't dip to silence and ramp
    // back up — the audio graph is torn down and rebuilt on every colour
    // change, but playback position (anchor/elapsed) is untouched.
    const liveElapsed = Math.min(totalSeconds, (Date.now() - anchor) / 1000);
    gain.gain.value = amplitudeAt(planRef.current, liveElapsed);
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
    // anchor/totalSeconds are intentionally read live (not as deps): this
    // effect should only rebuild the audio graph when playback starts, the
    // noise colour changes, or an error state flips — not on every tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, type, hasError]);

  // Clock and volume-envelope tick.
  useEffect(() => {
    if (!playing || hasError) return undefined;
    const id = setInterval(() => {
      const next = Math.min(totalSeconds, (Date.now() - anchor) / 1000);
      setElapsed(next);
      const ctx = audioCtxRef.current;
      const gain = gainRef.current;
      const activePlan = planRef.current;
      if (ctx && gain && activePlan) {
        gain.gain.setTargetAtTime(
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
      const y = 100 - percentAt(plan, t);
      points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
    }
    return points.join(" ");
  }, [hasError, plan, totalSeconds]);

  const summary = useMemo(() => {
    if (hasError) return "";
    const noise = NOISE_TYPES.find((item) => item.id === type);
    return [
      "Background noise session",
      `Sound: ${noise ? noise.label : type}`,
      `Length: ${formatClock(plan.totalSeconds)}`,
      `Ramp up: ${formatClock(plan.rampSeconds)} from ${plan.startPercent}% to ${plan.targetPercent}%`,
      `Hold at ${plan.targetPercent}%: ${formatClock(plan.holdSeconds)}`,
      `Fade out: ${formatClock(plan.fadeSeconds)}`,
    ].join("\n");
  }, [hasError, plan, type]);

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
    setType(DEFAULTS.type);
    setSession(DEFAULTS.session);
    setRamp(DEFAULTS.ramp);
    setFade(DEFAULTS.fade);
    setStartVolume(DEFAULTS.startVolume);
    setTargetVolume(DEFAULTS.targetVolume);
    setPlaying(false);
    setElapsed(0);
    setCopied(false);
    setAudioError("");
  };

  const activeNoise = NOISE_TYPES.find((item) => item.id === type);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Waves className="h-4 w-4" aria-hidden="true" />
          Focus audio
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Study Background Noise Player</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          White, pink and brown noise synthesised in your browser and looped seamlessly, with a
          session timer, a slow volume ramp at the start and an automatic fade to silence at the end.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className={LABEL_CLASS}>Noise colour</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {NOISE_TYPES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setType(item.id)}
                aria-pressed={type === item.id}
                className={`min-h-11 rounded-md border px-3 py-2 text-left text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  type === item.id
                    ? "border-[var(--primary)] bg-[var(--muted)] text-[var(--primary)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                }`}
              >
                {item.label}
                <span className="mt-0.5 block text-xs font-normal text-[var(--muted-foreground)]">
                  {item.slopeDbPerOctave} dB/octave
                </span>
              </button>
            ))}
          </div>
        </fieldset>
        {activeNoise && (
          <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{activeNoise.blurb}</p>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="noise-session">
              Session length (minutes)
            </label>
            <input
              id="noise-session"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.sessionMinutes.min}
              max={LIMITS.sessionMinutes.max}
              step="5"
              value={session}
              onChange={(event) => setSession(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="noise-ramp">
              Volume ramp up (minutes)
            </label>
            <input
              id="noise-ramp"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.rampMinutes.min}
              max={LIMITS.rampMinutes.max}
              step="1"
              value={ramp}
              onChange={(event) => setRamp(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="noise-fade">
              Fade out at the end (minutes)
            </label>
            <input
              id="noise-fade"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={LIMITS.fadeOutMinutes.min}
              max={LIMITS.fadeOutMinutes.max}
              step="1"
              value={fade}
              onChange={(event) => setFade(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS} htmlFor="noise-start-vol">
                Start volume (%)
              </label>
              <input
                id="noise-start-vol"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min={LIMITS.volumePercent.min}
                max={LIMITS.volumePercent.max}
                step="5"
                value={startVolume}
                onChange={(event) => setStartVolume(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="noise-target-vol">
                Target volume (%)
              </label>
              <input
                id="noise-target-vol"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min={LIMITS.volumePercent.min}
                max={LIMITS.volumePercent.max}
                step="5"
                value={targetVolume}
                onChange={(event) => setTargetVolume(event.target.value)}
              />
            </div>
          </div>
        </div>
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
              Time remaining
            </p>
            <p className="mt-1 font-mono text-5xl font-semibold text-[var(--primary)] tabular-nums">
              {hasError ? DASH : formatClock(totalSeconds - elapsed)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the settings to start a session."
                : `${activeNoise ? activeNoise.label : ""} at ${Math.round(currentPercent)}% volume`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Pause the noise" : "Play the noise"}
              className={PRIMARY_BTN}
            >
              {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
              {playing ? "Pause" : finished ? "Play again" : "Play"}
            </button>
            <button type="button" onClick={copyResult} aria-label="Copy the session settings" className={GHOST_BTN}>
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
              aria-label={`Volume envelope: ramps from ${plan.startPercent}% to ${plan.targetPercent}% then fades to silence`}
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
            ["Session length", hasError ? DASH : formatClock(plan.totalSeconds)],
            [
              "Ramp up",
              hasError
                ? DASH
                : `${formatClock(plan.rampSeconds)} (${plan.startPercent}% to ${plan.targetPercent}%)`,
            ],
            ["Hold at target", hasError ? DASH : formatClock(plan.holdSeconds)],
            ["Fade out", hasError ? DASH : formatClock(plan.fadeSeconds)],
            ["Current volume", hasError ? DASH : `${Math.round(currentPercent)}%`],
            ["Loop length", hasError ? DASH : `~${loopSeconds.toFixed(2)} s, seamlessly crossfaded`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Audio is generated locally with the Web Audio API — nothing streams or downloads. Keep
        background sound low enough that you could still hold a conversation over it; prolonged
        listening above roughly 80 dB can damage hearing, and headphones make that easy to exceed.
      </p>
    </main>
  );
}
