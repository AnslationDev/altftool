"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, TrendingUp, Trash2 } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM4 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 4 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const factor = (value) => NUM4.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM2.format(Number.isFinite(value) ? value : 0)}%`;

/** Cost Inflation Index notified by CBDT under Section 48, base 2001-02 = 100. */
const CII = {
  "2001-02": 100,
  "2002-03": 105,
  "2003-04": 109,
  "2004-05": 113,
  "2005-06": 117,
  "2006-07": 122,
  "2007-08": 129,
  "2008-09": 137,
  "2009-10": 148,
  "2010-11": 167,
  "2011-12": 184,
  "2012-13": 200,
  "2013-14": 220,
  "2014-15": 240,
  "2015-16": 254,
  "2016-17": 264,
  "2017-18": 272,
  "2018-19": 280,
  "2019-20": 289,
  "2020-21": 301,
  "2021-22": 317,
  "2022-23": 331,
  "2023-24": 348,
  "2024-25": 363,
  "2025-26": 376,
};
const FY_LIST = Object.keys(CII);

const DEFAULT_IMPROVEMENTS = [
  { id: 1, label: "Extra floor", fy: "2013-14", amount: "500000" },
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

const fyIndex = (fy) => FY_LIST.indexOf(fy);

/** Indexed cost = cost x CII(year of transfer) / CII(year of acquisition). */
export function indexedCost(cost, fromFy, toFy) {
  const from = CII[fromFy];
  const to = CII[toFy];
  if (!from || !to || !(cost > 0)) return 0;
  return (cost * to) / from;
}

export default function ToolHome() {
  const [purchaseFy, setPurchaseFy] = useState("2005-06");
  const [purchaseCost, setPurchaseCost] = useState("1000000");
  const [saleFy, setSaleFy] = useState("2025-26");
  const [saleValue, setSaleValue] = useState("6000000");
  const [improvements, setImprovements] = useState(DEFAULT_IMPROVEMENTS);
  const [copied, setCopied] = useState(false);

  const addImprovement = () => {
    setImprovements((rows) => {
      const nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
      return [...rows, { id: nextId, label: `Improvement ${rows.length + 1}`, fy: saleFy, amount: "0" }];
    });
  };

  const updateImprovement = (id, key, value) => {
    setImprovements((rows) => rows.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  };

  const removeImprovement = (id) => {
    setImprovements((rows) => rows.filter((row) => row.id !== id));
  };

  const calc = useMemo(() => {
    const cost = toNumber(purchaseCost);
    const sale = toNumber(saleValue);
    if (Number.isNaN(cost) || Number.isNaN(sale)) {
      return { error: "Enter valid numbers for the purchase cost and sale value." };
    }
    if (cost <= 0) return { error: "Purchase cost must be greater than zero." };
    if (sale < 0) return { error: "Sale value cannot be negative." };
    if (!CII[purchaseFy] || !CII[saleFy]) return { error: "Choose a financial year from the list." };
    if (fyIndex(saleFy) < fyIndex(purchaseFy)) {
      return { error: "The year of transfer must be the same as or later than the year of purchase." };
    }

    const rows = [];
    let badRow = false;
    improvements.forEach((row) => {
      const amount = toNumber(row.amount);
      if (Number.isNaN(amount) || amount < 0) {
        badRow = true;
        return;
      }
      if (amount === 0) return;
      if (!CII[row.fy]) return;
      if (fyIndex(row.fy) > fyIndex(saleFy)) return;
      rows.push({
        ...row,
        amount,
        cii: CII[row.fy],
        indexed: indexedCost(amount, row.fy, saleFy),
      });
    });
    if (badRow) return { error: "Improvement amounts must be valid, non-negative numbers." };

    const indexedPurchase = indexedCost(cost, purchaseFy, saleFy);
    const indexedImprovement = rows.reduce((sum, row) => sum + row.indexed, 0);
    const plainImprovement = rows.reduce((sum, row) => sum + row.amount, 0);
    const totalPlain = cost + plainImprovement;
    const totalIndexed = indexedPurchase + indexedImprovement;
    const uplift = totalIndexed - totalPlain;

    return {
      ciiPurchase: CII[purchaseFy],
      ciiSale: CII[saleFy],
      indexFactor: CII[saleFy] / CII[purchaseFy],
      cost,
      sale,
      indexedPurchase,
      indexedImprovement,
      plainImprovement,
      totalPlain,
      totalIndexed,
      uplift,
      upliftPct: totalPlain > 0 ? (uplift / totalPlain) * 100 : 0,
      gainPlain: sale - totalPlain,
      gainIndexed: sale - totalIndexed,
      taxSaving: Math.max(0, uplift) * 0.2,
      rows,
      years: fyIndex(saleFy) - fyIndex(purchaseFy),
    };
  }, [purchaseCost, purchaseFy, saleValue, saleFy, improvements]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "Cost Inflation Index Calculator",
      `Purchase FY ${purchaseFy} — CII ${calc.ciiPurchase}`,
      `Transfer FY ${saleFy} — CII ${calc.ciiSale}`,
      `Indexation factor: ${factor(calc.indexFactor)}x`,
      `Original cost: ${money(calc.cost)}`,
      `Indexed cost of acquisition: ${money(calc.indexedPurchase)}`,
      `Indexed cost of improvement: ${money(calc.indexedImprovement)}`,
      `Total indexed cost: ${money(calc.totalIndexed)}`,
      `Inflation uplift: ${money(calc.uplift)} (${pct(calc.upliftPct)})`,
      `Long-term gain after indexation: ${money(calc.gainIndexed)}`,
    ].join("\n");
  }, [calc, purchaseFy, saleFy]);

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
    setPurchaseFy("2005-06");
    setPurchaseCost("1000000");
    setSaleFy("2025-26");
    setSaleValue("6000000");
    setImprovements(DEFAULT_IMPROVEMENTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <TrendingUp className="h-4 w-4" aria-hidden="true" />
          Indexation
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Cost Inflation Index Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert an old purchase price into its indexed cost of acquisition using the Cost Inflation
          Index notified by the CBDT — with separate indexation for each capital improvement, so your
          long-term capital gain is measured after inflation.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cii-buy-fy">
              Financial year of purchase
            </label>
            <select
              id="cii-buy-fy"
              className={`mt-2 ${INPUT_CLASS}`}
              value={purchaseFy}
              onChange={(event) => setPurchaseFy(event.target.value)}
            >
              {FY_LIST.map((fy) => (
                <option key={fy} value={fy}>
                  FY {fy} — CII {CII[fy]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cii-cost">
              Cost of acquisition (INR)
            </label>
            <input
              id="cii-cost"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={purchaseCost}
              onChange={(event) => setPurchaseCost(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cii-sell-fy">
              Financial year of transfer
            </label>
            <select
              id="cii-sell-fy"
              className={`mt-2 ${INPUT_CLASS}`}
              value={saleFy}
              onChange={(event) => setSaleFy(event.target.value)}
            >
              {FY_LIST.map((fy) => (
                <option key={fy} value={fy}>
                  FY {fy} — CII {CII[fy]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cii-sale">
              Sale consideration (INR)
            </label>
            <input
              id="cii-sale"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={saleValue}
              onChange={(event) => setSaleValue(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Capital improvements</h2>
          <button type="button" onClick={addImprovement} className={GHOST_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add improvement
          </button>
        </div>
        {improvements.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            No improvements added — only the purchase cost will be indexed.
          </p>
        ) : (
          <ul className="mt-3 space-y-4">
            {improvements.map((row) => (
              <li key={row.id} className="rounded-md border border-[var(--border)] p-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`cii-imp-fy-${row.id}`}>
                      Year of improvement
                    </label>
                    <select
                      id={`cii-imp-fy-${row.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      value={row.fy}
                      onChange={(event) => updateImprovement(row.id, "fy", event.target.value)}
                    >
                      {FY_LIST.map((fy) => (
                        <option key={fy} value={fy}>
                          FY {fy} — CII {CII[fy]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`cii-imp-amt-${row.id}`}>
                      Amount spent (INR)
                    </label>
                    <input
                      id={`cii-imp-amt-${row.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="10000"
                      value={row.amount}
                      onChange={(event) => updateImprovement(row.id, "amount", event.target.value)}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeImprovement(row.id)}
                  aria-label={`Remove improvement in FY ${row.fy}`}
                  className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          Improvements made before FY 2001-02, or after the year of transfer, are ignored — that is
          how Section 48 works.
        </p>
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
                  Total indexed cost
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {money(calc.totalIndexed)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {money(calc.totalPlain)} of actual spend, indexed by {factor(calc.indexFactor)}x over{" "}
                  {calc.years} year{calc.years === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy indexed cost result"
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
                ["CII of purchase year", `${calc.ciiPurchase} (FY ${purchaseFy})`],
                ["CII of transfer year", `${calc.ciiSale} (FY ${saleFy})`],
                ["Indexation factor", `${factor(calc.indexFactor)}x`],
                ["Indexed cost of acquisition", money(calc.indexedPurchase)],
                ["Indexed cost of improvement", money(calc.indexedImprovement)],
                ["Inflation uplift added to cost", `${money(calc.uplift)} (${pct(calc.upliftPct)})`],
                ["Gain before indexation", money(calc.gainPlain)],
                ["Long-term gain after indexation", money(calc.gainIndexed)],
                ["Gain removed by indexation", money(Math.max(0, calc.gainPlain - calc.gainIndexed))],
                ["Tax saved at 20% on the uplift", money(calc.taxSaving)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            {calc.gainIndexed < 0 && (
              <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
                The indexed cost exceeds the sale value, so this is a long-term capital loss of{" "}
                {money(Math.abs(calc.gainIndexed))} — it can be set off against other long-term gains
                and carried forward for eight years.
              </p>
            )}
          </section>

          {calc.rows.length > 0 && (
            <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">Improvement-wise indexation</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[320px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      <th scope="col" className="py-2 pr-3 font-semibold">
                        Year
                      </th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">
                        Spent
                      </th>
                      <th scope="col" className="py-2 text-right font-semibold">
                        Indexed
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {calc.rows.map((row) => (
                      <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-2 pr-3 font-semibold">
                          FY {row.fy}
                          <span className="ml-2 text-xs font-normal text-[var(--muted-foreground)]">
                            CII {row.cii}
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-right">{money(row.amount)}</td>
                        <td className="py-2 text-right">{money(row.indexed)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Notified Cost Inflation Index</h2>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
              {FY_LIST.map((fy) => (
                <div
                  key={fy}
                  className={`flex items-center justify-between gap-2 rounded-md px-2 py-1 ${
                    fy === purchaseFy || fy === saleFy
                      ? "bg-[var(--muted)] font-semibold text-[var(--primary)]"
                      : "text-[var(--muted-foreground)]"
                  }`}
                >
                  <span>FY {fy}</span>
                  <span>{CII[fy]}</span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. Indexation applies to long-term assets held beyond the statutory
        period; for property sold on or after 23 July 2024 the indexation route is only available to
        resident individuals and HUFs who acquired the asset before that date.
      </p>
    </main>
  );
}
