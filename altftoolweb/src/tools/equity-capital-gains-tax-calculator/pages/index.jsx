"use client";

import { useMemo, useState } from "react";
import { Copy, Landmark, RotateCcw } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const inrExact = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const pct = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const money = (v) => inr.format(Number.isFinite(v) ? v : 0);
const moneyExact = (v) => inrExact.format(Number.isFinite(v) ? v : 0);
const rate = (v) => `${pct.format(Number.isFinite(v) ? v : 0)}%`;

const GRANDFATHER_CUTOFF = "2018-02-01";

const DEFAULTS = {
  quantity: "500",
  buyPrice: "820",
  sellPrice: "1450",
  buyDate: "2024-04-01",
  sellDate: "2026-06-30",
  charges: "1200",
  stcgRate: "20",
  ltcgRate: "12.5",
  exemption: "125000",
  exemptionUsed: "0",
  fmv: "",
  cess: true,
};

const num = (v) => {
  const n = Number(String(v).trim());
  return Number.isFinite(n) ? n : NaN;
};

function parseDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return null;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
    return null;
  }
  return date;
}

// Listed equity turns long-term once held for MORE than 12 months
function isLongTerm(buy, sell) {
  // Date.UTC rolls 29 Feb + 1 year over into 1 March, which would make a
  // holding bought on a leap day turn long-term a day late. Clamp to the last
  // valid day of the anniversary month instead.
  const year = buy.getUTCFullYear() + 1;
  const month = buy.getUTCMonth();
  const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const day = Math.min(buy.getUTCDate(), lastDayOfMonth);
  const anniversary = new Date(Date.UTC(year, month, day));
  return sell.getTime() > anniversary.getTime();
}

