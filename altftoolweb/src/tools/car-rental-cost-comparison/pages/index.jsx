"use client";

import { useMemo, useState } from "react";
import { Car, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import { DEFAULT_GST_PERCENT, FUEL_POLICIES, compareRentals } from "../lib";

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
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";
const MAX_PACKAGES = 4;

const DEFAULT_TRIP = {
  days: "3",
  km: "600",
  fuelPrice: "100",
  kmpl: "15",
  gst: String(DEFAULT_GST_PERCENT),
};

const DEFAULT_PACKAGES = [
  {
    key: 1,
    name: "Quote A",
    dailyRate: "2000",
    unlimitedKm: false,
    includedKmPerDay: "150",
    excessKmRate: "12",
    insurancePerDay: "200",
    deliveryFee: "500",
    deposit: "5000",
    fuelPolicy: "self",
    prepaidTankLitres: "0",
    prepaidRatePerL: "0",
  },
  {
    key: 2,
    name: "Quote B",
    dailyRate: "2800",
    unlimitedKm: true,
    includedKmPerDay: "0",
    excessKmRate: "0",
    insurancePerDay: "0",
    deliveryFee: "0",
    deposit: "3000",
    fuelPolicy: "prepaid",
    prepaidTankLitres: "40",
    prepaidRatePerL: "105",
  },
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return 0;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [trip, setTrip] = useState(DEFAULT_TRIP);
  const [packages, setPackages] = useState(DEFAULT_PACKAGES);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      compareRentals({
        days: toNumber(trip.days),
        totalKm: toNumber(trip.km),
        fuelPrice: toNumber(trip.fuelPrice),
        kmpl: toNumber(trip.kmpl),
        gstPercent: toNumber(trip.gst),
        packages: packages.map((pkg) => ({
          id: String(pkg.key),
          name: pkg.name.trim() || `Quote ${pkg.key}`,
          dailyRate: toNumber(pkg.dailyRate),
          unlimitedKm: pkg.unlimitedKm,
          includedKmPerDay: toNumber(pkg.includedKmPerDay),
          excessKmRate: toNumber(pkg.excessKmRate),
          insurancePerDay: toNumber(pkg.insurancePerDay),
          deliveryFee: toNumber(pkg.deliveryFee),
          deposit: toNumber(pkg.deposit),
          fuelPolicy: pkg.fuelPolicy,
          prepaidTankLitres: toNumber(pkg.prepaidTankLitres),
          prepaidRatePerL: toNumber(pkg.prepaidRatePerL),
        })),
      }),
    [trip, packages],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Car Rental Cost Comparison",
      `Trip: ${trip.days} day(s), ${NUM.format(toNumber(trip.km))} km, ${NUM1.format(result.litresUsed)} L of fuel`,
      `Cheapest: ${result.cheapestName} at ${INR.format(result.cheapestCost)} landed`,
      "",
    ];
    for (const row of result.ranked) {
      lines.push(
        `${row.rank ?? ""} ${row.name}: ${INR.format(row.landedCost)} landed — invoice ${INR.format(row.invoiceTotal)} + fuel ${INR.format(row.fuelCost)}; ${INR2.format(row.costPerKm ?? 0)}/km, deposit ${INR.format(row.deposit)}`.trim(),
      );
    }
    return lines.join("\n");
  }, [hasError, result, trip]);

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
    setTrip(DEFAULT_TRIP);
    setPackages(DEFAULT_PACKAGES);
    setCopied(false);
  };

  const setTripField = (field, value) => setTrip((prev) => ({ ...prev, [field]: value }));

  const setPkg = (key, field, value) =>
    setPackages((prev) => prev.map((pkg) => (pkg.key === key ? { ...pkg, [field]: value } : pkg)));

  const addPackage = () =>
    setPackages((prev) => {
      if (prev.length >= MAX_PACKAGES) return prev;
      const nextKey = prev.reduce((max, pkg) => Math.max(max, pkg.key), 0) + 1;
      return [
        ...prev,
        {
          key: nextKey,
          name: `Quote ${String.fromCharCode(64 + nextKey)}`,
          dailyRate: "2200",
          unlimitedKm: false,
          includedKmPerDay: "200",
          excessKmRate: "10",
          insurancePerDay: "0",
          deliveryFee: "0",
          deposit: "3000",
          fuelPolicy: "self",
          prepaidTankLitres: "0",
          prepaidRatePerL: "0",
        },
      ];
    });

  const removePackage = (key) =>
    setPackages((prev) => (prev.length <= 1 ? prev : prev.filter((pkg) => pkg.key !== key)));

  const best = hasError ? null : result.ranked[0];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Car className="h-4 w-4" aria-hidden="true" />
          Self-drive rentals
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Car Rental Cost Comparison</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Headline day rates hide the excess-kilometre charge and the fuel policy. Price every quote
          against the trip you are actually taking and see which one lands cheapest.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Your trip
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rental-days">
              Days on rent
            </label>
            <input
              id="rental-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={trip.days}
              onChange={(event) => setTripField("days", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rental-km">
              Kilometres you will drive
            </label>
            <input
              id="rental-km"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="25"
              value={trip.km}
              onChange={(event) => setTripField("km", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rental-fuel-price">
              Pump price (₹ per litre)
            </label>
            <input
              id="rental-fuel-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={trip.fuelPrice}
              onChange={(event) => setTripField("fuelPrice", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rental-kmpl">
              Real mileage (km per litre)
            </label>
            <input
              id="rental-kmpl"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="0.5"
              value={trip.kmpl}
              onChange={(event) => setTripField("kmpl", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rental-gst">
              GST on the rental charges (%)
            </label>
            <input
              id="rental-gst"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={trip.gst}
              onChange={(event) => setTripField("gst", event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Check your quote — fuel is outside GST, so it is added after tax here.
            </p>
          </div>
        </div>
      </section>

      {packages.map((pkg) => (
        <section key={pkg.key} className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              <label className={LABEL_CLASS} htmlFor={`rental-name-${pkg.key}`}>
                Quote name
              </label>
              <input
                id={`rental-name-${pkg.key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={pkg.name}
                onChange={(event) => setPkg(pkg.key, "name", event.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => removePackage(pkg.key)}
              disabled={packages.length <= 1}
              aria-label={`Remove ${pkg.name || "quote"}`}
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Remove
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor={`rental-rate-${pkg.key}`}>
                Daily rate (₹)
              </label>
              <input
                id={`rental-rate-${pkg.key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="100"
                value={pkg.dailyRate}
                onChange={(event) => setPkg(pkg.key, "dailyRate", event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor={`rental-insurance-${pkg.key}`}>
                Insurance / CDW per day (₹)
              </label>
              <input
                id={`rental-insurance-${pkg.key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="50"
                value={pkg.insurancePerDay}
                onChange={(event) => setPkg(pkg.key, "insurancePerDay", event.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <div className="flex items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2">
                <input
                  id={`rental-unlimited-${pkg.key}`}
                  type="checkbox"
                  checked={pkg.unlimitedKm}
                  onChange={(event) => setPkg(pkg.key, "unlimitedKm", event.target.checked)}
                  className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                />
                <label htmlFor={`rental-unlimited-${pkg.key}`} className="min-h-11 flex-1 py-3 text-sm font-semibold">
                  Unlimited kilometres
                </label>
              </div>
            </div>
            {!pkg.unlimitedKm && (
              <>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`rental-included-${pkg.key}`}>
                    Included km per day
                  </label>
                  <input
                    id={`rental-included-${pkg.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="10"
                    value={pkg.includedKmPerDay}
                    onChange={(event) => setPkg(pkg.key, "includedKmPerDay", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`rental-excess-${pkg.key}`}>
                    Excess km charge (₹ per km)
                  </label>
                  <input
                    id={`rental-excess-${pkg.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.5"
                    value={pkg.excessKmRate}
                    onChange={(event) => setPkg(pkg.key, "excessKmRate", event.target.value)}
                  />
                </div>
              </>
            )}
            <div>
              <label className={LABEL_CLASS} htmlFor={`rental-delivery-${pkg.key}`}>
                Delivery / pickup fee (₹)
              </label>
              <input
                id={`rental-delivery-${pkg.key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="50"
                value={pkg.deliveryFee}
                onChange={(event) => setPkg(pkg.key, "deliveryFee", event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor={`rental-deposit-${pkg.key}`}>
                Refundable deposit (₹)
              </label>
              <input
                id={`rental-deposit-${pkg.key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="500"
                value={pkg.deposit}
                onChange={(event) => setPkg(pkg.key, "deposit", event.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor={`rental-fuel-${pkg.key}`}>
                Fuel policy
              </label>
              <select
                id={`rental-fuel-${pkg.key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                value={pkg.fuelPolicy}
                onChange={(event) => setPkg(pkg.key, "fuelPolicy", event.target.value)}
              >
                {FUEL_POLICIES.map((policy) => (
                  <option key={policy.id} value={policy.id}>
                    {policy.label}
                  </option>
                ))}
              </select>
            </div>
            {pkg.fuelPolicy === "prepaid" && (
              <>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`rental-tank-${pkg.key}`}>
                    Prepaid tank (litres)
                  </label>
                  <input
                    id={`rental-tank-${pkg.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="1"
                    step="1"
                    value={pkg.prepaidTankLitres}
                    onChange={(event) => setPkg(pkg.key, "prepaidTankLitres", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`rental-tank-rate-${pkg.key}`}>
                    Operator&apos;s fuel rate (₹ per litre)
                  </label>
                  <input
                    id={`rental-tank-rate-${pkg.key}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1"
                    value={pkg.prepaidRatePerL}
                    onChange={(event) => setPkg(pkg.key, "prepaidRatePerL", event.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </section>
      ))}

      <div className="mt-4">
        <button
          type="button"
          onClick={addPackage}
          disabled={packages.length >= MAX_PACKAGES}
          aria-label="Add another rental quote"
          className={PRIMARY_BTN}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add a quote
        </button>
      </div>

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
              Cheapest landed cost
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : INR.format(result.cheapestCost)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to compare quotes."
                : `${result.cheapestName} — everything you actually pay, deposit excluded`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy rental comparison result"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
          {(hasError
            ? [
                ["Rental invoice (with GST)", DASH],
                ["Fuel", DASH],
                ["Landed cost", DASH],
                ["Cost per day", DASH],
                ["Cost per kilometre", DASH],
                ["Next kilometre costs", DASH],
                ["Deposit blocked", DASH],
              ]
            : [
                ["Rental invoice (with GST)", INR.format(best.invoiceTotal)],
                ["Fuel", `${INR.format(best.fuelCost)} · ${best.fuelNote}`],
                ["Landed cost", INR.format(best.landedCost)],
                ["Cost per day", INR.format(best.costPerDay)],
                [
                  "Cost per kilometre",
                  best.costPerKm === null ? "no distance entered" : INR2.format(best.costPerKm),
                ],
                ["Next kilometre costs", INR2.format(best.marginalCostPerKm)],
                ["Deposit blocked", INR.format(best.deposit)],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[38rem] border-collapse text-sm">
              <caption className="pb-2 text-left text-xs text-[var(--muted-foreground)]">
                All quotes, ranked by landed cost
              </caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Quote
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Excess km
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Invoice
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Fuel
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Landed
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Extra
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.ranked.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)]">
                    <td className="py-2 pr-3">
                      {row.name}
                      {row.id === result.cheapestId && (
                        <span className="ml-2 rounded-full bg-[var(--muted)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--success)]">
                          best
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {row.unlimitedKm ? "unlimited" : NUM.format(row.excessKm)}
                    </td>
                    <td className="py-2 pr-3 text-right">{INR.format(row.invoiceTotal)}</td>
                    <td className="py-2 pr-3 text-right">{INR.format(row.fuelCost)}</td>
                    <td className="py-2 pr-3 text-right font-semibold">{INR.format(row.landedCost)}</td>
                    <td className="py-2 text-right">
                      {row.id === result.cheapestId
                        ? DASH
                        : `+${INR.format(
                            result.rows.find((entry) => entry.id === row.id)?.extraOverCheapest ?? 0,
                          )}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!hasError && result.notes.length > 0 && (
          <ul className="mt-4 space-y-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {note}
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate, not a quote. Late-return charges, interstate permits, toll and FASTag
        balances, cleaning fees and the insurance excess you would owe after a claim are not modelled
        here — read the rental agreement for those.
      </p>
    </main>
  );
}
