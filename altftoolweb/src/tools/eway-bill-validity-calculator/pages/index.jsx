"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Truck } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const km = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)} km`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

/**
 * Rule 138(10), CGST Rules:
 *  - other than over dimensional cargo: one day for every 200 km or part thereof
 *  - over dimensional cargo, or a multimodal shipment with a leg by ship:
 *    one day for every 20 km or part thereof
 */
const CARGO = {
  regular: { label: "Regular cargo (road, rail, air)", perDay: 200 },
  odc: { label: "Over dimensional cargo (ODC)", perDay: 20 },
  ship: { label: "Multimodal shipment with a leg by ship", perDay: 20 },
};

const DEFAULTS = { distance: "450", cargo: "regular", time: "10:00", value: "150000" };

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

const pad = (n) => String(n).padStart(2, "0");
const todayISO = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

/** Validity in days: one day per `perDay` km or part thereof, minimum one day. */
export function validityDays(distanceKm, perDay) {
  if (!(distanceKm > 0) || !(perDay > 0)) return 0;
  return Math.max(1, Math.ceil(distanceKm / perDay));
}

/**
 * Each day expires at midnight of the day immediately following the date of
 * generation, so N days end at 00:00 on (generation date + N + 1).
 */
export function expiryDate(dateISO, days) {
  const parts = String(dateISO).split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return null;
  const [y, m, d] = parts;
  const end = new Date(y, m - 1, d + days + 1, 0, 0, 0, 0);
  return Number.isNaN(end.getTime()) ? null : end;
}

