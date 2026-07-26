"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, RotateCcw } from "lucide-react";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => inr.format(Math.round(Number.isFinite(value) ? value : 0));

const ELIGIBLE_YEARS = 8;
const SLAB_RATES = [0, 5, 10, 15, 20, 25, 30];

const START_YEARS = Array.from({ length: 13 }, (_, index) => 2018 + index);
const fyLabel = (year) => `FY ${year}-${String((year + 1) % 100).padStart(2, "0")}`;

function buildSchedule(principal, annualRate, tenureYears) {
  const months = Math.round(tenureYears * 12);
  const monthlyRate = annualRate / 12 / 100;
  const emi =
    monthlyRate === 0
      ? principal / months
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);

  let balance = principal;
  const years = [];
  for (let year = 0; year < Math.ceil(months / 12); year += 1) {
    let interestThisYear = 0;
    let principalThisYear = 0;
    for (let month = 0; month < 12 && year * 12 + month < months; month += 1) {
      const interest = balance * monthlyRate;
      let principalPart = emi - interest;
      if (principalPart > balance) principalPart = balance;
      balance = Math.max(0, balance - principalPart);
      interestThisYear += interest;
      principalThisYear += principalPart;
    }
    years.push({ index: year + 1, interest: interestThisYear, principal: principalThisYear, balance });
  }
  return { emi, years };
}

const DEFAULTS = {
  principal: "1500000",
  rate: "9.5",
  tenure: "10",
  startYear: "2025",
  slab: "30",
};

