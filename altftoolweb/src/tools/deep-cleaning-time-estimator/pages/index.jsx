"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, SprayCan } from "lucide-react";

import {
  EXTRAS,
  FURNISHING_LEVELS,
  ROOM_TYPES,
  SOIL_LEVELS,
  estimateDeepClean,
  formatDuration,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_ROOMS = {
  bedroom: "2",
  living: "1",
  kitchen: "1",
  bathroom: "2",
  study: "0",
  utility: "0",
  balcony: "1",
  stairs: "0",
};

export default function ToolHome() {
  const [area, setArea] = useState("1000");
  const [rooms, setRooms] = useState(DEFAULT_ROOMS);
  const [soil, setSoil] = useState("normal");
  const [furnishing, setFurnishing] = useState("normal");
  const [pets, setPets] = useState("0");
  const [extras, setExtras] = useState(["fridge"]);
  const [cleaners, setCleaners] = useState("2");
  const [targetHours, setTargetHours] = useState("8");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const numericRooms = {};
    for (const room of ROOM_TYPES) {
      const raw = String(rooms[room.id] ?? "").trim();
      numericRooms[room.id] = raw === "" ? 0 : Number(raw);
    }
    const parse = (raw) => (String(raw).trim() === "" ? NaN : Number(raw));
    return estimateDeepClean({
      areaSqft: parse(area),
      rooms: numericRooms,
      soil,
      furnishing,
      pets: parse(pets),
      extras,
      cleaners: parse(cleaners),
      targetHours: parse(targetHours),
    });
  }, [area, rooms, soil, furnishing, pets, extras, cleaners, targetHours]);

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Deep Cleaning Time Estimate",
      `Home: ${area} sq ft, ${result.roomCount} rooms, ${result.soilLabel.toLowerCase()}`,
      `Total work: ${NUM1.format(result.personHours)} person-hours`,
      `With ${cleaners} cleaner(s): ${formatDuration(result.elapsedMinutes)} elapsed`,
      `Recommended crew to finish in ${targetHours} h: ${result.recommendedCrew ?? "more than 8"}`,
      `Room work ${formatDuration(result.roomMinutes)} · surfaces ${formatDuration(result.areaMinutes)} · extras ${formatDuration(result.extraMinutes)}`,
    ].join("\n");
  }, [ok, result, area, cleaners, targetHours]);

  const setRoom = (id, value) => setRooms((previous) => ({ ...previous, [id]: value }));

  const toggleExtra = (id) => {
    setExtras((previous) =>
      previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id],
    );
  };

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
    setArea("1000");
    setRooms(DEFAULT_ROOMS);
    setSoil("normal");
    setFurnishing("normal");
    setPets("0");
    setExtras(["fridge"]);
    setCleaners("2");
    setTargetHours("8");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <SprayCan className="h-4 w-4" aria-hidden="true" />
          Home upkeep
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Deep Cleaning Time Estimator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Adds up per-room deep-clean times and a surface allowance for your floor area, scales them
          for soil level, clutter and pets, then splits the work across the crew you actually have.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-area">
              Carpet area (sq ft)
            </label>
            <input
              id="dc-area"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="100"
              max="20000"
              step="50"
              value={area}
              onChange={(event) => setArea(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-pets">
              Shedding pets
            </label>
            <input
              id="dc-pets"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="10"
              step="1"
              value={pets}
              onChange={(event) => setPets(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-soil">
              How dirty is it now?
            </label>
            <select
              id="dc-soil"
              className={`mt-2 ${INPUT_CLASS}`}
              value={soil}
              onChange={(event) => setSoil(event.target.value)}
            >
              {SOIL_LEVELS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-furnishing">
              Furnishing density
            </label>
            <select
              id="dc-furnishing"
              className={`mt-2 ${INPUT_CLASS}`}
              value={furnishing}
              onChange={(event) => setFurnishing(event.target.value)}
            >
              {FURNISHING_LEVELS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-cleaners">
              Cleaners available
            </label>
            <input
              id="dc-cleaners"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="8"
              step="1"
              value={cleaners}
              onChange={(event) => setCleaners(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-target">
              Longest day you will work (hours)
            </label>
            <input
              id="dc-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="24"
              step="1"
              value={targetHours}
              onChange={(event) => setTargetHours(event.target.value)}
            />
          </div>
        </div>

        <h2 className="mt-6 text-sm font-semibold">Rooms to clean</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {ROOM_TYPES.map((room) => (
            <div key={room.id}>
              <label className={LABEL_CLASS} htmlFor={`dc-r-${room.id}`}>
                {room.label}
              </label>
              <input
                id={`dc-r-${room.id}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max="30"
                step="1"
                value={rooms[room.id] ?? ""}
                onChange={(event) => setRoom(room.id, event.target.value)}
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{room.minutes} min each</p>
            </div>
          ))}
        </div>

        <fieldset className="mt-6">
          <legend className="text-sm font-semibold">Deep-clean extras</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {EXTRAS.map((extra) => (
              <label
                key={extra.id}
                htmlFor={`dc-e-${extra.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <input
                  id={`dc-e-${extra.id}`}
                  type="checkbox"
                  className="h-4 w-4 shrink-0 accent-[var(--primary)]"
                  checked={extras.includes(extra.id)}
                  onChange={() => toggleExtra(extra.id)}
                />
                <span className="min-w-0">
                  {extra.label}
                  <span className="block text-xs text-[var(--muted-foreground)]">
                    +{extra.minutes} min
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
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
              Time on site with your crew
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? formatDuration(result.elapsedMinutes) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${NUM1.format(result.personHours)} person-hours split across ${cleaners} cleaner(s)`
                : "Fix the inputs above to see an estimate"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy deep cleaning time estimate"
              className={GHOST_BTN}
              disabled={!ok}
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
            ["Total work", ok ? `${NUM1.format(result.personHours)} person-hours` : DASH],
            ["Room-by-room work", ok ? formatDuration(result.roomMinutes) : DASH],
            ["Floors, glass, fans and skirting", ok ? formatDuration(result.areaMinutes) : DASH],
            ["Extras selected", ok ? formatDuration(result.extraMinutes) : DASH],
            ["Condition and clutter multiplier", ok ? `× ${NUM2.format(result.multiplier)}` : DASH],
            [
              "Crew needed to finish in your window",
              ok ? (result.recommendedCrew ? `${result.recommendedCrew} cleaners` : "More than 8 — split over days") : DASH,
            ],
            ["Coverage rate", ok ? `${NUM1.format(result.sqftPerPersonHour)} sq ft per person-hour` : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok ? (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Finish time by crew size</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Cleaners</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Elapsed time</th>
                    <th scope="col" className="py-2 text-right font-semibold">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {result.crewOptions.map((option) => (
                    <tr key={option.cleaners} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{option.cleaners}</td>
                      <td className="py-2 pr-3 text-right">{formatDuration(option.elapsedMinutes)}</td>
                      <td className="py-2 text-right text-[var(--muted-foreground)]">
                        {NUM1.format(option.elapsedHours)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Where the hours go</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Item</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Count</th>
                    <th scope="col" className="py-2 text-right font-semibold">Base time</th>
                  </tr>
                </thead>
                <tbody>
                  {result.roomRows.map((row) => (
                    <tr key={row.id} className="border-b border-[var(--border)]">
                      <td className="py-2 pr-3 font-semibold">{row.label}</td>
                      <td className="py-2 pr-3 text-right">{row.count}</td>
                      <td className="py-2 text-right">{formatDuration(row.minutes)}</td>
                    </tr>
                  ))}
                  {result.extraRows.map((row) => (
                    <tr key={row.id} className="border-b border-[var(--border)]">
                      <td className="py-2 pr-3">{row.label}</td>
                      <td className="py-2 pr-3 text-right">1</td>
                      <td className="py-2 text-right">{formatDuration(row.minutes)}</td>
                    </tr>
                  ))}
                  <tr className="last:border-0">
                    <td className="py-2 pr-3">Whole-home surfaces</td>
                    <td className="py-2 pr-3 text-right">{area} sq ft</td>
                    <td className="py-2 text-right">{formatDuration(result.areaMinutes)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Base times reflect residential deep-clean production rates of roughly 200–300 sq ft per
        cleaner-hour. Crew time assumes a small coordination loss for each extra cleaner and a
        15-minute break every four hours. Real quotes vary with access, water pressure and equipment.
      </p>
    </main>
  );
}
