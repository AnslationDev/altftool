"use client";

import { useMemo, useState } from "react";
import { Check, Coffee, Copy, RotateCcw, X } from "lucide-react";

import {
  PLUG_OPTIONS,
  SEAT_OPTIONS,
  TOTAL_WEIGHT,
  formatRatingText,
  rateWorkSpot,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

// A cleared field is "no value yet", not a real 0 measurement -- treating it
// as NaN routes it through rateWorkSpot's generic "enter a number in every
// field" message instead of a field-specific range error that misleadingly
// implies the user typed a real out-of-range reading.
const toNumber = (value) => (value === "" ? NaN : Number(value));

const DEFAULTS = {
  name: "The café down the road",
  downloadMbps: "24",
  uploadMbps: "3",
  latencyMs: "40",
  noiseDba: "68",
  plugs: "some",
  tableDepthCm: "50",
  seatComfort: "3",
  dwellMinutes: "120",
  toilet: true,
  water: false,
  quietCorner: false,
};

const NOISE_HINTS = [
  ["30 dB", "Quiet library"],
  ["50 dB", "Quiet café, morning"],
  ["60 dB", "Conversation at the next table"],
  ["70 dB", "Busy lunchtime, music on"],
  ["80 dB", "Grinder running, full room"],
];

function Field({ id, label, value, onChange, min, max, step = "1", hint, unit }) {
  return (
    <div>
      <label className={LABEL_CLASS} htmlFor={id}>
        {label}
        {unit ? <span className="font-normal text-[var(--muted-foreground)]"> ({unit})</span> : null}
      </label>
      <input
        id={id}
        className={`mt-2 ${INPUT_CLASS}`}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint ? <p className="mt-1 text-xs text-[var(--muted-foreground)]">{hint}</p> : null}
    </div>
  );
}