export default function ToolHome() {
  const [quantity, setQuantity] = useState(DEFAULTS.quantity);
  const [buyPrice, setBuyPrice] = useState(DEFAULTS.buyPrice);
  const [sellPrice, setSellPrice] = useState(DEFAULTS.sellPrice);
  const [buyDate, setBuyDate] = useState(DEFAULTS.buyDate);
  const [sellDate, setSellDate] = useState(DEFAULTS.sellDate);
  const [charges, setCharges] = useState(DEFAULTS.charges);
  const [stcgRate, setStcgRate] = useState(DEFAULTS.stcgRate);
  const [ltcgRate, setLtcgRate] = useState(DEFAULTS.ltcgRate);
  const [exemption, setExemption] = useState(DEFAULTS.exemption);
  const [exemptionUsed, setExemptionUsed] = useState(DEFAULTS.exemptionUsed);
  const [fmv, setFmv] = useState(DEFAULTS.fmv);
  const [cess, setCess] = useState(DEFAULTS.cess);
  const [copied, setCopied] = useState(false);

  const state = useMemo(() => {
    const qty = num(quantity);
    const buy = num(buyPrice);
    const sell = num(sellPrice);
    const cost = num(charges);
    const stcg = num(stcgRate);
    const ltcg = num(ltcgRate);
    const limit = num(exemption);
    const used = num(exemptionUsed);

    if ([qty, buy, sell, cost, stcg, ltcg, limit, used].some((v) => Number.isNaN(v))) {
      return { error: "Enter a number in every field." };
    }
    if (qty <= 0) return { error: "Quantity must be greater than 0." };
    if (buy < 0 || sell < 0) return { error: "Prices cannot be negative." };
    if (cost < 0) return { error: "Brokerage and charges cannot be negative." };
    if (stcg < 0 || stcg > 100 || ltcg < 0 || ltcg > 100) {
      return { error: "Tax rates must be between 0% and 100%." };
    }
    if (limit < 0) return { error: "Exemption limit cannot be negative." };
    if (used < 0 || used > limit) {
      return { error: "Exemption already used must be between 0 and the exemption limit." };
    }

    const bought = parseDate(buyDate);
    const sold = parseDate(sellDate);
    if (!bought || !sold) return { error: "Enter valid buy and sell dates." };
    if (sold.getTime() <= bought.getTime()) {
      return { error: "Sell date must be after the buy date." };
    }

    const holdingDays = Math.round((sold.getTime() - bought.getTime()) / 86400000);
    const longTerm = isLongTerm(bought, sold);

    const proceeds = sell * qty;

    // Section 112A grandfathering for shares bought before 1 Feb 2018
    const grandfatherEligible = bought.getTime() < parseDate(GRANDFATHER_CUTOFF).getTime();
    const fmvValue = num(fmv === "" ? "0" : fmv);
    const grandfatherApplied =
      longTerm && grandfatherEligible && !Number.isNaN(fmvValue) && fmvValue > 0;
    const costPerUnit = grandfatherApplied ? Math.max(buy, Math.min(fmvValue, sell)) : buy;
    const acquisitionCost = costPerUnit * qty;

    const gain = proceeds - acquisitionCost - cost;

    const exemptionAvailable = longTerm ? Math.max(0, limit - used) : 0;
    const exemptionUsedNow = longTerm && gain > 0 ? Math.min(gain, exemptionAvailable) : 0;
    const taxableGain = gain > 0 ? Math.max(0, gain - exemptionUsedNow) : 0;

    const appliedRate = longTerm ? ltcg : stcg;
    const baseTax = taxableGain * (appliedRate / 100);
    const cessAmount = cess ? baseTax * 0.04 : 0;
    const totalTax = baseTax + cessAmount;

    const netGain = gain - totalTax;
    const netProceeds = proceeds - cost - totalTax;
    const effectiveRate = gain > 0 ? (totalTax / gain) * 100 : 0;

    return {
      qty,
      holdingDays,
      longTerm,
      proceeds,
      acquisitionCost,
      costPerUnit,
      grandfatherEligible,
      grandfatherApplied,
      charges: cost,
      gain,
      exemptionAvailable,
      exemptionUsedNow,
      taxableGain,
      appliedRate,
      baseTax,
      cessAmount,
      totalTax,
      netGain,
      netProceeds,
      effectiveRate,
      isLoss: gain < 0,
    };
  }, [
    quantity,
    buyPrice,
    sellPrice,
    buyDate,
    sellDate,
    charges,
    stcgRate,
    ltcgRate,
    exemption,
    exemptionUsed,
    fmv,
    cess,
  ]);

  const report = useMemo(() => {
    if (state.error) return "";
    return [
      "Equity Capital Gains Tax Calculator",
      `Holding period: ${state.holdingDays} days (${state.longTerm ? "Long term" : "Short term"})`,
      `Sale proceeds: ${money(state.proceeds)}`,
      `Cost of acquisition: ${money(state.acquisitionCost)}`,
      `Brokerage and charges: ${money(state.charges)}`,
      `${state.isLoss ? "Capital loss" : "Capital gain"}: ${money(Math.abs(state.gain))}`,
      state.longTerm ? `Exemption applied: ${money(state.exemptionUsedNow)}` : null,
      `Taxable gain: ${money(state.taxableGain)}`,
      `Tax rate applied: ${rate(state.appliedRate)}${cess ? " + 4% cess" : ""}`,
      `Tax payable: ${moneyExact(state.totalTax)}`,
      `Net gain after tax: ${money(state.netGain)}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [state, cess]);

  const copyResult = async () => {
    if (!report) return;
    const ok = await safeCopyText(report);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const reset = () => {
    setQuantity(DEFAULTS.quantity);
    setBuyPrice(DEFAULTS.buyPrice);
    setSellPrice(DEFAULTS.sellPrice);
    setBuyDate(DEFAULTS.buyDate);
    setSellDate(DEFAULTS.sellDate);
    setCharges(DEFAULTS.charges);
    setStcgRate(DEFAULTS.stcgRate);
    setLtcgRate(DEFAULTS.ltcgRate);
    setExemption(DEFAULTS.exemption);
    setExemptionUsed(DEFAULTS.exemptionUsed);
    setFmv(DEFAULTS.fmv);
    setCess(DEFAULTS.cess);
  };

  const inputClass =
    "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
  const labelClass = "block text-sm font-semibold text-[var(--foreground)]";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            <Landmark className="h-4 w-4" />
            Tax
          </div>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Equity Capital Gains Tax Calculator
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)] sm:text-base">
            Enter your trade and the tool decides short term or long term from the holding period,
            applies the annual LTCG exemption, cess and pre-2018 grandfathering, and shows the tax.
          </p>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,400px)_1fr]">
          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="cg-qty">
                    Quantity (shares/units)
                  </label>
                  <input
                    id="cg-qty"
                    type="number"
                    inputMode="decimal"
                    min="1"
                    step="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="cg-charges">
                    Brokerage &amp; charges (₹)
                  </label>
                  <input
                    id="cg-charges"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="10"
                    value={charges}
                    onChange={(e) => setCharges(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="cg-buy-price">
                    Buy price per unit (₹)
                  </label>
                  <input
                    id="cg-buy-price"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.05"
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="cg-sell-price">
                    Sell price per unit (₹)
                  </label>
                  <input
                    id="cg-sell-price"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.05"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="cg-buy-date">
                    Buy date
                  </label>
                  <input
                    id="cg-buy-date"
                    type="date"
                    value={buyDate}
                    onChange={(e) => setBuyDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="cg-sell-date">
                    Sell date
                  </label>
                  <input
                    id="cg-sell-date"
                    type="date"
                    value={sellDate}
                    onChange={(e) => setSellDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="cg-stcg">
                    STCG rate (%)
                  </label>
                  <input
                    id="cg-stcg"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="100"
                    step="0.5"
                    value={stcgRate}
                    onChange={(e) => setStcgRate(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="cg-ltcg">
                    LTCG rate (%)
                  </label>
                  <input
                    id="cg-ltcg"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="100"
                    step="0.5"
                    value={ltcgRate}
                    onChange={(e) => setLtcgRate(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="cg-exemption">
                    LTCG exemption limit (₹)
                  </label>
                  <input
                    id="cg-exemption"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="5000"
                    value={exemption}
                    onChange={(e) => setExemption(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="cg-exemption-used">
                    Exemption already used (₹)
                  </label>
                  <input
                    id="cg-exemption-used"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="5000"
                    value={exemptionUsed}
                    onChange={(e) => setExemptionUsed(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="cg-fmv">
                  FMV on 31 Jan 2018 per unit (₹)
                </label>
                <input
                  id="cg-fmv"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.05"
                  placeholder="Only for shares bought before 1 Feb 2018"
                  value={fmv}
                  onChange={(e) => setFmv(e.target.value)}
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Leave blank unless the buy date is before 1 February 2018.
                </p>
              </div>

              <label className="flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="cg-cess">
                <input
                  id="cg-cess"
                  type="checkbox"
                  checked={cess}
                  onChange={(e) => setCess(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                />
                Add 4% health &amp; education cess
              </label>

              <button
                type="button"
                onClick={reset}
                aria-label="Reset all inputs to defaults"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>

          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            {state.error ? (
              <div
                role="alert"
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {state.error}
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                      Tax payable
                    </p>
                    <p className="mt-1 text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
                      {money(state.totalTax)}
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      {state.longTerm ? "Long-term" : "Short-term"} capital gains · held{" "}
                      {state.holdingDays} days
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={copyResult}
                    aria-label="Copy the capital gains tax result"
                    className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied!" : "Copy result"}
                  </button>
                </div>

                {state.isLoss ? (
                  <p
                    role="status"
                    className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
                  >
                    This trade is a capital loss of {money(Math.abs(state.gain))}. No tax is due — the
                    loss can be set off against eligible capital gains and carried forward for up to
                    eight assessment years if the return is filed on time.
                  </p>
                ) : null}

                {state.grandfatherApplied ? (
                  <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
                    Grandfathering applied: cost taken as {moneyExact(state.costPerUnit)} per unit —
                    the higher of your actual cost and the lower of the 31 Jan 2018 FMV and the sale
                    price.
                  </p>
                ) : null}

                <dl className="mt-5 grid gap-3">
                  {[
                    ["Sale proceeds", money(state.proceeds)],
                    ["Cost of acquisition", money(state.acquisitionCost)],
                    ["Brokerage & charges deducted", money(state.charges)],
                    [
                      state.isLoss ? "Capital loss" : "Capital gain",
                      money(Math.abs(state.gain)),
                    ],
                    state.longTerm
                      ? ["Exemption applied this trade", money(state.exemptionUsedNow)]
                      : null,
                    state.longTerm
                      ? ["Exemption still available", money(Math.max(0, state.exemptionAvailable - state.exemptionUsedNow))]
                      : null,
                    ["Taxable gain", money(state.taxableGain)],
                    ["Tax at applicable rate", `${moneyExact(state.baseTax)} @ ${rate(state.appliedRate)}`],
                    cess ? ["Health & education cess (4%)", moneyExact(state.cessAmount)] : null,
                    ["Total tax payable", moneyExact(state.totalTax)],
                    ["Net gain after tax", money(state.netGain)],
                    ["Net proceeds in hand", money(state.netProceeds)],
                    ["Effective tax on the gain", rate(state.effectiveRate)],
                  ]
                    .filter(Boolean)
                    .map(([label, value]) => (
                      <div
                        key={label}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                      >
                        <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
                        <dd className="text-sm font-semibold text-[var(--foreground)]">{value}</dd>
                      </div>
                    ))}
                </dl>

                <p className="mt-5 text-xs leading-5 text-[var(--muted-foreground)]">
                  Listed equity and equity mutual funds are long term when held for more than 12
                  months. Defaults follow the rules for transfers on or after 23 July 2024: 20% STCG
                  under section 111A and 12.5% LTCG under section 112A on gains above ₹1,25,000 per
                  financial year, with no indexation. Surcharge for higher income slabs is not
                  included. Informational only — confirm your position with a tax professional.
                </p>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
