"use client";

import { useMemo, useState } from "react";
import { Building2, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

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
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const money2 = (value) => INR2.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);

const DEFAULT_TYPES = [
  { id: 1, label: "1 BHK", area: "650", count: "20", slots: "1" },
  { id: 2, label: "2 BHK", area: "1000", count: "10", slots: "1" },
];

const DEFAULTS = {
  budget: 100000,
  basis: "hybrid",
  equalShare: 40,
  parking: 300,
  sinking: 0,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

/**
 * Split a monthly budget across flats.
 * equalShare = % of the budget recovered as an identical charge per flat;
 * the remainder is recovered per square foot of area.
 */
function splitBudget(budget, types, equalShare) {
  const totalFlats = types.reduce((sum, t) => sum + t.count, 0);
  const totalArea = types.reduce((sum, t) => sum + t.area * t.count, 0);
  const equalPool = (budget * equalShare) / 100;
  const areaPool = budget - equalPool;
  const perFlatEqual = totalFlats > 0 ? equalPool / totalFlats : 0;
  const perSqft = totalArea > 0 ? areaPool / totalArea : 0;

  const rows = types.map((t) => {
    const equalPart = perFlatEqual;
    const areaPart = t.area * perSqft;
    const monthly = equalPart + areaPart;
    return {
      ...t,
      equalPart,
      areaPart,
      monthly,
      groupMonthly: monthly * t.count,
    };
  });

  return { rows, totalFlats, totalArea, perFlatEqual, perSqft, equalPool, areaPool };
}

export default function ToolHome() {
  const [types, setTypes] = useState(DEFAULT_TYPES);
  const [budget, setBudget] = useState(String(DEFAULTS.budget));
  const [basis, setBasis] = useState(DEFAULTS.basis);
  const [equalShare, setEqualShare] = useState(String(DEFAULTS.equalShare));
  const [parking, setParking] = useState(String(DEFAULTS.parking));
  const [sinking, setSinking] = useState(String(DEFAULTS.sinking));
  const [copied, setCopied] = useState(false);

  const effectiveEqualShare =
    basis === "equal" ? 100 : basis === "area" ? 0 : toNumber(equalShare);

  const calc = useMemo(() => {
    const b = toNumber(budget);
    const park = toNumber(parking);
    const sink = toNumber(sinking);
    const share = effectiveEqualShare;

    if ([b, park, sink, share].some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in the budget, parking and sinking fund fields." };
    }
    if (b <= 0) return { error: "Monthly society budget must be greater than zero." };
    if (park < 0 || sink < 0) return { error: "Charges cannot be negative." };
    if (share < 0 || share > 100) return { error: "Equal share must be between 0% and 100%." };

    const parsed = [];
    for (const t of types) {
      const area = toNumber(t.area);
      const count = toNumber(t.count);
      const slots = toNumber(t.slots);
      if ([area, count, slots].some((value) => Number.isNaN(value))) {
        return { error: `Enter valid numbers for "${t.label || "flat type"}".` };
      }
      if (count < 0 || area < 0 || slots < 0) {
        return { error: "Area, flat count and parking slots cannot be negative." };
      }
      parsed.push({ id: t.id, label: t.label || "Flat", area, count: Math.round(count), slots });
    }

    const totalFlats = parsed.reduce((sum, t) => sum + t.count, 0);
    const totalArea = parsed.reduce((sum, t) => sum + t.area * t.count, 0);
    if (totalFlats <= 0) return { error: "Add at least one flat." };
    if (share < 100 && totalArea <= 0) {
      return { error: "Enter a carpet area above zero to split any part of the budget by area." };
    }

    const split = splitBudget(b, parsed, share);
    const rows = split.rows.map((row) => {
      const parkingCharge = row.slots * park;
      const sinkingCharge = (row.monthly * sink) / 100;
      const payable = row.monthly + parkingCharge + sinkingCharge;
      return {
        ...row,
        parkingCharge,
        sinkingCharge,
        payable,
        groupPayable: payable * row.count,
      };
    });

    const collected = rows.reduce((sum, row) => sum + row.groupPayable, 0);
    const parkingTotal = rows.reduce((sum, row) => sum + row.parkingCharge * row.count, 0);
    const sinkingTotal = rows.reduce((sum, row) => sum + row.sinkingCharge * row.count, 0);
    const cheapest = rows.reduce((a, r) => (r.payable < a.payable ? r : a), rows[0]);
    const dearest = rows.reduce((a, r) => (r.payable > a.payable ? r : a), rows[0]);

    return {
      rows,
      totalFlats: split.totalFlats,
      totalArea: split.totalArea,
      perFlatEqual: split.perFlatEqual,
      perSqft: split.perSqft,
      equalPool: split.equalPool,
      areaPool: split.areaPool,
      budgetValue: b,
      collected,
      parkingTotal,
      sinkingTotal,
      annual: collected * 12,
      averagePerFlat: collected / split.totalFlats,
      cheapest,
      dearest,
      share,
    };
  }, [types, budget, parking, sinking, effectiveEqualShare]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "Society Maintenance Split",
      `Monthly common expenses: ${money(calc.budgetValue)}`,
      `Flats: ${calc.totalFlats} · Total area: ${num(calc.totalArea)} sq ft`,
      `Basis: ${num(calc.share)}% equal + ${num(100 - calc.share)}% by area`,
      `Rate per sq ft: ${money2(calc.perSqft)} · Equal component: ${money2(calc.perFlatEqual)} per flat`,
      "",
      ...calc.rows.map(
        (row) =>
          `${row.label} (${num(row.area)} sq ft × ${row.count}): ${money2(row.payable)} per flat per month`,
      ),
      "",
      `Total collected each month: ${money(calc.collected)}`,
      `Annual collection: ${money(calc.annual)}`,
    ].join("\n");
  }, [calc]);

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

  const updateType = (id, field, value) => {
    setTypes((current) =>
      current.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
    );
  };

  const addType = () => {
    setTypes((current) => {
      const nextId = current.reduce((max, t) => Math.max(max, t.id), 0) + 1;
      return [...current, { id: nextId, label: `Type ${nextId}`, area: "800", count: "5", slots: "1" }];
    });
  };

  const removeType = (id) => {
    setTypes((current) => (current.length > 1 ? current.filter((t) => t.id !== id) : current));
  };

  const reset = () => {
    setTypes(DEFAULT_TYPES);
    setBudget(String(DEFAULTS.budget));
    setBasis(DEFAULTS.basis);
    setEqualShare(String(DEFAULTS.equalShare));
    setParking(String(DEFAULTS.parking));
    setSinking(String(DEFAULTS.sinking));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Building2 className="h-4 w-4" aria-hidden="true" />
          Housing society
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Society Maintenance Split Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your society&apos;s monthly expense budget and the mix of flat sizes, then split it
          equally per flat, purely by carpet area, or on the hybrid basis most managing committees
          actually use.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sms-budget">
              Monthly common expenses (INR)
            </label>
            <input
              id="sms-budget"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sms-basis">
              Split basis
            </label>
            <select
              id="sms-basis"
              className={`mt-2 ${INPUT_CLASS}`}
              value={basis}
              onChange={(event) => setBasis(event.target.value)}
            >
              <option value="equal">Equal per flat</option>
              <option value="area">Per square foot of area</option>
              <option value="hybrid">Hybrid (part equal, part by area)</option>
            </select>
          </div>
          {basis === "hybrid" ? (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="sms-share">
                Share recovered equally: {num(toNumber(equalShare) || 0)}%
              </label>
              <input
                id="sms-share"
                className="mt-3 h-11 w-full accent-[var(--primary)]"
                type="range"
                min="0"
                max="100"
                step="5"
                value={equalShare}
                onChange={(event) => setEqualShare(event.target.value)}
              />
              <p className="text-xs text-[var(--muted-foreground)]">
                Service charges, security and lift running costs are usually shared equally; water,
                repairs, sinking fund and property tax are usually shared by area.
              </p>
            </div>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="sms-parking">
              Parking charge per slot / month (INR)
            </label>
            <input
              id="sms-parking"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={parking}
              onChange={(event) => setParking(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sms-sinking">
              Sinking fund (% on top of maintenance)
            </label>
            <input
              id="sms-sinking"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={sinking}
              onChange={(event) => setSinking(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Flat types in the society</h2>
          <button type="button" onClick={addType} className={GHOST_BTN} aria-label="Add a flat type">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add type
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {types.map((t) => (
            <div key={t.id} className="rounded-lg border border-[var(--border)] p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`sms-label-${t.id}`}>
                    Label
                  </label>
                  <input
                    id={`sms-label-${t.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={t.label}
                    onChange={(event) => updateType(t.id, "label", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`sms-area-${t.id}`}>
                    Carpet area (sq ft)
                  </label>
                  <input
                    id={`sms-area-${t.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="10"
                    value={t.area}
                    onChange={(event) => updateType(t.id, "area", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`sms-count-${t.id}`}>
                    Number of flats
                  </label>
                  <input
                    id={`sms-count-${t.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    value={t.count}
                    onChange={(event) => updateType(t.id, "count", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`sms-slots-${t.id}`}>
                    Parking slots per flat
                  </label>
                  <input
                    id={`sms-slots-${t.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1"
                    value={t.slots}
                    onChange={(event) => updateType(t.id, "slots", event.target.value)}
                  />
                </div>
              </div>
              {types.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeType(t.id)}
                  aria-label={`Remove flat type ${t.label}`}
                  className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              ) : null}
            </div>
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
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Average monthly bill per flat
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {money2(calc.averagePerFlat)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {money2(calc.cheapest.payable)} for a {num(calc.cheapest.area)} sq ft flat up to{" "}
                  {money2(calc.dearest.payable)} for a {num(calc.dearest.area)} sq ft flat
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy the maintenance split result"
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

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Flat type
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Maintenance
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Extras
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Payable
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {calc.rows.map((row) => (
                    <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">
                        <span className="font-semibold">{row.label}</span>
                        <span className="block text-xs text-[var(--muted-foreground)]">
                          {num(row.area)} sq ft × {row.count}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-right">{money2(row.monthly)}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {money2(row.parkingCharge + row.sinkingCharge)}
                      </td>
                      <td className="py-2 text-right font-semibold">{money2(row.payable)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Flats in the society", num(calc.totalFlats)],
                ["Total carpet area", `${num(calc.totalArea)} sq ft`],
                ["Equal component per flat", money2(calc.perFlatEqual)],
                ["Rate per sq ft", money2(calc.perSqft)],
                ["Recovered equally", money(calc.equalPool)],
                ["Recovered by area", money(calc.areaPool)],
                ["Parking collection", money(calc.parkingTotal)],
                ["Sinking fund collection", money(calc.sinkingTotal)],
                ["Total collected each month", money(calc.collected)],
                ["Total collected each year", money(calc.annual)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
              Maintenance recovered ({money(calc.budgetValue)}) exactly matches the budget; parking
              and sinking fund are collected on top of it.
            </p>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. Co-operative housing society model bye-laws recover some heads
        equally per flat (service charges, security, lift) and others by area (property tax, sinking
        fund, repairs), so check your society&apos;s adopted bye-laws and general body resolution
        before billing. GST applies only when the society crosses the prescribed turnover and
        per-member thresholds.
      </p>
    </main>
  );
}
