"use client";

import { useMemo, useState } from "react";
import { Check, Copy, LampDesk, RotateCcw } from "lucide-react";
import {
  AMBIENT_LUX_TARGET,
  CHAIR_CLEARANCE_MM,
  TASK_LUX_TARGET,
  WALKWAY_MM,
  planStudyRoom,
} from "../lib";

const DEFAULTS = {
  length: "3.6",
  width: "3",
  users: "1",
  books: "200",
  height: "170",
  lumens: "1200",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

const num = (value, decimals = 2) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: decimals }).format(value);
const mm = (value) => `${num(value, 0)} mm`;
const metres = (value) => `${num(value, 2)} m`;

export default function ToolHome() {
  const [length, setLength] = useState(DEFAULTS.length);
  const [width, setWidth] = useState(DEFAULTS.width);
  const [users, setUsers] = useState(DEFAULTS.users);
  const [books, setBooks] = useState(DEFAULTS.books);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [lumens, setLumens] = useState(DEFAULTS.lumens);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      planStudyRoom({
        lengthM: toNumber(length),
        widthM: toNumber(width),
        users: toNumber(users),
        books: toNumber(books),
        userHeightCm: toNumber(height),
        fixtureLumens: toNumber(lumens),
      }),
    [length, width, users, books, height, lumens],
  );

  const error = plan.error || "";

  const summary = useMemo(() => {
    if (error) return "";
    return [
      "Study room plan",
      `Room: ${metres(toNumber(length))} x ${metres(toNumber(width))} = ${num(plan.floorArea)} m²`,
      `Desk run for ${toNumber(users)} person(s): ${mm(plan.deskWidthMm)} wide x ${mm(plan.deskDepthMm)} deep`,
      `Desk + chair zone off the wall: ${mm(plan.zoneDepthMm)}`,
      `Ambient light: ${num(plan.ambientLumens, 0)} lm total (~${plan.ceilingFittings} fittings)`,
      `Task light at the desk: ${num(plan.taskLumensPerUser, 0)} lm per person`,
      `Shelving: ${num(plan.shelfLengthM)} m of shelf, ${plan.shelvesNeeded} shelves, ${plan.baysNeeded} bay(s)`,
      `Desk height: ${mm(plan.deskHeightMm)}, seat height: ${mm(plan.seatHeightMm)}`,
    ].join("\n");
  }, [error, length, width, users, plan]);

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
    setLength(DEFAULTS.length);
    setWidth(DEFAULTS.width);
    setUsers(DEFAULTS.users);
    setBooks(DEFAULTS.books);
    setHeight(DEFAULTS.height);
    setLumens(DEFAULTS.lumens);
    setCopied(false);
  };

  const fields = [
    ["study-length", "Room length (m)", length, setLength, { min: "0.5", max: "30", step: "0.1" }],
    ["study-width", "Room width (m)", width, setWidth, { min: "0.5", max: "30", step: "0.1" }],
    ["study-users", "People studying here", users, setUsers, { min: "1", max: "6", step: "1" }],
    ["study-books", "Books to store", books, setBooks, { min: "0", max: "5000", step: "10" }],
    ["study-height", "Main user's height (cm)", height, setHeight, { min: "100", max: "220", step: "1" }],
    ["study-lumens", "Lumens per ceiling fitting", lumens, setLumens, { min: "100", max: "20000", step: "100" }],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <LampDesk className="h-4 w-4" aria-hidden="true" />
          Space planning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Study Room Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Give the room's dimensions and this works out the desk run, the clearance the chair needs,
          how much shelving the books take and how many lumens the room and the desk should get.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map(([id, label, value, setter, attrs]) => (
            <div key={id}>
              <label className={LABEL_CLASS} htmlFor={id}>
                {label}
              </label>
              <input
                id={id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                value={value}
                onChange={(event) => {
                  setter(event.target.value);
                  setCopied(false);
                }}
                {...attrs}
              />
            </div>
          ))}
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Desk and chair zone off the wall
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]" aria-live="polite">
              {error ? DASH : mm(plan.zoneDepthMm)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error
                ? "Fix the highlighted input to see a result."
                : `${mm(plan.deskDepthMm)} of desk plus ${mm(CHAIR_CLEARANCE_MM)} for the chair`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the study room plan"
              className={GHOST_BTN}
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
            ["Floor area", error ? DASH : `${num(plan.floorArea)} m²`],
            ["Floor area per person", error ? DASH : `${num(plan.areaPerUser)} m²`],
            ["Desk run needed (comfortable)", error ? DASH : mm(plan.deskWidthMm)],
            ["Desk run at the tight minimum", error ? DASH : mm(plan.deskWidthMinMm)],
            ["Longest wall available", error ? DASH : metres(plan.longWallM)],
            ["Seats the long wall can take", error ? DASH : plan.usersThatFit],
            ["Space left in front of the chair", error ? DASH : mm(Math.max(0, plan.remainingDepthMm))],
            ["Desk height for this user", error ? DASH : mm(plan.deskHeightMm)],
            ["Seat height for this user", error ? DASH : mm(plan.seatHeightMm)],
            [
              "Eye-to-screen distance",
              error ? DASH : `${mm(plan.screenDistanceMinMm)} to ${mm(plan.screenDistanceMaxMm)}`,
            ],
          ].map(([label, shown]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{shown}</dd>
            </div>
          ))}
        </dl>

        {!error && !plan.deskFits ? (
          <p
            aria-live="polite"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            A comfortable desk for {toNumber(users)} people needs {mm(plan.deskWidthMm)} of wall and
            the longest wall is only {metres(plan.longWallM)}. Drop to{" "}
            {plan.usersThatFit || 1} seat(s), use an L-shaped layout, or plan a narrower desk per
            person.
          </p>
        ) : null}

        {!error && !plan.walkwayOk ? (
          <p
            aria-live="polite"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            Once the desk and pushed-back chair take {mm(plan.zoneDepthMm)}, less than the{" "}
            {mm(WALKWAY_MM)} walkway is left across the room. Consider a wall-mounted or shallower
            desk top.
          </p>
        ) : null}

        {!error && plan.cramped ? (
          <p
            aria-live="polite"
            className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning-text)]"
          >
            Only {num(plan.areaPerUser)} m² per person — this room is tight for the number of people
            you've set. Aim for at least 3.5 m² per person for a comfortable study space.
          </p>
        ) : null}
      </section>

      <section className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Lighting</h2>
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            {[
              [`Ambient target (${AMBIENT_LUX_TARGET} lux)`, error ? DASH : `${num(plan.ambientLumens, 0)} lm`],
              ["Ceiling fittings needed", error ? DASH : plan.ceilingFittings],
              [`Desk task light (${TASK_LUX_TARGET} lux)`, error ? DASH : `${num(plan.taskLumensPerUser, 0)} lm each`],
              ["Task area covered", error ? DASH : `${num(plan.taskAreaM2)} m²`],
            ].map(([label, shown]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{shown}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Shelving</h2>
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            {[
              ["Shelf length for the books", error ? DASH : `${num(plan.shelfLengthM)} m`],
              ["Shelves at 900 mm each", error ? DASH : plan.shelvesNeeded],
              ["Bookcase bays (5 shelves each)", error ? DASH : plan.baysNeeded],
              ["Wall length the bays need", error ? DASH : mm(plan.wallLengthForShelvingMm)],
            ].map(([label, shown]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{shown}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Where the numbers come from</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Lighting uses the lumen method — lux times floor area, divided by a utilisation factor and
          a maintenance factor — with {AMBIENT_LUX_TARGET} lux general light and {TASK_LUX_TARGET}{" "}
          lux on the desk, the levels interior lighting standards set for reading and writing. Desk
          and chair figures are the ergonomic minimums used in furniture layout: 600 mm of desk depth
          for a monitor, 750 mm for comfort, {mm(CHAIR_CLEARANCE_MM)} behind the desk edge for the
          chair, and {mm(WALKWAY_MM)} for a walkway. Shelving assumes a 30 mm book spine, so a metre
          of shelf takes about 33 books.
        </p>
      </section>
    </main>
  );
}
