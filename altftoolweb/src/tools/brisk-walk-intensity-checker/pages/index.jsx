"use client";

import { useMemo, useState } from "react";
import { Activity, Check, Copy, RotateCcw } from "lucide-react";

import { LEVEL_NAMES, TALK_TEST_OPTIONS, assessBriskWalk } from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";
const zero = (value) => (Number.isFinite(value) ? NUM0.format(value) : DASH);

const DEFAULTS = {
  age: "40",
  cadence: "112",
  heartRate: "128",
  restingHeartRate: "65",
  talkTest: "can-talk",
  rpe: "13",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const LEVEL_STYLE = [
  "bg-[var(--muted)] text-[var(--muted-foreground)]",
  "bg-[var(--success-soft)] text-[var(--success)]",
  "bg-[var(--warning-soft)] text-[var(--warning)]",
];

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return 0;
  return Number(trimmed.replace(/,/g, ""));
};

export default function ToolHome() {
  const [age, setAge] = useState(DEFAULTS.age);
  const [cadence, setCadence] = useState(DEFAULTS.cadence);
  const [heartRate, setHeartRate] = useState(DEFAULTS.heartRate);
  const [restingHeartRate, setRestingHeartRate] = useState(DEFAULTS.restingHeartRate);
  const [talkTest, setTalkTest] = useState(DEFAULTS.talkTest);
  const [rpe, setRpe] = useState(DEFAULTS.rpe);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      assessBriskWalk({
        age: toNumber(age),
        cadence: toNumber(cadence),
        heartRate: toNumber(heartRate),
        restingHeartRate: toNumber(restingHeartRate),
        talkTest,
        rpe: toNumber(rpe),
      }),
    [age, cadence, heartRate, restingHeartRate, talkTest, rpe],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Brisk Walk Intensity Checker",
      `Verdict: ${result.overallLabel} intensity${result.isBrisk ? " — this counts as brisk" : " — not yet brisk"}`,
      ...result.signals.map((signal) => `${signal.name}: ${signal.reading} → ${LEVEL_NAMES[signal.level]}`),
      `Estimated max heart rate: ${zero(result.hrMax)} bpm (${result.zoneMethod})`,
      `Moderate zone: ${zero(result.zones.moderate[0])}-${zero(result.zones.moderate[1])} bpm`,
      `Vigorous zone: ${zero(result.zones.vigorous[0])}-${zero(result.zones.vigorous[1])} bpm`,
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
    setAge(DEFAULTS.age);
    setCadence(DEFAULTS.cadence);
    setHeartRate(DEFAULTS.heartRate);
    setRestingHeartRate(DEFAULTS.restingHeartRate);
    setTalkTest(DEFAULTS.talkTest);
    setRpe(DEFAULTS.rpe);
    setCopied(false);
  };

  const rows = [
    ["Readings used", ok ? `${zero(result.signalCount)} of 4` : DASH],
    ["Estimated max heart rate", ok ? `${zero(result.hrMax)} bpm` : DASH],
    ["Zone method", ok ? result.zoneMethod : DASH],
    [
      "Moderate heart-rate zone",
      ok ? `${zero(result.zones.moderate[0])}–${zero(result.zones.moderate[1])} bpm` : DASH,
    ],
    [
      "Vigorous heart-rate zone",
      ok ? `${zero(result.zones.vigorous[0])}–${zero(result.zones.vigorous[1])} bpm` : DASH,
    ],
    [
      "Cadence still needed",
      ok
        ? result.cadenceGap == null
          ? DASH
          : result.cadenceGap > 0
            ? `+${zero(result.cadenceGap)} steps/min`
            : "Threshold met"
        : DASH,
    ],
    [
      "Heart rate still needed",
      ok
        ? result.heartRateGap == null
          ? DASH
          : result.heartRateGap > 0
            ? `+${zero(result.heartRateGap)} bpm`
            : "Threshold met"
        : DASH,
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Activity className="h-4 w-4" aria-hidden="true" />
          Walking &amp; steps
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Brisk Walk Intensity Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Fill in whichever readings you have — cadence, heart rate, the talk test, perceived
          exertion — and see whether the walk actually reaches moderate intensity.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bw-age">
              Age (years)
            </label>
            <input
              id="bw-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="10"
              max="100"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bw-cadence">
              Cadence (steps/min, 0 to skip)
            </label>
            <input
              id="bw-cadence"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="250"
              step="1"
              value={cadence}
              onChange={(event) => setCadence(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bw-hr">
              Heart rate while walking (bpm, 0 to skip)
            </label>
            <input
              id="bw-hr"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="240"
              step="1"
              value={heartRate}
              onChange={(event) => setHeartRate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bw-rhr">
              Resting heart rate (bpm, optional)
            </label>
            <input
              id="bw-rhr"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="240"
              step="1"
              value={restingHeartRate}
              onChange={(event) => setRestingHeartRate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bw-talk">
              Talk test
            </label>
            <select
              id="bw-talk"
              className={`mt-2 ${INPUT_CLASS}`}
              value={talkTest}
              onChange={(event) => setTalkTest(event.target.value)}
            >
              {TALK_TEST_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bw-rpe">
              Borg RPE 6–20 (0 to skip)
            </label>
            <input
              id="bw-rpe"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="20"
              step="1"
              value={rpe}
              onChange={(event) => setRpe(event.target.value)}
            />
          </div>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5" aria-live="polite" aria-atomic="true">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Overall intensity
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? result.overallLabel : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? result.advice : "Give at least one reading above to get a verdict."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy brisk walk intensity result"
              className={GHOST_BTN}
              disabled={!ok}
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5" aria-live="polite" aria-atomic="true">
        <h2 className="text-base font-semibold">Reading by reading</h2>
        {ok ? (
          <ul className="mt-3 grid gap-3">
            {result.signals.map((signal) => (
              <li
                key={signal.key}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{signal.name}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${LEVEL_STYLE[signal.level]}`}
                  >
                    {LEVEL_NAMES[signal.level]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--foreground)]">{signal.reading}</p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">{signal.target}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{DASH}</p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not medical advice. Estimated maximum heart rate carries a standard
        deviation of roughly 10 bpm, so treat the zones as a guide. Stop and seek medical attention
        if you get chest pain, dizziness or unusual breathlessness while walking.
      </p>
    </main>
  );
}
