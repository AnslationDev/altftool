"use client";

import { useMemo, useState } from "react";
import {
  ArrowRightLeft,
  BarChart as BarChartIcon,
  Calendar,
  Clipboard,
  Download,
  Landmark,
  PiggyBank,
  RefreshCw,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ResponsiveContainer from "@/components/charts/SafeResponsiveContainer";
import { safeCopyText } from "@/shared/utils/clipboard";
import Description from "../components/Description";

const SAMPLE = {
  loanAmount: 5000000,
  interestRate: 8.5,
  loanTerm: 20,
  prepaymentAmount: 200000,
  prepaymentFrequency: "one-time",
  currency: "INR",
};

const FREQUENCY_OPTIONS = [
  { label: "One-Time", value: "one-time" },
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Half-Yearly", value: "half-yearly" },
  { label: "Yearly", value: "yearly" },
];

const CURRENCY_OPTIONS = [
  { label: "INR ₹", value: "INR" },
  { label: "USD $", value: "USD" },
  { label: "EUR €", value: "EUR" },
  { label: "GBP £", value: "GBP" },
];

const PIE_COLORS = ["#2563eb", "#059669", "#f59e0b"];

function formatMoney(value, compact = false, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
    notation: compact ? "compact" : "standard",
  }).format(Number.isFinite(value) ? value : 0);
}

function formatNumber(value, digits = 1) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(Number.isFinite(value) ? value : 0);
}

function clampNumber(value, min = 0, max = 100000000) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(Math.max(min, number), max);
}

function calculateLoan(values) {
  const P = clampNumber(values.loanAmount, 0, 1000000000);
  const annualRate = clampNumber(values.interestRate, 0, 40) / 100;
  const termMonths = Math.max(1, Math.round(clampNumber(values.loanTerm, 1, 50) * 12));
  const monthlyRate = annualRate / 12;

  if (P <= 0 || monthlyRate <= 0 || termMonths <= 0) {
    return {
      emi: 0,
      totalInterestNoPrepay: 0,
      totalPaymentNoPrepay: 0,
      totalInterestWithPrepay: 0,
      totalInterestSaved: 0,
      totalPaymentWithPrepay: 0,
      timeSavedMonths: 0,
      newClosureMonth: termMonths,
      scheduleNoPrepay: [],
      scheduleWithPrepay: [],
      originalTenureMonths: termMonths,
    };
  }

  const emi = (P * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);

  // Without prepayment
  const scheduleNoPrepay = [];
  let balance = P;
  let totalInterestNoPrepay = 0;
  for (let month = 1; month <= termMonths && balance > 0; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = emi - interestPayment;
    balance -= principalPayment;
    totalInterestNoPrepay += interestPayment;
    if (balance < 0) balance = 0;
    scheduleNoPrepay.push({
      month,
      emi: Math.round(emi),
      principal: Math.round(principalPayment),
      interest: Math.round(interestPayment),
      balance: Math.round(balance),
      totalInterest: Math.round(totalInterestNoPrepay),
    });
    if (balance <= 0) break;
  }

  const prepAmount = clampNumber(values.prepaymentAmount, 0, P);
  let prepFreq = values.prepaymentFrequency;

  let monthsBetweenPrepay = 0;
  let prepayStartMonth = 1;
  if (prepFreq === "monthly") monthsBetweenPrepay = 1;
  else if (prepFreq === "quarterly") monthsBetweenPrepay = 3;
  else if (prepFreq === "half-yearly") monthsBetweenPrepay = 6;
  else if (prepFreq === "yearly") monthsBetweenPrepay = 12;
  else monthsBetweenPrepay = 0; // one-time

  // With prepayment
  const scheduleWithPrepay = [];
  let balance2 = P;
  let totalInterestWithPrepay = 0;
  let prepayMonthsUsed = 0;

  for (let month = 1; month <= termMonths && balance2 > 0; month++) {
    const interestPayment = balance2 * monthlyRate;
    const principalPayment = emi - interestPayment;
    balance2 -= principalPayment;
    totalInterestWithPrepay += interestPayment;

    let prepayThisMonth = 0;
    if (monthsBetweenPrepay > 0 && (month - prepayStartMonth) % monthsBetweenPrepay === 0 && balance2 > 0) {
      prepayThisMonth = prepAmount;
    } else if (monthsBetweenPrepay === 0 && month === prepayStartMonth) {
      prepayThisMonth = prepAmount;
    }

    if (prepayThisMonth > 0 && balance2 > 0) {
      const actualPrepay = Math.min(prepayThisMonth, balance2);
      balance2 -= actualPrepay;
      prepayMonthsUsed += 1;
    }

    if (balance2 < 0) balance2 = 0;

    scheduleWithPrepay.push({
      month,
      emi: Math.round(emi),
      principal: Math.round(principalPayment + (prepayThisMonth > 0 ? Math.min(prepayThisMonth, balance2 + (prepayThisMonth > 0 ? 0 : 0)) : 0)),
      interest: Math.round(interestPayment),
      prepayment: Math.round(prepayThisMonth),
      balance: Math.round(balance2),
      totalInterest: Math.round(totalInterestWithPrepay),
    });

    if (balance2 <= 0) break;
  }

  const totalInterestSaved = Math.round(totalInterestNoPrepay - totalInterestWithPrepay);
  const timeSavedMonths = termMonths - scheduleWithPrepay.length;

  return {
    emi: Math.round(emi),
    totalInterestNoPrepay: Math.round(totalInterestNoPrepay),
    totalPaymentNoPrepay: Math.round(P + totalInterestNoPrepay),
    totalInterestWithPrepay: Math.round(totalInterestWithPrepay),
    totalInterestSaved,
    totalPaymentWithPrepay: Math.round(P + totalInterestWithPrepay),
    timeSavedMonths,
    newClosureMonth: scheduleWithPrepay.length,
    scheduleNoPrepay,
    scheduleWithPrepay,
    originalTenureMonths: termMonths,
  };
}

