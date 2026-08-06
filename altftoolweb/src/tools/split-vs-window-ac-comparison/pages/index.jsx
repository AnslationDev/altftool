"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Check, Copy, RotateCcw } from "lucide-react";

import { TYPICAL_ISEER, compareSplitVsWindow } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);

const DEFAULTS = {
  tons: "1.5",
  hours: "8",
  days: "150",
  tariff: "8",
  escalation: "5",
  years: "10",
  splitPrice: "40000",
  splitInstall: "3000",
  splitIseer: String(TYPICAL_ISEER.splitInverter5Star),
  splitMaint: "1500",
  windowPrice: "30000",
  windowInstall: "1500",
  windowIseer: String(TYPICAL_ISEER.window3Star),
  windowMaint: "1200",
};

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNum = (raw) => (String(raw).trim() === "" ? Number.NaN : Number(String(raw).trim()));

const NON_COST = [
  ["Installation", "Needs a wall core-cut, copper piping and an outdoor stand", "Drops into an existing window or a wall sleeve"],
  ["Noise inside the room", "Compressor sits outdoors, typically 30-45 dB indoors", "Compressor is in the room, typically 50-60 dB"],
  ["Room opening", "Only a small pipe hole", "Loses a whole window and its daylight"],
  ["Servicing", "Two units to clean, higher labour", "One box, easy to clean"],
  ["Shifting house", "Re-installation charge and often new copper", "Lift it out and take it"],
];

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      compareSplitVsWindow({
        tons: toNum(form.tons),
        hoursPerDay: toNum(form.hours),
        daysPerYear: toNum(form.days),
        tariff: toNum(form.tariff),
        escalationPct: toNum(form.escalation),
        years: toNum(form.years),
        split: {
          price: toNum(form.splitPrice),
          install: toNum(form.splitInstall),
          iseer: toNum(form.splitIseer),
          maintenance: toNum(form.splitMaint),
        },
        window: {
          price: toNum(form.windowPrice),
          install: toNum(form.windowInstall),
          iseer: toNum(form.windowIseer),
          maintenance: toNum(form.windowMaint),
        },
      }),
    [form],
  );

  const ok = !result.error;
  const cheaperLabel = ok && result.cheaper === "split" ? "Split AC" : "Window AC";
  const pricierLabel = ok && result.cheaper === "split" ? "window" : "split";

  const summary = ok
    ? [
        "Split vs Window AC Comparison",
        `Capacity ${form.tons} ton, ${form.hours} h/day for ${form.days} days a year at ${money(toNum(form.tariff))}/kWh`,
        `Split: ISEER ${NUM2.format(result.split.iseer)}, ${NUM.format(result.split.annualUnits)} kWh/yr, first-year bill ${money(result.split.firstYearBill)}`,
        `Window: ISEER ${NUM2.format(result.window.iseer)}, ${NUM.format(result.window.annualUnits)} kWh/yr, first-year bill ${money(result.window.firstYearBill)}`,
        `${result.horizon}-year total — split ${money(result.splitTotal)}, window ${money(result.windowTotal)}`,
        `Cheaper over ${result.horizon} years: ${cheaperLabel} by ${money(result.saving)}`,
        result.breakevenYear
          ? `${cheaperLabel} overtakes ${pricierLabel} in year ${result.breakevenYear} and stays ahead through year ${result.horizon}`
          : `${cheaperLabel} does not take a lasting lead within ${result.horizon} years`,
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
          <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
          Cooling and HVAC
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Split vs Window AC Comparison
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A window AC costs less to buy and almost nothing to install. A split AC with a much higher
          ISEER costs less to run. This works out how many summers it takes for the running-cost
          gap to erase the price gap.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">How you will use it</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="sw-tons">
              Capacity (ton)
            </label>
            <input id="sw-tons" className={INPUT} type="number" inputMode="decimal" min="0.5" max="5" step="0.5" value={form.tons} onChange={set("tons")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="sw-hours">
              Hours per day
            </label>
            <input id="sw-hours" className={INPUT} type="number" inputMode="decimal" min="1" max="24" step="0.5" value={form.hours} onChange={set("hours")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="sw-days">
              Cooling days per year
            </label>
            <input id="sw-days" className={INPUT} type="number" inputMode="numeric" min="1" max="365" step="5" value={form.days} onChange={set("days")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="sw-tariff">
              Electricity tariff (per kWh)
            </label>
            <input id="sw-tariff" className={INPUT} type="number" inputMode="decimal" min="0" step="0.25" value={form.tariff} onChange={set("tariff")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="sw-escalation">
              Tariff rise per year (%)
            </label>
            <input id="sw-escalation" className={INPUT} type="number" inputMode="decimal" min="-20" max="50" step="0.5" value={form.escalation} onChange={set("escalation")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="sw-years">
              Years you will keep it
            </label>
            <input id="sw-years" className={INPUT} type="number" inputMode="numeric" min="1" max="20" step="1" value={form.years} onChange={set("years")} />
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Split AC</h2>
          <div className="mt-3 grid gap-4">
            <div>
              <label className={LABEL} htmlFor="sw-split-price">
                Purchase price
              </label>
              <input id="sw-split-price" className={INPUT} type="number" inputMode="decimal" min="0" step="500" value={form.splitPrice} onChange={set("splitPrice")} />
            </div>
            <div>
              <label className={LABEL} htmlFor="sw-split-install">
                Installation, copper and stand
              </label>
              <input id="sw-split-install" className={INPUT} type="number" inputMode="decimal" min="0" step="250" value={form.splitInstall} onChange={set("splitInstall")} />
            </div>
            <div>
              <label className={LABEL} htmlFor="sw-split-iseer">
                ISEER from the BEE label
              </label>
              <input id="sw-split-iseer" className={INPUT} type="number" inputMode="decimal" min="2" max="7" step="0.05" value={form.splitIseer} onChange={set("splitIseer")} />
            </div>
            <div>
              <label className={LABEL} htmlFor="sw-split-maint">
                Servicing per year
              </label>
              <input id="sw-split-maint" className={INPUT} type="number" inputMode="decimal" min="0" step="100" value={form.splitMaint} onChange={set("splitMaint")} />
            </div>
          </div>
        </section>

        <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Window AC</h2>
          <div className="mt-3 grid gap-4">
            <div>
              <label className={LABEL} htmlFor="sw-win-price">
                Purchase price
              </label>
              <input id="sw-win-price" className={INPUT} type="number" inputMode="decimal" min="0" step="500" value={form.windowPrice} onChange={set("windowPrice")} />
            </div>
            <div>
              <label className={LABEL} htmlFor="sw-win-install">
                Installation and frame work
              </label>
              <input id="sw-win-install" className={INPUT} type="number" inputMode="decimal" min="0" step="250" value={form.windowInstall} onChange={set("windowInstall")} />
            </div>
            <div>
              <label className={LABEL} htmlFor="sw-win-iseer">
                ISEER from the BEE label
              </label>
              <input id="sw-win-iseer" className={INPUT} type="number" inputMode="decimal" min="2" max="7" step="0.05" value={form.windowIseer} onChange={set("windowIseer")} />
            </div>
            <div>
              <label className={LABEL} htmlFor="sw-win-maint">
                Servicing per year
              </label>
              <input id="sw-win-maint" className={INPUT} type="number" inputMode="decimal" min="0" step="100" value={form.windowMaint} onChange={set("windowMaint")} />
            </div>
          </div>
        </section>
      </div>

      {result.error ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      ) : null}

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        role="status"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Cheaper over {ok ? result.horizon : DASH} years
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? (result.cheaper === "split" ? "Split AC" : "Window AC") : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `Saves ${money(result.saving)} in total cost of ownership`
                : "Fix the inputs above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the split versus window comparison" className={GHOST_BTN} disabled={!ok}>
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
                ["Split - upfront (price + install)", money(result.split.upfront)],
                ["Window - upfront (price + install)", money(result.window.upfront)],
                ["Split - average input power", `${NUM.format(result.split.inputWatts)} W`],
                ["Window - average input power", `${NUM.format(result.window.inputWatts)} W`],
                ["Split - units per year", `${NUM.format(result.split.annualUnits)} kWh`],
                ["Window - units per year", `${NUM.format(result.window.annualUnits)} kWh`],
                [
                  result.unitsSavedPerYear >= 0
                    ? "Electricity saved per year by the split"
                    : "Electricity extra used per year by the split",
                  `${NUM.format(Math.abs(result.unitsSavedPerYear))} kWh`,
                ],
                ["First-year bill difference", money(result.firstYearBillGap)],
                [`Split total over ${result.horizon} years`, money(result.splitTotal)],
                [`Window total over ${result.horizon} years`, money(result.windowTotal)],
                [
                  `${cheaperLabel} overtakes ${pricierLabel} in`,
                  result.breakevenYear ? `year ${result.breakevenYear}` : `not within ${result.horizon} years`,
                ],
                [
                  result.co2SavedPerYear >= 0
                    ? "CO2 avoided per year by the split"
                    : "CO2 extra emitted per year by the split",
                  `${NUM.format(Math.abs(result.co2SavedPerYear))} kg`,
                ],
              ]
            : [
                ["Split - upfront (price + install)", DASH],
                ["Window - upfront (price + install)", DASH],
                ["Split total", DASH],
                ["Window total", DASH],
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
          <h2 className="text-base font-semibold">Cumulative cost, year by year</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Year</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Split total</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Window total</th>
                  <th scope="col" className="py-2 text-right font-semibold">Split ahead by</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.year} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.year}</td>
                    <td className="py-2 pr-3 text-right">{money(row.splitCum)}</td>
                    <td className="py-2 pr-3 text-right">{money(row.windowCum)}</td>
                    <td
                      className={`py-2 text-right font-semibold ${
                        row.gap >= 0 ? "text-[var(--success)]" : "text-[var(--muted-foreground)]"
                      }`}
                    >
                      {row.gap >= 0 ? money(row.gap) : `-${money(-row.gap)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Things money does not capture</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Aspect</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Split</th>
                <th scope="col" className="py-2 font-semibold">Window</th>
              </tr>
            </thead>
            <tbody>
              {NON_COST.map(([aspect, splitNote, windowNote]) => (
                <tr key={aspect} className="border-b border-[var(--border)] last:border-0 align-top">
                  <td className="py-2 pr-3 font-semibold">{aspect}</td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{splitNote}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{windowNote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Electricity is modelled from the ISEER on the BEE label, which is a seasonal average — real
        consumption varies with setpoint, room load and how well the filters are kept. Prices,
        installation charges and service rates are your own inputs, so update them with actual
        quotes before deciding.
      </p>
    </main>
  );
}
