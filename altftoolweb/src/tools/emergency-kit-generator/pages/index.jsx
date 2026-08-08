"use client";

import { useMemo, useState } from "react";
import { BriefcaseMedical, Check, Copy, RotateCcw } from "lucide-react";

import {
  HAZARDS,
  MODES,
  ROTATION_MONTHS,
  WATER_L_PER_PERSON_DAY,
  buildEmergencyKit,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const num0 = (v) => (Number.isFinite(v) ? NUM0.format(v) : DASH);
const num1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);

const ROTATION_LABEL = {
  water: "Replace stored water",
  food: "Check food dates",
  batteries: "Test and replace batteries",
  medicines: "Check medicine expiry",
  documents: "Refresh document copies",
};

const DEFAULTS = {
  adults: "2",
  children: "1",
  infants: "0",
  pets: "0",
  days: "3",
  mode: "evacuate",
  hotClimate: false,
  hazards: ["flood"],
  packDate: "",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toInt = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? Math.round(value) : NaN;
};

export default function ToolHome() {
  const [adults, setAdults] = useState(DEFAULTS.adults);
  const [children, setChildren] = useState(DEFAULTS.children);
  const [infants, setInfants] = useState(DEFAULTS.infants);
  const [pets, setPets] = useState(DEFAULTS.pets);
  const [days, setDays] = useState(DEFAULTS.days);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [hotClimate, setHotClimate] = useState(DEFAULTS.hotClimate);
  const [hazards, setHazards] = useState(DEFAULTS.hazards);
  const [packDate, setPackDate] = useState(DEFAULTS.packDate);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildEmergencyKit({
        adults: toInt(adults),
        children: toInt(children),
        infants: toInt(infants),
        pets: toInt(pets),
        days: toInt(days),
        mode,
        hotClimate,
        hazards,
        packDateIso: packDate || null,
      }),
    [adults, children, infants, pets, days, mode, hotClimate, hazards, packDate],
  );

  const failed = Boolean(result.error);

  const toggleHazard = (id) =>
    setHazards((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const selectMode = (id) => {
    setMode(id);
    const preset = MODES.find((entry) => entry.id === id);
    if (preset) setDays(String(preset.defaultDays));
  };

  const summary = useMemo(() => {
    if (failed) return "";
    const lines = [
      "Emergency Kit",
      `${result.people} people, ${result.pets} pets, ${result.days} days, ${MODES.find((m) => m.id === result.mode).label}`,
      `Water: ${num1(result.waterL)} litres (${num1(result.waterKg)} kg)`,
      `Food: ${num0(result.totalKcal)} kcal, about ${num1(result.foodKg)} kg`,
      `Total pack weight: ${num1(result.totalKg)} kg, ${num1(result.perPersonKg)} kg per person`,
      result.verdict,
      "",
    ];
    for (const group of result.byCategory) {
      lines.push(`${group.category}:`);
      for (const item of group.items) lines.push(`  - ${item.name}: ${item.quantity}`);
    }
    for (const hazard of result.hazardKits) {
      lines.push("", `${hazard.label} extras:`);
      for (const [name] of hazard.items) lines.push(`  - ${name}`);
    }
    if (result.rotations.length > 0) {
      lines.push("", "Rotation dates:");
      for (const row of result.rotations) {
        lines.push(`  - ${ROTATION_LABEL[row.item] ?? row.item}: every ${row.months} months, next due ${row.dueIso}`);
      }
    }
    return lines.join("\n");
  }, [failed, result]);

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
    setAdults(DEFAULTS.adults);
    setChildren(DEFAULTS.children);
    setInfants(DEFAULTS.infants);
    setPets(DEFAULTS.pets);
    setDays(DEFAULTS.days);
    setMode(DEFAULTS.mode);
    setHotClimate(DEFAULTS.hotClimate);
    setHazards(DEFAULTS.hazards);
    setPackDate(DEFAULTS.packDate);
    setCopied(false);
  };

  const numberFields = [
    ["ek-adults", "Adults", adults, setAdults],
    ["ek-children", "Children (4–12)", children, setChildren],
    ["ek-infants", "Infants (under 2)", infants, setInfants],
    ["ek-pets", "Pets", pets, setPets],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BriefcaseMedical className="h-4 w-4" aria-hidden="true" />
          Preparedness
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Emergency Kit Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Sized from the published baselines: {WATER_L_PER_PERSON_DAY} litres of water per person
          per day, three days for a go-bag and two weeks for supplies kept at home, plus the extras
          that only matter for the hazards where you live.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {numberFields.map(([id, label, value, setter]) => (
            <div key={id}>
              <label className={LABEL_CLASS} htmlFor={id}>
                {label}
              </label>
              <input
                id={id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={value}
                onChange={(event) => setter(event.target.value)}
              />
            </div>
          ))}

          <div>
            <label className={LABEL_CLASS} htmlFor="ek-mode">
              Kit type
            </label>
            <select
              id="ek-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => selectMode(event.target.value)}
            >
              {MODES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>{MODES.find((entry) => entry.id === mode).note}</p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ek-days">
              Days of cover
            </label>
            <input
              id="ek-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="60"
              step="1"
              value={days}
              onChange={(event) => setDays(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="ek-date">
              Date packed (optional)
            </label>
            <input
              id="ek-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={packDate}
              onChange={(event) => setPackDate(event.target.value)}
            />
            <p className={HINT_CLASS}>Sets the rotation reminders for water, food and batteries.</p>
          </div>

          <div className="flex items-end">
            <label
              htmlFor="ek-hot"
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            >
              <input
                id="ek-hot"
                type="checkbox"
                className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={hotClimate}
                onChange={() => setHotClimate((prev) => !prev)}
              />
              <span>Hot climate or summer (adds 50% water)</span>
            </label>
          </div>

          <fieldset className="sm:col-span-2">
            <legend className={LABEL_CLASS}>Hazards where you live</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {HAZARDS.map((hazard) => (
                <label
                  key={hazard.id}
                  htmlFor={`ek-haz-${hazard.id}`}
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                >
                  <input
                    id={`ek-haz-${hazard.id}`}
                    type="checkbox"
                    className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                    checked={hazards.includes(hazard.id)}
                    onChange={() => toggleHazard(hazard.id)}
                  />
                  <span>{hazard.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Water to store
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${num1(result.waterL)} L`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the household numbers above."
                : `${result.people} people and ${result.pets} pets for ${result.days} days`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy the full kit list"
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

        {!failed && (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
            {result.verdict}
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Food energy needed", failed ? DASH : `${num0(result.totalKcal)} kcal`],
            ["Food weight", failed ? DASH : `${num1(result.foodKg)} kg`],
            ["Water weight", failed ? DASH : `${num1(result.waterKg)} kg`],
            ["Gear, clothing and documents", failed ? DASH : `${num1(result.gearKg)} kg`],
            ["Total kit weight", failed ? DASH : `${num1(result.totalKg)} kg`],
            ["Per person", failed ? DASH : `${num1(result.perPersonKg)} kg`],
            ["Water as a share of the weight", failed ? DASH : `${num0(result.waterSharePct)} %`],
            ["Items on the list", failed ? DASH : num0(result.itemCount)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed &&
        result.byCategory.map((group) => (
          <section
            key={group.category}
            className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          >
            <h2 className="text-base font-semibold">{group.category}</h2>
            <ul className="mt-3 space-y-3">
              {group.items.map((item) => (
                <li key={item.id} className="border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="rounded-full bg-[var(--muted)] px-2.5 py-0.5 text-xs font-bold text-[var(--primary)]">
                      {item.quantity}
                    </p>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{item.why}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}

      {!failed &&
        result.hazardKits.map((hazard) => (
          <section
            key={hazard.id}
            className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          >
            <h2 className="text-base font-semibold">{hazard.label} — extras</h2>
            <ul className="mt-3 space-y-3">
              {hazard.items.map(([name, why]) => (
                <li key={name} className="border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
                  <p className="text-sm font-semibold">{name}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{why}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}

      {!failed && result.rotations.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Rotation dates</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            A kit that is never rotated is a kit of expired food and flat batteries. Stored water
            goes every {ROTATION_MONTHS.water} months.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Task
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Every
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Next due
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rotations.map((row) => (
                  <tr key={row.item} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 align-top font-semibold">
                      {ROTATION_LABEL[row.item] ?? row.item}
                    </td>
                    <td className="py-2 pr-3 align-top whitespace-nowrap text-[var(--muted-foreground)]">
                      {row.months} months
                    </td>
                    <td className="py-2 align-top whitespace-nowrap">{row.dueIso}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        General preparedness information based on published FEMA, Red Cross and national disaster
        authority baselines, not instructions for a live incident — during one, follow your local
        authority. Anyone with a medical condition, a mobility need or an infant should plan their
        own additions with a doctor rather than relying on a generic list.
      </p>
    </main>
  );
}
