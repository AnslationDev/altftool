"use client";

import { useMemo, useState } from "react";
import { Bitcoin, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const VDA_RATE = 30; // Section 115BBH flat rate on income from virtual digital assets.
const TDS_RATE = 1; // Section 194S on the consideration for transfer.
const CESS_RATE = 4;

const DEFAULT_TRADES = [
  { id: 1, asset: "Bitcoin", cost: "100000", proceeds: "180000" },
  { id: 2, asset: "Ethereum", cost: "200000", proceeds: "150000" },
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

/**
 * Section 115BBH: 30% on each profitable transfer. Losses on other VDAs are
 * NOT set off against those gains, and cannot be carried forward.
 */
export function computeVdaTax({ trades, surchargePct, tdsThreshold, tdsAlreadyPaid, giftIncome }) {
  let grossGain = 0;
  let disallowedLoss = 0;
  let turnover = 0;

  const rows = trades.map((trade) => {
    const gain = trade.proceeds - trade.cost;
    turnover += trade.proceeds;
    if (gain > 0) grossGain += gain;
    else disallowedLoss += Math.abs(gain);
    return { ...trade, gain };
  });

  const taxableIncome = grossGain + Math.max(0, giftIncome);
  const baseTax = taxableIncome * (VDA_RATE / 100);
  const surcharge = baseTax * (surchargePct / 100);
  const cess = (baseTax + surcharge) * (CESS_RATE / 100);
  const totalTax = baseTax + surcharge + cess;

  const tdsApplies = turnover > tdsThreshold;
  const tdsDue = tdsApplies ? turnover * (TDS_RATE / 100) : 0;
  const netPayable = totalTax - Math.max(0, tdsAlreadyPaid);

  const economicProfit = grossGain - disallowedLoss + Math.max(0, giftIncome);

  return {
    rows,
    grossGain,
    disallowedLoss,
    turnover,
    taxableIncome,
    baseTax,
    surcharge,
    cess,
    totalTax,
    tdsApplies,
    tdsDue,
    netPayable,
    economicProfit,
    takeHome: economicProfit - totalTax,
    effectiveOnProfit: economicProfit > 0 ? (totalTax / economicProfit) * 100 : 0,
  };
}

export default function ToolHome() {
  const [trades, setTrades] = useState(DEFAULT_TRADES);
  const [surcharge, setSurcharge] = useState("0");
  const [threshold, setThreshold] = useState("50000");
  const [tdsPaid, setTdsPaid] = useState("0");
  const [gift, setGift] = useState("0");
  const [copied, setCopied] = useState(false);

  const addTrade = () => {
    setTrades((rows) => {
      const nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
      return [...rows, { id: nextId, asset: `Coin ${nextId}`, cost: "0", proceeds: "0" }];
    });
  };

  const updateTrade = (id, key, value) => {
    setTrades((rows) => rows.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  };

  const removeTrade = (id) => {
    setTrades((rows) => rows.filter((row) => row.id !== id));
  };

  const calc = useMemo(() => {
    if (trades.length === 0) return { error: "Add at least one crypto sale to calculate the tax." };

    const parsed = [];
    for (const trade of trades) {
      const cost = toNumber(trade.cost);
      const proceeds = toNumber(trade.proceeds);
      if (Number.isNaN(cost) || Number.isNaN(proceeds)) {
        return { error: "Every trade needs a valid buy value and sell value." };
      }
      if (cost < 0 || proceeds < 0) return { error: "Trade amounts cannot be negative." };
      parsed.push({ ...trade, cost, proceeds });
    }

    const tdsAlreadyPaid = toNumber(tdsPaid);
    const giftIncome = toNumber(gift);
    if (Number.isNaN(tdsAlreadyPaid) || Number.isNaN(giftIncome)) {
      return { error: "Enter valid numbers for TDS already deducted and gifted crypto." };
    }
    if (tdsAlreadyPaid < 0 || giftIncome < 0) return { error: "Amounts cannot be negative." };

    return computeVdaTax({
      trades: parsed,
      surchargePct: toNumber(surcharge) || 0,
      tdsThreshold: toNumber(threshold) || 0,
      tdsAlreadyPaid,
      giftIncome,
    });
  }, [trades, surcharge, threshold, tdsPaid, gift]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "Crypto Tax Calculator India (Section 115BBH)",
      `Total sale consideration: ${money(calc.turnover)}`,
      `Gains on profitable trades: ${money(calc.grossGain)}`,
      `Losses that cannot be set off: ${money(calc.disallowedLoss)}`,
      `Taxable VDA income: ${money(calc.taxableIncome)}`,
      `Tax at 30%: ${money(calc.baseTax)}`,
      `Surcharge + 4% cess: ${money(calc.surcharge + calc.cess)}`,
      `Total tax payable: ${money(calc.totalTax)}`,
      `1% TDS under Section 194S: ${money(calc.tdsDue)}`,
      `Balance after TDS credit: ${money(calc.netPayable)}`,
    ].join("\n");
  }, [calc]);

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
    setTrades(DEFAULT_TRADES);
    setSurcharge("0");
    setThreshold("50000");
    setTdsPaid("0");
    setGift("0");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Bitcoin className="h-4 w-4" aria-hidden="true" />
          VDA tax
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Crypto Tax Calculator India
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Calculate the flat 30% tax on virtual digital assets under Section 115BBH and the 1% TDS
          under Section 194S — trade by trade, with losses correctly left out because they cannot be
          set off against your crypto gains.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Your trades this financial year</h2>
          <button type="button" onClick={addTrade} className={GHOST_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add trade
          </button>
        </div>

        <ul className="mt-3 space-y-4">
          {trades.map((row) => (
            <li key={row.id} className="rounded-md border border-[var(--border)] p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`vda-asset-${row.id}`}>
                    Asset
                  </label>
                  <input
                    id={`vda-asset-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.asset}
                    onChange={(event) => updateTrade(row.id, "asset", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`vda-cost-${row.id}`}>
                    Cost of acquisition (INR)
                  </label>
                  <input
                    id={`vda-cost-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1000"
                    value={row.cost}
                    onChange={(event) => updateTrade(row.id, "cost", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`vda-proceeds-${row.id}`}>
                    Sale consideration (INR)
                  </label>
                  <input
                    id={`vda-proceeds-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1000"
                    value={row.proceeds}
                    onChange={(event) => updateTrade(row.id, "proceeds", event.target.value)}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeTrade(row.id)}
                aria-label={`Remove the ${row.asset || "unnamed"} trade`}
                className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          Only the cost of acquisition is deductible — exchange fees, gas fees, mining costs and
          interest are not.
        </p>
      </section>

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Other details</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vda-gift">
              Crypto received as gift or airdrop (INR)
            </label>
            <input
              id="vda-gift"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={gift}
              onChange={(event) => setGift(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vda-tds-paid">
              TDS already deducted by the exchange (INR)
            </label>
            <input
              id="vda-tds-paid"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={tdsPaid}
              onChange={(event) => setTdsPaid(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vda-threshold">
              Section 194S threshold that applies to you
            </label>
            <select
              id="vda-threshold"
              className={`mt-2 ${INPUT_CLASS}`}
              value={threshold}
              onChange={(event) => setThreshold(event.target.value)}
            >
              <option value="50000">₹50,000 — individual / HUF, books not audited</option>
              <option value="10000">₹10,000 — everyone else</option>
              <option value="0">No threshold — exchange deducts on every trade</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vda-surcharge">
              Surcharge on your total income
            </label>
            <select
              id="vda-surcharge"
              className={`mt-2 ${INPUT_CLASS}`}
              value={surcharge}
              onChange={(event) => setSurcharge(event.target.value)}
            >
              <option value="0">None — up to ₹50 lakh</option>
              <option value="10">10% — ₹50 lakh to ₹1 crore</option>
              <option value="15">15% — ₹1 crore to ₹2 crore</option>
              <option value="25">25% — above ₹2 crore (old regime)</option>
            </select>
          </div>
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
                  Total crypto tax payable
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {money(calc.totalTax)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  30% of {money(calc.taxableIncome)} taxable VDA income, plus surcharge and 4% cess
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy crypto tax result"
                  className={GHOST_BTN}
                >
                  {copied ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copied ? "Copied!" : "Copy result"}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  aria-label="Reset all inputs"
                  className={PRIMARY_BTN}
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Total sale consideration", money(calc.turnover)],
                ["Gains on profitable trades", money(calc.grossGain)],
                ["Losses ignored (no set-off allowed)", money(calc.disallowedLoss)],
                ["Gifts / airdrops taxed as income", money(Math.max(0, toNumber(gift) || 0))],
                ["Taxable VDA income", money(calc.taxableIncome)],
                ["Tax at 30%", money(calc.baseTax)],
                ["Surcharge", `${money(calc.surcharge)} (${pct(toNumber(surcharge) || 0)})`],
                ["Health & education cess (4%)", money(calc.cess)],
                ["1% TDS under Section 194S", calc.tdsApplies ? money(calc.tdsDue) : "Not applicable — below threshold"],
                ["TDS already deducted", money(Math.max(0, toNumber(tdsPaid) || 0))],
                ["Balance tax to pay", money(calc.netPayable)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            {calc.disallowedLoss > 0 && (
              <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
                Your actual profit across all trades is {money(calc.economicProfit)}, but tax is
                charged on {money(calc.taxableIncome)} because {money(calc.disallowedLoss)} of losses
                cannot be set off. That is an effective{" "}
                {calc.economicProfit > 0 ? pct(calc.effectiveOnProfit) : "unlimited"} of your real
                profit, leaving {money(calc.takeHome)} after tax.
              </p>
            )}
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Trade-by-trade breakdown</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Asset
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Gain / loss
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Taxed at 30%
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {calc.rows.map((row) => (
                    <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{row.asset || "Untitled"}</td>
                      <td
                        className={`py-2 pr-3 text-right ${
                          row.gain >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"
                        }`}
                      >
                        {money(row.gain)}
                      </td>
                      <td className="py-2 text-right">
                        {row.gain > 0 ? money(row.gain * 0.3) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate under Sections 115BBH and 194S as they stand for Indian residents.
        Crypto-to-crypto swaps are themselves taxable transfers, TDS on peer-to-peer trades is the
        buyer's responsibility, and treatment of staking, mining and business trading can differ —
        check with a tax professional before filing.
      </p>
    </main>
  );
}
