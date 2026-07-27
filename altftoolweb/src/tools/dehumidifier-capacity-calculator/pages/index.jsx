"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Droplets, RotateCcw } from "lucide-react";

import { DAMP_LEVELS, computeDehumidifier } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const N1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const N2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (v) => (Number.isFinite(v) ? INR.format(v) : "—");
const n1 = (v) => (Number.isFinite(v) ? N1.format(v) : "—");
const n2 = (v) => (Number.isFinite(v) ? N2.format(v) : "—");

const DEFAULTS = {
  area: "400",
  areaUnit: "sqft",
  height: "10",
  heightUnit: "ft",
  tempC: "30",
  ambientRh: "80",
  targetRh: "50",
  dampLevel: "moderate",
  occupants: "2",
  laundryLoads: "0",
  showers: "2",
  tariff: "8",
};

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const num = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  return Number(trimmed);
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const result = useMemo(
    () =>
      computeDehumidifier({
        area: num(form.area),
        areaUnit: form.areaUnit,
        height: num(form.height),
        heightUnit: form.heightUnit,
        tempC: num(form.tempC),
        ambientRh: num(form.ambientRh),
        targetRh: num(form.targetRh),
        dampLevel: form.dampLevel,
        occupants: num(form.occupants),
        laundryLoads: num(form.laundryLoads),
        showers: num(form.showers),
        tariff: num(form.tariff),
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Dehumidifier Capacity Calculator",
      `Space: ${n1(result.areaSqm)} sqm x ${n2(result.heightM)} m = ${n1(result.volumeM3)} m3`,
      `Damp level: ${result.dampLabel} (${n2(result.ach)} air changes/hour)`,
      `Moisture load: ${n1(result.dailyLoadL)} litres/day`,
      `Recommended unit: ${n1(result.recommendedSizeL)} L/day nameplate` +
        (result.unitsNeeded > 1 ? ` x ${result.unitsNeeded} units` : ""),
      `Real extraction at your conditions: ${n1(result.deliveredLPerDay)} L/day`,
      `Runtime: about ${n1(result.runtimeHoursPerDay)} hours/day (${n1(result.dutyCyclePct)}% duty)`,
      `Electricity: ${n1(result.dailyKwh)} kWh/day, ${money(result.dailyCost)}/day, ${money(result.monthlyCost)}/month`,
      result.pullDownHours
        ? `First pull-down to target: about ${n1(result.pullDownHours)} hours`
        : "First pull-down: unit is too small to reach the target",
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
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Droplets className="h-4 w-4" aria-hidden="true" />
          Damp control
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Dehumidifier Capacity Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Works out the litres of water your room actually gains each day, then converts that into
          the nameplate size to buy — including the derating every dehumidifier suffers once the air
          is drier than its 30&nbsp;°C / 80% rating point.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The space</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="dh-area">
              Floor area
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="dh-area"
                className={`${INPUT} mt-0`}
                type="number"
                inputMode="decimal"
                min="1"
                step="10"
                value={form.area}
                onChange={set("area")}
              />
              <select
                aria-label="Floor area unit"
                className={`${INPUT} mt-0 w-28`}
                value={form.areaUnit}
                onChange={set("areaUnit")}
              >
                <option value="sqft">sq ft</option>
                <option value="sqm">sq m</option>
              </select>
            </div>
          </div>
          <div>
            <label className={LABEL} htmlFor="dh-height">
              Ceiling height
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="dh-height"
                className={`${INPUT} mt-0`}
                type="number"
                inputMode="decimal"
                min="1"
                step="0.5"
                value={form.height}
                onChange={set("height")}
              />
              <select
                aria-label="Ceiling height unit"
                className={`${INPUT} mt-0 w-28`}
                value={form.heightUnit}
                onChange={set("heightUnit")}
              >
                <option value="ft">feet</option>
                <option value="m">metres</option>
              </select>
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="dh-damp">
              How damp does it feel?
            </label>
            <select id="dh-damp" className={INPUT} value={form.dampLevel} onChange={set("dampLevel")}>
              {Object.values(DAMP_LEVELS).map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label} — {level.hint}
                </option>
              ))}
            </select>
          </div>
        </div>

        <h2 className="mt-6 text-base font-semibold">Air conditions</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="dh-temp">
              Room temperature (°C)
            </label>
            <input
              id="dh-temp"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="5"
              max="45"
              step="1"
              value={form.tempC}
              onChange={set("tempC")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="dh-tariff">
              Electricity tariff (₹ per kWh)
            </label>
            <input
              id="dh-tariff"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={form.tariff}
              onChange={set("tariff")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="dh-ambient">
              Current humidity (% RH)
            </label>
            <input
              id="dh-ambient"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="1"
              value={form.ambientRh}
              onChange={set("ambientRh")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="dh-target">
              Target humidity (% RH)
            </label>
            <input
              id="dh-target"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="1"
              max="99"
              step="1"
              value={form.targetRh}
              onChange={set("targetRh")}
            />
          </div>
        </div>

        <h2 className="mt-6 text-base font-semibold">Moisture the household adds</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="dh-people">
              People usually in the space
            </label>
            <input
              id="dh-people"
              className={INPUT}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={form.occupants}
              onChange={set("occupants")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="dh-laundry">
              Wash loads dried indoors per day
            </label>
            <input
              id="dh-laundry"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={form.laundryLoads}
              onChange={set("laundryLoads")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="dh-showers">
              Showers taken in this space per day
            </label>
            <input
              id="dh-showers"
              className={INPUT}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={form.showers}
              onChange={set("showers")}
            />
          </div>
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Buy a dehumidifier rated
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : `${n1(result.recommendedSizeL)} L/day`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see a recommendation"
                : `${result.unitsNeeded > 1 ? `${result.unitsNeeded} units · ` : ""}nameplate at 30 °C / 80% RH — it will actually pull ${n1(result.deliveredLPerDay)} L/day in your room`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy dehumidifier sizing result"
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
          {[
            ["Room volume", hasError ? "—" : `${n1(result.volumeM3)} m³`],
            ["Moisture entering the room", hasError ? "—" : `${n2(result.dailyLoadL)} litres/day`],
            [
              "Sizing target (with 20% headroom)",
              hasError ? "—" : `${n2(result.requiredAtRoomL)} litres/day`,
            ],
            [
              "Nameplate derating at your humidity",
              hasError ? "—" : `${n1(result.capacityFactor * 100)}% of rated litres`,
            ],
            ["Minimum nameplate needed", hasError ? "—" : `${n2(result.nameplateNeededL)} L/day`],
            [
              "Expected runtime",
              hasError ? "—" : `${n1(result.runtimeHoursPerDay)} h/day (${n1(result.dutyCyclePct)}% duty cycle)`],
            ["Electricity used", hasError ? "—" : `${n2(result.dailyKwh)} kWh/day · ${n1(result.monthlyKwh)} kWh/month`],
            ["Running cost", hasError ? "—" : `${money(result.dailyCost)}/day · ${money(result.monthlyCost)}/month`],
            [
              "Time to first reach target",
              hasError
                ? "—"
                : result.pullDownHours
                  ? `about ${n1(result.pullDownHours)} hours`
                  : "never — load exceeds capacity",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.breakdown.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Where the water comes from</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Source
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Litres/day
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Share
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.breakdown.map((row) => (
                  <tr key={row.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{row.label}</td>
                    <td className="py-2 pr-3 text-right font-semibold">{n2(row.litres)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {n1(row.sharePct)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            Cut the biggest line and you can often drop a whole size band — vent the bathroom, dry
            washing outdoors, or seal the gap under the door.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        An estimate for sizing, not a survey. Persistent damp from rising groundwater, a failed
        damp-proof course or a plumbing leak will not be cured by a dehumidifier — get the source
        fixed first. Health guidance generally puts the comfortable band at 40–60% RH; below 30% RH
        the air is uncomfortably dry.
      </p>
    </main>
  );
}
