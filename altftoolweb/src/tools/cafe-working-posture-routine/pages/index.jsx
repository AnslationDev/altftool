"use client";

import { useMemo, useState } from "react";
import { Check, Coffee, Copy, RotateCcw } from "lucide-react";

import { CAFE_KIT, TABLE_TYPES, planCafeSession } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULTS = {
  heightCm: "170",
  tableType: "dining",
  sessionMinutes: "120",
  laptopInches: "14",
  viewingDistanceCm: "50",
  hasExternalKeyboard: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const cm = (value) => `${NUM.format(value)} cm`;
const deg = (value) => `${NUM.format(value)}°`;

export default function ToolHome() {
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [tableType, setTableType] = useState(DEFAULTS.tableType);
  const [sessionMinutes, setSessionMinutes] = useState(DEFAULTS.sessionMinutes);
  const [laptopInches, setLaptopInches] = useState(DEFAULTS.laptopInches);
  const [viewingDistanceCm, setViewingDistanceCm] = useState(DEFAULTS.viewingDistanceCm);
  const [hasExternalKeyboard, setHasExternalKeyboard] = useState(DEFAULTS.hasExternalKeyboard);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      planCafeSession({
        heightCm,
        tableType,
        sessionMinutes,
        laptopInches,
        viewingDistanceCm,
        hasExternalKeyboard,
      }),
    [heightCm, tableType, sessionMinutes, laptopInches, viewingDistanceCm, hasExternalKeyboard],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Cafe Working Posture Routine",
      `Best table for you: ${result.bestLabel}`,
      `Sitting at: ${result.chosen.label} (${result.chosen.mismatchCm > 0 ? "+" : ""}${NUM.format(result.chosen.mismatchCm)} cm vs your elbow height)`,
      `Cushion to sit on: ${result.cushionCm > 0 ? cm(result.cushionCm) : "not needed"}`,
      `Footrest: ${result.footrestCm > 0 ? cm(result.footrestCm) : "not needed"}`,
      `Raise the laptop by: ${cm(result.riserCm)}${result.riserUsable ? "" : " (needs a separate keyboard first)"}`,
      `Gaze angle: ${deg(result.gazeNowDeg)} now, ${deg(result.gazeFixedDeg)} after the fix`,
      `Breaks in ${result.sessionMinutes} min: ${result.eyeBreaks} eye breaks, ${result.postureBreaks} posture breaks`,
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
    setHeightCm(DEFAULTS.heightCm);
    setTableType(DEFAULTS.tableType);
    setSessionMinutes(DEFAULTS.sessionMinutes);
    setLaptopInches(DEFAULTS.laptopInches);
    setViewingDistanceCm(DEFAULTS.viewingDistanceCm);
    setHasExternalKeyboard(DEFAULTS.hasExternalKeyboard);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Coffee className="h-4 w-4" aria-hidden="true" />
          Posture &amp; ergonomics
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Cafe Working Posture Routine
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          You cannot adjust a cafe&apos;s furniture, but you can choose where to sit. This ranks the
          three standard table heights against your own elbow height and sizes the cushion, footrest
          and riser that close the rest of the gap.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cwpr-height">
              Your height (cm)
            </label>
            <input
              id="cwpr-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="120"
              max="220"
              step="1"
              value={heightCm}
              onChange={(event) => setHeightCm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cwpr-table">
              Where you are sitting
            </label>
            <select
              id="cwpr-table"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tableType}
              onChange={(event) => setTableType(event.target.value)}
            >
              {TABLE_TYPES.map((type) => (
                <option key={type.key} value={type.key}>
                  {type.label} ({type.tableCm} cm)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cwpr-session">
              How long you will stay (minutes)
            </label>
            <input
              id="cwpr-session"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="10"
              max="600"
              step="5"
              value={sessionMinutes}
              onChange={(event) => setSessionMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cwpr-diagonal">
              Laptop screen size (inches)
            </label>
            <input
              id="cwpr-diagonal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="8"
              max="20"
              step="0.1"
              value={laptopInches}
              onChange={(event) => setLaptopInches(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cwpr-distance">
              Eye-to-screen distance (cm)
            </label>
            <input
              id="cwpr-distance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="25"
              max="100"
              step="1"
              value={viewingDistanceCm}
              onChange={(event) => setViewingDistanceCm(event.target.value)}
            />
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold"
          htmlFor="cwpr-keyboard"
        >
          <input
            id="cwpr-keyboard"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            checked={hasExternalKeyboard}
            onChange={(event) => setHasExternalKeyboard(event.target.checked)}
          />
          I have a separate keyboard with me
        </label>
      </section>

      {hasError && (
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
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Best seat in the house for you
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--primary)] sm:text-3xl">
              {hasError ? DASH : result.bestLabel}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your set-up."
                : result.isBestChoice
                  ? "That is where you already are — good pick."
                  : `Your current table is ${cm(result.chosen.absMismatchCm)} off your elbow height.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy cafe posture set-up"
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
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Sit on something this thick",
              hasError ? DASH : result.cushionCm > 0 ? cm(result.cushionCm) : "Nothing needed",
            ],
            [
              "Footrest height",
              hasError ? DASH : result.footrestCm > 0 ? cm(result.footrestCm) : "Nothing needed",
            ],
            [
              "Raise the laptop by",
              hasError
                ? DASH
                : result.riserUsable
                  ? cm(result.riserCm)
                  : `${cm(result.riserCm)} — but only with a separate keyboard`,
            ],
            ["Top of screen now", hasError ? DASH : cm(result.screenTopNowCm)],
            ["Top of screen target", hasError ? DASH : cm(result.screenTopTargetCm)],
            [
              "Downward gaze angle",
              hasError ? DASH : `${deg(result.gazeNowDeg)} → ${deg(result.gazeFixedDeg)}`,
            ],
            [
              "Eye breaks (every 20 min)",
              hasError ? DASH : String(result.eyeBreaks),
            ],
            [
              "Posture breaks (every 30 min)",
              hasError ? DASH : String(result.postureBreaks),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && !result.riserUsable && result.riserCm > 3 && (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-xs font-medium leading-5 text-[var(--warning)]">
            Without a separate keyboard, raising the laptop lifts the keys above your elbow height
            and swaps neck strain for shoulder strain. Leave it flat, sit back in the chair, and take
            the posture breaks instead.
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">How the three table heights fit you</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Seating
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Table
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Your elbow
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Gap
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Footrest
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.ranked.map((type) => (
                  <tr key={type.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">
                      <span
                        className={
                          type.key === result.bestKey
                            ? "font-semibold text-[var(--primary)]"
                            : undefined
                        }
                      >
                        {type.label}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right whitespace-nowrap">{cm(type.tableCm)}</td>
                    <td className="py-2 pr-3 text-right whitespace-nowrap">
                      {cm(type.elbowHeightCm)}
                    </td>
                    <td className="py-2 pr-3 text-right whitespace-nowrap font-semibold">
                      {type.mismatchCm > 0 ? "+" : ""}
                      {NUM.format(type.mismatchCm)} cm
                    </td>
                    <td className="py-2 text-right whitespace-nowrap text-[var(--muted-foreground)]">
                      {type.footrestCm > 0 ? cm(type.footrestCm) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            A positive gap means the table is above your elbow height, which lifts your shoulders. A
            negative gap means you are reaching down to type.
          </p>
        </section>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What to carry</h2>
        <ul className="mt-3 space-y-3">
          {CAFE_KIT.map(([item, why]) => (
            <li key={item} className="flex gap-3">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold">{item}</p>
                <p className="mt-0.5 text-sm leading-6 text-[var(--muted-foreground)]">{why}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Table and stool heights are trade-standard mid-points, and elbow and eye
        heights are proportional estimates from 50th-percentile adult body dimensions — check them
        against how the chair actually feels. See a physiotherapist or doctor about neck, shoulder or
        wrist pain that keeps coming back.
      </p>
    </main>
  );
}
