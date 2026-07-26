"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, RotateCcw } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const money2 = (value) => INR2.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const INF = Number.POSITIVE_INFINITY;

/**
 * Professional tax is a state levy under Article 276, capped at Rs 2,500 a year.
 * `period` says what income the slab table is read against: monthly salary,
 * half-yearly income or annual income. `amount` is the tax for that period.
 */
const STATES = [
  {
    id: "maharashtra",
    name: "Maharashtra",
    period: "month",
    gendered: true,
    lastMonthLabel: "February",
    slabs: {
      male: [
        { upTo: 7500, amount: 0, annual: 0 },
        { upTo: 10000, amount: 175, annual: 2100 },
        { upTo: INF, amount: 200, annual: 2500, lastMonth: 300 },
      ],
      female: [
        { upTo: 25000, amount: 0, annual: 0 },
        { upTo: INF, amount: 200, annual: 2500, lastMonth: 300 },
      ],
    },
    note: "Women earning up to Rs 25,000 a month are exempt. The higher slab pays Rs 300 in February so the year totals Rs 2,500.",
  },
  {
    id: "karnataka",
    name: "Karnataka",
    period: "month",
    slabs: [
      { upTo: 24999.99, amount: 0, annual: 0 },
      { upTo: INF, amount: 200, annual: 2400 },
    ],
    note: "Since April 2023 the exemption limit is Rs 25,000 a month; salaries of Rs 25,000 and above pay Rs 200 a month.",
  },
  {
    id: "west-bengal",
    name: "West Bengal",
    period: "month",
    slabs: [
      { upTo: 10000, amount: 0, annual: 0 },
      { upTo: 15000, amount: 110, annual: 1320 },
      { upTo: 25000, amount: 130, annual: 1560 },
      { upTo: 40000, amount: 150, annual: 1800 },
      { upTo: INF, amount: 200, annual: 2400 },
    ],
    note: "Monthly gross salary decides the slab; returns are filed annually by the employer.",
  },
  {
    id: "tamil-nadu",
    name: "Tamil Nadu (Greater Chennai)",
    period: "halfyear",
    slabs: [
      { upTo: 21000, amount: 0, annual: 0 },
      { upTo: 30000, amount: 135, annual: 270 },
      { upTo: 45000, amount: 315, annual: 630 },
      { upTo: 60000, amount: 690, annual: 1380 },
      { upTo: 75000, amount: 1025, annual: 2050 },
      { upTo: INF, amount: 1250, annual: 2500 },
    ],
    note: "Tamil Nadu slabs are read against half-yearly income and the tax is paid twice a year. Rates differ slightly across local bodies.",
  },
  {
    id: "andhra-pradesh",
    name: "Andhra Pradesh",
    period: "month",
    slabs: [
      { upTo: 15000, amount: 0, annual: 0 },
      { upTo: 20000, amount: 150, annual: 1800 },
      { upTo: INF, amount: 200, annual: 2400 },
    ],
    note: "Salaries up to Rs 15,000 a month are exempt.",
  },
  {
    id: "telangana",
    name: "Telangana",
    period: "month",
    slabs: [
      { upTo: 15000, amount: 0, annual: 0 },
      { upTo: 20000, amount: 150, annual: 1800 },
      { upTo: INF, amount: 200, annual: 2400 },
    ],
    note: "Telangana mirrors the Andhra Pradesh slab structure.",
  },
  {
    id: "gujarat",
    name: "Gujarat",
    period: "month",
    slabs: [
      { upTo: 12000, amount: 0, annual: 0 },
      { upTo: INF, amount: 200, annual: 2400 },
    ],
    note: "Since April 2022 monthly salary up to Rs 12,000 is exempt; above that the tax is a flat Rs 200 a month.",
  },
  {
    id: "madhya-pradesh",
    name: "Madhya Pradesh",
    period: "month",
    lastMonthLabel: "the last month of the year",
    slabs: [
      { upTo: 18750, amount: 0, annual: 0 },
      { upTo: 25000, amount: 125, annual: 1500 },
      { upTo: 33333, amount: 167, annual: 2000, lastMonth: 163 },
      { upTo: INF, amount: 208, annual: 2500, lastMonth: 212 },
    ],
    note: "The last month of the year is adjusted so the annual total lands exactly on the slab figure.",
  },
  {
    id: "kerala",
    name: "Kerala",
    period: "halfyear",
    slabs: [
      { upTo: 11999, amount: 0, annual: 0 },
      { upTo: 17999, amount: 120, annual: 240 },
      { upTo: 29999, amount: 180, annual: 360 },
      { upTo: 44999, amount: 300, annual: 600 },
      { upTo: 59999, amount: 450, annual: 900 },
      { upTo: 74999, amount: 600, annual: 1200 },
      { upTo: 99999, amount: 750, annual: 1500 },
      { upTo: 124999, amount: 1000, annual: 2000 },
      { upTo: INF, amount: 1250, annual: 2500 },
    ],
    note: "Kerala professional tax is levied by local bodies on half-yearly income and paid twice a year.",
  },
  {
    id: "odisha",
    name: "Odisha",
    period: "month",
    lastMonthLabel: "the last month of the year",
    slabs: [
      { upTo: 13304, amount: 0, annual: 0 },
      { upTo: 25000, amount: 125, annual: 1500 },
      { upTo: INF, amount: 200, annual: 2500, lastMonth: 300 },
    ],
    note: "The top slab pays Rs 300 in the final month so the year totals the Rs 2,500 constitutional cap.",
  },
  {
    id: "assam",
    name: "Assam",
    period: "month",
    lastMonthLabel: "the last month of the year",
    slabs: [
      { upTo: 10000, amount: 0, annual: 0 },
      { upTo: 15000, amount: 150, annual: 1800 },
      { upTo: 25000, amount: 180, annual: 2160 },
      { upTo: INF, amount: 208, annual: 2500, lastMonth: 212 },
    ],
    note: "The top slab is Rs 208 a month with a Rs 212 final month.",
  },
  {
    id: "bihar",
    name: "Bihar",
    period: "year",
    slabs: [
      { upTo: 300000, amount: 0, annual: 0 },
      { upTo: 500000, amount: 1000, annual: 1000 },
      { upTo: 1000000, amount: 2000, annual: 2000 },
      { upTo: INF, amount: 2500, annual: 2500 },
    ],
    note: "Bihar reads the slab against annual income and collects the tax quarterly.",
  },
  {
    id: "jharkhand",
    name: "Jharkhand",
    period: "year",
    slabs: [
      { upTo: 300000, amount: 0, annual: 0 },
      { upTo: 500000, amount: 1200, annual: 1200 },
      { upTo: 800000, amount: 1800, annual: 1800 },
      { upTo: 1000000, amount: 2100, annual: 2100 },
      { upTo: INF, amount: 2500, annual: 2500 },
    ],
    note: "Jharkhand slabs are based on annual income.",
  },
  {
    id: "sikkim",
    name: "Sikkim",
    period: "month",
    slabs: [
      { upTo: 20000, amount: 0, annual: 0 },
      { upTo: 30000, amount: 125, annual: 1500 },
      { upTo: 40000, amount: 150, annual: 1800 },
      { upTo: INF, amount: 200, annual: 2400 },
    ],
    note: "Sikkim collects professional tax quarterly on a monthly salary slab.",
  },
  {
    id: "no-pt",
    name: "Delhi, Haryana, UP, Uttarakhand, Rajasthan (no levy)",
    period: "month",
    slabs: [{ upTo: INF, amount: 0, annual: 0 }],
    note: "These states and union territories do not levy professional tax at all, so nothing is deducted from your salary.",
  },
];

