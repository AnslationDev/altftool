"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Warehouse } from "lucide-react";

import {
  BATTERY_TYPES,
  CRANK_THRESHOLD_SOC,
  LOCATIONS,
  POWERTRAINS,
  SULFATION_THRESHOLD_SOC,
  TRANSMISSIONS,
  buildCarStorageChecklist,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });
const n1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : "—");
const n3 = (v) => (Number.isFinite(v) ? NUM3.format(v) : "—");

const DEFAULTS = {
  weeks: "12",
  powertrain: "petrol",
  transmission: "manual",
  batteryType: "agm",
  location: "garage",
  capacityAh: "60",
  parasiticMa: "30",
  averageTempC: "10",
  minimumTempC: "-4",
  normalPsi: "33",
  sidewallMaxPsi: "51",
  coolantProtectionC: "-37",
  canPlugIn: false,
};

const PHASES = [
  { id: "before", title: "Before you walk away", key: "beforeTasks" },
  { id: "during", title: "While it is standing", key: "duringTasks" },
  { id: "return", title: "Bringing it back", key: "returnTasks" },
];

const PRIORITY_STYLE = {
  critical: "bg-[var(--danger-soft)] text-[var(--danger)]",
  recommended: "bg-[var(--info-soft)] text-[var(--info)]",
  optional: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [done, setDone] = useState({});
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setBool = (key) => (event) => {
    const { checked } = event.target;
    setForm((prev) => ({ ...prev, [key]: checked }));
  };

  const toggleDone = (id) => (event) => {
    const { checked } = event.target;
    setDone((prev) => ({ ...prev, [id]: checked }));
  };

  const result = useMemo(() => buildCarStorageChecklist(form), [form]);
  const ok = !result.error;
  const completed = ok ? result.tasks.filter((t) => done[t.id]).length : 0;

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      "Car Storage Checklist",
      `${n1(result.weeks)} weeks (${n1(result.days)} days) · ${result.powertrainLabel} · ${result.transmissionLabel} · ${result.locationLabel}`,
      `Average ${n1(result.averageTempC)} °C, minimum ${n1(result.minimumTempC)} °C`,
    ];
    if (result.battery) {
      lines.push(
        `12 V battery: ${n3(result.battery.totalAhPerDay)} Ah a day (${n1(result.battery.parasiticShare)}% of it parasitic drain)`,
        `Reaches ${SULFATION_THRESHOLD_SOC}% in ${n1(result.battery.daysToSulfation)} days, ${CRANK_THRESHOLD_SOC}% in ${n1(result.battery.daysToFlat)} days`,
      );
    }
    lines.push(`Storage tyre pressure: ${n1(result.storagePsi)} psi (normal ${n1(result.normalPsi)} psi)`, "");
    PHASES.forEach((phase) => {
      lines.push(phase.title.toUpperCase());
      result[phase.key].forEach((t) => {
        lines.push(`[${done[t.id] ? "x" : " "}] (${t.priority}) ${t.title}`);
        lines.push(`    ${t.detail}`);
      });
      lines.push("");
    });
    return lines.join("\n").trim();
  }, [ok, result, done]);

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
    setDone({});
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
      {hint ? <p className="mt-1 text-xs text-[var(--muted-foreground)]">{hint}</p> : null}
    </div>
  );

  const select = (id, label, key, options) => (
    <div>
      <label className={LABEL_CLASS} htmlFor={id}>
        {label}
      </label>
      <select id={id} className={`mt-2 ${INPUT_CLASS}`} value={form[key]} onChange={set(key)}>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Warehouse className="h-4 w-4" aria-hidden="true" />
          Vehicle care
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Car Storage Checklist</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter how long the car is standing and it works out when the 12 V battery gives up —
          parasitic drain plus self-discharge — then builds the preparation, monthly and
          bring-it-back lists around that answer.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The car and the space</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {field("cs-weeks", "Weeks in storage", "weeks", { min: "1", max: "520", step: "1" })}
          {select("cs-power", "Powertrain", "powertrain", POWERTRAINS)}
          {select("cs-trans", "Transmission", "transmission", TRANSMISSIONS)}
          {select("cs-battery", "12 V battery type", "batteryType", BATTERY_TYPES)}
          {select("cs-location", "Where it will stand", "location", LOCATIONS)}
          {field("cs-cap", "Battery capacity (Ah)", "capacityAh", { min: "1", max: "300", step: "1" }, "Printed on the battery label.")}
          {field("cs-drain", "Parasitic drain (mA)", "parasiticMa", { min: "0", max: "5000", step: "1" }, "20–50 mA on most modern cars once asleep. Measure it with a clamp meter if you can.")}
          {field("cs-avg", "Average storage temperature (°C)", "averageTempC", { min: "-40", max: "60", step: "1" })}
          {field("cs-min", "Coldest it is likely to get (°C)", "minimumTempC", { min: "-40", max: "60", step: "1" })}
          {field("cs-psi", "Normal cold tyre pressure (psi)", "normalPsi", { min: "1", step: "1" }, "On the door pillar or fuel flap sticker.")}
          {field("cs-sidewall", "Sidewall maximum pressure (psi)", "sidewallMaxPsi", { min: "1", step: "1" }, "The storage pressure is never taken above this.")}
          {field("cs-coolant", "Coolant freeze protection (°C)", "coolantProtectionC", { max: "0", step: "1" }, "A 50/50 ethylene glycol mix is about −37 °C.")}
          <div className="sm:col-span-2">
            <label className="flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="cs-plug">
              <input
                id="cs-plug"
                type="checkbox"
                className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={form.canPlugIn}
                onChange={setBool("canPlugIn")}
              />
              <span>There is a charge point where it will be parked</span>
            </label>
          </div>
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
              Days before it will not start
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${ok && result.willGoFlat ? "text-[var(--danger)]" : "text-[var(--primary)]"}`}
            >
              {ok && result.battery ? `${n1(result.battery.daysToFlat)} days` : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? result.willGoFlat
                  ? `You are leaving it ${n1(result.days)} days — a maintainer or a disconnect is not optional here`
                  : `You are leaving it ${n1(result.days)} days, so it should still crank`
                : "Fix the inputs above to build the checklist"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the car storage checklist"
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
            ["Standing for", ok ? `${n1(result.weeks)} weeks · ${n1(result.days)} days · ${n1(result.months)} months` : "—"],
            [
              "Battery drain per day",
              ok && result.battery
                ? `${n3(result.battery.totalAhPerDay)} Ah (${n3(result.battery.parasiticAhPerDay)} parasitic + ${n3(result.battery.selfAhPerDay)} self)`
                : "—",
            ],
            [
              "Share from parasitic drain",
              ok && result.battery ? `${n1(result.battery.parasiticShare)}%` : "—",
            ],
            [
              `Days to ${SULFATION_THRESHOLD_SOC}% (sulfation starts)`,
              ok && result.battery ? n1(result.battery.daysToSulfation) : "—",
            ],
            [
              `Days to ${CRANK_THRESHOLD_SOC}% (will not crank)`,
              ok && result.battery ? n1(result.battery.daysToFlat) : "—",
            ],
            ["Storage tyre pressure", ok ? `${n1(result.storagePsi)} psi (normal ${n1(result.normalPsi)} psi)` : "—"],
            ["Fuel stabiliser", ok ? (result.needsStabiliser ? "Yes" : "Not needed for this car or duration") : "—"],
            ["Oil change before storing", ok ? (result.needsOilChange ? "Yes" : "Can wait") : "—"],
            ["Traction battery", ok ? (result.hasTraction ? "Leave it at 40–60%" : "Not applicable") : "—"],
            ["Checklist steps", ok ? `${completed} of ${result.totalTasks} done` : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {result.powertrainNote} {result.locationNote}
          </p>
        ) : null}
      </section>

      {ok
        ? PHASES.map((phase) => (
            <section key={phase.id} className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
              <h2 className="text-base font-semibold">{phase.title}</h2>
              <ul className="mt-3 space-y-3">
                {result[phase.key].map((task) => (
                  <li key={task.id} className="rounded-lg border border-[var(--border)] p-3">
                    <label className="flex min-h-11 items-start gap-3" htmlFor={`cs-t-${task.id}`}>
                      <input
                        id={`cs-t-${task.id}`}
                        type="checkbox"
                        className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                        checked={Boolean(done[task.id])}
                        onChange={toggleDone(task.id)}
                      />
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-sm font-semibold ${done[task.id] ? "line-through opacity-60" : ""}`}
                          >
                            {task.title}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${PRIORITY_STYLE[task.priority]}`}
                          >
                            {task.priority}
                          </span>
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                          {task.detail}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          ))
        : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        General guidance, not a substitute for the vehicle handbook. Follow the manufacturer&rsquo;s
        figures for pressures, fluids and traction-battery storage, and have a garage look at any
        car that has stood for years before it goes back on the road.
      </p>
    </main>
  );
}
