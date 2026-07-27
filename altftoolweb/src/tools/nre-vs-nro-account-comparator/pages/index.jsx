"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Globe, RotateCcw } from "lucide-react";

import {
  COMPOUNDING_OPTIONS,
  FEATURE_MATRIX,
  NRO_REPATRIATION_LIMIT_USD,
  compareNreNro,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;
const DASH = "—";

const DEFAULTS = {
  principal: "2000000",
  rate: "7",
  years: "5",
  compounding: "4",
  useTreaty: false,
  treatyRate: "15",
  usdInr: "85",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [principal, setPrincipal] = useState(DEFAULTS.principal);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [years, setYears] = useState(DEFAULTS.years);
  const [compounding, setCompounding] = useState(DEFAULTS.compounding);
  const [useTreaty, setUseTreaty] = useState(DEFAULTS.useTreaty);
  const [treatyRate, setTreatyRate] = useState(DEFAULTS.treatyRate);
  const [usdInr, setUsdInr] = useState(DEFAULTS.usdInr);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      compareNreNro({
        principal: toNumber(principal),
        annualRate: toNumber(rate),
        years: toNumber(years),
        compoundingPerYear: toNumber(compounding),
        treatyRatePercent: useTreaty ? toNumber(treatyRate) : null,
        usdInrRate: toNumber(usdInr),
      }),
    [principal, rate, years, compounding, useTreaty, treatyRate, usdInr],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "NRE vs NRO deposit comparison",
      `Deposit: ${money(result.principal)} for ${result.years} year(s)`,
      `NRE maturity (interest exempt): ${money(result.nre.maturity)}`,
      `NRO maturity after TDS at ${pct(result.nro.effectiveTdsRate)}: ${money(result.nro.maturity)}`,
      `Tax withheld on the NRO deposit: ${money(result.nro.tds)}`,
      `NRE advantage: ${money(result.advantageToNre)}`,
      `Post-tax yield — NRE ${pct(result.nre.postTaxYield)}, NRO ${pct(result.nro.postTaxYield)}`,
    ].join("\n");
  }, [failed, result]);

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
    setPrincipal(DEFAULTS.principal);
    setRate(DEFAULTS.rate);
    setYears(DEFAULTS.years);
    setCompounding(DEFAULTS.compounding);
    setUseTreaty(DEFAULTS.useTreaty);
    setTreatyRate(DEFAULTS.treatyRate);
    setUsdInr(DEFAULTS.usdInr);
    setCopied(false);
  };

  const rows = [
    ["Maturity value", failed ? DASH : money(result.nre.maturity), failed ? DASH : money(result.nro.maturity)],
    ["Interest credited", failed ? DASH : money(result.nre.interest), failed ? DASH : money(result.nro.interest)],
    [
      "Tax withheld in India",
      failed ? DASH : "Nil",
      failed ? DASH : `${money(result.nro.tds)} (${pct(result.nro.effectiveTdsRate)})`,
    ],
    ["Interest you keep", failed ? DASH : money(result.nre.netInterest), failed ? DASH : money(result.nro.netInterest)],
    [
      "Post-tax annual yield",
      failed ? DASH : pct(result.nre.postTaxYield),
      failed ? DASH : pct(result.nro.postTaxYield),
    ],
    [
      "Repatriable in one financial year",
      failed ? DASH : money(result.nre.repatriable),
      failed ? DASH : money(result.nro.repatriable),
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Globe className="h-4 w-4" aria-hidden="true" />
          NRI banking
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          NRE vs NRO Account Comparator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The same deposit at the same rate ends up worth different amounts depending on which
          account holds it: NRE interest is exempt under Section 10(4)(ii), while NRO interest is
          taxed and TDS is withheld as it is credited, so the balance compounds net of tax.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="nri-principal">
              Deposit amount (INR)
            </label>
            <input
              id="nri-principal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50000"
              value={principal}
              onChange={(event) => setPrincipal(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nri-rate">
              Interest rate (% per year)
            </label>
            <input
              id="nri-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="30"
              step="0.05"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nri-years">
              Tenure (years)
            </label>
            <input
              id="nri-years"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.25"
              max="20"
              step="0.25"
              value={years}
              onChange={(event) => setYears(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nri-compounding">
              Compounding
            </label>
            <select
              id="nri-compounding"
              className={`mt-2 ${INPUT_CLASS}`}
              value={compounding}
              onChange={(event) => setCompounding(event.target.value)}
            >
              {COMPOUNDING_OPTIONS.map((option) => (
                <option key={option.value} value={String(option.value)}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nri-usdinr">
              Rupees per US dollar (for the repatriation cap)
            </label>
            <input
              id="nri-usdinr"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="500"
              step="0.25"
              value={usdInr}
              onChange={(event) => setUsdInr(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="nri-treaty-rate">
              DTAA rate on interest (%)
            </label>
            <input
              id="nri-treaty-rate"
              className={`mt-2 ${INPUT_CLASS} disabled:opacity-50`}
              type="number"
              inputMode="decimal"
              min="0"
              max="30"
              step="0.5"
              value={treatyRate}
              disabled={!useTreaty}
              onChange={(event) => setTreatyRate(event.target.value)}
            />
          </div>
          <label
            className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium text-[var(--foreground)] sm:col-span-2"
            htmlFor="nri-use-treaty"
          >
            <input
              id="nri-use-treaty"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={useTreaty}
              onChange={(event) => setUseTreaty(event.target.checked)}
            />
            Claim a treaty rate on the NRO interest (needs a Tax Residency Certificate and Form 10F)
          </label>
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Extra you keep by holding it as NRE
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : money(result.advantageToNre)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the highlighted input to see a result."
                : `${pct(result.advantageSharePercent)} more than the same deposit held as NRO`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy NRE versus NRO comparison"
              className={`${GHOST_BTN} disabled:opacity-50`}
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

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[360px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Measure
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  NRE
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  NRO
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, nre, nro]) => (
                <tr key={label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">{label}</td>
                  <td className="py-2.5 pr-3 text-right font-semibold">{nre}</td>
                  <td className="py-2.5 text-right font-semibold">{nro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!failed && result.nro.repatriationCapped && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            The NRO maturity value exceeds the {USD.format(NRO_REPATRIATION_LIMIT_USD)} a year
            remittance ceiling ({money(result.nro.repatriationCapInr)} at the rate entered), so the
            balance would take more than one financial year to move out.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">How the two accounts differ</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Feature
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  NRE
                </th>
                <th scope="col" className="py-2 font-semibold">
                  NRO
                </th>
              </tr>
            </thead>
            <tbody>
              {FEATURE_MATRIX.map((row) => (
                <tr key={row.feature} className="border-b border-[var(--border)] last:border-0 align-top">
                  <td className="py-2.5 pr-3 font-semibold">{row.feature}</td>
                  <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">{row.nre}</td>
                  <td className="py-2.5 text-[var(--muted-foreground)]">{row.nro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax or investment advice. The NRE exemption depends on staying a
        person resident outside India under FEMA, and interest may still be taxable in your country
        of residence. Treaty relief needs a Tax Residency Certificate, Form 10F and a
        no-permanent-establishment declaration. Speak to a chartered accountant or a cross-border
        tax adviser before acting on these numbers.
      </p>
    </main>
  );
}
