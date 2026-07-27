"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Wind } from "lucide-react";

import {
  FLOORING_PROFILES,
  MINUTES_PER_BATTERY,
  PET_FACTORS,
  recommendVacuum,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DEFAULTS = {
  area: "110",
  areaUnit: "sqm",
  flooring: "medPile",
  pets: "one",
  allergies: false,
  storeys: "2",
  preference: "any",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const PREFERENCES = [
  ["any", "No preference — pick for me"],
  ["cordless", "I want cordless"],
  ["corded", "I want corded"],
  ["robot", "I want a robot"],
];

export default function ToolHome() {
  const [area, setArea] = useState(DEFAULTS.area);
  const [areaUnit, setAreaUnit] = useState(DEFAULTS.areaUnit);
  const [flooring, setFlooring] = useState(DEFAULTS.flooring);
  const [pets, setPets] = useState(DEFAULTS.pets);
  const [allergies, setAllergies] = useState(DEFAULTS.allergies);
  const [storeys, setStoreys] = useState(DEFAULTS.storeys);
  const [preference, setPreference] = useState(DEFAULTS.preference);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      recommendVacuum({
        area,
        areaUnit,
        flooring,
        pets,
        allergies,
        storeys,
        preference,
      }),
    [area, areaUnit, flooring, pets, allergies, storeys, preference],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Vacuum Cleaner Selector",
      `Home: ${NUM.format(result.areaSqm)} m² over ${storeys} level(s)`,
      `Flooring: ${result.flooringLabel}`,
      `Pets: ${result.petLabel}`,
      `Recommended: ${result.primary.label}`,
      `Also worth having: ${result.secondary.label}`,
      `Minimum suction: ${INT.format(result.airWatts)} air watts (corded) or ${INT.format(result.pascals)} Pa (cordless stick)`,
      `Filtration: ${result.filtration}`,
      `Bin / bag capacity: ${NUM.format(result.binLitres)} L or more`,
      `Cleaning time per session: about ${INT.format(result.cleaningMinutes)} minutes`,
      `Battery runtime needed: ${INT.format(result.runtimeMinutes)} minutes (${result.batteries} battery/batteries)`,
      `Cord + hose reach for corded models: ${NUM.format(result.reachMetres)} m`,
    ].join("\n");
  }, [failed, result, storeys]);

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
    setArea(DEFAULTS.area);
    setAreaUnit(DEFAULTS.areaUnit);
    setFlooring(DEFAULTS.flooring);
    setPets(DEFAULTS.pets);
    setAllergies(DEFAULTS.allergies);
    setStoreys(DEFAULTS.storeys);
    setPreference(DEFAULTS.preference);
    setCopied(false);
  };

  const rows = failed
    ? [
        ["Minimum suction (corded, air watts)", DASH],
        ["Minimum sealed suction (cordless stick)", DASH],
        ["Filtration", DASH],
        ["Bin or bag capacity", DASH],
        ["Cleaning time per session", DASH],
        ["Battery runtime needed", DASH],
        ["Batteries to budget for", DASH],
        ["Cord + hose reach (corded models)", DASH],
      ]
    : [
        ["Minimum suction (corded, air watts)", `${INT.format(result.airWatts)} AW`],
        ["Minimum sealed suction (cordless stick)", `${INT.format(result.pascals)} Pa`],
        ["Filtration", result.filtration],
        ["Bin or bag capacity", `${NUM.format(result.binLitres)} L or more`],
        ["Cleaning time per session", `about ${INT.format(result.cleaningMinutes)} min`],
        ["Battery runtime needed", `${INT.format(result.runtimeMinutes)} min`],
        [
          "Batteries to budget for",
          `${result.batteries} × ${MINUTES_PER_BATTERY} min packs`,
        ],
        ["Cord + hose reach (corded models)", `${NUM.format(result.reachMetres)} m`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Wind className="h-4 w-4" aria-hidden="true" />
          Appliance sizing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Vacuum Cleaner Selector</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tell it what your floors are made of and it returns the machine type, the minimum suction
          in air watts and pascals, the filtration grade, bin size and the battery runtime your home
          actually needs.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vac-area">
              Floor area to clean
            </label>
            <input
              id="vac-area"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={area}
              onChange={(event) => setArea(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vac-unit">
              Area unit
            </label>
            <select
              id="vac-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={areaUnit}
              onChange={(event) => setAreaUnit(event.target.value)}
            >
              <option value="sqm">Square metres (m²)</option>
              <option value="sqft">Square feet (ft²)</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="vac-flooring">
              Dominant flooring
            </label>
            <select
              id="vac-flooring"
              className={`mt-2 ${INPUT_CLASS}`}
              value={flooring}
              onChange={(event) => setFlooring(event.target.value)}
            >
              {Object.values(FLOORING_PROFILES).map((profile) => (
                <option key={profile.key} value={profile.key}>
                  {profile.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vac-pets">
              Pets in the home
            </label>
            <select
              id="vac-pets"
              className={`mt-2 ${INPUT_CLASS}`}
              value={pets}
              onChange={(event) => setPets(event.target.value)}
            >
              {Object.values(PET_FACTORS).map((pet) => (
                <option key={pet.key} value={pet.key}>
                  {pet.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vac-storeys">
              Levels to clean
            </label>
            <input
              id="vac-storeys"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="4"
              step="1"
              value={storeys}
              onChange={(event) => setStoreys(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="vac-pref">
              Machine preference
            </label>
            <select
              id="vac-pref"
              className={`mt-2 ${INPUT_CLASS}`}
              value={preference}
              onChange={(event) => setPreference(event.target.value)}
            >
              {PREFERENCES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold"
              htmlFor="vac-allergies"
            >
              <input
                id="vac-allergies"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                checked={allergies}
                onChange={(event) => setAllergies(event.target.checked)}
              />
              Someone in the home has allergies or asthma
            </label>
          </div>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Recommended machine
            </p>
            <p className="mt-1 text-2xl font-semibold leading-snug text-[var(--primary)] sm:text-3xl">
              {failed ? DASH : result.primary.label}
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              {failed ? "Fix the input above to see a recommendation." : result.primary.why}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy vacuum recommendation"
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Worth pairing it with</h2>
            <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">
              {result.secondary.label}
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              {result.secondary.why}
            </p>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">What to check on the spec sheet</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {result.notes.map((note) => (
                <li key={note} className="flex gap-2">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Air watts and pascals measure different things and cannot be converted into each other, so
        both targets are given. Manufacturers also quote runtime in eco mode without a powered head —
        expect roughly half of the headline figure in real use.
      </p>
    </main>
  );
}
