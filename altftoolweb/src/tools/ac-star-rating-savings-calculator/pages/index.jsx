"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Star } from "lucide-react";

import { STAR_PRESETS, computeStarRatingSavings } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);

const DEFAULTS = {
  tons: "1.5",
  hours: "8",
  days: "150",
  tariff: "8",
  escalation: "5",
  life: "10",
  hiIseer: "5.0",
  hiPrice: "43000",
  loIseer: "3.7",
  loPrice: "35000",
};

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNum = (raw) => (String(raw).trim() === "" ? Number.NaN : Number(String(raw).trim()));

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      computeStarRatingSavings({
        tons: toNum(form.tons),
        hoursPerDay: toNum(form.hours),
        daysPerYear: toNum(form.days),
        tariff: toNum(form.tariff),
        escalationPct: toNum(form.escalation),
        efficientIseer: toNum(form.hiIseer),
        efficientPrice: toNum(form.hiPrice),
        baseIseer: toNum(form.loIseer),
        basePrice: toNum(form.loPrice),
        lifeYears: toNum(form.life),
      }),
    [form],
  );

  const ok = !result.error;

  const paybackText = ok
    ? result.paybackYears === null
      ? "Never at this usage"
      : `${NUM1.format(result.paybackYears)} years`
    : DASH;

  const summary = ok
    ? [
        "AC Star Rating Savings Calculator",
        `${form.tons} ton, ${form.hours} h/day for ${form.days} days a year at ${money(toNum(form.tariff))}/kWh`,
        `Efficient model: ISEER ${form.hiIseer}, ${NUM.format(result.efficientUnits)} kWh a year, ${money(result.efficientBill)}`,
        `Compared model: ISEER ${form.loIseer}, ${NUM.format(result.baseUnits)} kWh a year, ${money(result.baseBill)}`,
        `Electricity saved: ${NUM.format(result.unitsSaved)} kWh a year (${NUM.format(result.unitsSavedPct)}%)`,
        `Price premium: ${money(result.premium)}`,
        `Payback: ${paybackText}`,
        `Net benefit over ${result.lifeYears} years: ${money(result.netBenefit)}`,
      ].join("\n")
    : "";

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
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Star className="h-4 w-4" aria-hidden="true" />
          Cooling and HVAC
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          AC Star Rating Savings Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A 5-star AC costs more in the showroom and less at the meter. Enter the two ISEER values,
          the two prices and how you will actually use it, and this solves for the exact year the
          premium is paid back — with the tariff rising each year.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Usage and tariff</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="sr-tons">
              Capacity (ton)
            </label>
            <input id="sr-tons" className={INPUT} type="number" inputMode="decimal" min="0.5" max="5" step="0.1" value={form.tons} onChange={set("tons")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="sr-hours">
              Hours per day
            </label>
            <input id="sr-hours" className={INPUT} type="number" inputMode="decimal" min="1" max="24" step="0.5" value={form.hours} onChange={set("hours")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="sr-days">
              Cooling days per year
            </label>
            <input id="sr-days" className={INPUT} type="number" inputMode="numeric" min="1" max="365" step="5" value={form.days} onChange={set("days")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="sr-tariff">
              Tariff (per kWh)
            </label>
            <input id="sr-tariff" className={INPUT} type="number" inputMode="decimal" min="0.5" step="0.25" value={form.tariff} onChange={set("tariff")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="sr-escalation">
              Tariff rise per year (%)
            </label>
            <input id="sr-escalation" className={INPUT} type="number" inputMode="decimal" min="-20" max="50" step="0.5" value={form.escalation} onChange={set("escalation")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="sr-life">
              Years you will keep it
            </label>
            <input id="sr-life" className={INPUT} type="number" inputMode="numeric" min="1" max="25" step="1" value={form.life} onChange={set("life")} />
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Higher-rated model</h2>
          <div className="mt-3 grid gap-4">
            <div>
              <label className={LABEL} htmlFor="sr-hi-iseer">
                ISEER
              </label>
              <input id="sr-hi-iseer" className={INPUT} type="number" inputMode="decimal" min="2" max="7" step="0.05" value={form.hiIseer} onChange={set("hiIseer")} />
            </div>
            <div>
              <label className={LABEL} htmlFor="sr-hi-price">
                Price
              </label>
              <input id="sr-hi-price" className={INPUT} type="number" inputMode="decimal" min="0" step="500" value={form.hiPrice} onChange={set("hiPrice")} />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {STAR_PRESETS.map((preset) => (
              <button
                key={preset.stars}
                type="button"
                className={CHIP}
                onClick={() => setForm((prev) => ({ ...prev, hiIseer: String(preset.iseer) }))}
              >
                {preset.stars}-star ({preset.iseer})
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Model you are comparing with</h2>
          <div className="mt-3 grid gap-4">
            <div>
              <label className={LABEL} htmlFor="sr-lo-iseer">
                ISEER
              </label>
              <input id="sr-lo-iseer" className={INPUT} type="number" inputMode="decimal" min="2" max="7" step="0.05" value={form.loIseer} onChange={set("loIseer")} />
            </div>
            <div>
              <label className={LABEL} htmlFor="sr-lo-price">
                Price
              </label>
              <input id="sr-lo-price" className={INPUT} type="number" inputMode="decimal" min="0" step="500" value={form.loPrice} onChange={set("loPrice")} />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {STAR_PRESETS.map((preset) => (
              <button
                key={preset.stars}
                type="button"
                className={CHIP}
                onClick={() => setForm((prev) => ({ ...prev, loIseer: String(preset.iseer) }))}
              >
                {preset.stars}-star ({preset.iseer})
              </button>
            ))}
          </div>
        </section>
      </div>

      <p className="mt-2 text-xs text-[var(--muted-foreground)]">
        The star presets are indicative. BEE revises the star thresholds periodically and they vary
        by capacity band, so type in the ISEER printed on the label of the exact model you are
        considering.
      </p>

      {result.error ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Payback on the price premium
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{paybackText}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? result.worthIt
                  ? `Recovered well inside the ${result.lifeYears}-year life you expect`
                  : `Not recovered within the ${result.lifeYears} years you expect to keep it`
                : "Fix the inputs above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the star rating payback result" className={GHOST_BTN} disabled={!ok}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(ok
            ? [
                ["Higher-rated model - units per year", `${NUM.format(result.efficientUnits)} kWh`],
                ["Compared model - units per year", `${NUM.format(result.baseUnits)} kWh`],
                ["Electricity saved per year", `${NUM.format(result.unitsSaved)} kWh (${NUM.format(result.unitsSavedPct)}%)`],
                ["First-year bill saving", money(result.firstYearSaving)],
                ["Price premium to recover", money(result.premium)],
                ["Simple payback (no tariff rise)", result.simplePayback === null ? DASH : `${NUM2.format(result.simplePayback)} years`],
                ["Payback with tariff rise", result.paybackYears === null ? "Never" : `${NUM2.format(result.paybackYears)} years`],
                ["Payback in months", result.paybackMonths === null ? DASH : `${NUM.format(result.paybackMonths)} months`],
                [`Total savings over ${result.lifeYears} years`, money(result.lifetimeSaving)],
                ["Net benefit after the premium", money(result.netBenefit)],
                ["CO2 avoided per year", `${NUM.format(result.co2SavedPerYearKg)} kg`],
                [`CO2 avoided over ${result.lifeYears} years`, `${NUM.format(result.co2SavedLifetimeKg)} kg`],
              ]
            : [
                ["Electricity saved per year", DASH],
                ["Price premium to recover", DASH],
                ["Payback with tariff rise", DASH],
                ["Net benefit", DASH],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Year by year</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[380px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Year</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Saving</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Cumulative</th>
                  <th scope="col" className="py-2 text-right font-semibold">Net of premium</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.year} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.year}</td>
                    <td className="py-2 pr-3 text-right">{money(row.yearSaving)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{money(row.cumulative)}</td>
                    <td
                      className={`py-2 text-right font-semibold ${
                        row.net >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"
                      }`}
                    >
                      {row.net >= 0 ? money(row.net) : `-${money(-row.net)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. It assumes both models are used identically and that ISEER
        translates directly into consumption, which holds only approximately in a real room. Prices
        and tariffs are your own inputs — update them with actual quotes and your latest bill.
      </p>
    </main>
  );
}
