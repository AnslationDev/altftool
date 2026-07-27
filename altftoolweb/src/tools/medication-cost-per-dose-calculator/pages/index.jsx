"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ReceiptIndianRupee, RotateCcw } from "lucide-react";

import { comparePacks, computeMedicationCost } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const money2 = (value) => INR2.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  packPrice: "250",
  tabletsPerPack: "15",
  tabletsPerDose: "1",
  dosesPerDay: "2",
  courseDays: "30",
  altPrice: "60",
  altTablets: "10",
  compare: true,
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [packPrice, setPackPrice] = useState(DEFAULTS.packPrice);
  const [tabletsPerPack, setTabletsPerPack] = useState(DEFAULTS.tabletsPerPack);
  const [tabletsPerDose, setTabletsPerDose] = useState(DEFAULTS.tabletsPerDose);
  const [dosesPerDay, setDosesPerDay] = useState(DEFAULTS.dosesPerDay);
  const [courseDays, setCourseDays] = useState(DEFAULTS.courseDays);
  const [compare, setCompare] = useState(DEFAULTS.compare);
  const [altPrice, setAltPrice] = useState(DEFAULTS.altPrice);
  const [altTablets, setAltTablets] = useState(DEFAULTS.altTablets);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeMedicationCost({
        packPrice: toNumber(packPrice),
        tabletsPerPack: toNumber(tabletsPerPack),
        tabletsPerDose: toNumber(tabletsPerDose),
        dosesPerDay: toNumber(dosesPerDay),
        courseDays: toNumber(courseDays),
      }),
    [packPrice, tabletsPerPack, tabletsPerDose, dosesPerDay, courseDays],
  );

  const ok = !result.error;

  const comparison = useMemo(() => {
    if (!ok || !compare) return null;
    return comparePacks({
      aPrice: toNumber(packPrice),
      aTablets: toNumber(tabletsPerPack),
      bPrice: toNumber(altPrice),
      bTablets: toNumber(altTablets),
      tabletsForCourse: result.tabletsForCourse,
    });
  }, [ok, compare, packPrice, tabletsPerPack, altPrice, altTablets, result.tabletsForCourse]);

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      "Medication cost",
      `Pack: ${money(result.packPrice)} for ${num(result.tabletsPerPack)} tablets`,
      `Cost per tablet: ${money2(result.costPerTablet)}`,
      `Cost per dose: ${money2(result.costPerDose)}`,
      `Cost per day: ${money2(result.costPerDay)}`,
      `Course of ${result.courseDays} days: ${num(result.tabletsForCourse)} tablets, ${result.packsNeeded} pack(s), ${money(result.courseCostPacks)}`,
      `Ongoing: ${money(result.costPerMonth)} a month, ${money(result.costPerYear)} a year`,
    ];
    if (comparison && !comparison.error) {
      lines.push(
        `Alternative pack: ${money2(comparison.bPerTablet)} a tablet, ${money(comparison.bCourse)} for the course`,
        comparison.cheaperOption === "same"
          ? "Both packs cost the same per tablet."
          : `Cheaper per tablet: ${comparison.cheaperOption === "a" ? "current pack" : "alternative pack"} by ${num(comparison.savingPercent)}%`,
      );
    }
    return lines.join("\n");
  }, [ok, result, comparison]);

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
    setPackPrice(DEFAULTS.packPrice);
    setTabletsPerPack(DEFAULTS.tabletsPerPack);
    setTabletsPerDose(DEFAULTS.tabletsPerDose);
    setDosesPerDay(DEFAULTS.dosesPerDay);
    setCourseDays(DEFAULTS.courseDays);
    setCompare(DEFAULTS.compare);
    setAltPrice(DEFAULTS.altPrice);
    setAltTablets(DEFAULTS.altTablets);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ReceiptIndianRupee className="h-4 w-4" aria-hidden="true" />
          Health costs
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Medication Cost Per Dose Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the printed pack price and how the medicine is taken. You get cost per tablet, per
          dose and per day, the packs the full course needs, and what the same course would cost from
          a different pack size or a generic.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mc-price">
              Pack price (MRP, INR)
            </label>
            <input
              id="mc-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={packPrice}
              onChange={(event) => setPackPrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mc-perpack">
              Tablets or capsules in the pack
            </label>
            <input
              id="mc-perpack"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={tabletsPerPack}
              onChange={(event) => setTabletsPerPack(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mc-perdose">
              Tablets per dose
            </label>
            <input
              id="mc-perdose"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.25"
              step="0.25"
              value={tabletsPerDose}
              onChange={(event) => setTabletsPerDose(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">Use 0.5 for half a tablet</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mc-perday">
              Doses per day
            </label>
            <input
              id="mc-perday"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={dosesPerDay}
              onChange={(event) => setDosesPerDay(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mc-days">
              Days in the course
            </label>
            <input
              id="mc-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={courseDays}
              onChange={(event) => setCourseDays(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-5 border-t border-[var(--border)] pt-5">
          <label className="flex min-h-11 items-center gap-3 text-sm font-semibold">
            <input
              id="mc-compare"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
              checked={compare}
              onChange={(event) => setCompare(event.target.checked)}
            />
            Compare with another pack or a generic
          </label>
          {compare ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor="mc-altprice">
                  Alternative pack price (INR)
                </label>
                <input
                  id="mc-altprice"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  value={altPrice}
                  onChange={(event) => setAltPrice(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="mc-alttabs">
                  Tablets in the alternative pack
                </label>
                <input
                  id="mc-alttabs"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="1"
                  step="1"
                  value={altTablets}
                  onChange={(event) => setAltTablets(event.target.value)}
                />
              </div>
            </div>
          ) : null}
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
              Cost per dose
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money2(result.costPerDose) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${money2(result.costPerDay)} a day · ${money(result.courseCostPacks)} for the ${result.courseDays}-day course`
                : "Correct the inputs above to see the cost."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the medication cost breakdown"
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
            ["Cost per tablet", ok ? money2(result.costPerTablet) : DASH],
            ["Cost per day", ok ? money2(result.costPerDay) : DASH],
            ["Tablets a day", ok ? num(result.tabletsPerDay) : DASH],
            ["Days one pack lasts", ok ? num(result.daysPerPack) : DASH],
            ["Tablets the course needs", ok ? num(result.tabletsForCourse) : DASH],
            ["Packs to buy", ok ? String(result.packsNeeded) : DASH],
            ["Course cost at whole packs", ok ? money(result.courseCostPacks) : DASH],
            ["Value of the tablets actually used", ok ? money(result.courseCostExact) : DASH],
            [
              "Left over after the course",
              ok ? `${num(result.leftoverTablets)} tablets (${money(result.packWastage)})` : DASH,
            ],
            ["If taken long term, per month", ok ? money(result.costPerMonth) : DASH],
            ["If taken long term, per year", ok ? money(result.costPerYear) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {compare ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-lg font-semibold">Pack comparison</h2>
          {comparison && comparison.error ? (
            <p
              role="alert"
              className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              {comparison.error}
            </p>
          ) : null}
          {comparison && !comparison.error ? (
            <>
              <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                {comparison.cheaperOption === "same"
                  ? "Both packs work out to exactly the same cost per tablet."
                  : `The ${comparison.cheaperOption === "a" ? "current" : "alternative"} pack is ${num(comparison.savingPercent)}% cheaper per tablet, a difference of ${money(comparison.savingOnCourse)} over this course.`}
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[24rem] border-collapse text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      <th scope="col" className="py-2 pr-3 font-semibold">
                        Pack
                      </th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">
                        Per tablet
                      </th>
                      <th scope="col" className="py-2 text-right font-semibold">
                        Whole course
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    <tr>
                      <td className="py-2 pr-3 font-medium">Current</td>
                      <td className="py-2 pr-3 text-right">{money2(comparison.aPerTablet)}</td>
                      <td className="py-2 text-right">{money(comparison.aCourse)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 font-medium">Alternative</td>
                      <td className="py-2 pr-3 text-right">{money2(comparison.bPerTablet)}</td>
                      <td className="py-2 text-right">{money(comparison.bCourse)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
          {!comparison ? (
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">{DASH}</p>
          ) : null}
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A cost tool, not medical advice. Prices are whatever you enter; the MRP printed on an Indian
        strip already includes GST, while pharmacy discounts and any insurance or scheme cover are
        not modelled here. Never switch brands, change a pack size or stop a course to save money
        without asking the prescriber or a pharmacist first — substitutability depends on the
        formulation, not just the salt name.
      </p>
    </main>
  );
}
