"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Scale, Trash2 } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_ROWS = [
  { id: 1, name: "Equity funds", value: "700000", target: "60" },
  { id: 2, name: "Debt funds", value: "250000", target: "30" },
  { id: 3, name: "Gold", value: "50000", target: "10" },
];

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [newCash, setNewCash] = useState("0");
  const [mode, setMode] = useState("buy-sell");
  const [band, setBand] = useState("5");
  const [copied, setCopied] = useState(false);

  const updateRow = (id, field, value) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const addRow = () => {
    setRows((current) => {
      const nextId = current.reduce((max, row) => Math.max(max, row.id), 0) + 1;
      return [...current, { id: nextId, name: `Asset ${current.length + 1}`, value: "0", target: "0" }];
    });
  };

  const removeRow = (id) => {
    setRows((current) => (current.length > 1 ? current.filter((row) => row.id !== id) : current));
  };

  const calc = useMemo(() => {
    const cash = toNumber(newCash);
    const tolerance = toNumber(band);

    if (Number.isNaN(cash)) return { error: "Enter a valid amount of new money (use 0 if none)." };
    if (cash < 0) return { error: "New money to invest cannot be negative." };
    if (Number.isNaN(tolerance) || tolerance < 0 || tolerance > 50) {
      return { error: "Tolerance band should be between 0 and 50 percentage points." };
    }

    const parsed = rows.map((row) => ({
      id: row.id,
      name: row.name.trim() || "Untitled asset",
      value: toNumber(row.value),
      target: toNumber(row.target),
    }));

    if (parsed.some((row) => Number.isNaN(row.value) || Number.isNaN(row.target))) {
      return { error: "Every holding needs a numeric current value and target percentage." };
    }
    if (parsed.some((row) => row.value < 0)) return { error: "Holding values cannot be negative." };
    if (parsed.some((row) => row.target < 0 || row.target > 100)) {
      return { error: "Each target allocation must be between 0% and 100%." };
    }

    const targetSum = parsed.reduce((sum, row) => sum + row.target, 0);
    if (Math.abs(targetSum - 100) > 0.01) {
      return { error: `Target allocations add up to ${NUM.format(targetSum)}% — they must total 100%.` };
    }

    const currentTotal = parsed.reduce((sum, row) => sum + row.value, 0);
    if (currentTotal + cash <= 0) {
      return { error: "Portfolio value plus new money must be greater than zero." };
    }

    const finalTotal = currentTotal + cash;

    const base = parsed.map((row) => {
      const targetValue = (finalTotal * row.target) / 100;
      const currentWeight = currentTotal > 0 ? (row.value / currentTotal) * 100 : 0;
      return {
        ...row,
        targetValue,
        currentWeight,
        drift: currentWeight - row.target,
        gap: targetValue - row.value,
      };
    });

    let result;
    if (mode === "buy-sell") {
      result = base.map((row) => ({ ...row, action: row.gap }));
    } else {
      const shortfalls = base.map((row) => Math.max(0, row.gap));
      const totalShortfall = shortfalls.reduce((sum, value) => sum + value, 0);
      result = base.map((row, index) => ({
        ...row,
        action: totalShortfall > 0 ? (cash * shortfalls[index]) / totalShortfall : 0,
      }));
    }

    const withAfter = result.map((row) => {
      const after = row.value + row.action;
      return {
        ...row,
        after,
        afterWeight: finalTotal > 0 ? (after / finalTotal) * 100 : 0,
      };
    });

    const buys = withAfter.filter((row) => row.action > 0.5).reduce((sum, row) => sum + row.action, 0);
    const sells = withAfter.filter((row) => row.action < -0.5).reduce((sum, row) => sum - row.action, 0);
    const maxDriftRow = withAfter.reduce(
      (acc, row) => (Math.abs(row.drift) > Math.abs(acc.drift) ? row : acc),
      withAfter[0],
    );
    const outOfBand = withAfter.filter((row) => Math.abs(row.drift) > tolerance);

    return {
      rows: withAfter,
      currentTotal,
      finalTotal,
      cash,
      buys,
      sells,
      turnover: buys + sells,
      turnoverShare: finalTotal > 0 ? ((buys + sells) / finalTotal) * 100 : 0,
      maxDriftRow,
      outOfBand,
      tolerance,
      cashOnlyIdle: mode === "cash-only" && cash <= 0,
    };
  }, [rows, newCash, mode, band]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    const lines = [
      "Portfolio Rebalancing Calculator",
      `Current portfolio: ${money(calc.currentTotal)}`,
      `New money added: ${money(calc.cash)}`,
      `Portfolio after rebalancing: ${money(calc.finalTotal)}`,
      `Mode: ${mode === "buy-sell" ? "Buy and sell to target" : "Direct new money only (no selling)"}`,
      "",
    ];
    calc.rows.forEach((row) => {
      const verb = row.action > 0.5 ? "BUY" : row.action < -0.5 ? "SELL" : "HOLD";
      const amount = verb === "HOLD" ? "" : ` ${money(Math.abs(row.action))}`;
      lines.push(
        `${row.name}: ${verb}${amount} — now ${pct(row.currentWeight)}, target ${pct(row.target)}, after ${pct(row.afterWeight)}`,
      );
    });
    lines.push("");
    lines.push(`Total buys: ${money(calc.buys)}`);
    lines.push(`Total sells: ${money(calc.sells)}`);
    lines.push(`Turnover: ${money(calc.turnover)} (${pct(calc.turnoverShare)} of portfolio)`);
    lines.push(
      `Largest drift: ${calc.maxDriftRow.name} ${calc.maxDriftRow.drift >= 0 ? "+" : ""}${NUM.format(calc.maxDriftRow.drift)} points`,
    );
    return lines.join("\n");
  }, [calc, mode]);

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
    setRows(DEFAULT_ROWS);
    setNewCash("0");
    setMode("buy-sell");
    setBand("5");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Scale className="h-4 w-4" aria-hidden="true" />
          Investing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Portfolio Rebalancing Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter what each asset is worth today and what you want it to be. The calculator returns the
          exact rupee amount to buy or sell in each holding — or, if you would rather not sell, how to
          split fresh money across the underweight assets.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your holdings</h2>
        <div className="mt-4 space-y-4">
          {rows.map((row, index) => (
            <div key={row.id} className="rounded-lg border border-[var(--border)] p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`pr-name-${row.id}`}>
                    Asset {index + 1} name
                  </label>
                  <input
                    id={`pr-name-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.name}
                    onChange={(event) => updateRow(row.id, "name", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`pr-value-${row.id}`}>
                    Current value (INR)
                  </label>
                  <input
                    id={`pr-value-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1000"
                    value={row.value}
                    onChange={(event) => updateRow(row.id, "value", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`pr-target-${row.id}`}>
                    Target allocation (%)
                  </label>
                  <input
                    id={`pr-target-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="100"
                    step="1"
                    value={row.target}
                    onChange={(event) => updateRow(row.id, "target", event.target.value)}
                  />
                </div>
              </div>
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  aria-label={`Remove ${row.name || `asset ${index + 1}`}`}
                  className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        <button type="button" onClick={addRow} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add asset
        </button>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-cash">
              New money to invest (INR)
            </label>
            <input
              id="pr-cash"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={newCash}
              onChange={(event) => setNewCash(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-band">
              Tolerance band (percentage points)
            </label>
            <input
              id="pr-band"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              step="1"
              value={band}
              onChange={(event) => setBand(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Rebalancing method">
          {[
            ["buy-sell", "Buy and sell to target"],
            ["cash-only", "New money only (no selling)"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              aria-pressed={mode === id}
              className={
                mode === id
                  ? "min-h-11 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  : "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              }
            >
              {label}
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
                  Total to move
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{money(calc.turnover)}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {pct(calc.turnoverShare)} of a {money(calc.finalTotal)} portfolio
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy rebalancing plan"
                  className={GHOST_BTN}
                >
                  {copied ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copied ? "Copied!" : "Copy result"}
                </button>
                <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            {calc.cashOnlyIdle && (
              <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
                You picked the no-selling method but entered zero new money, so there is nothing to
                allocate. Add fresh money or switch to buy-and-sell.
              </p>
            )}

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[340px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Asset</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Now</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Target</th>
                    <th scope="col" className="py-2 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {calc.rows.map((row) => {
                    const isBuy = row.action > 0.5;
                    const isSell = row.action < -0.5;
                    return (
                      <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-2.5 pr-3">
                          <span className="font-semibold">{row.name}</span>
                          <span className="block text-xs text-[var(--muted-foreground)]">
                            {money(row.value)} → {money(row.after)}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3 text-right">{pct(row.currentWeight)}</td>
                        <td className="py-2.5 pr-3 text-right">{pct(row.target)}</td>
                        <td className="py-2.5 text-right">
                          {isBuy || isSell ? (
                            <span
                              className={
                                isBuy
                                  ? "rounded-md bg-[var(--success-soft)] px-2 py-1 text-xs font-semibold text-[var(--success)]"
                                  : "rounded-md bg-[var(--danger-soft)] px-2 py-1 text-xs font-semibold text-[var(--danger)]"
                              }
                            >
                              {isBuy ? "Buy" : "Sell"} {money(Math.abs(row.action))}
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                              Hold
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Portfolio value today", money(calc.currentTotal)],
                ["New money added", money(calc.cash)],
                ["Portfolio after rebalancing", money(calc.finalTotal)],
                ["Total buys", money(calc.buys)],
                ["Total sells", money(calc.sells)],
                [
                  "Largest drift from target",
                  `${calc.maxDriftRow.name} ${calc.maxDriftRow.drift >= 0 ? "+" : ""}${NUM.format(calc.maxDriftRow.drift)} pts`,
                ],
                [
                  `Holdings outside the ${NUM.format(calc.tolerance)}-point band`,
                  calc.outOfBand.length
                    ? calc.outOfBand.map((row) => row.name).join(", ")
                    : "None — you could skip this rebalance",
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Allocation before and after</h2>
            <ul className="mt-4 space-y-4">
              {calc.rows.map((row) => (
                <li key={row.id}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold">{row.name}</span>
                    <span className="text-[var(--muted-foreground)]">
                      {pct(row.currentWeight)} → {pct(row.afterWeight)} (target {pct(row.target)})
                    </span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                    <span
                      className="block h-full bg-[var(--muted-foreground)]"
                      style={{ width: `${Math.max(0, Math.min(100, row.currentWeight))}%` }}
                    />
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                    <span
                      className="block h-full bg-[var(--primary)]"
                      style={{ width: `${Math.max(0, Math.min(100, row.afterWeight))}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">
              Upper bar: today. Lower bar: after the plan above.
            </p>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not investment advice. Selling units can trigger capital gains tax, exit
        loads or STT, and equity fund switches may attract short-term gains if held under a year —
        many investors therefore rebalance with fresh money first.
      </p>
    </main>
  );
}