function buildSummary(values, metrics) {
  return [
    "Loan Prepayment Savings Report",
    `Loan Amount: ${formatMoney(values.loanAmount, false, values.currency)}`,
    `Interest Rate: ${formatNumber(values.interestRate, 2)}%`,
    `Original Tenure: ${values.loanTerm} years (${metrics.originalTenureMonths} months)`,
    `Monthly EMI: ${formatMoney(metrics.emi, false, values.currency)}`,
    `Prepayment Amount: ${formatMoney(values.prepaymentAmount, false, values.currency)}`,
    `Prepayment Frequency: ${values.prepaymentFrequency}`,
    "",
    "--- Without Prepayment ---",
    `Total Interest: ${formatMoney(metrics.totalInterestNoPrepay, false, values.currency)}`,
    `Total Payment: ${formatMoney(metrics.totalPaymentNoPrepay, false, values.currency)}`,
    "",
    "--- With Prepayment ---",
    `Total Interest: ${formatMoney(metrics.totalInterestWithPrepay, false, values.currency)}`,
    `Total Payment: ${formatMoney(metrics.totalPaymentWithPrepay, false, values.currency)}`,
    `Interest Saved: ${formatMoney(metrics.totalInterestSaved, false, values.currency)}`,
    `Time Saved: ${metrics.timeSavedMonths} months`,
    `New Closure: Month ${metrics.newClosureMonth}`,
  ].join("\n");
}

function exportCsv(values, metrics) {
  const rows = [
    ["Month", "Without Prepay - Balance", "With Prepay - Balance", "Without Prepay - Interest", "With Prepay - Interest", "Prepayment Amount"],
  ];
  const maxLen = Math.max(metrics.scheduleNoPrepay.length, metrics.scheduleWithPrepay.length);
  for (let i = 0; i < maxLen; i++) {
    const npRow = metrics.scheduleNoPrepay[i] || { balance: 0, interest: 0 };
    const wpRow = metrics.scheduleWithPrepay[i] || { balance: 0, interest: 0, prepayment: 0 };
    rows.push([i + 1, npRow.balance, wpRow.balance, npRow.interest, wpRow.interest, wpRow.prepayment]);
  }
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "loan-prepayment-comparison.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function Field({ label, value, onChange, suffix, min = 0, max = 100000000, step = 1 }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block break-words text-sm font-semibold text-[var(--foreground)]">{label}</span>
      <div className="flex min-w-0 overflow-hidden rounded-md border border-[var(--border)] bg-[var(--background)] focus-within:border-[var(--primary)] focus-within:shadow-[var(--anslation-ds-focus-ring)]">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(clampNumber(event.target.value, min, max))}
          className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-[var(--foreground)] outline-none"
        />
        {suffix ? (
          <span className="flex shrink-0 items-center border-l border-[var(--border)] px-3 text-sm font-semibold text-[var(--muted-foreground)]">
            {suffix}
          </span>
        ) : null}
      </div>
    </label>
  );
}

