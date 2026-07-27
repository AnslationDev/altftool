"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Fan, RotateCcw } from "lucide-react";

import { AQI_BANDS, DEVICES, INDOOR_SOURCES, planFilterCare } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const money2 = (value) => INR2.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const todayIso = () => new Date().toISOString().slice(0, 10);

const prettyDate = (iso) => {
  if (!iso) return DASH;
  const [year, month, day] = iso.split("-");
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
};

const defaultLastChanged = (deviceId, iso) => {
  const device = DEVICES.find((entry) => entry.id === deviceId);
  const map = {};
  for (const filter of device?.filters ?? []) map[filter.id] = iso;
  return map;
};

export default function ToolHome() {
  const [deviceId, setDeviceId] = useState("purifier");
  const [hoursPerDay, setHoursPerDay] = useState("10");
  const [aqiBand, setAqiBand] = useState("poor");
  const [sources, setSources] = useState(["pets"]);
  const [watts, setWatts] = useState("45");
  const [tariff, setTariff] = useState("8");
  const [areaSqft, setAreaSqft] = useState("150");
  const [ceilingFt, setCeilingFt] = useState("10");
  const [ratedCadr, setRatedCadr] = useState("200");
  const [lastChanged, setLastChanged] = useState(() => defaultLastChanged("purifier", todayIso()));
  const [copied, setCopied] = useState(false);

  const device = DEVICES.find((entry) => entry.id === deviceId) ?? DEVICES[0];

  const plan = useMemo(() => {
    const parse = (raw) => (String(raw).trim() === "" ? NaN : Number(raw));
    return planFilterCare({
      deviceId,
      hoursPerDay: parse(hoursPerDay),
      aqiBand,
      sources,
      watts: parse(watts),
      tariff: parse(tariff),
      areaSqft: parse(areaSqft),
      ceilingFt: parse(ceilingFt),
      ratedCadrCfm: parse(ratedCadr),
      lastChanged,
    });
  }, [deviceId, hoursPerDay, aqiBand, sources, watts, tariff, areaSqft, ceilingFt, ratedCadr, lastChanged]);

  const ok = !plan.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [`Air Filter Plan — ${plan.deviceLabel}`, `Loading factor: ${plan.loadFactor}×`, ""];
    for (const row of plan.rows) {
      lines.push(
        `${row.label}: ${row.washable ? "clean" : "replace"} every ${row.intervalDays} days (limited by ${row.limitedBy})${
          row.nextDueIso ? `, next due ${prettyDate(row.nextDueIso)}` : ""
        }`,
      );
    }
    lines.push("");
    lines.push(`Filters: ${money(plan.annualFilterCost)} a year`);
    lines.push(`Electricity: ${NUM1.format(plan.kwhPerYear)} kWh = ${money(plan.electricityCost)} a year`);
    lines.push(`Total: ${money(plan.annualTotal)} a year (${money2(plan.dailyCost)} a day)`);
    return lines.join("\n");
  }, [ok, plan]);

  const changeDevice = (nextId) => {
    setDeviceId(nextId);
    const next = DEVICES.find((entry) => entry.id === nextId);
    if (next) setWatts(String(next.defaultWatts));
    setLastChanged(defaultLastChanged(nextId, todayIso()));
    setCopied(false);
  };

  const toggleSource = (id) => {
    setSources((previous) =>
      previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id],
    );
    setCopied(false);
  };

  const setFilterDate = (id, value) => {
    setLastChanged((previous) => ({ ...previous, [id]: value }));
  };

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
    setDeviceId("purifier");
    setHoursPerDay("10");
    setAqiBand("poor");
    setSources(["pets"]);
    setWatts("45");
    setTariff("8");
    setAreaSqft("150");
    setCeilingFt("10");
    setRatedCadr("200");
    setLastChanged(defaultLastChanged("purifier", todayIso()));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Fan className="h-4 w-4" aria-hidden="true" />
          Home upkeep
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Home Air Filter Reminder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Every filter is rated twice — so many running hours, or so many months, whichever comes
          first. This tool applies both limits, shortens them for your air quality and indoor
          sources, dates the next change and adds up the yearly filter and electricity bill.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="af-device">
              Appliance
            </label>
            <select
              id="af-device"
              className={`mt-2 ${INPUT_CLASS}`}
              value={deviceId}
              onChange={(event) => changeDevice(event.target.value)}
            >
              {DEVICES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="af-hours">
              Hours run per day
            </label>
            <input
              id="af-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="24"
              step="0.5"
              value={hoursPerDay}
              onChange={(event) => setHoursPerDay(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="af-aqi">
              Typical outdoor air quality
            </label>
            <select
              id="af-aqi"
              className={`mt-2 ${INPUT_CLASS}`}
              value={aqiBand}
              onChange={(event) => setAqiBand(event.target.value)}
            >
              {AQI_BANDS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="af-watts">
              Power draw (watts)
            </label>
            <input
              id="af-watts"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="20000"
              step="5"
              value={watts}
              onChange={(event) => setWatts(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="af-tariff">
              Electricity tariff (₹ per unit)
            </label>
            <input
              id="af-tariff"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.25"
              value={tariff}
              onChange={(event) => setTariff(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="af-area">
              Room area (sq ft)
            </label>
            <input
              id="af-area"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="5000"
              step="10"
              value={areaSqft}
              onChange={(event) => setAreaSqft(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="af-ceiling">
              Ceiling height (ft)
            </label>
            <input
              id="af-ceiling"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="30"
              step="0.5"
              value={ceilingFt}
              onChange={(event) => setCeilingFt(event.target.value)}
            />
          </div>
          {device.supportsCadr ? (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="af-cadr">
                Purifier CADR (CFM, 0 if unknown)
              </label>
              <input
                id="af-cadr"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max="2000"
                step="10"
                value={ratedCadr}
                onChange={(event) => setRatedCadr(event.target.value)}
              />
            </div>
          ) : null}
        </div>

        <fieldset className="mt-6">
          <legend className="text-sm font-semibold">Indoor sources that clog filters faster</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {INDOOR_SOURCES.map((entry) => (
              <label
                key={entry.id}
                htmlFor={`af-s-${entry.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <input
                  id={`af-s-${entry.id}`}
                  type="checkbox"
                  className="h-4 w-4 shrink-0 accent-[var(--primary)]"
                  checked={sources.includes(entry.id)}
                  onChange={() => toggleSource(entry.id)}
                />
                <span>{entry.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <h2 className="mt-6 text-sm font-semibold">When was each filter last changed or washed?</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {device.filters.map((filter) => (
            <div key={filter.id}>
              <label className={LABEL_CLASS} htmlFor={`af-d-${filter.id}`}>
                {filter.label}
              </label>
              <input
                id={`af-d-${filter.id}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="date"
                value={lastChanged[filter.id] ?? ""}
                onChange={(event) => setFilterDate(filter.id, event.target.value)}
              />
            </div>
          ))}
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Yearly cost to keep it running
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(plan.annualTotal) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? plan.soonestDue
                  ? `${money2(plan.dailyCost)} a day · next job: ${plan.soonestDue.label} on ${prettyDate(plan.soonestDue.nextDueIso)}`
                  : `${money2(plan.dailyCost)} a day`
                : "Fix the inputs above to see the cost"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy air filter plan"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Filter loading factor", ok ? `${plan.loadFactor}× normal` : DASH],
            ["Replacement filters", ok ? `${money(plan.annualFilterCost)} a year` : DASH],
            ["Electricity used", ok ? `${NUM1.format(plan.kwhPerYear)} kWh a year` : DASH],
            ["Electricity cost", ok ? `${money(plan.electricityCost)} a year` : DASH],
            ["All in, per day", ok ? money2(plan.dailyCost) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok ? (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Filter schedule</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Filter</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Every</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Next due</th>
                    <th scope="col" className="py-2 text-right font-semibold">Per year</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.rows.map((row) => (
                    <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">
                        <span className="block font-semibold">{row.label}</span>
                        <span className="block text-xs text-[var(--muted-foreground)]">
                          {row.washable ? "Washable" : `Replace · ${money(row.priceInr)}`} · rated{" "}
                          {NUM0.format(row.ratedHours)} h or {row.maxCalendarDays} days · limited by{" "}
                          {row.limitedBy}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-right font-semibold">{row.intervalDays} days</td>
                      <td className="py-2 pr-3">{prettyDate(row.nextDueIso)}</td>
                      <td className="py-2 text-right">
                        {row.washable ? `${NUM1.format(row.changesPerYear)} washes` : money(row.yearlyCost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {plan.supportsCadr ? (
            <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">Is the purifier big enough for this room?</h2>
              <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
                {[
                  [
                    "CADR needed (AHAM two-thirds rule)",
                    `${NUM0.format(plan.recommendedCadrCfm)} CFM (${NUM0.format(plan.recommendedCadrM3h)} m³/h)`,
                  ],
                  ["Your unit's CADR", plan.cadrKnown ? `${NUM0.format(plan.ratedCadrCfm)} CFM` : "Not entered"],
                  [
                    "Area it can actually cover",
                    plan.coverableAreaSqft > 0 ? `${NUM0.format(plan.coverableAreaSqft)} sq ft` : DASH,
                  ],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                    <dt className="text-[var(--muted-foreground)]">{label}</dt>
                    <dd className="text-right font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
              {plan.cadrKnown ? (
                <p
                  className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
                    plan.cadrAdequate
                      ? "bg-[var(--muted)] text-[var(--success)]"
                      : "bg-[var(--danger-soft)] text-[var(--danger)]"
                  }`}
                >
                  {plan.cadrAdequate
                    ? "Rated CADR clears the two-thirds rule for this room, so about five air changes an hour are achievable."
                    : "Rated CADR is below the two-thirds rule for this room. Either move the unit to a smaller room or expect fewer air changes an hour."}
                </p>
              ) : null}
            </section>
          ) : null}
        </>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Rated lives and prices are typical figures for Indian retail — always check your own manual,
        since a filter marked washable in one model is disposable in another. Air quality bands
        follow the CPCB National AQI categories. Nothing here is medical advice; if someone in the
        home has asthma or another respiratory condition, follow their doctor's guidance.
      </p>
    </main>
  );
}
