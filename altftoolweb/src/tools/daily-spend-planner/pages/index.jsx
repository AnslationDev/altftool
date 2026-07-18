"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bus,
  CalendarClock,
  Copy,
  PartyPopper,
  PiggyBank,
  Plus,
  RotateCcw,
  Trash2,
  TrendingDown,
  TrendingUp,
  Utensils,
  WalletMinimal,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const STORAGE_KEY = "altf:daily-spend-planner:v1";

const DEFAULT_COMMITMENTS = [
  { id: "c1", label: "Rent", amount: 18000 },
  { id: "c2", label: "Loan EMI", amount: 9500 },
  { id: "c3", label: "Utilities & bills", amount: 3200 },
  { id: "c4", label: "Subscriptions", amount: 800 },
];

const DEFAULT_ENVELOPES = [
  { id: "food", label: "Food & groceries", icon: Utensils, pct: 45 },
  { id: "transport", label: "Transport", icon: Bus, pct: 20 },
  { id: "fun", label: "Fun & everything else", icon: PartyPopper, pct: 35 },
];

const DEFAULTS = {
  income: 75000,
  commitments: DEFAULT_COMMITMENTS,
  savingsMode: "percent",
  savingsPct: 20,
  savingsAmount: 15000,
  spentSoFar: 6200,
  envelopePcts: { food: 45, transport: 20, fun: 35 },
};

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatMoney = (value) => inr.format(Number.isFinite(value) ? value : 0);

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const daysInMonthOf = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

const daysLeftInWeekFrom = (date) => {
  const day = date.getDay();
  return day === 0 ? 1 : 8 - day;
};

const inputClass =
  "h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]";