const DATE_FMT = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default function ToolHome() {
  const [distance, setDistance] = useState(DEFAULTS.distance);
  const [cargo, setCargo] = useState(DEFAULTS.cargo);
  const [genDate, setGenDate] = useState("");
  const [genTime, setGenTime] = useState(DEFAULTS.time);
  const [value, setValue] = useState(DEFAULTS.value);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setGenDate(todayISO());
  }, []);

  const calc = useMemo(() => {
    const d = toNumber(distance);
    const v = toNumber(value);
    if (Number.isNaN(d)) return { error: "Enter the approximate transport distance in kilometres." };
    if (d <= 0) return { error: "Distance must be greater than zero." };
    if (d > 20000) return { error: "Distance looks too large — enter the road distance in kilometres." };
    if (Number.isNaN(v) || v < 0) return { error: "Consignment value must be zero or more." };

    const perDay = CARGO[cargo].perDay;
    const days = validityDays(d, perDay);
    const expiry = genDate ? expiryDate(genDate, days) : null;
    const lastFullDay = expiry ? new Date(expiry.getTime() - 24 * 60 * 60 * 1000) : null;

    return {
      distance: d,
      perDay,
      days,
      expiry,
      lastFullDay,
      consignmentValue: v,
      needsEwb: v > 50000,
      extraKm: days * perDay - d,
      nextDayAt: days * perDay + 1,
    };
  }, [distance, cargo, genDate, value]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "E-way bill validity",
      `Distance: ${km(calc.distance)}`,
      `Cargo type: ${CARGO[cargo].label} (1 day per ${calc.perDay} km or part thereof)`,
      `Validity: ${calc.days} ${calc.days === 1 ? "day" : "days"}`,
      genDate ? `Generated on: ${DATE_FMT.format(new Date(`${genDate}T00:00:00`))} at ${genTime}` : "",
      calc.expiry
        ? `Valid till: midnight ending ${DATE_FMT.format(calc.lastFullDay)} (expires 00:00 on ${DATE_FMT.format(calc.expiry)})`
        : "",
      `Consignment value: ${money(calc.consignmentValue)} — e-way bill ${calc.needsEwb ? "required" : "not mandatory on value alone"}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [calc, cargo, genDate, genTime]);

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
    setDistance(DEFAULTS.distance);
    setCargo(DEFAULTS.cargo);
    setGenDate(todayISO());
    setGenTime(DEFAULTS.time);
    setValue(DEFAULTS.value);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Truck className="h-4 w-4" aria-hidden="true" />
          GST
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          E-Way Bill Distance Validity Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the approximate road distance and the tool applies Rule 138(10) — one day for every
          200 km (20 km for over dimensional cargo) or part thereof — and shows the exact midnight at
          which the e-way bill expires.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ewb-distance">
              Approximate distance (km)
            </label>
            <input
              id="ewb-distance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="10"
              value={distance}
              onChange={(event) => setDistance(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ewb-cargo">
              Cargo / vehicle type
            </label>
            <select
              id="ewb-cargo"
              className={`mt-2 ${INPUT_CLASS}`}
              value={cargo}
              onChange={(event) => setCargo(event.target.value)}
            >
              {Object.entries(CARGO).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ewb-date">
              Date of generation
            </label>
            <input
              id="ewb-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={genDate}
              onChange={(event) => setGenDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ewb-time">
              Time of generation
            </label>
            <input
              id="ewb-time"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={genTime}
              onChange={(event) => setGenTime(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ewb-value">
              Consignment value (INR)
            </label>
            <input
              id="ewb-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1000"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[100, 350, 800, 1400, 2200].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setDistance(String(preset))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset} km
            </button>
          ))}
        </div>
      </section>

      {calc.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {calc.error}
        </p>
      ) : (
        <>
          <section
            className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Validity period
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {calc.days} {calc.days === 1 ? "day" : "days"}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {km(calc.distance)} at one day per {calc.perDay} km or part thereof
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy e-way bill validity result"
                  className={GHOST_BTN}
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
                ["Cargo type", CARGO[cargo].label],
                ["Distance slab", `1 day per ${calc.perDay} km or part thereof`],
                [
                  "Generated on",
                  genDate
                    ? `${DATE_FMT.format(new Date(`${genDate}T00:00:00`))} at ${genTime || "00:00"}`
                    : "Pick a date",
                ],
                [
                  "Valid through",
                  calc.lastFullDay ? `end of ${DATE_FMT.format(calc.lastFullDay)}` : "Pick a date",
                ],
                [
                  "Expires at",
                  calc.expiry ? `00:00 on ${DATE_FMT.format(calc.expiry)}` : "Pick a date",
                ],
                ["Distance headroom in this slab", `${km(calc.extraKm)} spare`],
                ["Next extra day starts at", km(calc.nextDayAt)],
                ["Consignment value", money(calc.consignmentValue)],
              ].map(([label, val]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{val}</dd>
                </div>
              ))}
            </dl>

            <p
              className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
                calc.needsEwb
                  ? "bg-[var(--muted)] text-[var(--foreground)]"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)]"
              }`}
            >
              {calc.needsEwb
                ? `Consignment value is above Rs 50,000, so an e-way bill is generally required for this movement.`
                : `Consignment value is Rs 50,000 or less — an e-way bill is usually not mandatory on value alone, though some states and specified goods require one regardless.`}
            </p>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Distance to validity, {CARGO[cargo].label}</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[300px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Distance</th>
                    <th scope="col" className="py-2 text-right font-semibold">Validity</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const windowSize = 6;
                    const start = Math.max(1, calc.days - Math.floor(windowSize / 2));
                    return Array.from({ length: windowSize }, (_, idx) => start + idx);
                  })().map((slot) => {
                    const from = (slot - 1) * calc.perDay + 1;
                    const to = slot * calc.perDay;
                    const active = calc.days === slot;
                    return (
                      <tr
                        key={slot}
                        className={`border-b border-[var(--border)] last:border-0 ${
                          active ? "bg-[var(--muted)]" : ""
                        }`}
                      >
                        <td className="py-2 pr-3 font-semibold">
                          {km(from)} – {km(to)}
                        </td>
                        <td className="py-2 text-right">
                          {slot} {slot === 1 ? "day" : "days"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Validity is counted from the time Part-B is first entered, and a day ends
        at midnight of the day immediately following the date of generation. Validity can normally be
        extended within eight hours before or after expiry if the goods are still in transit. Confirm
        the position for your consignment on the official e-way bill portal or with your tax adviser.
      </p>
    </main>
  );
}
