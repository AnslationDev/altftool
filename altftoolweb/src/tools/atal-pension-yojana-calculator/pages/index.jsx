"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShieldCheck } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);

/** Guaranteed monthly pension slabs available under APY. */
const SLABS = [1000, 2000, 3000, 4000, 5000];

/**
 * Official PFRDA Atal Pension Yojana contribution chart.
 * Key = age at joining (18–40); value = monthly contribution in rupees for the
 * ₹1,000 / ₹2,000 / ₹3,000 / ₹4,000 / ₹5,000 pension slabs.
 */
const APY_CHART = {
  18: [42, 84, 126, 168, 210],
  19: [46, 92, 138, 183, 228],
  20: [50, 100, 150, 198, 248],
  21: [54, 108, 162, 215, 269],
  22: [59, 117, 177, 234, 292],
  23: [64, 127, 192, 254, 318],
  24: [70, 139, 208, 277, 346],
  25: [76, 151, 226, 301, 376],
  26: [82, 164, 246, 327, 409],
  27: [90, 178, 268, 356, 446],
  28: [97, 194, 292, 388, 485],
  29: [106, 212, 318, 423, 529],
  30: [116, 231, 347, 462, 577],
  31: [126, 252, 379, 504, 630],
  32: [138, 276, 414, 551, 689],
  33: [151, 302, 453, 602, 752],
  34: [165, 330, 495, 659, 824],
  35: [181, 362, 543, 722, 902],
  36: [198, 396, 594, 792, 990],
  37: [218, 436, 654, 870, 1087],
  38: [240, 480, 720, 957, 1196],
  39: [264, 528, 792, 1054, 1318],
  40: [291, 582, 873, 1164, 1454],
};

/** Corpus returned to the nominee after the subscriber and spouse pass away. */
const NOMINEE_CORPUS = {
  1000: 170000,
  2000: 340000,
  3000: 510000,
  4000: 680000,
  5000: 850000,
};

const DEFAULTS = { age: "25", slab: 5000 };

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

/**
 * APY contribution and lifetime outgo for a joining age and pension slab.
 * Contributions run every month from the joining age until age 60.
 */
export function computeApy(age, slab) {
  const row = APY_CHART[age];
  const index = SLABS.indexOf(slab);
  if (!row || index < 0) return null;

  const monthly = row[index];
  const years = 60 - age;
  const months = years * 12;
  const totalContribution = monthly * months;
  const corpus = NOMINEE_CORPUS[slab];

  return {
    monthly,
    quarterly: monthly * 3,
    halfYearly: monthly * 6,
    yearly: monthly * 12,
    years,
    months,
    totalContribution,
    corpus,
    annualPension: slab * 12,
    payback: slab > 0 ? totalContribution / slab : 0,
    corpusMultiple: totalContribution > 0 ? corpus / totalContribution : 0,
  };
}

