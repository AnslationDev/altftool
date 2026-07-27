"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, RotateCcw, Weight } from "lucide-react";

import { ACCESSORY_TYPES, SSF_BANDS, checkRoofLoad } from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });
const n1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : "—");
const n2 = (v) => (Number.isFinite(v) ? NUM2.format(v) : "—");
const n3 = (v) => (Number.isFinite(v) ? NUM3.format(v) : "—");

const DEFAULTS = {
  vehicleRoofLimit: "75",
  rackRatedLoad: "90",
  rackWeight: "6",
  accessoryType: "box-large",
  accessoryWeight: "20",
  cargoWeight: "40",
  kerbWeight: "1500",
  grossVehicleMass: "2000",
  occupantsWeight: "300",
  interiorLoad: "100",
  trackWidth: "1550",
  cogHeight: "600",
  roofLoadHeight: "1750",
  cruiseSpeed: "100",
  deltaCdA: "0.3",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const pickAccessory = (event) => {
    const { value } = event.target;
    const preset = ACCESSORY_TYPES.find((a) => a.id === value);
    setForm((prev) => ({
      ...prev,
      accessoryType: value,
      accessoryWeight: preset ? String(preset.weight) : prev.accessoryWeight,
      deltaCdA: preset ? String(preset.deltaCdA) : prev.deltaCdA,
    }));
  };

  const result = useMemo(() => checkRoofLoad(form), [form]);
  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      "Roof Rack Load Checker",
      `Binding limit: ${n1(result.bindingLimit)} kg (set by ${result.bindingSource})`,
      `Rack ${n1(result.rackWeight)} kg + ${result.accessoryLabel} ${n1(result.accessoryWeight)} kg = ${n1(result.overhead)} kg before any cargo`,
      `Cargo allowance: ${n1(result.cargoAllowance)} kg · you entered ${n1(result.cargoWeight)} kg`,
      `On the roof: ${n1(result.onRoof)} kg — ${result.withinLimit ? `${n1(result.remaining)} kg spare` : `${n1(Math.abs(result.remaining))} kg OVER`}`,
    ];
    if (result.payload) {
      lines.push(
        "",
        `Payload: ${n1(result.payload.used)} kg of ${n1(result.payload.capacity)} kg (${n1(result.payload.utilisation)}%), laden ${n1(result.payload.laden)} kg vs ${n1(result.payload.gvm)} kg GVM`,
      );
    }
    if (result.stability) {
      lines.push(
        "",
        `Centre of gravity ${n1(result.stability.baseCog)} mm → ${n1(result.stability.loadedCog)} mm (+${n1(result.stability.cogRise)} mm)`,
        `Static Stability Factor ${n3(result.stability.beforeSsf)} → ${n3(result.stability.afterSsf)} (−${n1(result.stability.ssfDropPercent)}%), NHTSA ${result.stability.beforeStars} → ${result.stability.afterStars} stars`,
      );
    }
    if (result.drag) {
      lines.push(
        "",
        `Extra fuel at ${n1(result.drag.speed)} km/h with ΔCdA ${n2(result.drag.deltaCdA)} m²: ${n2(result.drag.litresPer100Km)} L/100 km`,
      );
    }
    return lines.join("\n");
  }, [ok, result]);

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

  const field = (id, label, key, extra = {}, hint = null) => (
    <div>
      <label className={LABEL_CLASS} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`mt-2 ${INPUT_CLASS}`}
        type="number"
        inputMode="decimal"
        value={form[key]}
        onChange={set(key)}
        {...extra}
      />
      {hint ? <p className={HINT_CLASS}>{hint}</p> : null}
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Weight className="h-4 w-4" aria-hidden="true" />
          Vehicle loading
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Roof Rack Load Checker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the dynamic roof load from your handbook and the weight of everything going up
          there. The check uses the lower of the vehicle and rack ratings, subtracts the rack itself,
          and shows what the load does to payload, stability and fuel.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The roof</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {field("rr-limit", "Vehicle dynamic roof load (kg)", "vehicleRoofLimit", { min: "1", max: "500", step: "1" }, "From the owner's handbook, not the rack box.")}
          {field("rr-rack-rating", "Rack system rated load (kg)", "rackRatedLoad", { min: "1", step: "1" }, "Leave blank if you do not know it.")}
          {field("rr-rack-weight", "Weight of the bars and feet (kg)", "rackWeight", { min: "0", step: "0.5" })}
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-accessory">
              What is on the bars
            </label>
            <select
              id="rr-accessory"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.accessoryType}
              onChange={pickAccessory}
            >
              {ACCESSORY_TYPES.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
          {field("rr-accessory-weight", "Weight of that carrier (kg)", "accessoryWeight", { min: "0", step: "0.5" })}
          {field("rr-cargo", "Cargo going inside it (kg)", "cargoWeight", { min: "0", step: "1" })}
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The vehicle (optional)</h2>
        <p className={HINT_CLASS}>
          Kerb weight and gross vehicle mass are on the VIN plate. Fill these in for the payload and
          stability checks.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {field("rr-kerb", "Kerb weight (kg)", "kerbWeight", { min: "0", step: "10" })}
          {field("rr-gvm", "Gross vehicle mass (kg)", "grossVehicleMass", { min: "0", step: "10" })}
          {field("rr-people", "Occupants (kg)", "occupantsWeight", { min: "0", step: "10" })}
          {field("rr-inside", "Luggage inside the car (kg)", "interiorLoad", { min: "0", step: "5" })}
          {field("rr-track", "Track width (mm)", "trackWidth", { min: "0", step: "10" }, "Centre to centre of the tyres across one axle.")}
          {field("rr-cog", "Centre of gravity height (mm)", "cogHeight", { min: "0", step: "10" }, "Roughly 550–650 mm for a car, 650–800 mm for an SUV.")}
          {field("rr-load-height", "Height of the roof load (mm)", "roofLoadHeight", { min: "0", step: "10" }, "Ground to the middle of the box or bikes.")}
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Fuel penalty</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {field("rr-speed", "Steady cruising speed (km/h)", "cruiseSpeed", { min: "1", max: "200", step: "5" })}
          {field("rr-cda", "Added drag area ΔCdA (m²)", "deltaCdA", { min: "0", max: "2", step: "0.01" }, "Set automatically from the carrier you picked. Typical, not measured.")}
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Cargo you can still add
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${ok && !result.withinLimit ? "text-[var(--danger)]" : "text-[var(--primary)]"}`}
            >
              {ok ? `${n1(result.remaining)} kg` : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${n1(result.onRoof)} kg of a ${n1(result.bindingLimit)} kg limit set by ${result.bindingSource}`
                : "Fix the inputs above to see the check"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the roof load check"
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
            ["Vehicle dynamic roof load", ok ? `${n1(result.vehicleRoofLimit)} kg` : "—"],
            ["Rack system rating", ok ? (result.rackRatedLoad === null ? "Not entered" : `${n1(result.rackRatedLoad)} kg`) : "—"],
            ["Binding limit", ok ? `${n1(result.bindingLimit)} kg — ${result.bindingSource}` : "—"],
            ["Rack and carrier", ok ? `${n1(result.overhead)} kg before any cargo` : "—"],
            ["Cargo allowance", ok ? `${n1(result.cargoAllowance)} kg` : "—"],
            ["Total on the roof", ok ? `${n1(result.onRoof)} kg` : "—"],
            ["Limit used", ok ? `${n1(result.utilisation)}%` : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {result.accessoryNote}
          </p>
        ) : null}

        {ok
          ? result.warnings.map((warning) => (
              <p
                key={warning}
                className="mt-3 flex items-start gap-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{warning}</span>
              </p>
            ))
          : null}
      </section>

      {ok && result.payload ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Payload</h2>
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            {[
              ["Payload capacity", `${n1(result.payload.capacity)} kg`],
              ["Payload used", `${n1(result.payload.used)} kg (${n1(result.payload.utilisation)}%)`],
              ["Payload remaining", `${n1(result.payload.remaining)} kg`],
              ["Laden mass", `${n1(result.payload.laden)} kg of ${n1(result.payload.gvm)} kg GVM`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {ok && result.stability ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Stability</h2>
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            {[
              ["Centre of gravity, unloaded roof", `${n1(result.stability.baseCog)} mm`],
              ["Centre of gravity, loaded roof", `${n1(result.stability.loadedCog)} mm (+${n1(result.stability.cogRise)} mm)`],
              ["Static Stability Factor before", n3(result.stability.beforeSsf)],
              ["Static Stability Factor after", `${n3(result.stability.afterSsf)} (−${n1(result.stability.ssfDropPercent)}%)`],
              ["NHTSA rollover band", `${result.stability.beforeStars} → ${result.stability.afterStars} stars`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {result.stability.afterLabel}: {result.stability.afterNote}
          </p>
        </section>
      ) : null}

      {ok && result.drag ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Fuel penalty</h2>
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            {[
              ["Added drag area", `${n2(result.drag.deltaCdA)} m²`],
              ["Extra drag force at speed", `${n1(result.drag.dragForce)} N at ${n1(result.drag.speed)} km/h`],
              ["Extra fuel", `${n2(result.drag.litresPer100Km)} litres per 100 km`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            From force = ½ × air density × ΔCdA × speed², converted with a petrol energy content of
            34.2 MJ per litre and a 25% tank-to-wheel efficiency. Drag rises with the square of
            speed, so the same box costs far more at 120 km/h than at 90.
          </p>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">NHTSA rollover bands</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Stars</th>
                <th scope="col" className="py-2 pr-3 font-semibold">SSF</th>
                <th scope="col" className="py-2 font-semibold">Typical of</th>
              </tr>
            </thead>
            <tbody>
              {SSF_BANDS.map((band) => (
                <tr key={band.stars} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold whitespace-nowrap">{band.stars}</td>
                  <td className="py-2 pr-3 whitespace-nowrap text-[var(--muted-foreground)]">
                    {band.min > 0 ? `${n2(band.min)} and above` : "below 1.04"}
                  </td>
                  <td className="py-2 text-[var(--muted-foreground)]">{band.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        An estimate from the figures you enter, not a substitute for the vehicle and rack
        manufacturers&rsquo; instructions. Roof load rules, overhang limits and load-securing
        requirements vary by country — check the ones that apply where you are driving, and weigh
        the load rather than guessing it.
      </p>
    </main>
  );
}
