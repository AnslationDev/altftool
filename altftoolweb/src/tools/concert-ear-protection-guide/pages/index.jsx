"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Ear, RotateCcw } from "lucide-react";

import {
  MAX_LEVEL_DB,
  MIN_LEVEL_DB,
  NIOSH_HOURS,
  NIOSH_LEVEL_DB,
  PROTECTOR_TYPES,
  VENUE_LEVELS,
  computeProtection,
  formatHours,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const DEFAULTS = {
  levelDb: "105",
  method: "nrr",
  ratingDb: "33",
  protectorType: "formable",
  cMinusA: "3",
  durationMinutes: "180",
};

const METHODS = [
  { value: "nrr", label: "NRR (US label)" },
  { value: "snr", label: "SNR (EU label)" },
  { value: "uniform", label: "Flat musician filter" },
];

const RATING_LABEL = {
  nrr: "NRR on the packet (dB)",
  snr: "SNR on the packet (dB)",
  uniform: "Stated flat attenuation (dB)",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [levelDb, setLevelDb] = useState(DEFAULTS.levelDb);
  const [method, setMethod] = useState(DEFAULTS.method);
  const [ratingDb, setRatingDb] = useState(DEFAULTS.ratingDb);
  const [protectorType, setProtectorType] = useState(DEFAULTS.protectorType);
  const [cMinusA, setCMinusA] = useState(DEFAULTS.cMinusA);
  const [durationMinutes, setDurationMinutes] = useState(DEFAULTS.durationMinutes);
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    };
  }, []);

  const result = useMemo(
    () =>
      computeProtection({
        levelDb: toNumber(levelDb),
        method,
        ratingDb: toNumber(ratingDb),
        protectorType,
        cMinusA: toNumber(cMinusA),
        durationMinutes: toNumber(durationMinutes),
      }),
    [levelDb, method, ratingDb, protectorType, cMinusA, durationMinutes],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Concert Ear Protection Guide",
      `Venue level: ${NUM1.format(result.unprotectedLevelDb)} dB(A) for ${NUM0.format(result.durationMinutes)} minutes`,
      `Rating used: ${ratingDb} dB (${METHODS.find((m) => m.value === method)?.label})`,
      result.deratedRatingDb !== null
        ? `NIOSH derated rating: ${NUM1.format(result.deratedRatingDb)} dB`
        : "",
      `Protected level at the ear: ${NUM1.format(result.protectedLevelDb)} dB(A)`,
      `Real-world reduction: ${NUM1.format(result.reductionDb)} dB`,
      `Safe time unprotected: ${formatHours(result.permittedHoursUnprotected)}`,
      `Safe time with protection: ${formatHours(result.permittedHoursProtected)}`,
      `Daily noise dose without protection: ${NUM0.format(result.doseWithoutPercent)}%`,
      `Daily noise dose with protection: ${NUM1.format(result.doseWithPercent)}%`,
      result.verdict,
    ]
      .filter(Boolean)
      .join("\n");
  }, [ok, result, ratingDb, method]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
      copiedTimeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const handleMethodChange = (nextMethod) => {
    setMethod(nextMethod);
    // The C-minus-A input only renders for SNR mode, but its state persists
    // on the parent while unmounted. Reset it so stale/invalid text left
    // over from a previous SNR entry can't resurface if the user switches
    // back to SNR later.
    if (nextMethod !== "snr") {
      setCMinusA(DEFAULTS.cMinusA);
    }
  };

  const reset = () => {
    setLevelDb(DEFAULTS.levelDb);
    setMethod(DEFAULTS.method);
    setRatingDb(DEFAULTS.ratingDb);
    setProtectorType(DEFAULTS.protectorType);
    setCMinusA(DEFAULTS.cMinusA);
    setDurationMinutes(DEFAULTS.durationMinutes);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Ear className="h-4 w-4" aria-hidden="true" />
          Hearing protection
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Concert Ear Protection Guide</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          NRR, SNR and flat musician filters are rated in different ways. Enter the venue level and
          the number on the packet to see the level actually reaching your ear and how long that is
          safe against the NIOSH limit of {NIOSH_LEVEL_DB} dB(A) for {NIOSH_HOURS} hours.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cep-level">
              Venue level, dB(A)
            </label>
            <input
              id="cep-level"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={MIN_LEVEL_DB}
              max={MAX_LEVEL_DB}
              step="1"
              value={levelDb}
              onChange={(event) => setLevelDb(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cep-duration">
              Time at the venue (minutes)
            </label>
            <input
              id="cep-duration"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="1440"
              step="15"
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cep-method">
              Rating system on the packet
            </label>
            <select
              id="cep-method"
              className={`mt-2 ${INPUT_CLASS}`}
              value={method}
              onChange={(event) => handleMethodChange(event.target.value)}
            >
              {METHODS.map((entry) => (
                <option key={entry.value} value={entry.value}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cep-rating">
              {RATING_LABEL[method]}
            </label>
            <input
              id="cep-rating"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="40"
              step="1"
              value={ratingDb}
              onChange={(event) => setRatingDb(event.target.value)}
            />
          </div>
          {method === "nrr" ? (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="cep-type">
                Protector type (sets the NIOSH derating)
              </label>
              <select
                id="cep-type"
                className={`mt-2 ${INPUT_CLASS}`}
                value={protectorType}
                onChange={(event) => setProtectorType(event.target.value)}
              >
                {PROTECTOR_TYPES.map((entry) => (
                  <option key={entry.value} value={entry.value}>
                    {entry.label} — derate {Math.round(entry.derate * 100)}%
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          {method === "snr" ? (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="cep-ca">
                Assumed C minus A offset (dB)
              </label>
              <input
                id="cep-ca"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="15"
                step="1"
                value={cMinusA}
                onChange={(event) => setCMinusA(event.target.value)}
              />
              <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
                SNR is subtracted from the C-weighted level. Amplified music with heavy bass usually
                reads a few dB higher on C than on A — change this if you have measured both.
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {VENUE_LEVELS.map((venue) => (
            <button
              key={venue.level}
              type="button"
              onClick={() => setLevelDb(String(venue.level))}
              title={venue.label}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {venue.level} dB
            </button>
          ))}
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
        aria-live="polite"
        aria-atomic="true"
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Level reaching your ear
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${NUM1.format(result.protectedLevelDb)} dB(A)` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${NUM1.format(result.reductionDb)} dB of real-world reduction · ${result.verdict}`
                : "Fix the inputs above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy ear protection result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Label reduction (before derating)",
              ok && result.labelReductionDb !== null
                ? `${NUM1.format(result.labelReductionDb)} dB`
                : DASH,
            ],
            [
              "NIOSH derated rating",
              ok && result.deratedRatingDb !== null
                ? `${NUM1.format(result.deratedRatingDb)} dB (${Math.round((result.derateFactor || 0) * 100)}% derate)`
                : DASH,
            ],
            [
              "C-weighted venue level",
              ok && result.levelCDb !== null ? `${NUM1.format(result.levelCDb)} dB(C)` : DASH,
            ],
            [
              "Safe time with no protection",
              ok ? formatHours(result.permittedHoursUnprotected) : DASH,
            ],
            [
              "Safe time with this protection",
              ok ? formatHours(result.permittedHoursProtected) : DASH,
            ],
            [
              "Noise dose without protection",
              ok ? `${NUM0.format(result.doseWithoutPercent)}%` : DASH,
              ok && !result.safeWithout ? "text-[var(--danger)]" : "text-[var(--success)]",
            ],
            [
              "Noise dose with protection",
              ok ? `${NUM1.format(result.doseWithPercent)}%` : DASH,
              ok && !result.safeWithProtection ? "text-[var(--danger)]" : "text-[var(--success)]",
            ],
          ].map(([label, value, tone]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className={`text-right font-semibold ${tone || ""}`}>{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">How the three ratings differ</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Rating</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Where it appears</th>
                <th scope="col" className="py-2 font-semibold">How it is applied</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["NRR", "US packaging (EPA label, ANSI S3.19)", "Subtract 7 dB, then apply the NIOSH derating for the protector type"],
                ["SNR", "European packaging (EN ISO 4869-2)", "Subtract straight from the C-weighted level"],
                ["Flat filter", "Musician earplugs such as ER-style filters", "Subtract the stated attenuation; the point is even attenuation, not the largest number"],
              ].map(([rating, where, how]) => (
                <tr key={rating} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{rating}</td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{where}</td>
                  <td className="py-2">{how}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not medical advice. Laboratory ratings assume a perfect seal that almost
        nobody achieves at a gig, which is why the derated figure is the one to plan around. If
        hearing stays muffled or ringing lasts more than a day after an event, see an audiologist.
      </p>
    </main>
  );
}
