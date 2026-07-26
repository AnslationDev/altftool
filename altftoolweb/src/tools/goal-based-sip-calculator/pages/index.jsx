"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Target } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const DEFAULTS = {
  target: 5000000,
  years: 10,
  ret: 12,
  lumpsum: 0,
  stepUp: 0,
  inflation: 0,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

/**
 * Month-by-month projection of a SIP invested at the start of each month
 * (annuity due), with an optional annual step-up and an optional lumpsum that
 * compounds from day one.
 */
function project({ sip, lumpsum, annualReturnPct, months, stepUpPct }) {
  const i = annualReturnPct / 12 / 100;
  let balance = lumpsum;
  let contribution = sip;
  let invested = lumpsum;
  const yearly = [];

  for (let month = 1; month <= months; month += 1) {
    if (month > 1 && (month - 1) % 12 === 0) contribution *= 1 + stepUpPct / 100;
    balance = (balance + contribution) * (1 + i);
    invested += contribution;
    if (month % 12 === 0 || month === months) {
      yearly.push({
        year: Math.ceil(month / 12),
        monthlySip: contribution,
        invested,
        balance,
        gain: balance - invested,
      });
    }
  }

  return { balance, invested, yearly };
}

export default function ToolHome() {
  const [target, setTarget] = useState(String(DEFAULTS.target));
  const [years, setYears] = useState(String(DEFAULTS.years));
  const [ret, setRet] = useState(String(DEFAULTS.ret));
  const [lumpsum, setLumpsum] = useState(String(DEFAULTS.lumpsum));
  const [stepUp, setStepUp] = useState(String(DEFAULTS.stepUp));
  const [inflation, setInflation] = useState(String(DEFAULTS.inflation));
  const [copied, setCopied] = useState(false);

  const calc = useMemo(() => {
    const goalToday = toNumber(target);
    const y = toNumber(years);
    const r = toNumber(ret);
    const lump = toNumber(lumpsum);
    const step = toNumber(stepUp);
    const infl = toNumber(inflation);

    if ([goalToday, y, r, lump, step, infl].some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every field." };
    }
    if (goalToday <= 0) return { error: "Target corpus must be greater than zero." };
    if (y <= 0 || y > 40) return { error: "Choose a goal horizon between 1 and 40 years." };
    if (r < 0 || r > 30) return { error: "Expected return should be between 0% and 30% per year." };
    if (lump < 0) return { error: "Existing investment cannot be negative." };
    if (step < 0 || step > 50) return { error: "Annual step-up should be between 0% and 50%." };
    if (infl < 0 || infl > 20) return { error: "Goal inflation should be between 0% and 20% per year." };

    const months = Math.round(y * 12);
    const i = r / 12 / 100;
    const goalFuture = goalToday * Math.pow(1 + infl / 100, y);
    const lumpsumFuture = lump * Math.pow(1 + i, months);
    const gap = goalFuture - lumpsumFuture;

    const unitFactor = project({
      sip: 1,
      lumpsum: 0,
      annualReturnPct: r,
      months,
      stepUpPct: step,
    }).balance;

    if (!(unitFactor > 0)) return { error: "Could not solve for a SIP with these inputs." };

    const alreadyThere = gap <= 0;
    const requiredSip = alreadyThere ? 0 : gap / unitFactor;

    const plan = project({
      sip: requiredSip,
      lumpsum: lump,
      annualReturnPct: r,
      months,
      stepUpPct: step,
    });

    const flatFactor = project({
      sip: 1,
      lumpsum: 0,
      annualReturnPct: r,
      months,
      stepUpPct: 0,
    }).balance;
    const flatSip = alreadyThere ? 0 : gap / flatFactor;
    const lastSip = plan.yearly.length ? plan.yearly[plan.yearly.length - 1].monthlySip : requiredSip;

    return {
      months,
      goalToday,
      goalFuture,
      lumpsumFuture,
      gap: Math.max(0, gap),
      requiredSip,
      flatSip,
      lastSip,
      alreadyThere,
      invested: plan.invested,
      finalValue: plan.balance,
      gain: plan.balance - plan.invested,
      gainShare: plan.balance > 0 ? ((plan.balance - plan.invested) / plan.balance) * 100 : 0,
      yearly: plan.yearly,
      stepUsed: step,
      inflationUsed: infl,
      yearsUsed: y,
    };
  }, [target, years, ret, lumpsum, stepUp, inflation]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "Goal Based SIP Calculator",
      `Goal today: ${money(calc.goalToday)}`,
      `Goal at ${pct(calc.inflationUsed)} inflation in ${NUM.format(calc.yearsUsed)} years: ${money(calc.goalFuture)}`,
      `Expected return: ${pct(toNumber(ret))} per year`,
      `Existing investment grows to: ${money(calc.lumpsumFuture)}`,
      `Monthly SIP required: ${money(calc.requiredSip)}`,
      calc.stepUsed > 0 ? `Final year SIP after ${pct(calc.stepUsed)} step-up: ${money(calc.lastSip)}` : "",
      `Total invested over ${calc.months} months: ${money(calc.invested)}`,
      `Projected corpus: ${money(calc.finalValue)}`,
      `Growth earned: ${money(calc.gain)}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [calc, ret]);

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
    setTarget(String(DEFAULTS.target));
    setYears(String(DEFAULTS.years));
    setRet(String(DEFAULTS.ret));
    setLumpsum(String(DEFAULTS.lumpsum));
    setStepUp(String(DEFAULTS.stepUp));
    setInflation(String(DEFAULTS.inflation));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Target className="h-4 w-4" aria-hidden="true" />
          Goal planning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Goal Based SIP Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Name the corpus and the date — this solves for the monthly SIP that gets you there,
          counting what you have already invested, an annual step-up, and inflation on the goal.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="goal-target">
              Target corpus in today&apos;s money (INR)
            </label>
            <input
              id="goal-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50000"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="goal-years">
              Years to the goal
            </label>
            <input
              id="goal-years"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="40"
              step="0.5"
              value={years}
              onChange={(event) => setYears(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="goal-return">
              Expected return (% per year)
            </label>
            <input
              id="goal-return"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="30"
              step="0.5"
              value={ret}
              onChange={(event) => setRet(event.target.value)}
            />
            <p className={HINT_CLASS}>Roughly 10-12% for equity funds, 8-10% hybrid, 6-7% debt.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="goal-lumpsum">
              Already invested for this goal (INR)
            </label>
            <input
              id="goal-lumpsum"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={lumpsum}
              onChange={(event) => setLumpsum(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="goal-stepup">
              Annual SIP step-up (%)
            </label>
            <input
              id="goal-stepup"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              step="1"
              value={stepUp}
              onChange={(event) => setStepUp(event.target.value)}
            />
            <p className={HINT_CLASS}>Increase the instalment once a year as your income grows.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="goal-inflation">
              Goal inflation (% per year)
            </label>
            <input
              id="goal-inflation"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="20"
              step="0.5"
              value={inflation}
              onChange={(event) => setInflation(event.target.value)}
            />
            <p className={HINT_CLASS}>Try 6% for general goals, 8-10% for education or healthcare.</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[0, 5, 10, 15].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setStepUp(String(value))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {value}% step-up
            </button>
          ))}
        </div>
      </section>

      {calc.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {calc.error}
        </p>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Monthly SIP required
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {money(calc.requiredSip)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  for {calc.months} months to reach {money(calc.goalFuture)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy goal based SIP result"
                  className={GHOST_BTN}
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

            {calc.alreadyThere && (
              <p className="mt-4 rounded-md px-3 py-2 text-sm font-medium text-[var(--success)] ring-1 ring-[var(--border)]">
                Your existing investment alone is projected to reach the goal — no fresh SIP is needed
                at this return assumption.
              </p>
            )}

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Goal in today's money", money(calc.goalToday)],
                [
                  `Goal on the target date at ${pct(calc.inflationUsed)} inflation`,
                  money(calc.goalFuture),
                ],
                ["Existing investment grows to", money(calc.lumpsumFuture)],
                ["Gap the SIP must fill", money(calc.gap)],
                ...(calc.stepUsed > 0
                  ? [
                      [`Final-year instalment after ${pct(calc.stepUsed)} step-up`, money(calc.lastSip)],
                      ["Flat SIP needed instead of stepping up", money(calc.flatSip)],
                    ]
                  : []),
                ["Total you will invest", money(calc.invested)],
                ["Projected corpus on the target date", money(calc.finalValue)],
                ["Growth earned on top of your money", money(calc.gain)],
                ["Growth as a share of the corpus", pct(calc.gainShare)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-5">
              <div
                className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                role="img"
                aria-label={`Your contributions are ${pct(100 - calc.gainShare)} and growth is ${pct(calc.gainShare)} of the final corpus`}
              >
                <span
                  className="block h-full bg-[var(--primary)]"
                  style={{ width: `${Math.max(0, Math.min(100, 100 - calc.gainShare))}%` }}
                />
                <span
                  className="block h-full bg-[var(--success)]"
                  style={{ width: `${Math.max(0, Math.min(100, calc.gainShare))}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Your money {pct(100 - calc.gainShare)} · Growth {pct(calc.gainShare)}
              </p>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Year-by-year path to the goal</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Year
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Monthly SIP
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Invested
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {calc.yearly.map((row) => (
                    <tr key={row.year} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{row.year}</td>
                      <td className="py-2 pr-3 text-right">{money(row.monthlySip)}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {money(row.invested)}
                      </td>
                      <td className="py-2 text-right">{money(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Projections only — mutual fund returns are not guaranteed and actual outcomes vary with market
        cycles, expense ratios, exit loads and taxes. Instalments are assumed invested at the start of
        each month. This is informational content, not investment advice.
      </p>
    </main>
  );
}
