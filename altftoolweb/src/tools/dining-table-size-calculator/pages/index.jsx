"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Utensils } from "lucide-react";

import {
  CHAIR_CLEARANCE_CM,
  EDGE_PER_DINER_COMFORT_CM,
  EDGE_PER_DINER_MIN_CM,
  SHAPES,
  TABLE_DEPTH_RECOMMENDED_CM,
  WALKWAY_CLEARANCE_CM,
  planDiningTable,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";
const cm = (value) => (Number.isFinite(value) ? `${NUM.format(value)} cm` : DASH);

const DEFAULTS = {
  seats: "6",
  shape: "rectangle",
  edge: String(EDGE_PER_DINER_MIN_CM),
  seatEnds: false,
  walkBehind: false,
  roomLength: "400",
  roomWidth: "300",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [seats, setSeats] = useState(DEFAULTS.seats);
  const [shape, setShape] = useState(DEFAULTS.shape);
  const [edge, setEdge] = useState(DEFAULTS.edge);
  const [seatEnds, setSeatEnds] = useState(DEFAULTS.seatEnds);
  const [walkBehind, setWalkBehind] = useState(DEFAULTS.walkBehind);
  const [roomLength, setRoomLength] = useState(DEFAULTS.roomLength);
  const [roomWidth, setRoomWidth] = useState(DEFAULTS.roomWidth);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      planDiningTable({
        seats: seats.trim() === "" ? NaN : Number(seats),
        shape,
        edgePerDinerCm: edge.trim() === "" ? NaN : Number(edge),
        seatEnds,
        walkBehind,
        roomLengthCm: roomLength.trim() === "" ? NaN : Number(roomLength),
        roomWidthCm: roomWidth.trim() === "" ? NaN : Number(roomWidth),
      }),
    [seats, shape, edge, seatEnds, walkBehind, roomLength, roomWidth],
  );

  const error = plan.error || null;
  const isRound = !error && plan.shape === "round";

  const tableLabel = error
    ? DASH
    : isRound
      ? `${NUM.format(plan.diameterCm)} cm round`
      : `${NUM.format(plan.tableLengthCm)} × ${NUM.format(plan.tableWidthCm)} cm`;

  const summary = useMemo(() => {
    if (error) return "";
    return [
      "Dining Table Size",
      `Seats: ${plan.seats} at ${NUM.format(plan.edgePerDinerCm)} cm of table edge each`,
      `Recommended table: ${tableLabel}`,
      `Footprint with chairs pulled out: ${NUM.format(plan.footprintLengthCm)} × ${NUM.format(plan.footprintWidthCm)} cm`,
      `Chair clearance used: ${NUM.format(plan.clearanceCm)} cm each side`,
      plan.fits
        ? `Fits your room with ${NUM.format(plan.spareLengthCm)} cm and ${NUM.format(plan.spareWidthCm)} cm to spare`
        : "Does not fit the room dimensions entered",
      plan.roomTooNarrow
        ? "The room is too narrow for a usable table depth at this clearance"
        : `Largest table this room takes: ${NUM.format(plan.maxTableLengthCm)} × ${NUM.format(plan.maxTableWidthCm)} cm, seating up to ${plan.roomMaxSeats}`,
    ].join("\n");
  }, [error, plan, tableLabel]);

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
    setSeats(DEFAULTS.seats);
    setShape(DEFAULTS.shape);
    setEdge(DEFAULTS.edge);
    setSeatEnds(DEFAULTS.seatEnds);
    setWalkBehind(DEFAULTS.walkBehind);
    setRoomLength(DEFAULTS.roomLength);
    setRoomWidth(DEFAULTS.roomWidth);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Utensils className="h-4 w-4" aria-hidden="true" />
          Dining layout
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Dining Table Size Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Sizes a table from the run of edge each diner needs, adds the{" "}
          {CHAIR_CLEARANCE_CM} cm of floor a chair needs to be pulled out, and tells you whether the
          whole arrangement fits the room.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dt-seats">
              Seats needed
            </label>
            <input
              id="dt-seats"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="2"
              max="20"
              step="1"
              value={seats}
              onChange={(event) => setSeats(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dt-shape">
              Table shape
            </label>
            <select
              id="dt-shape"
              className={`mt-2 ${INPUT_CLASS}`}
              value={shape}
              onChange={(event) => setShape(event.target.value)}
            >
              {SHAPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dt-edge">
              Table edge per diner (cm)
            </label>
            <input
              id="dt-edge"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="45"
              max="120"
              step="5"
              value={edge}
              onChange={(event) => setEdge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dt-room-length">
              Room length (cm)
            </label>
            <input
              id="dt-room-length"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="10"
              value={roomLength}
              onChange={(event) => setRoomLength(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dt-room-width">
              Room width (cm)
            </label>
            <input
              id="dt-room-width"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="10"
              value={roomWidth}
              onChange={(event) => setRoomWidth(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEdge(String(EDGE_PER_DINER_MIN_CM))}
            className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
          >
            {EDGE_PER_DINER_MIN_CM} cm — standard
          </button>
          <button
            type="button"
            onClick={() => setEdge(String(EDGE_PER_DINER_COMFORT_CM))}
            className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
          >
            {EDGE_PER_DINER_COMFORT_CM} cm — generous
          </button>
        </div>

        <div className="mt-4 grid gap-2">
          {shape === "rectangle" ? (
            <label
              className="flex min-h-11 items-center gap-3 text-sm font-medium text-[var(--foreground)]"
              htmlFor="dt-ends"
            >
              <input
                id="dt-ends"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                checked={seatEnds}
                onChange={(event) => setSeatEnds(event.target.checked)}
              />
              Seat the two short ends as well
            </label>
          ) : null}
          <label
            className="flex min-h-11 items-center gap-3 text-sm font-medium text-[var(--foreground)]"
            htmlFor="dt-walk"
          >
            <input
              id="dt-walk"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
              checked={walkBehind}
              onChange={(event) => setWalkBehind(event.target.checked)}
            />
            People walk behind seated diners ({WALKWAY_CLEARANCE_CM} cm instead of {CHAIR_CLEARANCE_CM} cm)
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Recommended table
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{tableLabel}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error ? DASH : `Seats ${plan.seats} at ${NUM.format(plan.edgePerDinerCm)} cm each`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy dining table plan"
              className={GHOST_BTN}
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
            ["Table top area", error ? DASH : `${NUM2.format(plan.tableAreaSqM)} sq m`],
            [
              "Footprint with chairs pulled out",
              error ? DASH : `${NUM.format(plan.footprintLengthCm)} × ${NUM.format(plan.footprintWidthCm)} cm`,
            ],
            ["Floor area the dining zone needs", error ? DASH : `${NUM2.format(plan.footprintAreaSqM)} sq m`],
            ["Chair clearance on each side", error ? DASH : cm(plan.clearanceCm)],
            [
              "Spare floor length / width",
              error ? DASH : `${NUM.format(plan.spareLengthCm)} / ${NUM.format(plan.spareWidthCm)} cm`,
            ],
            [
              "Largest table this room takes",
              error || plan.roomTooNarrow
                ? DASH
                : `${NUM.format(plan.maxTableLengthCm)} × ${NUM.format(plan.maxTableWidthCm)} cm — up to ${plan.roomMaxSeats} seats`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!error && !plan.fits ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            This table plus chair clearance does not fit the room. Reduce the seat count, drop to{" "}
            {CHAIR_CLEARANCE_CM} cm of clearance, or move to a round table.
          </p>
        ) : null}

        {!error && plan.notes.length > 0 ? (
          <ul className="mt-4 list-disc space-y-1 pl-5 text-xs leading-5 text-[var(--muted-foreground)]">
            {plan.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Standard dining dimensions</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Dimension</th>
                <th scope="col" className="py-2 text-right font-semibold">Standard</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Table top height", `${error ? DASH : plan.tableHeightCm} cm`],
                ["Chair seat height", `${error ? DASH : plan.chairSeatHeightCm} cm`],
                ["Knee clearance under the apron", `${error ? DASH : plan.kneeClearanceCm} cm`],
                ["Table depth for facing diners", `${TABLE_DEPTH_RECOMMENDED_CM} cm`],
                ["Table edge per diner", `${EDGE_PER_DINER_MIN_CM}–${EDGE_PER_DINER_COMFORT_CM} cm`],
                ["Chair pull-out clearance", `${CHAIR_CLEARANCE_CM} cm`],
                ["Clearance with a walkway behind", `${WALKWAY_CLEARANCE_CM} cm`],
              ].map(([label, value]) => (
                <tr key={label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{label}</td>
                  <td className="py-2 text-right font-semibold">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Figures are furniture-planning conventions, not a code requirement. Bench seating, pedestal
        bases and extendable leaves all change the usable edge, so measure the actual table before
        committing to a room layout.
      </p>
    </main>
  );
}