function MetricCard({ icon: Icon, label, value, detail, tone = "default" }) {
  const toneClass =
    tone === "good"
      ? "bg-emerald-500/10 text-emerald-600"
      : tone === "warn"
        ? "bg-amber-500/10 text-amber-600"
        : tone === "violet"
          ? "bg-violet-500/10 text-violet-600"
          : "bg-[var(--section-highlight)] text-[var(--primary)]";

  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex min-w-0 items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="break-words text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
          <p className="tool-money-value mt-1 text-[var(--foreground)]">{value}</p>
          <p className="mt-1 break-words text-sm leading-5 text-[var(--muted-foreground)]">{detail}</p>
        </div>
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-sm shadow-[var(--anslation-ds-shadow-md)]">
      <p className="font-semibold text-[var(--foreground)]">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="text-[var(--muted-foreground)]">
          {item.name}: {item.value}
        </p>
      ))}
    </div>
  );
}

export default function LoanPrepaymentSavings() {
  const [values, setValues] = useState(SAMPLE);
  const [copied, setCopied] = useState(false);

  const metrics = useMemo(() => calculateLoan(values), [values]);

  const updateValue = (key, value) => setValues((prev) => ({ ...prev, [key]: value }));

  const copySummary = async () => {
    const success = await safeCopyText(buildSummary(values, metrics));
    if (!success) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const reset = () => setValues(SAMPLE);

  const chartData = useMemo(() => {
    const maxLen = Math.max(metrics.scheduleNoPrepay.length, metrics.scheduleWithPrepay.length, 60);
    const data = [];
    for (let i = 0; i < maxLen; i++) {
      const np = metrics.scheduleNoPrepay[i] || { balance: 0, interest: 0 };
      const wp = metrics.scheduleWithPrepay[i] || { balance: 0, interest: 0, prepayment: 0 };
      const label = i % 12 === 0 || i === maxLen - 1 ? `Y${Math.floor(i / 12) + 1}` : "";
      data.push({
        month: i + 1,
        label,
        withoutPrepay: np.balance,
        withPrepay: wp.balance,
        interestNoPrepay: np.interest,
        interestWithPrepay: wp.interest,
        prepayment: wp.prepayment,
      });
    }
    return data;
  }, [metrics]);

  const pieSplit = useMemo(
    () =>
      [
        { name: "Principal", value: values.loanAmount, color: PIE_COLORS[0] },
        { name: "Interest (Saved)", value: metrics.totalInterestSaved, color: PIE_COLORS[1] },
        {
          name: "Interest (Paid)",
          value: Math.max(0, metrics.totalInterestNoPrepay - metrics.totalInterestSaved),
          color: PIE_COLORS[2],
        },
      ].filter((item) => item.value > 0),
    [values.loanAmount, metrics.totalInterestSaved, metrics.totalInterestNoPrepay],
  );

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)] sm:p-5">
          <div className="grid min-w-0 gap-5 2xl:grid-cols-[minmax(0,1fr)_minmax(260px,420px)] 2xl:items-center">
            <div className="min-w-0">
              <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full bg-[var(--section-highlight)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
                <Landmark className="h-4 w-4 shrink-0" />
                <span className="min-w-0 break-words">Loan Planner</span>
              </div>
              <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">
                Loan Prepayment Savings
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted-foreground)]">
                See how extra loan payments reduce interest costs and shorten tenure.
                Compare one-time, monthly, quarterly, or custom prepayment plans side by side.
              </p>
            </div>
            <div className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Total interest saved</p>
              <p className="tool-money-value tool-hero-value mt-2 text-[var(--primary)]">
                {formatMoney(metrics.totalInterestSaved, false, values.currency)}
              </p>
              <p className="mt-2 break-words text-sm leading-6 text-[var(--muted-foreground)]">
                Tenure reduced by {metrics.timeSavedMonths} months ({(metrics.timeSavedMonths / 12).toFixed(1)} years)
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <MetricCard
            icon={PiggyBank}
            label="Monthly EMI"
            value={formatMoney(metrics.emi, false, values.currency)}
            detail={`${values.loanTerm} year original tenure`}
          />
          <MetricCard
            icon={TrendingDown}
            label="Interest Saved"
            value={formatMoney(metrics.totalInterestSaved, false, values.currency)}
            detail={`From ${values.prepaymentFrequency} prepayment plan`}
            tone="good"
          />
          <MetricCard
            icon={ShieldCheck}
            label="Total Interest Paid"
            value={formatMoney(metrics.totalInterestWithPrepay, false, values.currency)}
            detail={`vs ${formatMoney(metrics.totalInterestNoPrepay, false, values.currency)} without prepayment`}
            tone="default"
          />
          <MetricCard
            icon={Calendar}
            label="Time Saved"
            value={`${metrics.timeSavedMonths} months`}
            detail={`Closes month ${metrics.newClosureMonth} of ${metrics.originalTenureMonths}`}
            tone="violet"
          />
        </section>

        <section className="mt-6 grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,430px)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-5">
            <section className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)] sm:p-5">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">Loan Details</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                Enter your loan parameters and prepayment plan.
              </p>

              <div className="mt-5 space-y-4">
                <Field
                  label="Loan Amount"
                  value={values.loanAmount}
                  onChange={(value) => updateValue("loanAmount", value)}
                  suffix=""
                  max={100000000}
                  step={100000}
                />

                <div className="grid min-w-0 gap-4 sm:grid-cols-2 2xl:grid-cols-1">
                  <Field
                    label="Interest Rate"
                    value={values.interestRate}
                    onChange={(value) => updateValue("interestRate", value)}
                    suffix="%"
                    max={40}
                    step={0.05}
                  />
                  <Field
                    label="Loan Term (Years)"
                    value={values.loanTerm}
                    onChange={(value) => updateValue("loanTerm", value)}
                    max={50}
                  />
                </div>

                <div className="grid min-w-0 gap-4 sm:grid-cols-2 2xl:grid-cols-1">
                  <label className="block min-w-0">
                    <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Prepayment Frequency</span>
                    <select
                      value={values.prepaymentFrequency}
                      onChange={(event) => updateValue("prepaymentFrequency", event.target.value)}
                      className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                    >
                      {FREQUENCY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block min-w-0">
                    <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Currency</span>
                    <select
                      value={values.currency}
                      onChange={(event) => updateValue("currency", event.target.value)}
                      className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                    >
                      {CURRENCY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                  <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">Prepayment Amount</h3>
                  <Field
                    label=""
                    value={values.prepaymentAmount}
                    onChange={(value) => updateValue("prepaymentAmount", value)}
                    suffix=""
                    max={values.loanAmount}
                    step={5000}
                  />
                  {values.prepaymentAmount > values.loanAmount && (
                    <p className="mt-2 text-xs text-amber-600">Prepayment cannot exceed loan amount</p>
                  )}
                </div>
              </div>

              <div className="tool-action-grid mt-5">
                <button type="button" onClick={reset} className="btn-secondary">
                  <RefreshCw className="h-4 w-4" />
                  Reset
                </button>
                <button type="button" onClick={copySummary} className="btn-secondary">
                  <Clipboard className="h-4 w-4" />
                  {copied ? "Copied" : "Copy Summary"}
                </button>
                <button type="button" onClick={() => exportCsv(values, metrics)} className="btn-primary">
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              </div>
            </section>

            <section className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)] sm:p-5">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">Payment Signals</h2>
              <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-3 2xl:grid-cols-1">
                {[
                  ["Original EMI", formatMoney(metrics.emi, false, values.currency), "Fixed monthly payment"],
                  ["New Tenure", `${metrics.newClosureMonth} months`, `Reduced by ${metrics.timeSavedMonths} months`],
                  ["Total Paid", formatMoney(metrics.totalPaymentWithPrepay, false, values.currency), `vs ${formatMoney(metrics.totalPaymentNoPrepay, false, values.currency)}`],
                ].map(([label, value, detail]) => (
                  <div key={label} className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
                    <p className="mt-2 break-words text-lg font-bold text-[var(--foreground)]">{value}</p>
                    <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">{detail}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="min-w-0 space-y-6">
            <section className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)] sm:p-5">
              <div className="mb-4 flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--section-highlight)] text-[var(--primary)]">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold text-[var(--foreground)]">Remaining Balance</h2>
                  <p className="text-sm text-[var(--muted-foreground)]">Without vs with prepayment over time</p>
                </div>
              </div>
              <div className="h-72 min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="withoutVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.03} />
                      </linearGradient>
                      <linearGradient id="withVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="label" minTickGap={18} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                    <YAxis width={58} tickFormatter={(val) => formatMoney(val, true, values.currency)} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-sm shadow-[var(--anslation-ds-shadow-md)]">
                            <p className="font-semibold text-[var(--foreground)]">Month {label || ""}</p>
                            {payload.map((item) => (
                              <p key={item.dataKey} className="text-[var(--muted-foreground)]">
                                {item.name}: {formatMoney(item.value, false, values.currency)}
                              </p>
                            ))}
                          </div>
                        );
                      }}
                    />
                    <Area type="monotone" dataKey="withoutPrepay" name="Without Prepay" stroke="#94a3b8" fill="url(#withoutVal)" strokeWidth={2} />
                    <Area type="monotone" dataKey="withPrepay" name="With Prepay" stroke="#2563eb" fill="url(#withVal)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(260px,360px)]">
              <div className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)] sm:p-5">
                <div className="mb-4 flex min-w-0 items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--section-highlight)] text-[var(--primary)]">
                    <BarChartIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-[var(--foreground)]">Interest Comparison</h2>
                    <p className="text-sm text-[var(--muted-foreground)]">Monthly interest with and without prepayment</p>
                  </div>
                </div>
                <div className="h-64 min-w-0">
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <RechartsBarChart data={chartData.filter((_, i) => i % 6 === 0 || i === chartData.length - 1)} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                      <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                      <YAxis width={56} tickFormatter={(val) => formatMoney(val, true, values.currency)} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          return (
                            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-sm shadow-[var(--anslation-ds-shadow-md)]">
                              <p className="font-semibold text-[var(--foreground)]">Month {label || ""}</p>
                              {payload.map((item) => (
                                <p key={item.dataKey} className="text-[var(--muted-foreground)]">
                                  {item.name}: {formatMoney(item.value, false, values.currency)}
                                </p>
                              ))}
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="interestNoPrepay" name="Without Prepay" fill="#94a3b8" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="interestWithPrepay" name="With Prepay" fill="#059669" radius={[8, 8, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)] sm:p-5">
                <h2 className="text-xl font-semibold text-[var(--foreground)]">Payment Split</h2>
                <div className="mt-4 space-y-3">
                  {[
                    ["Principal", values.loanAmount, "bg-blue-600"],
                    ["Interest (Saved)", metrics.totalInterestSaved, "bg-emerald-600"],
                    ["Interest (Paid)", Math.max(0, metrics.totalInterestNoPrepay - metrics.totalInterestSaved), "bg-amber-500"],
                  ].map(([label, amount, color]) => {
                    const total = values.loanAmount + metrics.totalInterestNoPrepay;
                    const percent = total > 0 ? (amount / total) * 100 : 0;
                    return (
                      <div key={label} className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                        <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                          <p className="break-words text-sm font-semibold text-[var(--foreground)]">{label}</p>
                          <p className="break-words text-sm font-bold text-[var(--foreground)]">{formatMoney(amount, false, values.currency)}</p>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
                          <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, percent)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)] sm:p-5">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">Schedule Preview</h2>
              <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {metrics.scheduleWithPrepay.filter((row, i) => i % Math.max(1, Math.floor(metrics.scheduleWithPrepay.length / 8)) === 0 || row.month === 1 || row.balance <= 0).slice(0, 9).map((row) => (
                  <div key={row.month} className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                      {row.month === 1 ? "Start" : `Month ${row.month}`}
                    </p>
                    <p className="mt-2 break-words text-lg font-bold text-[var(--foreground)]">{formatMoney(row.balance, false, values.currency)}</p>
                    {row.prepayment > 0 && (
                      <p className="mt-1 break-words text-sm text-emerald-600">
                        Prepay {formatMoney(row.prepayment, false, values.currency)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>

        <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-700">
          Results are estimates. Actual savings depend on lender prepayment policies, penalties, and interest recalculation method.
        </div>
      </div>
      <Description />
    </main>
  );
}


