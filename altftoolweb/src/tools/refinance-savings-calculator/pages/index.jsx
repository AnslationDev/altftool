"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeftRight,
  BarChart3,
  CalendarClock,
  Clipboard,
  Download,
  Gauge,
  PiggyBank,
  RefreshCw,
  ShieldCheck,
  Target,
  TrendingDown,
  Wallet,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const SAMPLE = {
  currentBalance: 2800000,
  currentRate: 10.5,
  remainingTenureYears: 14,
  newRate: 8.35,
  newTenureYears: 12,
  processingFee: 25000,
  legalCharges: 6500,
  valuationCharges: 3500,
  prepaymentPenaltyPercent: 0.5,
  cashback: 10000,
  monthlyExtraPayment: 0,
  taxBenefitRate: 0,
};

const PIE_COLORS = ["var(--info)", "var(--success)", "var(--warning)", "var(--danger)"];
const COMPARISON_CHART_INITIAL_DIMENSION = { width: 760, height: 300 };
const SAVINGS_CHART_INITIAL_DIMENSION = { width: 480, height: 250 };
const COST_CHART_INITIAL_DIMENSION = { width: 720, height: 280 };

function formatMoney(value, compact = false) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
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

function formatMonths(months) {
  const safeMonths = Math.max(0, Math.round(months || 0));
  const years = Math.floor(safeMonths / 12);
  const month = safeMonths % 12;
  if (years && month) return `${years}y ${month}m`;
  if (years) return `${years}y`;
  return `${month}m`;
}

function clampNumber(value, min = 0, max = 100000000000) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(Math.max(number, min), max);
}

function calculateEmi(principal, monthlyRate, months) {
  if (principal <= 0 || months <= 0) return 0;
  if (monthlyRate === 0) return principal / months;
  const factor = (1 + monthlyRate) ** months;
  return (principal * monthlyRate * factor) / (factor - 1);
}

function simulateLoan(principal, annualRate, months, extraPayment = 0) {
  const monthlyRate = annualRate / 100 / 12;
  let balance = clampNumber(principal);
  let emi = calculateEmi(balance, monthlyRate, Math.max(1, Math.round(months)));
  const rows = [];
  let totalInterest = 0;
  let totalPaid = 0;

  for (let month = 1; month <= months && balance > 0.5; month += 1) {
    const interest = balance * monthlyRate;
    const payment = Math.min(balance + interest, emi + clampNumber(extraPayment));
    const principalPaid = Math.max(0, payment - interest);
    balance = Math.max(0, balance + interest - payment);
    totalInterest += interest;
    totalPaid += payment;

    rows.push({
      month,
      label: `M${month}`,
      emi,
      payment,
      interest,
      principal: principalPaid,
      balance,
      totalInterest,
      totalPaid,
    });
  }

  const yearlyRows = [];
  for (let month = 12; month <= rows.length; month += 12) {
    const slice = rows.slice(month - 12, month);
    const last = slice[slice.length - 1];
    yearlyRows.push({
      year: month / 12,
      label: `Y${month / 12}`,
      balance: last.balance,
      interest: slice.reduce((sum, row) => sum + row.interest, 0),
      principal: slice.reduce((sum, row) => sum + row.principal, 0),
      totalInterest: last.totalInterest,
      totalPaid: last.totalPaid,
    });
  }

  if (rows.length && rows.length % 12 !== 0) {
    const lastYear = Math.ceil(rows.length / 12);
    const slice = rows.slice((lastYear - 1) * 12);
    const last = rows[rows.length - 1];
    yearlyRows.push({
      year: lastYear,
      label: `Y${lastYear}`,
      balance: last.balance,
      interest: slice.reduce((sum, row) => sum + row.interest, 0),
      principal: slice.reduce((sum, row) => sum + row.principal, 0),
      totalInterest: last.totalInterest,
      totalPaid: last.totalPaid,
    });
  }

  return {
    emi,
    months: rows.length,
    totalInterest,
    totalPaid,
    rows,
    yearlyRows,
  };
}

