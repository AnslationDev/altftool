"use client";

import { useMemo, useState } from "react";
import { BedDouble, Check, Copy, RotateCcw } from "lucide-react";

import {
  BED_SIZES,
  CLEARANCE_COMFORT_CM,
  CLEARANCE_MIN_CM,
  REGIONS,
  compareAcrossRegions,
  fitRoom,
  sizesForRegion,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const cm = (value) => (Number.isFinite(value) ? `${NUM.format(value)} cm` : "—");
const inch = (value) => (Number.isFinite(value) ? `${NUM.format(value)} in` : "—");
const DASH = "—";

const DEFAULTS = {
  region: "india",
  sizeId: "india-queen",
  roomWidth: "330",
  roomLength: "380",
  headAgainstWall: true,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const VERDICT_COPY = {
  comfortable: "Comfortable — at least 60 cm of walking space all round.",
  workable: "Workable — between 45 cm and 60 cm of walking space at the tightest point.",
  tight: "Tight — less than 45 cm at the tightest point; a smaller size will feel better.",
  "too-small": "This bed does not physically fit the room dimensions you entered.",
};

export default function ToolHome() {
  const [region, setRegion] = useState(DEFAULTS.region);
  const [sizeId, setSizeId] = useState(DEFAULTS.sizeId);
  const [roomWidth, setRoomWidth] = useState(DEFAULTS.roomWidth);
  const [roomLength, setRoomLength] = useState(DEFAULTS.roomLength);
  const [headAgainstWall, setHeadAgainstWall] = useState(DEFAULTS.headAgainstWall);
  const [copied, setCopied] = useState(false);

  const regionSizes = useMemo(() => sizesForRegion(region), [region]);

  const comparison = useMemo(() => compareAcrossRegions(sizeId), [sizeId]);
  const base = comparison.error ? null : comparison.base;

  const fit = useMemo(
    () =>
      fitRoom({
        sizeId,
        roomWidthCm: roomWidth.trim() === "" ? NaN : Number(roomWidth),
        roomLengthCm: roomLength.trim() === "" ? NaN : Number(roomLength),
        headAgainstWall,
      }),
    [sizeId, roomWidth, roomLength, headAgainstWall],
  );

  const fitError = fit.error || null;

  const summary = useMemo(() => {
    if (!base) return "";
    const lines = [
      "Bed Size Comparison",
      `${base.regionLabel} ${base.label}: ${NUM.format(base.widthCm)} x ${NUM.format(base.lengthCm)} cm (${NUM.format(base.widthIn)} x ${NUM.format(base.lengthIn)} in)`,
      `Sleeping area: ${NUM2.format(base.areaSqM)} sq m / ${NUM.format(base.areaSqFt)} sq ft`,
      `Width per sleeper if shared: ${NUM.format(base.perSleeperWidthCm)} cm (${NUM.format(base.perSleeperWidthIn)} in)`,
      "Closest match in each standard:",
      ...comparison.rows.map(
        (row) =>
          `  ${row.regionLabel}: ${row.label} ${NUM.format(row.widthCm)} x ${NUM.format(row.lengthCm)} cm${row.isExact ? " (identical)" : ` (${NUM.format(row.totalDiffCm)} cm total difference)`}`,
      ),
    ];
    if (!fitError) {
      lines.push(
        `Room ${NUM.format(Number(roomWidth))} x ${NUM.format(Number(roomLength))} cm: ${VERDICT_COPY[fit.verdict]}`,
      );
    }
    return lines.join("\n");
  }, [base, comparison, fit, fitError, roomWidth, roomLength]);

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
    setRegion(DEFAULTS.region);
    setSizeId(DEFAULTS.sizeId);
    setRoomWidth(DEFAULTS.roomWidth);
    setRoomLength(DEFAULTS.roomLength);
    setHeadAgainstWall(DEFAULTS.headAgainstWall);
    setCopied(false);
  };

  const changeRegion = (nextRegion) => {
    setRegion(nextRegion);
    const first = BED_SIZES.find((size) => size.region === nextRegion);
    if (first) setSizeId(first.id);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <BedDouble className="h-4 w-4" aria-hidden="true" />
          Bed sizes
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Bed Size Comparison Chart</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick any single, double, queen or king size and see its exact dimensions plus the closest
          equivalent in the Indian, US, UK and EU standards — then check whether it leaves walking
          space in your room.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bed-region">
              Sizing standard
            </label>
            <select
              id="bed-region"
              className={`mt-2 ${INPUT_CLASS}`}
              value={region}
              onChange={(event) => changeRegion(event.target.value)}
            >
              {REGIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bed-size">
              Bed size
            </label>
            <select
              id="bed-size"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sizeId}
              onChange={(event) => setSizeId(event.target.value)}
            >
              {regionSizes.map((size) => (
                <option key={size.id} value={size.id}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bed-room-width">
              Room width (cm)
            </label>
            <input
              id="bed-room-width"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={roomWidth}
              onChange={(event) => setRoomWidth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bed-room-length">
              Room length (cm)
            </label>
            <input
              id="bed-room-length"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={roomLength}
              onChange={(event) => setRoomLength(event.target.value)}
            />
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 items-center gap-3 text-sm font-medium text-[var(--foreground)]"
          htmlFor="bed-head-wall"
        >
          <input
            id="bed-head-wall"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={headAgainstWall}
            onChange={(event) => setHeadAgainstWall(event.target.checked)}
          />
          Headboard sits against a wall (no clearance needed behind it)
        </label>
      </section>

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-live="polite"
        role="status"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              {base ? `${base.regionLabel} ${base.label}` : "Bed size"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {base ? `${NUM.format(base.widthCm)} × ${NUM.format(base.lengthCm)} cm` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {base
                ? `${NUM.format(base.widthIn)} × ${NUM.format(base.lengthIn)} inches · ${NUM2.format(base.widthFt)} × ${NUM2.format(base.lengthFt)} ft`
                : DASH}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy bed size comparison"
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
            ["Sleeping area", base ? `${NUM2.format(base.areaSqM)} sq m · ${NUM.format(base.areaSqFt)} sq ft` : DASH],
            [
              "Width per sleeper (shared by two)",
              base ? `${cm(base.perSleeperWidthCm)} · ${inch(base.perSleeperWidthIn)}` : DASH,
            ],
            ["Quoted natively in", base ? (base.nativeUnit === "cm" ? "centimetres" : "inches") : DASH],
            [
              "Room needed for 60 cm clearance",
              base && !fitError
                ? `${cm(fit.needsWidthCm)} × ${cm(fit.needsLengthCm)}`
                : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {base?.note ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {base.note}
          </p>
        ) : null}
      </section>

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-live="polite"
        role="status"
      >
        <h2 className="text-base font-semibold">Closest equivalent in each standard</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Standard</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Nearest size</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">cm</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">inches</th>
                <th scope="col" className="py-2 text-right font-semibold">Difference</th>
              </tr>
            </thead>
            <tbody>
              {(comparison.rows || []).map((row) => (
                <tr key={row.regionId} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{row.regionLabel}</td>
                  <td className="py-2 pr-3">{row.label}</td>
                  <td className="py-2 pr-3 text-right">
                    {NUM.format(row.widthCm)} × {NUM.format(row.lengthCm)}
                  </td>
                  <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                    {NUM.format(row.widthIn)} × {NUM.format(row.lengthIn)}
                  </td>
                  <td className="py-2 text-right">
                    {row.isExact ? (
                      <span className="font-semibold text-[var(--success)]">identical</span>
                    ) : (
                      `${NUM.format(row.widthDiffCm)} / ${NUM.format(row.lengthDiffCm)} cm`
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Difference columns show width and length change versus the size you selected. A positive
          number means the other standard is larger.
        </p>
      </section>

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-live="polite"
        role="status"
      >
        <h2 className="text-base font-semibold">Will it fit your room?</h2>
        {fitError ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {fitError}
          </p>
        ) : (
          <>
            <p
              className={`mt-3 text-sm font-semibold ${fit.verdict === "too-small" || fit.verdict === "tight" ? "text-[var(--danger)]" : "text-[var(--success)]"}`}
            >
              {VERDICT_COPY[fit.verdict]}
            </p>
            <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
              {[
                ["Walking space on each long side", cm(fit.clearanceEachSideCm)],
                [
                  headAgainstWall ? "Walking space at the foot" : "Walking space at head and foot",
                  cm(fit.clearanceEachEndCm),
                ],
                ["Bed footprint as share of the room", `${NUM.format(fit.bedShareOfRoomPct)}%`],
                ["Room floor area", `${NUM2.format(fit.roomAreaSqM)} sq m`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
        <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
          Clearance bands used: {CLEARANCE_COMFORT_CM} cm and above is comfortable,{" "}
          {CLEARANCE_MIN_CM} cm is the usual practical minimum for walking past a bed and making it.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Bed sizes are trade standards, not laws — individual manufacturers vary by a few centimetres
        and mattress covers add thickness. Measure the frame and the mattress separately before you
        buy fitted sheets or a base.
      </p>
    </main>
  );
}
