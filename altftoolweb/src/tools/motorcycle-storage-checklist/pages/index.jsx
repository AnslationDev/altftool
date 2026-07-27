"use client";

import { useMemo, useState } from "react";
import { Bike, Check, Copy, RotateCcw } from "lucide-react";

import {
  BATTERY_TYPES,
  FUEL_SYSTEMS,
  LOCATIONS,
  SULFATION_THRESHOLD_SOC,
  buildStorageChecklist,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const n1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : "—");

const DEFAULTS = {
  weeks: "26",
  fuelSystem: "efi",
  ethanolBlend: true,
  batteryType: "agm",
  location: "unheated",
  averageTempC: "8",
  minimumTempC: "-5",
  frontPsi: "33",
  rearPsi: "36",
  sidewallMaxPsi: "42",
  useStands: false,
  coolantProtectionC: "-37",
};

const PHASES = [
  { id: "before", title: "Before it goes away", key: "beforeTasks" },
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

  const result = useMemo(() => buildStorageChecklist(form), [form]);
  const ok = !result.error;
  const completed = ok ? result.tasks.filter((t) => done[t.id]).length : 0;

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      "Motorcycle Storage Checklist",
      `${n1(result.weeks)} weeks (${n1(result.months)} months) · ${result.fuelSystemLabel} · ${result.batteryLabel} · ${result.locationLabel}`,
      `Average ${n1(result.averageTempC)} °C, minimum ${n1(result.minimumTempC)} °C`,
    ];
    if (result.battery) {
      lines.push(
        `Battery: ${n1(result.battery.monthlyRate)}% per month, projected ${n1(result.battery.projectedSoc)}% at the end${result.battery.needsMaintainer ? " — maintainer needed" : ""}`,
      );
    }
    lines.push(
      result.useStands
        ? `Tyres: on stands, keep ${n1(result.frontPsi)}/${n1(result.rearPsi)} psi`
        : `Tyres: inflate to ${n1(result.frontStoragePsi)} psi front, ${n1(result.rearStoragePsi)} psi rear`,
      "",
    );
    PHASES.forEach((phase) => {
      lines.push(`${phase.title.toUpperCase()}`);
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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Bike className="h-4 w-4" aria-hidden="true" />
          Vehicle care
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Motorcycle Storage Checklist</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tell it how long the bike is standing and where, and the list adapts: battery advice from
          the projected state of charge, storage tyre pressures from your running pressures, and the
          fuel steps only past the durations where they actually matter.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The bike and the space</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {field("ms-weeks", "Weeks in storage", "weeks", { min: "1", max: "520", step: "1" })}
          <div>
            <label className={LABEL_CLASS} htmlFor="ms-fuel">
              Fuel system
            </label>
            <select id="ms-fuel" className={`mt-2 ${INPUT_CLASS}`} value={form.fuelSystem} onChange={set("fuelSystem")}>
              {FUEL_SYSTEMS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ms-battery">
              Battery type
            </label>
            <select
              id="ms-battery"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.batteryType}
              onChange={set("batteryType")}
            >
              {BATTERY_TYPES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ms-location">
              Where it will stand
            </label>
            <select
              id="ms-location"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.location}
              onChange={set("location")}
            >
              {LOCATIONS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          {field("ms-avg", "Average storage temperature (°C)", "averageTempC", { min: "-40", max: "60", step: "1" }, "Drives the battery self-discharge rate.")}
          {field("ms-min", "Coldest it is likely to get (°C)", "minimumTempC", { min: "-40", max: "60", step: "1" }, "Used for the coolant and lithium checks.")}
          {field("ms-front", "Normal front tyre pressure (psi)", "frontPsi", { min: "1", step: "1" })}
          {field("ms-rear", "Normal rear tyre pressure (psi)", "rearPsi", { min: "1", step: "1" })}
          {field("ms-sidewall", "Sidewall maximum pressure (psi)", "sidewallMaxPsi", { min: "1", step: "1" }, "Moulded on the tyre. The storage pressure is never taken above it.")}
          {field("ms-coolant", "Coolant freeze protection (°C)", "coolantProtectionC", { max: "0", step: "1" }, "A 50/50 ethylene glycol mix is about −37 °C.")}
          <div className="sm:col-span-2 grid gap-2">
            <label className="flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="ms-stands">
              <input
                id="ms-stands"
                type="checkbox"
                className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={form.useStands}
                onChange={setBool("useStands")}
              />
              <span>It will sit on front and rear paddock stands</span>
            </label>
            <label className="flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="ms-ethanol">
              <input
                id="ms-ethanol"
                type="checkbox"
                className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={form.ethanolBlend}
                onChange={setBool("ethanolBlend")}
              />
              <span>The petrol is ethanol-blended (E5, E10 or higher)</span>
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
              Steps for this bike
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${completed} / ${result.totalTasks}` : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.counts.critical} critical, ${result.counts.recommended} recommended, ${result.counts.optional} optional`
                : "Fix the inputs above to build the checklist"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the storage checklist"
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
            ["Standing for", ok ? `${n1(result.weeks)} weeks (${n1(result.months)} months)` : "—"],
            [
              "Battery self-discharge",
              ok && result.battery ? `${n1(result.battery.monthlyRate)}% a month at ${n1(result.averageTempC)} °C` : "—",
            ],
            [
              "Projected charge at the end",
              ok && result.battery ? `${n1(result.battery.projectedSoc)}%` : "—",
            ],
            [
              `Weeks to the ${SULFATION_THRESHOLD_SOC}% threshold`,
              ok && result.battery ? n1(result.battery.weeksToThreshold) : "—",
            ],
            [
              "Storage tyre pressure",
              ok
                ? result.useStands
                  ? `On stands — keep ${n1(result.frontPsi)} / ${n1(result.rearPsi)} psi`
                  : `${n1(result.frontStoragePsi)} psi front, ${n1(result.rearStoragePsi)} psi rear`
                : "—",
            ],
            ["Fuel stabiliser", ok ? (result.needsStabiliser ? "Yes" : "Not needed at this duration") : "—"],
            [
              "Drain the float bowls",
              ok ? (result.needsCarbDrain ? "Yes" : "Not needed — sealed or short stand") : "—",
            ],
            ["Oil change before storing", ok ? (result.needsOilChange ? "Yes" : "Can wait") : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {result.locationNote} {result.battery ? result.battery.note : ""}
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
                    <label className="flex min-h-11 items-start gap-3" htmlFor={`ms-t-${task.id}`}>
                      <input
                        id={`ms-t-${task.id}`}
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
        General guidance, not a substitute for your bike&rsquo;s service manual. Follow the
        manufacturer&rsquo;s figures for pressures, fluids and intervals, and get a mechanic to look
        at anything that has stood for years before you ride it.
      </p>
    </main>
  );
}
