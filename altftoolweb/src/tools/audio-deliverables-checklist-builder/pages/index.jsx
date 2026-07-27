"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileAudio, RotateCcw } from "lucide-react";

import {
  DESTINATIONS,
  PROJECT_TYPES,
  buildDeliverables,
  deliverablesToText,
  loudnessCheck,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "inline-flex min-h-11 w-full items-center gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-sm";

const EXTRA_TOGGLES = [
  ["includeMaster", "Archive master WAV"],
  ["includeStems", "Stems"],
  ["includeTranscript", "Transcript"],
  ["includeCaptions", "Caption file (SRT/VTT)"],
  ["includeArtwork", "Cover artwork"],
];

const DEFAULTS = {
  clientName: "",
  projectType: "podcast",
  destinationIds: ["podcast", "client-master"],
  runtimeMinutes: "42",
  chapterCount: "1",
  altLengths: "0",
  stemCount: "4",
  channels: "2",
  includeMaster: true,
  includeStems: false,
  includeTranscript: true,
  includeCaptions: false,
  includeArtwork: true,
  measuredLufs: "-12",
  measuredTruePeak: "-0.5",
  checkDestination: "podcast",
};

const toNumber = (value) => (String(value).trim() === "" ? NaN : Number(value));

export default function ToolHome() {
  const [clientName, setClientName] = useState(DEFAULTS.clientName);
  const [projectType, setProjectType] = useState(DEFAULTS.projectType);
  const [destinationIds, setDestinationIds] = useState(DEFAULTS.destinationIds);
  const [runtimeMinutes, setRuntimeMinutes] = useState(DEFAULTS.runtimeMinutes);
  const [chapterCount, setChapterCount] = useState(DEFAULTS.chapterCount);
  const [altLengths, setAltLengths] = useState(DEFAULTS.altLengths);
  const [stemCount, setStemCount] = useState(DEFAULTS.stemCount);
  const [channels, setChannels] = useState(DEFAULTS.channels);
  const [flags, setFlags] = useState({
    includeMaster: DEFAULTS.includeMaster,
    includeStems: DEFAULTS.includeStems,
    includeTranscript: DEFAULTS.includeTranscript,
    includeCaptions: DEFAULTS.includeCaptions,
    includeArtwork: DEFAULTS.includeArtwork,
  });
  const [measuredLufs, setMeasuredLufs] = useState(DEFAULTS.measuredLufs);
  const [measuredTruePeak, setMeasuredTruePeak] = useState(DEFAULTS.measuredTruePeak);
  const [checkDestination, setCheckDestination] = useState(DEFAULTS.checkDestination);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      buildDeliverables({
        projectType,
        destinationIds,
        runtimeMinutes: toNumber(runtimeMinutes),
        chapterCount: toNumber(chapterCount),
        altLengths: toNumber(altLengths),
        stemCount: toNumber(stemCount),
        channels: toNumber(channels),
        ...flags,
      }),
    [projectType, destinationIds, runtimeMinutes, chapterCount, altLengths, stemCount, channels, flags],
  );

  const loudness = useMemo(
    () =>
      loudnessCheck({
        measuredLufs: toNumber(measuredLufs),
        measuredTruePeak: toNumber(measuredTruePeak),
        destinationId: checkDestination,
      }),
    [measuredLufs, measuredTruePeak, checkDestination],
  );

  const toggleDestination = (id) => {
    setDestinationIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const copyResult = async () => {
    if (plan.error) return;
    try {
      await navigator.clipboard.writeText(deliverablesToText({ items: plan.items, clientName }));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setClientName(DEFAULTS.clientName);
    setProjectType(DEFAULTS.projectType);
    setDestinationIds(DEFAULTS.destinationIds);
    setRuntimeMinutes(DEFAULTS.runtimeMinutes);
    setChapterCount(DEFAULTS.chapterCount);
    setAltLengths(DEFAULTS.altLengths);
    setStemCount(DEFAULTS.stemCount);
    setChannels(DEFAULTS.channels);
    setFlags({
      includeMaster: DEFAULTS.includeMaster,
      includeStems: DEFAULTS.includeStems,
      includeTranscript: DEFAULTS.includeTranscript,
      includeCaptions: DEFAULTS.includeCaptions,
      includeArtwork: DEFAULTS.includeArtwork,
    });
    setMeasuredLufs(DEFAULTS.measuredLufs);
    setMeasuredTruePeak(DEFAULTS.measuredTruePeak);
    setCheckDestination(DEFAULTS.checkDestination);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileAudio className="h-4 w-4" aria-hidden="true" />
          Audio publishing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Audio Deliverables Checklist Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick the destinations a job is going to and get the exact file list — format, sample rate,
          loudness target, file count and rough package size — before you start the export.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The job</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="adc-client">
              Client or project name (optional)
            </label>
            <input
              id="adc-client"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={clientName}
              onChange={(event) => setClientName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="adc-type">
              Project type
            </label>
            <select
              id="adc-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={projectType}
              onChange={(event) => setProjectType(event.target.value)}
            >
              {PROJECT_TYPES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="adc-runtime">
              Total runtime (minutes)
            </label>
            <input
              id="adc-runtime"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              step="1"
              value={runtimeMinutes}
              onChange={(event) => setRuntimeMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="adc-chapters">
              Chapters or parts
            </label>
            <input
              id="adc-chapters"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="500"
              step="1"
              value={chapterCount}
              onChange={(event) => setChapterCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="adc-channels">
              Channels
            </label>
            <select
              id="adc-channels"
              className={`mt-2 ${INPUT_CLASS}`}
              value={channels}
              onChange={(event) => setChannels(event.target.value)}
            >
              <option value="1">Mono</option>
              <option value="2">Stereo</option>
            </select>
          </div>
          {projectType === "commercial" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="adc-alts">
                Alternate cutdowns
              </label>
              <input
                id="adc-alts"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max="20"
                step="1"
                value={altLengths}
                onChange={(event) => setAltLengths(event.target.value)}
              />
            </div>
          ) : null}
          {flags.includeStems ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="adc-stems">
                Number of stems
              </label>
              <input
                id="adc-stems"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="1"
                max="64"
                step="1"
                value={stemCount}
                onChange={(event) => setStemCount(event.target.value)}
              />
            </div>
          ) : null}
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Destinations</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {DESTINATIONS.map((destination) => (
              <label key={destination.id} htmlFor={`adc-dest-${destination.id}`} className={CHECK_ROW}>
                <input
                  id={`adc-dest-${destination.id}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={destinationIds.includes(destination.id)}
                  onChange={() => toggleDestination(destination.id)}
                />
                {destination.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Also deliver</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {EXTRA_TOGGLES.map(([key, label]) => (
              <label key={key} htmlFor={`adc-${key}`} className={CHECK_ROW}>
                <input
                  id={`adc-${key}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={Boolean(flags[key])}
                  onChange={(event) =>
                    setFlags((prev) => ({ ...prev, [key]: event.target.checked }))
                  }
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {plan.error ? (
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
              Files to deliver
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {plan.error ? DASH : NUM.format(plan.fileCount)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {plan.error
                ? "Fix the job details to build the list."
                : `${plan.items.length} line items · about ${NUM1.format(plan.totalMb)} MB in total`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the deliverables checklist"
              className={GHOST_BTN}
              disabled={Boolean(plan.error)}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy checklist"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Line items", plan.error ? DASH : NUM.format(plan.items.length)],
            ["Individual files", plan.error ? DASH : NUM.format(plan.fileCount)],
            ["Estimated package size", plan.error ? DASH : `${NUM1.format(plan.totalMb)} MB`],
            ["Destinations selected", NUM.format(destinationIds.length)],
            ["Runtime covered", plan.error ? DASH : `${NUM1.format(plan.runtimeMinutes)} minutes`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!plan.error ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Delivery list</h2>
          <ul className="mt-3 space-y-2">
            {plan.items.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold">
                    {item.name} × {NUM.format(item.count)}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {NUM1.format(item.mb)} MB
                  </span>
                </div>
                <p className="mt-1 text-xs font-semibold text-[var(--primary)]">{item.format}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{item.note}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Loudness conformance</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="adc-lufs">
              Measured integrated loudness (LUFS)
            </label>
            <input
              id="adc-lufs"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              max="0"
              min="-70"
              step="0.1"
              value={measuredLufs}
              onChange={(event) => setMeasuredLufs(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="adc-tp">
              Measured true peak (dBTP)
            </label>
            <input
              id="adc-tp"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              max="6"
              min="-80"
              step="0.1"
              value={measuredTruePeak}
              onChange={(event) => setMeasuredTruePeak(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="adc-check-dest">
              Check against
            </label>
            <select
              id="adc-check-dest"
              className={`mt-2 ${INPUT_CLASS}`}
              value={checkDestination}
              onChange={(event) => setCheckDestination(event.target.value)}
            >
              {DESTINATIONS.map((destination) => (
                <option key={destination.id} value={destination.id}>
                  {destination.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loudness.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {loudness.error}
          </p>
        ) : loudness.noTarget ? (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">{loudness.message}</p>
        ) : (
          <>
            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Gain change needed
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)]">
              {`${loudness.gainChangeLu > 0 ? "+" : ""}${NUM1.format(loudness.gainChangeLu)} LU`}
            </p>
            <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
              {[
                ["Target", `${NUM1.format(loudness.targetLufs)} LUFS ±${NUM1.format(loudness.toleranceLu)} LU`],
                ["Already within tolerance", loudness.withinTolerance ? "Yes" : "No"],
                ["True peak after the change", `${NUM1.format(loudness.resultingTruePeak)} dBTP`],
                [
                  "True peak limit",
                  loudness.peakLimit === undefined ? "not specified" : `${NUM1.format(loudness.peakLimit)} dBTP`,
                ],
                [
                  "Limiting needed",
                  loudness.peakOk ? "None" : `${NUM1.format(loudness.limiterHeadroomNeeded)} dB`,
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            <p
              className={`mt-4 text-xs leading-5 ${loudness.peakOk ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
            >
              {loudness.peakOk
                ? "Applying that gain keeps the true peak inside the limit, so no extra limiting is required."
                : "That gain would push the true peak past the limit — use a true-peak limiter or lower the target gain."}
            </p>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Sizes are estimates from constant-bitrate and linear-PCM maths and ignore container overhead
        and metadata. Platform specifications change — check the current delivery document for each
        destination before you export a final master.
      </p>
    </main>
  );
}
