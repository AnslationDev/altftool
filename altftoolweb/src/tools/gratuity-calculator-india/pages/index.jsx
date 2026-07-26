"use client";

import { useCallback, useMemo, useState } from "react";
import { safeCopyText } from "@/shared/utils/clipboard";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const money = (value) => inr.format(Number.isFinite(value) ? value : 0);

const TAX_FREE_CAP = 2000000;
const MIN_SERVICE_YEARS = 5;

const EMPLOYER_OPTIONS = [
  { id: "covered", label: "Private employer covered by the Payment of Gratuity Act, 1972" },
  { id: "notCovered", label: "Private employer not covered by the Act" },
  { id: "government", label: "Central / State government or local authority" },
];

const DEFAULT_STATE = {
  employer: "covered",
  salary: "60000",
  years: "10",
  months: "8",
  received: "",
  useFormulaAmount: true,
  earlyExit: false,
  priorExemption: "0",
};

const toNumber = (value) => {
  const parsed = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULT_STATE);
  const [copied, setCopied] = useState(false);

  const setField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  }, []);

  const calc = useMemo(() => {
    const errors = [];
    const salary = toNumber(form.salary);
    const years = toNumber(form.years);
    const months = toNumber(form.months);
    const priorExemption = toNumber(form.priorExemption);
    const receivedInput = form.useFormulaAmount ? Number.NaN : toNumber(form.received);

    if (!Number.isFinite(salary) || salary <= 0)
      errors.push("Enter the last drawn monthly salary as a number greater than zero.");
    if (!Number.isFinite(years) || years < 0)
      errors.push("Enter completed years of service as 0 or more.");
    if (!Number.isFinite(months) || months < 0 || months > 11)
      errors.push("Enter the extra months of service between 0 and 11.");
    if (!Number.isFinite(priorExemption) || priorExemption < 0)
      errors.push("Enter a valid amount of gratuity exemption already used (0 or more).");
    if (!form.useFormulaAmount && (!Number.isFinite(receivedInput) || receivedInput < 0))
      errors.push("Enter the gratuity actually received as 0 or more.");

    if (errors.length) return { errors };

    const completedYears = Math.floor(years);
    const totalServiceLabel = `${completedYears} year${completedYears === 1 ? "" : "s"} ${Math.floor(
      months
    )} month${Math.floor(months) === 1 ? "" : "s"}`;

    const eligible = completedYears >= MIN_SERVICE_YEARS || form.earlyExit;

    // Under the Act a part-year in excess of six months counts as a full year.
    const roundedYears = months > 6 ? completedYears + 1 : completedYears;
    const yearsUsed = form.employer === "covered" ? roundedYears : completedYears;

    const perYearFactor = form.employer === "covered" ? 15 / 26 : 15 / 30;
    const rawFormulaAmount = eligible ? salary * perYearFactor * yearsUsed : 0;
    // s.4(3) of the Payment of Gratuity Act caps gratuity *payable* by a covered
    // employer at ₹20,00,000 — not just the tax exemption. Without this the
    // headline payable figure contradicts the exemption limb shown below it.
    const formulaAmount =
      form.employer === "covered"
        ? Math.min(rawFormulaAmount, TAX_FREE_CAP)
        : rawFormulaAmount;

    const received = form.useFormulaAmount ? formulaAmount : receivedInput;

    const capRemaining = Math.max(0, TAX_FREE_CAP - priorExemption);
    let exempt;
    let limbs;
    if (form.employer === "government") {
      exempt = received;
      limbs = [["Government gratuity", "Fully exempt under section 10(10)(i)"]];
    } else {
      const statutory = salary * perYearFactor * yearsUsed;
      exempt = Math.max(0, Math.min(received, capRemaining, statutory));
      limbs = [
        ["1. Gratuity actually received", money(received)],
        [
          `2. Lifetime cap${priorExemption > 0 ? " left" : ""}`,
          money(capRemaining),
        ],
        [
          form.employer === "covered"
            ? "3. 15/26 × last salary × years"
            : "3. Half month's average salary × completed years",
          money(statutory),
        ],
      ];
    }

    const taxable = Math.max(0, received - exempt);

    return {
      errors: [],
      salary,
      completedYears,
      extraMonths: Math.floor(months),
      totalServiceLabel,
      eligible,
      roundedYears,
      yearsUsed,
      perYearFactor,
      formulaAmount,
      received,
      exempt,
      taxable,
      limbs,
      capRemaining,
      priorExemption,
    };
  }, [form]);

  const report = useMemo(() => {
    if (calc.errors?.length) return "";
    const employerLabel = EMPLOYER_OPTIONS.find((o) => o.id === form.employer)?.label;
    const lines = [
      "Gratuity Calculation (India)",
      "",
      `Employer type: ${employerLabel}`,
      `Last drawn monthly salary (basic + DA): ${money(calc.salary)}`,
      `Service: ${calc.totalServiceLabel}`,
      `Years counted: ${calc.yearsUsed}`,
      "",
      `Gratuity payable by formula: ${money(calc.formulaAmount)}`,
      `Gratuity considered received: ${money(calc.received)}`,
      `Exempt under section 10(10): ${money(calc.exempt)}`,
      `Taxable gratuity: ${money(calc.taxable)}`,
      "",
      calc.eligible
        ? "Eligibility: five years of continuous service met (or waived for death/disablement)."
        : "Eligibility: less than five years of continuous service, so no gratuity is payable under the Act.",
      "",
      "Informational only — your employer's settlement is final.",
    ];
    return lines.join("\n");
  }, [calc, form.employer]);

  const copyReport = async () => {
    if (!report) return;
    const ok = await safeCopyText(report);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const inputClass =
    "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

  const hasErrors = Boolean(calc.errors?.length);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
          <h1 className="text-2xl font-semibold sm:text-3xl">Gratuity Calculator India</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            Work out the gratuity payable on resignation or retirement using the Payment of Gratuity
            Act formula — 15 days of last drawn salary for every completed year, divided by 26 — and
            see how much of it stays tax free under the {money(TAX_FREE_CAP)} lifetime limit.
          </p>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Service and salary</h2>

            <div className="mt-4 grid gap-4">
              <div>
                <label htmlFor="grat-employer" className="text-sm font-semibold">
                  Employer type
                </label>
                <select
                  id="grat-employer"
                  value={form.employer}
                  onChange={(e) => setField("employer", e.target.value)}
                  className={inputClass}
                >
                  {EMPLOYER_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  The Act covers establishments with 10 or more employees — most companies qualify.
                </p>
              </div>

              <div>
                <label htmlFor="grat-salary" className="text-sm font-semibold">
                  {form.employer === "notCovered"
                    ? "Average monthly salary of the last 10 months (basic + DA + turnover commission) (₹)"
                    : "Last drawn monthly salary — basic + dearness allowance (₹)"}
                </label>
                <input
                  id="grat-salary"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1000"
                  value={form.salary}
                  onChange={(e) => setField("salary", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="grat-years" className="text-sm font-semibold">
                    Completed years of service
                  </label>
                  <input
                    id="grat-years"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    value={form.years}
                    onChange={(e) => setField("years", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="grat-months" className="text-sm font-semibold">
                    Extra months (0–11)
                  </label>
                  <input
                    id="grat-months"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="11"
                    step="1"
                    value={form.months}
                    onChange={(e) => setField("months", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <label
                htmlFor="grat-early"
                className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm leading-6 hover:border-[var(--primary)]"
              >
                <input
                  id="grat-early"
                  type="checkbox"
                  checked={form.earlyExit}
                  onChange={(e) => setField("earlyExit", e.target.checked)}
                  className="mt-1.5 h-4 w-4 accent-[var(--primary)]"
                />
                <span>
                  Service ended because of death or disablement (the five-year condition does not
                  apply)
                </span>
              </label>

              <label
                htmlFor="grat-useformula"
                className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm leading-6 hover:border-[var(--primary)]"
              >
                <input
                  id="grat-useformula"
                  type="checkbox"
                  checked={form.useFormulaAmount}
                  onChange={(e) => setField("useFormulaAmount", e.target.checked)}
                  className="mt-1.5 h-4 w-4 accent-[var(--primary)]"
                />
                <span>My employer pays exactly the statutory formula amount</span>
              </label>

              {!form.useFormulaAmount ? (
                <div>
                  <label htmlFor="grat-received" className="text-sm font-semibold">
                    Gratuity actually received (₹)
                  </label>
                  <input
                    id="grat-received"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1000"
                    value={form.received}
                    onChange={(e) => setField("received", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. 500000"
                  />
                </div>
              ) : null}

              <div>
                <label htmlFor="grat-prior" className="text-sm font-semibold">
                  Gratuity exemption already used in earlier jobs (₹)
                </label>
                <input
                  id="grat-prior"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="10000"
                  value={form.priorExemption}
                  onChange={(e) => setField("priorExemption", e.target.value)}
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  The {money(TAX_FREE_CAP)} exemption is a lifetime limit across all employers.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setForm(DEFAULT_STATE);
                setCopied(false);
              }}
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              Reset
            </button>
          </section>

          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            {hasErrors ? (
              <div
                role="alert"
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {calc.errors[0]}
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Gratuity payable
                </p>
                <p className="mt-2 text-4xl font-semibold text-[var(--primary)]">
                  {money(calc.formulaAmount)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  for {calc.totalServiceLabel} of service
                </p>

                {!calc.eligible ? (
                  <p
                    role="alert"
                    className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
                  >
                    Gratuity under the Act needs five years of continuous service. With{" "}
                    {calc.totalServiceLabel} nothing is payable unless the exit was due to death or
                    disablement.
                  </p>
                ) : null}

                <dl className="mt-5 grid gap-2">
                  {[
                    ["Years counted in the formula", `${calc.yearsUsed}`],
                    [
                      "Daily rate basis",
                      form.employer === "covered"
                        ? "15 days ÷ 26 working days"
                        : "15 days ÷ 30 days (half month)",
                    ],
                    ["Gratuity received", money(calc.received)],
                    ["Exempt under section 10(10)", money(calc.exempt)],
                    ["Taxable as salary", money(calc.taxable)],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                    >
                      <dt className="text-[var(--muted-foreground)]">{label}</dt>
                      <dd className="font-semibold">{value}</dd>
                    </div>
                  ))}
                </dl>

                <h3 className="mt-6 text-sm font-semibold">Exemption test</h3>
                <ul className="mt-2 grid gap-1 text-sm">
                  {calc.limbs.map(([label, value]) => (
                    <li
                      key={label}
                      className="flex justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                    >
                      <span className="text-[var(--muted-foreground)]">{label}</span>
                      <span className="font-medium">{value}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={copyReport}
                  aria-label="Copy the gratuity calculation"
                  className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {copied ? "Copied!" : "Copy result"}
                </button>

                <div className="mt-5 grid gap-2 text-xs leading-6 text-[var(--muted-foreground)]">
                  <p>
                    Under the Act a part-year longer than six months counts as a full year, so{" "}
                    {calc.completedYears} years {calc.extraMonths} months is treated as{" "}
                    {calc.roundedYears} years. Employers outside the Act count only completed years.
                  </p>
                  <p>
                    Informational only. The exemption limit and formula follow the Payment of
                    Gratuity Act, 1972 and section 10(10) — confirm the final settlement with your
                    employer or a tax adviser.
                  </p>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
