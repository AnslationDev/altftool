"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gauge, Plus, RotateCcw, Trash2 } from "lucide-react";

import { VOLUME_UNITS, compareFuelPrices, fillAndTripCost } from "../lib";

/** Display-only: which locale to format each home currency with. */
const HOME_CURRENCIES = [
  { code: "INR", locale: "en-IN" },
  { code: "USD", locale: "en-US" },
  { code: "EUR", locale: "de-DE" },
  { code: "GBP", locale: "en-GB" },
  { code: "AED", locale: "en-AE" },
  { code: "AUD", locale: "en-AU" },
  { code: "CAD", locale: "en-CA" },
  { code: "SGD", locale: "en-SG" },
];

const DEFAULT_STATIONS = [
  { id: 1, label: "US interstate", price: "3.79", currency: "USD", volumeUnit: "usgal", rate: "84" },
  { id: 2, label: "Italy autostrada", price: "1.75", currency: "EUR", volumeUnit: "litre", rate: "91" },
  { id: 3, label: "Delhi pump", price: "105", currency: "INR", volumeUnit: "litre", rate: "1" },
];

const MAX_STATIONS = 6;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const n2 = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 });
const n1 = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 });

export default function ToolHome() {
  const [stations, setStations] = useState(DEFAULT_STATIONS);
  const [nextId, setNextId] = useState(DEFAULT_STATIONS.length + 1);
  const [home, setHome] = useState("INR");
  const [tank, setTank] = useState("40");
  const [kmpl, setKmpl] = useState("15");
  const [distance, setDistance] = useState("600");
  const [copied, setCopied] = useState(false);

  const comparison = useMemo(
    () =>
      compareFuelPrices(
        stations.map((station) => ({
          label: station.label.trim() || "Station",
          currency: station.currency.trim().toUpperCase(),
          price: Number(String(station.price).trim()),
          volumeUnit: station.volumeUnit,
          rateToHome: Number(String(station.rate).trim()),
        })),
      ),
    [stations],
  );

  const ok = !comparison.error;

  const trip = useMemo(() => {
    if (!ok) return { error: "" };
    return fillAndTripCost({
      perLitreHome: comparison.cheapest.perLitreHome,
      tankLitres: Number(String(tank).trim()),
      kmpl: Number(String(kmpl).trim()),
      distanceKm: Number(String(distance).trim()),
    });
  }, [ok, comparison, tank, kmpl, distance]);

  const tripOk = ok && !trip.error;
  const error = comparison.error || (trip.error ? trip.error : "");

  const money = useMemo(() => {
    const entry = HOME_CURRENCIES.find((option) => option.code === home) ?? HOME_CURRENCIES[0];
    const formatter = new Intl.NumberFormat(entry.locale, {
      style: "currency",
      currency: entry.code,
      maximumFractionDigits: 2,
    });
    return (value) => (Number.isFinite(value) ? formatter.format(value) : DASH);
  }, [home]);

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [`Fuel price comparison (all in ${home} per litre)`];
    for (const row of comparison.rows) {
      lines.push(
        `${row.rank}. ${row.label}: ${money(row.perLitreHome)}/l — quoted ${n2.format(row.price)} ${row.currency} ${
          VOLUME_UNITS.find((unit) => unit.key === row.volumeUnit)?.label ?? ""
        }`,
      );
    }
    lines.push(`Cheapest is ${comparison.cheapest.label}; the dearest costs ${money(comparison.spreadPerLitre)} more per litre (${n1.format(comparison.spreadPct)}%).`);
    if (tripOk) {
      lines.push(`At the cheapest price a ${n1.format(Number(tank))} l fill costs ${money(trip.tankCost)} and the trip costs ${money(trip.tripCost)}.`);
    }
    return lines.join("\n");
  }, [ok, comparison, home, money, trip, tripOk, tank]);

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
    setStations(DEFAULT_STATIONS);
    setNextId(DEFAULT_STATIONS.length + 1);
    setHome("INR");
    setTank("40");
    setKmpl("15");
    setDistance("600");
    setCopied(false);
  };

  const updateStation = (id, field, value) => {
    setStations((previous) =>
      previous.map((station) => (station.id === id ? { ...station, [field]: value } : station)),
    );
  };

  const addStation = () => {
    if (stations.length >= MAX_STATIONS) return;
    setStations((previous) => [
      ...previous,
      { id: nextId, label: `Station ${previous.length + 1}`, price: "1", currency: "USD", volumeUnit: "litre", rate: "84" },
    ]);
    setNextId((value) => value + 1);
  };

  const removeStation = (id) => {
    setStations((previous) => (previous.length <= 1 ? previous : previous.filter((station) => station.id !== id)));
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gauge className="h-4 w-4" aria-hidden="true" />
          Road trip fuel
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Fuel Price Per Litre Comparator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Put pump prices quoted per litre, per US gallon and per imperial gallon — in different
          currencies — onto one scale, then see which is genuinely cheapest.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fp-home">
              Show everything in
            </label>
            <select
              id="fp-home"
              className={`mt-2 ${INPUT_CLASS}`}
              value={home}
              onChange={(event) => setHome(event.target.value)}
            >
              {HOME_CURRENCIES.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 space-y-5">
          {stations.map((station, index) => (
            <div key={station.id} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`fp-label-${station.id}`}>
                    Station {index + 1} name
                  </label>
                  <input
                    id={`fp-label-${station.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={station.label}
                    onChange={(event) => updateStation(station.id, "label", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`fp-price-${station.id}`}>
                    Price on the sign
                  </label>
                  <input
                    id={`fp-price-${station.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={station.price}
                    onChange={(event) => updateStation(station.id, "price", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`fp-unit-${station.id}`}>
                    Quoted
                  </label>
                  <select
                    id={`fp-unit-${station.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={station.volumeUnit}
                    onChange={(event) => updateStation(station.id, "volumeUnit", event.target.value)}
                  >
                    {VOLUME_UNITS.map((unit) => (
                      <option key={unit.key} value={unit.key}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`fp-currency-${station.id}`}>
                    Currency on the sign
                  </label>
                  <input
                    id={`fp-currency-${station.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    maxLength={4}
                    value={station.currency}
                    onChange={(event) => updateStation(station.id, "currency", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`fp-rate-${station.id}`}>
                    1 {station.currency.trim().toUpperCase() || "unit"} = ? {home}
                  </label>
                  <input
                    id={`fp-rate-${station.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.0001"
                    value={station.rate}
                    onChange={(event) => updateStation(station.id, "rate", event.target.value)}
                  />
                </div>
              </div>
              {stations.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeStation(station.id)}
                  aria-label={`Remove station ${index + 1}`}
                  className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addStation}
          disabled={stations.length >= MAX_STATIONS}
          className={`mt-4 ${GHOST_BTN} disabled:opacity-50`}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add a station
        </button>
      </section>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Cheapest per litre
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(comparison.cheapest.perLitreHome) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${comparison.cheapest.label} — the dearest on your list costs ${money(comparison.spreadPerLitre)} more a litre (${n1.format(comparison.spreadPct)}%)`
                : "Fix the inputs above to see the ranking."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the fuel price comparison" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">#</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Station</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Per litre ({home})</th>
                <th scope="col" className="py-2 text-right font-semibold">vs cheapest</th>
              </tr>
            </thead>
            <tbody>
              {ok ? (
                comparison.rows.map((row) => (
                  <tr key={`${row.rank}-${row.label}`} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.rank}</td>
                    <td className="py-2 pr-3">
                      {row.label}
                      <span className="block text-xs text-[var(--muted-foreground)]">
                        {n2.format(row.price)} {row.currency}{" "}
                        {VOLUME_UNITS.find((unit) => unit.key === row.volumeUnit)?.label}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right font-semibold">{money(row.perLitreHome)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {row.rank === 1 ? "cheapest" : `+${n1.format(row.premiumPct)}%`}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-2 pr-3" colSpan={4}>
                    {DASH}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What that costs you</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fp-tank">
              Litres you plan to put in
            </label>
            <input
              id="fp-tank"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={tank}
              onChange={(event) => setTank(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fp-kmpl">
              Fuel economy (km/l)
            </label>
            <input
              id="fp-kmpl"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={kmpl}
              onChange={(event) => setKmpl(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="fp-distance">
              Distance still to drive (km)
            </label>
            <input
              id="fp-distance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={distance}
              onChange={(event) => setDistance(event.target.value)}
            />
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Cost of that fill at the cheapest price", tripOk ? money(trip.tankCost) : DASH],
            ["Range from that fill", tripOk ? `${n1.format(trip.rangeFromTankKm)} km` : DASH],
            ["Fuel needed for the remaining distance", tripOk ? `${n1.format(trip.litresForTrip)} l` : DASH],
            ["Cost of the remaining distance", tripOk ? money(trip.tripCost) : DASH],
            ["Cost per 100 km", tripOk ? money(trip.costPer100Km) : DASH],
          ].map(([label, figure]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{figure}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Exchange rates are the ones you type in — there is no live feed. Use the rate your card
        actually charges, including its foreign-transaction markup, and remember that a cheaper pump
        forty minutes off the route can cost more in fuel and time than it saves.
      </p>
    </main>
  );
}
