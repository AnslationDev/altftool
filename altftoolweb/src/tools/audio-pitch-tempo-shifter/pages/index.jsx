"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Music, RotateCcw } from "lucide-react";

import { NOTE_NAMES, planShift } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const decFmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const hzFmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const intFmt = new Intl.NumberFormat("en-IN");

const DEFAULTS = {
  semitones: 2,
  cents: 0,
  tempoPercent: 100,
  sampleRate: 44100,
  durationSeconds: 180,
  bpm: 120,
  sourceKey: "C",
};

export default function ToolHome() {
  const [semitones, setSemitones] = useState(DEFAULTS.semitones);
  const [cents, setCents] = useState(DEFAULTS.cents);
  const [tempoPercent, setTempoPercent] = useState(DEFAULTS.tempoPercent);
  const [sampleRate, setSampleRate] = useState(DEFAULTS.sampleRate);
  const [durationSeconds, setDurationSeconds] = useState(DEFAULTS.durationSeconds);
  const [bpm, setBpm] = useState(DEFAULTS.bpm);
  const [sourceKey, setSourceKey] = useState(DEFAULTS.sourceKey);
  const [audioUrl, setAudioUrl] = useState("");
  const [previewMode, setPreviewMode] = useState("tempo");
  const [copied, setCopied] = useState(false);
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  const result = useMemo(
    () => planShift({ semitones, cents, tempoPercent, sampleRate, durationSeconds, bpm, sourceKey }),
    [semitones, cents, tempoPercent, sampleRate, durationSeconds, bpm, sourceKey],
  );
  const failed = Boolean(result.error);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || failed) return;
    if (previewMode === "linked") {
      audio.preservesPitch = false;
      audio.playbackRate = Math.min(4, Math.max(0.25, result.pitchRatio));
    } else {
      audio.preservesPitch = true;
      audio.playbackRate = Math.min(4, Math.max(0.25, result.tempoFactor));
    }
  }, [previewMode, result, failed]);

  function handleFile(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    setAudioUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  }

  function handleMetadata(event) {
    const value = event.currentTarget.duration;
    if (Number.isFinite(value) && value > 0) setDurationSeconds(Math.round(value));
  }

  async function copyCommand() {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(result.ffmpegResample);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function reset() {
    setSemitones(DEFAULTS.semitones);
    setCents(DEFAULTS.cents);
    setTempoPercent(DEFAULTS.tempoPercent);
    setSampleRate(DEFAULTS.sampleRate);
    setDurationSeconds(DEFAULTS.durationSeconds);
    setBpm(DEFAULTS.bpm);
    setSourceKey(DEFAULTS.sourceKey);
    setPreviewMode("tempo");
    setCopied(false);
    setAudioUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return "";
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
          <Music className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          Audio Pitch &amp; Tempo Shifter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set a pitch shift in semitones and a tempo change in percent, and see exactly what
          happens: the frequency ratio, the new duration, the resample rate and the filter chain
          that performs it. Preview tempo changes here; the true independent shift is a one-line
          ffmpeg command.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="semitones">
            Pitch shift (semitones)
          </label>
          <input
            id="semitones"
            type="number"
            min={-24}
            max={24}
            step={1}
            className={`${INPUT_CLASS} mt-1`}
            value={semitones}
            onChange={(event) => setSemitones(Number(event.target.value))}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="cents">
            Fine tune (cents)
          </label>
          <input
            id="cents"
            type="number"
            min={-100}
            max={100}
            step={1}
            className={`${INPUT_CLASS} mt-1`}
            value={cents}
            onChange={(event) => setCents(Number(event.target.value))}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="tempo">
            Tempo (% of original)
          </label>
          <input
            id="tempo"
            type="number"
            min={10}
            max={400}
            step={1}
            className={`${INPUT_CLASS} mt-1`}
            value={tempoPercent}
            onChange={(event) => setTempoPercent(Number(event.target.value))}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="sample-rate">
            Sample rate (Hz)
          </label>
          <input
            id="sample-rate"
            type="number"
            min={8000}
            max={192000}
            step={100}
            className={`${INPUT_CLASS} mt-1`}
            value={sampleRate}
            onChange={(event) => setSampleRate(Number(event.target.value))}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="duration">
            Clip length (seconds)
          </label>
          <input
            id="duration"
            type="number"
            min={1}
            step={1}
            className={`${INPUT_CLASS} mt-1`}
            value={durationSeconds}
            onChange={(event) => setDurationSeconds(Number(event.target.value))}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="bpm">
            Tempo of the source (BPM)
          </label>
          <input
            id="bpm"
            type="number"
            min={20}
            max={400}
            step={1}
            className={`${INPUT_CLASS} mt-1`}
            value={bpm}
            onChange={(event) => setBpm(Number(event.target.value))}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="source-key">
            Source key
          </label>
          <select
            id="source-key"
            className={`${INPUT_CLASS} mt-1`}
            value={sourceKey}
            onChange={(event) => setSourceKey(event.target.value)}
          >
            {NOTE_NAMES.map((note) => (
              <option key={note} value={note}>
                {note}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="audio-file">
            Audio file to preview (optional)
          </label>
          <input
            id="audio-file"
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className={`${INPUT_CLASS} mt-1 py-2 file:mr-3 file:h-7 file:rounded file:border-0 file:bg-[var(--muted)] file:px-3 file:text-xs file:text-[var(--foreground)]`}
            onChange={handleFile}
          />
        </div>
      </section>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className={PRIMARY_BTN} onClick={copyCommand} disabled={failed} aria-label="Copy the ffmpeg command">
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? "Copied!" : "Copy ffmpeg command"}
        </button>
        <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset all shift settings">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      {failed ? (
        <div
          role="alert"
          className="mt-5 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </div>
      ) : null}

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">New length</p>
        <p className="mt-1 text-4xl font-bold tabular-nums sm:text-5xl">
          {failed ? DASH : result.newLabel}
        </p>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          {failed
            ? DASH
            : `${result.semitonesTotal >= 0 ? "+" : ""}${decFmt.format(result.semitonesTotal)} semitones at ${decFmt.format(result.tempoPercent)}% speed`}
        </p>

        <dl className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <Row label="Pitch ratio" value={failed ? DASH : `${decFmt.format(result.pitchRatio)}×`} />
          <Row label="Frequency change" value={failed ? DASH : `${result.pitchPercent >= 0 ? "+" : ""}${decFmt.format(result.pitchPercent)}%`} />
          <Row label="A4 (440 Hz) becomes" value={failed ? DASH : `${hzFmt.format(result.a4After)} Hz`} />
          <Row label="Key moves to" value={failed || !result.transposedKey ? DASH : result.transposedKey} />
          <Row label="Original length" value={failed ? DASH : result.originalLabel} />
          <Row label="Tempo becomes" value={failed || result.newBpm === null ? DASH : `${decFmt.format(result.newBpm)} BPM`} />
          <Row label="Resample to" value={failed ? DASH : `${intFmt.format(result.resampleRate)} Hz`} />
          <Row label="Speed correction" value={failed ? DASH : `${decFmt.format(result.speedCorrection)}×`} />
          <Row
            label="atempo filters needed"
            value={failed ? DASH : `${result.atempoValues.length} (${result.atempoValues.map((value) => decFmt.format(value)).join(" × ")})`}
          />
        </dl>

        {!failed && result.notes.length ? (
          <ul className="mt-4 grid gap-2">
            {result.notes.map((note) => (
              <li key={note} className="rounded-md bg-[var(--card)] px-3 py-2 text-sm text-[var(--muted-foreground)] ring-1 ring-[var(--border)]">
                {note}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Preview in the browser</h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          A browser can change speed while holding pitch, or change both together, but it cannot
          shift pitch alone — that needs the filter chain below.
        </p>
        <fieldset className="mt-3">
          <legend className="sr-only">Preview mode</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex min-h-11 items-center gap-2 text-sm font-semibold" htmlFor="mode-tempo">
              <input
                id="mode-tempo"
                type="radio"
                name="preview-mode"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={previewMode === "tempo"}
                onChange={() => setPreviewMode("tempo")}
              />
              Tempo only, pitch preserved
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm font-semibold" htmlFor="mode-linked">
              <input
                id="mode-linked"
                type="radio"
                name="preview-mode"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={previewMode === "linked"}
                onChange={() => setPreviewMode("linked")}
              />
              Pitch and speed linked (tape effect)
            </label>
          </div>
        </fieldset>
        {audioUrl ? (
          <audio
            ref={audioRef}
            src={audioUrl}
            controls
            onLoadedMetadata={handleMetadata}
            className="mt-4 w-full"
          >
            <track kind="captions" />
          </audio>
        ) : (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            Choose an audio file above to hear the change. Nothing is uploaded.
          </p>
        )}
      </section>

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Filter chains</h2>
        <div className="mt-3 overflow-x-auto">
          <pre className="min-w-full whitespace-pre rounded-md bg-[var(--background)] p-3 font-mono text-xs leading-5">
            {failed ? DASH : `${result.ffmpegResample}\n\n# formant-aware alternative\n${result.ffmpegRubberband}`}
          </pre>
        </div>
      </section>
    </main>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
      <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
      <dd className="text-right text-sm font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
