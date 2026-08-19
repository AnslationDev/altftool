"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, WashingMachine } from "lucide-react";

import { annualKwhFromUsage, computeAppliancePayback } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";
const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);
const num1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);
const units = (v) => (Number.isFinite(v) ? `${NUM0.format(v)} kWh` : DASH);
const years = (v) => (Number.isFinite(v) ? `${NUM1.format(v)} years` : DASH);
const kg = (v) => (Number.isFinite(v) ? `${NUM0.format(v)} kg` : DASH);

const DEFAULTS = {
  oldKwh: "1200",
  newKwh: "500",
  price: "45000",
  resale: "3000",
  tariff: "8",
  escalation: "5",
  discount: "8",
  life: "12",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [oldKwh, setOldKwh] = useState(DEFAULTS.oldKwh);
  const [newKwh, setNewKwh] = useState(DEFAULTS.newKwh);
  const [price, setPrice] = useState(DEFAULTS.price);
  const [resale, setResale] = useState(DEFAULTS.resale);
  const [tariff, setTariff] = useState(DEFAULTS.tariff);
  const [escalation, setEscalation] = useState(DEFAULTS.escalation);
  const [discount, setDiscount] = useState(DEFAULTS.discount);
  const [life, setLife] = useState(DEFAULTS.life);
  const [watts, setWatts] = useState("");
  const [hours, setHours] = useState("");
  const [showRows, setShowRows] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeAppliancePayback({
        oldAnnualKwh: toNumber(oldKwh),
        newAnnualKwh: toNumber(newKwh),
        newPrice: toNumber(price),
        oldResaleValue: toNumber(resale),
        tariffPerKwh: toNumber(tariff),
        tariffEscalationPct: toNumber(escalation),
        discountRatePct: toNumber(discount),
        applianceLifeYears: toNumber(life),
      }),
    [oldKwh, newKwh, price, resale, tariff, escalation, discount, life],
  );

  const failed = Boolean(result.error);

  const estimatedKwh = useMemo(
    () => annualKwhFromUsage({ watts: toNumber(watts), hoursPerDay: toNumber(hours) }),
    [watts, hours],
  );

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Appliance Upgrade Payback Calculator",
      `Current appliance: ${units(toNumber(oldKwh))} a year`,
      `Replacement: ${units(toNumber(newKwh))} a year`,
      `Net upfront cost: ${money(result.netCost)}`,
      `Units saved a year: ${units(result.annualKwhSaved)} (${num1(result.efficiencyGainPct)}% less)`,
      `First-year bill saving: ${money(result.firstYearSaving)}`,
      `Simple payback: ${years(result.simplePaybackYears)}`,
      `Discounted payback: ${result.discountedPaybackYears === null ? "never within life" : years(result.discountedPaybackYears)}`,
      `Net present value over ${result.life} years: ${money(result.npv)}`,
      `Lifetime CO2 avoided: ${kg(result.lifetimeCo2SavedKg)}`,
    ].join("\n");
  }, [failed, result, oldKwh, newKwh]);

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
    setOldKwh(DEFAULTS.oldKwh);
    setNewKwh(DEFAULTS.newKwh);
    setPrice(DEFAULTS.price);
    setResale(DEFAULTS.resale);
    setTariff(DEFAULTS.tariff);
    setEscalation(DEFAULTS.escalation);
    setDiscount(DEFAULTS.discount);
    setLife(DEFAULTS.life);
    setWatts("");
    setHours("");
    setCopied(false);
  };

  const fields = [
    { id: "old-kwh", label: "Current appliance uses (kWh a year)", value: oldKwh, set: setOldKwh, step: "10", hint: "From your own meter reading, or the old unit's label." },
    { id: "new-kwh", label: "Replacement uses (kWh a year)", value: newKwh, set: setNewKwh, step: "10", hint: "Printed on the BEE star label of the new model." },
    { id: "price", label: "Price of the new appliance", value: price, set: setPrice, step: "500", hint: "Including installation and delivery." },
    { id: "resale", label: "Trade-in or scrap value of the old one", value: resale, set: setResale, step: "500", hint: "Exchange offers count here." },
    { id: "tariff", label: "Electricity tariff (per kWh)", value: tariff, set: setTariff, step: "0.25", hint: "Your marginal slab rate, not the average on the bill." },
    { id: "escalation", label: "Expected tariff rise (% a year)", value: escalation, set: setEscalation, step: "0.5", hint: "Set to 0 to ignore future tariff increases." },
    { id: "discount", label: "Discount rate (% a year)", value: discount, set: setDiscount, step: "0.5", hint: "What the same money would earn elsewhere." },
    { id: "life", label: "Expected life of the new appliance (years)", value: life, set: setLife, step: "1", hint: "Typically 8-15 years for large white goods." },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <WashingMachine className="h-4 w-4" aria-hidden="true" />
          Efficiency payback
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Appliance Upgrade Payback Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Replacing a working appliance only makes financial sense if the energy it saves pays back
          the purchase inside its own lifetime. This works out both the plain payback and the
          discounted one, after a rising tariff.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.id}>
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                step={field.step}
                value={field.value}
                onChange={(event) => field.set(event.target.value)}
              />
              <p className={HINT_CLASS}>{field.hint}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Do not know the annual units?</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Enter the nameplate wattage and how long it runs each day, and copy the result into the
          fields above.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="calc-watts">
              Rated power (watts)
            </label>
            <input
              id="calc-watts"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={watts}
              onChange={(event) => setWatts(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="calc-hours">
              Hours used per day
            </label>
            <input
              id="calc-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="24"
              step="0.5"
              value={hours}
              onChange={(event) => setHours(event.target.value)}
            />
          </div>
        </div>
        <p className="mt-3 text-sm">
          {estimatedKwh === null ? (
            <span className="text-[var(--muted-foreground)]">
              Enter a wattage and daily hours (24 or fewer) to see the annual figure.
            </span>
          ) : (
            <span>
              That works out to{" "}
              <span className="font-semibold text-[var(--primary)]">{units(estimatedKwh)}</span> a
              year, running every day.
            </span>
          )}
        </p>
      </section>

      {failed && (
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
              Simple payback
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed || result.simplePaybackYears === null
                ? DASH
                : years(result.simplePaybackYears)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the inputs above to see a result."
                : `on a net outlay of ${money(result.netCost)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label={copied ? "Copied" : "Copy payback result"}
              className={`${GHOST_BTN} disabled:opacity-50`}
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

        {!failed && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
              result.isGoodDeal
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : "bg-[var(--danger-soft)] text-[var(--danger)]"
            }`}
          >
            {result.verdict}
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Net upfront cost", failed ? DASH : money(result.netCost)],
            ["Units saved a year", failed ? DASH : units(result.annualKwhSaved)],
            ["Efficiency gain", failed ? DASH : `${num1(result.efficiencyGainPct)}%`],
            ["First-year bill saving", failed ? DASH : money(result.firstYearSaving)],
            [
              "Discounted payback",
              failed || result.discountedPaybackYears === null
                ? DASH
                : years(result.discountedPaybackYears),
            ],
            [
              `Net present value over ${failed ? DASH : result.life} years`,
              failed ? DASH : money(result.npv),
            ],
            ["Total cash saved over its life", failed ? DASH : money(result.lifetimeNominalSaving)],
            ["Total units saved over its life", failed ? DASH : units(result.lifetimeKwhSaved)],
            ["CO2 avoided a year", failed ? DASH : kg(result.annualCo2SavedKg)],
            ["CO2 avoided over its life", failed ? DASH : kg(result.lifetimeCo2SavedKg)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Year-by-year cash flow</h2>
            <button
              type="button"
              onClick={() => setShowRows((value) => !value)}
              aria-expanded={showRows}
              className="min-h-11 rounded-md px-3 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {showRows ? "Hide" : "Show"}
            </button>
          </div>
          {showRows && (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Year
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Saving
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Discounted
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Net position
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row) => (
                    <tr key={row.year} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{row.year}</td>
                      <td className="py-2 pr-3 text-right whitespace-nowrap">
                        {money(row.nominal)}
                      </td>
                      <td className="py-2 pr-3 text-right whitespace-nowrap text-[var(--muted-foreground)]">
                        {money(row.discounted)}
                      </td>
                      <td
                        className={`py-2 text-right whitespace-nowrap font-semibold ${row.netPosition >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
                      >
                        {money(row.netPosition)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not financial advice. The result is only as good as the two consumption
        figures you feed it — label ratings are measured under standard test conditions and real
        households often use more. Manufacturing a new appliance also carries an emissions cost that
        this bill-based comparison does not capture.
      </p>
    </main>
  );
}
