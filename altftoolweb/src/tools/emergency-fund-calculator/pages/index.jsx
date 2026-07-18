"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  FileDown,
  Landmark,
  LifeBuoy,
  PiggyBank,
  Plus,
  RotateCcw,
  Shield,
  ShieldCheck,
  Trash2,
  Wallet,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const NOW = new Date();

const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

const defaultExpenses = [
  { id: 1, label: "Rent / home loan EMI", amount: 18000 },
  { id: 2, label: "Groceries & household", amount: 9000 },
  { id: 3, label: "Utilities, phone & internet", amount: 3500 },
  { id: 4, label: "Insurance premiums", amount: 2500 },
  { id: 5, label: "School fees / childcare", amount: 4000 },
  { id: 6, label: "Transport, medicines & misc", amount: 3500 },
];

const defaultQuiz = { job: 1, income: 0, dependents: 1, health: 1 };

const quizQuestions = [
  {
    id: "job",
    label: "Job / income stability",
    options: [
      { value: 0, label: "Government / very stable job" },
      { value: 1, label: "Private salaried, stable industry" },
      { value: 2, label: "Freelance / variable income" },
      { value: 3, label: "Business / seasonal income" },
    ],
  },
  {
    id: "income",
    label: "Household earners",
    options: [
      { value: 0, label: "Dual income household" },
      { value: 2, label: "Single income household" },
    ],
  },
  {
    id: "dependents",
    label: "Dependents",
    options: [
      { value: 0, label: "No dependents" },
      { value: 1, label: "1–2 dependents" },
      { value: 2, label: "3 or more dependents" },
    ],
  },
  {
    id: "health",
    label: "Health cover",
    options: [
      { value: 0, label: "Comprehensive family floater" },
      { value: 1, label: "Employer cover only" },
      { value: 2, label: "No health insurance" },
    ],
  },
];

const fundOptions = [
  { months: 3, tag: "Lean" },
  { months: 6, tag: "Standard" },
  { months: 9, tag: "Cautious" },
  { months: 12, tag: "Max safety" },
];

const emergencyYes = [
  "Job loss or a long gap between pay cheques",
  "Medical event not fully covered by insurance",
  "Urgent home or vehicle repair you cannot postpone",
  "Emergency family travel",
  "Hospital deposit or insurance deductible",
];

const emergencyNo = [
  "A festive sale or a discount that ends tonight",
  "Vacations, weddings and gifts",
  "Gadget or vehicle upgrades",
  "Down payment for a house or car",
  "Investing when the market dips",
];

const parkingTiers = (tier1, tier2, tier3) => [
  {
    icon: Wallet,
    name: "Savings account + sweep-in FD",
    access: "Instant — ATM / UPI, any hour",
    amount: tier1,
    note: "Sweep-in auto-breaks an FD when you spend, so idle cash still earns FD rates.",
  },
  {
    icon: PiggyBank,
    name: "Liquid / overnight mutual fund",
    access: "1 working day (many apps redeem up to ₹50,000 instantly)",
    amount: tier2,
    note: "Low-risk debt funds that typically beat savings-account interest.",
  },
  {
    icon: Landmark,
    name: "Short-term FDs / arbitrage funds",
    access: "2–3 days",
    amount: tier3,
    note: "The rarely-touched layer — better post-tax returns, break only in a true emergency.",
  },
];

