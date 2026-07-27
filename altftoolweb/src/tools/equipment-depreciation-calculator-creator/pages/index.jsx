"use client";

import { useMemo, useState } from "react";
import { Camera, Check, Copy, RotateCcw } from "lucide-react";
import {
  DEPRECIATION_METHODS,
  bookValueAfter,
  buildDepreciationSchedule,
  costPerShoot,
} from "../lib";

const DEFAULTS = {
  cost: "250000",
  salvage: "50000",
  life: "5",
  method: "straight-line",
  factor: "2",
  maintenance: "12000",
  insurance: "6000",
  shoots: "24",
  afterYears: "3",
};

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
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const pct = (value) => (Number.isFinite(value) ? `${NUM2.format(value)}%` : DASH);

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  return text === "" ? 0 : Number(text);
};

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) =>
    setValues((prev) => ({ ...prev, [key]: event.target.value }));

  const schedule = useMemo(
    () =>
      buildDepreciationSchedule({
        cost: toNumber(values.cost),
        salvageValue: toNumber(values.salvage),
        usefulLifeYears: toNumber(values.life),
        method: values.method,
        decliningFactor: toNumber(values.factor),
      }),
    [values.cost, values.salvage, values.life, values.method, values.factor],
  );

  const ok = !schedule.error;

  const perShoot = useMemo(
    () =>
      costPerShoot({
        annualDepreciation: ok ? schedule.firstYear : 0,
        annualMaintenance: toNumber(values.maintenance),
        annualInsurance: toNumber(values.insurance),
        shootsPerYear: toNumber(values.shoots),
      }),
    [ok, schedule, values.maintenance, values.insurance, values.shoots],
  );

  const after = useMemo(
    () => (ok ? bookValueAfter(schedule, toNumber(values.afterYears)) : { error: schedule.error }),
    [ok, schedule, values.afterYears],
  );

  const activeMethod = DEPRECIATION_METHODS.find((item) => item.key === values.method);

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Equipment depreciation",
      `Purchase price: ${money(schedule.cost)}`,
      `Salvage value after ${schedule.life} years: ${money(schedule.salvageValue)}`,
      `Method: ${activeMethod ? activeMethod.label : schedule.method}`,
      `Year-one depreciation: ${money(schedule.firstYear)}`,
      `Average per year: ${money(schedule.averageAnnual)}`,
      `Total written off: ${money(schedule.totalDepreciation)}`,
      perShoot.error ? "" : `Cost per shoot in year one: ${money(perShoot.perShoot)}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [ok, schedule, activeMethod, perShoot]);

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
    setValues(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Camera className="h-4 w-4" aria-hidden="true" />
          Gear economics
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Creator Equipment Depreciation Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Gear is not free after you have paid for it. Spread the purchase price down to its resale
          value across its working life and see what one shoot really costs you in wear.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dep-cost">
              Purchase price (INR)
            </label>
            <input
              id="dep-cost"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1000"
              value={values.cost}
              onChange={setField("cost")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dep-salvage">
              Resale value at the end (INR)
            </label>
            <input
              id="dep-salvage"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={values.salvage}
              onChange={setField("salvage")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dep-life">
              Useful life (years)
            </label>
            <input
              id="dep-life"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="40"
              step="1"
              value={values.life}
              onChange={setField("life")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dep-method">
              Method
            </label>
            <select
              id="dep-method"
              className={`mt-2 ${INPUT_CLASS}`}
              value={values.method}
              onChange={setField("method")}
            >
              {DEPRECIATION_METHODS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          {values.method === "declining-balance" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="dep-factor">
                Declining balance factor (2 = double declining)
              </label>
              <input
                id="dep-factor"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0.1"
                max="5"
                step="0.5"
                value={values.factor}
                onChange={setField("factor")}
              />
            </div>
          ) : null}
        </div>
        {activeMethod ? (
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">{activeMethod.blurb}</p>
        ) : null}
      </section>

      {schedule.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {schedule.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Depreciation in year one
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(schedule.firstYear) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${pct((schedule.firstYear / schedule.cost) * 100)} of the purchase price in the first year`
                : "Fix the input above to see a figure."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy depreciation result"
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
            ["Total amount written off", ok ? money(schedule.totalDepreciation) : DASH],
            ["Average depreciation a year", ok ? money(schedule.averageAnnual) : DASH],
            ["Book value at the end of the life", ok ? money(schedule.endingBookValue) : DASH],
            [
              "Declining balance rate",
              ok && schedule.decliningRate !== null ? pct(schedule.decliningRate * 100) : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Year-by-year schedule</h2>
        {ok ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[380px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Year
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Opening
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Depreciation
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Closing
                  </th>
                </tr>
              </thead>
              <tbody>
                {schedule.rows.map((row) => (
                  <tr key={row.year} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.year}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {money(row.opening)}
                    </td>
                    <td className="py-2 pr-3 text-right">{money(row.depreciation)}</td>
                    <td className="py-2 text-right font-semibold">{money(row.closing)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{DASH}</p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What one shoot costs you</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dep-shoots">
              Shoots a year
            </label>
            <input
              id="dep-shoots"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={values.shoots}
              onChange={setField("shoots")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dep-maintenance">
              Servicing & repairs a year (INR)
            </label>
            <input
              id="dep-maintenance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={values.maintenance}
              onChange={setField("maintenance")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dep-insurance">
              Insurance a year (INR)
            </label>
            <input
              id="dep-insurance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={values.insurance}
              onChange={setField("insurance")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dep-after">
              Book value after how many years
            </label>
            <input
              id="dep-after"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={values.afterYears}
              onChange={setField("afterYears")}
            />
          </div>
        </div>

        {perShoot.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {perShoot.error}
          </p>
        ) : (
          <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
            {[
              ["Total cost of ownership in year one", money(perShoot.annualTotal)],
              ["Cost per shoot", money(perShoot.perShoot)],
              ["Of which depreciation", money(perShoot.depreciationPerShoot)],
              ["Of which servicing and insurance", money(perShoot.runningPerShoot)],
              [
                "Book value after the years above",
                after.error ? DASH : `${money(after.value)} (lost ${money(after.lostSoFar)})`,
              ],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        These are budgeting figures. The rates and methods your tax authority allows may differ from
        the one you pick here, so keep book depreciation and tax depreciation separate.
      </p>
    </main>
  );
}
