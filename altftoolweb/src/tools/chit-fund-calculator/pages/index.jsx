"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Copy,
  Info,
  RotateCcw,
  ShieldAlert,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const MAX_DISCOUNT = 40;
const STATUTORY_DISCOUNT_CAP = 30;
const STATUTORY_FOREMAN_CAP = 5;

const benchmarks = [
  { id: "fd", label: "Bank FD", rate: 7, role: "save" },
  { id: "rd", label: "Recurring deposit", rate: 6.5, role: "save" },
  { id: "ppf", label: "PPF", rate: 7.1, role: "save" },
  { id: "gold", label: "Gold loan", rate: 9.5, role: "borrow" },
  { id: "personal", label: "Personal loan", rate: 14, role: "borrow" },
];

const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

const formatSignedINR = (value) => `${value >= 0 ? "+" : "−"}${formatINR(Math.abs(value))}`;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const toNumber = (value, fallback = 0) => {
  const n = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
};

function solveEffectiveRate(flows) {
  const npv = (rate) => flows.reduce((sum, flow) => sum + flow.amount / Math.pow(1 + rate, flow.t), 0);
  const slope = (rate) =>
    flows.reduce((sum, flow) => sum - (flow.t * flow.amount) / Math.pow(1 + rate, flow.t + 1), 0);

  const roots = [];
  let previousRate = -0.9;
  let previousValue = npv(previousRate);
  for (let step = 1; step <= 2000; step += 1) {
    const currentRate = -0.9 + step * 0.005;
    const currentValue = npv(currentRate);
    if (
      Number.isFinite(previousValue) &&
      Number.isFinite(currentValue) &&
      previousValue * currentValue < 0
    ) {
      let low = previousRate;
      let high = currentRate;
      let lowValue = previousValue;
      for (let i = 0; i < 200; i += 1) {
        const mid = (low + high) / 2;
        const midValue = npv(mid);
        if (Math.abs(midValue) < 1e-9 || (high - low) / 2 < 1e-12) {
          low = mid;
          high = mid;
          break;
        }
        if (lowValue < 0 === midValue < 0) {
          low = mid;
          lowValue = midValue;
        } else {
          high = mid;
        }
      }
      roots.push((low + high) / 2);
    }
    previousRate = currentRate;
    previousValue = currentValue;
  }

  if (!roots.length) return { status: "undefined" };

  let rate = roots.reduce((best, value) => (Math.abs(value) < Math.abs(best) ? value : best));
  for (let i = 0; i < 60; i += 1) {
    const value = npv(rate);
    if (Math.abs(value) < 1e-10) break;
    const derivative = slope(rate);
    if (!Number.isFinite(derivative) || Math.abs(derivative) < 1e-12) break;
    const next = rate - value / derivative;
    if (!Number.isFinite(next) || next <= -0.999999 || next > 1e6) break;
    if (Math.abs(next - rate) < 1e-12) {
      rate = next;
      break;
    }
    rate = next;
  }
  return { status: "ok", rate };
}

function StatTile({ label, value, hint, tone }) {
  const color =
    tone === "up" ? "var(--anslation-ds-success)" : tone === "down" ? "var(--anslation-ds-danger)" : undefined;
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
      <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-1 font-semibold" style={color ? { color } : undefined}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-[var(--muted-foreground)]">{hint}</p>}
    </div>
  );
}

