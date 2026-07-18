"use client";

import { useCallback, useMemo, useState } from "react";
import { AlertTriangle, Copy, CreditCard, Flame, Info, RotateCcw, Zap } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const GST_RATE = 0.18;
const MAX_MONTHS = 1200;

const presets = [
  { label: "Small revolve", balance: 25000, apr: 42, fixed: 3000 },
  { label: "Festive spend", balance: 85000, apr: 42, fixed: 8000 },
  { label: "High-rate card", balance: 150000, apr: 48, fixed: 12000 },
];

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const inrPrecise = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const formatMoney = (value) => inr.format(Number.isFinite(value) ? value : 0);
const formatMoneyPrecise = (value) => inrPrecise.format(Number.isFinite(value) ? value : 0);

function formatMonths(months) {
  if (!Number.isFinite(months) || months <= 0) return "0 months";
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${rest} ${rest === 1 ? "month" : "months"}`;
  if (rest === 0) return `${years} ${years === 1 ? "year" : "years"}`;
  return `${years} ${years === 1 ? "yr" : "yrs"} ${rest} ${rest === 1 ? "mo" : "mos"}`;
}

function simulate({ balance, apr, gstOn, paymentFor }) {
  const rate = apr / 100 / 12;
  let bal = Math.max(0, balance);
  let months = 0;
  let totalInterest = 0;
  let totalGst = 0;
  let totalPaid = 0;
  let firstPayment = 0;
  let cleared = bal <= 0;
  let stalled = false;

  while (!cleared && months < MAX_MONTHS) {
    const interest = bal * rate;
    const gst = gstOn ? interest * GST_RATE : 0;
    const due = bal + interest + gst;
    const payment = Math.min(Math.max(paymentFor(due), 0), due);
    const next = due - payment;

    if (next >= bal - 0.005) {
      stalled = true;
      break;
    }

    if (months === 0) firstPayment = payment;
    months += 1;
    totalInterest += interest;
    totalGst += gst;
    totalPaid += payment;
    bal = next;
    if (bal <= 0.005) {
      bal = 0;
      cleared = true;
    }
  }

  return {
    months,
    cleared,
    stalled: stalled || !cleared,
    firstPayment,
    totalInterest,
    totalGst,
    totalCost: totalInterest + totalGst,
    totalPaid,
  };
}

function levelPaymentFor(balance, apr, gstOn, n) {
  const rate = (apr / 100 / 12) * (gstOn ? 1 + GST_RATE : 1);
  if (n <= 0) return balance;
  if (rate <= 0) return balance / n;
  return (balance * rate) / (1 - Math.pow(1 + rate, -n));
}

export default function ToolHome() {
  const [balance, setBalance] = useState(85000);
  const [apr, setApr] = useState(42);
  const [minPct, setMinPct] = useState(5);
  const [minFloor, setMinFloor] = useState(200);
  const [fixed, setFixed] = useState(8000);
  const [gstOn, setGstOn] = useState(true);
  const [copied, setCopied] = useState(false);

  const inputs = useMemo(
    () => ({
      balance: Math.max(0, Number(balance) || 0),
      apr: Math.max(0, Number(apr) || 0),
      minPct: Math.max(0, Number(minPct) || 0),
      minFloor: Math.max(0, Number(minFloor) || 0),
      fixed: Math.max(0, Number(fixed) || 0),
    }),
    [apr, balance, fixed, minFloor, minPct]
  );

  const plans = useMemo(() => {
    const { balance: bal, apr: rate, minPct: pct, minFloor: floor, fixed: fix } = inputs;

    const minimumPlan = simulate({
      balance: bal,
      apr: rate,
      gstOn,
      paymentFor: (due) => Math.max((due * pct) / 100, floor),
    });

    const fixedPlan = simulate({
      balance: bal,
      apr: rate,
      gstOn,
      paymentFor: () => fix,
    });

    const targets = [3, 6, 12].map((n) => {
      const payment = Math.ceil(levelPaymentFor(bal, rate, gstOn, n));
      const run = simulate({ balance: bal, apr: rate, gstOn, paymentFor: () => payment });
      return { id: `clear-${n}`, label: `Clear in ${n} months`, payment, ...run };
    });

    return {
      minimum: { id: "minimum", label: "Minimum due only", payment: minimumPlan.firstPayment, ...minimumPlan },
      fixed: { id: "fixed", label: `Fixed ${formatMoney(fix)} / month`, payment: fix, ...fixedPlan },
      targets,
    };
  }, [gstOn, inputs]);

  const rows = useMemo(() => [plans.minimum, plans.fixed, ...plans.targets], [plans]);

  const maxCost = useMemo(
    () => Math.max(...rows.filter((row) => !row.stalled).map((row) => row.totalCost), 1),
    [rows]
  );

  const dailyCost = useMemo(() => {
    const daily = (inputs.balance * inputs.apr) / 100 / 365;
    return gstOn ? daily * (1 + GST_RATE) : daily;
  }, [gstOn, inputs.apr, inputs.balance]);

  const monthlyCharge = useMemo(() => {
    const interest = (inputs.balance * inputs.apr) / 100 / 12;
    return gstOn ? interest * (1 + GST_RATE) : interest;
  }, [gstOn, inputs.apr, inputs.balance]);

  const minDueNow = Math.max((inputs.balance * inputs.minPct) / 100, inputs.minFloor);

  const savingVsMinimum = useCallback(
    (row) => {
      if (row.stalled || plans.minimum.stalled) return null;
      return plans.minimum.totalCost - row.totalCost;
    },
    [plans.minimum.stalled, plans.minimum.totalCost]
  );

  const report = useMemo(() => {
    const lines = [
      "Credit Card Interest & Minimum Payment Plan",
      `Outstanding balance: ${formatMoney(inputs.balance)}`,
      `APR: ${inputs.apr}% (monthly ${(inputs.apr / 12).toFixed(2)}%)`,
      `Minimum due rule: ${inputs.minPct}% of balance, floor ${formatMoney(inputs.minFloor)}`,
      `GST on interest: ${gstOn ? "18% included" : "excluded"}`,
      `Daily carrying cost: ${formatMoneyPrecise(dailyCost)} per day`,
      "",
      "Payoff comparison",
    ];
    rows.forEach((row) => {
      if (row.stalled) {
        lines.push(`- ${row.label}: never clears at this payment`);
        return;
      }
      const saved = savingVsMinimum(row);
      lines.push(
        `- ${row.label}: ${formatMoney(row.payment)}/mo, clears in ${formatMonths(row.months)}, interest+GST ${formatMoney(
          row.totalCost
        )}, total paid ${formatMoney(row.totalPaid)}${
          saved && saved > 0 ? `, saves ${formatMoney(saved)} vs minimum` : ""
        }`
      );
    });
    lines.push("", `Generated: ${new Date().toLocaleString()}`);
    return lines.join("\n");
  }, [dailyCost, gstOn, inputs, rows, savingVsMinimum]);

  const copyPlan = async () => {
    const success = await safeCopyText(report);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const applyPreset = (preset) => {
    setBalance(preset.balance);
    setApr(preset.apr);
    setFixed(preset.fixed);
  };

  const reset = () => {
    setBalance(85000);
    setApr(42);
    setMinPct(5);
    setMinFloor(200);
    setFixed(8000);
    setGstOn(true);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <CreditCard className="h-4 w-4" />
            Debt reality check
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Credit Card Interest Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Paying the minimum due keeps the card active but barely touches the balance. Simulate the real
            month-by-month cost of the minimum trap, then compare it against a fixed payment you choose.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="grid gap-4">
              <label className="block">
                <span className="text-sm font-semibold">Outstanding balance</span>
                <input
                  type="number"
                  min="0"
                  value={balance}
                  onChange={(event) => setBalance(event.target.value)}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Annual rate (APR %)</span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={apr}
                  onChange={(event) => setApr(event.target.value)}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
                <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                  Most Indian cards charge 36-48% a year, billed as {(inputs.apr / 12).toFixed(2)}% a month.
                </span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm font-semibold">Minimum %</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={minPct}
                    onChange={(event) => setMinPct(event.target.value)}
                    className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Minimum floor</span>
                  <input
                    type="number"
                    min="0"
                    value={minFloor}
                    onChange={(event) => setMinFloor(event.target.value)}
                    className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-semibold">Your fixed monthly payment</span>
                <input
                  type="number"
                  min="0"
                  value={fixed}
                  onChange={(event) => setFixed(event.target.value)}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
            </div>

            <div className="mt-5 flex items-start justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--muted)] p-3">
              <div>
                <p className="text-sm font-semibold">Include 18% GST on interest</p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                  Banks charge GST on the finance charge, so it is part of what you actually repay.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={gstOn}
                aria-label="Include 18% GST on interest"
                onClick={() => setGstOn((prev) => !prev)}
                className="relative mt-1 h-6 w-11 shrink-0 rounded-full border border-[var(--border)] transition focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)]"
                style={{ background: gstOn ? "var(--primary)" : "var(--background)" }}
              >
                <span
                  className="absolute top-0.5 h-4 w-4 rounded-full transition-all"
                  style={{
                    left: gstOn ? "1.5rem" : "0.15rem",
                    background: gstOn ? "var(--primary-foreground)" : "var(--muted-foreground)",
                  }}
                />
              </button>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">Quick presets</span>
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-3 2xl:grid-cols-1">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  If you only ever pay the minimum due
                </p>
                <button type="button" onClick={copyPlan} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy plan"}
                </button>
              </div>

              <div aria-live="polite">
                {plans.minimum.stalled ? (
                  <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-5">
                    <div className="flex items-center gap-2 font-semibold" style={{ color: "var(--anslation-ds-danger)" }}>
                      <AlertTriangle className="h-5 w-5" />
                      This balance never clears
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                      At {inputs.apr}% a year the monthly finance charge{gstOn ? " plus GST" : ""} is bigger than the{" "}
                      {inputs.minPct}% minimum due. The balance grows every month no matter how long you keep paying, so
                      minimum-only repayment is mathematically impossible here. Pay a fixed amount instead.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <div className="rounded-lg bg-[var(--muted)] p-5">
                      <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Time to clear</p>
                      <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                        {formatMonths(plans.minimum.months)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-[var(--muted)] p-5">
                      <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                        Interest{gstOn ? " + GST" : ""} paid
                      </p>
                      <p className="mt-1 text-4xl font-semibold" style={{ color: "var(--anslation-ds-danger)" }}>
                        {formatMoney(plans.minimum.totalCost)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="tool-compact-grid mt-6">
                {[
                  ["Minimum due right now", formatMoney(minDueNow)],
                  [
                    "Total you would repay",
                    plans.minimum.stalled ? "Never settles" : formatMoney(plans.minimum.totalPaid),
                  ],
                  [
                    "Interest as % of balance",
                    plans.minimum.stalled || inputs.balance <= 0
                      ? "Unbounded"
                      : `${((plans.minimum.totalCost / inputs.balance) * 100).toFixed(0)}%`,
                  ],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                    <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                    <p className="mt-1 font-semibold">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--muted)] px-4 py-2 text-sm font-semibold">
                <Flame className="h-4 w-4" style={{ color: "var(--anslation-ds-danger)" }} />
                This balance costs {formatMoneyPrecise(dailyCost)} per day
                <span className="font-normal text-[var(--muted-foreground)]">
                  ({formatMoney(dailyCost * 30)} a month while it sits there)
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                Formula: each month interest = balance x APR / 12{gstOn ? ", GST = interest x 18%" : ""}, minimum due ={" "}
                {inputs.minPct}% of the new outstanding with a {formatMoney(inputs.minFloor)} floor, and the leftover
                carries to the next month. Daily cost = balance x APR / 365{gstOn ? " x 1.18" : ""}.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Payoff comparison</p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                      <th className="py-2 pr-3 font-semibold">Plan</th>
                      <th className="py-2 pr-3 font-semibold">Monthly</th>
                      <th className="py-2 pr-3 font-semibold">Clears in</th>
                      <th className="py-2 pr-3 font-semibold">Interest{gstOn ? " + GST" : ""}</th>
                      <th className="py-2 pr-3 font-semibold">Total paid</th>
                      <th className="py-2 font-semibold">Saved vs minimum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      const saved = savingVsMinimum(row);
                      return (
                        <tr key={row.id} className="border-b border-[var(--border)]">
                          <td className="py-3 pr-3 font-semibold">{row.label}</td>
                          <td className="py-3 pr-3">
                            {row.id === "minimum" ? (
                              row.stalled ? (
                                <span className="text-[var(--muted-foreground)]">{formatMoney(minDueNow)} declining</span>
                              ) : (
                                <span>
                                  {formatMoney(row.payment)}
                                  <span className="block text-xs text-[var(--muted-foreground)]">then declining</span>
                                </span>
                              )
                            ) : (
                              formatMoney(row.payment)
                            )}
                          </td>
                          <td className="py-3 pr-3">
                            {row.stalled ? (
                              <span className="font-semibold" style={{ color: "var(--anslation-ds-danger)" }}>
                                Never
                              </span>
                            ) : (
                              formatMonths(row.months)
                            )}
                          </td>
                          <td className="py-3 pr-3">{row.stalled ? "—" : formatMoney(row.totalCost)}</td>
                          <td className="py-3 pr-3">{row.stalled ? "—" : formatMoney(row.totalPaid)}</td>
                          <td className="py-3">
                            {saved === null || saved <= 0 ? (
                              <span className="text-[var(--muted-foreground)]">—</span>
                            ) : (
                              <span className="font-semibold" style={{ color: "var(--anslation-ds-success)" }}>
                                {formatMoney(saved)}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {plans.fixed.stalled && (
                <div className="mt-4 flex items-start gap-2 rounded-md border border-[var(--border)] bg-[var(--muted)] p-3 text-sm leading-6">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--anslation-ds-danger)" }} />
                  <span>
                    A fixed {formatMoney(inputs.fixed)} a month never clears this card — it does not even cover the{" "}
                    {formatMoney(monthlyCharge)} of monthly interest{gstOn ? " and GST" : ""}. Raise it above the
                    interest charge to make progress.
                  </span>
                </div>
              )}

              <div className="mt-6">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  Total interest{gstOn ? " + GST" : ""} by plan
                </p>
                <div className="mt-3 grid gap-3">
                  {rows.map((row) => (
                    <div key={`bar-${row.id}`} className="grid gap-1">
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="font-semibold">{row.label}</span>
                        <span className="text-[var(--muted-foreground)]">
                          {row.stalled ? "Never clears" : formatMoney(row.totalCost)}
                        </span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: row.stalled ? "100%" : `${Math.max((row.totalCost / maxCost) * 100, 1.5)}%`,
                            background:
                              row.stalled || row.id === "minimum"
                                ? "var(--anslation-ds-danger)"
                                : "var(--primary)",
                            opacity: row.stalled ? 0.45 : 1,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
                  <Info className="h-4 w-4" />
                  How revolving credit actually works
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                  Pay the statement in full by the due date and you get a free credit period — the bank charges nothing.
                  Pay even one rupee less and the card starts revolving: interest applies to the whole balance from the
                  transaction date, the interest-free period disappears on new purchases too, and 18% GST rides on top of
                  every finance charge. The minimum due is designed to keep your account current, not to clear the debt.
                </p>
              </div>

              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                <div className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--anslation-ds-success)" }}>
                  <Zap className="h-4 w-4" />
                  Always pay the full statement amount
                </div>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  <li>Full payment by the due date costs zero interest and zero GST.</li>
                  <li>If you cannot pay in full, pay the largest fixed amount you can and keep it fixed.</li>
                  <li>Stop using the card while it revolves — new spends start accruing interest immediately.</li>
                  <li>Ask your bank to convert a large balance to an EMI; card APR is usually the costliest option.</li>
                </ul>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4 text-sm leading-6 text-[var(--muted-foreground)]">
              GST note: 18% GST applies to the interest your bank charges, and it is{" "}
              {gstOn ? "included in every total above" : "currently excluded from the totals above"}. Toggle it to compare.
              Late fees, over-limit fees and annual fees are not modelled here, so a real statement can cost a little more.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
