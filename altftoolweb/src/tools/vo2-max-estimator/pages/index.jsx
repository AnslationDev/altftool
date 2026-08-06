"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, HeartPulse, RotateCcw } from "lucide-react";

import {
  COOPER_NORMS,
  estimateVo2Max,
  FITNESS_LABELS,
  METRES_PER_MILE,
  ML_O2_PER_MET,
  predictedMaxHeartRate,
  QUEENS_COLLEGE,
  TEST_METHODS,
} from "../lib";

const DEFAULTS = {
  method: "cooper",
  age: "32",
  sex: "male",
  weightKg: "75",
  distanceMetres: "2400",
  timeMinutes: "12",
  heartRate: "145",
  recoveryHeartRate: "156",
  restingHeartRate: "60",
  useMeasuredMax: false,
  maxHeartRate: "190",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const NUM1 = new Intl.NumberFormat("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const one = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);
const two = (v) => (Number.isFinite(v) ? NUM2.format(v) : DASH);

const toNumber = (raw) => {
  const cleaned = String(raw).replace(/,/g, "").trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[var(--border)] py-2 last:border-0">
      <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
      <dd className="text-right text-sm font-semibold text-[var(--foreground)] tabular-nums">{value}</dd>
    </div>
  );
}

export default function ToolHome() {
  const [method, setMethod] = useState(DEFAULTS.method);
  const [age, setAge] = useState(DEFAULTS.age);
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [weightKg, setWeightKg] = useState(DEFAULTS.weightKg);
  const [distanceMetres, setDistanceMetres] = useState(DEFAULTS.distanceMetres);
  const [timeMinutes, setTimeMinutes] = useState(DEFAULTS.timeMinutes);
  const [heartRate, setHeartRate] = useState(DEFAULTS.heartRate);
  const [recoveryHeartRate, setRecoveryHeartRate] = useState(DEFAULTS.recoveryHeartRate);
  const [restingHeartRate, setRestingHeartRate] = useState(DEFAULTS.restingHeartRate);
  const [useMeasuredMax, setUseMeasuredMax] = useState(DEFAULTS.useMeasuredMax);
  const [maxHeartRate, setMaxHeartRate] = useState(DEFAULTS.maxHeartRate);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const result = useMemo(
    () =>
      estimateVo2Max({
        method,
        age: toNumber(age),
        sex,
        weightKg: toNumber(weightKg),
        distanceMetres: toNumber(distanceMetres),
        timeMinutes: toNumber(timeMinutes),
        heartRate: toNumber(heartRate),
        recoveryHeartRate: toNumber(recoveryHeartRate),
        restingHeartRate: toNumber(restingHeartRate),
        maxHeartRate: useMeasuredMax ? toNumber(maxHeartRate) : null,
      }),
    [method, age, sex, weightKg, distanceMetres, timeMinutes, heartRate, recoveryHeartRate, restingHeartRate, useMeasuredMax, maxHeartRate],
  );

  const hrMax = useMemo(() => predictedMaxHeartRate(toNumber(age)), [age]);
  const error = result.error || null;

  const normsTable = COOPER_NORMS[sex === "male" ? "male" : "female"];

  function reset() {
    setMethod(DEFAULTS.method);
    setAge(DEFAULTS.age);
    setSex(DEFAULTS.sex);
    setWeightKg(DEFAULTS.weightKg);
    setDistanceMetres(DEFAULTS.distanceMetres);
    setTimeMinutes(DEFAULTS.timeMinutes);
    setHeartRate(DEFAULTS.heartRate);
    setRecoveryHeartRate(DEFAULTS.recoveryHeartRate);
    setRestingHeartRate(DEFAULTS.restingHeartRate);
    setUseMeasuredMax(DEFAULTS.useMeasuredMax);
    setMaxHeartRate(DEFAULTS.maxHeartRate);
    setCopied(false);
  }

  async function copyResult() {
    if (error) return;
    const lines = [
      `VO2 max estimate — ${result.methodLabel}`,
      `${one(result.vo2max)} ml/kg/min (${two(result.mets)} METs)`,
      result.category
        ? `Rating: ${result.category} for ${sex}, age band ${result.bandLabel}`
        : `Rating: not available (${result.ratingUnavailable})`,
      result.absoluteLitresPerMin ? `Absolute: ${two(result.absoluteLitresPerMin)} L/min at ${weightKg} kg` : "",
      `Predicted HRmax (Tanaka): ${one(result.predictedHrMax)} bpm`,
    ].filter(Boolean);
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => {
        setCopied(false);
        copyTimerRef.current = null;
      }, 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <HeartPulse className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          VO2 Max Estimator
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Five published field tests, one score in ml/kg/min, rated against Cooper Institute norms.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="vo2-method">
              Test method
            </label>
            <select id="vo2-method" className={`mt-1 ${INPUT_CLASS}`} value={method} onChange={(e) => setMethod(e.target.value)}>
              {TEST_METHODS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="vo2-age">
                Age (years)
              </label>
              <input id="vo2-age" className={`mt-1 ${INPUT_CLASS}`} value={age} onChange={(e) => setAge(e.target.value)} inputMode="numeric" />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="vo2-sex">
                Sex (for the norm table and equations)
              </label>
              <select id="vo2-sex" className={`mt-1 ${INPUT_CLASS}`} value={sex} onChange={(e) => setSex(e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="vo2-weight">
                Body weight (kg)
              </label>
              <input id="vo2-weight" className={`mt-1 ${INPUT_CLASS}`} value={weightKg} onChange={(e) => setWeightKg(e.target.value)} inputMode="decimal" />
            </div>

            {method === "cooper" ? (
              <div>
                <label className={LABEL_CLASS} htmlFor="vo2-distance">
                  Distance in 12 minutes (m)
                </label>
                <input id="vo2-distance" className={`mt-1 ${INPUT_CLASS}`} value={distanceMetres} onChange={(e) => setDistanceMetres(e.target.value)} inputMode="numeric" />
              </div>
            ) : null}

            {method === "run15" || method === "rockport" ? (
              <div>
                <label className={LABEL_CLASS} htmlFor="vo2-time">
                  {method === "run15" ? "1.5-mile run time (minutes)" : "1-mile walk time (minutes)"}
                </label>
                <input id="vo2-time" className={`mt-1 ${INPUT_CLASS}`} value={timeMinutes} onChange={(e) => setTimeMinutes(e.target.value)} inputMode="decimal" />
              </div>
            ) : null}

            {method === "rockport" ? (
              <div>
                <label className={LABEL_CLASS} htmlFor="vo2-hr">
                  Heart rate at the finish (bpm)
                </label>
                <input id="vo2-hr" className={`mt-1 ${INPUT_CLASS}`} value={heartRate} onChange={(e) => setHeartRate(e.target.value)} inputMode="numeric" />
              </div>
            ) : null}

            {method === "queens" ? (
              <div>
                <label className={LABEL_CLASS} htmlFor="vo2-recovery">
                  Recovery heart rate (bpm)
                </label>
                <input id="vo2-recovery" className={`mt-1 ${INPUT_CLASS}`} value={recoveryHeartRate} onChange={(e) => setRecoveryHeartRate(e.target.value)} inputMode="numeric" />
              </div>
            ) : null}

            {method === "resting" ? (
              <div>
                <label className={LABEL_CLASS} htmlFor="vo2-resting">
                  Resting heart rate (bpm)
                </label>
                <input id="vo2-resting" className={`mt-1 ${INPUT_CLASS}`} value={restingHeartRate} onChange={(e) => setRestingHeartRate(e.target.value)} inputMode="numeric" />
              </div>
            ) : null}

            {method === "resting" && useMeasuredMax ? (
              <div>
                <label className={LABEL_CLASS} htmlFor="vo2-max-hr">
                  Measured maximum heart rate (bpm)
                </label>
                <input id="vo2-max-hr" className={`mt-1 ${INPUT_CLASS}`} value={maxHeartRate} onChange={(e) => setMaxHeartRate(e.target.value)} inputMode="numeric" />
              </div>
            ) : null}
          </div>

          {method === "resting" ? (
            <label className="flex min-h-11 items-center gap-3 text-sm text-[var(--foreground)]" htmlFor="vo2-use-measured">
              <input
                id="vo2-use-measured"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                checked={useMeasuredMax}
                onChange={(e) => setUseMeasuredMax(e.target.checked)}
              />
              Use my measured HRmax instead of the Tanaka prediction ({hrMax.error ? DASH : `${one(hrMax.hrMax)} bpm`})
            </label>
          ) : null}

          {method === "queens" ? (
            <p className="text-xs text-[var(--muted-foreground)]">
              Step for {QUEENS_COLLEGE.durationMinutes} minutes on a {QUEENS_COLLEGE.stepHeightCm} cm step at{" "}
              {sex === "male" ? QUEENS_COLLEGE.male.stepsPerMinute : QUEENS_COLLEGE.female.stepsPerMinute} steps per minute, then count your pulse for 15
              seconds starting 5 seconds after you stop, and multiply by four.
            </p>
          ) : null}

          {method === "cooper" ? (
            <p className="text-xs text-[var(--muted-foreground)]">
              One mile is {Math.round(METRES_PER_MILE)} m, so 2,400 m is just under 1.5 miles.
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button type="button" className={PRIMARY_BTN} onClick={copyResult} aria-label="Copy the VO2 max result to the clipboard">
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset all fields to their defaults">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </section>

        <section className="grid gap-4">
          <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]" aria-live="polite" role="status">
            {error ? (
              <p className="mb-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
                {error}
              </p>
            ) : null}
            <p className="text-sm text-[var(--muted-foreground)]">Estimated VO2 max</p>
            <p className="text-4xl font-bold tracking-tight text-[var(--foreground)] tabular-nums">
              {error ? DASH : `${one(result.vo2max)} ml/kg/min`}
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--success-text)]">
              {error ? DASH : result.category ?? "Not rated"}
            </p>
            {!error && !result.category && result.ratingUnavailable ? (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{result.ratingUnavailable}</p>
            ) : null}

            <dl className="mt-4">
              <Row label="Method" value={error ? DASH : result.methodLabel} />
              <Row label="METs (1 MET = 3.5 ml/kg/min)" value={error ? DASH : two(result.mets)} />
              <Row label="Absolute uptake" value={error || !result.absoluteLitresPerMin ? DASH : `${two(result.absoluteLitresPerMin)} L/min`} />
              <Row
                label="Norm band"
                value={error || !result.bandLabel ? DASH : `${sex === "male" ? "Men" : "Women"} ${result.bandLabel}`}
              />
              <Row
                label="Gap to Superior"
                value={
                  error || result.toSuperior == null
                    ? DASH
                    : result.toSuperior > 0
                      ? `${one(result.toSuperior)} ml/kg/min`
                      : "Already there"
                }
              />
              <Row label="Predicted HRmax (208 - 0.7 x age)" value={error ? DASH : `${one(result.predictedHrMax)} bpm`} />
            </dl>
          </div>

          <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              Cooper Institute norms — {sex === "male" ? "men" : "women"} (ml/kg/min)
            </h2>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[460px] text-sm">
                <thead className="text-left text-[var(--muted-foreground)]">
                  <tr>
                    <th scope="col" className="py-2 pr-3 font-medium">Age</th>
                    {FITNESS_LABELS.slice(1).map((label) => (
                      <th key={label} scope="col" className="py-2 pr-3 text-right font-medium">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {normsTable.map((row) => (
                    <tr key={row.minAge} className="border-t border-[var(--border)]">
                      <td className="py-2 pr-3 text-[var(--foreground)]">{row.maxAge >= 200 ? `${row.minAge}+` : `${row.minAge}-${row.maxAge}`}</td>
                      {row.cuts.map((cut) => (
                        <td key={cut} className="py-2 pr-3 text-right tabular-nums text-[var(--foreground)]">
                          {one(cut)}+
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Scores below the Poor column are rated Very poor. One MET is {ML_O2_PER_MET} ml/kg/min.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
