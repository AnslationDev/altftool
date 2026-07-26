"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, RotateCcw } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);

/** Cost Inflation Index notified by CBDT, base year 2001-02 = 100. */
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
const LAST_FY = FY_LIST[FY_LIST.length - 1];

/** Budget 2024 switched LTCG on property to 12.5% without indexation. */
const REGIME_SWITCH = Date.UTC(2024, 6, 23);
const BONDS_CAP = 5000000; // Section 54EC ceiling per financial year.
const LTCG_RATE_NEW = 12.5;
const LTCG_RATE_OLD = 20;
const CESS_RATE = 4;

const DEFAULTS = {
  purchaseDate: "2010-06-15",
  purchaseCost: 3000000,
  improvementCost: 0,
  improvementDate: "2016-06-15",
  saleDate: "2025-06-15",
  salePrice: 10000000,
  transferExpense: 100000,
  reinvestment: 0,
  bonds: 0,
  surcharge: "0",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HELP_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

/** Indian financial year label for a date, e.g. 2025-06-15 -> "2025-26". */
export function financialYearOf(dateString) {
  const parts = String(dateString).split("-");
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return null;
  const start = month >= 4 ? year : year - 1;
  const end = String((start + 1) % 100).padStart(2, "0");
  return `${start}-${end}`;
}

const utcOf = (dateString) => {
  const [y, m, d] = String(dateString).split("-").map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return NaN;
  return Date.UTC(y, m - 1, d);
};

const monthsBetween = (fromString, toString) => {
  const [fy, fm, fd] = String(fromString).split("-").map(Number);
  const [ty, tm, td] = String(toString).split("-").map(Number);
  let months = (ty - fy) * 12 + (tm - fm);
  if (td < fd) months -= 1;
  return months;
};

/** Index a cost from its own financial year to the year of transfer. */
const indexCost = (cost, fromFy, toFy) => {
  const from = CII[fromFy];
  const to = CII[toFy];
  if (!from || !to) return cost;
  return (cost * to) / from;
};

const taxOn = (gain, rate, surchargePct) => {
  const base = Math.max(0, gain) * (rate / 100);
  const surcharge = base * (surchargePct / 100);
  const cess = (base + surcharge) * (CESS_RATE / 100);
  return { base, surcharge, cess, total: base + surcharge + cess };
};

/** Full LTCG computation for a house/land transfer. */
export function computeCapitalGains(input) {
  const {
    purchaseDate,
    purchaseCost,
    improvementCost,
    improvementDate,
    saleDate,
    salePrice,
    transferExpense,
    reinvestment,
    bonds,
    surcharge,
  } = input;

  const purchaseFy = financialYearOf(purchaseDate);
  const saleFyRaw = financialYearOf(saleDate);
  const improvementFy = financialYearOf(improvementDate);
  if (!purchaseFy || !saleFyRaw) return { error: "Enter valid purchase and sale dates." };

  const purchaseMs = utcOf(purchaseDate);
  const saleMs = utcOf(saleDate);
  if (!Number.isFinite(purchaseMs) || !Number.isFinite(saleMs)) {
    return { error: "Enter valid purchase and sale dates." };
  }
  if (saleMs <= purchaseMs) return { error: "The sale date must be after the purchase date." };
  if (!CII[purchaseFy]) {
    return {
      error:
        "Indexation starts from FY 2001-02. For property bought earlier, enter its fair market value as on 1 April 2001 with a purchase date in FY 2001-02.",
    };
  }

  const holdingMonths = monthsBetween(purchaseDate, saleDate);
  const isLongTerm = holdingMonths >= 24;

  // CII is only notified up to the latest financial year; clamp beyond it.
  const saleFy = CII[saleFyRaw] ? saleFyRaw : LAST_FY;
  const ciiClamped = saleFy !== saleFyRaw;

  const improvementUsableFy = CII[improvementFy] ? improvementFy : purchaseFy;
  const surchargePct = toNumber(surcharge) || 0;

  const netSale = salePrice - transferExpense;
  const plainCost = purchaseCost + improvementCost;
  const indexedPurchase = indexCost(purchaseCost, purchaseFy, saleFy);
  const indexedImprovement =
    improvementCost > 0 ? indexCost(improvementCost, improvementUsableFy, saleFy) : 0;
  const indexedCost = indexedPurchase + indexedImprovement;

  const gainPlain = netSale - plainCost;
  const gainIndexed = netSale - indexedCost;

  const cappedBonds = Math.min(Math.max(0, bonds), BONDS_CAP);
  const exemptionClaim = Math.max(0, reinvestment) + cappedBonds;
  const exemptPlain = Math.min(exemptionClaim, Math.max(0, gainPlain));
  const exemptIndexed = Math.min(exemptionClaim, Math.max(0, gainIndexed));

  const taxablePlain = Math.max(0, gainPlain - exemptPlain);
  const taxableIndexed = Math.max(0, gainIndexed - exemptIndexed);

  const newRegime = taxOn(taxablePlain, LTCG_RATE_NEW, surchargePct);
  const oldRegime = taxOn(taxableIndexed, LTCG_RATE_OLD, surchargePct);

  const soldAfterSwitch = saleMs >= REGIME_SWITCH;
  const boughtBeforeSwitch = purchaseMs < REGIME_SWITCH;
  // Grandfathering: property bought before 23 Jul 2024 and sold after may pay
  // the lower of 12.5% without indexation and 20% with indexation.
  const hasChoice = soldAfterSwitch && boughtBeforeSwitch;

  let chosenKey = "new";
  if (!soldAfterSwitch) chosenKey = "old";
  else if (hasChoice && oldRegime.total < newRegime.total) chosenKey = "old";

  const chosen = chosenKey === "old" ? oldRegime : newRegime;
  const chosenGain = chosenKey === "old" ? gainIndexed : gainPlain;
  const chosenTaxable = chosenKey === "old" ? taxableIndexed : taxablePlain;
  const chosenExempt = chosenKey === "old" ? exemptIndexed : exemptPlain;

  return {
    purchaseFy,
    saleFy,
    saleFyRaw,
    ciiClamped,
    ciiPurchase: CII[purchaseFy],
    ciiSale: CII[saleFy],
    holdingMonths,
    isLongTerm,
    netSale,
    plainCost,
    indexedCost,
    indexedPurchase,
    indexedImprovement,
    gainPlain,
    gainIndexed,
    exemptionClaim,
    cappedBonds,
    bondsCapped: bonds > BONDS_CAP,
    chosenKey,
    chosenGain,
    chosenTaxable,
    chosenExempt,
    chosen,
    newRegime,
    oldRegime,
    hasChoice,
    soldAfterSwitch,
    surchargePct,
    savings: hasChoice ? Math.abs(newRegime.total - oldRegime.total) : 0,
    effectiveRate: chosenGain > 0 ? (chosen.total / chosenGain) * 100 : 0,
  };
}

export default function ToolHome() {
  const [purchaseDate, setPurchaseDate] = useState(DEFAULTS.purchaseDate);
  const [purchaseCost, setPurchaseCost] = useState(String(DEFAULTS.purchaseCost));
  const [improvementCost, setImprovementCost] = useState(String(DEFAULTS.improvementCost));
  const [improvementDate, setImprovementDate] = useState(DEFAULTS.improvementDate);
  const [saleDate, setSaleDate] = useState(DEFAULTS.saleDate);
  const [salePrice, setSalePrice] = useState(String(DEFAULTS.salePrice));
  const [transferExpense, setTransferExpense] = useState(String(DEFAULTS.transferExpense));
  const [reinvestment, setReinvestment] = useState(String(DEFAULTS.reinvestment));
  const [bonds, setBonds] = useState(String(DEFAULTS.bonds));
  const [surcharge, setSurcharge] = useState(DEFAULTS.surcharge);
  const [copied, setCopied] = useState(false);

  const calc = useMemo(() => {
    const cost = toNumber(purchaseCost);
    const improve = toNumber(improvementCost);
    const sale = toNumber(salePrice);
    const expense = toNumber(transferExpense);
    const reinvest = toNumber(reinvestment);
    const bond = toNumber(bonds);

    if ([cost, improve, sale, expense, reinvest, bond].some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every amount field." };
    }
    if ([cost, improve, sale, expense, reinvest, bond].some((value) => value < 0)) {
      return { error: "Amounts cannot be negative." };
    }
    if (cost <= 0) return { error: "Purchase cost must be greater than zero." };
    if (sale <= 0) return { error: "Sale consideration must be greater than zero." };
    if (expense >= sale) return { error: "Transfer expenses cannot exceed the sale consideration." };

    return computeCapitalGains({
      purchaseDate,
      purchaseCost: cost,
      improvementCost: improve,
      improvementDate,
      saleDate,
      salePrice: sale,
      transferExpense: expense,
      reinvestment: reinvest,
      bonds: bond,
      surcharge,
    });
  }, [
    purchaseDate,
    purchaseCost,
    improvementCost,
    improvementDate,
    saleDate,
    salePrice,
    transferExpense,
    reinvestment,
    bonds,
    surcharge,
  ]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "Property Capital Gains Tax Calculator",
      `Purchase FY ${calc.purchaseFy} (CII ${calc.ciiPurchase}) · Sale FY ${calc.saleFy} (CII ${calc.ciiSale})`,
      `Holding period: ${calc.holdingMonths} months (${calc.isLongTerm ? "long term" : "short term"})`,
      `Net sale consideration: ${money(calc.netSale)}`,
      `Indexed cost of acquisition + improvement: ${money(calc.indexedCost)}`,
      `Gain without indexation: ${money(calc.gainPlain)}`,
      `Gain with indexation: ${money(calc.gainIndexed)}`,
      `Exemption applied (54 / 54F / 54EC): ${money(calc.chosenExempt)}`,
      `Taxable capital gain: ${money(calc.chosenTaxable)}`,
      `Route used: ${calc.chosenKey === "old" ? "20% with indexation" : "12.5% without indexation"}`,
      `Tax + cess payable: ${money(calc.chosen.total)}`,
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
    setPurchaseDate(DEFAULTS.purchaseDate);
    setPurchaseCost(String(DEFAULTS.purchaseCost));
    setImprovementCost(String(DEFAULTS.improvementCost));
    setImprovementDate(DEFAULTS.improvementDate);
    setSaleDate(DEFAULTS.saleDate);
    setSalePrice(String(DEFAULTS.salePrice));
    setTransferExpense(String(DEFAULTS.transferExpense));
    setReinvestment(String(DEFAULTS.reinvestment));
    setBonds(String(DEFAULTS.bonds));
    setSurcharge(DEFAULTS.surcharge);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          Capital gains
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Property Capital Gains Tax Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out long-term capital gains on a house, flat or plot — indexed cost using the notified
          Cost Inflation Index, the 12.5% versus 20% comparison for pre-July-2024 purchases, and the
          effect of Section 54 / 54F reinvestment and 54EC bonds.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Purchase</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cg-purchase-date">
              Date of purchase
            </label>
            <input
              id="cg-purchase-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={purchaseDate}
              onChange={(event) => setPurchaseDate(event.target.value)}
            />
            <p className={HELP_CLASS}>Bought before April 2001? Use the FMV as on 1 April 2001.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cg-purchase-cost">
              Purchase cost (INR)
            </label>
            <input
              id="cg-purchase-cost"
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
            <label className={LABEL_CLASS} htmlFor="cg-improve-cost">
              Cost of improvement (INR)
            </label>
            <input
              id="cg-improve-cost"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={improvementCost}
              onChange={(event) => setImprovementCost(event.target.value)}
            />
            <p className={HELP_CLASS}>Capital additions only — not repairs or painting.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cg-improve-date">
              Date of improvement
            </label>
            <input
              id="cg-improve-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={improvementDate}
              onChange={(event) => setImprovementDate(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Sale</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cg-sale-date">
              Date of sale
            </label>
            <input
              id="cg-sale-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={saleDate}
              onChange={(event) => setSaleDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cg-sale-price">
              Sale consideration (INR)
            </label>
            <input
              id="cg-sale-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={salePrice}
              onChange={(event) => setSalePrice(event.target.value)}
            />
            <p className={HELP_CLASS}>Use the stamp duty value if it is higher (Section 50C).</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cg-expense">
              Transfer expenses (INR)
            </label>
            <input
              id="cg-expense"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={transferExpense}
              onChange={(event) => setTransferExpense(event.target.value)}
            />
            <p className={HELP_CLASS}>Brokerage, legal fees, stamp paper on the sale deed.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cg-surcharge">
              Surcharge on your income
            </label>
            <select
              id="cg-surcharge"
              className={`mt-2 ${INPUT_CLASS}`}
              value={surcharge}
              onChange={(event) => setSurcharge(event.target.value)}
            >
              <option value="0">None — total income up to ₹50 lakh</option>
              <option value="10">10% — ₹50 lakh to ₹1 crore</option>
              <option value="15">15% — above ₹1 crore (capped for LTCG)</option>
            </select>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Exemptions claimed</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cg-reinvest">
              Section 54 / 54F reinvestment (INR)
            </label>
            <input
              id="cg-reinvest"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={reinvestment}
              onChange={(event) => setReinvestment(event.target.value)}
            />
            <p className={HELP_CLASS}>Amount invested in a new residential house in India.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cg-bonds">
              Section 54EC bonds (INR)
            </label>
            <input
              id="cg-bonds"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={bonds}
              onChange={(event) => setBonds(event.target.value)}
            />
            <p className={HELP_CLASS}>NHAI / REC / PFC bonds within 6 months, capped at ₹50 lakh.</p>
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
                  Capital gains tax payable
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {money(calc.chosen.total)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {calc.chosenKey === "old"
                    ? "20% with indexation"
                    : "12.5% without indexation"}{" "}
                  on a taxable gain of {money(calc.chosenTaxable)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy capital gains result"
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

            {!calc.isLongTerm && (
              <p
                role="alert"
                className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                Held for {calc.holdingMonths} months — under 24 months this is a short-term capital
                gain of {money(calc.gainPlain)}, taxed at your slab rate. Indexation and Sections 54 /
                54EC do not apply; the figures below are the long-term view only.
              </p>
            )}

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Holding period", `${calc.holdingMonths} months (${calc.isLongTerm ? "long term" : "short term"})`],
                ["Net sale consideration", money(calc.netSale)],
                [`Indexed cost (CII ${calc.ciiPurchase} → ${calc.ciiSale})`, money(calc.indexedCost)],
                ["Gain with indexation", money(calc.gainIndexed)],
                ["Gain without indexation", money(calc.gainPlain)],
                ["Exemption applied", money(calc.chosenExempt)],
                ["Taxable capital gain", money(calc.chosenTaxable)],
                ["Base tax", money(calc.chosen.base)],
                ["Surcharge", `${money(calc.chosen.surcharge)} (${num(calc.surchargePct)}%)`],
                ["Health & education cess (4%)", money(calc.chosen.cess)],
                ["Effective tax on the gain", `${num(calc.effectiveRate)}%`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            {calc.bondsCapped && (
              <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
                Section 54EC investment has been capped at {money(BONDS_CAP)}, the statutory ceiling.
              </p>
            )}
            {calc.ciiClamped && (
              <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
                CII for FY {calc.saleFyRaw} is not notified yet — the latest published index (FY{" "}
                {calc.saleFy}) has been used.
              </p>
            )}
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Which route costs less?</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {calc.hasChoice
                ? `Bought before 23 July 2024 and sold after, so you may pay the lower of the two. Choosing the ${
                    calc.chosenKey === "old" ? "indexation" : "flat 12.5%"
                  } route saves ${money(calc.savings)}.`
                : calc.soldAfterSwitch
                ? "Purchased on or after 23 July 2024, so only the flat 12.5% route (no indexation) is available."
                : "Sold before 23 July 2024, so the 20% with indexation route applies."}
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Route
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Taxable gain
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Tax + cess
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[var(--border)]">
                    <td className="py-2 pr-3 font-semibold">
                      12.5% without indexation
                      {calc.chosenKey === "new" && (
                        <span className="ml-2 text-xs font-semibold text-[var(--success)]">used</span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-right">{money(Math.max(0, calc.gainPlain - Math.min(calc.exemptionClaim, Math.max(0, calc.gainPlain))))}</td>
                    <td className="py-2 text-right">{money(calc.newRegime.total)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-semibold">
                      20% with indexation
                      {calc.chosenKey === "old" && (
                        <span className="ml-2 text-xs font-semibold text-[var(--success)]">used</span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-right">{money(Math.max(0, calc.gainIndexed - Math.min(calc.exemptionClaim, Math.max(0, calc.gainIndexed))))}</td>
                    <td className="py-2 text-right">{money(calc.oldRegime.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate for Indian resident individuals and HUFs. It ignores set-off of
        brought-forward losses, the Capital Gains Account Scheme deadline, joint-ownership splits and
        TDS under Section 194-IA. Confirm the final figure with a qualified tax professional.
      </p>
    </main>
  );
}
