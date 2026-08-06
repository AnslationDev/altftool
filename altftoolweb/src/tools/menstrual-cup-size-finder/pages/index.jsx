"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Droplets, RotateCcw } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

import {
  CERVIX_BANDS,
  KNUCKLE_OPTIONS,
  PELVIC_FLOOR_OPTIONS,
  SIZE_AGE_THRESHOLD,
  findCupSize,
} from "../lib";

const DASH = "—";

const DEFAULTS = {
  age: "26",
  vaginalBirth: false,
  cervixMm: "50",
  pelvicFloor: "average",
  heavyFlow: false,
  hasIud: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium text-[var(--foreground)]";

const toNumber = (raw) => {
  const text = String(raw).trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [age, setAge] = useState(DEFAULTS.age);
  const [vaginalBirth, setVaginalBirth] = useState(DEFAULTS.vaginalBirth);
  const [cervixMm, setCervixMm] = useState(DEFAULTS.cervixMm);
  const [pelvicFloor, setPelvicFloor] = useState(DEFAULTS.pelvicFloor);
  const [heavyFlow, setHeavyFlow] = useState(DEFAULTS.heavyFlow);
  const [hasIud, setHasIud] = useState(DEFAULTS.hasIud);
  const {
    copy: copyToClipboard,
    isCopied,
    announcement,
    reset: resetCopyState,
  } = useCopyToClipboard({ resetMs: 1500 });

  const result = useMemo(
    () =>
      findCupSize({
        age: toNumber(age),
        vaginalBirth,
        cervixMm: toNumber(cervixMm),
        pelvicFloor,
        heavyFlow,
        hasIud,
      }),
    [age, vaginalBirth, cervixMm, pelvicFloor, heavyFlow, hasIud],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Menstrual Cup Size Finder",
      `Suggested size: ${result.sizeLabel}`,
      result.sizeReason,
      `Cervix height entered: ${result.cervixMm} mm — ${result.bandLabel}`,
      `Length: ${result.lengthAdvice}`,
      `Firmness: ${result.firmness} — ${result.firmnessReason}`,
      `Typical capacity for this size: ${result.capacityMinMl}-${result.capacityMaxMl} mL, empty at least every ${result.maxWearHours} hours`,
      ...result.notes,
    ].join("\n");
  }, [ok, result]);

  const copyResult = async () => {
    if (!summary) return;
    await copyToClipboard("result", summary, { label: "cup sizing guidance" });
  };

  const reset = () => {
    if (!window.confirm("Reset all inputs, including any measured cervix height, back to the defaults?")) {
      return;
    }
    setAge(DEFAULTS.age);
    setVaginalBirth(DEFAULTS.vaginalBirth);
    setCervixMm(DEFAULTS.cervixMm);
    setPelvicFloor(DEFAULTS.pelvicFloor);
    setHeavyFlow(DEFAULTS.heavyFlow);
    setHasIud(DEFAULTS.hasIud);
    resetCopyState();
  };

  const rows = [
    ["Why this size", ok ? result.sizeReason : DASH],
    ["Cervix height band", ok ? `${result.bandLabel} (${result.cervixMm} mm)` : DASH],
    ["Length to look for", ok ? result.lengthAdvice : DASH],
    ["Longest cup that should still fit", ok ? `about ${result.maxCupLengthMm} mm` : DASH],
    ["Firmness", ok ? `${result.firmness} — ${result.firmnessReason}` : DASH],
    [
      "Typical capacity for this size",
      ok ? `${result.capacityMinMl}-${result.capacityMaxMl} mL` : DASH,
    ],
    ["Empty at least every", ok ? `${result.maxWearHours} hours` : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Droplets className="h-4 w-4" aria-hidden="true" />
          Cycle tracking
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Menstrual Cup Size Finder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Diameter comes from age and birth history, length comes from how high your cervix sits, and
          firmness comes from your pelvic floor. Measure your cervix with a clean finger during your
          period — it sits lower then than at other points in the cycle.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cup-age">
              Your age
            </label>
            <input
              id="cup-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="9"
              max="65"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cup-cervix">
              Cervix height (mm)
            </label>
            <input
              id="cup-cervix"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="20"
              max="100"
              step="1"
              value={cervixMm}
              onChange={(event) => setCervixMm(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cup-knuckle">
              Not measured? Pick the knuckle that matches
            </label>
            <select
              id="cup-knuckle"
              className={`mt-2 ${INPUT_CLASS}`}
              value=""
              onChange={(event) => {
                const match = KNUCKLE_OPTIONS.find((item) => item.id === event.target.value);
                if (match) setCervixMm(String(match.approxMm));
              }}
            >
              <option value="">Use the measurement above</option>
              {KNUCKLE_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cup-floor">
              Pelvic floor
            </label>
            <select
              id="cup-floor"
              className={`mt-2 ${INPUT_CLASS}`}
              value={pelvicFloor}
              onChange={(event) => setPelvicFloor(event.target.value)}
            >
              {PELVIC_FLOOR_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className={CHECK_ROW}>
            <input
              id="cup-birth"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={vaginalBirth}
              onChange={(event) => setVaginalBirth(event.target.checked)}
            />
            <label htmlFor="cup-birth">I have given birth vaginally</label>
          </div>
          <div className={CHECK_ROW}>
            <input
              id="cup-heavy"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={heavyFlow}
              onChange={(event) => setHeavyFlow(event.target.checked)}
            />
            <label htmlFor="cup-heavy">My flow is heavy</label>
          </div>
          <div className={CHECK_ROW}>
            <input
              id="cup-iud"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={hasIud}
              onChange={(event) => setHasIud(event.target.checked)}
            />
            <label htmlFor="cup-iud">I have an IUD fitted</label>
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

      <section
        aria-live="polite"
        role="status"
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Suggested cup size
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? result.sizeLabel : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? result.fingerCue : "Fix the highlighted input to see a suggestion."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label={isCopied("result") ? "Cup sizing guidance copied to clipboard" : "Copy cup sizing guidance"}
              className={GHOST_BTN}
              disabled={!ok}
            >
              {isCopied("result") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("result") ? "Copied!" : "Copy result"}
            </button>
            <span aria-live="polite" role="status" className="sr-only">
              {announcement}
            </span>
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
            <div
              key={label}
              className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
            >
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="font-semibold sm:max-w-[60%] sm:text-right">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && result.notes.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {result.notes.map((note) => (
              <li
                key={note}
                className="rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]"
              >
                {note}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="mt-6 overflow-x-auto rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Cervix height bands</h2>
        <table className="mt-3 w-full min-w-[380px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              <th scope="col" className="py-2 pr-3 font-semibold">
                Band
              </th>
              <th scope="col" className="py-2 pr-3 font-semibold">
                Finger cue
              </th>
              <th scope="col" className="py-2 text-right font-semibold">
                Cup length
              </th>
            </tr>
          </thead>
          <tbody>
            {CERVIX_BANDS.map((band) => (
              <tr key={band.id} className="border-b border-[var(--border)] last:border-0">
                <td className="py-2 pr-3 font-semibold">{band.label}</td>
                <td className="py-2 pr-3 text-[var(--muted-foreground)]">{band.fingerCue}</td>
                <td className="py-2 text-right whitespace-nowrap">up to {band.maxCupLengthMm} mm</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        General guidance only, not medical advice, and not tied to any brand — always check the
        manufacturer&apos;s own chart, since the age {SIZE_AGE_THRESHOLD} rule and the size labels
        vary. Speak to a clinician before using a cup if you have an IUD, a recent gynaecological
        procedure, or any condition affecting the vagina or cervix.
      </p>
    </main>
  );
}