export default function ToolHome() {
  const [age, setAge] = useState(DEFAULTS.age);
  const [slab, setSlab] = useState(DEFAULTS.slab);
  const [copied, setCopied] = useState(false);

  const calc = useMemo(() => {
    const a = toNumber(age);
    if (Number.isNaN(a)) return { error: "Enter your age as a whole number." };
    if (!Number.isInteger(a)) return { error: "Enter your age in completed whole years." };
    if (a < 18 || a > 40) {
      return { error: "Atal Pension Yojana can only be joined between the ages of 18 and 40." };
    }
    const result = computeApy(a, slab);
    if (!result) return { error: "Pick one of the five APY pension slabs." };
    return { age: a, slab, ...result };
  }, [age, slab]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "Atal Pension Yojana Calculator",
      `Joining age: ${calc.age}`,
      `Guaranteed pension: ${money(calc.slab)} per month from age 60`,
      `Monthly contribution: ${money(calc.monthly)}`,
      `Contribution period: ${calc.years} years (${calc.months} months)`,
      `Total contributed: ${money(calc.totalContribution)}`,
      `Annual pension: ${money(calc.annualPension)}`,
      `Corpus returned to nominee: ${money(calc.corpus)}`,
    ].join("\n");
  }, [calc]);

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
    setSlab(DEFAULTS.slab);
    setCopied(false);
  };

  const chartAge = Number.isInteger(toNumber(age)) && APY_CHART[toNumber(age)] ? toNumber(age) : null;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          APY
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Atal Pension Yojana Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Look up the exact monthly contribution PFRDA will auto-debit for the pension slab you
          choose, based on your age at joining — plus what you pay in total and the corpus your
          nominee finally receives.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="apy-age">
              Your age at joining (18–40)
            </label>
            <input
              id="apy-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="18"
              max="40"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="apy-slab">
              Guaranteed monthly pension from 60
            </label>
            <select
              id="apy-slab"
              className={`mt-2 ${INPUT_CLASS}`}
              value={slab}
              onChange={(event) => setSlab(Number(event.target.value))}
            >
              {SLABS.map((value) => (
                <option key={value} value={value}>
                  {money(value)} per month
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {SLABS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setSlab(value)}
              aria-pressed={slab === value}
              className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                slab === value
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
              }`}
            >
              {money(value)}
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
                  Monthly contribution
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {money(calc.monthly)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Auto-debited for {calc.years} years to secure {money(calc.slab)} a month for life
                  from age 60
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy Atal Pension Yojana result"
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

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Contribution period", `${calc.years} years (${calc.months} monthly debits)`],
                ["Equivalent per year", money(calc.yearly)],
                ["Total you will contribute", money(calc.totalContribution)],
                ["Guaranteed pension per year", money(calc.annualPension)],
                ["Corpus returned to nominee", money(calc.corpus)],
                ["Nominee corpus vs. total paid", `${num(calc.corpusMultiple)}×`],
                [
                  "Months of pension to recover contributions",
                  `${num(Math.ceil(calc.payback))} months (~${num(Math.ceil(calc.payback) / 12)} years)`,
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {chartAge !== null && (
            <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">
                All five slabs if you join at {chartAge}
              </h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[320px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      <th scope="col" className="py-2 pr-3 font-semibold">
                        Pension
                      </th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">
                        Monthly
                      </th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">
                        Total paid
                      </th>
                      <th scope="col" className="py-2 text-right font-semibold">
                        Nominee corpus
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {SLABS.map((value) => {
                      const row = computeApy(chartAge, value);
                      if (!row) return null;
                      const active = value === slab;
                      return (
                        <tr
                          key={value}
                          className={`border-b border-[var(--border)] last:border-0 ${
                            active ? "font-semibold text-[var(--primary)]" : ""
                          }`}
                        >
                          <td className="py-2 pr-3">{money(value)}</td>
                          <td className="py-2 pr-3 text-right">{money(row.monthly)}</td>
                          <td className="py-2 pr-3 text-right">{money(row.totalContribution)}</td>
                          <td className="py-2 text-right">{money(row.corpus)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                Contribution amounts are taken from the official PFRDA chart. Joining later means a
                shorter accumulation window, so the same pension costs noticeably more each month.
              </p>
            </section>
          )}

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">What happens after 60</h2>
            <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
              <li>
                You receive {money(calc.slab)} every month for life, guaranteed by the Government of
                India.
              </li>
              <li>
                On your death the same pension continues to your spouse for their lifetime.
              </li>
              <li>
                After both of you, the nominee receives the accumulated corpus of{" "}
                {money(calc.corpus)}.
              </li>
            </ul>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Contribution figures follow the PFRDA chart in force; banks may levy
        penalty charges for failed auto-debits, and since 1 October 2022 income-tax payers are not
        eligible to enrol in APY. Confirm current rules with your bank or the PFRDA before joining.
      </p>
    </main>
  );
}
