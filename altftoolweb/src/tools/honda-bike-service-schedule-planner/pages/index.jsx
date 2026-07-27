"use client";

import { useMemo, useState } from "react";
import { Bike, Check, Copy, RotateCcw } from "lucide-react";

import {
  FIRST_SERVICE_KM,
  FREE_SERVICE_COUNT,
  MAX_SERVICES,
  SECOND_SERVICE_KM,
  SERVICE_INTERVAL_KM,
  VEHICLE_TYPES,
  planServiceSchedule,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DATE = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const DASH = "—";
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const km = (value) => (Number.isFinite(value) ? `${NUM.format(value)} km` : DASH);
const showDate = (iso) => {
  if (!iso) return DASH;
  const parsed = Date.parse(`${iso}T00:00:00Z`);
  return Number.isFinite(parsed) ? DATE.format(parsed) : DASH;
};

const DEFAULTS = {
  purchaseDate: "2026-01-01",
  odometer: "0",
  monthlyKm: "700",
  vehicleType: "motorcycle",
  services: "8",
  free: String(FREE_SERVICE_COUNT),
  firstKm: String(FIRST_SERVICE_KM),
  secondKm: String(SECOND_SERVICE_KM),
  intervalKm: String(SERVICE_INTERVAL_KM),
  labour: "400",
  priceIndex: "100",
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
  const [purchaseDate, setPurchaseDate] = useState(DEFAULTS.purchaseDate);
  const [odometer, setOdometer] = useState(DEFAULTS.odometer);
  const [monthlyKm, setMonthlyKm] = useState(DEFAULTS.monthlyKm);
  const [vehicleType, setVehicleType] = useState(DEFAULTS.vehicleType);
  const [services, setServices] = useState(DEFAULTS.services);
  const [free, setFree] = useState(DEFAULTS.free);
  const [firstKm, setFirstKm] = useState(DEFAULTS.firstKm);
  const [secondKm, setSecondKm] = useState(DEFAULTS.secondKm);
  const [intervalKm, setIntervalKm] = useState(DEFAULTS.intervalKm);
  const [labour, setLabour] = useState(DEFAULTS.labour);
  const [priceIndex, setPriceIndex] = useState(DEFAULTS.priceIndex);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      planServiceSchedule({
        purchaseDate,
        currentOdometerKm: toNumber(odometer),
        monthlyKm: toNumber(monthlyKm),
        vehicleType,
        servicesToPlan: toNumber(services),
        freeServices: toNumber(free),
        firstKm: toNumber(firstKm),
        secondKm: toNumber(secondKm),
        intervalKm: toNumber(intervalKm),
        labourPerPaidService: toNumber(labour),
        partsPriceIndex: toNumber(priceIndex),
      }),
    [
      purchaseDate,
      odometer,
      monthlyKm,
      vehicleType,
      services,
      free,
      firstKm,
      secondKm,
      intervalKm,
      labour,
      priceIndex,
    ],
  );

  const hasError = Boolean(result.error);
  const next = hasError ? null : result.next;

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Honda Two-Wheeler Service Schedule",
      `Vehicle: ${result.vehicleType === "scooter" ? "Scooter (CVT)" : "Motorcycle (chain drive)"}`,
      next
        ? `Next service: #${next.index} at ${km(next.dueKm)} or ${showDate(next.dueDate)} (${next.isFree ? "free" : "paid"})`
        : "All planned services are already past your current odometer reading.",
      "",
      ...result.services.map(
        (service) =>
          `#${service.index}  ${km(service.dueKm)}  ${showDate(service.dueDate)}  ${service.isFree ? "free" : "paid"}  ${money(service.cost)}`,
      ),
      "",
      `Parts total: ${money(result.totalPartsCost)}`,
      `Labour total: ${money(result.totalLabourCost)}`,
      `Estimated cost across ${result.servicesPlanned} services: ${money(result.totalCost)}`,
    ].join("\n");
  }, [hasError, next, result]);

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
    setPurchaseDate(DEFAULTS.purchaseDate);
    setOdometer(DEFAULTS.odometer);
    setMonthlyKm(DEFAULTS.monthlyKm);
    setVehicleType(DEFAULTS.vehicleType);
    setServices(DEFAULTS.services);
    setFree(DEFAULTS.free);
    setFirstKm(DEFAULTS.firstKm);
    setSecondKm(DEFAULTS.secondKm);
    setIntervalKm(DEFAULTS.intervalKm);
    setLabour(DEFAULTS.labour);
    setPriceIndex(DEFAULTS.priceIndex);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Bike className="h-4 w-4" aria-hidden="true" />
          Honda service
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Honda Bike Service Schedule Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Plot every free and paid service on a Honda motorcycle or scooter. Each visit is dated at
          whichever comes first, the kilometre trigger or the month, with the right parts list for a
          chain drive or a CVT.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="honda-type">
              Vehicle type
            </label>
            <select
              id="honda-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={vehicleType}
              onChange={(event) => setVehicleType(event.target.value)}
            >
              {VEHICLE_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="honda-date">
              Purchase / registration date
            </label>
            <input
              id="honda-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={purchaseDate}
              onChange={(event) => setPurchaseDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="honda-odo">
              Current odometer (km)
            </label>
            <input
              id="honda-odo"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="100"
              value={odometer}
              onChange={(event) => setOdometer(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="honda-monthly">
              Average running (km per month)
            </label>
            <input
              id="honda-monthly"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="50"
              value={monthlyKm}
              onChange={(event) => setMonthlyKm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="honda-count">
              Services to plan (1-{MAX_SERVICES})
            </label>
            <input
              id="honda-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_SERVICES}
              step="1"
              value={services}
              onChange={(event) => setServices(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="honda-free">
              Free services in your package
            </label>
            <input
              id="honda-free"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_SERVICES}
              step="1"
              value={free}
              onChange={(event) => setFree(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="honda-first">
              First service due at (km)
            </label>
            <input
              id="honda-first"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="50"
              value={firstKm}
              onChange={(event) => setFirstKm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="honda-second">
              Second service due at (km)
            </label>
            <input
              id="honda-second"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="500"
              value={secondKm}
              onChange={(event) => setSecondKm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="honda-interval">
              Periodic interval after that (km)
            </label>
            <input
              id="honda-interval"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="500"
              value={intervalKm}
              onChange={(event) => setIntervalKm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="honda-labour">
              Labour per paid service (INR)
            </label>
            <input
              id="honda-labour"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="50"
              value={labour}
              onChange={(event) => setLabour(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="honda-index">
              Parts price level (% of listed)
            </label>
            <input
              id="honda-index"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="500"
              step="5"
              value={priceIndex}
              onChange={(event) => setPriceIndex(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
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
              Next service due at
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError || !next ? DASH : km(next.dueKm)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : next
                  ? `Service #${next.index} · ${showDate(next.dueDate)} · ${next.isFree ? "free service" : "paid service"}`
                  : "Every planned service is already behind your odometer reading."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy Honda service schedule"
              className={GHOST_BTN}
              disabled={hasError}
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
            ["Distance still to run", hasError || !next ? DASH : km(result.kmToNext)],
            ["Services already past", hasError ? DASH : String(result.completed)],
            ["Free services covered", hasError ? DASH : String(result.freeServices)],
            ["Plan covers up to", hasError ? DASH : km(result.coversKm)],
            ["Parts across the plan", hasError ? DASH : money(result.totalPartsCost)],
            ["Labour across the plan", hasError ? DASH : money(result.totalLabourCost)],
            ["Total estimated cost", hasError ? DASH : money(result.totalCost)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Service schedule</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    #
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Due at
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Approx. date
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Type
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Parts due
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.services.map((service) => (
                  <tr key={service.index} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{service.index}</td>
                    <td className="py-2 pr-3 text-right">{km(service.dueKm)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {showDate(service.dueDate)}
                    </td>
                    <td className="py-2 pr-3">
                      <span
                        className={
                          service.isFree
                            ? "rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--success)]"
                            : "rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--muted-foreground)]"
                        }
                      >
                        {service.isFree ? "Free" : "Paid"}
                      </span>
                      {service.status === "done" ? (
                        <span className="ml-2 text-xs text-[var(--muted-foreground)]">done</span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                      {service.parts.length
                        ? service.parts.map((part) => part.name).join(", ")
                        : "Checks only"}
                    </td>
                    <td className="py-2 text-right font-semibold">{money(service.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Carried out at every visit</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {result.routineTasks.map((task) => (
              <li
                key={task}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
              >
                {task}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Intervals and part prices are typical published values and stay editable, because Honda
        varies the maintenance chart by model and package. Confirm against your own owner&apos;s
        manual, and note that Honda&apos;s viscous paper air filter is meant to be replaced, not
        cleaned with an air gun.
      </p>
    </main>
  );
}
