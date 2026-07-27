"use client";

import { useMemo, useState } from "react";
import { Bike, Check, Copy, RotateCcw } from "lucide-react";

import {
  RE_MODELS,
  TOURING_CHECKLIST,
  getModel,
  planConsumables,
  planServiceSchedule,
  planTouringPrep,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";

const DEFAULT_MODEL = "classic-350";
const DEFAULTS = {
  modelId: DEFAULT_MODEL,
  serviceKm: "5000",
  serviceMonths: "6",
  odometerKm: "12400",
  lastServiceKm: "10000",
  lastServiceDate: "2026-03-15",
  monthlyKm: "800",
  today: "2026-07-27",
  tripKm: "1200",
  tankLitres: "13",
  mileageKmpl: "35",
  dailyRidingKm: "350",
};

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const dateLabel = (iso) => {
  if (!iso) return DASH;
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const d = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
};

const STATUS_STYLE = {
  overdue: "bg-[var(--danger-soft)] text-[var(--danger)]",
  "due-soon": "bg-[var(--warning-soft)] text-[var(--warning)]",
  ok: "bg-[var(--success-soft)] text-[var(--success)]",
};
const STATUS_LABEL = { overdue: "Overdue", "due-soon": "Due soon", ok: "On schedule" };

function StatusPill({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[status] || STATUS_STYLE.ok}`}
    >
      {STATUS_LABEL[status] || STATUS_LABEL.ok}
    </span>
  );
}

export default function ToolHome() {
  const [modelId, setModelId] = useState(DEFAULTS.modelId);
  const [serviceKm, setServiceKm] = useState(DEFAULTS.serviceKm);
  const [serviceMonths, setServiceMonths] = useState(DEFAULTS.serviceMonths);
  const [odometerKm, setOdometerKm] = useState(DEFAULTS.odometerKm);
  const [lastServiceKm, setLastServiceKm] = useState(DEFAULTS.lastServiceKm);
  const [lastServiceDate, setLastServiceDate] = useState(DEFAULTS.lastServiceDate);
  const [monthlyKm, setMonthlyKm] = useState(DEFAULTS.monthlyKm);
  const [today, setToday] = useState(DEFAULTS.today);
  const [tripKm, setTripKm] = useState(DEFAULTS.tripKm);
  const [tankLitres, setTankLitres] = useState(DEFAULTS.tankLitres);
  const [mileageKmpl, setMileageKmpl] = useState(DEFAULTS.mileageKmpl);
  const [dailyRidingKm, setDailyRidingKm] = useState(DEFAULTS.dailyRidingKm);
  const [copied, setCopied] = useState(false);

  const applyModel = (id) => {
    const model = getModel(id);
    setModelId(id);
    setServiceKm(String(model.serviceKm));
    setServiceMonths(String(model.serviceMonths));
    setTankLitres(String(model.tankLitres));
    setMileageKmpl(String(model.mileageKmpl));
  };

  const plan = useMemo(
    () =>
      planServiceSchedule({
        modelId,
        serviceKm: toNumber(serviceKm),
        serviceMonths: toNumber(serviceMonths),
        odometerKm: toNumber(odometerKm),
        lastServiceKm: toNumber(lastServiceKm),
        lastServiceDate,
        monthlyKm: toNumber(monthlyKm),
        today,
        servicesAhead: 4,
      }),
    [modelId, serviceKm, serviceMonths, odometerKm, lastServiceKm, lastServiceDate, monthlyKm, today],
  );

  const consumables = useMemo(
    () =>
      planConsumables({
        modelId,
        serviceKm: toNumber(serviceKm),
        serviceMonths: toNumber(serviceMonths),
        odometerKm: toNumber(odometerKm),
        lastServiceKm: toNumber(lastServiceKm),
        lastServiceDate,
        today,
      }),
    [modelId, serviceKm, serviceMonths, odometerKm, lastServiceKm, lastServiceDate, today],
  );

  const touring = useMemo(
    () =>
      planTouringPrep({
        modelId,
        tripKm: toNumber(tripKm),
        tankLitres: toNumber(tankLitres),
        mileageKmpl: toNumber(mileageKmpl),
        odometerKm: toNumber(odometerKm),
        nextServiceKm: plan.error ? null : plan.next.dueKm,
        dailyRidingKm: toNumber(dailyRidingKm),
      }),
    [modelId, tripKm, tankLitres, mileageKmpl, odometerKm, dailyRidingKm, plan],
  );

  const summary = useMemo(() => {
    if (plan.error) return "";
    const lines = [
      `Royal Enfield service plan — ${plan.model}`,
      `Odometer: ${NUM.format(toNumber(odometerKm))} km`,
      `Interval: every ${NUM.format(plan.intervalKm)} km or ${plan.intervalMonths} months`,
      `Next service #${plan.next.serviceNumber}: due at ${NUM.format(plan.next.dueKm)} km / ${dateLabel(plan.next.dueDate)} (${plan.next.limit} limit first)`,
      `Remaining: ${NUM.format(plan.next.kmRemaining)} km, ${NUM.format(plan.next.daysRemaining)} days`,
      `Status: ${STATUS_LABEL[plan.next.status]}`,
      `Jobs at that service: ${plan.next.jobs.join(", ")}`,
    ];
    if (!touring.error) {
      lines.push(
        `Tour of ${NUM.format(toNumber(tripKm))} km: ${touring.fuelStops} fuel stops, ${touring.chainLubes} chain lubes, ${touring.ridingDays} riding days`,
      );
    }
    return lines.join("\n");
  }, [plan, touring, odometerKm, tripKm]);

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
    setModelId(DEFAULTS.modelId);
    setServiceKm(DEFAULTS.serviceKm);
    setServiceMonths(DEFAULTS.serviceMonths);
    setOdometerKm(DEFAULTS.odometerKm);
    setLastServiceKm(DEFAULTS.lastServiceKm);
    setLastServiceDate(DEFAULTS.lastServiceDate);
    setMonthlyKm(DEFAULTS.monthlyKm);
    setToday(DEFAULTS.today);
    setTripKm(DEFAULTS.tripKm);
    setTankLitres(DEFAULTS.tankLitres);
    setMileageKmpl(DEFAULTS.mileageKmpl);
    setDailyRidingKm(DEFAULTS.dailyRidingKm);
    setCopied(false);
  };

  const ok = !plan.error;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Bike className="h-4 w-4" aria-hidden="true" />
          Motorcycle upkeep
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Royal Enfield Service Schedule Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out when your next service actually falls due — on distance or on the calendar,
          whichever comes first — plus which consumables are close to their limit and what a long
          run will need.
        </p>
      </header>

      <section className={CARD}>
        <h2 className="text-base font-semibold">Your bike</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="re-model">
              Model
            </label>
            <select
              id="re-model"
              className={`mt-2 ${INPUT_CLASS}`}
              value={modelId}
              onChange={(event) => applyModel(event.target.value)}
            >
              {RE_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="re-interval-km">
              Service interval (km)
            </label>
            <input
              id="re-interval-km"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="500"
              step="500"
              value={serviceKm}
              onChange={(event) => setServiceKm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="re-interval-months">
              Service interval (months)
            </label>
            <input
              id="re-interval-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="36"
              step="1"
              value={serviceMonths}
              onChange={(event) => setServiceMonths(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="re-odo">
              Current odometer (km)
            </label>
            <input
              id="re-odo"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="10"
              value={odometerKm}
              onChange={(event) => setOdometerKm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="re-last-km">
              Odometer at last service (km)
            </label>
            <input
              id="re-last-km"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="10"
              value={lastServiceKm}
              onChange={(event) => setLastServiceKm(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="re-last-date">
              Last service date
            </label>
            <input
              id="re-last-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={lastServiceDate}
              onChange={(event) => setLastServiceDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="re-today">
              Today&apos;s date
            </label>
            <input
              id="re-today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="re-monthly">
              Average riding (km per month)
            </label>
            <input
              id="re-monthly"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="50"
              value={monthlyKm}
              onChange={(event) => setMonthlyKm(event.target.value)}
            />
          </div>
        </div>
      </section>

      {plan.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Next service due
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? dateLabel(plan.next.dueDate) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `Service #${plan.next.serviceNumber} at ${NUM.format(plan.next.dueKm)} km — the ${plan.next.limit} limit arrives first`
                : "Fix the inputs above to see a due date"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy service plan summary"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {ok ? (
          <div className="mt-4">
            <StatusPill status={plan.next.status} />
          </div>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Distance still to run", ok ? `${NUM.format(plan.next.kmRemaining)} km` : DASH],
            ["Days still to go", ok ? `${NUM.format(plan.next.daysRemaining)} days` : DASH],
            ["Due on distance", ok ? dateLabel(plan.next.dueByKmDate) : DASH],
            ["Due on calendar", ok ? dateLabel(plan.next.dueByTimeDate) : DASH],
            ["Ridden since last service", ok ? `${NUM.format(plan.kmSinceService)} km in ${NUM.format(plan.daysSinceService)} days` : DASH],
            ["Interval used up", ok ? `${NUM1.format(plan.intervalUsedPct)}%` : DASH],
            ["Your riding rate", ok ? `${NUM1.format(plan.kmPerDay)} km/day` : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <div className="mt-5">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`${NUM1.format(plan.intervalUsedPct)} percent of the service interval used`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.max(0, Math.min(100, plan.intervalUsedPct))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {ok && plan.isRunningIn
                ? "Running-in period: the first service is due at 500 km or 45 days, whichever comes first."
                : `Interval: every ${NUM.format(plan.intervalKm)} km or ${plan.intervalMonths} months.`}
            </p>
          </div>
        ) : null}
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">Next four services</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Service</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Odometer</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Expected date</th>
                <th scope="col" className="py-2 text-right font-semibold">Jobs</th>
              </tr>
            </thead>
            <tbody>
              {ok ? (
                plan.rows.map((row) => (
                  <tr key={row.serviceNumber} className="border-b border-[var(--border)] last:border-0 align-top">
                    <td className="py-2.5 pr-3 font-semibold">
                      #{row.serviceNumber}
                      {row.isFirstService ? (
                        <span className="ml-1 text-xs font-normal text-[var(--muted-foreground)]">
                          running-in
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2.5 pr-3 text-right">{NUM.format(row.dueKm)} km</td>
                    <td className="py-2.5 pr-3 text-right">{dateLabel(row.dueDate)}</td>
                    <td className="py-2.5 text-right text-[var(--muted-foreground)]">{row.jobs.length}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-2.5 pr-3 font-semibold">{DASH}</td>
                  <td className="py-2.5 pr-3 text-right">{DASH}</td>
                  <td className="py-2.5 pr-3 text-right">{DASH}</td>
                  <td className="py-2.5 text-right">{DASH}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {ok ? (
          <ul className="mt-4 space-y-1.5 text-sm text-[var(--muted-foreground)]">
            {plan.next.jobs.map((job) => (
              <li key={job} className="flex gap-2">
                <span aria-hidden="true" className="text-[var(--primary)]">
                  •
                </span>
                <span>{job}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">Consumable life left</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[460px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Item</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Interval</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Km left</th>
                <th scope="col" className="py-2 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {consumables.error ? (
                <tr>
                  <td className="py-2.5 pr-3">{DASH}</td>
                  <td className="py-2.5 pr-3 text-right">{DASH}</td>
                  <td className="py-2.5 pr-3 text-right">{DASH}</td>
                  <td className="py-2.5 text-right">{DASH}</td>
                </tr>
              ) : (
                consumables.items.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--border)] last:border-0 align-top">
                    <td className="py-2.5 pr-3">
                      <span className="font-semibold">{item.label}</span>
                      <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">{item.note}</span>
                    </td>
                    <td className="py-2.5 pr-3 text-right whitespace-nowrap">
                      {NUM.format(item.dueEveryKm)} km / {item.dueEveryMonths} mo
                    </td>
                    <td className="py-2.5 pr-3 text-right whitespace-nowrap">{NUM.format(item.kmLeft)}</td>
                    <td className="py-2.5 text-right">
                      <StatusPill status={item.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">Touring prep</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="re-trip">
              Trip distance (km)
            </label>
            <input
              id="re-trip"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="50"
              value={tripKm}
              onChange={(event) => setTripKm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="re-daily">
              Distance per riding day (km)
            </label>
            <input
              id="re-daily"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="25"
              value={dailyRidingKm}
              onChange={(event) => setDailyRidingKm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="re-tank">
              Fuel tank (litres)
            </label>
            <input
              id="re-tank"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="0.1"
              value={tankLitres}
              onChange={(event) => setTankLitres(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="re-kmpl">
              Real-world economy (km per litre)
            </label>
            <input
              id="re-kmpl"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="0.5"
              value={mileageKmpl}
              onChange={(event) => setMileageKmpl(event.target.value)}
            />
          </div>
        </div>

        {touring.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {touring.error}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Full-tank range", touring.error ? DASH : `${NUM.format(touring.fullRangeKm)} km`],
            ["Plan-to-refuel range (15% reserve kept)", touring.error ? DASH : `${NUM.format(touring.usableRangeKm)} km`],
            ["Fuel stops on the route", touring.error ? DASH : NUM.format(touring.fuelStops)],
            ["Fuel needed in total", touring.error ? DASH : `${NUM1.format(touring.litresNeeded)} litres`],
            ["Chain lubes during the trip", touring.error ? DASH : NUM.format(touring.chainLubes)],
            ["Riding days", touring.error ? DASH : NUM.format(touring.ridingDays)],
            ["Odometer at trip end", touring.error || touring.kmAtTripEnd === null ? DASH : `${NUM.format(touring.kmAtTripEnd)} km`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!touring.error && touring.serviceDuringTrip ? (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
            Your next service falls due during this trip — get it done before you leave, or plan a
            workshop stop en route.
          </p>
        ) : null}

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {TOURING_CHECKLIST.map((group) => (
            <div key={group.group}>
              <h3 className="text-sm font-semibold">{group.group}</h3>
              <ul className="mt-2 space-y-1.5 text-sm text-[var(--muted-foreground)]">
                {group.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden="true" className="text-[var(--primary)]">
                      •
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Intervals shown are presets based on Royal Enfield&apos;s published periodic-maintenance
        pattern and can be edited. They vary by model year and market — the schedule printed in your
        owner&apos;s manual and service booklet is the one that governs your warranty.
      </p>
    </main>
  );
}
