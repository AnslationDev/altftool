"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gauge, RotateCcw } from "lucide-react";

import { MAX_BAND, MIN_BAND, RAW_MAX, computeOverallBand, rawToBand } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 });
const BAND = new Intl.NumberFormat("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

/** All valid IELTS bands, 0.0 to 9.0 in half steps, for the selects. */
const BAND_OPTIONS = Array.from({ length: (MAX_BAND - MIN_BAND) * 2 + 1 }, (_, i) =>
  BAND.format(MIN_BAND + i * 0.5),
);

const DEFAULTS = {
  listeningMode: "raw",
  listeningRaw: "30",
  listeningBand: "7.0",
  readingMode: "raw",
  readingType: "reading-academic",
  readingRaw: "30",
  readingBand: "7.0",
  writing: "6.5",
  speaking: "7.0",
};

const DASH = "—";

export default function ToolHome() {
  const [listeningMode, setListeningMode] = useState(DEFAULTS.listeningMode);
  const [listeningRaw, setListeningRaw] = useState(DEFAULTS.listeningRaw);
  const [listeningBand, setListeningBand] = useState(DEFAULTS.listeningBand);
  const [readingMode, setReadingMode] = useState(DEFAULTS.readingMode);
  const [readingType, setReadingType] = useState(DEFAULTS.readingType);
  const [readingRaw, setReadingRaw] = useState(DEFAULTS.readingRaw);
  const [readingBand, setReadingBand] = useState(DEFAULTS.readingBand);
  const [writing, setWriting] = useState(DEFAULTS.writing);
  const [speaking, setSpeaking] = useState(DEFAULTS.speaking);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    let listeningValue;
    if (listeningMode === "raw") {
      const converted = rawToBand({
        skill: "listening",
        raw: listeningRaw.trim() === "" ? Number.NaN : Number(listeningRaw),
      });
      if (converted.error) return { error: `Listening: ${converted.error}` };
      listeningValue = converted.band;
    } else {
      listeningValue = Number(listeningBand);
    }

    let readingValue;
    if (readingMode === "raw") {
      const converted = rawToBand({
        skill: readingType,
        raw: readingRaw.trim() === "" ? Number.NaN : Number(readingRaw),
      });
      if (converted.error) return { error: `Reading: ${converted.error}` };
      readingValue = converted.band;
    } else {
      readingValue = Number(readingBand);
    }

    return computeOverallBand({
      listening: listeningValue,
      reading: readingValue,
      writing: Number(writing),
      speaking: Number(speaking),
    });
  }, [
    listeningMode,
    listeningRaw,
    listeningBand,
    readingMode,
    readingType,
    readingRaw,
    readingBand,
    writing,
    speaking,
  ]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "IELTS band score",
      `Listening: ${BAND.format(result.listening)}`,
      `Reading: ${BAND.format(result.reading)}`,
      `Writing: ${BAND.format(result.writing)}`,
      `Speaking: ${BAND.format(result.speaking)}`,
      `Mean of four skills: ${NUM.format(result.mean)}`,
      `Overall Band Score: ${BAND.format(result.overall)}`,
    ].join("\n");
  }, [hasError, result]);

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
    setListeningMode(DEFAULTS.listeningMode);
    setListeningRaw(DEFAULTS.listeningRaw);
    setListeningBand(DEFAULTS.listeningBand);
    setReadingMode(DEFAULTS.readingMode);
    setReadingType(DEFAULTS.readingType);
    setReadingRaw(DEFAULTS.readingRaw);
    setReadingBand(DEFAULTS.readingBand);
    setWriting(DEFAULTS.writing);
    setSpeaking(DEFAULTS.speaking);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Listening band", DASH],
        ["Reading band", DASH],
        ["Writing band", DASH],
        ["Speaking band", DASH],
        ["Mean of four skills", DASH],
      ]
    : [
        ["Listening band", BAND.format(result.listening)],
        ["Reading band", BAND.format(result.reading)],
        ["Writing band", BAND.format(result.writing)],
        ["Speaking band", BAND.format(result.speaking)],
        ["Mean of four skills", NUM.format(result.mean)],
        [
          "Rounding applied",
          result.roundedUp ? "Rounded up" : result.roundedDown ? "Rounded down" : "Exact — no rounding",
        ],
      ];

  const bandSelect = (id, label, value, setter) => (
    <div>
      <label className={LABEL_CLASS} htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className={`mt-2 ${INPUT_CLASS}`}
        value={value}
        onChange={(event) => setter(event.target.value)}
      >
        {BAND_OPTIONS.map((band) => (
          <option key={band} value={band}>
            {band}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gauge className="h-4 w-4" aria-hidden="true" />
          English Proficiency
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          IELTS Band Score Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert Listening and Reading raw scores out of 40 into bands and average all four skills
          into the Overall Band Score with the official IELTS rounding rule — .25 rounds up to the
          next half band, .75 to the next whole band.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ielts-listening-mode">
              Listening input
            </label>
            <select
              id="ielts-listening-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={listeningMode}
              onChange={(event) => setListeningMode(event.target.value)}
            >
              <option value="raw">Raw score out of {RAW_MAX}</option>
              <option value="band">Band score</option>
            </select>
          </div>
          {listeningMode === "raw" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="ielts-listening-raw">
                Listening raw score (0–{RAW_MAX})
              </label>
              <input
                id="ielts-listening-raw"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max={RAW_MAX}
                step="1"
                value={listeningRaw}
                onChange={(event) => setListeningRaw(event.target.value)}
              />
            </div>
          ) : (
            bandSelect("ielts-listening-band", "Listening band", listeningBand, setListeningBand)
          )}

          <div>
            <label className={LABEL_CLASS} htmlFor="ielts-reading-mode">
              Reading input
            </label>
            <select
              id="ielts-reading-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={readingMode}
              onChange={(event) => setReadingMode(event.target.value)}
            >
              <option value="raw">Raw score out of {RAW_MAX}</option>
              <option value="band">Band score</option>
            </select>
          </div>
          {readingMode === "raw" ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="ielts-reading-type">
                  Reading module
                </label>
                <select
                  id="ielts-reading-type"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={readingType}
                  onChange={(event) => setReadingType(event.target.value)}
                >
                  <option value="reading-academic">Academic</option>
                  <option value="reading-general">General Training</option>
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="ielts-reading-raw">
                  Reading raw score (0–{RAW_MAX})
                </label>
                <input
                  id="ielts-reading-raw"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max={RAW_MAX}
                  step="1"
                  value={readingRaw}
                  onChange={(event) => setReadingRaw(event.target.value)}
                />
              </div>
            </>
          ) : (
            bandSelect("ielts-reading-band", "Reading band", readingBand, setReadingBand)
          )}

          {bandSelect("ielts-writing", "Writing band", writing, setWriting)}
          {bandSelect("ielts-speaking", "Speaking band", speaking, setSpeaking)}
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Overall Band Score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : BAND.format(result.overall)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `Mean of ${NUM.format(result.mean)} across the four skills, rounded to the nearest half band.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the IELTS band result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Raw-to-band conversions are the indicative tables published by IELTS; actual test versions
        are equated and can differ by a question or two. Official bands come only from your Test
        Report Form.
      </p>
    </main>
  );
}
