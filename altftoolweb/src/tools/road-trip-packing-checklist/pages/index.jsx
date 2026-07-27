"use client";

import { useMemo, useState } from "react";
import { Backpack, Check, Copy, RotateCcw } from "lucide-react";
import {
  SEASONS,
  TERRAINS,
  WATER_LITRES_PER_PERSON_PER_DAY,
  buildChecklist,
  checklistToText,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  days: "3",
  adults: "2",
  children: "1",
  season: "summer",
  terrain: "hills",
  pets: false,
  nightDriving: false,
  camping: false,
};

const toNumber = (raw) => {
  if (String(raw).trim() === "") return NaN;
  return Number(String(raw).replace(/,/g, "").trim());
};

const slug = (text) =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export default function ToolHome() {
  const [days, setDays] = useState(DEFAULTS.days);
  const [adults, setAdults] = useState(DEFAULTS.adults);
  const [children, setChildren] = useState(DEFAULTS.children);
  const [season, setSeason] = useState(DEFAULTS.season);
  const [terrain, setTerrain] = useState(DEFAULTS.terrain);
  const [pets, setPets] = useState(DEFAULTS.pets);
  const [nightDriving, setNightDriving] = useState(DEFAULTS.nightDriving);
  const [camping, setCamping] = useState(DEFAULTS.camping);
  const [packed, setPacked] = useState({});
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildChecklist({
        days: toNumber(days),
        adults: toNumber(adults),
        children: toNumber(children),
        season,
        terrain,
        pets,
        nightDriving,
        camping,
      }),
    [days, adults, children, season, terrain, pets, nightDriving, camping],
  );

  const failed = Boolean(result.error);

  const packedCount = useMemo(() => {
    if (failed) return 0;
    let count = 0;
    for (const group of result.groups) {
      for (const entry of group.items) {
        if (packed[`${group.id}:${slug(entry.label)}`]) count += 1;
      }
    }
    return count;
  }, [failed, result, packed]);

  const summary = useMemo(() => (failed ? "" : checklistToText(result)), [failed, result]);

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
    setDays(DEFAULTS.days);
    setAdults(DEFAULTS.adults);
    setChildren(DEFAULTS.children);
    setSeason(DEFAULTS.season);
    setTerrain(DEFAULTS.terrain);
    setPets(DEFAULTS.pets);
    setNightDriving(DEFAULTS.nightDriving);
    setCamping(DEFAULTS.camping);
    setPacked({});
    setCopied(false);
  };

  const progress = failed || result.totalItems === 0 ? 0 : (packedCount / result.totalItems) * 100;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Backpack className="h-4 w-4" aria-hidden="true" />
          Road trips
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Road Trip Packing Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A checklist built for your trip rather than a generic list — quantities scale with the number
          of travellers and days, water uses the {WATER_LITRES_PER_PERSON_PER_DAY} litres per person per
          day planning figure, and season and terrain add what they actually need.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="days">
              Trip length (days)
            </label>
            <input
              id="days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="90"
              step="1"
              value={days}
              onChange={(event) => setDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="adults">
              Adults
            </label>
            <input
              id="adults"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="8"
              step="1"
              value={adults}
              onChange={(event) => setAdults(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="children">
              Children
            </label>
            <input
              id="children"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="8"
              step="1"
              value={children}
              onChange={(event) => setChildren(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="season">
              Season
            </label>
            <select
              id="season"
              className={`mt-2 ${INPUT_CLASS}`}
              value={season}
              onChange={(event) => setSeason(event.target.value)}
            >
              {SEASONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="terrain">
              Terrain
            </label>
            <select
              id="terrain"
              className={`mt-2 ${INPUT_CLASS}`}
              value={terrain}
              onChange={(event) => setTerrain(event.target.value)}
            >
              {TERRAINS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          {[
            ["pets", "Travelling with a pet", pets, setPets],
            ["night", "Some of the driving is after dark", nightDriving, setNightDriving],
            ["camping", "Camping or self-catering", camping, setCamping],
          ].map(([id, label, value, setter]) => (
            <div key={id} className="flex min-h-11 items-center gap-3">
              <input
                id={id}
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                checked={value}
                onChange={(event) => setter(event.target.checked)}
              />
              <label className="text-sm font-semibold" htmlFor={id}>
                {label}
              </label>
            </div>
          ))}
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
              Items on your list
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? "—" : result.totalItems}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the highlighted input to build the list."
                : `${result.totalGroups} groups · ${packedCount} ticked off`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the packing checklist"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the checklist" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Travellers", failed ? "—" : `${result.adults} adults, ${result.children} children`],
            ["Trip", failed ? "—" : `${result.tripDays} days · ${result.seasonLabel} · ${result.terrainLabel}`],
            [
              "Drinking water to plan for",
              failed ? "—" : `${result.waterLitres} litres${result.hot ? " (hot-weather uplift applied)" : ""}`,
            ],
            ["Sets of clothes", failed ? "—" : `${result.outfits} across everyone`],
            ["Ticked off", failed ? "—" : `${packedCount} of ${result.totalItems}`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && (
          <div className="mt-5">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`${Math.round(progress)} percent packed`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {Math.round(progress)}% packed
            </p>
          </div>
        )}
      </section>

      {!failed &&
        result.groups.map((group) => (
          <section
            key={group.id}
            className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          >
            <h2 className="text-base font-semibold">{group.title}</h2>
            {group.note && (
              <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{group.note}</p>
            )}
            <ul className="mt-4 grid gap-3">
              {group.items.map((entry) => {
                const key = `${group.id}:${slug(entry.label)}`;
                return (
                  <li key={key} className="flex items-start gap-3">
                    <input
                      id={key}
                      type="checkbox"
                      className="mt-1 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)]"
                      checked={Boolean(packed[key])}
                      onChange={(event) =>
                        setPacked((current) => ({ ...current, [key]: event.target.checked }))
                      }
                    />
                    <label className="text-sm" htmlFor={key}>
                      <span className="font-semibold">{entry.label}</span>
                      {entry.qty !== null && (
                        <span className="ml-2 rounded-md bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--muted-foreground)]">
                          × {entry.qty}
                        </span>
                      )}
                      {entry.note && (
                        <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                          {entry.note}
                        </span>
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A planning aid. Quantities are starting points — adjust for your own appetite, the weather you
        actually meet and what is easy to buy en route. Carry medicines with a prescription, and ask a
        doctor before giving a child any travel-sickness remedy.
      </p>
    </main>
  );
}