function calculateRefinance(values) {
  const balance = clampNumber(values.currentBalance, 0, 10000000000);
  const currentMonths = Math.max(1, Math.round(clampNumber(values.remainingTenureYears, 1, 40) * 12));
  const newMonths = Math.max(1, Math.round(clampNumber(values.newTenureYears, 1, 40) * 12));
  const currentRate = clampNumber(values.currentRate, 0, 60);
  const newRate = clampNumber(values.newRate, 0, 60);
  const extraPayment = clampNumber(values.monthlyExtraPayment, 0, 10000000);
  const processingFee = clampNumber(values.processingFee);
  const legalCharges = clampNumber(values.legalCharges);
  const valuationCharges = clampNumber(values.valuationCharges);
  const penalty = balance * (clampNumber(values.prepaymentPenaltyPercent, 0, 20) / 100);
  const cashback = clampNumber(values.cashback);
  const switchCost = Math.max(0, processingFee + legalCharges + valuationCharges + penalty - cashback);
  const current = simulateLoan(balance, currentRate, currentMonths, 0);
  const refinance = simulateLoan(balance, newRate, newMonths, extraPayment);
  const interestSavedBeforeCost = current.totalInterest - refinance.totalInterest;
  const netSavings = interestSavedBeforeCost - switchCost;
  const emiDifference = current.emi - refinance.emi;
  const taxBenefitRate = clampNumber(values.taxBenefitRate, 0, 60) / 100;
  const taxBenefitLost = Math.max(0, interestSavedBeforeCost * taxBenefitRate);
  const netAfterTaxSavings = netSavings - taxBenefitLost;
  const breakEvenMonth = emiDifference > 0 ? Math.ceil(switchCost / emiDifference) : null;
  const monthsChanged = current.months - refinance.months;
  const savingsRate = current.totalInterest > 0 ? (interestSavedBeforeCost / current.totalInterest) * 100 : 0;

  const compareRows = [];
  const maxYears = Math.max(current.yearlyRows.length, refinance.yearlyRows.length);
  for (let index = 0; index < maxYears; index += 1) {
    compareRows.push({
      label: `Y${index + 1}`,
      currentBalance: current.yearlyRows[index]?.balance || 0,
      refinanceBalance: refinance.yearlyRows[index]?.balance || 0,
      currentInterest: current.yearlyRows[index]?.totalInterest || current.totalInterest,
      refinanceInterest: refinance.yearlyRows[index]?.totalInterest || refinance.totalInterest,
    });
  }

  const costRows = [
    { name: "Processing", value: processingFee },
    { name: "Legal", value: legalCharges },
    { name: "Valuation", value: valuationCharges },
    { name: "Penalty", value: penalty },
  ].filter((item) => item.value > 0);

  const pieData = [
    { name: "New Interest", value: refinance.totalInterest },
    { name: "Interest Saved", value: Math.max(0, interestSavedBeforeCost) },
    { name: "Switch Cost", value: switchCost },
    { name: "Tax Impact", value: taxBenefitLost },
  ].filter((item) => item.value > 0);

  return {
    current,
    refinance,
    compareRows,
    costRows,
    pieData,
    switchCost,
    penalty,
    interestSavedBeforeCost,
    netSavings,
    netAfterTaxSavings,
    emiDifference,
    breakEvenMonth,
    monthsChanged,
    savingsRate,
    taxBenefitLost,
  };
}

function buildSummary(values, metrics) {
  return [
    "Refinance Savings Calculator Summary",
    `Current balance: ${formatMoney(values.currentBalance)}`,
    `Current rate: ${formatNumber(values.currentRate, 2)}%`,
    `New rate: ${formatNumber(values.newRate, 2)}%`,
    `Current EMI: ${formatMoney(metrics.current.emi)}`,
    `New EMI: ${formatMoney(metrics.refinance.emi)}`,
    `Monthly EMI change: ${formatMoney(metrics.emiDifference)}`,
    `Interest saved before costs: ${formatMoney(metrics.interestSavedBeforeCost)}`,
    `Switching cost: ${formatMoney(metrics.switchCost)}`,
    `Net savings: ${formatMoney(metrics.netSavings)}`,
    `Break-even: ${metrics.breakEvenMonth ? formatMonths(metrics.breakEvenMonth) : "No monthly EMI break-even"}`,
  ].join("\n");
}

