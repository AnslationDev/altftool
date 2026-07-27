"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Flame, RotateCcw } from "lucide-react";
import { DIRECTION_NOTES, LAMP_HEADROOM_MM, planPujaRoom } from "../lib";

const DEFAULTS = {
  direction: "north-east",
  idols: "3",
  idolWidth: "150",
  idolDepth: "150",
  idolHeight: "300",
  personHeight: "165",
  posture: "floor",
  devotees: "2",
  items: "20",
  width: "1200",
  depth: "2100",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold";

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

export default function ToolHome() {
  const [direction, setDirection] = useState(DEFAULTS.direction);
  const [idols, setIdols] = useState(DEFAULTS.idols);
  const [idolWidth, setIdolWidth] = useState(DEFAULTS.idolWidth);
  const [idolDepth, setIdolDepth] = useState(DEFAULTS.idolDepth);
  const [idolHeight, setIdolHeight] = useState(DEFAULTS.idolHeight);
  const [personHeight, setPersonHeight] = useState(DEFAULTS.personHeight);
  const [posture, setPosture] = useState(DEFAULTS.posture);
  const [devotees, setDevotees] = useState(DEFAULTS.devotees);
  const [items, setItems] = useState(DEFAULTS.items);
  const [width, setWidth] = useState(DEFAULTS.width);
  const [depth, setDepth] = useState(DEFAULTS.depth);
  const [underStaircase, setUnderStaircase] = useState(false);
  const [toiletWall, setToiletWall] = useState(false);
  const [inBedroom, setInBedroom] = useState(false);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      planPujaRoom({
        direction,
        idolCount: toNumber(idols),
        idolWidthMm: toNumber(idolWidth),
        idolDepthMm: toNumber(idolDepth),
        idolHeightMm: toNumber(idolHeight),
        devoteeHeightCm: toNumber(personHeight),
        posture,
        devotees: toNumber(devotees),
        itemsToStore: toNumber(items),
        availableWidthMm: toNumber(width),
        availableDepthMm: toNumber(depth),
        underStaircase,
        sharesToiletWall: toiletWall,
        insideBedroom: inBedroom,
      }),
    [
      direction,
      idols,
      idolWidth,
      idolDepth,
      idolHeight,
      personHeight,
      posture,
      devotees,
      items,
      width,
      depth,
      underStaircase,
      toiletWall,
      inBedroom,
    ],
  );

  const error = plan.error || "";

  const summary = useMemo(() => {
    if (error) return "";
    return [
      "Puja room plan",
      `Placement: ${plan.zone.label}`,
      `Shrine: ${mm(plan.shrineWidthMm)} wide x ${mm(plan.shrineDepthMm)} deep`,
      `Platform top (idol face at eye level): ${mm(plan.platformHeightMm)}`,
      `Seating: ${plan.seatingRows} row(s), ${mm(plan.seatingDepthMm)} deep`,
      `Total depth needed: ${mm(plan.totalDepthMm)}`,
      `Storage shelves: ${plan.shelvesNeeded}`,
      `Deity faces ${plan.deityFacing.toLowerCase()}; you face ${plan.devoteeFacing.toLowerCase()}`,
    ].join("\n");
  }, [error, plan]);

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
    setDirection(DEFAULTS.direction);
    setIdols(DEFAULTS.idols);
    setIdolWidth(DEFAULTS.idolWidth);
    setIdolDepth(DEFAULTS.idolDepth);
    setIdolHeight(DEFAULTS.idolHeight);
    setPersonHeight(DEFAULTS.personHeight);
    setPosture(DEFAULTS.posture);
    setDevotees(DEFAULTS.devotees);
    setItems(DEFAULTS.items);
    setWidth(DEFAULTS.width);
    setDepth(DEFAULTS.depth);
    setUnderStaircase(false);
    setToiletWall(false);
    setInBedroom(false);
    setCopied(false);
  };

  const numberFields = [
    ["puja-idols", "Number of idols or frames", idols, setIdols, { min: "1", max: "12", step: "1" }],
    ["puja-idol-width", "Widest idol — width (mm)", idolWidth, setIdolWidth, { min: "10", step: "10" }],
    ["puja-idol-depth", "Widest idol — depth (mm)", idolDepth, setIdolDepth, { min: "10", step: "10" }],
    ["puja-idol-height", "Tallest idol — height (mm)", idolHeight, setIdolHeight, { min: "10", step: "10" }],
    ["puja-person", "Your standing height (cm)", personHeight, setPersonHeight, { min: "100", max: "220", step: "1" }],
    ["puja-devotees", "People praying together", devotees, setDevotees, { min: "1", max: "12", step: "1" }],
    ["puja-items", "Puja items to store", items, setItems, { min: "0", step: "1" }],
    ["puja-width", "Width available (mm)", width, setWidth, { min: "100", step: "50" }],
    ["puja-depth", "Depth available (mm)", depth, setDepth, { min: "100", step: "50" }],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Flame className="h-4 w-4" aria-hidden="true" />
          Puja space
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Puja Room Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out how wide and deep the shrine has to be, how high the platform should sit so the
          deity's face meets your eye level, how much seating depth the family needs, and what the
          traditional placement guidance says about the spot you have in mind.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="puja-direction">
              Where in the home
            </label>
            <select
              id="puja-direction"
              className={`mt-2 ${INPUT_CLASS}`}
              value={direction}
              onChange={(event) => setDirection(event.target.value)}
            >
              {DIRECTION_NOTES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="puja-posture">
              How you pray
            </label>
            <select
              id="puja-posture"
              className={`mt-2 ${INPUT_CLASS}`}
              value={posture}
              onChange={(event) => setPosture(event.target.value)}
            >
              <option value="floor">Seated on the floor</option>
              <option value="standing">Standing</option>
            </select>
          </div>
          {numberFields.map(([id, label, value, setter, attrs]) => (
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

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className={CHECK_ROW} htmlFor="puja-stairs">
            <input
              id="puja-stairs"
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={underStaircase}
              onChange={(event) => setUnderStaircase(event.target.checked)}
            />
            Under a staircase
          </label>
          <label className={CHECK_ROW} htmlFor="puja-toilet">
            <input
              id="puja-toilet"
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={toiletWall}
              onChange={(event) => setToiletWall(event.target.checked)}
            />
            Shares a bathroom wall
          </label>
          <label className={CHECK_ROW} htmlFor="puja-bedroom">
            <input
              id="puja-bedroom"
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={inBedroom}
              onChange={(event) => setInBedroom(event.target.checked)}
            />
            Inside a bedroom
          </label>
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
              Platform height for the idols
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {error ? DASH : mm(plan.platformHeightMm)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error
                ? "Fix the highlighted input to see a result."
                : `Puts the idol's face at your ${mm(plan.eyeHeightMm)} eye level`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the puja room plan"
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

        {!error && plan.idolReachesEyeLevelUnaided ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            This idol is tall enough to meet your eye level standing on the shrine floor, so no raised
            platform is needed — a low base of 50 to 100 mm is enough to keep it clear of spills.
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Shrine width", error ? DASH : mm(plan.shrineWidthMm)],
            ["Shrine depth (idol plus offering zone)", error ? DASH : mm(plan.shrineDepthMm)],
            ["Your eye level in this posture", error ? DASH : mm(plan.eyeHeightMm)],
            ["Seating rows for the family", error ? DASH : plan.seatingRows],
            ["Seating depth", error ? DASH : mm(plan.seatingDepthMm)],
            ["Seating width used", error ? DASH : mm(plan.seatingWidthMm)],
            ["Total depth: shrine, seating, standing room", error ? DASH : mm(plan.totalDepthMm)],
            ["Floor area this takes", error ? DASH : `${num(plan.footprintM2)} m²`],
            ["Storage shelves or drawers", error ? DASH : plan.shelvesNeeded],
            ["Clear height above the lamp", error ? DASH : mm(plan.lampHeadroomMm)],
            ["Idols face", error ? DASH : plan.deityFacing],
            ["You face", error ? DASH : plan.devoteeFacing],
          ].map(([label, shown]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{shown}</dd>
            </div>
          ))}
        </dl>

        {!error && plan.widthFits && plan.depthFits ? (
          <p className="mt-4 rounded-md bg-[var(--success-soft)] px-3 py-2 text-sm font-medium text-[var(--success)]">
            The shrine, the seating and room to stand up all fit inside the space you entered.
          </p>
        ) : null}

        {!error && plan.cautions.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {plan.cautions.map((caution) => (
              <li
                key={caution}
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {caution}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Placement, direction by direction</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Zone</th>
                <th scope="col" className="py-2 font-semibold">Traditional note</th>
              </tr>
            </thead>
            <tbody>
              {DIRECTION_NOTES.map((entry) => (
                <tr
                  key={entry.id}
                  className={`border-b border-[var(--border)] last:border-0 ${
                    entry.id === direction ? "bg-[var(--muted)]" : ""
                  }`}
                >
                  <td className="py-2 pr-3 font-semibold">{entry.label}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{entry.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          The dimensions above are geometry — idol sizes, eye level and mat sizes. The direction notes
          record widely followed Vastu convention and are offered as information about that tradition,
          not as a ruling on what your home must do. Keep at least {mm(LAMP_HEADROOM_MM)} of clear
          height above any oil lamp, make sure the space can be ventilated, and never leave a lamp or
          agarbatti burning unattended.
        </p>
      </section>
    </main>
  );
}
