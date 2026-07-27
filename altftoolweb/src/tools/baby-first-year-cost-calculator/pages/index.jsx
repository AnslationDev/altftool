"use client";

import { useMemo, useState } from "react";
import { Baby, Check, Copy, RotateCcw } from "lucide-react";

import { FEEDING_MODES, estimateBabyFirstYearCost } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  delivery: "80000",
  prenatal: "25000",
  gear: "45000",
  reimbursed: "50000",
  diaperPrice: "12",
  diaperScale: "1",
  feedingMode: "mixed",
  tins: "5",
  tinPrice: "700",
  solids: "1500",
  clothing: "800",
  vaccineCost: "3000",
  vaccineVisits: "5",
  doctorVisits: "8",
  visitCost: "800",
  childcare: "12000",
  childcareMonths: "6",
  misc: "1000",
  monthsToBirth: "6",
  existing: "20000",
  returnPct: "6",
};

export default function ToolHome() {
  const [delivery, setDelivery] = useState(DEFAULTS.delivery);
  const [prenatal, setPrenatal] = useState(DEFAULTS.prenatal);
  const [gear, setGear] = useState(DEFAULTS.gear);
  const [reimbursed, setReimbursed] = useState(DEFAULTS.reimbursed);
  const [diaperPrice, setDiaperPrice] = useState(DEFAULTS.diaperPrice);
  const [diaperScale, setDiaperScale] = useState(DEFAULTS.diaperScale);
  const [feedingMode, setFeedingMode] = useState(DEFAULTS.feedingMode);
  const [tins, setTins] = useState(DEFAULTS.tins);
  const [tinPrice, setTinPrice] = useState(DEFAULTS.tinPrice);
  const [solids, setSolids] = useState(DEFAULTS.solids);
  const [clothing, setClothing] = useState(DEFAULTS.clothing);
  const [vaccineCost, setVaccineCost] = useState(DEFAULTS.vaccineCost);
  const [vaccineVisits, setVaccineVisits] = useState(DEFAULTS.vaccineVisits);
  const [doctorVisits, setDoctorVisits] = useState(DEFAULTS.doctorVisits);
  const [visitCost, setVisitCost] = useState(DEFAULTS.visitCost);
  const [childcare, setChildcare] = useState(DEFAULTS.childcare);
  const [childcareMonths, setChildcareMonths] = useState(DEFAULTS.childcareMonths);
  const [misc, setMisc] = useState(DEFAULTS.misc);
  const [monthsToBirth, setMonthsToBirth] = useState(DEFAULTS.monthsToBirth);
  const [existing, setExisting] = useState(DEFAULTS.existing);
  const [returnPct, setReturnPct] = useState(DEFAULTS.returnPct);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      estimateBabyFirstYearCost({
        deliveryCost: delivery,
        prenatalCost: prenatal,
        gearCost: gear,
        insuranceReimbursement: reimbursed,
        diaperPrice,
        diaperUsageScale: diaperScale,
        feedingMode,
        formulaTinsPerMonth: tins,
        formulaTinPrice: tinPrice,
        solidsPerMonth: solids,
        clothingPerMonth: clothing,
        vaccinationVisitCost: vaccineCost,
        vaccinationVisits: vaccineVisits,
        doctorVisits,
        doctorVisitCost: visitCost,
        childcarePerMonth: childcare,
        childcareMonths,
        miscPerMonth: misc,
        monthsToBirth,
        existingSavings: existing,
        savingsReturn: returnPct,
      }),
    [
      delivery, prenatal, gear, reimbursed, diaperPrice, diaperScale, feedingMode, tins,
      tinPrice, solids, clothing, vaccineCost, vaccineVisits, doctorVisits, visitCost,
      childcare, childcareMonths, misc, monthsToBirth, existing, returnPct,
    ],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Baby First Year Cost",
      `Total for the first twelve months: ${money(result.total)}`,
      `One-off costs after insurance: ${money(result.oneOffNet)} (gross ${money(result.oneOffGross)})`,
      `Running costs across the year: ${money(result.recurringTotal)} — ${money(result.recurringPerMonth)} a month`,
      `Average across the year: ${money(result.averagePerMonth)} a month`,
      `About ${num(result.diaperCount)} diapers costing ${money(result.diaperTotal)}`,
      `Feeding pattern: ${result.feedingLabel} — formula ${money(result.formulaTotal)}`,
      result.birthFunded
        ? "The one-off costs are already covered."
        : `Save ${money(result.monthlySaving)} a month for ${result.monthsToBirth} months to cover the one-off costs.`,
    ].join("\n");
  }, [hasError, result]);

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
    setDelivery(DEFAULTS.delivery);
    setPrenatal(DEFAULTS.prenatal);
    setGear(DEFAULTS.gear);
    setReimbursed(DEFAULTS.reimbursed);
    setDiaperPrice(DEFAULTS.diaperPrice);
    setDiaperScale(DEFAULTS.diaperScale);
    setFeedingMode(DEFAULTS.feedingMode);
    setTins(DEFAULTS.tins);
    setTinPrice(DEFAULTS.tinPrice);
    setSolids(DEFAULTS.solids);
    setClothing(DEFAULTS.clothing);
    setVaccineCost(DEFAULTS.vaccineCost);
    setVaccineVisits(DEFAULTS.vaccineVisits);
    setDoctorVisits(DEFAULTS.doctorVisits);
    setVisitCost(DEFAULTS.visitCost);
    setChildcare(DEFAULTS.childcare);
    setChildcareMonths(DEFAULTS.childcareMonths);
    setMisc(DEFAULTS.misc);
    setMonthsToBirth(DEFAULTS.monthsToBirth);
    setExisting(DEFAULTS.existing);
    setReturnPct(DEFAULTS.returnPct);
    setCopied(false);
  };

  const oneOffFields = [
    { id: "bb-delivery", label: "Delivery & hospital package (₹)", value: delivery, set: setDelivery, step: "5000", min: "0" },
    { id: "bb-prenatal", label: "Pre-natal scans, tests & visits (₹)", value: prenatal, set: setPrenatal, step: "1000", min: "0" },
    { id: "bb-gear", label: "Cot, pram, car seat & gear (₹)", value: gear, set: setGear, step: "1000", min: "0" },
    { id: "bb-reimbursed", label: "Reimbursed by maternity insurance (₹)", value: reimbursed, set: setReimbursed, step: "5000", min: "0" },
  ];

  const runningFields = [
    { id: "bb-diaperprice", label: "Price of one diaper (₹)", value: diaperPrice, set: setDiaperPrice, step: "0.5", min: "0" },
    { id: "bb-diaperscale", label: "Diaper usage vs typical (1 = typical)", value: diaperScale, set: setDiaperScale, step: "0.1", min: "0" },
    { id: "bb-tins", label: "Formula tins a month at full feeding", value: tins, set: setTins, step: "1", min: "0" },
    { id: "bb-tinprice", label: "Price of one formula tin (₹)", value: tinPrice, set: setTinPrice, step: "50", min: "0" },
    { id: "bb-solids", label: "Baby food a month, from month 6 (₹)", value: solids, set: setSolids, step: "100", min: "0" },
    { id: "bb-clothing", label: "Clothing & bedding a month (₹)", value: clothing, set: setClothing, step: "100", min: "0" },
    { id: "bb-vaccinecost", label: "Cost of one immunisation visit (₹)", value: vaccineCost, set: setVaccineCost, step: "250", min: "0" },
    { id: "bb-vaccinevisits", label: "Immunisation visits in year one", value: vaccineVisits, set: setVaccineVisits, step: "1", min: "0" },
    { id: "bb-doctorvisits", label: "Other paediatric visits", value: doctorVisits, set: setDoctorVisits, step: "1", min: "0" },
    { id: "bb-visitcost", label: "Cost per consultation (₹)", value: visitCost, set: setVisitCost, step: "100", min: "0" },
    { id: "bb-childcare", label: "Creche or nanny a month (₹)", value: childcare, set: setChildcare, step: "1000", min: "0" },
    { id: "bb-childcaremonths", label: "Months of paid childcare", value: childcareMonths, set: setChildcareMonths, step: "1", min: "0" },
    { id: "bb-misc", label: "Everything else a month (₹)", value: misc, set: setMisc, step: "250", min: "0" },
  ];

  const savingFields = [
    { id: "bb-months", label: "Months until the birth", value: monthsToBirth, set: setMonthsToBirth, step: "1", min: "1" },
    { id: "bb-existing", label: "Already saved (₹)", value: existing, set: setExisting, step: "5000", min: "0" },
    { id: "bb-return", label: "Return on those savings (% per year)", value: returnPct, set: setReturnPct, step: "0.5", min: "0" },
  ];

  const rows = hasError
    ? [
        ["One-off costs, gross", DASH],
        ["Less insurance reimbursement", DASH],
        ["One-off costs you pay", DASH],
        ["Running costs across the year", DASH],
        ["Running cost a month", DASH],
        ["Average across the year", DASH],
        ["Diapers used", DASH],
      ]
    : [
        ["One-off costs, gross", money(result.oneOffGross)],
        ["Less insurance reimbursement", `−${money(result.reimbursementApplied)}`],
        ["One-off costs you pay", money(result.oneOffNet)],
        ["Running costs across the year", money(result.recurringTotal)],
        ["Running cost a month", money(result.recurringPerMonth)],
        ["Average across the year", `${money(result.averagePerMonth)} a month`],
        ["Diapers used", `${num(result.diaperCount)} · ${money(result.diaperTotal)}`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Baby className="h-4 w-4" aria-hidden="true" />
          New arrival
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Baby Cost First Year Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Built from quantities rather than guesses: diapers counted stage by stage as usage
          falls, formula scaled to how the baby is fed, solids only from month six, and the five
          routine immunisation contacts of the first year.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">One-off costs</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {oneOffFields.map((field) => (
            <div key={field.id}>
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min={field.min}
                step={field.step}
                value={field.value}
                onChange={(event) => field.set(event.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Running costs</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bb-feeding">
              Feeding pattern
            </label>
            <select
              id="bb-feeding"
              className={`mt-2 ${INPUT_CLASS}`}
              value={feedingMode}
              onChange={(event) => setFeedingMode(event.target.value)}
            >
              {FEEDING_MODES.map((mode) => (
                <option key={mode.id} value={mode.id}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>
          {runningFields.map((field) => (
            <div key={field.id}>
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min={field.min}
                step={field.step}
                value={field.value}
                onChange={(event) => field.set(event.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Saving for it</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {savingFields.map((field) => (
            <div key={field.id}>
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min={field.min}
                step={field.step}
                value={field.value}
                onChange={(event) => field.set(event.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              First twelve months
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.total)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the estimate."
                : `About ${money(result.averagePerMonth)} a month across the year`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy baby first year cost estimate"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Saving for the one-off costs</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Delivery, pre-natal care and gear are needed by the birth. Running costs are met from
            income through the year, so they are excluded from this target.
          </p>
          <p className="mt-3 text-3xl font-semibold text-[var(--primary)]">
            {result.birthFunded ? money(0) : money(result.monthlySaving)}
            <span className="ml-2 text-sm font-medium text-[var(--muted-foreground)]">a month</span>
          </p>
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Needed by the birth</dt>
              <dd className="text-right font-semibold">{money(result.needByBirth)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Existing savings by then</dt>
              <dd className="text-right font-semibold">{money(result.existingFuture)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Shortfall</dt>
              <dd className="text-right font-semibold">{money(result.gap)}</dd>
            </div>
          </dl>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Where the money goes</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Category</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Type</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Amount</th>
                  <th scope="col" className="py-2 text-right font-semibold">Share</th>
                </tr>
              </thead>
              <tbody>
                {result.categories.map((entry) => (
                  <tr key={entry.label} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{entry.label}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                      {entry.group === "one-off" ? "One-off" : "Ongoing"}
                    </td>
                    <td className="py-2 pr-3 text-right font-semibold">{money(entry.amount)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {num(entry.sharePct)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Shares are of gross spending before any insurance reimbursement. Vaccines in India's
            National Immunisation Schedule are provided free at government facilities — set the
            immunisation cost to zero if you use one.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        An estimate for budgeting, built from the quantities you enter. Hospital packages, insurance
        waiting periods for maternity cover, and childcare rates vary widely by city and provider.
        Nothing here is medical or insurance advice — check your policy documents and speak to your
        doctor about feeding and immunisation.
      </p>
    </main>
  );
}
