"use client";

import { useState, useCallback } from "react";
import {
  Percent,
  Calculator,
  Info,
  RefreshCw,
  Download,
  TrendingUp,
} from "lucide-react";

const SLUG = "loan-prepayment-calculator";
const PASCAL = "LoanPrepaymentCalculator";
const ICON = "Calculator";
const ICON_COLOR = "text-(--primary)";
const NAME = "Loan Prepayment Calculator";

export default function LoanPrepaymentCalculator() {
  const [result, setResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-(--background)">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-(--primary)/10">
            <Percent className="h-8 w-8 text-(--primary)" />
          </div>
          <h1 className="text-3xl font-bold text-(--foreground) md:text-4xl">
            Loan Prepayment Calculator
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-(--muted-foreground)">
            Compare your loan with and without prepayments. See how extra payments reduce your tenure and total interest paid.
          </p>
        </div>

        {/* Calculator Card */}
        <div className="mb-8 rounded-2xl border border-(--border) bg-(--card) p-6 shadow-sm md:p-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Inputs */}
            <div className="space-y-5">
              <CalculatorContent slug={SLUG} pascal={PASCAL} icon={ICON} iconColor={ICON_COLOR} name={NAME} result={result} setResult={setResult} showDetails={showDetails} setShowDetails={setShowDetails} />
            </div>

            {/* Results */}
            <ResultsPanel result={result} showDetails={showDetails} slug={SLUG} name={NAME} />
          </div>
        </div>

        {/* FAQ */}
        <FAQSection slug={SLUG} name={NAME} />
      </div>
    </div>
  );
}

