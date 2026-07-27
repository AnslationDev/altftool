"use client";

import { useMemo, useState } from "react";
import { AlarmClock, Check, Copy, RotateCcw } from "lucide-react";
import {
  NAP_CUTOFF_HOURS_BEFORE_BED,
  SLOW_WAVE_ONSET_MIN,
  computeNapPlan,
} from "../lib";

const DASH = "—";

const DEFAULTS = {
  now: "14:00",
  commitment: "16:00",
  bedtime: "23:00",
  latency: "12",
  slept: "7",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [now, setNow] = useState(DEFAULTS.now);
  const [commitment, setCommitment] = useState(DEFAULTS.commitment);
  const [bedtime, setBedtime] = useState(DEFAULTS.bedtime);
  const [latency, setLatency] = useState(DEFAULTS.latency);
  const [slept, setSlept] = useState(DEFAULTS.slept);
  const [copied, setCopied] = useState(false);

  const num = (value) => (value === "" ? NaN : Number(value));

  const result = useMemo(
    () =>
      computeNapPlan({
        nowTime: now,
        nextCommitment: commitment,
        bedtime,
        latencyMin: num(latency),
        sleptLastNight: num(slept),
      }),
    [now, commitment, bedtime, latency, slept],
  );

  const hasError = Boolean(result.error);
  const noFit = !hasError && result.noFit;
  const rec = !hasError && !noFit ? result.recommended : null;

  const summary = useMemo(() => {
    if (!rec) return "";
    return [
      "Power Nap Planner",
      `Lie down at ${result.lieDownAt}`,
      `Likely asleep by ${rec.asleepAt}`,
      `Set the alarm for ${rec.wakeAt} (${rec.label}, ${rec.minutes} minutes)`,
      `Fully sharp by ${rec.alertAt}`,
      `Window available: ${result.windowLabel}, spare ${result.spareLabel}`,
      `Gap before bedtime: ${result.gapToBedLabel}`,
      rec.note,
    ].join("\n");
  }, [rec, result]);

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
    setNow(DEFAULTS.now);
    setCommitment(DEFAULTS.commitment);
    setBedtime(DEFAULTS.bedtime);
    setLatency(DEFAULTS.latency);
    setSlept(DEFAULTS.slept);
    setCopied(false);
  };

  const rows = [
    ["Lie down at", rec ? result.lieDownAt : DASH],
    ["Likely asleep by", rec ? rec.asleepAt : DASH],
    ["Set your alarm for", rec ? rec.wakeAt : DASH],
    ["Fully sharp again by", rec ? rec.alertAt : DASH],
    ["Expected grogginess", rec ? `about ${rec.inertiaMin} minutes` : DASH],
    ["Window you have", hasError ? DASH : result.windowLabel],
    ["Time left over", rec ? result.spareLabel : DASH],
    ["Gap before tonight's bedtime", rec ? result.gapToBedLabel : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <AlarmClock className="h-4 w-4" aria-hidden="true" />
          Nap timing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Power Nap Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Slow-wave sleep starts around {SLOW_WAVE_ONSET_MIN} minutes into a nap, and an alarm that
          lands in the middle of it leaves you worse than before you lay down. This picks a length
          that fits your window, then tells you exactly when to set the alarm.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pnp-now">
              When you would lie down
            </label>
            <input
              id="pnp-now"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={now}
              onChange={(event) => setNow(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pnp-commitment">
              When you must be sharp again
            </label>
            <input
              id="pnp-commitment"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={commitment}
              onChange={(event) => setCommitment(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pnp-bedtime">
              Tonight's intended bedtime
            </label>
            <input
              id="pnp-bedtime"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={bedtime}
              onChange={(event) => setBedtime(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pnp-latency">
              Minutes you take to fall asleep
            </label>
            <input
              id="pnp-latency"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="60"
              step="1"
              value={latency}
              onChange={(event) => setLatency(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pnp-slept">
              Hours you slept last night
            </label>
            <input
              id="pnp-slept"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="24"
              step="0.5"
              value={slept}
              onChange={(event) => setSlept(event.target.value)}
            />
          </div>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Set your alarm for
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {rec ? rec.wakeAt : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a time."
                : noFit
                  ? `Nothing fits in ${result.windowLabel} — the shortest useful nap needs ${result.shortestNeededMin} minutes including falling asleep and shaking it off.`
                  : `${rec.label} — ${rec.minutes} minutes of sleep, sharp again by ${rec.alertAt}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy nap plan"
              className={GHOST_BTN}
              disabled={!rec}
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

        {noFit && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            With this little time, rest with your eyes shut without trying to sleep, or have a coffee
            instead. Falling asleep and being woken almost immediately gives you the grogginess
            without the benefit.
          </p>
        )}

        {rec && !result.protectsNightSleep && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            This nap ends only {result.gapToBedLabel} before your bedtime. Naps within{" "}
            {NAP_CUTOFF_HOURS_BEFORE_BED} hours of bed bleed off the sleep pressure you need to fall
            asleep at night — expect to lie awake later.
          </p>
        )}

        {rec && result.sleepDebt && (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            You had {result.sleptLastNight} hours last night, so a full cycle is preferred over a
            short nap where the window allows it — it repays slow-wave and REM sleep rather than just
            topping up alertness.
          </p>
        )}

        {rec && result.coffeeNapSuitable && (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            Coffee nap: caffeine peaks about {result.caffeinePeakMin} minutes after you drink it, so
            a coffee immediately before lying down lands just as your alarm goes off.
          </p>
        )}

        {rec && result.startsLate && (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            Napping after 16:00 works against tonight's sleep for most people. The easiest window is
            the post-lunch circadian dip between 13:00 and 15:00.
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Every option, side by side</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[460px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Nap
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Alarm
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Grogginess
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Fits?
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.options.map((option) => (
                  <tr key={option.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{option.label}</span>
                      <span className="block text-xs text-[var(--muted-foreground)]">
                        {option.minutes} min · {option.note}
                      </span>
                    </td>
                    <td className="py-2 pr-3 font-semibold">{option.wakeAt}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {option.inertiaMin} min
                    </td>
                    <td className="py-2 text-right font-semibold">
                      <span className={option.fits ? "text-[var(--success)]" : "text-[var(--danger)]"}>
                        {option.fits ? "Yes" : "No"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        General sleep-hygiene information, not medical advice. Sleep cycle length varies between 70
        and 120 minutes and shifts with age and sleep debt, so treat the 90-minute figure as an
        average. Persistent daytime sleepiness despite adequate night sleep is worth raising with a
        doctor — it can point to sleep apnoea, anaemia, thyroid problems or a medication effect.
      </p>
    </main>
  );
}
