"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, PawPrint, Play, RotateCcw, Square } from "lucide-react";

import {
  AMBIENT_PRESETS,
  EVENT_PRESETS,
  SOUND_PRESETS,
  SPECIES_PROFILES,
  formatMinutes,
  generateShapedNoise,
  planCalmingSession,
  playerGainFor,
} from "../lib";

const DEC = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const db = (value) => (Number.isFinite(value) ? `${DEC.format(value)} dB(A)` : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  species: "dog",
  presetId: "brown",
  speakerDbAt1m: "60",
  distanceM: "2",
  ambientDba: "35",
  eventDba: "72",
  eventDurationMin: "90",
  leadInMin: "30",
  windDownMin: "20",
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : Number.NaN;
};

const VERDICT_TONE = {
  covered: "text-[var(--success)]",
  good: "text-[var(--success)]",
  partial: "text-[var(--foreground)]",
  poor: "text-[var(--danger)]",
};

const SAFETY_TONE = {
  safe: "text-[var(--success)]",
  caution: "text-[var(--foreground)]",
  unsafe: "text-[var(--danger)]",
};

export default function ToolHome() {
  const [species, setSpecies] = useState(DEFAULTS.species);
  const [presetId, setPresetId] = useState(DEFAULTS.presetId);
  const [speakerDbAt1m, setSpeakerDbAt1m] = useState(DEFAULTS.speakerDbAt1m);
  const [distanceM, setDistanceM] = useState(DEFAULTS.distanceM);
  const [ambientDba, setAmbientDba] = useState(DEFAULTS.ambientDba);
  const [eventDba, setEventDba] = useState(DEFAULTS.eventDba);
  const [eventDurationMin, setEventDurationMin] = useState(DEFAULTS.eventDurationMin);
  const [leadInMin, setLeadInMin] = useState(DEFAULTS.leadInMin);
  const [windDownMin, setWindDownMin] = useState(DEFAULTS.windDownMin);
  const [playing, setPlaying] = useState(false);
  const [audioError, setAudioError] = useState("");
  const [copied, setCopied] = useState(false);

  const audioRef = useRef(null);

  const plan = useMemo(
    () =>
      planCalmingSession({
        species,
        presetId,
        speakerDbAt1m: toNumber(speakerDbAt1m),
        distanceM: toNumber(distanceM),
        ambientDba: toNumber(ambientDba),
        eventDba: toNumber(eventDba),
        eventDurationMin: toNumber(eventDurationMin),
        leadInMin: toNumber(leadInMin),
        windDownMin: toNumber(windDownMin),
      }),
    [
      species,
      presetId,
      speakerDbAt1m,
      distanceM,
      ambientDba,
      eventDba,
      eventDurationMin,
      leadInMin,
      windDownMin,
    ],
  );

  const hasError = Boolean(plan.error);

  const stopAudio = () => {
    const graph = audioRef.current;
    audioRef.current = null;
    setPlaying(false);
    if (!graph) return;
    try {
      graph.master.gain.setTargetAtTime(0, graph.ctx.currentTime, 0.25);
      const source = graph.source;
      window.setTimeout(() => {
        try {
          source.stop();
        } catch {
          /* already stopped */
        }
        graph.ctx.close().catch(() => {});
      }, 900);
    } catch {
      /* nothing left to tear down */
    }
  };

  useEffect(() => stopAudio, []);

  const startAudio = () => {
    if (hasError) return;
    setAudioError("");
    const Ctor = typeof window !== "undefined" ? window.AudioContext || window.webkitAudioContext : null;
    if (!Ctor) {
      setAudioError("This browser does not support the Web Audio API.");
      return;
    }
    try {
      const ctx = new Ctor();
      const samples = generateShapedNoise(Math.round(ctx.sampleRate * 8), plan.preset.slopeDbPerOctave, 20240);
      if (!samples) {
        setAudioError("Could not build the noise loop.");
        ctx.close().catch(() => {});
        return;
      }
      const buffer = ctx.createBuffer(1, samples.length, ctx.sampleRate);
      buffer.copyToChannel(samples, 0);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const highpass = ctx.createBiquadFilter();
      highpass.type = "highpass";
      highpass.frequency.value = plan.highpassHz;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.value = plan.lowpassHz;
      lowpass.Q.value = 0.7;

      const master = ctx.createGain();
      master.gain.value = 0;

      source.connect(highpass).connect(lowpass).connect(master).connect(ctx.destination);

      let pulse = null;
      if (plan.pulseBpm > 0) {
        pulse = ctx.createOscillator();
        pulse.type = "sine";
        pulse.frequency.value = plan.pulseBpm / 60;
        const depth = ctx.createGain();
        depth.gain.value = 0.18;
        pulse.connect(depth).connect(master.gain);
        pulse.start();
      }

      source.start();
      const target = playerGainFor({ speakerDbAt1m: plan.levelAtPet, trimDb: plan.trimDb });
      master.gain.setTargetAtTime(target, ctx.currentTime, 1.5);

      audioRef.current = { ctx, source, master, lowpass, highpass, pulse };
      setPlaying(true);
    } catch {
      setAudioError("The browser blocked audio playback. Tap play again after interacting with the page.");
    }
  };

  useEffect(() => {
    const graph = audioRef.current;
    if (!graph || hasError) return;
    graph.lowpass.frequency.setTargetAtTime(plan.lowpassHz, graph.ctx.currentTime, 0.2);
    graph.highpass.frequency.setTargetAtTime(plan.highpassHz, graph.ctx.currentTime, 0.2);
    graph.master.gain.setTargetAtTime(
      playerGainFor({ speakerDbAt1m: plan.levelAtPet, trimDb: plan.trimDb }),
      graph.ctx.currentTime,
      0.4,
    );
  }, [plan, hasError]);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Pet Calming Sound Player",
      `Species: ${plan.profile.label}`,
      `Preset: ${plan.preset.label}`,
      `Level at the pet: ${db(plan.levelAtPet)}`,
      `Room background with the loop on: ${db(plan.background)}`,
      `Event peaks stand out by: ${db(plan.prominenceDb)} — ${plan.verdict.label}`,
      plan.recommendedAt1m === null
        ? "Recommended: the room is already loud enough, no masker needed."
        : `Recommended speaker level at 1 m: ${db(plan.recommendedAt1m)}`,
      `Safety: ${plan.safety.label} — ${plan.safety.detail}`,
      `Session length: ${formatMinutes(plan.totalMin)}`,
    ].join("\n");
  }, [plan, hasError]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSpecies(DEFAULTS.species);
    setPresetId(DEFAULTS.presetId);
    setSpeakerDbAt1m(DEFAULTS.speakerDbAt1m);
    setDistanceM(DEFAULTS.distanceM);
    setAmbientDba(DEFAULTS.ambientDba);
    setEventDba(DEFAULTS.eventDba);
    setEventDurationMin(DEFAULTS.eventDurationMin);
    setLeadInMin(DEFAULTS.leadInMin);
    setWindDownMin(DEFAULTS.windDownMin);
    setCopied(false);
    setAudioError("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PawPrint className="h-4 w-4" aria-hidden="true" />
          Calm room
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Pet Calming Sound Player</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Generate a low-stimulation noise loop and work out how loud it actually needs to be to
          soften firework peaks, using decibel addition and the inverse-square law.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pcs-species">
              Animal
            </label>
            <select
              id="pcs-species"
              className={`mt-2 ${INPUT_CLASS}`}
              value={species}
              onChange={(event) => setSpecies(event.target.value)}
            >
              {Object.values(SPECIES_PROFILES).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pcs-preset">
              Sound preset
            </label>
            <select
              id="pcs-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={presetId}
              onChange={(event) => setPresetId(event.target.value)}
            >
              {Object.values(SOUND_PRESETS).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pcs-speaker">
              Speaker level at 1 m (dB A)
            </label>
            <input
              id="pcs-speaker"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="20"
              max="100"
              step="1"
              value={speakerDbAt1m}
              onChange={(event) => setSpeakerDbAt1m(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pcs-distance">
              Pet&rsquo;s distance from the speaker (m)
            </label>
            <input
              id="pcs-distance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.25"
              step="0.25"
              value={distanceM}
              onChange={(event) => setDistanceM(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pcs-ambient">
              Room without the loop (dB A)
            </label>
            <input
              id="pcs-ambient"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={ambientDba}
              onChange={(event) => setAmbientDba(event.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {AMBIENT_PRESETS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAmbientDba(String(item.dba))}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pcs-event">
              Firework peaks heard indoors (dB A)
            </label>
            <input
              id="pcs-event"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="30"
              max="120"
              step="1"
              value={eventDba}
              onChange={(event) => setEventDba(event.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {EVENT_PRESETS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setEventDba(String(item.dba))}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pcs-duration">
              Event length (minutes)
            </label>
            <input
              id="pcs-duration"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="600"
              step="5"
              value={eventDurationMin}
              onChange={(event) => setEventDurationMin(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS} htmlFor="pcs-lead">
                Lead-in (min)
              </label>
              <input
                id="pcs-lead"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="5"
                value={leadInMin}
                onChange={(event) => setLeadInMin(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="pcs-wind">
                Wind-down (min)
              </label>
              <input
                id="pcs-wind"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="5"
                value={windDownMin}
                onChange={(event) => setWindDownMin(event.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Level reaching your pet
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : db(plan.levelAtPet)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "—" : `${plan.preset.label} · ${plan.profile.label}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={playing ? stopAudio : startAudio}
              aria-label={playing ? "Stop the calming loop" : "Play the calming loop"}
              className={PRIMARY_BTN}
              disabled={hasError}
            >
              {playing ? <Square className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
              {playing ? "Stop" : "Play loop"}
            </button>
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the calming session plan"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {audioError ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {audioError}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Room background with the loop running", hasError ? "—" : db(plan.background)],
            ["Peaks stand out above the background by", hasError ? "—" : db(plan.prominenceDb)],
            [
              "Masking verdict",
              hasError ? "—" : plan.verdict.label,
              hasError ? "" : VERDICT_TONE[plan.verdict.id],
            ],
            [
              "Safe-level check",
              hasError ? "—" : plan.safety.label,
              hasError ? "" : SAFETY_TONE[plan.safety.id],
            ],
            [
              "Suggested speaker level at 1 m",
              hasError
                ? "—"
                : plan.recommendedAt1m === null
                  ? "None needed — the room is already loud enough"
                  : db(plan.recommendedAt1m),
            ],
            [
              "Change from your current setting",
              hasError || plan.recommendedAt1m === null
                ? "—"
                : `${plan.adjustmentDb >= 0 ? "+" : ""}${DEC.format(plan.adjustmentDb)} dB`,
            ],
            ["Filter band applied", hasError ? "—" : `${plan.highpassHz} Hz – ${plan.lowpassHz} Hz`],
            ["Total session", hasError ? "—" : formatMinutes(plan.totalMin)],
          ].map(([label, value, tone]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className={`text-right font-semibold ${tone || ""}`}>{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError ? (
          <>
            <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">{plan.verdict.detail}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{plan.safety.detail}</p>
            {plan.cappedBySafety ? (
              <p className="mt-2 text-sm leading-6 text-[var(--danger)]">
                Full masking would need more than 70 dB(A) at the pet, so the suggestion is capped.
                Move the pet to an interior room instead of raising the volume.
              </p>
            ) : null}
          </>
        ) : null}
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Session timeline</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {plan.loopCount} passes of a 10-minute loop covers the whole session.
          </p>
          <ol className="mt-4 space-y-3">
            {plan.timeline.map((step) => (
              <li key={step.id} className="rounded-md border border-[var(--border)] p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold">{step.label}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {formatMinutes(step.startMin)} → {formatMinutes(step.endMin)}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{step.detail}</p>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">{plan.profile.note}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{plan.preset.description}</p>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Sound masking helps mild noise sensitivity; it does not treat a genuine
        noise phobia. If your animal panics, self-injures or will not settle, speak to your vet about
        a behaviour plan and, where appropriate, medication.
      </p>
    </main>
  );
}