export default function ToolHome() {
  const [name, setName] = useState(DEFAULTS.name);
  const [downloadMbps, setDownloadMbps] = useState(DEFAULTS.downloadMbps);
  const [uploadMbps, setUploadMbps] = useState(DEFAULTS.uploadMbps);
  const [latencyMs, setLatencyMs] = useState(DEFAULTS.latencyMs);
  const [noiseDba, setNoiseDba] = useState(DEFAULTS.noiseDba);
  const [plugs, setPlugs] = useState(DEFAULTS.plugs);
  const [tableDepthCm, setTableDepthCm] = useState(DEFAULTS.tableDepthCm);
  const [seatComfort, setSeatComfort] = useState(DEFAULTS.seatComfort);
  const [dwellMinutes, setDwellMinutes] = useState(DEFAULTS.dwellMinutes);
  const [toilet, setToilet] = useState(DEFAULTS.toilet);
  const [water, setWater] = useState(DEFAULTS.water);
  const [quietCorner, setQuietCorner] = useState(DEFAULTS.quietCorner);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      rateWorkSpot({
        downloadMbps: toNumber(downloadMbps),
        uploadMbps: toNumber(uploadMbps),
        latencyMs: toNumber(latencyMs),
        noiseDba: toNumber(noiseDba),
        plugs,
        tableDepthCm: toNumber(tableDepthCm),
        seatComfort: toNumber(seatComfort),
        dwellMinutes: toNumber(dwellMinutes),
        toilet,
        water,
        quietCorner,
      }),
    [downloadMbps, uploadMbps, latencyMs, noiseDba, plugs, tableDepthCm, seatComfort, dwellMinutes, toilet, water, quietCorner],
  );

  // Keep the last successfully computed rating visible while the user is
  // mid-edit (e.g. clearing then retyping the Noise field passes through
  // out-of-range intermediate values). Adjusting state during render (guarded
  // so it only fires when the cached value is stale) is the pattern React
  // recommends for this instead of an effect -- see "Adjusting state when a
  // prop changes" in the React docs.
  const [cachedResult, setCachedResult] = useState(() => (result.error ? null : result));
  if (!result.error && cachedResult !== result) {
    setCachedResult(result);
  }
  const displayResult = result.error ? cachedResult : result;

  const copyResult = async () => {
    const text = formatRatingText(result, name);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setName(DEFAULTS.name);
    setDownloadMbps(DEFAULTS.downloadMbps);
    setUploadMbps(DEFAULTS.uploadMbps);
    setLatencyMs(DEFAULTS.latencyMs);
    setNoiseDba(DEFAULTS.noiseDba);
    setPlugs(DEFAULTS.plugs);
    setTableDepthCm(DEFAULTS.tableDepthCm);
    setSeatComfort(DEFAULTS.seatComfort);
    setDwellMinutes(DEFAULTS.dwellMinutes);
    setToilet(DEFAULTS.toilet);
    setWater(DEFAULTS.water);
    setQuietCorner(DEFAULTS.quietCorner);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Coffee className="h-4 w-4" aria-hidden="true" />
          Work from anywhere
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Coffee Shop Work Spot Rater</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Nine measurements, weighted, against the thresholds that actually decide a working session — Zoom's
          bandwidth figures, the G.114 latency limit and the noise level at which a microphone starts sending
          the room instead of your voice.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="cws-name">
            Café name
          </label>
          <input
            id="cws-name"
            className={`mt-2 ${INPUT_CLASS}`}
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <h2 className="mt-5 text-base font-semibold">Connection</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field id="cws-down" label="Download" unit="Mbps" value={downloadMbps} onChange={setDownloadMbps} min="0" step="0.1" />
          <Field
            id="cws-up"
            label="Upload"
            unit="Mbps"
            value={uploadMbps}
            onChange={setUploadMbps}
            min="0"
            step="0.1"
            hint="1.2 for a 720p call, 3.8 for 1080p."
          />
          <Field
            id="cws-latency"
            label="Latency"
            unit="ms"
            value={latencyMs}
            onChange={setLatencyMs}
            min="0"
            step="1"
            hint="Conversation degrades past 150 ms (ITU-T G.114)."
          />
        </div>

        <h2 className="mt-5 text-base font-semibold">The room</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field
            id="cws-noise"
            label="Noise at your table"
            unit="dB(A)"
            value={noiseDba}
            onChange={setNoiseDba}
            min="20"
            max="120"
            step="1"
            hint="Any phone sound-level app is close enough for this."
          />
          <div>
            <label className={LABEL_CLASS} htmlFor="cws-plugs">
              Power sockets
            </label>
            <select
              id="cws-plugs"
              className={`mt-2 ${INPUT_CLASS}`}
              value={plugs}
              onChange={(event) => setPlugs(event.target.value)}
            >
              {PLUG_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <Field
            id="cws-table"
            label="Usable table depth"
            unit="cm"
            value={tableDepthCm}
            onChange={setTableDepthCm}
            min="0"
            max="200"
            step="1"
            hint="A laptop plus hands wants 45 cm."
          />
          <div>
            <label className={LABEL_CLASS} htmlFor="cws-seat">
              Seat
            </label>
            <select
              id="cws-seat"
              className={`mt-2 ${INPUT_CLASS}`}
              value={seatComfort}
              onChange={(event) => setSeatComfort(event.target.value)}
            >
              {SEAT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <Field
            id="cws-dwell"
            label="How long you can sit"
            unit="minutes"
            value={dwellMinutes}
            onChange={setDwellMinutes}
            min="0"
            max="1440"
            step="15"
          />
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {[
            ["cws-toilet", "Toilet available", toilet, setToilet],
            ["cws-water", "Free drinking water", water, setWater],
            ["cws-corner", "Corner or booth for calls", quietCorner, setQuietCorner],
          ].map(([id, label, value, setter]) => (
            <label
              key={id}
              htmlFor={id}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            >
              <input
                id={id}
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={value}
                onChange={() => setter((current) => !current)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[300px] text-left text-xs">
            <caption className="pb-2 text-left text-xs text-[var(--muted-foreground)]">
              Rough noise reference
            </caption>
            <tbody>
              {NOISE_HINTS.map(([level, description]) => (
                <tr key={level} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-1.5 pr-3 font-semibold">{level}</td>
                  <td className="py-1.5 text-[var(--muted-foreground)]">{description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Work spot rating
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {displayResult ? `${displayResult.score}/100` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {displayResult ? `${displayResult.band.label} — ${displayResult.band.note}` : "Fix the input above to rate this café."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the café rating"
              className={GHOST_BTN}
              disabled={Boolean(result.error)}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy rating"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {displayResult && (
          <div
            className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={`Rating ${displayResult.score} out of 100`}
          >
            <span className="block h-full bg-[var(--primary)]" style={{ width: `${displayResult.score}%` }} />
          </div>
        )}
      </section>

      {displayResult && (
        <section
          className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          aria-live="polite"
          aria-atomic="true"
        >
          <h2 className="text-base font-semibold">What you can actually do here</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {displayResult.verdicts.map((verdict) => (
              <li
                key={verdict.label}
                className={`rounded-md px-3 py-3 ${
                  verdict.passed ? "bg-[var(--muted)]" : "bg-[var(--danger-soft)]"
                }`}
              >
                <p className={`flex items-center gap-2 font-semibold ${verdict.passed ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                  {verdict.passed ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <X className="h-4 w-4" aria-hidden="true" />
                  )}
                  {verdict.label}
                </p>
                <p className="mt-1 leading-6 text-[var(--foreground)]">{verdict.reason}</p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">{verdict.advice}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {displayResult && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Score breakdown</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Factor</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Points</th>
                  <th scope="col" className="py-2 text-right font-semibold">Of</th>
                </tr>
              </thead>
              <tbody>
                {displayResult.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 text-right">{Math.round(row.points * 10) / 10}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">{row.weight}</td>
                  </tr>
                ))}
                <tr>
                  <td className="py-2 pr-3 font-semibold">Total</td>
                  <td className="py-2 pr-3 text-right font-semibold">{displayResult.score}</td>
                  <td className="py-2 text-right text-[var(--muted-foreground)]">{TOTAL_WEIGHT}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {displayResult.weakest.length > 0 && (
            <div className="mt-4 rounded-md bg-[var(--muted)] px-3 py-3 text-sm">
              <p className="font-semibold">Weakest factors</p>
              <ul className="mt-2 space-y-1 text-[var(--muted-foreground)]">
                {displayResult.weakest.map((row) => (
                  <li key={row.id}>
                    {row.label} — keeping {Math.round(row.subScore * 100)}% of its {row.weight} points.
                  </li>
                ))}
              </ul>
            </div>
          )}

          {displayResult.warnings.length > 0 && (
            <ul className="mt-4 space-y-2 text-xs leading-5 text-[var(--muted-foreground)]">
              {displayResult.warnings.map((warning) => (
                <li key={warning} className="rounded-md bg-[var(--muted)] px-3 py-2">
                  {warning}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A comparison aid built from your own readings. Phone sound-level apps are uncalibrated and speeds
        vary with how full the room is — measure at the time of day you would actually be working.
      </p>
    </main>
  );
}
