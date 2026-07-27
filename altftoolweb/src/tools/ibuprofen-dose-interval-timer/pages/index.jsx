"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Pill, RotateCcw, TriangleAlert } from "lucide-react";

import {
  CHILD_DOSE_MG_PER_KG,
  CHILD_MAX_MG_PER_KG_PER_DAY,
  IBUPROFEN_PROFILES,
  MIN_CHILD_AGE_MONTHS,
  childDoseForWeight,
  formatClockTime,
  formatGap,
  parseClockTime,
  planIbuprofenDoses,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  profileKey: "adultOtc",
  doseMg: "400",
  intervalHours: "6",
  lastDose: "08:00",
  mgTakenToday: "400",
  weightKg: "20",
};

const toNum = (raw) => {
  const text = String(raw ?? "").trim();
  if (text === "") return NaN;
  const value = Number(text.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [profileKey, setProfileKey] = useState(DEFAULTS.profileKey);
  const [doseMg, setDoseMg] = useState(DEFAULTS.doseMg);
  const [intervalHours, setIntervalHours] = useState(DEFAULTS.intervalHours);
  const [lastDose, setLastDose] = useState(DEFAULTS.lastDose);
  const [mgTakenToday, setMgTakenToday] = useState(DEFAULTS.mgTakenToday);
  const [weightKg, setWeightKg] = useState(DEFAULTS.weightKg);
  const [copied, setCopied] = useState(false);

  const isChild = profileKey === "child";

  const result = useMemo(() => {
    const minutes = parseClockTime(lastDose);
    if (minutes === null) {
      return { error: "Enter the time of the last dose in 24-hour HH:MM form." };
    }
    return planIbuprofenDoses({
      profileKey,
      doseMg: toNum(doseMg),
      intervalHours: toNum(intervalHours),
      lastDoseMinutes: minutes,
      mgTakenToday: toNum(mgTakenToday),
      weightKg: isChild ? toNum(weightKg) : undefined,
    });
  }, [profileKey, doseMg, intervalHours, lastDose, mgTakenToday, weightKg, isChild]);

  const hasError = Boolean(result.error);

  const applyProfile = (key) => {
    setProfileKey(key);
    const profile = IBUPROFEN_PROFILES[key];
    setIntervalHours(String(profile.defaultInterval));
    if (key === "child") {
      const suggested = childDoseForWeight(toNum(weightKg));
      if (suggested) setDoseMg(String(suggested));
    } else {
      setDoseMg(String(profile.defaultDose));
    }
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Ibuprofen dose interval",
      `Profile: ${result.profile.label}`,
      `Last dose: ${result.doseMg} mg at ${result.lastDoseLabel}`,
      `Earliest next dose (${result.minIntervalHours} h gap): ${result.earliestNextLabel}${result.earliestNextIsTomorrow ? " next day" : ""}`,
      `Planned next dose (${result.intervalHours} h gap): ${result.plannedNextLabel}${result.plannedNextIsTomorrow ? " next day" : ""}`,
      `24-hour ceiling: ${result.dailyMaxMg} mg`,
      `Taken so far: ${result.mgTakenToday} mg — ${result.mgRemaining} mg left (${result.dosesRemaining} more full dose(s))`,
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
    setProfileKey(DEFAULTS.profileKey);
    setDoseMg(DEFAULTS.doseMg);
    setIntervalHours(DEFAULTS.intervalHours);
    setLastDose(DEFAULTS.lastDose);
    setMgTakenToday(DEFAULTS.mgTakenToday);
    setWeightKg(DEFAULTS.weightKg);
    setCopied(false);
  };

  const suggestedChildDose = childDoseForWeight(toNum(weightKg));

  const rows = [
    [
      `Next dose at the chosen ${hasError ? "" : `${result.intervalHours} h`} gap`,
      hasError ? DASH : result.plannedNextLabel,
    ],
    ["24-hour ceiling", hasError ? DASH : `${NUM.format(result.dailyMaxMg)} mg`],
    ["Already taken", hasError ? DASH : `${NUM.format(result.mgTakenToday)} mg`],
    ["Headroom left", hasError ? DASH : `${NUM.format(result.mgRemaining)} mg`],
    [
      "Full doses still available",
      hasError ? DASH : `${result.dosesRemaining} of max ${result.maxDosesPerDay} per day`,
    ],
  ];

  if (isChild) {
    rows.push([
      "Dose per kilogram",
      hasError || result.mgPerKgPerDose === null
        ? DASH
        : `${NUM1.format(result.mgPerKgPerDose)} mg/kg (target ${CHILD_DOSE_MG_PER_KG.min}-${CHILD_DOSE_MG_PER_KG.max})`,
    ]);
    rows.push([
      "Daily ceiling per kilogram",
      hasError || result.ceilingMgPerKgPerDay === null
        ? DASH
        : `${NUM1.format(result.ceilingMgPerKgPerDay)} mg/kg (cap ${CHILD_MAX_MG_PER_KG_PER_DAY})`,
    ]);
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--primary)] uppercase">
          <Pill className="h-4 w-4" aria-hidden="true" />
          Medication timing
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Ibuprofen Dose Interval Timer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter when the last dose went in and how much has been taken. You get the earliest safe
          next dose, the milligrams still available under the 24-hour ceiling, and the rest of the
          day&apos;s schedule.
        </p>
      </header>

      <section className={CARD}>
        <fieldset>
          <legend className={LABEL}>Who is the dose for?</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {Object.values(IBUPROFEN_PROFILES).map((profile) => {
              const active = profile.key === profileKey;
              return (
                <button
                  key={profile.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => applyProfile(profile.key)}
                  className={`min-h-11 rounded-md border px-3 py-2 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none ${
                    active
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {profile.label}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            {IBUPROFEN_PROFILES[profileKey].source}
          </p>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {isChild ? (
            <div>
              <label className={LABEL} htmlFor="ibu-weight">
                Child&apos;s weight (kg)
              </label>
              <input
                id="ibu-weight"
                className={INPUT}
                type="number"
                inputMode="decimal"
                min="5"
                max="200"
                step="0.5"
                value={weightKg}
                onChange={(event) => setWeightKg(event.target.value)}
              />
              {suggestedChildDose ? (
                <button
                  type="button"
                  onClick={() => setDoseMg(String(suggestedChildDose))}
                  className="mt-2 min-h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
                >
                  Use {NUM.format(suggestedChildDose)} mg ({CHILD_DOSE_MG_PER_KG.max} mg/kg)
                </button>
              ) : null}
            </div>
          ) : null}

          <div>
            <label className={LABEL} htmlFor="ibu-dose">
              Single dose (mg)
            </label>
            <input
              id="ibu-dose"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="25"
              max="800"
              step="25"
              value={doseMg}
              onChange={(event) => setDoseMg(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="ibu-interval">
              Gap between doses (hours)
            </label>
            <input
              id="ibu-interval"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="4"
              max="12"
              step="1"
              value={intervalHours}
              onChange={(event) => setIntervalHours(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="ibu-last">
              Last dose taken at
            </label>
            <input
              id="ibu-last"
              className={INPUT}
              type="time"
              value={lastDose}
              onChange={(event) => setLastDose(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="ibu-taken">
              Total taken in the last 24 h (mg)
            </label>
            <input
              id="ibu-taken"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="25"
              value={mgTakenToday}
              onChange={(event) => setMgTakenToday(event.target.value)}
            />
          </div>
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

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
              Earliest safe next dose
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.earliestNextLabel}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a time."
                : `${formatGap(result.gapToEarliestMinutes)} after the ${result.lastDoseLabel} dose${
                    result.earliestNextIsTomorrow ? " — falls the next day" : ""
                  }`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the ibuprofen dose plan"
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
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
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

        {!hasError && result.warnings.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="flex gap-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {!hasError && result.schedule.length > 0 ? (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">Remaining doses in this 24-hour window</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide text-[var(--muted-foreground)] uppercase">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Dose
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Time
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Running total
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Headroom
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.map((row) => (
                  <tr key={row.index} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">#{row.index}</td>
                    <td className="py-2 pr-3">
                      {row.label}
                      {row.nextDay ? (
                        <span className="ml-1 text-xs text-[var(--muted-foreground)]">
                          (next day)
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-3 text-right">{NUM.format(row.cumulativeMg)} mg</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {NUM.format(row.headroomMg)} mg
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Times assume each dose lands exactly on the chosen gap starting from{" "}
            {formatClockTime(result.lastDoseMinutes)}.
          </p>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not medical advice. Ibuprofen is avoided in pregnancy from about week 20,
        in infants under {MIN_CHILD_AGE_MONTHS} months, and with a history of stomach ulcers, kidney
        disease or certain heart conditions. Follow the label on your own pack and ask a pharmacist
        or doctor before combining medicines — many cold and flu remedies already contain ibuprofen.
      </p>
    </main>
  );
}