const DEFAULTS = { state: "maharashtra", gender: "male", salary: 50000 };

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export function computeProfessionalTax({ stateId, gender, monthlySalary }) {
  const state = STATES.find((item) => item.id === stateId) ?? STATES[0];
  const table = state.gendered ? state.slabs[gender] ?? state.slabs.male : state.slabs;

  const periodIncome =
    state.period === "month"
      ? monthlySalary
      : state.period === "halfyear"
        ? monthlySalary * 6
        : monthlySalary * 12;

  const index = table.findIndex((slab) => periodIncome <= slab.upTo);
  const slab = index >= 0 ? table[index] : table[table.length - 1];

  const annual = slab.annual;
  const regularMonthly =
    state.period === "month" ? slab.amount : Number((annual / 12).toFixed(2));
  const lastMonth = state.period === "month" ? slab.lastMonth ?? slab.amount : regularMonthly;

  return {
    state,
    slabIndex: index >= 0 ? index : table.length - 1,
    table,
    periodIncome,
    slabAmount: slab.amount,
    regularMonthly,
    lastMonth,
    annual,
    exempt: annual === 0,
    netMonthly: monthlySalary - regularMonthly,
    netAnnual: monthlySalary * 12 - annual,
  };
}

const slabLabel = (table, index, period) => {
  const lower = index === 0 ? 0 : table[index - 1].upTo;
  const upper = table[index].upTo;
  const unit =
    period === "month" ? "per month" : period === "halfyear" ? "per half-year" : "per year";
  const from = index === 0 ? "Up to" : `${money(Math.ceil(lower + 1))} to`;
  if (upper === INF) return `Above ${money(lower)} ${unit}`;
  return index === 0 ? `Up to ${money(upper)} ${unit}` : `${from} ${money(upper)} ${unit}`;
};

