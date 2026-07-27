"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShowerHead } from "lucide-react";

import {
  BATH_MODES,
  DRAWDOWN_EFFICIENCY,
  SHOWER_FLOWS,
  bathsPerTank,
  heatingMinutes,
  selectGeyser,
} from "../lib";

const DASH = "—";
const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const N0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const N1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const N3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });
const n0 = (v) => (Number.isFinite(v) ? N0.format(v) : DASH);
const n1 = (v) => (Number.isFinite(v) ? N1.format(v) : DASH);
const n3 = (v) => (Number.isFinite(v) ? N3.format(v) : DASH);
const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);

const DEFAULTS = {
  mode: "bucket",
  bucketLitres: "20",
  buckets: "1",
  showerMinutes: "8",
  flow: "8",
  users: "2",
  bathC: "40",
  coldC: "20",
  tankC: "60",
  watts: "2000",
  tariff: "",
};

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_ON =
  "min-h-11 rounded-md border border-[var(--primary)] bg-[var(--primary)]/10 px-3 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNum = (raw) => (String(raw).trim() === "" ? Number.NaN : Number(String(raw).trim()));

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      selectGeyser({
        mode: form.mode,
        bucketLitres: toNum(form.bucketLitres),
        buckets: toNum(form.buckets),
        showerMinutes: toNum(form.showerMinutes),
        flowLpm: toNum(form.flow),
        usersInBurst: toNum(form.users),
        bathC: toNum(form.bathC),
        coldC: toNum(form.coldC),
        tankC: toNum(form.tankC),
        elementWatts: toNum(form.watts),
        tariff: form.tariff.trim() === "" ? 0 : toNum(form.tariff),
      }),
    [form],
  );

  const ok = !result.error;
  const isShower = form.mode === "shower";

  const summary = ok
    ? [
        "Geyser Capacity Selector",
        `${isShower ? `${form.showerMinutes} min shower at ${form.flow} L/min` : `${form.buckets} bucket(s) of ${form.bucketLitres} L`} for ${form.users} people back to back`,
        `Bath water per person: ${n0(result.bathLitresPerPerson)} L at ${form.bathC} C`,
        `Hot water drawn per person: ${n1(result.hotPerPerson)} L from a ${form.tankC} C tank`,
        `Total hot water in the burst: ${n1(result.totalHot)} L`,
        `Tank needed: ${n1(result.requiredTank)} L`,
        `Recommended size: ${result.recommended} L`,
        `Reheat from cold: ${n0(result.heatMinutes)} minutes on a ${form.watts} W element`,
        `Energy per full heat: ${n3(result.energyKwh)} kWh`,
        result.costPerHeat > 0 ? `Cost per full heat: ${money(result.costPerHeat)}` : null,
      ]
        .filter(Boolean)
        .join("\n")
    : "";

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
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ShowerHead className="h-4 w-4" aria-hidden="true" />
          Appliance sizing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Geyser Capacity Selector</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          You bathe at about 40 °C, not at tank temperature — so a 20 litre bucket only draws about
          10 litres from a 60 °C geyser. This sizes the tank from that mixing balance.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap gap-2">
          {BATH_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={form.mode === m.id ? CHIP_ON : CHIP}
              aria-pressed={form.mode === m.id}
              onClick={() => setForm((prev) => ({ ...prev, mode: m.id }))}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {isShower ? (
            <>
              <div>
                <label className={LABEL} htmlFor="g-minutes">
                  Shower time per person (minutes)
                </label>
                <input
                  id="g-minutes"
                  className={INPUT}
                  type="number"
                  inputMode="decimal"
                  min="1"
                  max="60"
                  step="1"
                  value={form.showerMinutes}
                  onChange={set("showerMinutes")}
                />
              </div>
              <div>
                <label className={LABEL} htmlFor="g-flow">
                  Shower flow (litres per minute)
                </label>
                <input
                  id="g-flow"
                  className={INPUT}
                  type="number"
                  inputMode="decimal"
                  min="1"
                  max="30"
                  step="0.5"
                  value={form.flow}
                  onChange={set("flow")}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className={LABEL} htmlFor="g-bucket">
                  Bucket size (litres)
                </label>
                <input
                  id="g-bucket"
                  className={INPUT}
                  type="number"
                  inputMode="decimal"
                  min="1"
                  max="50"
                  step="1"
                  value={form.bucketLitres}
                  onChange={set("bucketLitres")}
                />
              </div>
              <div>
                <label className={LABEL} htmlFor="g-buckets">
                  Buckets per person
                </label>
                <input
                  id="g-buckets"
                  className={INPUT}
                  type="number"
                  inputMode="decimal"
                  min="1"
                  max="10"
                  step="0.5"
                  value={form.buckets}
                  onChange={set("buckets")}
                />
              </div>
            </>
          )}
          <div>
            <label className={LABEL} htmlFor="g-users">
              People bathing back to back
            </label>
            <input
              id="g-users"
              className={INPUT}
              type="number"
              inputMode="numeric"
              min="1"
              max="12"
              step="1"
              value={form.users}
              onChange={set("users")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="g-bathc">
              Comfortable bathing temperature (°C)
            </label>
            <input
              id="g-bathc"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={form.bathC}
              onChange={set("bathC")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="g-coldc">
              Mains water temperature (°C)
            </label>
            <input
              id="g-coldc"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={form.coldC}
              onChange={set("coldC")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="g-tankc">
              Thermostat setting (°C)
            </label>
            <input
              id="g-tankc"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={form.tankC}
              onChange={set("tankC")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="g-watts">
              Element rating (W)
            </label>
            <input
              id="g-watts"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="500"
              max="10000"
              step="100"
              value={form.watts}
              onChange={set("watts")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="g-tariff">
              Electricity tariff per unit (optional)
            </label>
            <input
              id="g-tariff"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              placeholder="e.g. 8"
              value={form.tariff}
              onChange={set("tariff")}
            />
          </div>
        </div>

        {isShower ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {SHOWER_FLOWS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={form.flow === String(f.lpm) ? CHIP_ON : CHIP}
                onClick={() => setForm((prev) => ({ ...prev, flow: String(f.lpm) }))}
              >
                {f.label} ({f.lpm} L/min)
              </button>
            ))}
          </div>
        ) : null}
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
              Recommended tank
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${result.recommended} L` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? result.exceedsCatalogue
                  ? `This usage needs ${n1(result.requiredTank)} L in one burst — beyond a single domestic storage geyser. Stagger the baths, fit a larger commercial tank, or use an instant heater at the shower.`
                  : `Covers ${n0(result.servesUsers)} ${result.servesUsers === 1 ? "person" : "people"} back to back before the outlet cools`
                : "Fix the inputs above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the recommended geyser capacity"
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
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Bath water per person", ok ? `${n0(result.bathLitresPerPerson)} L` : DASH],
            ["Hot water drawn per person", ok ? `${n1(result.hotPerPerson)} L` : DASH],
            ["Cold mixed in per person", ok ? `${n1(result.coldMixedIn)} L` : DASH],
            ["Hot share of the bath", ok ? `${n0(result.hotSharePct)}%` : DASH],
            ["Hot water for the whole burst", ok ? `${n1(result.totalHot)} L` : DASH],
            [
              `Tank needed (÷ ${DRAWDOWN_EFFICIENCY} usable draw)`,
              ok ? `${n1(result.requiredTank)} L` : DASH,
            ],
            ["Temperature rise the element must deliver", ok ? `${n0(result.deltaT)} °C` : DASH],
            ["Time to heat a full tank from cold", ok ? `${n0(result.heatMinutes)} minutes` : DASH],
            ["Energy per full heat", ok ? `${n3(result.energyKwh)} kWh` : DASH],
            ["Cost per full heat", ok && result.costPerHeat > 0 ? money(result.costPerHeat) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">How many bucket baths a tank gives</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          A 20 litre bucket at your settings, one full tank, no reheating in between.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[300px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Tank
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Bucket baths
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Reheat time
                </th>
              </tr>
            </thead>
            <tbody>
              {[6, 10, 15, 25, 35].map((size) => {
                const row = selectGeyser({
                  mode: "bucket",
                  bucketLitres: 20,
                  buckets: 1,
                  usersInBurst: 1,
                  bathC: toNum(form.bathC),
                  coldC: toNum(form.coldC),
                  tankC: toNum(form.tankC),
                  elementWatts: toNum(form.watts),
                });
                if (row.error || !(row.hotPerPerson > 0)) {
                  return (
                    <tr key={size} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{size} L</td>
                      <td className="py-2 pr-3 text-right">{DASH}</td>
                      <td className="py-2 text-right">{DASH}</td>
                    </tr>
                  );
                }
                const baths = bathsPerTank({ tankLitres: size, hotPerBath: row.hotPerPerson });
                const minutes = heatingMinutes({
                  litres: size,
                  deltaC: row.deltaT,
                  watts: toNum(form.watts),
                });
                return (
                  <tr key={size} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{size} L</td>
                    <td className="py-2 pr-3 text-right">{n1(baths)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {n0(minutes)} min
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. It ignores standing heat loss from the tank and pipe runs, which add
        a few minutes and a little energy in winter. Have any water heater installed and earthed by a
        licensed electrician, and keep the thermostat at or below 60 °C to limit scalding and scale.
      </p>
    </main>
  );
}
