"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Split } from "lucide-react";
import { RPM_BASE_VIEWS, allInOnFormat, planWeek } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const DEC = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const CURRENCIES = [
  { id: "INR", name: "Indian rupee", locale: "en-IN" },
  { id: "USD", name: "US dollar", locale: "en-US" },
  { id: "EUR", name: "Euro", locale: "en-IE" },
  { id: "GBP", name: "Pound sterling", locale: "en-GB" },
];

const DEFAULTS = {
  weeklyHours: "12",
  currency: "INR",
  goal: "revenue",
  shortHours: "0.75",
  shortViews: "6000",
  shortRpm: "40",
  shortCap: "10",
  longHours: "4",
  longViews: "20000",
  longRpm: "180",
  longCap: "3",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [weeklyHours, setWeeklyHours] = useState(DEFAULTS.weeklyHours);
  const [currency, setCurrency] = useState(DEFAULTS.currency);
  const [goal, setGoal] = useState(DEFAULTS.goal);
  const [shortHours, setShortHours] = useState(DEFAULTS.shortHours);
  const [shortViews, setShortViews] = useState(DEFAULTS.shortViews);
  const [shortRpm, setShortRpm] = useState(DEFAULTS.shortRpm);
  const [shortCap, setShortCap] = useState(DEFAULTS.shortCap);
  const [longHours, setLongHours] = useState(DEFAULTS.longHours);
  const [longViews, setLongViews] = useState(DEFAULTS.longViews);
  const [longRpm, setLongRpm] = useState(DEFAULTS.longRpm);
  const [longCap, setLongCap] = useState(DEFAULTS.longCap);
  const [copied, setCopied] = useState(false);

  const currencyInfo = useMemo(
    () => CURRENCIES.find((entry) => entry.id === currency) ?? CURRENCIES[0],
    [currency],
  );
  const money = useMemo(
    () =>
      new Intl.NumberFormat(currencyInfo.locale, {
        style: "currency",
        currency: currencyInfo.id,
        maximumFractionDigits: 0,
      }),
    [currencyInfo],
  );

  const shortsInput = useMemo(
    () => ({
      hoursPerPiece: toNumber(shortHours),
      avgViews: toNumber(shortViews),
      rpm: toNumber(shortRpm),
      maxPerWeek: toNumber(shortCap),
    }),
    [shortHours, shortViews, shortRpm, shortCap],
  );
  const longInput = useMemo(
    () => ({
      hoursPerPiece: toNumber(longHours),
      avgViews: toNumber(longViews),
      rpm: toNumber(longRpm),
      maxPerWeek: toNumber(longCap),
    }),
    [longHours, longViews, longRpm, longCap],
  );

  const plan = useMemo(
    () => planWeek({ weeklyHours: toNumber(weeklyHours), shorts: shortsInput, longForm: longInput, goal }),
    [weeklyHours, shortsInput, longInput, goal],
  );

  const allShorts = useMemo(
    () => allInOnFormat({ weeklyHours: toNumber(weeklyHours), format: shortsInput }),
    [weeklyHours, shortsInput],
  );
  const allLong = useMemo(
    () => allInOnFormat({ weeklyHours: toNumber(weeklyHours), format: longInput }),
    [weeklyHours, longInput],
  );

  const hasError = Boolean(plan.error);
  const dash = "—";

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Shorts vs Long Form weekly plan",
      `Hours available: ${DEC.format(plan.weeklyHours)} · optimising for ${plan.goal}`,
      `Shorts: ${plan.shorts.count} pieces, ${DEC.format(plan.shorts.hours)} h, ${NUM.format(Math.round(plan.shorts.views))} views, ${money.format(plan.shorts.revenue)}`,
      `Long form: ${plan.longForm.count} pieces, ${DEC.format(plan.longForm.hours)} h, ${NUM.format(Math.round(plan.longForm.views))} views, ${money.format(plan.longForm.revenue)}`,
      `Total: ${NUM.format(Math.round(plan.totalViews))} views, ${money.format(plan.totalRevenue)}`,
      `Value per hour — Shorts ${money.format(plan.shorts.valuePerHour)}, Long form ${money.format(plan.longForm.valuePerHour)}`,
      `Idle hours: ${DEC.format(plan.idleHours)}`,
    ].join("\n");
  }, [hasError, plan, money]);

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
    setWeeklyHours(DEFAULTS.weeklyHours);
    setCurrency(DEFAULTS.currency);
    setGoal(DEFAULTS.goal);
    setShortHours(DEFAULTS.shortHours);
    setShortViews(DEFAULTS.shortViews);
    setShortRpm(DEFAULTS.shortRpm);
    setShortCap(DEFAULTS.shortCap);
    setLongHours(DEFAULTS.longHours);
    setLongViews(DEFAULTS.longViews);
    setLongRpm(DEFAULTS.longRpm);
    setLongCap(DEFAULTS.longCap);
    setCopied(false);
  };

  const shortsShare = hasError || plan.usedHours <= 0 ? 0 : (plan.shorts.hours / plan.usedHours) * 100;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Split className="h-4 w-4" aria-hidden="true" />
          Production planning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Shorts Vs Long Form Time Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Split a fixed number of production hours between short and long content. The planner tests every
          feasible whole-piece combination inside your weekly caps and returns the best one, not a rule of
          thumb.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sl-hours">
              Production hours per week
            </label>
            <input
              id="sl-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              step="0.5"
              value={weeklyHours}
              onChange={(event) => setWeeklyHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sl-goal">
              Optimise for
            </label>
            <select
              id="sl-goal"
              className={`mt-2 ${INPUT_CLASS}`}
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
            >
              <option value="revenue">Expected revenue</option>
              <option value="views">Expected views</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sl-currency">
              Currency
            </label>
            <select
              id="sl-currency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              {CURRENCIES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name} ({entry.id})
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Shorts</h2>
          <div className="mt-3 grid gap-4">
            <div>
              <label className={LABEL_CLASS} htmlFor="sl-short-hours">
                Hours per short
              </label>
              <input
                id="sl-short-hours"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0.05"
                step="0.05"
                value={shortHours}
                onChange={(event) => setShortHours(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="sl-short-views">
                Average views per short
              </label>
              <input
                id="sl-short-views"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="500"
                value={shortViews}
                onChange={(event) => setShortViews(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="sl-short-rpm">
                RPM per {NUM.format(RPM_BASE_VIEWS)} views
              </label>
              <input
                id="sl-short-rpm"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={shortRpm}
                onChange={(event) => setShortRpm(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="sl-short-cap">
                Most you would publish per week
              </label>
              <input
                id="sl-short-cap"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={shortCap}
                onChange={(event) => setShortCap(event.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Long form</h2>
          <div className="mt-3 grid gap-4">
            <div>
              <label className={LABEL_CLASS} htmlFor="sl-long-hours">
                Hours per video
              </label>
              <input
                id="sl-long-hours"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0.25"
                step="0.25"
                value={longHours}
                onChange={(event) => setLongHours(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="sl-long-views">
                Average views per video
              </label>
              <input
                id="sl-long-views"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="1000"
                value={longViews}
                onChange={(event) => setLongViews(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="sl-long-rpm">
                RPM per {NUM.format(RPM_BASE_VIEWS)} views
              </label>
              <input
                id="sl-long-rpm"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="5"
                value={longRpm}
                onChange={(event) => setLongRpm(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="sl-long-cap">
                Most you would publish per week
              </label>
              <input
                id="sl-long-cap"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={longCap}
                onChange={(event) => setLongCap(event.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Best weekly {hasError ? "result" : plan.goal === "views" ? "views" : "revenue"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : plan.goal === "views" ? NUM.format(Math.round(plan.totalViews)) : money.format(plan.totalRevenue)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? dash
                : `${plan.shorts.count} shorts + ${plan.longForm.count} long videos in ${DEC.format(plan.usedHours)} hours`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the weekly plan" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError ? (
          <div className="mt-5">
            <div
              className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Shorts take ${Math.round(shortsShare)}% of the scheduled hours and long form ${Math.round(100 - shortsShare)}%`}
            >
              <span className="block h-full bg-[var(--primary)]" style={{ width: `${Math.max(0, Math.min(100, shortsShare))}%` }} />
              <span
                className="block h-full bg-[var(--success)]"
                style={{ width: `${Math.max(0, Math.min(100, 100 - shortsShare))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Shorts {Math.round(shortsShare)}% of scheduled hours · Long form {Math.round(100 - shortsShare)}%
            </p>
          </div>
        ) : null}

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Format</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Pieces</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Hours</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Views</th>
                <th scope="col" className="py-2 text-right font-semibold">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {(hasError
                ? [
                    ["Shorts", dash, dash, dash, dash],
                    ["Long form", dash, dash, dash, dash],
                  ]
                : [
                    [
                      "Shorts",
                      NUM.format(plan.shorts.count),
                      DEC.format(plan.shorts.hours),
                      NUM.format(Math.round(plan.shorts.views)),
                      money.format(plan.shorts.revenue),
                    ],
                    [
                      "Long form",
                      NUM.format(plan.longForm.count),
                      DEC.format(plan.longForm.hours),
                      NUM.format(Math.round(plan.longForm.views)),
                      money.format(plan.longForm.revenue),
                    ],
                  ]
              ).map((row) => (
                <tr key={row[0]} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{row[0]}</td>
                  <td className="py-2 pr-3 text-right">{row[1]}</td>
                  <td className="py-2 pr-3 text-right">{row[2]}</td>
                  <td className="py-2 pr-3 text-right">{row[3]}</td>
                  <td className="py-2 text-right font-semibold">{row[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Value per hour — Shorts", hasError ? dash : money.format(plan.shorts.valuePerHour)],
            ["Value per hour — Long form", hasError ? dash : money.format(plan.longForm.valuePerHour)],
            ["Total expected views", hasError ? dash : NUM.format(Math.round(plan.totalViews))],
            ["Total expected revenue", hasError ? dash : money.format(plan.totalRevenue)],
            ["Hours scheduled", hasError ? dash : `${DEC.format(plan.usedHours)} of ${DEC.format(plan.weeklyHours)}`],
            ["Idle hours", hasError ? dash : DEC.format(plan.idleHours)],
            [
              "All-in on Shorts instead",
              hasError || allShorts.error ? dash : `${NUM.format(allShorts.count)} pieces · ${money.format(allShorts.revenue)}`,
            ],
            [
              "All-in on long form instead",
              hasError || allLong.error ? dash : `${NUM.format(allLong.count)} pieces · ${money.format(allLong.revenue)}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && plan.notes.length > 0 ? (
          <ul className="mt-4 space-y-1.5 text-sm text-[var(--muted-foreground)]">
            {plan.notes.map((note) => (
              <li key={note}>• {note}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The model assumes your average views and RPM per format hold as volume changes, which is optimistic —
        publishing five times as many Shorts usually lowers the average for each. Treat it as a way to compare
        allocations, not a revenue forecast, and re-run it with your own analytics each month.
      </p>
    </main>
  );
}