export default function ToolHome() {
  const [stateId, setStateId] = useState(DEFAULTS.state);
  const [gender, setGender] = useState(DEFAULTS.gender);
  const [salary, setSalary] = useState(String(DEFAULTS.salary));
  const [copied, setCopied] = useState(false);

  const calc = useMemo(() => {
    const monthlySalary = toNumber(salary);
    if (Number.isNaN(monthlySalary)) return { error: "Enter a valid monthly salary." };
    if (monthlySalary < 0) return { error: "Monthly salary cannot be negative." };
    if (monthlySalary > 100000000) return { error: "Monthly salary looks unrealistically high." };
    return computeProfessionalTax({ stateId, gender, monthlySalary });
  }, [stateId, gender, salary]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "Professional Tax Calculator",
      `State: ${calc.state.name}`,
      `Monthly gross salary: ${money(toNumber(salary))}`,
      calc.exempt
        ? "Professional tax: exempt under this slab"
        : `Monthly professional tax: ${money2(calc.regularMonthly)}`,
      calc.lastMonth !== calc.regularMonthly
        ? `Final month deduction: ${money2(calc.lastMonth)}`
        : null,
      `Annual professional tax: ${money(calc.annual)}`,
      `Net monthly salary after PT: ${money(calc.netMonthly)}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [calc, salary]);

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
    setStateId(DEFAULTS.state);
    setGender(DEFAULTS.gender);
    setSalary(String(DEFAULTS.salary));
    setCopied(false);
  };

  const selectedState = STATES.find((item) => item.id === stateId) ?? STATES[0];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          Professional tax
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Professional Tax Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Professional tax is a state levy deducted straight from your payslip and capped at
          Rs 2,500 a year by the Constitution. Pick your state and enter your monthly gross to see
          the exact slab, the monthly deduction and the annual total.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pt-state">
              State of employment
            </label>
            <select
              id="pt-state"
              className={`mt-2 ${INPUT_CLASS}`}
              value={stateId}
              onChange={(event) => setStateId(event.target.value)}
            >
              {STATES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pt-salary">
              Monthly gross salary (INR)
            </label>
            <input
              id="pt-salary"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={salary}
              onChange={(event) => setSalary(event.target.value)}
            />
          </div>
          {selectedState.gendered && (
            <div>
              <label className={LABEL_CLASS} htmlFor="pt-gender">
                Gender (Maharashtra has a separate exemption)
              </label>
              <select
                id="pt-gender"
                className={`mt-2 ${INPUT_CLASS}`}
                value={gender}
                onChange={(event) => setGender(event.target.value)}
              >
                <option value="male">Male / other</option>
                <option value="female">Female</option>
              </select>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[15000, 25000, 50000, 100000].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setSalary(String(value))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {money(value)}/mo
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
                  Monthly professional tax
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {calc.exempt ? "Nil" : money2(calc.regularMonthly)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {calc.exempt
                    ? `No professional tax at this salary in ${calc.state.name}`
                    : `${money(calc.annual)} for the full year in ${calc.state.name}`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy professional tax result"
                  className={GHOST_BTN}
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
                  calc.state.period === "month"
                    ? "Income the slab is read against (monthly)"
                    : calc.state.period === "halfyear"
                      ? "Income the slab is read against (half-yearly)"
                      : "Income the slab is read against (annual)",
                  money(calc.periodIncome),
                ],
                ["Regular monthly deduction", calc.exempt ? "Nil" : money2(calc.regularMonthly)],
                calc.lastMonth !== calc.regularMonthly
                  ? [
                      `Deduction in ${calc.state.lastMonthLabel ?? "the final month"}`,
                      money2(calc.lastMonth),
                    ]
                  : null,
                ["Annual professional tax", money(calc.annual)],
                ["Net monthly salary after PT", money(calc.netMonthly)],
                ["Net annual salary after PT", money(calc.netAnnual)],
              ]
                .filter(Boolean)
                .map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                    <dt className="text-[var(--muted-foreground)]">{label}</dt>
                    <dd className="text-right font-semibold">{value}</dd>
                  </div>
                ))}
            </dl>

            <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
              {calc.state.note}
            </p>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">{calc.state.name} slab table</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Income slab
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Tax
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Per year
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {calc.table.map((slab, index) => (
                    <tr
                      key={`${slab.upTo}-${slab.amount}`}
                      className={`border-b border-[var(--border)] last:border-0 ${
                        index === calc.slabIndex ? "text-[var(--primary)]" : ""
                      }`}
                    >
                      <td className="py-2 pr-3">
                        {slabLabel(calc.table, index, calc.state.period)}
                        {index === calc.slabIndex ? " · your slab" : ""}
                      </td>
                      <td className="py-2 pr-3 text-right font-semibold">
                        {slab.amount === 0 ? "Nil" : money(slab.amount)}
                      </td>
                      <td className="py-2 text-right text-[var(--muted-foreground)]">
                        {slab.annual === 0 ? "Nil" : money(slab.annual)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Slabs are set by state legislation and municipal bodies and can change
        with each state budget; some states also vary rates by local body. Professional tax paid is
        deductible from salary income under section 16(iii) only if you are taxed under the old
        regime. Confirm current rates with your employer or the state commercial tax department.
      </p>
    </main>
  );
}