function recommendMonths(score) {
  if (score <= 1) return 3;
  if (score <= 4) return 6;
  if (score <= 6) return 9;
  return 12;
}

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ToolHome() {
  const [expenses, setExpenses] = useState(defaultExpenses);
  const [quiz, setQuiz] = useState(defaultQuiz);
  const [currentSavings, setCurrentSavings] = useState(60000);
  const [setAside, setSetAside] = useState(10000);
  const [copied, setCopied] = useState(false);

  const monthlyTotal = useMemo(
    () => expenses.reduce((sum, row) => sum + Math.max(Number(row.amount) || 0, 0), 0),
    [expenses]
  );

  const score = useMemo(
    () => quizQuestions.reduce((sum, q) => sum + (Number(quiz[q.id]) || 0), 0),
    [quiz]
  );

  const recMonths = recommendMonths(score);
  const target = monthlyTotal * recMonths;
  const savings = Math.max(Number(currentSavings) || 0, 0);
  const gap = Math.max(target - savings, 0);
  const progress = target > 0 ? Math.min((savings / target) * 100, 100) : 0;
  const pace = Math.max(Number(setAside) || 0, 0);
  const monthsToGoal = gap <= 0 ? 0 : pace > 0 ? Math.ceil(gap / pace) : null;
  const etaLabel =
    monthsToGoal && monthsToGoal > 0
      ? new Date(NOW.getFullYear(), NOW.getMonth() + monthsToGoal, 1).toLocaleDateString("en-IN", {
          month: "short",
          year: "numeric",
        })
      : null;

  const riskReasons = useMemo(() => {
    const reasons = [];
    if (Number(quiz.job) >= 2) reasons.push("variable income");
    if (Number(quiz.income) === 2) reasons.push("a single income");
    if (Number(quiz.dependents) === 2) reasons.push("3+ dependents");
    if (Number(quiz.health) === 2) reasons.push("no health cover");
    return reasons;
  }, [quiz]);

  const reasonLine =
    riskReasons.length > 0
      ? `Bigger cushion because of ${riskReasons.join(", ")}.`
      : recMonths === 3
        ? "Very stable profile — a lean 3-month cushion is enough."
        : "The standard cushion for a steady salaried profile.";

  const tier1 = Math.min(monthlyTotal, target);
  const tier2 = Math.min(monthlyTotal * 2, Math.max(target - tier1, 0));
  const tier3 = Math.max(target - tier1 - tier2, 0);

  const stepUpOptions = useMemo(() => {
    if (gap <= 0) return [];
    return [12, 18, 24]
      .map((months) => ({ months, amount: Math.ceil(gap / months / 100) * 100 }))
      .filter((option) => option.amount > 0);
  }, [gap]);

  const updateExpense = (id, patch) => {
    setExpenses((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const removeExpense = (id) => {
    setExpenses((rows) => (rows.length > 1 ? rows.filter((row) => row.id !== id) : rows));
  };

  const addExpense = () => {
    setExpenses((rows) => [...rows, { id: Date.now(), label: "", amount: 0 }]);
  };

  const resetAll = () => {
    setExpenses(defaultExpenses);
    setQuiz(defaultQuiz);
    setCurrentSavings(60000);
    setSetAside(10000);
  };

  const buildPlan = () => {
    const lines = [
      "Emergency Fund Plan — ALTFTool",
      "",
      `Monthly essentials: ${formatINR(monthlyTotal)}`,
      ...expenses
        .filter((row) => Number(row.amount) > 0)
        .map((row) => `  - ${row.label || "Expense"}: ${formatINR(Number(row.amount) || 0)}`),
      "",
      `Safety profile score: ${score}/9 -> keep ${recMonths} months of expenses`,
      `Target fund: ${formatINR(target)} (${formatINR(monthlyTotal)} x ${recMonths} months)`,
      `Saved so far: ${formatINR(savings)} (${Math.round(progress)}% funded)`,
      `Gap: ${formatINR(gap)}`,
    ];
    if (gap > 0 && pace > 0 && monthsToGoal) {
      lines.push(`Monthly set-aside: ${formatINR(pace)} -> fully funded in ${monthsToGoal} months (~${etaLabel})`);
    } else if (gap > 0) {
      lines.push("Monthly set-aside: not set yet");
    } else {
      lines.push("Status: goal reached — keep the fund topped up as expenses grow");
    }
    lines.push(
      "",
      "Where to park it:",
      `  1. Instant (savings + sweep-in FD): ${formatINR(tier1)}`,
      `  2. Next-day (liquid / overnight fund): ${formatINR(tier2)}`,
      `  3. 2–3 day (short-term FDs): ${formatINR(tier3)}`,
      "",
      `Generated: ${new Date().toLocaleString("en-IN")}`
    );
    return lines.join("\n");
  };

  const copyPlan = async () => {
    const success = await safeCopyText(buildPlan());
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Shield className="h-4 w-4" />
            Financial safety net
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Emergency Fund Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Build your fund from real monthly essentials, answer four quick stability questions to
            get a personalised target, and see exactly how many months of saving will close the gap.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[420px_1fr]">
          <div className="grid content-start gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase text-[var(--muted-foreground)]">
                  1. Monthly essentials
                </h2>
                <button
                  type="button"
                  onClick={resetAll}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                Only survival costs — skip dining out, OTT and shopping. This is what life costs when
                income stops.
              </p>
              <div className="mt-4 grid grid-cols-[1fr_112px_36px] gap-2 text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                <span>Expense</span>
                <span>₹ / month</span>
                <span className="sr-only">Remove</span>
              </div>
              <div className="mt-2 grid gap-2">
                {expenses.map((row) => (
                  <div key={row.id} className="grid grid-cols-[1fr_112px_36px] items-center gap-2">
                    <input
                      type="text"
                      value={row.label}
                      placeholder="Expense name"
                      aria-label="Expense name"
                      onChange={(event) => updateExpense(row.id, { label: event.target.value })}
                      className="h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                    />
                    <input
                      type="number"
                      min="0"
                      value={row.amount}
                      aria-label={`Monthly amount for ${row.label || "expense"}`}
                      onChange={(event) => updateExpense(row.id, { amount: Number(event.target.value) })}
                      className="h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                    />
                    <button
                      type="button"
                      onClick={() => removeExpense(row.id)}
                      disabled={expenses.length === 1}
                      aria-label={`Remove ${row.label || "expense"} row`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted-foreground)] transition hover:border-[var(--anslation-ds-danger)] hover:text-[var(--anslation-ds-danger)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addExpense}
                className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
              >
                <Plus className="h-4 w-4" />
                Add expense row
              </button>
              <div className="mt-4 flex items-center justify-between rounded-md bg-[var(--muted)] px-4 py-3">
                <span className="text-sm font-semibold">Essentials total</span>
                <span className="text-lg font-semibold text-[var(--primary)]">{formatINR(monthlyTotal)}</span>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="text-sm font-semibold uppercase text-[var(--muted-foreground)]">
                2. Stability quiz
              </h2>
              <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                Four quick answers decide how many months of cover you actually need.
              </p>
              <div className="mt-4 grid gap-4">
                {quizQuestions.map((question) => (
                  <label key={question.id} className="block">
                    <span className="text-sm font-semibold">{question.label}</span>
                    <select
                      value={quiz[question.id]}
                      onChange={(event) =>
                        setQuiz((current) => ({ ...current, [question.id]: Number(event.target.value) }))
                      }
                      className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                    >
                      {question.options.map((option) => (
                        <option key={option.label} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="grid content-start gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]" aria-live="polite">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  Your emergency fund target
                </p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={copyPlan} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied" : "Copy plan"}
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadTextFile("emergency-fund-plan.txt", buildPlan())}
                    className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                  >
                    <FileDown className="h-4 w-4" />
                    Download
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {fundOptions.map((option) => (
                  <div
                    key={option.months}
                    className={`rounded-md border p-4 ${
                      option.months === recMonths
                        ? "border-[var(--primary)] bg-[var(--muted)]"
                        : "border-[var(--border)] bg-[var(--background)]"
                    }`}
                  >
                    {option.months === recMonths ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--primary)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--primary-foreground)]">
                        <ShieldCheck className="h-3 w-3" />
                        Recommended
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--muted-foreground)]">
                        {option.tag}
                      </span>
                    )}
                    <p className="mt-2 text-xs text-[var(--muted-foreground)]">{option.months} months</p>
                    <p className="mt-1 text-xl font-semibold text-[var(--foreground)]">
                      {formatINR(monthlyTotal * option.months)}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                Profile score {score}/9 → <span className="font-semibold text-[var(--foreground)]">{recMonths} months</span>. {reasonLine}
              </p>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Formula: target = monthly essentials × recommended months = {formatINR(monthlyTotal)} × {recMonths}
              </p>
              {monthlyTotal === 0 && (
                <p className="mt-3 rounded-md bg-[var(--muted)] px-4 py-3 text-sm text-[var(--muted-foreground)]">
                  Add your monthly essentials on the left to size your fund.
                </p>
              )}
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Your progress</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold">Saved for emergencies so far (₹)</span>
                  <input
                    type="number"
                    min="0"
                    value={currentSavings}
                    onChange={(event) => setCurrentSavings(Number(event.target.value))}
                    className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Monthly set-aside (₹)</span>
                  <input
                    type="number"
                    min="0"
                    value={setAside}
                    onChange={(event) => setSetAside(Number(event.target.value))}
                    className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </label>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold">{Math.round(progress)}% funded</span>
                  <span className="text-[var(--muted-foreground)]">
                    {formatINR(savings)} of {formatINR(target)}
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${progress}%`,
                      background: progress >= 100 ? "var(--anslation-ds-success)" : "var(--primary)",
                    }}
                  />
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-xs text-[var(--muted-foreground)]">Gap remaining</p>
                  <p className="mt-1 text-lg font-semibold">{formatINR(gap)}</p>
                </div>
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-xs text-[var(--muted-foreground)]">Months to goal</p>
                  <p className="mt-1 text-lg font-semibold">
                    {gap <= 0 ? "Done" : monthsToGoal ? `${monthsToGoal} mo` : "—"}
                  </p>
                </div>
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-xs text-[var(--muted-foreground)]">Fully funded by</p>
                  <p className="mt-1 text-lg font-semibold">
                    {gap <= 0 ? "Today" : etaLabel || "—"}
                  </p>
                </div>
              </div>

              {gap > 0 && stepUpOptions.length > 0 && (
                <div className="mt-5">
                  <p className="text-sm font-semibold">Step it up — reach the goal sooner</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {stepUpOptions.map((option) => (
                      <button
                        key={option.months}
                        type="button"
                        onClick={() => setSetAside(option.amount)}
                        className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                      >
                        {formatINR(option.amount)}/mo → {option.months} months
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                    Tip: automate it. Set an auto-transfer for the day after salary credit, and raise
                    the amount by ~10% after every increment.
                  </p>
                </div>
              )}
              {gap <= 0 && target > 0 && (
                <p className="mt-5 inline-flex items-center gap-2 rounded-md bg-[var(--muted)] px-4 py-3 text-sm font-semibold text-[var(--anslation-ds-success)]">
                  <CheckCircle2 className="h-4 w-4" />
                  Goal reached — revisit the target once a year as expenses grow.
                </p>
              )}
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                Where to park it — liquidity ladder
              </p>
              <div className="mt-4 grid gap-3">
                {parkingTiers(tier1, tier2, tier3).map((tier, index) => (
                  <div
                    key={tier.name}
                    className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--muted)] text-[var(--primary)]">
                        <tier.icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold">
                          {index + 1}. {tier.name}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{tier.access}</p>
                        <p className="mt-1 max-w-md text-xs leading-5 text-[var(--muted-foreground)]">{tier.note}</p>
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-[var(--primary)]">{formatINR(tier.amount)}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                Ladder logic: an emergency rarely needs the whole fund on day one. Keep the first
                month instantly reachable and let the rest earn better returns one step away.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                What counts as an emergency
              </p>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--anslation-ds-success)]">
                    <LifeBuoy className="h-4 w-4" />
                    Use the fund for
                  </p>
                  <ul className="mt-3 grid gap-2">
                    {emergencyYes.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
                        <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[var(--anslation-ds-success)]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--anslation-ds-danger)]">
                    <AlertTriangle className="h-4 w-4" />
                    Not an emergency
                  </p>
                  <ul className="mt-3 grid gap-2">
                    {emergencyNo.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
                        <AlertTriangle className="mt-1 h-4 w-4 shrink-0 text-[var(--anslation-ds-danger)]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="mt-4 rounded-md bg-[var(--muted)] px-4 py-3 text-sm leading-6 text-[var(--muted-foreground)]">
                If you dip into the fund, pause other goals and refill it first — the cushion only
                works when it is full before the next surprise.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
