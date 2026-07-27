"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Brain, Check, Copy, Play, RotateCcw, Square } from "lucide-react";

import {
  FIGURES,
  MIN_EPOCH_MS,
  analyzeReversals,
  buildHistogram,
} from "../lib";

/** A demonstration trial so the statistics panel is populated at first paint.
 * Its eight durations average 2.5 s with a coefficient of variation of 0.45,
 * which lands inside every published band the tool checks against. */
const SAMPLE_TRIAL = {
  switchTimesMs: [1400, 4000, 7800, 8900, 11100, 15500, 17400, 20000],
  totalMs: 21300,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const secs = (ms) => (Number.isFinite(ms) ? `${NUM.format(ms / 1000)} s` : DASH);
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value * 100)}%` : DASH);

function NeckerCube({ highlight }) {
  const front = highlight === "second" ? 1.5 : 3.5;
  const back = highlight === "second" ? 3.5 : 1.5;
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full text-[var(--foreground)]" role="img" aria-label="Necker cube">
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <rect x="30" y="60" width="100" height="100" strokeWidth={front} />
        <rect x="70" y="30" width="100" height="100" strokeWidth={back} />
        <line x1="30" y1="60" x2="70" y2="30" strokeWidth="2" />
        <line x1="130" y1="60" x2="170" y2="30" strokeWidth="2" />
        <line x1="30" y1="160" x2="70" y2="130" strokeWidth="2" />
        <line x1="130" y1="160" x2="170" y2="130" strokeWidth="2" />
      </g>
    </svg>
  );
}

function SchroderStairs({ highlight }) {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full text-[var(--foreground)]" role="img" aria-label="Schröder stairs">
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
        <path d="M20 150 L20 110 L60 110 L60 80 L100 80 L100 50 L140 50 L140 20 L180 20 L180 60 L140 60 L140 90 L100 90 L100 120 L60 120 L60 150 Z" />
        <line x1="60" y1="110" x2="60" y2="120" strokeWidth={highlight === "second" ? 5 : 2} />
        <line x1="100" y1="80" x2="100" y2="90" strokeWidth={highlight === "second" ? 5 : 2} />
        <line x1="140" y1="50" x2="140" y2="60" strokeWidth={highlight === "second" ? 5 : 2} />
      </g>
    </svg>
  );
}

function RubinVase({ highlight }) {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label="Rubin's vase">
      <rect x="0" y="0" width="200" height="200" className="fill-[var(--muted)]" />
      <path
        d="M70 10 C70 40 55 45 55 62 C55 78 78 82 78 100 C78 118 58 122 62 146 C64 166 72 176 72 190 L128 190 C128 176 136 166 138 146 C142 122 122 118 122 100 C122 82 145 78 145 62 C145 45 130 40 130 10 Z"
        className="fill-[var(--foreground)]"
        stroke="currentColor"
        strokeWidth={highlight === "second" ? 4 : 0}
      />
    </svg>
  );
}

const FIGURE_COMPONENTS = {
  "necker-cube": NeckerCube,
  "schroder-stairs": SchroderStairs,
  "rubin-vase": RubinVase,
};

export default function ToolHome() {
  const [figureId, setFigureId] = useState(FIGURES[0].id);
  const [highlight, setHighlight] = useState("none");
  const [mode, setMode] = useState("sample");
  const [running, setRunning] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [nowMs, setNowMs] = useState(0);
  const [switchTimes, setSwitchTimes] = useState([]);
  const [copied, setCopied] = useState(false);

  const figure = useMemo(
    () => FIGURES.find((item) => item.id === figureId) || FIGURES[0],
    [figureId],
  );
  const FigureSvg = FIGURE_COMPONENTS[figure.id] || NeckerCube;

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setNowMs(performance.now()), 100);
    return () => clearInterval(id);
  }, [running]);

  const elapsedMs = running && startedAt !== null ? Math.max(0, nowMs - startedAt) : 0;

  const trial = useMemo(() => {
    if (mode === "sample") return SAMPLE_TRIAL;
    return { switchTimesMs: switchTimes, totalMs: Math.max(1, elapsedMs) };
  }, [mode, switchTimes, elapsedMs]);

  const result = useMemo(() => analyzeReversals(trial), [trial]);
  const hasError = Boolean(result.error);

  const histogram = useMemo(
    () => (hasError ? [] : buildHistogram(result.epochs.map((epoch) => epoch.durationMs), 6)),
    [hasError, result],
  );
  const histogramPeak = histogram.reduce((max, bin) => Math.max(max, bin.count), 0);

  const start = useCallback(() => {
    const now = performance.now();
    setMode("live");
    setStartedAt(now);
    setNowMs(now);
    setSwitchTimes([]);
    setRunning(true);
    setCopied(false);
  }, []);

  const stop = useCallback(() => {
    setRunning(false);
    setNowMs(performance.now());
  }, []);

  const recordSwitch = useCallback(() => {
    if (!running || startedAt === null) return;
    const at = performance.now() - startedAt;
    setNowMs(performance.now());
    setSwitchTimes((previous) => [...previous, at]);
  }, [running, startedAt]);

  useEffect(() => {
    if (!running) return undefined;
    const onKey = (event) => {
      if (event.code !== "Space") return;
      event.preventDefault();
      recordSwitch();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, recordSwitch]);

  const reset = () => {
    setFigureId(FIGURES[0].id);
    setHighlight("none");
    setMode("sample");
    setRunning(false);
    setStartedAt(null);
    setSwitchTimes([]);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Ambiguous figure: ${figure.name} (${figure.discovered})`,
      `Percepts: ${figure.firstPercept} vs ${figure.secondPercept}`,
      `Trial length: ${secs(result.totalMs)} with ${result.completed} completed percepts`,
      `Mean dominance duration: ${secs(result.meanMs)} (median ${secs(result.medianMs)})`,
      `Range: ${secs(result.minMs)} to ${secs(result.maxMs)}, SD ${secs(result.sdMs)}`,
      `Coefficient of variation: ${num(result.cv)}`,
      result.gammaShape !== null
        ? `Gamma shape (mean²/variance): ${num(result.gammaShape)}`
        : "Gamma shape: not estimable (all durations identical)",
      `Alternation rate: ${num(result.alternationsPerMinute)} per minute`,
      result.dominanceRatio !== null
        ? `Percept 1 held ${pct(result.dominanceRatio)} of the measured time`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [figure, hasError, result]);

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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Brain className="h-4 w-4" aria-hidden="true" />
          Bistable perception
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Ambiguous Figure Viewer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Stare at a classic ambiguous figure and tap every time your perception flips. The tool
          turns your taps into the same dominance-duration statistics psychophysics labs use —
          mean, coefficient of variation and the gamma shape.
        </p>
      </header>

      <section className={CARD}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="figure-id">
              Figure
            </label>
            <select
              id="figure-id"
              className={`mt-2 ${INPUT_CLASS}`}
              value={figureId}
              onChange={(event) => setFigureId(event.target.value)}
            >
              {FIGURES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="highlight">
              Nudge an interpretation
            </label>
            <select
              id="highlight"
              className={`mt-2 ${INPUT_CLASS}`}
              value={highlight}
              onChange={(event) => setHighlight(event.target.value)}
            >
              <option value="none">No hint — let it flip on its own</option>
              <option value="first">Hint: {figure.firstPercept}</option>
              <option value="second">Hint: {figure.secondPercept}</option>
            </select>
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-[minmax(0,240px)_1fr]">
          <div className="mx-auto aspect-square w-full max-w-[240px] overflow-hidden rounded-lg ring-1 ring-[var(--border)]">
            <FigureSvg highlight={highlight} />
          </div>
          <div>
            <p className="text-sm leading-6 text-[var(--muted-foreground)]">{figure.note}</p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              First described by {figure.discovered}.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {running ? (
                <button type="button" onClick={stop} className={GHOST_BTN} aria-label="Stop the trial">
                  <Square className="h-4 w-4" aria-hidden="true" />
                  Stop
                </button>
              ) : (
                <button type="button" onClick={start} className={GHOST_BTN} aria-label="Start a new trial">
                  <Play className="h-4 w-4" aria-hidden="true" />
                  Start trial
                </button>
              )}
              <button
                type="button"
                onClick={recordSwitch}
                disabled={!running}
                className={PRIMARY_BTN}
                aria-label="Record that the interpretation flipped"
              >
                It flipped ({switchTimes.length})
              </button>
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {running
                ? `Recording — ${secs(elapsedMs)} elapsed. Press the space bar or tap the button on each flip.`
                : mode === "sample"
                  ? "Showing a sample trial. Press Start, then tap on every flip you see."
                  : `Trial stopped after ${secs(trial.totalMs)}.`}
            </p>
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Mean dominance duration
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : secs(result.meanMs)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Record at least two completed percepts."
                : `${result.completed} completed percepts over ${secs(result.totalMs)}${mode === "sample" ? " (sample trial)" : ""}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the reversal statistics to clipboard"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the viewer" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Median duration", hasError ? DASH : secs(result.medianMs)],
            [
              "Shortest / longest",
              hasError ? DASH : `${secs(result.minMs)} / ${secs(result.maxMs)}`,
            ],
            ["Standard deviation", hasError ? DASH : secs(result.sdMs)],
            ["Coefficient of variation", hasError ? DASH : num(result.cv)],
            [
              "Gamma shape (mean² / variance)",
              hasError || result.gammaShape === null ? DASH : num(result.gammaShape),
            ],
            ["Alternations per minute", hasError ? DASH : num(result.alternationsPerMinute)],
            [
              `Time held by "${figure.firstPercept}"`,
              hasError || result.dominanceRatio === null ? DASH : pct(result.dominanceRatio),
            ],
            [
              "Unfinished percept at the end",
              hasError ? DASH : secs(result.censoredMs),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">How your trial compares</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {result.interpretation.map((item) => (
              <li key={item.id}>
                <p className="font-semibold">
                  {item.label}: <span className="text-[var(--primary)]">{item.verdict}</span>
                </p>
                <p className="mt-0.5 leading-6 text-[var(--muted-foreground)]">{item.detail}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && histogram.length > 0 && (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">Distribution of dominance durations</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Bistable durations are right-skewed, not bell-shaped — a long tail of rare, long holds.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[300px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Duration band
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Count
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Share
                  </th>
                </tr>
              </thead>
              <tbody>
                {histogram.map((bin) => (
                  <tr key={bin.fromMs} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {secs(bin.fromMs)} – {secs(bin.toMs)}
                    </td>
                    <td className="py-2 pr-3 font-semibold">{bin.count}</td>
                    <td className="py-2">
                      <span
                        className="block h-2 rounded-full bg-[var(--primary)]"
                        style={{
                          width: histogramPeak > 0 ? `${(bin.count / histogramPeak) * 100}%` : "0%",
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Taps closer together than {MIN_EPOCH_MS} ms are rejected, because perception cannot reverse
        that fast. This is a demonstration of a classic psychophysics measurement, not a clinical or
        diagnostic test.
      </p>
    </main>
  );
}
