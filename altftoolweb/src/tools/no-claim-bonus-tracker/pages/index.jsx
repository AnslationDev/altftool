"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShieldCheck } from "lucide-react";

import { MAX_PROJECTION_YEARS, NCB_SLABS, projectNcb } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  odPremium: "12000",
  tpPremium: "2094",
  ncb: "25",
  years: "5",
  claimYear: "1",
  claimAmount: "18000",
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [odPremium, setOdPremium] = useState(DEFAULTS.odPremium);
  const [tpPremium, setTpPremium] = useState(DEFAULTS.tpPremium);
  const [ncb, setNcb] = useState(DEFAULTS.ncb);
  const [years, setYears] = useState(DEFAULTS.years);
  const [claimYear, setClaimYear] = useState(DEFAULTS.claimYear);
  const [claimAmount, setClaimAmount] = useState(DEFAULTS.claimAmount);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      projectNcb({
        odPremium: toNumber(odPremium),
        tpPremium: toNumber(tpPremium),
        currentNcbPercent: toNumber(ncb),
        years: toNumber(years),
        claimYear: toNumber(claimYear),
        claimAmount: toNumber(claimAmount),
      }),
    [odPremium, tpPremium, ncb, years, claimYear, claimAmount],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "No Claim Bonus Tracker",
      `Current NCB: ${result.startNcbPercent}%`,
      `Discount this renewal: ${money(result.thisYearDiscount)}`,
      `NCB at next renewal if claim-free: ${result.nextNcbPercent}%`,
      `Own damage premium over ${result.horizon} years (no claim): ${money(result.totalOdNoClaim)}`,
      result.claimYear > 0
        ? `Own damage premium over ${result.horizon} years (claim in year ${result.claimYear}): ${money(result.totalOdWithClaim)}`
        : "No claim modelled",
      result.claimYear > 0 ? `Extra premium caused by the claim: ${money(result.extraPremium)}` : "",
      result.claimYear > 0
        ? `Claim payout ${money(result.claimAmount)} minus extra premium = ${money(result.netBenefit)}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [ok, result]);

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
    setOdPremium(DEFAULTS.odPremium);
    setTpPremium(DEFAULTS.tpPremium);
    setNcb(DEFAULTS.ncb);
    setYears(DEFAULTS.years);
    setClaimYear(DEFAULTS.claimYear);
    setClaimAmount(DEFAULTS.claimAmount);
    setCopied(false);
  };

  const horizonOptions = ok ? result.horizon : 5;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Motor insurance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">No Claim Bonus Tracker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Climb the 20 · 25 · 35 · 45 · 50 percent NCB ladder year by year, and see exactly how much
          extra own-damage premium a single claim will cost you before the bonus builds back.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ncb-od">
              Own damage premium before NCB (INR)
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
            <label className={LABEL_CLASS} htmlFor="ncb-tp">
              Third party premium per year (INR)
            </label>
            <input
              id="ncb-tp"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={tpPremium}
              onChange={(event) => setTpPremium(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ncb-current">
              NCB at this renewal
            </label>
            <select
              id="ncb-current"
              className={`mt-2 ${INPUT_CLASS}`}
              value={ncb}
              onChange={(event) => setNcb(event.target.value)}
            >
              {NCB_SLABS.map((slab) => (
                <option key={slab} value={String(slab)}>
                  {slab}%
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ncb-years">
              Policy years to project
            </label>
            <input
              id="ncb-years"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_PROJECTION_YEARS}
              step="1"
              value={years}
              onChange={(event) => setYears(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ncb-claim-year">
              Claim lodged in policy year
            </label>
            <select
              id="ncb-claim-year"
              className={`mt-2 ${INPUT_CLASS}`}
              value={claimYear}
              onChange={(event) => setClaimYear(event.target.value)}
            >
              <option value="0">No claim</option>
              {Array.from({ length: horizonOptions }, (_, i) => i + 1).map((year) => (
                <option key={year} value={String(year)}>
                  Year {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ncb-claim-amount">
              Claim amount the insurer would pay (INR)
            </label>
            <input
              id="ncb-claim-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={claimAmount}
              onChange={(event) => setClaimAmount(event.target.value)}
            />
          </div>
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Discount you earn this renewal
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(result.thisYearDiscount) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.startNcbPercent}% off the own damage premium · ${result.nextNcbPercent}% next year if you stay claim-free`
                : "Fix the inputs above to see your bonus."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy no claim bonus result"
              className={GHOST_BTN}
              disabled={!ok}
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
            [
              `Own damage premium over ${ok ? result.horizon : DASH} years, claim-free`,
              ok ? money(result.totalOdNoClaim) : DASH,
            ],
            [
              "Own damage premium if you claim",
              ok && result.claimYear > 0 ? money(result.totalOdWithClaim) : DASH,
            ],
            [
              "Extra premium the claim causes",
              ok && result.claimYear > 0 ? money(result.extraPremium) : DASH,
            ],
            [
              "Claim payout minus extra premium",
              ok && result.claimYear > 0 ? money(result.netBenefit) : DASH,
            ],
            [
              "Total premium including third party, claim-free",
              ok ? money(result.totalPremiumNoClaim) : DASH,
            ],
            [
              "Years to climb from 0% back to 50%",
              ok ? `${result.yearsToMaxFromZero} claim-free years` : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && result.claimYear > 0 ? (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
              result.worthClaiming
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : "bg-[var(--danger-soft)] text-[var(--danger)]"
            }`}
          >
            {result.worthClaiming
              ? `Claiming leaves you ${money(result.netBenefit)} better off over ${result.horizon} years.`
              : `Paying this repair yourself is cheaper — claiming leaves you ${money(Math.abs(result.netBenefit))} worse off over ${result.horizon} years.`}
          </p>
        ) : null}
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Year-by-year bonus ladder</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Year
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    NCB claim-free
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    OD payable
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    NCB if you claim
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    OD payable
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row, index) => {
                  const claimRow = result.claimRows ? result.claimRows[index] : null;
                  return (
                    <tr key={row.year} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{row.year}</td>
                      <td className="py-2 pr-3 text-right">{row.ncbPercent}%</td>
                      <td className="py-2 pr-3 text-right">{money(row.odPayable)}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {claimRow ? `${claimRow.ncbPercent}%` : DASH}
                      </td>
                      <td className="py-2 text-right text-[var(--muted-foreground)]">
                        {claimRow ? money(claimRow.odPayable) : DASH}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. NCB applies only to the own damage premium, never to the third party
        premium, and lapses if you renew more than 90 days after expiry. Check your policy schedule
        and any NCB protect add-on wording with your insurer.
      </p>
    </main>
  );
}
