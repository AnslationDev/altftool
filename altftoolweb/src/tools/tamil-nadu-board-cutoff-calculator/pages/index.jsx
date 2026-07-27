"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, RotateCcw } from "lucide-react";

import {
  CUTOFF_MAX,
  CUTOFF_STREAMS,
  GOVT_SCHOOL_QUOTA_PERCENT,
  SUBJECT_SCALES,
  computeCutoff,
  requiredMainMark,
} from "../lib";

const NUM2 = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const num = (value) => (Number.isFinite(value) ? NUM2.format(value) : "—");
const pct = (value) => (Number.isFinite(value) ? `${NUM2.format(value)}%` : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  stream: "engineering",
  scale: 100,
  mainMark: "95",
  physics: "88",
  chemistry: "92",
  target: "190",
};

export default function ToolHome() {
  const [stream, setStream] = useState(DEFAULTS.stream);
  const [scale, setScale] = useState(DEFAULTS.scale);
  const [mainMark, setMainMark] = useState(DEFAULTS.mainMark);
  const [physics, setPhysics] = useState(DEFAULTS.physics);
  const [chemistry, setChemistry] = useState(DEFAULTS.chemistry);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [copied, setCopied] = useState(false);

  const streamRecord =
    CUTOFF_STREAMS.find((item) => item.value === stream) || CUTOFF_STREAMS[0];

  const result = useMemo(
    () => computeCutoff({ mainMark, physics, chemistry, scale, stream }),
    [mainMark, physics, chemistry, scale, stream],
  );

  const needed = useMemo(
    () => requiredMainMark({ targetCutoff: target, physics, chemistry, scale }),
    [target, physics, chemistry, scale],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      `Tamil Nadu HSC cutoff — ${result.streamLabel}`,
      `Cutoff: ${num(result.cutoff)} / ${CUTOFF_MAX} (${pct(result.percentage)})`,
      `${result.mainSubject}: ${num(result.mainContribution)} of the cutoff`,
      `Physics half weight: ${num(result.physicsContribution)}`,
      `Chemistry half weight: ${num(result.chemistryContribution)}`,
      `Formula: ${result.formula}`,
    ].join("\n");
  }, [ok, result]);

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
    setStream(DEFAULTS.stream);
    setScale(DEFAULTS.scale);
    setMainMark(DEFAULTS.mainMark);
    setPhysics(DEFAULTS.physics);
    setChemistry(DEFAULTS.chemistry);
    setTarget(DEFAULTS.target);
    setCopied(false);
  };

  const rows = [
    [`${result.mainSubject} (full weight)`, ok ? num(result.mainContribution) : "—"],
    ["Physics (half weight)", ok ? num(result.physicsContribution) : "—"],
    ["Chemistry (half weight)", ok ? num(result.chemistryContribution) : "—"],
    ["Physics + Chemistry together", ok ? num(result.supportContribution) : "—"],
    ["Cutoff as a percentage of 200", ok ? pct(result.percentage) : "—"],
    ["Average of the three subjects", ok ? pct(result.threeSubjectAverage) : "—"],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          Tamil Nadu HSC
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Tamil Nadu Board Cutoff Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tamil Nadu builds an admission cutoff out of 200 by giving the stream subject full
          weight and Physics and Chemistry half weight each. Enter your +2 marks and the cutoff
          appears below, along with the mark still needed to reach a target.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div role="group" aria-label="Cutoff stream" className="grid gap-2 sm:grid-cols-2">
          {CUTOFF_STREAMS.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={stream === item.value}
              onClick={() => setStream(item.value)}
              className={
                stream === item.value
                  ? `${PRIMARY_BTN} w-full`
                  : `${GHOST_BTN} w-full text-[var(--muted-foreground)]`
              }
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">{streamRecord.note}</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tn-scale">
              Maximum mark per subject on your marksheet
            </label>
            <select
              id="tn-scale"
              className={`mt-2 ${INPUT_CLASS}`}
              value={scale}
              onChange={(event) => setScale(Number(event.target.value))}
            >
              {SUBJECT_SCALES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="tn-main">
              {streamRecord.mainSubject} mark
            </label>
            <input
              id="tn-main"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max={scale}
              step="1"
              value={mainMark}
              onChange={(event) => setMainMark(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="tn-physics">
              Physics mark
            </label>
            <input
              id="tn-physics"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max={scale}
              step="1"
              value={physics}
              onChange={(event) => setPhysics(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="tn-chemistry">
              Chemistry mark
            </label>
            <input
              id="tn-chemistry"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max={scale}
              step="1"
              value={chemistry}
              onChange={(event) => setChemistry(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="tn-target">
              Cutoff you are aiming for (out of 200)
            </label>
            <input
              id="tn-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="200"
              step="0.5"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
          </div>
        </div>

        {stream === "medical" && (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
            If your marksheet splits Biology into Botany and Zoology, add the two together and
            enter the combined figure.
          </p>
        )}
      </section>

      {result.error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Cutoff mark
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${num(result.cutoff)} / ${CUTOFF_MAX}` : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? result.formula : "Fix the marks above to see a cutoff"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the cutoff result"
              className={`${GHOST_BTN} disabled:opacity-40`}
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
              aria-label="Reset every input"
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Mark needed to reach your target</h2>
        {needed.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {needed.error}
          </p>
        ) : (
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            {[
              [
                "Already secured by Physics and Chemistry",
                `${num(needed.alreadyHeld)} of ${CUTOFF_MAX}`,
              ],
              [
                `${streamRecord.mainSubject} mark required`,
                needed.alreadyReached
                  ? "Target already reached"
                  : `${num(needed.requiredRaw)} out of ${scale}`,
              ],
              [
                "Is that possible?",
                needed.achievable
                  ? "Yes, it is within the maximum mark"
                  : "No — it would need more than full marks",
              ],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">How the weighting works</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Subject
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Weight
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Maximum it adds
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--border)]">
                <td className="py-2 pr-3">{streamRecord.mainSubject}</td>
                <td className="py-2 pr-3">Full</td>
                <td className="py-2">100</td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <td className="py-2 pr-3">Physics</td>
                <td className="py-2 pr-3">Half</td>
                <td className="py-2">50</td>
              </tr>
              <tr>
                <td className="py-2 pr-3">Chemistry</td>
                <td className="py-2 pr-3">Half</td>
                <td className="py-2">50</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Students who studied classes 6 to 12 in a Tamil Nadu government school are additionally
          eligible for the {GOVT_SCHOOL_QUOTA_PERCENT}% horizontal reservation in professional
          courses, which is applied on top of the cutoff ranking.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Cutoff computation is arithmetic, but seat allotment depends on the
        rank list, community reservation and the choices you fill. Confirm your figure against the
        official TNEA or DoTE counselling notification before relying on it.
      </p>
    </main>
  );
}
