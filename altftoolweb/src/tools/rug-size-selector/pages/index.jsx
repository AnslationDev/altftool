"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sofa } from "lucide-react";

import { PLACEMENTS, recommendRug } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);

const ROOM_TYPES = [
  { id: "living", label: "Living room" },
  { id: "dining", label: "Dining room" },
  { id: "bedroom", label: "Bedroom" },
];

const FURNITURE_LABELS = {
  living: { width: "Sofa width", depth: "Sofa depth" },
  dining: { width: "Table length", depth: "Table width" },
  bedroom: { width: "Bed width (mattress)", depth: "Bed length (mattress)" },
};

const BORDER_TEXT = {
  ideal: "Leaves a comfortable border of bare floor to the walls",
  tight: "Fits, but the border of bare floor is tighter than the usual 45 cm",
  toobig: "Too big for this room — it would run almost to the walls",
  none: "No standard size is large enough for these clearances",
};

const DEFAULTS = {
  roomType: "living",
  placement: "frontLegs",
  unit: "cm",
  furnitureWidth: "220",
  furnitureDepth: "90",
  zoneDepth: "300",
  roomWidth: "450",
  roomLength: "550",
};

const FIELD =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_ON =
  "min-h-11 rounded-md border border-[var(--primary)] bg-[var(--primary)]/10 px-3 text-sm font-semibold text-[var(--foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [roomType, setRoomType] = useState(DEFAULTS.roomType);
  const [placement, setPlacement] = useState(DEFAULTS.placement);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [furnitureWidth, setFurnitureWidth] = useState(DEFAULTS.furnitureWidth);
  const [furnitureDepth, setFurnitureDepth] = useState(DEFAULTS.furnitureDepth);
  const [zoneDepth, setZoneDepth] = useState(DEFAULTS.zoneDepth);
  const [roomWidth, setRoomWidth] = useState(DEFAULTS.roomWidth);
  const [roomLength, setRoomLength] = useState(DEFAULTS.roomLength);
  const [copied, setCopied] = useState(false);

  const placements = PLACEMENTS[roomType] ?? PLACEMENTS.living;

  const result = useMemo(
    () =>
      recommendRug({
        roomType,
        placement,
        furnitureWidth: toNumber(furnitureWidth),
        furnitureDepth: toNumber(furnitureDepth),
        zoneDepth: toNumber(zoneDepth),
        roomWidth: toNumber(roomWidth),
        roomLength: toNumber(roomLength),
        unit,
      }),
    [roomType, placement, furnitureWidth, furnitureDepth, zoneDepth, roomWidth, roomLength, unit],
  );

  const failed = Boolean(result.error);
  const noPick = !failed && !result.pickLabel;

  const changeRoomType = (nextType) => {
    setRoomType(nextType);
    const nextPlacements = PLACEMENTS[nextType] ?? PLACEMENTS.living;
    setPlacement(nextPlacements[0].id);
  };

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Rug size recommendation",
      `Room: ${roomType}, ${num(result.roomWidthCm)} x ${num(result.roomLengthCm)} cm`,
      `Placement: ${result.placementNote}`,
      `Rug must cover at least ${num(result.requiredWidthCm)} x ${num(result.requiredLengthCm)} cm (${num(result.requiredShortFt)} x ${num(result.requiredLongFt)} ft)`,
      result.pickLabel
        ? `Buy: ${result.pickCount > 1 ? `${result.pickCount} x ` : ""}${result.pickLabel} (${num(result.pickShortCm)} x ${num(result.pickLongCm)} cm)`
        : "No standard size meets these clearances — a custom rug is needed",
      result.pickLabel
        ? `Bare floor left: ${num(result.borderShortCm)} cm across, ${num(result.borderLongCm)} cm along`
        : "",
      result.alternativeLabel ? `Better fit for the room: ${result.alternativeLabel}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [failed, result, roomType]);

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
    setRoomType(DEFAULTS.roomType);
    setPlacement(DEFAULTS.placement);
    setUnit(DEFAULTS.unit);
    setFurnitureWidth(DEFAULTS.furnitureWidth);
    setFurnitureDepth(DEFAULTS.furnitureDepth);
    setZoneDepth(DEFAULTS.zoneDepth);
    setRoomWidth(DEFAULTS.roomWidth);
    setRoomLength(DEFAULTS.roomLength);
    setCopied(false);
  };

  const rows = [
    ["Room", failed ? DASH : `${num(result.roomWidthCm)} x ${num(result.roomLengthCm)} cm`],
    [
      "Furniture",
      failed ? DASH : `${num(result.furnitureWidthCm)} x ${num(result.furnitureDepthCm)} cm`,
    ],
    [
      "Seating zone depth",
      failed || roomType !== "living" ? DASH : `${num(result.zoneDepthCm)} cm`,
    ],
    [
      "Minimum rug coverage",
      failed ? DASH : `${num(result.requiredWidthCm)} x ${num(result.requiredLengthCm)} cm`,
    ],
    [
      "That is, in feet",
      failed ? DASH : `${num(result.requiredShortFt)} x ${num(result.requiredLongFt)} ft`,
    ],
    ["Standard size to buy", failed || noPick ? DASH : result.pickLabel],
    [
      "Actual rug size",
      failed || noPick ? DASH : `${num(result.pickShortCm)} x ${num(result.pickLongCm)} cm`,
    ],
    ["How many", failed || noPick ? DASH : `${result.pickCount}`],
    ["Bare floor across the room", failed || noPick ? DASH : `${num(result.borderShortCm)} cm`],
    ["Bare floor along the room", failed || noPick ? DASH : `${num(result.borderLongCm)} cm`],
    ["Border verdict", failed ? DASH : BORDER_TEXT[result.borderVerdict]],
    [
      "Larger size the room could take",
      failed || !result.largestThatFitsLabel ? DASH : result.largestThatFitsLabel,
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Sofa className="h-4 w-4" aria-hidden="true" />
          Furnishing
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Rug Size Selector</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Rug size is a clearance rule, not a guess. Enter the furniture and the room, choose how you want
          the rug to sit, and get the standard size that satisfies it.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Room</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {ROOM_TYPES.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={roomType === item.id}
              className={roomType === item.id ? CHIP_ON : CHIP}
              onClick={() => changeRoomType(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { id: "cm", label: "Centimetres" },
            { id: "ft", label: "Feet" },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={unit === option.id}
              className={unit === option.id ? CHIP_ON : CHIP}
              onClick={() => setUnit(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="rs-roomw">
              Room width ({unit})
            </label>
            <input
              id="rs-roomw"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={roomWidth}
              onChange={(event) => setRoomWidth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="rs-rooml">
              Room length ({unit})
            </label>
            <input
              id="rs-rooml"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={roomLength}
              onChange={(event) => setRoomLength(event.target.value)}
            />
          </div>
        </div>

        <h2 className="mt-6 text-base font-semibold">Furniture</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="rs-fw">
              {FURNITURE_LABELS[roomType].width} ({unit})
            </label>
            <input
              id="rs-fw"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={furnitureWidth}
              onChange={(event) => setFurnitureWidth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="rs-fd">
              {FURNITURE_LABELS[roomType].depth} ({unit})
            </label>
            <input
              id="rs-fd"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={furnitureDepth}
              onChange={(event) => setFurnitureDepth(event.target.value)}
            />
          </div>
          {roomType === "living" && (
            <div className="sm:col-span-2">
              <label className={LABEL} htmlFor="rs-zone">
                Seating zone depth — back of sofa to the back of the piece opposite ({unit})
              </label>
              <input
                id="rs-zone"
                className={FIELD}
                type="number"
                inputMode="decimal"
                min="1"
                step="1"
                value={zoneDepth}
                onChange={(event) => setZoneDepth(event.target.value)}
              />
            </div>
          )}
        </div>

        <h2 className="mt-6 text-base font-semibold">Placement</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {placements.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={placement === item.id}
              className={placement === item.id ? CHIP_ON : CHIP}
              onClick={() => setPlacement(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        {!failed && (
          <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.placementNote}
          </p>
        )}
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Rug to buy
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed || noPick
                ? DASH
                : `${result.pickCount > 1 ? `${result.pickCount} × ` : ""}${result.pickLabel}`}
            </p>
            <p
              className={`mt-1 text-sm ${
                failed || noPick || result.borderVerdict === "toobig"
                  ? "text-[var(--danger)]"
                  : result.borderVerdict === "ideal"
                    ? "text-[var(--success)]"
                    : "text-[var(--muted-foreground)]"
              }`}
            >
              {failed
                ? "Fix the highlighted input to see a recommendation."
                : noPick
                  ? "No standard size covers these clearances — this one needs a custom rug."
                  : BORDER_TEXT[result.borderVerdict]}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy the rug recommendation"
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
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Every standard size against this room</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[30rem] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Size
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  In cm
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Covers the layout
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Fits the room
                </th>
              </tr>
            </thead>
            <tbody>
              {(failed ? [] : result.sizes).map((item) => (
                <tr key={item.label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2.5 pr-3 font-semibold">{item.label}</td>
                  <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">
                    {num(item.shortCm)} × {num(item.longCm)}
                  </td>
                  <td
                    className={`py-2.5 pr-3 font-semibold ${
                      item.meetsRequirement ? "text-[var(--success)]" : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    {item.meetsRequirement ? "Yes" : "Too small"}
                  </td>
                  <td
                    className={`py-2.5 font-semibold ${
                      item.fitsRoom ? "text-[var(--success)]" : "text-[var(--danger)]"
                    }`}
                  >
                    {item.fitsRoom ? "Yes" : "Too big"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Rug sizes are nominal and hand-knotted pieces often run a few centimetres either way, so check the
        actual measurement before buying. If two standard sizes both work, the larger one almost always
        looks better — an undersized rug makes a room read as smaller than it is.
      </p>
    </main>
  );
}