function ProgressBar({ value, color }) {
  const pct = Math.min(100, Math.max(0, value * 100));
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--muted)]">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default function ToolHome() {
  const [income, setIncome] = useState(DEFAULTS.income);
  const [commitments, setCommitments] = useState(DEFAULTS.commitments);
  const [savingsMode, setSavingsMode] = useState(DEFAULTS.savingsMode);
  const [savingsPct, setSavingsPct] = useState(DEFAULTS.savingsPct);
  const [savingsAmount, setSavingsAmount] = useState(DEFAULTS.savingsAmount);
  const [spentSoFar, setSpentSoFar] = useState(DEFAULTS.spentSoFar);
  const [envelopePcts, setEnvelopePcts] = useState(DEFAULTS.envelopePcts);
  const [today, setToday] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);

  const rowCounter = useRef(100);

  useEffect(() => {
    setToday(new Date());
    let stored = null;
    try {
      stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
    } catch {}
    if (stored && typeof stored === "object") {
      if (Number.isFinite(stored.income)) setIncome(stored.income);
      if (Number.isFinite(stored.savingsPct)) setSavingsPct(stored.savingsPct);
      if (Number.isFinite(stored.savingsAmount)) setSavingsAmount(stored.savingsAmount);
      if (Number.isFinite(stored.spentSoFar)) setSpentSoFar(stored.spentSoFar);
      if (stored.savingsMode === "percent" || stored.savingsMode === "amount") setSavingsMode(stored.savingsMode);
      if (Array.isArray(stored.commitments)) {
        const rows = stored.commitments
          .filter((row) => row && typeof row.id === "string" && typeof row.label === "string")
          .map((row) => ({ id: row.id, label: row.label, amount: toNumber(row.amount) }));
        if (rows.length > 0) setCommitments(rows);
      }
      if (stored.envelopePcts && typeof stored.envelopePcts === "object") {
        const next = { ...DEFAULTS.envelopePcts };
        DEFAULT_ENVELOPES.forEach((env) => {
          if (Number.isFinite(stored.envelopePcts[env.id])) next[env.id] = stored.envelopePcts[env.id];
        });
        setEnvelopePcts(next);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ income, commitments, savingsMode, savingsPct, savingsAmount, spentSoFar, envelopePcts })
      );
    } catch {}
  }, [commitments, envelopePcts, hydrated, income, savingsAmount, savingsMode, savingsPct, spentSoFar]);

  const commitmentsTotal = useMemo(
    () => commitments.reduce((sum, row) => sum + toNumber(row.amount), 0),
    [commitments]
  );

  const savingsTarget = useMemo(
    () => (savingsMode === "percent" ? (toNumber(income) * toNumber(savingsPct)) / 100 : toNumber(savingsAmount)),
    [income, savingsAmount, savingsMode, savingsPct]
  );

  const discretionaryPool = toNumber(income) - commitmentsTotal - savingsTarget;

  const monthMath = useMemo(() => {
    if (!today) return null;
    const totalDays = daysInMonthOf(today);
    const dayOfMonth = today.getDate();
    const daysRemaining = totalDays - dayOfMonth + 1;
    const daysElapsed = dayOfMonth;
    const plannedPerDay = totalDays > 0 ? discretionaryPool / totalDays : 0;
    const remainingPool = discretionaryPool - toNumber(spentSoFar);
    const safePerDay = daysRemaining > 0 ? remainingPool / daysRemaining : 0;
    const pace = daysElapsed > 0 ? toNumber(spentSoFar) / daysElapsed : 0;
    const monthProgress = totalDays > 0 ? daysElapsed / totalDays : 0;
    const spendProgress = discretionaryPool > 0 ? toNumber(spentSoFar) / discretionaryPool : 0;
    const daysLeftThisWeek = Math.min(daysLeftInWeekFrom(today), daysRemaining);
    return {
      totalDays,
      dayOfMonth,
      daysRemaining,
      daysElapsed,
      plannedPerDay,
      remainingPool,
      safePerDay,
      pace,
      monthProgress,
      spendProgress,
      daysLeftThisWeek,
      weekAllowance: safePerDay * daysLeftThisWeek,
      next7Allowance: safePerDay * Math.min(7, daysRemaining),
      monthLabel: today.toLocaleString(undefined, { month: "long", year: "numeric" }),
    };
  }, [discretionaryPool, spentSoFar, today]);

  const verdict = useMemo(() => {
    if (!monthMath) return null;
    if (discretionaryPool <= 0) {
      return {
        tone: "danger",
        title: "Nothing left to spend",
        body: "Your commitments and savings goal already use up your whole income. Trim a commitment or lower the savings target before planning daily spending.",
      };
    }
    if (monthMath.remainingPool < 0) {
      return {
        tone: "danger",
        title: `Over budget by ${formatMoney(Math.abs(monthMath.remainingPool))}`,
        body: `You have already spent more than the discretionary pool for the whole of ${monthMath.monthLabel}. Anything further this month comes out of your savings goal.`,
      };
    }
    const gap = monthMath.pace - monthMath.plannedPerDay;
    if (gap > monthMath.plannedPerDay * 0.05) {
      return {
        tone: "danger",
        title: `${formatMoney(monthMath.pace)}/day pace vs ${formatMoney(monthMath.plannedPerDay)} plan — trim ${formatMoney(gap)}/day`,
        body: `Keep this pace up and you will run out around day ${Math.max(1, Math.floor(discretionaryPool / monthMath.pace))} of ${monthMath.totalDays}. Spending ${formatMoney(monthMath.safePerDay)}/day from here still lands you on target.`,
      };
    }
    if (gap < -monthMath.plannedPerDay * 0.05) {
      return {
        tone: "success",
        title: `${formatMoney(monthMath.pace)}/day pace vs ${formatMoney(monthMath.plannedPerDay)} plan — ${formatMoney(Math.abs(gap))}/day under`,
        body: `You are running under plan, which frees up ${formatMoney(monthMath.safePerDay)}/day for the rest of the month. Bank the difference and your savings goal beats target.`,
      };
    }
    return {
      tone: "success",
      title: `On pace at ${formatMoney(monthMath.pace)}/day`,
      body: `That is right on the ${formatMoney(monthMath.plannedPerDay)}/day plan. Hold ${formatMoney(monthMath.safePerDay)}/day for the remaining ${monthMath.daysRemaining} day${monthMath.daysRemaining === 1 ? "" : "s"} and you finish the month exactly on target.`,
    };
  }, [discretionaryPool, monthMath]);

  const envelopeTotalPct = DEFAULT_ENVELOPES.reduce((sum, env) => sum + toNumber(envelopePcts[env.id]), 0);

  const envelopes = useMemo(() => {
    if (!monthMath) return [];
    const denom = envelopeTotalPct > 0 ? envelopeTotalPct : 1;
    return DEFAULT_ENVELOPES.map((env) => {
      const share = toNumber(envelopePcts[env.id]) / denom;
      return {
        ...env,
        share,
        perDay: monthMath.safePerDay * share,
        remaining: monthMath.remainingPool * share,
      };
    });
  }, [envelopePcts, envelopeTotalPct, monthMath]);

  const addCommitment = () => {
    rowCounter.current += 1;
    setCommitments((rows) => [...rows, { id: `c${rowCounter.current}`, label: "", amount: 0 }]);
  };

  const removeCommitment = (id) => setCommitments((rows) => rows.filter((row) => row.id !== id));

  const updateCommitment = (id, patch) =>
    setCommitments((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const resetAll = () => {
    setIncome(DEFAULTS.income);
    setCommitments(DEFAULTS.commitments);
    setSavingsMode(DEFAULTS.savingsMode);
    setSavingsPct(DEFAULTS.savingsPct);
    setSavingsAmount(DEFAULTS.savingsAmount);
    setSpentSoFar(DEFAULTS.spentSoFar);
    setEnvelopePcts(DEFAULTS.envelopePcts);
  };

  const plan = useMemo(() => {
    if (!monthMath) return "";
    return [
      `Safe-to-Spend plan — ${monthMath.monthLabel}`,
      `Day ${monthMath.dayOfMonth} of ${monthMath.totalDays} · ${monthMath.daysRemaining} day${monthMath.daysRemaining === 1 ? "" : "s"} left`,
      "",
      `Monthly income: ${formatMoney(income)}`,
      ...commitments.map((row) => `  - ${row.label || "Untitled"}: ${formatMoney(toNumber(row.amount))}`),
      `Fixed commitments total: ${formatMoney(commitmentsTotal)}`,
      savingsMode === "percent"
        ? `Savings goal: ${savingsPct}% = ${formatMoney(savingsTarget)}`
        : `Savings goal: ${formatMoney(savingsTarget)}`,
      `Discretionary pool: ${formatMoney(discretionaryPool)}`,
      "",
      `Spent so far this month: ${formatMoney(toNumber(spentSoFar))}`,
      `Left to spend: ${formatMoney(monthMath.remainingPool)}`,
      `SAFE TO SPEND: ${formatMoney(monthMath.safePerDay)}/day for the next ${monthMath.daysRemaining} day${monthMath.daysRemaining === 1 ? "" : "s"}`,
      `Rest of this week: ${formatMoney(monthMath.weekAllowance)} across ${monthMath.daysLeftThisWeek} day${monthMath.daysLeftThisWeek === 1 ? "" : "s"}`,
      `Next 7 days: ${formatMoney(monthMath.next7Allowance)}`,
      "",
      `Pace check: ${formatMoney(monthMath.pace)}/day actual vs ${formatMoney(monthMath.plannedPerDay)}/day plan`,
      verdict ? verdict.title : "",
      "",
      "Daily envelopes:",
      ...envelopes.map(
        (env) => `  - ${env.label}: ${formatMoney(env.perDay)}/day (${Math.round(env.share * 100)}%)`
      ),
    ].join("\n");
  }, [
    commitments,
    commitmentsTotal,
    discretionaryPool,
    envelopes,
    income,
    monthMath,
    savingsMode,
    savingsPct,
    savingsTarget,
    spentSoFar,
    verdict,
  ]);

  const copyPlan = async () => {
    const success = await safeCopyText(plan);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const verdictColor = (tone) => (tone === "danger" ? "var(--anslation-ds-danger)" : "var(--anslation-ds-success)");
  const verdictBg = (tone) =>
    tone === "danger" ? "var(--anslation-ds-danger-soft)" : "var(--anslation-ds-success-soft)";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <WalletMinimal className="h-4 w-4" />
            Budget planner
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Safe-to-Spend Daily Planner</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Take your income, subtract the bills you cannot skip and the savings you actually want to keep, and see the
            one number that matters: what is genuinely safe to spend today. It counts only the days left in this month,
            and adjusts as you log what you have already spent.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,440px)_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Your month</h2>
              <button
                type="button"
                onClick={resetAll}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>

            <label className="block">
              <span className="text-sm font-semibold">Monthly take-home income</span>
              <input
                type="number"
                min={0}
                value={income}
                onChange={(event) => setIncome(toNumber(event.target.value))}
                className={`mt-2 ${inputClass}`}
              />
            </label>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">Fixed commitments</span>
                <button
                  type="button"
                  onClick={addCommitment}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add row
                </button>
              </div>
              {commitments.length > 0 ? (
                <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-[var(--muted-foreground)]">
                  <span className="min-w-0 flex-1">Commitment</span>
                  <span className="w-28 shrink-0">Amount</span>
                  <span className="w-10 shrink-0" />
                </div>
              ) : null}
              <div className="grid gap-2">
                {commitments.map((row, index) => (
                  <div key={row.id} className="flex items-center gap-2">
                    <label className="sr-only" htmlFor={`label-${row.id}`}>
                      Commitment {index + 1} name
                    </label>
                    <input
                      id={`label-${row.id}`}
                      type="text"
                      value={row.label}
                      placeholder="e.g. Rent"
                      onChange={(event) => updateCommitment(row.id, { label: event.target.value })}
                      className="h-11 min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                    />
                    <label className="sr-only" htmlFor={`amount-${row.id}`}>
                      Commitment {index + 1} amount
                    </label>
                    <input
                      id={`amount-${row.id}`}
                      type="number"
                      min={0}
                      value={row.amount}
                      onChange={(event) => updateCommitment(row.id, { amount: toNumber(event.target.value) })}
                      className="h-11 w-28 shrink-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                    />
                    <button
                      type="button"
                      onClick={() => removeCommitment(row.id)}
                      aria-label={`Remove ${row.label || `commitment ${index + 1}`}`}
                      className="flex h-11 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {commitments.length === 0 ? (
                  <p className="rounded-md bg-[var(--muted)] p-3 text-sm text-[var(--muted-foreground)]">
                    No commitments yet. Add rent, EMIs, and bills to get a realistic number.
                  </p>
                ) : null}
              </div>
              <div className="mt-2 flex items-center justify-between rounded-md bg-[var(--muted)] px-3 py-2 text-sm">
                <span className="text-[var(--muted-foreground)]">Commitments total</span>
                <span className="font-semibold tabular-nums">{formatMoney(commitmentsTotal)}</span>
              </div>
            </div>

            <div className="mt-5">
              <span className="text-sm font-semibold">Savings goal</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  { id: "percent", label: "% of income" },
                  { id: "amount", label: "Fixed amount" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSavingsMode(item.id)}
                    aria-pressed={savingsMode === item.id}
                    className={`rounded-md border px-3 py-2.5 text-sm font-semibold transition ${
                      savingsMode === item.id
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              {savingsMode === "percent" ? (
                <label className="mt-3 block">
                  <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                    <span>Save {savingsPct}% of income</span>
                    <span className="tabular-nums text-[var(--muted-foreground)]">{formatMoney(savingsTarget)}</span>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={60}
                    step={1}
                    value={savingsPct}
                    onChange={(event) => setSavingsPct(toNumber(event.target.value))}
                    className="mt-3 w-full accent-[var(--primary)]"
                  />
                </label>
              ) : (
                <label className="mt-3 block">
                  <span className="text-sm font-semibold">Save this much each month</span>
                  <input
                    type="number"
                    min={0}
                    value={savingsAmount}
                    onChange={(event) => setSavingsAmount(toNumber(event.target.value))}
                    className={`mt-2 ${inputClass}`}
                  />
                </label>
              )}
            </div>

            <label className="mt-5 block">
              <span className="text-sm font-semibold">Discretionary spent so far this month</span>
              <input
                type="number"
                min={0}
                value={spentSoFar}
                onChange={(event) => setSpentSoFar(toNumber(event.target.value))}
                className={`mt-2 ${inputClass}`}
              />
              <span className="mt-2 block text-xs leading-5 text-[var(--muted-foreground)]">
                Only day-to-day spending — food, travel, going out. Leave rent and EMIs out; they are already above.
              </span>
            </label>

            <p className="mt-5 text-xs leading-5 text-[var(--muted-foreground)]">
              Everything here saves to this browser automatically, so your plan is still here next time.
            </p>
          </div>

          <div className="grid gap-6">
            {!monthMath ? (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                <p className="text-sm text-[var(--muted-foreground)]">Loading your plan…</p>
              </div>
            ) : (
              <>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                      <CalendarClock className="h-4 w-4" />
                      {monthMath.monthLabel} · day {monthMath.dayOfMonth} of {monthMath.totalDays} ·{" "}
                      {monthMath.daysRemaining} left
                    </p>
                    <button type="button" onClick={copyPlan} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                      <Copy className="h-4 w-4" />
                      {copied ? "Copied" : "Copy plan"}
                    </button>
                  </div>

                  <div className="mt-4" aria-live="polite">
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                      Safe to spend per day
                    </p>
                    <p className="mt-1 text-5xl font-semibold text-[var(--primary)] tabular-nums">
                      {formatMoney(monthMath.safePerDay)}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                      Formula: (discretionary pool − spent so far) ÷ days left in the month = (
                      {formatMoney(discretionaryPool)} − {formatMoney(toNumber(spentSoFar))}) ÷{" "}
                      {monthMath.daysRemaining} day{monthMath.daysRemaining === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="tool-compact-grid mt-5">
                    {[
                      ["Discretionary pool", formatMoney(discretionaryPool)],
                      ["Left to spend", formatMoney(monthMath.remainingPool)],
                      ["Rest of this week", formatMoney(monthMath.weekAllowance)],
                      ["Next 7 days", formatMoney(monthMath.next7Allowance)],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                        <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                        <p className="mt-1 font-semibold tabular-nums">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Where it goes</p>
                    <ul className="mt-2 divide-y divide-[var(--border)] text-sm">
                      {[
                        ["Monthly income", formatMoney(income), false],
                        ["Fixed commitments", `− ${formatMoney(commitmentsTotal)}`, false],
                        [
                          savingsMode === "percent" ? `Savings goal (${savingsPct}%)` : "Savings goal",
                          `− ${formatMoney(savingsTarget)}`,
                          false,
                        ],
                        ["Discretionary pool", formatMoney(discretionaryPool), true],
                      ].map(([label, value, strong]) => (
                        <li key={label} className="flex items-center justify-between gap-3 py-2">
                          <span className={strong ? "font-semibold" : "text-[var(--muted-foreground)]"}>{label}</span>
                          <span
                            className={`tabular-nums ${strong ? "font-semibold text-[var(--primary)]" : "font-semibold"}`}
                          >
                            {value}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {verdict ? (
                  <div
                    className="rounded-lg border p-6"
                    style={{ borderColor: verdictColor(verdict.tone), background: verdictBg(verdict.tone) }}
                    aria-live="polite"
                  >
                    <p
                      className="flex items-center gap-2 text-lg font-semibold"
                      style={{ color: verdictColor(verdict.tone) }}
                    >
                      {verdict.tone === "danger" ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : (
                        <TrendingDown className="h-5 w-5" />
                      )}
                      {verdict.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{verdict.body}</p>
                  </div>
                ) : null}

                <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                  <h2 className="text-lg font-semibold">Month progress vs spend progress</h2>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    If the spend bar is ahead of the month bar, you are burning the pool faster than time is passing.
                  </p>
                  <div className="mt-4 grid gap-4">
                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="font-semibold">Month elapsed</span>
                        <span className="tabular-nums text-[var(--muted-foreground)]">
                          {Math.round(monthMath.monthProgress * 100)}% · day {monthMath.dayOfMonth}/
                          {monthMath.totalDays}
                        </span>
                      </div>
                      <ProgressBar value={monthMath.monthProgress} color="var(--muted-foreground)" />
                    </div>
                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="font-semibold">Pool spent</span>
                        <span className="tabular-nums text-[var(--muted-foreground)]">
                          {Math.round(monthMath.spendProgress * 100)}% · {formatMoney(toNumber(spentSoFar))} of{" "}
                          {formatMoney(Math.max(0, discretionaryPool))}
                        </span>
                      </div>
                      <ProgressBar
                        value={monthMath.spendProgress}
                        color={
                          monthMath.spendProgress > monthMath.monthProgress
                            ? "var(--anslation-ds-danger)"
                            : "var(--anslation-ds-success)"
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold">Envelope split</h2>
                      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                        Break the daily number into buckets so one takeaway does not quietly eat the travel budget.
                      </p>
                    </div>
                    <span
                      className="rounded-full px-2.5 py-1 text-xs font-semibold"
                      style={{
                        background: envelopeTotalPct === 100 ? "var(--anslation-ds-success-soft)" : "var(--muted)",
                        color:
                          envelopeTotalPct === 100
                            ? "var(--anslation-ds-success)"
                            : "var(--muted-foreground)",
                      }}
                    >
                      {envelopeTotalPct}% allocated
                    </span>
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    {envelopes.map((env) => {
                      const Icon = env.icon;
                      return (
                        <div
                          key={env.id}
                          className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4"
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-[var(--primary)]" />
                            <span className="text-sm font-semibold">{env.label}</span>
                          </div>
                          <p className="mt-2 text-2xl font-semibold text-[var(--primary)] tabular-nums">
                            {formatMoney(env.perDay)}
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)]">per day</p>
                          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                            {formatMoney(env.remaining)} left this month
                          </p>
                          <label className="mt-3 block">
                            <span className="flex items-center justify-between text-xs font-semibold">
                              <span>Share</span>
                              <span className="tabular-nums text-[var(--muted-foreground)]">
                                {toNumber(envelopePcts[env.id])}%
                              </span>
                            </span>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={5}
                              value={toNumber(envelopePcts[env.id])}
                              onChange={(event) =>
                                setEnvelopePcts((prev) => ({ ...prev, [env.id]: toNumber(event.target.value) }))
                              }
                              className="mt-2 w-full accent-[var(--primary)]"
                            />
                          </label>
                        </div>
                      );
                    })}
                  </div>
                  {envelopeTotalPct !== 100 ? (
                    <p className="mt-3 rounded-md bg-[var(--muted)] p-3 text-sm text-[var(--muted-foreground)]">
                      Your shares add up to {envelopeTotalPct}%, so the amounts above are scaled to fit the daily number
                      exactly. Nudge the sliders to 100% for a clean split.
                    </p>
                  ) : null}
                </div>

                <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                  <div className="flex items-center gap-2">
                    <PiggyBank className="h-5 w-5 text-[var(--primary)]" />
                    <h2 className="text-lg font-semibold">How this number works</h2>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm leading-6 text-[var(--muted-foreground)] sm:grid-cols-2">
                    <p>
                      <span className="font-semibold text-[var(--foreground)]">Savings comes out first.</span> The pool
                      is what is left after your goal is already set aside, so hitting the daily number means you save
                      by default rather than saving whatever survives to month end.
                    </p>
                    <p>
                      <span className="font-semibold text-[var(--foreground)]">It counts days left, not days total.</span>{" "}
                      A heavy weekend does not blow the month — it just lowers tomorrow&apos;s number. The plan
                      re-balances itself every time you update what you have spent.
                    </p>
                    <p>
                      <span className="font-semibold text-[var(--foreground)]">Pace is the early warning.</span> Your
                      pace is spending so far ÷ {monthMath.daysElapsed} day
                      {monthMath.daysElapsed === 1 ? "" : "s"} elapsed. Compared against the flat plan of{" "}
                      {formatMoney(monthMath.plannedPerDay)}/day, it tells you on day 8 what you would otherwise find
                      out on day 28.
                    </p>
                    <p>
                      <span className="font-semibold text-[var(--foreground)]">Keep commitments honest.</span> Anything
                      that leaves your account whether or not you get out of bed — rent, EMIs, insurance, school fees,
                      subscriptions — belongs in commitments, not in daily spending.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
