"use client";

import { useMemo, useState } from "react";
import { BadgePercent, Check, Copy, RotateCcw } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

/** Standard motor No Claim Bonus slabs applied to the own-damage premium. */
const NCB_SLABS = [
  { years: 0, rate: 0, label: "No claim-free year yet" },
  { years: 1, rate: 20, label: "After 1 claim-free year" },
  { years: 2, rate: 25, label: "After 2 consecutive claim-free years" },
  { years: 3, rate: 35, label: "After 3 consecutive claim-free years" },
  { years: 4, rate: 45, label: "After 4 consecutive claim-free years" },
  { years: 5, rate: 50, label: "After 5 or more consecutive claim-free years" },
];

const ncbRateFor = (years) => {
  const capped = Math.max(0, Math.min(5, Math.floor(years)));
  return NCB_SLABS[capped].rate;
};

const DEFAULTS = {
  odPremium: 15000,
  years: "3",
  tpPremium: 3416,
  addOns: 2500,
  gst: 18,
  claimed: false,
  protected: false,
};

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

export default function ToolHome() {
  const [odPremium, setOdPremium] = useState(String(DEFAULTS.odPremium));
  const [years, setYears] = useState(DEFAULTS.years);
  const [tpPremium, setTpPremium] = useState(String(DEFAULTS.tpPremium));
  const [addOns, setAddOns] = useState(String(DEFAULTS.addOns));
  const [gst, setGst] = useState(String(DEFAULTS.gst));
  const [claimed, setClaimed] = useState(DEFAULTS.claimed);
  const [ncbProtected, setNcbProtected] = useState(DEFAULTS.protected);
  const [copied, setCopied] = useState(false);

  const calc = useMemo(() => {
    const od = toNumber(odPremium);
    const tp = toNumber(tpPremium);
    const extras = toNumber(addOns);
    const gstRate = toNumber(gst);
    const claimFreeYears = toNumber(years);

    if ([od, tp, extras, gstRate, claimFreeYears].some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every field." };
    }
    if (od <= 0) return { error: "Own-damage premium must be greater than zero." };
    if (tp < 0 || extras < 0) return { error: "Premium amounts cannot be negative." };
    if (gstRate < 0 || gstRate > 40) return { error: "GST rate should be between 0% and 40%." };
    if (claimFreeYears < 0 || claimFreeYears > 5) {
      return { error: "Claim-free years should be between 0 and 5." };
    }

    const ncbRate = ncbRateFor(claimFreeYears);
    const discount = (od * ncbRate) / 100;
    const netOd = od - discount;
    const taxable = netOd + tp + extras;
    const gstAmount = (taxable * gstRate) / 100;
    const total = taxable + gstAmount;
    const withoutNcb = od + tp + extras;
    const totalWithoutNcb = withoutNcb * (1 + gstRate / 100);
    const savedWithGst = totalWithoutNcb - total;

    let nextYears;
    if (!claimed) nextYears = Math.min(5, claimFreeYears + 1);
    else if (ncbProtected) nextYears = claimFreeYears;
    else nextYears = 0;

    const nextRate = ncbRateFor(nextYears);
    const nextDiscount = (od * nextRate) / 100;

    return {
      od,
      tp,
      extras,
      gstRate,
      claimFreeYears,
      ncbRate,
      discount,
      netOd,
      taxable,
      gstAmount,
      total,
      savedWithGst,
      totalWithoutNcb,
      nextYears,
      nextRate,
      nextDiscount,
      lostByClaiming: claimed && !ncbProtected ? discount : 0,
    };
  }, [odPremium, years, tpPremium, addOns, gst, claimed, ncbProtected]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "No Claim Bonus Calculator",
      `Own-damage premium before NCB: ${money(calc.od)}`,
      `Consecutive claim-free years: ${calc.claimFreeYears}`,
      `NCB applicable: ${pct(calc.ncbRate)}`,
      `NCB discount on OD premium: ${money(calc.discount)}`,
      `Own-damage premium after NCB: ${money(calc.netOd)}`,
      `Third-party premium: ${money(calc.tp)}`,
      `Add-on covers: ${money(calc.extras)}`,
      `GST at ${pct(calc.gstRate)}: ${money(calc.gstAmount)}`,
      `Total premium payable: ${money(calc.total)}`,
      `Saved because of NCB (incl. GST): ${money(calc.savedWithGst)}`,
      `NCB at next renewal: ${pct(calc.nextRate)}`,
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
    setOdPremium(String(DEFAULTS.odPremium));
    setYears(DEFAULTS.years);
    setTpPremium(String(DEFAULTS.tpPremium));
    setAddOns(String(DEFAULTS.addOns));
    setGst(String(DEFAULTS.gst));
    setClaimed(DEFAULTS.claimed);
    setNcbProtected(DEFAULTS.protected);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BadgePercent className="h-4 w-4" aria-hidden="true" />
          Motor renewal
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">No Claim Bonus Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          No Claim Bonus rewards every claim-free year with a discount on the own-damage part of
          your motor premium — 20% after the first year, rising to 50% after five. Enter your
          renewal figures to see the discount, the total payable and what a claim would cost you.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ncb-od">
              Own-damage premium before NCB (INR)
            </label>
            <input
              id="ncb-od"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={odPremium}
              onChange={(event) => setOdPremium(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ncb-years">
              Consecutive claim-free years
            </label>
            <select
              id="ncb-years"
              className={`mt-2 ${INPUT_CLASS}`}
              value={years}
              onChange={(event) => setYears(event.target.value)}
            >
              {NCB_SLABS.map((slab) => (
                <option key={slab.years} value={String(slab.years)}>
                  {slab.years === 5 ? "5 or more" : slab.years} — {slab.rate}% NCB
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ncb-tp">
              Third-party premium (no NCB) (INR)
            </label>
            <input
              id="ncb-tp"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={tpPremium}
              onChange={(event) => setTpPremium(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ncb-addons">
              Add-on covers (INR)
            </label>
            <input
              id="ncb-addons"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={addOns}
              onChange={(event) => setAddOns(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ncb-gst">
              GST on premium (%)
            </label>
            <input
              id="ncb-gst"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="40"
              step="0.5"
              value={gst}
              onChange={(event) => setGst(event.target.value)}
            />
          </div>
          <div className="flex flex-col justify-center gap-3">
            <label className="flex items-center gap-3 text-sm font-semibold" htmlFor="ncb-claimed">
              <input
                id="ncb-claimed"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                checked={claimed}
                onChange={(event) => setClaimed(event.target.checked)}
              />
              I made a claim in the policy year just ended
            </label>
            <label className="flex items-center gap-3 text-sm font-semibold" htmlFor="ncb-protect">
              <input
                id="ncb-protect"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                checked={ncbProtected}
                onChange={(event) => setNcbProtected(event.target.checked)}
                disabled={!claimed}
              />
              I hold an NCB protection add-on
            </label>
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
                  NCB discount this renewal
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {money(calc.discount)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {pct(calc.ncbRate)} off the own-damage premium after {calc.claimFreeYears}{" "}
                  claim-free {calc.claimFreeYears === 1 ? "year" : "years"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy no claim bonus result"
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

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Own-damage premium", money(calc.od)],
                [`NCB at ${pct(calc.ncbRate)}`, `− ${money(calc.discount)}`],
                ["Own-damage premium after NCB", money(calc.netOd)],
                ["Third-party premium", money(calc.tp)],
                ["Add-on covers", money(calc.extras)],
                ["Taxable premium", money(calc.taxable)],
                [`GST at ${pct(calc.gstRate)}`, money(calc.gstAmount)],
                ["Total premium payable", money(calc.total)],
                ["Premium if NCB did not apply", money(calc.totalWithoutNcb)],
                ["Total saved including GST", money(calc.savedWithGst)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              NCB at your next renewal
            </p>
            <p
              className={`mt-1 text-3xl font-semibold ${
                calc.nextRate >= calc.ncbRate ? "text-[var(--success)]" : "text-[var(--danger)]"
              }`}
            >
              {pct(calc.nextRate)}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {claimed && !ncbProtected
                ? `Because you claimed, the bonus resets to zero — that is ${money(
                    calc.discount,
                  )} of discount gone at the next renewal on the same own-damage premium.`
                : claimed
                  ? `Your NCB protection add-on holds the slab at ${pct(
                      calc.nextRate,
                    )} despite the claim, worth ${money(calc.nextDiscount)} on the same own-damage premium.`
                  : `A claim-free year moves you to the ${pct(
                      calc.nextRate,
                    )} slab — about ${money(calc.nextDiscount)} off the same own-damage premium.`}
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Claim-free years
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      NCB
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Discount on your OD premium
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {NCB_SLABS.filter((slab) => slab.years > 0).map((slab) => (
                    <tr
                      key={slab.years}
                      className={`border-b border-[var(--border)] last:border-0 ${
                        slab.years === calc.claimFreeYears ? "text-[var(--primary)]" : ""
                      }`}
                    >
                      <td className="py-2 pr-3 font-semibold">
                        {slab.years === 5 ? "5 or more" : slab.years}
                      </td>
                      <td className="py-2 pr-3 text-right">{pct(slab.rate)}</td>
                      <td className="py-2 text-right">{money((calc.od * slab.rate) / 100)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. NCB applies only to the own-damage premium, never to third-party
        cover, and most insurers do not discount add-on premiums. Confirm the slab printed on your
        renewal notice.
      </p>
    </main>
  );
}