export default function ToolHome() {
  const [principal, setPrincipal] = useState(DEFAULTS.principal);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [tenure, setTenure] = useState(DEFAULTS.tenure);
  const [startYear, setStartYear] = useState(DEFAULTS.startYear);
  const [slab, setSlab] = useState(DEFAULTS.slab);
  const [copied, setCopied] = useState(false);

  const principalValue = Number(principal);
  const rateValue = Number(rate);
  const tenureValue = Number(tenure);

  const error = useMemo(() => {
    if (![principalValue, rateValue, tenureValue].every((value) => Number.isFinite(value))) {
      return "Please enter numbers only — letters and symbols are not valid amounts.";
    }
    if (principalValue <= 0) return "Loan amount must be greater than zero.";
    if (principalValue > 100000000) return "Loan amount looks too large. Enter the amount in rupees.";
    if (rateValue < 0 || rateValue > 30) return "Interest rate must be between 0% and 30%.";
    if (tenureValue < 1 || tenureValue > 20) return "Repayment tenure must be between 1 and 20 years.";
    return "";
  }, [principalValue, rateValue, tenureValue]);

  const result = useMemo(() => {
    if (error) return null;
    const start = Number(startYear);
    const { emi, years } = buildSchedule(principalValue, rateValue, tenureValue);
    const rows = years.map((year) => ({
      ...year,
      financialYear: fyLabel(start + year.index - 1),
      eligible: year.index <= ELIGIBLE_YEARS,
    }));
    const totalInterest = rows.reduce((sum, row) => sum + row.interest, 0);
    const deductible = rows
      .filter((row) => row.eligible)
      .reduce((sum, row) => sum + row.interest, 0);
    const lost = totalInterest - deductible;
    const taxRate = Number(slab) / 100;
    return {
      emi,
      rows,
      totalInterest,
      deductible,
      lost,
      taxSaved: deductible * taxRate * 1.04,
      firstYearDeduction: rows[0] ? rows[0].interest : 0,
      windowEnds: start + Math.min(tenureValue, ELIGIBLE_YEARS) - 1,
      totalPayment: principalValue + totalInterest,
      start,
    };
  }, [error, principalValue, rateValue, slab, startYear, tenureValue]);

  const report = useMemo(() => {
    if (!result) return "";
    return [
      "Section 80E Education Loan Interest Deduction",
      `Loan amount: ${money(principalValue)} at ${rateValue}% for ${tenureValue} years`,
      `Monthly EMI: ${money(result.emi)}  |  Total repayment: ${money(result.totalPayment)}`,
      `Repayment starts: ${fyLabel(result.start)}`,
      `Total interest over the loan: ${money(result.totalInterest)}`,
      `Interest deductible under Section 80E (first ${ELIGIBLE_YEARS} years): ${money(result.deductible)}`,
      `Interest outside the 8-year window: ${money(result.lost)}`,
      `First-year deduction: ${money(result.firstYearDeduction)}`,
      `Estimated tax saved at ${slab}% + 4% cess: ${money(result.taxSaved)}`,
      "Section 80E has no upper limit on the interest amount but runs for 8 assessment years from the year repayment begins, or until the interest is fully repaid, whichever is earlier. Principal repayment is not deductible, and the deduction is available under the old tax regime only.",
      "Informational estimate only — confirm with the Income Tax Department or a tax professional.",
    ].join("\n");
  }, [principalValue, rateValue, result, slab, tenureValue]);

  const copyResult = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setPrincipal(DEFAULTS.principal);
    setRate(DEFAULTS.rate);
    setTenure(DEFAULTS.tenure);
    setStartYear(DEFAULTS.startYear);
    setSlab(DEFAULTS.slab);
    setCopied(false);
  };

  const inputClass =
    "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
  const labelClass = "mb-1 block text-sm font-medium text-[var(--foreground)]";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Section 80E Education Loan Interest Deduction
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
            Section 80E lets you deduct the full interest on a higher-education loan for eight
            assessment years from the year repayment starts. Build your amortisation year by year
            and see how much interest actually lands inside that window.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Loan details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="e80-principal">
                  Loan amount (Rs)
                </label>
                <input
                  id="e80-principal"
                  className={inputClass}
                  inputMode="numeric"
                  value={principal}
                  onChange={(event) => setPrincipal(event.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="e80-rate">
                  Interest rate (% per year)
                </label>
                <input
                  id="e80-rate"
                  className={inputClass}
                  inputMode="decimal"
                  value={rate}
                  onChange={(event) => setRate(event.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="e80-tenure">
                  Repayment tenure (years)
                </label>
                <input
                  id="e80-tenure"
                  className={inputClass}
                  inputMode="numeric"
                  value={tenure}
                  onChange={(event) => setTenure(event.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="e80-start">
                  Repayment starts in
                </label>
                <select
                  id="e80-start"
                  className={inputClass}
                  value={startYear}
                  onChange={(event) => setStartYear(event.target.value)}
                >
                  {START_YEARS.map((year) => (
                    <option key={year} value={String(year)}>
                      {fyLabel(year)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="e80-slab">
                  Your income tax slab rate
                </label>
                <select
                  id="e80-slab"
                  className={inputClass}
                  value={slab}
                  onChange={(event) => setSlab(event.target.value)}
                >
                  {SLAB_RATES.map((value) => (
                    <option key={value} value={String(value)}>
                      {value}%
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error ? (
              <p
                role="alert"
                className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
              >
                {error}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={copyResult}
                disabled={!result}
                aria-label="Copy Section 80E deduction result to clipboard"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy result"}
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset all inputs"
                className="inline-flex min-h-11 items-center gap-2 rounded-md px-4 text-sm font-semibold ring-1 ring-[var(--border)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </section>

          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Deductible interest</h2>
            {result ? (
              <>
                <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                  Interest deductible under Section 80E
                </p>
                <p className="text-4xl font-bold tracking-tight text-[var(--primary)]">
                  {money(result.deductible)}
                </p>
                <p className="mt-1 text-sm text-[var(--success)]">
                  <GraduationCap className="mr-1 inline h-3.5 w-3.5" />
                  About {money(result.taxSaved)} of tax saved at {slab}% plus cess
                </p>

                <dl className="mt-5 space-y-2 text-sm">
                  <Row label="Monthly EMI" value={money(result.emi)} />
                  <Row label="Total interest over the loan" value={money(result.totalInterest)} />
                  <Row label="Interest outside the 8-year window" value={money(result.lost)} />
                  <Row label="First-year deduction" value={money(result.firstYearDeduction)} />
                  <Row
                    label="Eligibility window"
                    value={`${fyLabel(result.start)} to ${fyLabel(result.windowEnds)}`}
                  />
                  <Row label="Total repayment" value={money(result.totalPayment)} strong />
                </dl>

                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[320px] text-left text-xs">
                    <caption className="sr-only">
                      Year-wise interest and Section 80E eligibility
                    </caption>
                    <thead className="text-[var(--muted-foreground)]">
                      <tr>
                        <th scope="col" className="py-2 pr-2 font-medium">
                          Year
                        </th>
                        <th scope="col" className="py-2 pr-2 font-medium">
                          Interest paid
                        </th>
                        <th scope="col" className="py-2 font-medium">
                          80E
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.map((row) => (
                        <tr key={row.index} className="border-t border-[var(--border)]">
                          <td className="py-2 pr-2">{row.financialYear}</td>
                          <td className="py-2 pr-2 font-semibold">{money(row.interest)}</td>
                          <td
                            className={`py-2 font-semibold ${
                              row.eligible ? "text-[var(--success)]" : "text-[var(--muted-foreground)]"
                            }`}
                          >
                            {row.eligible ? "Deductible" : "Expired"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="mt-4 rounded-md bg-[var(--muted)] p-3 text-xs leading-5 text-[var(--muted-foreground)]">
                  There is no monetary ceiling on Section 80E, but only interest is deductible —
                  principal repayment is not. The benefit runs for 8 assessment years from the year
                  repayment begins, or until the interest is fully repaid if that happens sooner, and
                  is available under the old tax regime only.
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                Fix the highlighted input to see your deduction schedule.
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-2">
      <dt className="text-[var(--muted-foreground)]">{label}</dt>
      <dd className={strong ? "text-base font-bold" : "font-semibold"}>{value}</dd>
    </div>
  );
}
