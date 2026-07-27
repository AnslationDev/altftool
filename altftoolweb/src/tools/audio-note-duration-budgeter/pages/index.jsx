"use client";

import { useMemo, useState } from "react";
import { AudioLines, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  BITRATE_PRESETS,
  DEFAULT_REVIEW_FACTOR,
  DEFAULT_TRANSCRIPTION_RATIO,
  SPEED_PRESETS,
  budgetAudioNotes,
  formatDuration,
  prepareRecordings,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const DASH = "—";
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const SMALL_LABEL = "block text-xs font-semibold text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_ROWS = [
  { id: 1, label: "Monday standup memo", durationText: "12:30" },
  { id: 2, label: "Client discovery call", durationText: "45:00" },
  { id: 3, label: "Idea dump on the drive home", durationText: "7:15" },
];

const DEFAULT_SETTINGS = {
  speed: "1.5",
  reviewFactor: String(DEFAULT_REVIEW_FACTOR),
  transcriptionRatio: String(DEFAULT_TRANSCRIPTION_RATIO),
  sessionMinutes: "25",
  dailyCapacity: "30",
  dailyInflow: "10",
  bitrate: "128",
};

export default function ToolHome() {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [copied, setCopied] = useState(false);

  const setSetting = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));

  const plan = useMemo(() => {
    const prepared = prepareRecordings(rows);
    if (prepared.error) return { error: prepared.error };
    return budgetAudioNotes({
      recordings: prepared.recordings,
      playbackSpeed: Number(settings.speed),
      reviewFactor: Number(settings.reviewFactor),
      transcriptionRatio: Number(settings.transcriptionRatio),
      sessionMinutes: Number(settings.sessionMinutes),
      dailyCapacityMinutes: Number(settings.dailyCapacity),
      dailyInflowMinutes: Number(settings.dailyInflow),
      bitrateKbps: Number(settings.bitrate),
    });
  }, [rows, settings]);

  const failed = Boolean(plan.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Audio Note Duration Budgeter",
      `Recordings: ${plan.count}`,
      `Raw audio: ${formatDuration(plan.rawSeconds)}`,
      `Listening at ${plan.playbackSpeed}x: ${formatDuration(plan.listenSeconds)}`,
      `Review time (factor ${plan.reviewFactor}): ${formatDuration(plan.reviewSeconds)}`,
      `Manual transcription: ${formatDuration(plan.transcriptionSeconds)}`,
      `Sessions needed: ${plan.sessionsNeeded}`,
      `Days at your daily capacity: ${plan.daysAtCapacity}`,
      `Days to clear including new recordings: ${plan.daysToClear === null ? "backlog is growing" : plan.daysToClear}`,
      `Estimated storage: ${num(plan.sizeMb)} MB`,
    ].join("\n");
  }, [plan, failed]);

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
    setRows(DEFAULT_ROWS);
    setSettings(DEFAULT_SETTINGS);
    setCopied(false);
  };

  const updateRow = (id, key, value) =>
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: value } : row)));

  const addRow = () =>
    setRows((prev) => {
      if (prev.length >= 200) return prev;
      const id = prev.reduce((max, row) => Math.max(max, row.id), 0) + 1;
      return [...prev, { id, label: `Recording ${id}`, durationText: "" }];
    });

  const removeRow = (id) => setRows((prev) => prev.filter((row) => row.id !== id));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <AudioLines className="h-4 w-4" aria-hidden="true" />
          Voice memo backlog
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Audio Note Duration Budgeter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          List your unreviewed recordings and see what they actually cost: listening time at your
          playback speed, real review time once pausing and note-taking are counted, and how many
          days it takes to clear the queue while new memos keep arriving.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Recordings to review</h2>
          <button type="button" onClick={addRow} className={GHOST_BTN} aria-label="Add a recording">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add recording
          </button>
        </div>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Durations accept M:SS, H:MM:SS, or a plain number of minutes.
        </p>
        <div className="mt-4 grid gap-4">
          {rows.map((row) => (
            <div key={row.id} className="grid gap-3 rounded-md border border-[var(--border)] p-3 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor={`and-label-${row.id}`}>
                  What it is
                </label>
                <input
                  id={`and-label-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  value={row.label}
                  onChange={(event) => updateRow(row.id, "label", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`and-dur-${row.id}`}>
                  Duration
                </label>
                <input
                  id={`and-dur-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  inputMode="numeric"
                  placeholder="12:30"
                  value={row.durationText}
                  onChange={(event) => updateRow(row.id, "durationText", event.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="button"
                  className={`${GHOST_BTN} w-full`}
                  aria-label={`Remove ${row.label || "recording"}`}
                  onClick={() => removeRow(row.id)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </div>
          ))}
          {rows.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">
              No recordings listed — add one to start budgeting.
            </p>
          ) : null}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">How you review</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="and-speed">
              Playback speed
            </label>
            <select
              id="and-speed"
              className={`mt-2 ${INPUT_CLASS}`}
              value={settings.speed}
              onChange={(event) => setSetting("speed", event.target.value)}
            >
              {SPEED_PRESETS.map((speed) => (
                <option key={speed} value={String(speed)}>
                  {speed}x
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="and-factor">
              Review factor (1 = pure playback)
            </label>
            <input
              id="and-factor"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="5"
              step="0.1"
              value={settings.reviewFactor}
              onChange={(event) => setSetting("reviewFactor", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="and-ratio">
              Transcription ratio (typing minutes per audio minute)
            </label>
            <input
              id="and-ratio"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="20"
              step="0.5"
              value={settings.transcriptionRatio}
              onChange={(event) => setSetting("transcriptionRatio", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="and-session">
              Session length (minutes)
            </label>
            <input
              id="and-session"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="600"
              step="5"
              value={settings.sessionMinutes}
              onChange={(event) => setSetting("sessionMinutes", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="and-capacity">
              Review minutes available per day
            </label>
            <input
              id="and-capacity"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="1440"
              step="5"
              value={settings.dailyCapacity}
              onChange={(event) => setSetting("dailyCapacity", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="and-inflow">
              New audio recorded per day (minutes)
            </label>
            <input
              id="and-inflow"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="1440"
              step="5"
              value={settings.dailyInflow}
              onChange={(event) => setSetting("dailyInflow", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="and-bitrate">
              Recording bitrate (kbps)
            </label>
            <select
              id="and-bitrate"
              className={`mt-2 ${INPUT_CLASS}`}
              value={settings.bitrate}
              onChange={(event) => setSetting("bitrate", event.target.value)}
            >
              {BITRATE_PRESETS.map((rate) => (
                <option key={rate} value={String(rate)}>
                  {rate} kbps
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {failed ? (
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
              Real review time
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : formatDuration(plan.reviewSeconds)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? DASH
                : `${plan.count} recordings · ${formatDuration(plan.rawSeconds)} of raw audio`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the audio review plan"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the budgeter" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Raw audio", failed ? DASH : formatDuration(plan.rawSeconds)],
            [
              "Listening time at speed",
              failed ? DASH : `${formatDuration(plan.listenSeconds)} (saves ${formatDuration(plan.timeSavedSeconds)})`,
            ],
            ["Manual transcription time", failed ? DASH : formatDuration(plan.transcriptionSeconds)],
            ["Average recording", failed ? DASH : formatDuration(plan.averageSeconds)],
            [
              "Longest recording",
              failed || !plan.longest
                ? DASH
                : `${plan.longest.label || "Untitled"} · ${formatDuration(plan.longest.seconds)}`,
            ],
            ["Review sessions needed", failed ? DASH : String(plan.sessionsNeeded)],
            ["Days at your daily capacity", failed ? DASH : String(plan.daysAtCapacity)],
            [
              "Days to clear with new audio arriving",
              failed ? DASH : plan.daysToClear === null ? "Never at this rate" : String(plan.daysToClear),
            ],
            ["Estimated storage", failed ? DASH : `${num(plan.sizeMb)} MB`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && plan.backlogGrowing ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-xs font-medium text-[var(--danger)]">
            You are recording faster than you can review. The backlog grows every day until you raise
            your daily capacity, record less, or raise the playback speed.
          </p>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The storage figure assumes a constant bitrate; variable-bitrate recordings will differ.
        Review factor and transcription ratio are your own estimates — measure one real session and
        put the true numbers in.
      </p>
    </main>
  );
}
