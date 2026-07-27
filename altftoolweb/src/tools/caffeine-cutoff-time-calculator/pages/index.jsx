"use client";

import { useMemo, useState } from "react";
import { Check, Coffee, Copy, RotateCcw } from "lucide-react";
import {
  DEFAULT_HALF_LIFE_HOURS,
  DEFAULT_TARGET_RESIDUAL_MG,
  DRINKS,
  EVIDENCE_MINIMUM_GAP_HOURS,
  FDA_DAILY_LIMIT_MG,
  PREGNANCY_DAILY_LIMIT_MG,
  computeCaffeineCutoff,
  formatClock12,
  formatHours,
} from "../lib";

const DEFAULTS = {
  bedTime: "23:00",
  doseMg: "95",
  halfLife: String(DEFAULT_HALF_LIFE_HOURS),
  target: String(DEFAULT_TARGET_RESIDUAL_MG),
  drinkTime: "15:00",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const MG = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const MG1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

export default function ToolHome() {
  const [bedTime, setBedTime] = useState(DEFAULTS.bedTime);
  const [doseMg, setDoseMg] = useState(DEFAULTS.doseMg);
  const [halfLife, setHalfLife] = useState(DEFAULTS.halfLife);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [drinkTime, setDrinkTime] = useState(DEFAULTS.drinkTime);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeCaffeineCutoff({
        bedTime,
        doseMg,
        halfLifeHours: halfLife,
        targetResidualMg: target,
        drinkTime,
      }),
    [bedTime, doseMg, halfLife, target, drinkTime],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Caffeine Cutoff Time Calculator",
      `Bedtime: ${formatClock12(result.bed)}`,
      `Dose: ${MG.format(result.dose)} mg, half-life ${result.halfLife} h`,
      `Decay to ${MG.format(result.target)} mg takes ${formatHours(result.waitHours)}`,
      `Latest caffeine time: ${formatClock12(result.strictestCutoffMinutes)}`,
    ];
    if (result.drink) {
      lines.push(
        `If drunk at ${formatClock12(result.drink.drankAt)}: about ${MG1.format(result.drink.residual)} mg still on board at bedtime`,
      );
    }
    return lines.join("\n");
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
    setBedTime(DEFAULTS.bedTime);
    setDoseMg(DEFAULTS.doseMg);
    setHalfLife(DEFAULTS.halfLife);
    setTarget(DEFAULTS.target);
    setDrinkTime(DEFAULTS.drinkTime);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Coffee className="h-4 w-4" aria-hidden="true" />
          Sleep scheduling
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Caffeine Cutoff Time Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Caffeine clears by first-order decay, halving every few hours. Enter your bedtime and the
          drink, and this shows the latest time to have it so only a small residual is left when you
          try to sleep.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cc-bed">
              Planned bedtime
            </label>
            <input
              id="cc-bed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={bedTime}
              onChange={(event) => setBedTime(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cc-dose">
              Caffeine in the drink (mg)
            </label>
            <input
              id="cc-dose"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="2000"
              step="5"
              value={doseMg}
              onChange={(event) => setDoseMg(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cc-halflife">
              Your caffeine half-life (hours)
            </label>
            <input
              id="cc-halflife"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1.5"
              max="12"
              step="0.5"
              value={halfLife}
              onChange={(event) => setHalfLife(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cc-target">
              Residual you accept at bedtime (mg)
            </label>
            <input
              id="cc-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="5"
              step="5"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cc-drinktime">
              Time you actually drank it (optional)
            </label>
            <input
              id="cc-drinktime"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={drinkTime}
              onChange={(event) => setDrinkTime(event.target.value)}
            />
          </div>
        </div>

        <p className="mt-4 text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
          Typical servings
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {DRINKS.map((drink) => (
            <button
              key={drink.id}
              type="button"
              onClick={() => setDoseMg(String(drink.mg))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {drink.label} · {drink.mg} mg
            </button>
          ))}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Latest caffeine time
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : formatClock12(result.strictestCutoffMinutes)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see your cutoff."
                : result.usesEvidenceFloor
                  ? `Decay alone allows ${formatClock12(result.cutoffMinutes)}, but a ${EVIDENCE_MINIMUM_GAP_HOURS}-hour gap is the tighter of the two.`
                  : `${formatHours(result.waitHours)} of decay before bed at a ${result.halfLife}-hour half-life.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy caffeine cutoff result"
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
          {[
            ["Cutoff from half-life decay", hasError ? DASH : formatClock12(result.cutoffMinutes)],
            [
              `Cutoff from the ${EVIDENCE_MINIMUM_GAP_HOURS}-hour trial evidence`,
              hasError ? DASH : formatClock12(result.evidenceCutoffMinutes),
            ],
            ["Time needed to reach your target", hasError ? DASH : formatHours(result.waitHours)],
            ["Dose", hasError ? DASH : `${MG.format(result.dose)} mg`],
            ["Target residual at bedtime", hasError ? DASH : `${MG.format(result.target)} mg`],
            [
              "Residual at bedtime if drunk at the time above",
              hasError || !result.drink ? DASH : `${MG1.format(result.drink.residual)} mg`,
            ],
            [
              "Gap between that drink and bedtime",
              hasError || !result.drink ? DASH : formatHours(result.drink.gapHours),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.drink && result.drink.overTarget && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            That drink leaves about {MG1.format(result.drink.residual)} mg on board at bedtime — more
            than your {MG.format(result.target)} mg target.
          </p>
        )}
        {!hasError && result.overFdaDailyLimit && (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            This single dose is above the {FDA_DAILY_LIMIT_MG} mg the FDA describes as the daily
            amount not generally associated with negative effects in healthy adults.
          </p>
        )}
        {!hasError && !result.overFdaDailyLimit && result.overPregnancyLimit && (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            This dose is above the {PREGNANCY_DAILY_LIMIT_MG} mg a day usually advised during
            pregnancy.
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">How the dose falls away</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Stage
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Hours after
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Still on board
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.curve.map((row) => (
                  <tr key={row.label} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                      {formatHours(row.hours)}
                    </td>
                    <td className="py-2 text-right">{MG1.format(row.remaining)} mg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Half-life varies widely between people — pregnancy, oral contraceptives
        and liver conditions slow clearance, smoking speeds it up — so treat the default 5 hours as a
        starting point. Talk to a doctor about caffeine if you are pregnant, have a heart rhythm
        condition, or take medicines that interact with it.
      </p>
    </main>
  );
}