function CalculatorContent({ slug, pascal, icon, iconColor, name, result, setResult, showDetails, setShowDetails }) {
  const [form, setForm] = useState(getDefaultForm(slug));
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    const num = value === "" ? "" : Number(value);
    setForm((prev) => ({ ...prev, [field]: num }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const newErrors = {};
    const rules = getValidationRules(slug);
    for (const [field, rule] of Object.entries(rules)) {
      const val = form[field];
      if (val === "" || val === null || val === undefined) {
        newErrors[field] = rule.label + " is required";
      } else if (rule.min !== undefined && val < rule.min) {
        newErrors[field] = rule.label + " must be at least " + rule.min;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculate = () => {
    if (!validate()) return;
    setResult(computeResult(slug, form));
  };

  const reset = () => {
    setForm(getDefaultForm(slug));
    setResult(null);
    setErrors({});
    setShowDetails(false);
  };

  const fields = getFormFields(slug);

  return (
    <>
      {fields.map((field) => {
        const inputId = `${slug}-${field.key}`;
        return (
          <div key={field.key}>
            <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold text-(--foreground)">
              {field.label}
            </label>
            <div className="relative">
              {field.prefix && (
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-(--muted-foreground) font-medium">
                  {field.prefix}
                </span>
              )}
              <input
                id={inputId}
                type="number"
                value={form[field.key] ?? ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder || ""}
                className={`h-12 w-full rounded-xl border ${
                  errors[field.key]
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
                    : "border-(--border) focus:border-(--primary) focus:ring-(--primary)/30"
                } bg-(--background) px-4 ${
                  field.prefix ? "pl-8" : ""
                } text-sm font-medium text-(--foreground) outline-none transition placeholder:text-(--muted-foreground) focus:ring-2`}
              />
              {field.suffix && (
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-(--muted-foreground)">
                  {field.suffix}
                </span>
              )}
            </div>
            {errors[field.key] && (
              <p role="alert" className="mt-1 text-xs text-red-500">{errors[field.key]}</p>
            )}
          </div>
        );
      })}

      {getExtraControls(slug, form, setForm)}

      <div className="flex gap-3 pt-2">
        <button
          onClick={calculate}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-(--primary) px-6 text-sm font-bold text-(--primary-foreground) transition hover:bg-(--primary-hover) active:scale-[0.98]"
        >
          <Calculator className="h-4 w-4" />
          Calculate
        </button>
        <button
          onClick={reset}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-(--border) text-(--muted-foreground) transition hover:bg-(--muted) hover:text-(--foreground)"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    </>
  );
}

function ResultsPanel({ result, showDetails, slug, name }) {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-(--border) bg-(--background)/50 p-8 text-center">
        <Calculator className="mb-3 h-12 w-12 text-(--muted-foreground)/40" />
        <p className="text-sm text-(--muted-foreground)">
          Enter your details and click Calculate to see results
        </p>
        <p className="mt-1 text-xs text-(--muted-foreground)/60">
          Get detailed projections for loan prepayment calculator
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5" aria-live="polite" role="status">
      {result.primary !== undefined && (
        <div className="rounded-xl bg-(--primary)/5 border border-(--primary)/10 p-6 text-center">
          <p className="text-sm font-medium text-(--muted-foreground) mb-1">{result.primaryLabel || "Result"}</p>
          <p className="text-3xl font-bold text-(--primary)">{formatCurrency(result.primary)}</p>
          {result.secondary !== undefined && (
            <p className="mt-2 text-sm text-(--muted-foreground)">
              {result.secondaryLabel || "Total"}: {formatCurrency(result.secondary)}
            </p>
          )}
        </div>
      )}

      {result.details && result.details.length > 0 && (
        <div>
          <button
            className="flex w-full items-center justify-between rounded-xl border border-(--border) bg-(--card) px-5 py-3 text-sm font-semibold text-(--foreground) transition hover:bg-(--muted)/30"
            onClick={() => setShowDetails(!showDetails)}
          >
            <span className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-(--primary)" />
              Year-by-Year Breakdown
            </span>
            <svg className={`h-4 w-4 transition ${showDetails ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showDetails && (
            <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-(--border)">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-(--surface-soft)">
                  <tr>
                    <th className="px-4 py-2 font-semibold text-(--muted-foreground)">Year</th>
                    <th className="px-4 py-2 font-semibold text-(--muted-foreground)">Invested</th>
                    <th className="px-4 py-2 font-semibold text-(--muted-foreground)">Interest</th>
                    <th className="px-4 py-2 font-semibold text-(--muted-foreground) text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {result.details.map((row, i) => (
                    <tr key={i} className="border-t border-(--border)">
                      <td className="px-4 py-2 font-medium text-(--foreground)">{row.year}</td>
                      <td className="px-4 py-2 text-(--muted-foreground)">{formatCurrency(row.invested)}</td>
                      <td className="px-4 py-2 text-(--muted-foreground)">{formatCurrency(row.interest)}</td>
                      <td className="px-4 py-2 text-right font-medium text-(--foreground)">{formatCurrency(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {result.summaryItems && result.summaryItems.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {result.summaryItems.map((item, i) => (
            <div key={i} className="rounded-xl border border-(--border) bg-(--background)/50 p-4">
              <p className="text-xs font-medium text-(--muted-foreground)">{item.label}</p>
              <p className="mt-1 text-lg font-bold text-(--foreground)">{formatCurrency(item.value)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatCurrency(value) {
  if (value === undefined || value === null) return "";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getDefaultForm(slug) {
  const defaults = {
    "sip-calculator": { monthly: 5000, rate: 12, years: 10, stepUp: 10 },
    "lumpsum-calculator": { amount: 100000, rate: 12, years: 10 },
    "compound-interest-calculator": { principal: 100000, rate: 8, years: 10, frequency: "monthly" },
    "inflation-calculator": { amount: 100000, years: 10, rate: 6 },
    "retirement-planner": { monthly: 10000, rate: 10, years: 25, inflation: 6, currentAge: 30, retirementAge: 60, lifeExpectancy: 85 },
    "loan-prepayment-calculator": { amount: 5000000, rate: 9, years: 20, prepayMonthly: 5000, prepayYearly: 0 },
    "debt-payoff-planner": { total: 500000, rate: 18, minPayment: 5000, extraPayment: 2000 },
    "net-worth-calculator": { cash: 50000, investments: 500000, property: 5000000, vehicles: 500000, otherAssets: 100000, homeLoan: 3000000, carLoan: 300000, creditCard: 50000, otherDebt: 0 },
    "budget-planner": { income: 60000, housing: 15000, food: 8000, transport: 5000, utilities: 4000, insurance: 3000, entertainment: 3000, savings: 10000, other: 5000 },
    "savings-goal-calculator": { target: 1000000, years: 5, rate: 8, current: 0 },
    "emergency-fund-calculator": { monthlyExpenses: 30000, dependents: 2, incomeStreams: 1, hasInsurance: true, jobStability: "medium" },
    "fire-calculator": { yearlyExpenses: 600000, currentSavings: 1000000, monthlySIP: 30000, rate: 10, swr: 4, inflation: 6 },
    "salary-tax-calculator": { ctc: 1200000, hra: 600000, lta: 50000, standardDeduction: 50000, section80C: 150000, section80D: 25000 },
    "credit-card-interest-calculator": { balance: 50000, apr: 36, minPayment: 5, extraPayment: 0 },
    "mortgage-calculator": { homePrice: 5000000, downPayment: 20, rate: 8.5, years: 20, propertyTax: 1, insurance: 0.5 },
    "currency-profit-loss-calculator": { buyRate: 83.5, sellRate: 84.2, amount: 1000, leverage: 1 },
    "investment-fee-impact-calculator": { investment: 1000000, rate: 10, years: 20, fee: 1.5, oneTimeFee: 0 },
    "financial-goal-planner": { goalAmount: 5000000, years: 10, rate: 10, currentSavings: 500000, monthlyContribution: 15000 },
  };
  return defaults[slug] || {};
}

function getFormFields(slug) {
  const fields = {
    "sip-calculator": [
      { key: "monthly", label: "Monthly SIP Amount", prefix: "₹", suffix: null, placeholder: "5000" },
      { key: "rate", label: "Expected Return Rate (% p.a.)", prefix: null, suffix: "%", placeholder: "12" },
      { key: "years", label: "Investment Period (Years)", prefix: null, suffix: "yrs", placeholder: "10" },
      { key: "stepUp", label: "Annual Step-Up (%)", prefix: null, suffix: "%", placeholder: "10" },
    ],
    "lumpsum-calculator": [
      { key: "amount", label: "Lumpsum Investment Amount", prefix: "₹", suffix: null, placeholder: "100000" },
      { key: "rate", label: "Expected Return Rate (% p.a.)", prefix: null, suffix: "%", placeholder: "12" },
      { key: "years", label: "Investment Period (Years)", prefix: null, suffix: "yrs", placeholder: "10" },
    ],
    "compound-interest-calculator": [
      { key: "principal", label: "Principal Amount", prefix: "₹", suffix: null, placeholder: "100000" },
      { key: "rate", label: "Annual Interest Rate (% p.a.)", prefix: null, suffix: "%", placeholder: "8" },
      { key: "years", label: "Time Period (Years)", prefix: null, suffix: "yrs", placeholder: "10" },
    ],
    "inflation-calculator": [
      { key: "amount", label: "Current Amount", prefix: "₹", suffix: null, placeholder: "100000" },
      { key: "rate", label: "Inflation Rate (% p.a.)", prefix: null, suffix: "%", placeholder: "6" },
      { key: "years", label: "Time Period (Years)", prefix: null, suffix: "yrs", placeholder: "10" },
    ],
    "retirement-planner": [
      { key: "currentAge", label: "Your Current Age", prefix: null, suffix: "yrs", placeholder: "30" },
      { key: "retirementAge", label: "Retirement Age", prefix: null, suffix: "yrs", placeholder: "60" },
      { key: "lifeExpectancy", label: "Life Expectancy", prefix: null, suffix: "yrs", placeholder: "85" },
      { key: "monthly", label: "Monthly Investment", prefix: "₹", suffix: null, placeholder: "10000" },
      { key: "rate", label: "Expected Return (% p.a.)", prefix: null, suffix: "%", placeholder: "10" },
      { key: "inflation", label: "Inflation Rate (% p.a.)", prefix: null, suffix: "%", placeholder: "6" },
    ],
    "loan-prepayment-calculator": [
      { key: "amount", label: "Loan Amount", prefix: "₹", suffix: null, placeholder: "5000000" },
      { key: "rate", label: "Interest Rate (% p.a.)", prefix: null, suffix: "%", placeholder: "9" },
      { key: "years", label: "Loan Tenure (Years)", prefix: null, suffix: "yrs", placeholder: "20" },
      { key: "prepayMonthly", label: "Monthly Prepayment", prefix: "₹", suffix: null, placeholder: "5000" },
    ],
    "debt-payoff-planner": [
      { key: "total", label: "Total Debt Amount", prefix: "₹", suffix: null, placeholder: "500000" },
      { key: "rate", label: "Interest Rate (% p.a.)", prefix: null, suffix: "%", placeholder: "18" },
      { key: "minPayment", label: "Minimum Monthly Payment", prefix: "₹", suffix: null, placeholder: "5000" },
      { key: "extraPayment", label: "Extra Monthly Payment", prefix: "₹", suffix: null, placeholder: "2000" },
    ],
    "net-worth-calculator": [
      { key: "cash", label: "Cash & Bank Balance", prefix: "₹", suffix: null, placeholder: "50000" },
      { key: "investments", label: "Investments (Stocks, MF, etc.)", prefix: "₹", suffix: null, placeholder: "500000" },
      { key: "property", label: "Property Value", prefix: "₹", suffix: null, placeholder: "5000000" },
      { key: "vehicles", label: "Vehicles & Other Assets", prefix: "₹", suffix: null, placeholder: "500000" },
      { key: "otherAssets", label: "Other Assets", prefix: "₹", suffix: null, placeholder: "100000" },
      { key: "homeLoan", label: "Home Loan Outstanding", prefix: "₹", suffix: null, placeholder: "3000000" },
      { key: "carLoan", label: "Car Loan Outstanding", prefix: "₹", suffix: null, placeholder: "300000" },
      { key: "creditCard", label: "Credit Card Debt", prefix: "₹", suffix: null, placeholder: "50000" },
    ],
    "budget-planner": [
      { key: "income", label: "Monthly Income", prefix: "₹", suffix: null, placeholder: "60000" },
      { key: "housing", label: "Housing (Rent/Mortgage)", prefix: "₹", suffix: null, placeholder: "15000" },
      { key: "food", label: "Food & Groceries", prefix: "₹", suffix: null, placeholder: "8000" },
      { key: "transport", label: "Transportation", prefix: "₹", suffix: null, placeholder: "5000" },
      { key: "utilities", label: "Utilities", prefix: "₹", suffix: null, placeholder: "4000" },
      { key: "insurance", label: "Insurance", prefix: "₹", suffix: null, placeholder: "3000" },
      { key: "entertainment", label: "Entertainment", prefix: "₹", suffix: null, placeholder: "3000" },
      { key: "savings", label: "Savings & Investments", prefix: "₹", suffix: null, placeholder: "10000" },
    ],
    "savings-goal-calculator": [
      { key: "target", label: "Target Amount", prefix: "₹", suffix: null, placeholder: "1000000" },
      { key: "years", label: "Time Horizon (Years)", prefix: null, suffix: "yrs", placeholder: "5" },
      { key: "rate", label: "Expected Return (% p.a.)", prefix: null, suffix: "%", placeholder: "8" },
      { key: "current", label: "Current Savings", prefix: "₹", suffix: null, placeholder: "0" },
    ],
    "emergency-fund-calculator": [
      { key: "monthlyExpenses", label: "Monthly Expenses", prefix: "₹", suffix: null, placeholder: "30000" },
      { key: "dependents", label: "Number of Dependents", prefix: null, suffix: null, placeholder: "2" },
      { key: "incomeStreams", label: "Income Sources", prefix: null, suffix: null, placeholder: "1" },
    ],
    "fire-calculator": [
      { key: "yearlyExpenses", label: "Yearly Expenses in Retirement", prefix: "₹", suffix: null, placeholder: "600000" },
      { key: "currentSavings", label: "Current Retirement Savings", prefix: "₹", suffix: null, placeholder: "1000000" },
      { key: "monthlySIP", label: "Monthly SIP Contribution", prefix: "₹", suffix: null, placeholder: "30000" },
      { key: "rate", label: "Expected Return (% p.a.)", prefix: null, suffix: "%", placeholder: "10" },
      { key: "swr", label: "Safe Withdrawal Rate (%)", prefix: null, suffix: "%", placeholder: "4" },
      { key: "inflation", label: "Inflation Rate (% p.a.)", prefix: null, suffix: "%", placeholder: "6" },
    ],
    "salary-tax-calculator": [
      { key: "ctc", label: "Annual CTC (Cost to Company)", prefix: "₹", suffix: null, placeholder: "1200000" },
      { key: "hra", label: "HRA Exemption", prefix: "₹", suffix: null, placeholder: "600000" },
      { key: "lta", label: "LTA Exemption", prefix: "₹", suffix: null, placeholder: "50000" },
      { key: "section80C", label: "Section 80C Deductions", prefix: "₹", suffix: null, placeholder: "150000" },
      { key: "section80D", label: "Section 80D (Health Insurance)", prefix: "₹", suffix: null, placeholder: "25000" },
    ],
    "credit-card-interest-calculator": [
      { key: "balance", label: "Outstanding Balance", prefix: "₹", suffix: null, placeholder: "50000" },
      { key: "apr", label: "Annual Interest Rate (%)", prefix: null, suffix: "%", placeholder: "36" },
      { key: "minPayment", label: "Minimum Payment (% of Balance)", prefix: null, suffix: "%", placeholder: "5" },
    ],
    "mortgage-calculator": [
      { key: "homePrice", label: "Home Price", prefix: "₹", suffix: null, placeholder: "5000000" },
      { key: "downPayment", label: "Down Payment (%)", prefix: null, suffix: "%", placeholder: "20" },
      { key: "rate", label: "Interest Rate (% p.a.)", prefix: null, suffix: "%", placeholder: "8.5" },
      { key: "years", label: "Loan Term (Years)", prefix: null, suffix: "yrs", placeholder: "20" },
    ],
    "currency-profit-loss-calculator": [
      { key: "buyRate", label: "Buy Rate (Entry)", prefix: "₹", suffix: null, placeholder: "83.5" },
      { key: "sellRate", label: "Sell Rate (Exit)", prefix: "₹", suffix: null, placeholder: "84.2" },
      { key: "amount", label: "Amount in Foreign Currency", prefix: null, suffix: null, placeholder: "1000" },
    ],
    "investment-fee-impact-calculator": [
      { key: "investment", label: "Investment Amount", prefix: "₹", suffix: null, placeholder: "1000000" },
      { key: "rate", label: "Expected Return (% p.a.)", prefix: null, suffix: "%", placeholder: "10" },
      { key: "years", label: "Investment Period (Years)", prefix: null, suffix: "yrs", placeholder: "20" },
      { key: "fee", label: "Annual Expense Ratio (%)", prefix: null, suffix: "%", placeholder: "1.5" },
    ],
    "rent-vs-buy-calculator": [
      { key: "homePrice", label: "Home Purchase Price", prefix: "₹", suffix: null, placeholder: "5000000" },
      { key: "monthlyRent", label: "Monthly Rent", prefix: "₹", suffix: null, placeholder: "15000" },
      { key: "rate", label: "Investment Return (%)", prefix: null, suffix: "%", placeholder: "10" },
      { key: "years", label: "Time Horizon (Years)", prefix: null, suffix: "yrs", placeholder: "10" },
      { key: "downPayment", label: "Down Payment (%)", prefix: null, suffix: "%", placeholder: "20" },
      { key: "mortgageRate", label: "Mortgage Rate (%)", prefix: null, suffix: "%", placeholder: "8.5" },
    ],
    "financial-goal-planner": [
      { key: "goalAmount", label: "Goal Amount", prefix: "₹", suffix: null, placeholder: "5000000" },
      { key: "years", label: "Time Horizon (Years)", prefix: null, suffix: "yrs", placeholder: "10" },
      { key: "rate", label: "Expected Return (% p.a.)", prefix: null, suffix: "%", placeholder: "10" },
      { key: "currentSavings", label: "Current Savings for Goal", prefix: "₹", suffix: null, placeholder: "500000" },
    ],
  };
  return fields[slug] || [];
}

function getValidationRules(slug) {
  const rules = {};
  const fields = getFormFields(slug);
  for (const f of fields) {
    let min = 0;
    if (slug === "loan-prepayment-calculator" && f.key === "years") {
      // A 0-year tenure is not a coherent loan term (unlike 0% interest, which is valid).
      min = 1;
    }
    rules[f.key] = { label: f.label, min };
  }
  return rules;
}

function getExtraControls(slug, form, setForm) {
  if (SLUG === "compound-interest-calculator") {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-(--foreground)">Compounding Frequency</label>
        <select
          value={form.frequency || "monthly"}
          onChange={(e) => setForm((prev) => ({ ...prev, frequency: e.target.value }))}
          className="h-12 w-full rounded-xl border border-(--border) bg-(--background) px-4 text-sm font-medium text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/30"
        >
          <option value="daily">Daily</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="half-yearly">Half-Yearly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>
    );
  }
  if (SLUG === "emergency-fund-calculator") {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-(--foreground)">Job Stability</label>
        <select
          value={form.jobStability || "medium"}
          onChange={(e) => setForm((prev) => ({ ...prev, jobStability: e.target.value }))}
          className="h-12 w-full rounded-xl border border-(--border) bg-(--background) px-4 text-sm font-medium text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/30"
        >
          <option value="high">High (Government/Tenured)</option>
          <option value="medium">Medium (Private Sector)</option>
          <option value="low">Low (Freelance/Contract)</option>
        </select>
      </div>
    );
  }
  if (SLUG === "emergency-fund-calculator2") {
    return (
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={form.hasInsurance || false}
          onChange={(e) => setForm((prev) => ({ ...prev, hasInsurance: e.target.checked }))}
          className="h-4 w-4 rounded border-(--border) text-(--primary) focus:ring-(--primary)"
        />
        <span className="text-sm text-(--foreground)">I have health insurance coverage</span>
      </label>
    );
  }
  return null;
}

function getExtraControls2(slug, form, setForm) {
  return null;
}

function computeResult(slug, form) {
  const f = form;
  switch (slug) {
    case "sip-calculator": {
      const monthly = Number(f.monthly) || 0;
      const annualRate = (Number(f.rate) || 0) / 100;
      const years = Number(f.years) || 0;
      const stepUp = (Number(f.stepUp) || 0) / 100;
      const monthlyRate = annualRate / 12;
      const totalMonths = years * 12;
      let totalInvested = 0;
      let currentSIP = monthly;
      let maturity = 0;
      const details = [];
      for (let m = 1; m <= totalMonths; m++) {
        maturity = (maturity + currentSIP) * (1 + monthlyRate);
        totalInvested += currentSIP;
        if (m % 12 === 0) {
          currentSIP *= (1 + stepUp);
          details.push({ year: m / 12, invested: totalInvested, interest: Math.round(maturity - totalInvested), balance: Math.round(maturity) });
        }
      }
      return {
        primary: Math.round(maturity),
        primaryLabel: "Total Corpus",
        secondary: Math.round(totalInvested),
        secondaryLabel: "Total Invested",
        details,
      };
    }
    case "lumpsum-calculator": {
      const amount = Number(f.amount) || 0;
      const rate = (Number(f.rate) || 0) / 100;
      const years = Number(f.years) || 0;
      const maturity = amount * Math.pow(1 + rate, years);
      const details = [];
      let running = amount;
      for (let y = 1; y <= years; y++) {
        const prev = running;
        running = prev * (1 + rate);
        details.push({ year: y, invested: amount, interest: Math.round(running - amount), balance: Math.round(running) });
      }
      return {
        primary: Math.round(maturity),
        primaryLabel: "Future Value",
        secondary: Math.round(maturity - amount),
        secondaryLabel: "Total Interest Earned",
        details,
      };
    }
    case "compound-interest-calculator": {
      const principal = Number(f.principal) || 0;
      const annualRate = (Number(f.rate) || 0) / 100;
      const years = Number(f.years) || 0;
      const freq = f.frequency || "monthly";
      const nMap = { daily: 365, monthly: 12, quarterly: 4, "half-yearly": 2, yearly: 1 };
      const n = nMap[freq] || 12;
      const total = principal * Math.pow(1 + annualRate / n, n * years);
      const details = [];
      for (let y = 1; y <= years; y++) {
        const bal = principal * Math.pow(1 + annualRate / n, n * y);
        details.push({ year: y, invested: principal, interest: Math.round(bal - principal), balance: Math.round(bal) });
      }
      return {
        primary: Math.round(total),
        primaryLabel: "Total Amount",
        secondary: Math.round(total - principal),
        secondaryLabel: "Total Interest",
        details,
      };
    }
    case "inflation-calculator": {
      const amount = Number(f.amount) || 0;
      const rate = (Number(f.rate) || 0) / 100;
      const years = Number(f.years) || 0;
      const futureValue = amount * Math.pow(1 + rate, years);
      const details = [];
      let running = amount;
      for (let y = 1; y <= years; y++) {
        running *= (1 + rate);
        details.push({ year: y, invested: amount, interest: 0, balance: Math.round(running) });
      }
      return {
        primary: Math.round(futureValue),
        primaryLabel: `Future Value After ${years} Years`,
        secondary: Math.round(futureValue - amount),
        secondaryLabel: "Loss in Purchasing Power",
        details,
        summaryItems: [
          { label: "Today's Value", value: amount },
          { label: "Future Value", value: Math.round(futureValue) },
          { label: "Value Erosion", value: Math.round(futureValue - amount) },
          { label: "Erosion %", value: Math.round(((futureValue - amount) / amount) * 100) + "%" },
        ],
      };
    }
    case "retirement-planner": {
      const monthly = Number(f.monthly) || 0;
      const rate = (Number(f.rate) || 0) / 100;
      const inflation = (Number(f.inflation) || 0) / 100;
      const currentAge = Number(f.currentAge) || 30;
      const retirementAge = Number(f.retirementAge) || 60;
      const lifeExpectancy = Number(f.lifeExpectancy) || 85;
      const accumulationYears = retirementAge - currentAge;
      const withdrawalYears = lifeExpectancy - retirementAge;
      const monthlyRate = rate / 12;
      const totalMonths = accumulationYears * 12;
      let corpus = 0;
      let totalInvested = 0;
      const details = [];
      for (let m = 1; m <= totalMonths; m++) {
        corpus = (corpus + monthly) * (1 + monthlyRate);
        totalInvested += monthly;
        if (m % 12 === 0) {
          details.push({ year: m / 12, invested: totalInvested, interest: Math.round(corpus - totalInvested), balance: Math.round(corpus) });
        }
      }
      const inflationAdjRate = (1 + rate) / (1 + inflation) - 1;
      const monthlySWR = inflationAdjRate > 0 ? (corpus * inflationAdjRate) / (1 - Math.pow(1 + inflationAdjRate, -withdrawalYears * 12)) : corpus / (withdrawalYears * 12);
      return {
        primary: Math.round(corpus),
        primaryLabel: "Retirement Corpus Needed",
        secondary: Math.round(monthlySWR * 12),
        secondaryLabel: "Safe Monthly Withdrawal (Infl. Adj.)",
        details,
      };
    }
    case "loan-prepayment-calculator": {
      const amount = Number(f.amount) || 0;
      const rate = (Number(f.rate) || 0) / 100;
      const years = Number(f.years) || 0;
      const prepayMonthly = Number(f.prepayMonthly) || 0;
      const monthlyRate = rate / 12;
      const totalMonths = years * 12;
      const emi = monthlyRate === 0
        ? amount / totalMonths
        : amount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
      let balance = amount;
      let totalInterest = 0;
      let monthsToPay = 0;
      for (let m = 1; m <= totalMonths && balance > 0; m++) {
        const interest = balance * monthlyRate;
        let principalPaid = emi - interest + prepayMonthly;
        totalInterest += interest;
        balance -= principalPaid;
        if (balance <= 0) { monthsToPay = m; break; }
      }
      const totalWithoutPrepay = emi * totalMonths;
      const totalWithPrepay = monthsToPay > 0 ? emi * monthsToPay + prepayMonthly * monthsToPay : totalWithoutPrepay;
      return {
        primary: Math.round(monthsToPay > 0 ? totalWithPrepay : totalWithoutPrepay),
        primaryLabel: "Total Payment (with Prepayment)",
        secondary: Math.round(totalWithoutPrepay - totalWithPrepay),
        secondaryLabel: "Interest Saved",
        summaryItems: [
          { label: "Monthly EMI", value: Math.round(emi) },
          { label: "Original Tenure", value: years + " yrs" },
          { label: "Reduced Tenure", value: monthsToPay > 0 ? Math.round(monthsToPay / 12) + " yrs " + (monthsToPay % 12) + " mo" : "N/A" },
          { label: "Interest Saved", value: Math.round(totalWithoutPrepay - totalWithPrepay) },
        ],
      };
    }
    case "debt-payoff-planner": {
      const total = Number(f.total) || 0;
      const rate = (Number(f.rate) || 0) / 100;
      const minPayment = Number(f.minPayment) || 0;
      const extraPayment = Number(f.extraPayment) || 0;
      const monthlyRate = rate / 12;
      let snowballBalance = total;
      let avalancheBalance = total;
      let snowballMonths = 0;
      let avalancheMonths = 0;
      let snowballInterest = 0;
      let avalancheInterest = 0;
      const totalPayment = minPayment + extraPayment;
      for (let m = 1; m <= 600 && snowballBalance > 0; m++) {
        const interest = snowballBalance * monthlyRate;
        const principal = Math.min(totalPayment - interest, snowballBalance);
        snowballInterest += interest;
        snowballBalance -= principal;
        if (snowballBalance <= 0) { snowballMonths = m; break; }
      }
      for (let m = 1; m <= 600 && avalancheBalance > 0; m++) {
        const interest = avalancheBalance * monthlyRate;
        const principal = Math.min(totalPayment - interest, avalancheBalance);
        avalancheInterest += interest;
        avalancheBalance -= principal;
        if (avalancheBalance <= 0) { avalancheMonths = m; break; }
      }
      return {
        primary: Math.round(total),
        primaryLabel: "Total Debt",
        summaryItems: [
          { label: "Snowball - Months to Pay Off", value: snowballMonths > 0 ? snowballMonths + " months" : "N/A" },
          { label: "Snowball - Total Interest", value: Math.round(snowballInterest) },
          { label: "Avalanche - Months to Pay Off", value: avalancheMonths > 0 ? avalancheMonths + " months" : "N/A" },
          { label: "Avalanche - Total Interest", value: Math.round(avalancheInterest) },
        ],
      };
    }
    case "net-worth-calculator": {
      const assets = (Number(f.cash) || 0) + (Number(f.investments) || 0) + (Number(f.property) || 0) + (Number(f.vehicles) || 0) + (Number(f.otherAssets) || 0);
      const liabilities = (Number(f.homeLoan) || 0) + (Number(f.carLoan) || 0) + (Number(f.creditCard) || 0) + (Number(f.otherDebt) || 0);
      const netWorth = assets - liabilities;
      return {
        primary: Math.round(netWorth),
        primaryLabel: "Your Net Worth",
        secondary: Math.round(assets),
        secondaryLabel: "Total Assets",
        summaryItems: [
          { label: "Total Assets", value: Math.round(assets) },
          { label: "Total Liabilities", value: Math.round(liabilities) },
          { label: "Net Worth", value: Math.round(netWorth) },
        ],
      };
    }
    case "budget-planner": {
      const income = Number(f.income) || 0;
      const expenses = (Number(f.housing) || 0) + (Number(f.food) || 0) + (Number(f.transport) || 0) + (Number(f.utilities) || 0) + (Number(f.insurance) || 0) + (Number(f.entertainment) || 0) + (Number(f.savings) || 0) + (Number(f.other) || 0);
      const remaining = income - expenses;
      return {
        primary: Math.round(remaining),
        primaryLabel: remaining >= 0 ? "Monthly Surplus" : "Monthly Deficit",
        secondary: Math.round(expenses),
        secondaryLabel: "Total Monthly Expenses",
        summaryItems: [
          { label: "Monthly Income", value: Math.round(income) },
          { label: "Total Expenses", value: Math.round(expenses) },
          { label: remaining >= 0 ? "Surplus" : "Deficit", value: Math.round(Math.abs(remaining)) },
          { label: "Savings Rate", value: income > 0 ? Math.round((remaining / income) * 100) + "%" : "0%" },
        ],
      };
    }
    case "savings-goal-calculator": {
      const target = Number(f.target) || 0;
      const years = Number(f.years) || 0;
      const rate = (Number(f.rate) || 0) / 100;
      const current = Number(f.current) || 0;
      const monthlyRate = rate / 12;
      const totalMonths = years * 12;
      const futureCurrent = current * Math.pow(1 + rate, years);
      const remaining = target - futureCurrent;
      let monthlyNeeded = 0;
      if (remaining > 0 && monthlyRate > 0) {
        monthlyNeeded = (remaining * monthlyRate) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
      } else if (remaining > 0) {
        monthlyNeeded = remaining / totalMonths;
      }
      return {
        primary: Math.round(monthlyNeeded),
        primaryLabel: "Monthly Savings Needed",
        secondary: Math.round(futureCurrent),
        secondaryLabel: "Future Value of Current Savings",
      };
    }
    case "emergency-fund-calculator": {
      const monthlyExpenses = Number(f.monthlyExpenses) || 0;
      const dependents = Number(f.dependents) || 1;
      const incomeStreams = Number(f.incomeStreams) || 1;
      const stability = f.jobStability || "medium";
      const baseMonths = { high: 3, medium: 6, low: 12 };
      const months = (baseMonths[stability] || 6) * (1 + (dependents - 1) * 0.25) * (incomeStreams < 2 ? 1.5 : 1);
      const fundAmount = monthlyExpenses * Math.round(months);
      return {
        primary: Math.round(fundAmount),
        primaryLabel: "Recommended Emergency Fund",
        secondary: Math.round(months * 10) / 10,
        secondaryLabel: "Months of Coverage",
      };
    }
    case "fire-calculator": {
      const yearlyExpenses = Number(f.yearlyExpenses) || 0;
      const currentSavings = Number(f.currentSavings) || 0;
      const monthlySIP = Number(f.monthlySIP) || 0;
      const rate = (Number(f.rate) || 0) / 100;
      const swr = (Number(f.swr) || 4) / 100;
      const inflation = (Number(f.inflation) || 0) / 100;
      const fireNumber = yearlyExpenses / swr;
      const monthlyRate = rate / 12;
      const totalMonths = 12 * 30;
      let corpus = currentSavings;
      let totalInvested = currentSavings;
      let yearsToFire = 0;
      const details = [];
      for (let m = 1; m <= totalMonths; m++) {
        corpus = (corpus + monthlySIP) * (1 + monthlyRate);
        totalInvested += monthlySIP;
        if (m % 12 === 0) {
          const y = m / 12;
          details.push({ year: y, invested: Math.round(totalInvested), interest: Math.round(corpus - totalInvested), balance: Math.round(corpus) });
          if (corpus >= fireNumber && yearsToFire === 0) yearsToFire = y;
        }
      }
      return {
        primary: Math.round(fireNumber),
        primaryLabel: "Your FIRE Number",
        secondary: Math.round(corpus),
        secondaryLabel: `Projected Corpus (${yearsToFire > 0 ? yearsToFire : 30}+ yrs)`,
        details,
      };
    }
    case "salary-tax-calculator": {
      const ctc = Number(f.ctc) || 0;
      const hra = Number(f.hra) || 0;
      const lta = Number(f.lta) || 0;
      const sd = Number(f.standardDeduction) || 50000;
      const sec80C = Number(f.section80C) || 0;
      const sec80D = Number(f.section80D) || 0;
      const grossTaxable = ctc - sd;
      const deductions = sec80C + sec80D + hra * 0.5 + lta;
      const taxableIncome = Math.max(0, grossTaxable - deductions);
      let tax = 0;
      if (taxableIncome > 1500000) tax += (taxableIncome - 1500000) * 0.30;
      if (taxableIncome > 1200000) tax += Math.min(taxableIncome, 1500000) - 1200000 > 0 ? Math.min(taxableIncome - 1200000, 300000) * 0.20 : 0;
      if (taxableIncome > 900000) tax += Math.max(0, Math.min(taxableIncome, 1200000) - 900000) * 0.15;
      if (taxableIncome > 600000) tax += Math.max(0, Math.min(taxableIncome, 900000) - 600000) * 0.10;
      if (taxableIncome > 300000) tax += Math.max(0, Math.min(taxableIncome, 600000) - 300000) * 0.05;
      const cess = tax * 0.04;
      const totalTax = tax + cess;
      const takeHome = ctc - totalTax;
      return {
        primary: Math.round(takeHome),
        primaryLabel: "Annual Take-Home Salary",
        secondary: Math.round(totalTax),
        secondaryLabel: "Total Tax + Cess",
        summaryItems: [
          { label: "CTC", value: Math.round(ctc) },
          { label: "Taxable Income", value: Math.round(taxableIncome) },
          { label: "Income Tax", value: Math.round(tax) },
          { label: "Health & Edu Cess", value: Math.round(cess) },
          { label: "Take-Home per Month", value: Math.round(takeHome / 12) },
        ],
      };
    }
    case "credit-card-interest-calculator": {
      const balance = Number(f.balance) || 0;
      const apr = (Number(f.apr) || 0) / 100;
      const minPct = (Number(f.minPayment) || 5) / 100;
      const monthlyRate = apr / 12;
      let bal = balance;
      let totalInterest = 0;
      let months = 0;
      const details = [];
      for (let m = 1; m <= 600 && bal > 0; m++) {
        const interest = bal * monthlyRate;
        totalInterest += interest;
        const minPay = Math.max(bal * minPct, 500);
        const payment = Math.min(minPay, bal + interest);
        bal = bal + interest - payment;
        months = m;
        if (m % 12 === 0) details.push({ year: m / 12, invested: Math.round(balance - bal), interest: Math.round(totalInterest), balance: Math.round(bal) });
        if (bal <= 0) break;
      }
      return {
        primary: Math.round(totalInterest),
        primaryLabel: "Total Interest Paid",
        secondary: months,
        secondaryLabel: `Months to Pay Off (${Math.round(months / 12)} yrs)`,
      };
    }
    case "mortgage-calculator": {
      const homePrice = Number(f.homePrice) || 0;
      const downPct = (Number(f.downPayment) || 20) / 100;
      const rate = (Number(f.rate) || 8.5) / 100;
      const years = Number(f.years) || 20;
      const downPayment = homePrice * downPct;
      const loanAmount = homePrice - downPayment;
      const monthlyRate = rate / 12;
      const totalMonths = years * 12;
      const emi = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
      const totalPayment = emi * totalMonths;
      const totalInterest = totalPayment - loanAmount;
      return {
        primary: Math.round(emi),
        primaryLabel: "Monthly Mortgage Payment",
        secondary: Math.round(totalInterest),
        secondaryLabel: "Total Interest Paid",
        summaryItems: [
          { label: "Loan Amount", value: Math.round(loanAmount) },
          { label: "Down Payment", value: Math.round(downPayment) },
          { label: "Monthly EMI", value: Math.round(emi) },
          { label: "Total Interest", value: Math.round(totalInterest) },
        ],
      };
    }
    case "currency-profit-loss-calculator": {
      const buyRate = Number(f.buyRate) || 0;
      const sellRate = Number(f.sellRate) || 0;
      const amount = Number(f.amount) || 0;
      const buyCost = buyRate * amount;
      const sellValue = sellRate * amount;
      const profitLoss = sellValue - buyCost;
      const pnlPercent = buyCost > 0 ? (profitLoss / buyCost) * 100 : 0;
      return {
        primary: Math.round(profitLoss),
        primaryLabel: profitLoss >= 0 ? "Profit" : "Loss",
        secondary: Math.round(pnlPercent * 100) / 100,
        secondaryLabel: profitLoss >= 0 ? "Profit %" : "Loss %",
        summaryItems: [
          { label: "Total Buy Cost", value: Math.round(buyCost) },
          { label: "Total Sell Value", value: Math.round(sellValue) },
          { label: "P&L Amount", value: Math.round(profitLoss) },
          { label: "P&L %", value: Math.round(pnlPercent * 100) / 100 + "%" },
        ],
      };
    }
    case "investment-fee-impact-calculator": {
      const investment = Number(f.investment) || 0;
      const rate = (Number(f.rate) || 0) / 100;
      const years = Number(f.years) || 0;
      const fee = (Number(f.fee) || 0) / 100;
      const withoutFee = investment * Math.pow(1 + rate, years);
      const withFee = investment * Math.pow(1 + (rate - fee), years);
      const feeImpact = withoutFee - withFee;
      return {
        primary: Math.round(withFee),
        primaryLabel: "Value After Fees",
        secondary: Math.round(feeImpact),
        secondaryLabel: "Fees Cost You",
        summaryItems: [
          { label: "Without Fees", value: Math.round(withoutFee) },
          { label: "With Fees", value: Math.round(withFee) },
          { label: "Fees Consumed", value: Math.round(feeImpact) },
          { label: "Fees Impact %", value: Math.round((feeImpact / withoutFee) * 100) + "%" },
        ],
      };
    }
    case "rent-vs-buy-calculator": {
      const homePrice = Number(f.homePrice) || 0;
      const monthlyRent = Number(f.monthlyRent) || 0;
      const rate = (Number(f.rate) || 0) / 100;
      const years = Number(f.years) || 0;
      const downPct = (Number(f.downPayment) || 20) / 100;
      const mortgageRate = (Number(f.mortgageRate) || 8.5) / 100;
      const downPayment = homePrice * downPct;
      const loanAmount = homePrice - downPayment;
      const monthlyMortgageRate = mortgageRate / 12;
      const totalMonths = years * 12;
      const emi = loanAmount * monthlyMortgageRate * Math.pow(1 + monthlyMortgageRate, totalMonths) / (Math.pow(1 + monthlyMortgageRate, totalMonths) - 1);
      const totalBuyCost = downPayment + emi * totalMonths;
      const opportunityLoss = downPayment * Math.pow(1 + rate, years) - downPayment;
      const totalRentCost = monthlyRent * totalMonths;
      const buyNet = totalBuyCost + opportunityLoss;
      return {
        primary: Math.round(emi),
        primaryLabel: "Monthly EMI (Buy)",
        secondary: Math.round(totalRentCost),
        secondaryLabel: `Total Rent Over ${years} Years`,
        summaryItems: [
          { label: "Total Buy Cost", value: Math.round(totalBuyCost) },
          { label: "Total Rent Cost", value: Math.round(totalRentCost) },
          { label: "Opportunity Cost (Down Payment)", value: Math.round(opportunityLoss) },
          { label: buyNet < totalRentCost ? "Buying is Cheaper By" : "Renting is Cheaper By", value: Math.round(Math.abs(buyNet - totalRentCost)) },
        ],
      };
    }
    case "financial-goal-planner": {
      const goalAmount = Number(f.goalAmount) || 0;
      const years = Number(f.years) || 0;
      const rate = (Number(f.rate) || 0) / 100;
      const currentSavings = Number(f.currentSavings) || 0;
      const monthlyRate = rate / 12;
      const totalMonths = years * 12;
      const futureCurrent = currentSavings * Math.pow(1 + rate, years);
      const remaining = Math.max(0, goalAmount - futureCurrent);
      let monthlyNeeded = 0;
      if (remaining > 0 && monthlyRate > 0) {
        monthlyNeeded = (remaining * monthlyRate) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
      } else if (remaining > 0) {
        monthlyNeeded = remaining / totalMonths;
      }
      return {
        primary: Math.round(monthlyNeeded),
        primaryLabel: "Monthly Contribution Needed",
        secondary: Math.round(futureCurrent),
        secondaryLabel: "Future Value of Current Savings",
      };
    }
    default:
      return { primary: 0, primaryLabel: "Result", details: [] };
  }
}


function FAQSection({ slug, name }) {
  const [openIndex, setOpenIndex] = useState(null);
  const faqs = getFAQs(slug, name);
  if (!faqs.length) return null;

  return (
    <div>
      <h2 className="mb-5 text-2xl font-bold text-(--foreground)">
        Frequently Asked Questions
      </h2>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="rounded-2xl border border-(--border) bg-(--card) overflow-hidden transition"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-(--foreground) transition hover:bg-(--muted)/20"
            >
              {faq.q}
              <svg
                className={`h-4 w-4 shrink-0 text-(--muted-foreground) transition ${openIndex === i ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openIndex === i && (
              <div className="border-t border-(--border) px-5 py-4 text-sm leading-relaxed text-(--muted-foreground)">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function getFAQs(slug, name) {
  const all = {
    "sip-calculator": [
      { q: "What is a Step-Up SIP?", a: "A Step-Up SIP allows you to increase your investment amount periodically (usually annually). This helps you invest more as your income grows and can significantly boost your final corpus." },
      { q: "How does step-up help?", a: "Even a 10% annual step-up can increase your final corpus by 2-3x compared to a normal SIP over long periods." },
      { q: "What is a good SIP return rate?", a: "Historically, equity mutual funds have delivered 10-14% annual returns over long periods. We recommend using 12% for planning." },
    ],
    "lumpsum-calculator": [
      { q: "What is lumpsum investment?", a: "A lumpsum investment is a one-time investment of a large amount, as opposed to periodic SIP investments." },
      { q: "When is lumpsum better than SIP?", a: "Lumpsum works well when markets are undervalued or you have a large amount to invest. SIP is better for regular income investors." },
    ],
    "compound-interest-calculator": [
      { q: "What is compound interest?", a: "Compound interest is interest earned on both the principal and previously earned interest. It's what makes investments grow exponentially over time." },
      { q: "Why is compounding frequency important?", a: "Higher compounding frequency (daily vs yearly) means interest is calculated more often, leading to slightly higher returns." },
    ],
    "inflation-calculator": [
      { q: "What is inflation?", a: "Inflation is the rate at which the general level of prices rises, reducing purchasing power over time." },
      { q: "How does inflation affect my savings?", a: "If your savings earn less than the inflation rate, you're effectively losing purchasing power. Your money buys less in the future." },
    ],
    "retirement-planner": [
      { q: "How much do I need for retirement?", a: "A common rule of thumb is to have 25-30x your annual expenses saved by retirement age, adjusted for inflation." },
      { q: "When should I start retirement planning?", a: "The earlier you start, the more time compound interest has to work. Starting in your 20s vs 30s can mean crores of difference." },
    ],
    "loan-prepayment-calculator": [
      { q: "Should I prepay my loan?", a: "Prepaying a high-interest loan (>8%) usually makes financial sense. For low-interest loans, investing the extra money may be better." },
      { q: "Does prepayment reduce EMI or tenure?", a: "Most lenders reduce the loan tenure when you prepay. Some allow you to choose between reducing EMI or tenure." },
    ],
    "debt-payoff-planner": [
      { q: "What is the Snowball method?", a: "Pay off smallest debts first regardless of interest rate. Gives psychological wins that keep you motivated." },
      { q: "What is the Avalanche method?", a: "Pay off highest interest rate debts first. Saves the most money on interest over time." },
    ],
    "net-worth-calculator": [
      { q: "What should my net worth be?", a: "Your net worth should grow over time as you save and invest. A common benchmark is to have 1x your annual salary saved by age 30." },
      { q: "How often should I calculate net worth?", a: "Tracking quarterly is ideal. Monthly might be too frequent, yearly might miss important trends." },
    ],
    "budget-planner": [
      { q: "What is the 50/30/20 rule?", a: "Spend 50% on needs, 30% on wants, and save 20% of your income. This is a popular budgeting guideline." },
      { q: "How much should I save each month?", a: "Aim to save at least 20% of your income. If that's not possible, start with 10% and increase gradually." },
    ],
    "savings-goal-calculator": [
      { q: "How do I set realistic savings goals?", a: "Start with your target amount and work backwards. Consider your time horizon and expected return rate to determine monthly savings needed." },
    ],
    "emergency-fund-calculator": [
      { q: "How much emergency fund do I need?", a: "Most experts recommend 3-6 months of expenses. Freelancers and single-income families should aim for 6-12 months." },
      { q: "Where should I keep my emergency fund?", a: "Keep it in a high-yield savings account or liquid fund. It should be accessible within 24-48 hours." },
    ],
    "fire-calculator": [
      { q: "What is the 4% rule?", a: "The 4% rule suggests you can withdraw 4% of your retirement corpus annually (adjusted for inflation) with a high probability of the money lasting 30 years." },
      { q: "What is Coast FIRE?", a: "Coast FIRE means you've saved enough that your current savings will grow to your FIRE number by retirement age without additional contributions." },
    ],
    "salary-tax-calculator": [
      { q: "What is the difference between CTC and take-home?", a: "CTC includes employer contributions (PF, gratuity, insurance) and taxes. Take-home is what actually gets credited to your bank account." },
      { q: "How can I reduce my tax?", a: "Maximize Section 80C deductions (PPF, ELSS, life insurance), claim HRA, use Section 80D for health insurance, and consider NPS." },
    ],
    "credit-card-interest-calculator": [
      { q: "How is credit card interest calculated?", a: "Interest is calculated daily on the outstanding balance at the monthly equivalent of your APR. Paying only the minimum can take decades to clear." },
      { q: "How can I avoid credit card interest?", a: "Pay your full statement balance by the due date every month. Most cards offer an interest-free period of 45-50 days." },
    ],
    "mortgage-calculator": [
      { q: "What is a good down payment?", a: "20% down payment is standard to avoid PMI. However, many lenders offer loans with as little as 5-10% down." },
      { q: "Should I choose a fixed or floating rate?", a: "Fixed rates offer certainty, floating rates are usually lower initially. Choose based on your risk tolerance and market conditions." },
    ],
    "currency-profit-loss-calculator": [
      { q: "How is forex profit calculated?", a: "Profit = (Sell Rate - Buy Rate) × Amount. Transaction costs and spreads reduce actual profit." },
    ],
    "investment-fee-impact-calculator": [
      { q: "How much do fees impact returns?", a: "A 1% higher fee can reduce your final corpus by 20-30% over 20-30 years. Even small fees compound significantly." },
      { q: "What are typical mutual fund fees?", a: "Index funds: 0.1-0.5%. Active funds: 1-2%. PMS: 2-3%. Always check the expense ratio before investing." },
    ],
    "rent-vs-buy-calculator": [
      { q: "Is renting really throwing away money?", a: "Not necessarily. Renting offers flexibility, no maintenance costs, and the down payment can be invested elsewhere." },
      { q: "When does buying make sense?", a: "Buying makes sense if you plan to stay in one place for 5+ years, have a stable income, and property prices are reasonable relative to rent." },
    ],
    "financial-goal-planner": [
      { q: "How many financial goals should I have?", a: "Focus on 3-5 major goals at a time. Too many goals spread your resources thin and make it harder to achieve any of them." },
    ],
  };
  return all[slug] || [
    { q: "How does this calculator work?", a: "Enter your financial details and the calculator provides instant results based on standard financial formulas." },
    { q: "Are the results guaranteed?", a: "Results are estimates based on your inputs. Actual returns may vary based on market conditions and other factors." },
  ];
}