function exportCsv(values, metrics) {
  const rows = [
    ["Year", "Current Balance", "Refinance Balance", "Current Interest", "Refinance Interest"],
    ...metrics.compareRows.map((row, index) => [
      index + 1,
      Math.round(row.currentBalance),
      Math.round(row.refinanceBalance),
      Math.round(row.currentInterest),
      Math.round(row.refinanceInterest),
    ]),
  ];
  const csv = [
    ["Current Balance", values.currentBalance],
    ["Current Rate", values.currentRate],
    ["New Rate", values.newRate],
    ["Net Savings", Math.round(metrics.netSavings)],
    ["Switch Cost", Math.round(metrics.switchCost)],
    [],
    ...rows,
  ]
    .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "refinance-savings.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function Field({ label, value, onChange, suffix, min = 0, max = 100000000000, step = 1 }) {
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

function Panel({ title, eyebrow, icon: Icon, action, children, className = "" }) {
  return (
    <section className={`min-w-0 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm sm:p-5 xl:p-6 ${className}`}>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {Icon ? (
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--primary)]">
              <Icon className="h-5 w-5" />
            </div>
          ) : null}
          <div className="min-w-0">
            {eyebrow ? <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">{eyebrow}</p> : null}
            <h2 className="break-words text-lg font-extrabold text-[var(--foreground)]">{title}</h2>
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function StatCard({ label, value, detail, icon: Icon, tone = "text-[var(--primary)]" }) {
  return (
    <article className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm sm:p-5 xl:p-6">
      <div className="flex min-w-0 items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] sm:h-11 sm:w-11">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div className="min-w-0">
          <p className="break-words text-[0.68rem] font-bold uppercase tracking-wide text-[var(--muted-foreground)] sm:text-xs">{label}</p>
          <p className={`tool-money-value mt-1 break-words text-xl leading-tight sm:text-2xl xl:text-3xl ${tone}`}>{value}</p>
          {detail ? <p className="mt-1 hidden break-words text-sm leading-relaxed text-[var(--muted-foreground)] sm:block">{detail}</p> : null}
        </div>
      </div>
    </article>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <p className="break-words text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-2 break-words text-lg font-black text-[var(--foreground)]">{value}</p>
    </div>
  );
}

function ChartBox({ title, subtitle, icon: Icon, children }) {
  return (
    <Panel title={title} eyebrow={subtitle} icon={Icon}>
      <div className="h-[300px] min-w-0 sm:h-[340px]">{children}</div>
    </Panel>
  );
}

export default function RefinanceSavingsCalculator() {
  const [values, setValues] = useState(SAMPLE);
  const [copied, setCopied] = useState(false);
  const metrics = useMemo(() => calculateRefinance(values), [values]);
  const summary = useMemo(() => buildSummary(values, metrics), [values, metrics]);
  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }));

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-[1360px] px-4 pb-12 pt-8 text-[var(--foreground)] sm:px-6 sm:pt-10 lg:px-8">
      <header className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[linear-gradient(135deg,var(--section-highlight),var(--background)_52%,rgba(59,130,246,0.08))] p-5 text-center shadow-sm sm:p-7 xl:p-8">
        <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:mb-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600">
            <RefreshCw className="h-3.5 w-3.5" />
            Refinance Planner
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-xs font-bold text-[var(--foreground)]">
            <ShieldCheck className="h-3.5 w-3.5 text-[var(--primary)]" />
            Break-even aware
          </span>
        </div>
        <h1 className="heading mx-auto max-w-5xl text-center text-4xl sm:text-5xl">Refinance Savings Calculator</h1>
        <p className="description mx-auto mt-3 max-w-4xl text-center text-sm sm:text-base">
          Compare your current loan with a refinance offer, including new EMI, interest saved, switching cost, break-even month, tax impact, and payoff timeline.
        </p>
      </header>

      <section className="mt-5 grid gap-4 sm:mt-8 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Loan Refinance Setup" eyebrow="Current vs new offer" icon={ArrowLeftRight}>
          <div className="tool-form-grid">
            <Field label="Current Outstanding Balance" value={values.currentBalance} onChange={(value) => update("currentBalance", value)} />
            <Field label="Current Interest Rate" value={values.currentRate} onChange={(value) => update("currentRate", value)} suffix="%" max={60} step={0.05} />
            <Field label="Remaining Tenure" value={values.remainingTenureYears} onChange={(value) => update("remainingTenureYears", value)} suffix="yrs" min={1} max={40} />
            <Field label="New Interest Rate" value={values.newRate} onChange={(value) => update("newRate", value)} suffix="%" max={60} step={0.05} />
            <Field label="New Tenure" value={values.newTenureYears} onChange={(value) => update("newTenureYears", value)} suffix="yrs" min={1} max={40} />
            <Field label="Monthly Extra Payment" value={values.monthlyExtraPayment} onChange={(value) => update("monthlyExtraPayment", value)} />
            <Field label="Processing Fee" value={values.processingFee} onChange={(value) => update("processingFee", value)} />
            <Field label="Legal Charges" value={values.legalCharges} onChange={(value) => update("legalCharges", value)} />
            <Field label="Valuation Charges" value={values.valuationCharges} onChange={(value) => update("valuationCharges", value)} />
            <Field label="Prepayment Penalty" value={values.prepaymentPenaltyPercent} onChange={(value) => update("prepaymentPenaltyPercent", value)} suffix="%" max={20} step={0.05} />
            <Field label="Cashback / Waiver" value={values.cashback} onChange={(value) => update("cashback", value)} />
            <Field label="Tax Benefit Impact" value={values.taxBenefitRate} onChange={(value) => update("taxBenefitRate", value)} suffix="%" max={60} step={0.5} />
          </div>
          <div className="tool-action-grid mt-5">
            <button className="btn-primary w-full" type="button" onClick={copySummary}>
              <Clipboard />
              {copied ? "Copied" : "Copy Summary"}
            </button>
            <button className="btn-secondary w-full" type="button" onClick={() => exportCsv(values, metrics)}>
              <Download />
              Export CSV
            </button>
            <button className="btn-secondary w-full" type="button" onClick={() => setValues(SAMPLE)}>
              <RefreshCw />
              Load Sample
            </button>
          </div>
        </Panel>

        <Panel title="Refinance Verdict" eyebrow={metrics.netAfterTaxSavings > 0 ? "Savings opportunity" : "Review costs"} icon={Target}>
          <div className="grid gap-4">
            <MiniMetric label="Current EMI" value={formatMoney(metrics.current.emi)} />
            <MiniMetric label="New EMI" value={formatMoney(metrics.refinance.emi)} />
            <MiniMetric label="EMI Difference" value={formatMoney(metrics.emiDifference)} />
            <MiniMetric label="Break-even Month" value={metrics.breakEvenMonth ? formatMonths(metrics.breakEvenMonth) : "N/A"} />
          </div>
        </Panel>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 xl:gap-5">
        <StatCard label="Net Savings" value={formatMoney(metrics.netAfterTaxSavings)} detail={`Before tax impact: ${formatMoney(metrics.netSavings)}`} icon={PiggyBank} tone={metrics.netAfterTaxSavings >= 0 ? "text-emerald-600" : "text-red-600"} />
        <StatCard label="Interest Saved" value={formatMoney(metrics.interestSavedBeforeCost)} detail={`${formatNumber(metrics.savingsRate, 1)}% lower interest`} icon={TrendingDown} tone="text-emerald-600" />
        <StatCard label="Switching Cost" value={formatMoney(metrics.switchCost)} detail={`Penalty included: ${formatMoney(metrics.penalty)}`} icon={Wallet} tone="text-amber-600" />
        <StatCard label="Tenure Change" value={formatMonths(Math.abs(metrics.monthsChanged))} detail={metrics.monthsChanged >= 0 ? "Faster payoff" : "Longer payoff"} icon={CalendarClock} tone={metrics.monthsChanged >= 0 ? "text-blue-600" : "text-amber-600"} />
      </section>

      <section className="mt-6 grid gap-4 xl:gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ChartBox title="Balance Comparison" subtitle="Current loan vs refinance" icon={BarChart3}>
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={300}
            initialDimension={COMPARISON_CHART_INITIAL_DIMENSION}
          >
            <AreaChart data={metrics.compareRows}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
              <YAxis tickFormatter={(value) => formatMoney(value, true)} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} width={68} />
              <Tooltip formatter={(value) => formatMoney(value)} />
              <Area type="monotone" dataKey="currentBalance" name="Current Balance" stroke="var(--danger)" fill="var(--danger)" fillOpacity={0.12} />
              <Area type="monotone" dataKey="refinanceBalance" name="Refinance Balance" stroke="var(--info)" fill="var(--info)" fillOpacity={0.16} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="Interest Tracking" subtitle="Cumulative interest paid" icon={Gauge}>
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={300}
            initialDimension={COMPARISON_CHART_INITIAL_DIMENSION}
          >
            <AreaChart data={metrics.compareRows}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
              <YAxis tickFormatter={(value) => formatMoney(value, true)} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} width={68} />
              <Tooltip formatter={(value) => formatMoney(value)} />
              <Area type="monotone" dataKey="currentInterest" name="Current Interest" stroke="var(--warning)" fill="var(--warning)" fillOpacity={0.14} />
              <Area type="monotone" dataKey="refinanceInterest" name="Refinance Interest" stroke="var(--success)" fill="var(--success)" fillOpacity={0.14} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartBox>
      </section>

      <section className="mt-6 grid gap-4 xl:gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel title="Savings Composition" eyebrow="New loan outcome" icon={ShieldCheck}>
          <div className="h-[250px] min-w-0">
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              minHeight={250}
              initialDimension={SAVINGS_CHART_INITIAL_DIMENSION}
            >
              <PieChart>
                <Pie data={metrics.pieData} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="82%" paddingAngle={3}>
                  {metrics.pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatMoney(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="tool-compact-grid mt-4">
            <MiniMetric label="Current Total Interest" value={formatMoney(metrics.current.totalInterest)} />
            <MiniMetric label="Refinance Interest" value={formatMoney(metrics.refinance.totalInterest)} />
          </div>
        </Panel>

        <Panel title="Switching Cost Breakdown" eyebrow="Fees, penalties, and waivers" icon={Zap}>
          <div className="h-[280px] min-w-0">
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              minHeight={280}
              initialDimension={COST_CHART_INITIAL_DIMENSION}
            >
              <BarChart data={metrics.costRows}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <YAxis tickFormatter={(value) => formatMoney(value, true)} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} width={68} />
                <Tooltip formatter={(value) => formatMoney(value)} />
                <Bar dataKey="value" name="Cost" radius={[8, 8, 0, 0]}>
                  {metrics.costRows.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </section>

      <Panel title="Year-wise Refinance Schedule" eyebrow="Balance and interest comparison" icon={BarChart3} className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th className="border-b border-[var(--border)] px-3 py-3">Year</th>
                <th className="border-b border-[var(--border)] px-3 py-3">Current Balance</th>
                <th className="border-b border-[var(--border)] px-3 py-3">Refinance Balance</th>
                <th className="border-b border-[var(--border)] px-3 py-3">Current Interest</th>
                <th className="border-b border-[var(--border)] px-3 py-3">Refinance Interest</th>
                <th className="border-b border-[var(--border)] px-3 py-3">Interest Gap</th>
              </tr>
            </thead>
            <tbody>
              {metrics.compareRows.map((row, index) => (
                <tr key={row.label} className="text-[var(--foreground)]">
                  <td className="border-b border-[var(--border)] px-3 py-3 font-bold">Year {index + 1}</td>
                  <td className="border-b border-[var(--border)] px-3 py-3">{formatMoney(row.currentBalance)}</td>
                  <td className="border-b border-[var(--border)] px-3 py-3 font-bold">{formatMoney(row.refinanceBalance)}</td>
                  <td className="border-b border-[var(--border)] px-3 py-3">{formatMoney(row.currentInterest)}</td>
                  <td className="border-b border-[var(--border)] px-3 py-3">{formatMoney(row.refinanceInterest)}</td>
                  <td className="border-b border-[var(--border)] px-3 py-3 font-bold text-emerald-600">
                    {formatMoney(row.currentInterest - row.refinanceInterest)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </main>
  );
}