export default function ToolHome() {
  const [chitValue, setChitValue] = useState(500000);
  const [months, setMonths] = useState(25);
  const [foremanPct, setForemanPct] = useState(5);
  const [startPct, setStartPct] = useState(25);
  const [endPct, setEndPct] = useState(5);
  const [bidMonthInput, setBidMonthInput] = useState(25);
  const [copied, setCopied] = useState(false);

  const safeChit = clamp(toNumber(chitValue), 10000, 100000000);
  const safeMonths = Math.round(clamp(toNumber(months, 25), 5, 60));
  const safeForeman = clamp(toNumber(foremanPct), 0, 10);
  const safeStart = clamp(toNumber(startPct), 0, MAX_DISCOUNT);
  const safeEnd = clamp(toNumber(endPct), 0, MAX_DISCOUNT);
  const bidMonth = Math.round(clamp(toNumber(bidMonthInput, 1), 1, safeMonths));
  const subscription = safeChit / safeMonths;

  const result = useMemo(() => {
    const commissionCap = (safeForeman / 100) * safeChit;
    const rows = [];
    for (let month = 1; month <= safeMonths; month += 1) {
      const discountPct =
        safeMonths === 1 ? safeStart : safeStart + ((safeEnd - safeStart) * (month - 1)) / (safeMonths - 1);
      const discount = (discountPct / 100) * safeChit;
      const commission = Math.min(commissionCap, discount);
      const pool = discount - commission;
      const dividend = pool / safeMonths;
      rows.push({
        month,
        discountPct,
        discount,
        commission,
        prize: safeChit - discount,
        dividend,
        subscription,
        net: subscription - dividend,
      });
    }

    const totalPaid = rows.reduce((sum, row) => sum + row.net, 0);
    const totalDividend = rows.reduce((sum, row) => sum + row.dividend, 0);
    const received = rows[bidMonth - 1].prize;
    const netGain = received - totalPaid;

    const flows = rows.map((row) => ({
      t: (row.month - 1) / 12,
      amount: -row.net + (row.month === bidMonth ? row.prize : 0),
    }));

    const inflows = flows.filter((flow) => flow.amount > 0);
    const outflows = flows.filter((flow) => flow.amount < 0);
    const inflowTotal = inflows.reduce((sum, flow) => sum + flow.amount, 0);
    const outflowTotal = outflows.reduce((sum, flow) => sum + flow.amount, 0);
    const timeIn = inflowTotal ? inflows.reduce((sum, flow) => sum + flow.amount * flow.t, 0) / inflowTotal : 0;
    const timeOut = outflowTotal
      ? outflows.reduce((sum, flow) => sum + flow.amount * flow.t, 0) / outflowTotal
      : 0;
    const role = timeIn < timeOut ? "borrow" : "save";

    return {
      rows,
      totalPaid,
      totalDividend,
      received,
      netGain,
      role,
      solved: solveEffectiveRate(flows),
    };
  }, [safeChit, safeMonths, safeForeman, safeStart, safeEnd, bidMonth, subscription]);

  const ratePct = result.solved.status === "ok" ? result.solved.rate * 100 : null;
  const relevantBenchmarks = benchmarks.filter((item) => item.role === result.role);

  const summary = useMemo(() => {
    const rateLine =
      ratePct === null
        ? "Effective annualised rate: not defined for this bid month (the prize lands mid-term, so the flows are part loan and part savings)"
        : `Effective annualised rate (XIRR): ${ratePct.toFixed(2)}% — ${
            result.role === "borrow" ? "what this money costs you" : "what this chit earns you"
          }`;
    return [
      "Chit Fund Calculator Summary",
      "",
      `Chit value: ${formatINR(safeChit)}`,
      `Members / months: ${safeMonths}`,
      `Monthly subscription: ${formatINR(subscription)} (chit value / months)`,
      `Foreman commission: ${safeForeman}% of chit value each month`,
      `Discount assumption: ${safeStart}% in month 1 tapering to ${safeEnd}% in month ${safeMonths}`,
      "",
      `Your bidding month: ${bidMonth} of ${safeMonths}`,
      `Amount you receive: ${formatINR(result.received)}`,
      `Total you pay in over the term: ${formatINR(result.totalPaid)}`,
      `Total dividends received: ${formatINR(result.totalDividend)}`,
      `Net ${result.netGain >= 0 ? "gain" : "loss"}: ${formatSignedINR(result.netGain)}`,
      rateLine,
      "",
      "Chits are zero-sum minus the foreman's cut: bidding early is borrowing, bidding late is saving.",
      "Prefer chits registered under the Chit Funds Act, 1982.",
      `Generated: ${new Date().toLocaleString()}`,
    ].join("\n");
  }, [safeChit, safeMonths, safeForeman, safeStart, safeEnd, bidMonth, subscription, result, ratePct]);

  const copySummary = async () => {
    const success = await safeCopyText(summary);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const resetAll = () => {
    setChitValue(500000);
    setMonths(25);
    setForemanPct(5);
    setStartPct(25);
    setEndPct(5);
    setBidMonthInput(25);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <UsersRound className="h-4 w-4" />
            Chitty / kuri simulator
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Chit Fund Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Every month the pot is auctioned, the winning discount is shared back as dividend, and the foreman
            takes a cut. This runs the whole chit month by month and tells you what your bidding month actually
            costs — or earns.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="grid gap-5">
              <label className="block">
                <span className="text-sm font-semibold">Chit value (₹)</span>
                <input
                  type="number"
                  min={10000}
                  step={10000}
                  value={chitValue}
                  onChange={(event) => setChitValue(event.target.value)}
                  onBlur={() => setChitValue(safeChit)}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
                <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                  The full pot auctioned each month.
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-semibold">Members / months</span>
                <input
                  type="number"
                  min={5}
                  max={60}
                  step={1}
                  value={months}
                  onChange={(event) => {
                    setMonths(event.target.value);
                    const next = Math.round(clamp(toNumber(event.target.value, 25), 5, 60));
                    setBidMonthInput((previous) => Math.min(previous, next));
                  }}
                  onBlur={() => setMonths(safeMonths)}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
                <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                  A chit runs one month per member, so everybody wins exactly once.
                </span>
              </label>

              <div className="rounded-md border border-[var(--border)] bg-[var(--muted)] p-3">
                <p className="text-xs text-[var(--muted-foreground)]">Monthly subscription (auto)</p>
                <p className="mt-1 text-lg font-semibold text-[var(--primary)]">{formatINR(subscription)}</p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {formatINR(safeChit)} ÷ {safeMonths} months. Dividends bring the real payment below this.
                </p>
              </div>

              <label className="block">
                <span className="text-sm font-semibold">Foreman commission (%)</span>
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.5}
                  value={foremanPct}
                  onChange={(event) => setForemanPct(event.target.value)}
                  onBlur={() => setForemanPct(safeForeman)}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
                <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                  {formatINR((safeForeman / 100) * safeChit)} a month, taken out of the discount before any
                  dividend is shared. The Chit Funds Act caps this at {STATUTORY_FOREMAN_CAP}%.
                </span>
              </label>

              <div>
                <span className="text-sm font-semibold">Discount assumption</span>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Bidding is fierce early and quiet late, so the discount tapers. Set the two ends and the rest
                  is interpolated.
                </p>
                <div className="mt-3 grid gap-4 sm:grid-cols-2 2xl:grid-cols-1">
                  <label className="block">
                    <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                      Month 1 discount ({safeStart}%)
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={MAX_DISCOUNT}
                      step={1}
                      value={safeStart}
                      onChange={(event) => setStartPct(event.target.value)}
                      className="mt-2 w-full"
                      style={{ accentColor: "var(--primary)" }}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                      Month {safeMonths} discount ({safeEnd}%)
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={MAX_DISCOUNT}
                      step={1}
                      value={safeEnd}
                      onChange={(event) => setEndPct(event.target.value)}
                      className="mt-2 w-full"
                      style={{ accentColor: "var(--primary)" }}
                    />
                  </label>
                </div>
                {(safeStart > STATUTORY_DISCOUNT_CAP || safeEnd > STATUTORY_DISCOUNT_CAP) && (
                  <p className="mt-2 text-xs" style={{ color: "var(--anslation-ds-danger)" }}>
                    Registered chits cannot discount more than {STATUTORY_DISCOUNT_CAP}% — the prize must stay at
                    or above 70% of the chit value.
                  </p>
                )}
              </div>

              <label className="block">
                <span className="text-sm font-semibold">
                  Your bidding month ({bidMonth} of {safeMonths})
                </span>
                <input
                  type="range"
                  min={1}
                  max={safeMonths}
                  step={1}
                  value={bidMonth}
                  onChange={(event) => setBidMonthInput(Number(event.target.value))}
                  className="mt-2 w-full"
                  style={{ accentColor: "var(--primary)" }}
                />
                <span className="mt-2 grid gap-2 sm:grid-cols-3 2xl:grid-cols-3">
                  {[
                    { label: "Earliest", value: 1 },
                    { label: "Halfway", value: Math.ceil(safeMonths / 2) },
                    { label: "Last", value: safeMonths },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setBidMonthInput(preset.value)}
                      className={`rounded-md border px-3 py-2 text-center text-sm font-semibold transition ${
                        bidMonth === preset.value
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </span>
              </label>

              <button
                type="button"
                onClick={resetAll}
                className="inline-flex items-center gap-1 justify-self-start text-xs font-semibold text-[var(--primary)]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset to defaults
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                Bidding in month {bidMonth} of {safeMonths}
              </p>
              <button type="button" onClick={copySummary} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                <Copy className="h-4 w-4" />
                {copied ? "Copied" : "Copy summary"}
              </button>
            </div>

            <div aria-live="polite" className="mt-4">
              <div className="inline-block rounded-lg bg-[var(--muted)] p-5">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">You receive</p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{formatINR(result.received)}</p>
                <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold">
                  {result.role === "borrow" ? (
                    <ArrowDownRight className="h-4 w-4" style={{ color: "var(--anslation-ds-danger)" }} />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" style={{ color: "var(--anslation-ds-success)" }} />
                  )}
                  <span className="text-[var(--muted-foreground)]">
                    {result.role === "borrow"
                      ? "You take the money early — this is borrowing"
                      : "You take the money late — this is saving"}
                  </span>
                </p>
              </div>

              <div className="tool-compact-grid mt-6">
                <StatTile
                  label="Total you pay in"
                  value={formatINR(result.totalPaid)}
                  hint={`${safeMonths} instalments, after dividends`}
                />
                <StatTile
                  label="Dividends received"
                  value={formatINR(result.totalDividend)}
                  hint="Your share of everyone's discounts"
                />
                <StatTile
                  label={result.netGain >= 0 ? "Net gain" : "Net loss"}
                  value={formatSignedINR(result.netGain)}
                  tone={result.netGain >= 0 ? "up" : "down"}
                  hint="Amount received minus everything paid"
                />
              </div>

              <div className="mt-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-xs text-[var(--muted-foreground)]">
                  Effective annualised rate (XIRR on your monthly cash flows)
                </p>
                {ratePct === null ? (
                  <>
                    <p className="mt-1 text-2xl font-semibold text-[var(--muted-foreground)]">Not defined</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                      Bidding near the middle puts the prize right in the centre of your payments, so the money
                      is part loan and part savings and the two cancel out — no single interest rate can
                      describe it. Judge this month on the net{" "}
                      {result.netGain >= 0 ? "gain" : "loss"} of {formatSignedINR(result.netGain)} instead, or
                      move your bid earlier or later.
                    </p>
                  </>
                ) : (
                  <>
                    <p
                      className="mt-1 text-3xl font-semibold"
                      style={{
                        color:
                          result.role === "borrow"
                            ? "var(--anslation-ds-danger)"
                            : "var(--anslation-ds-success)",
                      }}
                    >
                      {ratePct.toFixed(2)}%
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                      {result.role === "borrow"
                        ? "This is what the money costs you, annualised — compare it against a loan, not a deposit."
                        : "This is what the chit earns you, annualised — compare it against a deposit."}
                    </p>
                  </>
                )}
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  {result.role === "borrow" ? "Cheaper ways to borrow?" : "Compared with"}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {relevantBenchmarks.map((item) => {
                    const beats = ratePct === null ? null : result.role === "borrow" ? ratePct < item.rate : ratePct > item.rate;
                    return (
                      <span
                        key={item.id}
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-semibold"
                      >
                        <span className="text-[var(--muted-foreground)]">
                          {item.label} ~{item.rate}%
                        </span>
                        {beats === null ? null : (
                          <span
                            style={{
                              color: beats ? "var(--anslation-ds-success)" : "var(--anslation-ds-danger)",
                            }}
                          >
                            {beats ? "chit wins" : "chit loses"}
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-[var(--muted-foreground)]">
              Formula: each month the winner takes the chit value less their discount. The foreman&apos;s
              commission comes off that discount, and whatever is left is split equally across all {safeMonths}{" "}
              members as dividend, cutting the subscription everyone pays. Your rate solves for the discount
              rate that makes your cash flows net to zero.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h2 className="text-lg font-semibold">Month by month</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            What the whole chit does, and what lands in or leaves your pocket each month.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  <th className="px-3 py-2">Month</th>
                  <th className="px-3 py-2">Discount</th>
                  <th className="px-3 py-2">Prize to winner</th>
                  <th className="px-3 py-2">Foreman</th>
                  <th className="px-3 py-2">Subscription</th>
                  <th className="px-3 py-2">Dividend</th>
                  <th className="px-3 py-2">Your net outflow</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr
                    key={row.month}
                    className="border-b border-[var(--border)] last:border-b-0"
                    style={row.month === bidMonth ? { background: "var(--muted)" } : undefined}
                  >
                    <td className="px-3 py-2 font-semibold">
                      {row.month}
                      {row.month === bidMonth && (
                        <span className="ml-2 rounded-full bg-[var(--background)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--primary)]">
                          You bid
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {row.discountPct.toFixed(1)}%
                      <span className="ml-1 text-xs text-[var(--muted-foreground)]">
                        ({formatINR(row.discount)})
                      </span>
                    </td>
                    <td className="px-3 py-2">{formatINR(row.prize)}</td>
                    <td className="px-3 py-2 text-[var(--muted-foreground)]">{formatINR(row.commission)}</td>
                    <td className="px-3 py-2">{formatINR(row.subscription)}</td>
                    <td className="px-3 py-2 text-[var(--anslation-ds-success)]">
                      {row.dividend > 0 ? `− ${formatINR(row.dividend)}` : "—"}
                    </td>
                    <td className="px-3 py-2 font-semibold">
                      {row.month === bidMonth ? (
                        <span style={{ color: "var(--anslation-ds-success)" }}>
                          {formatSignedINR(row.prize - row.net)}
                        </span>
                      ) : (
                        formatINR(row.net)
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[var(--primary)]" />
              <h3 className="font-semibold">Bid early to borrow, bid late to save</h3>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              A chit is one product doing two jobs. Win the auction in the first few months and you walk away
              with a lump sum you then repay in instalments — that is a loan, and the discount you gave up is the
              interest. Hold out until the end and you have been paying in all along to collect nearly the full
              chit value — that is a recurring deposit, and the dividends are your return.
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
              Across all members a chit is zero-sum apart from the foreman&apos;s commission — on these inputs
              that is {formatINR((safeForeman / 100) * safeChit)} per member over the term. Early bidders pay
              the late bidders; the foreman is paid either way. So decide up front which job you want it to do:
              going in without a plan and bidding somewhere in the middle usually means paying the foreman for
              nothing.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" style={{ color: "var(--anslation-ds-danger)" }} />
              <h3 className="font-semibold">Know the risk before you join</h3>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Join chits registered under the Chit Funds Act, 1982 and run by a foreman who has filed the
              required security deposit with the state Registrar. Registered chits cap the discount at 30% and
              the foreman&apos;s commission at 5%, and give you somewhere to go when things break down.
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
              Unregistered neighbourhood chits carry real risk: the foreman can vanish with the pot, a member who
              wins early can stop paying, and you have little recourse. There is no deposit insurance here — no
              DICGC cover, no SEBI oversight. Ask for the registration number, the chit agreement and the list of
              members before you pay the first instalment.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-5">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]" />
            <p className="text-sm leading-6 text-[var(--muted-foreground)]">
              Real auctions do not follow a neat curve — a month with two desperate bidders can blow past the
              trend. This models a smooth taper between the two ends you set, so treat the output as a planning
              estimate, not a promise. The benchmark rates shown are typical market levels for comparison, not
              live quotes.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
