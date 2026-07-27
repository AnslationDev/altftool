"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Trash2, Wallet } from "lucide-react";

import {
  ASSET_CLASSES,
  SINGLE_HOLDING_ALERT_PERCENT,
  analyseWallet,
  trimToTarget,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);
const num = (v) => (Number.isFinite(v) ? NUM.format(v) : DASH);
const pct = (v) => (Number.isFinite(v) ? `${NUM.format(v)}%` : DASH);

const toNumber = (raw) => {
  const cleaned = String(raw).replace(/,/g, "").trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

const DEFAULT_ROWS = [
  { id: "r1", name: "Savings account", assetClass: "cash", quantity: "1", unitPrice: "250000" },
  { id: "r2", name: "Nifty 50 index fund", assetClass: "fund", quantity: "1", unitPrice: "420000" },
  { id: "r3", name: "Bitcoin", assetClass: "crypto", quantity: "0.08", unitPrice: "5800000" },
  { id: "r4", name: "Sovereign gold bond", assetClass: "metal", quantity: "40", unitPrice: "7200" },
];

let rowSeq = DEFAULT_ROWS.length;
const newRow = () => {
  rowSeq += 1;
  return { id: `r${rowSeq}`, name: "", assetClass: "other", quantity: "1", unitPrice: "" };
};

export default function ToolHome() {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [targetPercent, setTargetPercent] = useState("25");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      analyseWallet({
        holdings: rows.map((r) => ({
          id: r.id,
          name: r.name,
          assetClass: r.assetClass,
          quantity: toNumber(r.quantity),
          unitPrice: toNumber(r.unitPrice),
        })),
      }),
    [rows],
  );

  const trim = useMemo(() => {
    if (result.error || !result.largest) return null;
    return trimToTarget({
      value: result.largest.value,
      total: result.total,
      targetPercent: toNumber(targetPercent),
    });
  }, [result, targetPercent]);

  const hasError = Boolean(result.error);

  const updateRow = (id, patch) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const removeRow = (id) => setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  const addRow = () => setRows((prev) => [...prev, newRow()]);
  const reset = () => {
    setRows(DEFAULT_ROWS);
    setTargetPercent("25");
    setCopied(false);
  };

  const copy = async () => {
    if (hasError) return;
    const lines = [
      `Wallet value: ${money(result.total)}`,
      `Holdings: ${result.count}`,
      `Concentration (HHI): ${num(result.hhi)} — ${result.band.label}`,
      `Effective number of holdings: ${num(result.effectiveHoldings)}`,
      "",
      ...result.rows.map((r) => `${r.name}: ${money(r.value)} (${pct(r.share)})`),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <Wallet className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          Digital Wallet Manager
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          List what you hold, in whatever it is denominated, and see the wallet total, the share each
          position carries and how concentrated the whole thing is. Everything stays in this browser tab.
        </p>
      </header>

      <section aria-labelledby="holdings-heading" className="mb-6">
        <h2 id="holdings-heading" className="mb-3 text-sm font-semibold text-[var(--foreground)]">
          Holdings
        </h2>

        <div className="space-y-4">
          {rows.map((row, index) => (
            <div
              key={row.id}
              className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`name-${row.id}`}>
                    Holding name
                  </label>
                  <input
                    id={`name-${row.id}`}
                    className={`${INPUT_CLASS} mt-1`}
                    type="text"
                    value={row.name}
                    placeholder={`Holding ${index + 1}`}
                    onChange={(e) => updateRow(row.id, { name: e.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`class-${row.id}`}>
                    Asset class
                  </label>
                  <select
                    id={`class-${row.id}`}
                    className={`${INPUT_CLASS} mt-1`}
                    value={row.assetClass}
                    onChange={(e) => updateRow(row.id, { assetClass: e.target.value })}
                  >
                    {Object.entries(ASSET_CLASSES).map(([key, meta]) => (
                      <option key={key} value={key}>
                        {meta.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`qty-${row.id}`}>
                    Quantity / units
                  </label>
                  <input
                    id={`qty-${row.id}`}
                    className={`${INPUT_CLASS} mt-1`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="any"
                    value={row.quantity}
                    onChange={(e) => updateRow(row.id, { quantity: e.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`price-${row.id}`}>
                    Price per unit (₹)
                  </label>
                  <input
                    id={`price-${row.id}`}
                    className={`${INPUT_CLASS} mt-1`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="any"
                    value={row.unitPrice}
                    onChange={(e) => updateRow(row.id, { unitPrice: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-sm text-[var(--muted-foreground)]">
                  Value:{" "}
                  <span className="font-semibold text-[var(--foreground)]">
                    {hasError ? DASH : money(result.rows[index]?.value)}
                  </span>
                </p>
                <button
                  type="button"
                  className={`${GHOST_BTN} px-3`}
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length === 1}
                  aria-label={`Remove ${row.name || `holding ${index + 1}`}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className={PRIMARY_BTN} onClick={addRow}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add holding
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
          <button type="button" className={GHOST_BTN} onClick={copy} aria-label="Copy wallet summary to clipboard">
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy result"}
          </button>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mb-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section
        aria-labelledby="result-heading"
        className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
      >
        <h2 id="result-heading" className="text-sm font-semibold text-[var(--muted-foreground)]">
          Wallet value
        </h2>
        <p className="mt-1 text-4xl font-bold tracking-tight text-[var(--foreground)]">
          {hasError ? DASH : money(result.total)}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {hasError ? DASH : `${result.count} holding${result.count === 1 ? "" : "s"} · ${result.band.label}`}
        </p>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Concentration (HHI)</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {hasError ? DASH : num(result.hhi)}
            </dd>
          </div>
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Effective holdings</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {hasError ? DASH : num(result.effectiveHoldings)}
            </dd>
          </div>
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Largest holding</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {hasError || !result.largest ? DASH : `${result.largest.name} · ${pct(result.largest.share)}`}
            </dd>
          </div>
          <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Smallest holding</dt>
            <dd className="text-sm font-semibold text-[var(--foreground)]">
              {hasError || !result.smallest ? DASH : `${result.smallest.name} · ${pct(result.smallest.share)}`}
            </dd>
          </div>
        </dl>

        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          {hasError ? DASH : result.band.note}
        </p>

        {!hasError && result.overweight.length > 0 ? (
          <p className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            Over {SINGLE_HOLDING_ALERT_PERCENT}% of the wallet sits in: {result.overweight.join(", ")}.
          </p>
        ) : null}
      </section>

      <section aria-labelledby="split-heading" className="mt-6">
        <h2 id="split-heading" className="mb-3 text-sm font-semibold text-[var(--foreground)]">
          Allocation
        </h2>
        <div className="overflow-x-auto rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)]">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <caption className="sr-only">Value and share of each holding</caption>
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th scope="col" className="px-4 py-3 font-semibold text-[var(--foreground)]">Holding</th>
                <th scope="col" className="px-4 py-3 font-semibold text-[var(--foreground)]">Class</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold text-[var(--foreground)]">Value</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold text-[var(--foreground)]">Share</th>
              </tr>
            </thead>
            <tbody>
              {hasError ? (
                <tr>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]" colSpan={4}>{DASH}</td>
                </tr>
              ) : (
                result.rows.map((r) => (
                  <tr key={r.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-3 text-[var(--foreground)]">{r.name}</td>
                    <td className="px-4 py-3 text-[var(--muted-foreground)]">{r.classLabel}</td>
                    <td className="px-4 py-3 text-right text-[var(--foreground)]">{money(r.value)}</td>
                    <td className="px-4 py-3 text-right text-[var(--foreground)]">{pct(r.share)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)]">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <caption className="sr-only">Value by asset class</caption>
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th scope="col" className="px-4 py-3 font-semibold text-[var(--foreground)]">Asset class</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold text-[var(--foreground)]">Holdings</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold text-[var(--foreground)]">Value</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold text-[var(--foreground)]">Share</th>
              </tr>
            </thead>
            <tbody>
              {hasError ? (
                <tr>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]" colSpan={4}>{DASH}</td>
                </tr>
              ) : (
                result.classes.map((c) => (
                  <tr key={c.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-3 text-[var(--foreground)]">{c.label}</td>
                    <td className="px-4 py-3 text-right text-[var(--muted-foreground)]">{c.count}</td>
                    <td className="px-4 py-3 text-right text-[var(--foreground)]">{money(c.value)}</td>
                    <td className="px-4 py-3 text-right text-[var(--foreground)]">{pct(c.share)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section
        aria-labelledby="trim-heading"
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
      >
        <h2 id="trim-heading" className="text-sm font-semibold text-[var(--foreground)]">
          Trim the biggest position
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="target-share">
              Target share for the largest holding (%)
            </label>
            <input
              id="target-share"
              className={`${INPUT_CLASS} mt-1`}
              type="number"
              inputMode="decimal"
              min="1"
              max="99"
              step="any"
              value={targetPercent}
              onChange={(e) => setTargetPercent(e.target.value)}
            />
          </div>
          <div className="flex flex-col justify-end">
            <p className="text-sm text-[var(--muted-foreground)]">Sell about</p>
            <p className="text-2xl font-bold text-[var(--foreground)]">
              {hasError || !trim || trim.error ? DASH : money(trim.trimBy)}
            </p>
          </div>
        </div>
        {!hasError && trim?.error ? (
          <p role="alert" className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            {trim.error}
          </p>
        ) : null}
        {!hasError && trim && !trim.error ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            {trim.alreadyUnder
              ? `${result.largest.name} is already at or below the target share.`
              : `Selling that much of ${result.largest.name} brings it to ${pct(toNumber(targetPercent))} of the smaller wallet that remains.`}
          </p>
        ) : null}
      </section>

      <p className="mt-6 text-xs text-[var(--muted-foreground)]">
        Prices are the ones you type in — nothing is fetched, stored or sent anywhere. This is a
        record-keeping and arithmetic tool, not investment advice.
      </p>
    </div>
  );
}
