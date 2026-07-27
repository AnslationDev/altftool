"use client";

import { useMemo, useState } from "react";
import { Baby, Check, Copy, RotateCcw } from "lucide-react";

import { EXPERIENCE_LEVELS, WHEEL_SIZES, selectKidsBike } from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";
const cm = (v) => (Number.isFinite(v) ? `${NUM1.format(v)} cm` : DASH);

const months = (value) => {
  if (!Number.isFinite(value)) return DASH;
  if (value < 1) return "already at the top of this size";
  if (value < 18) return `about ${NUM1.format(value)} months`;
  return `about ${NUM1.format(value / 12)} years`;
};

const DEFAULTS = { inseam: "55", age: "6", experience: "learning", offRoad: false };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [inseam, setInseam] = useState(DEFAULTS.inseam);
  const [age, setAge] = useState(DEFAULTS.age);
  const [experience, setExperience] = useState(DEFAULTS.experience);
  const [offRoad, setOffRoad] = useState(DEFAULTS.offRoad);
  const [copied, setCopied] = useState(false);

  const fit = useMemo(
    () =>
      selectKidsBike({
        inseamCm: toNumber(inseam),
        ageYears: toNumber(age),
        experience,
        offRoad,
      }),
    [inseam, age, experience, offRoad],
  );

  const failed = Boolean(fit.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Kids Bicycle Size Selector",
      `Inseam: ${cm(fit.inseamCm)}`,
      `Recommended: ${fit.recommended.label}`,
      `Saddle height to set: ${cm(fit.targetSaddleCm)}`,
      `Maximum top-tube (standover) height: ${cm(fit.maxStandoverCm)}`,
      `Fits for: ${months(fit.monthsOfFit)}`,
      fit.smaller ? `Also in range, smaller: ${fit.smaller.label}` : "",
      fit.larger ? `Also in range, larger: ${fit.larger.label}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [failed, fit]);

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
    setInseam(DEFAULTS.inseam);
    setAge(DEFAULTS.age);
    setExperience(DEFAULTS.experience);
    setOffRoad(DEFAULTS.offRoad);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Baby className="h-4 w-4" aria-hidden="true" />
          Kids bike fit
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Kids Bicycle Size Selector
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Stand the child against a wall with shoes off, put a book up between their legs like a
          saddle, and measure from the top of the book to the floor. That inseam — not their age —
          decides the wheel size.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="kid-inseam">
              Inseam (cm)
            </label>
            <input
              id="kid-inseam"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="25"
              max="95"
              step="0.5"
              value={inseam}
              onChange={(event) => setInseam(event.target.value)}
            />
            <p className={HINT_CLASS}>Crotch to floor, standing straight, shoes off.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kid-age">
              Age (years, optional)
            </label>
            <input
              id="kid-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="16"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
            <p className={HINT_CLASS}>Used only as a sanity check against the inseam.</p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="kid-experience">
              Riding experience
            </label>
            <select
              id="kid-experience"
              className={`mt-2 ${INPUT_CLASS}`}
              value={experience}
              onChange={(event) => setExperience(event.target.value)}
            >
              {EXPERIENCE_LEVELS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>
              Sizes overlap, so experience breaks the tie — beginners get the smaller bike.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium"
              htmlFor="kid-offroad"
            >
              <input
                id="kid-offroad"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={offRoad}
                onChange={(event) => setOffRoad(event.target.checked)}
              />
              Will be ridden off-road (needs more standover clearance)
            </label>
          </div>
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {fit.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Recommended size
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : fit.recommended.label}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the measurement above to get a recommendation."
                : `Fits an inseam of ${fit.recommended.minInseam}–${fit.recommended.maxInseam} cm`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy bike size recommendation"
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

        {!failed && fit.belowRange && (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
            That inseam is below every pedal-bike size. A balance bike with the saddle at its lowest
            is the right starting point — check the bike&apos;s own minimum saddle height first.
          </p>
        )}
        {!failed && fit.aboveRange && (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
            That inseam is past the children&apos;s range. Shop adult frame sizes instead, where the
            frame is sized in centimetres rather than by wheel diameter.
          </p>
        )}
        {!failed && fit.ageGiven && !fit.ageMatches && fit.ageSuggestion && (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
            Age alone would suggest {fit.ageSuggestion.label}, but the inseam points at{" "}
            {fit.recommended.label}. Trust the inseam — children of the same age vary by more than a
            whole wheel size.
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Saddle height to set", failed ? DASH : cm(fit.targetSaddleCm)],
            ["Both feet flat on the ground", failed ? DASH : cm(fit.saddleFlatFootCm)],
            ["Balls of the feet down", failed ? DASH : cm(fit.saddleBallsOfFeetCm)],
            [
              "Full pedalling extension (from bottom bracket)",
              failed || fit.saddlePedallingCm === null ? DASH : cm(fit.saddlePedallingCm),
            ],
            [
              `Maximum top-tube height (${failed ? DASH : fit.clearance} cm clearance)`,
              failed ? DASH : cm(fit.maxStandoverCm),
            ],
            ["Inseam growth left in this size", failed ? DASH : cm(fit.headroomCm)],
            ["Expected to fit for", failed ? DASH : months(fit.monthsOfFit)],
            ["Size after this one", failed ? DASH : (fit.nextSize?.label ?? "Adult frame sizing")],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && (
          <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
            {fit.targetSaddleNote}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Full sizing chart</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Wheel size
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Inseam
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Height
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Rough age
                </th>
              </tr>
            </thead>
            <tbody>
              {WHEEL_SIZES.map((size) => {
                const isPick = !failed && size.id === fit.recommended.id;
                return (
                  <tr
                    key={size.id}
                    className={`border-b border-[var(--border)] last:border-0 ${isPick ? "bg-[var(--muted)]" : ""}`}
                  >
                    <td className="py-2 pr-3 font-semibold">
                      {size.label}
                      {isPick && (
                        <span className="ml-2 text-xs font-semibold text-[var(--primary)]">
                          your pick
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-right whitespace-nowrap">
                      {size.minInseam}–{size.maxInseam} cm
                    </td>
                    <td className="py-2 pr-3 text-right whitespace-nowrap text-[var(--muted-foreground)]">
                      {size.minHeight}–{size.maxHeight} cm
                    </td>
                    <td className="py-2 text-right whitespace-nowrap text-[var(--muted-foreground)]">
                      {size.ageFrom}–{size.ageTo}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Wheel-size bands vary a little between brands, so check the manufacturer&apos;s own minimum
        and maximum saddle height before buying — that number, not the wheel diameter, is what
        decides whether a particular bike actually fits your child.
      </p>
    </main>
  );
}
