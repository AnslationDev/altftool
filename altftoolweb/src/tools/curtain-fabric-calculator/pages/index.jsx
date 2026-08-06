"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Rows3 } from "lucide-react";

import {
  FABRIC_WIDTHS,
  HEADING_TYPES,
  HEM_ALLOWANCES,
  calculateCurtainFabric,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);

const DEFAULTS = {
  unit: "cm",
  track: "200",
  drop: "220",
  headingId: "pencil",
  customFullness: false,
  fullness: "2.5",
  isPair: true,
  fabricWidth: "137",
  repeat: "32",
  hem: "20",
  ret: "8",
  overlap: "10",
  lined: true,
  price: "450",
  liningPrice: "120",
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
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [track, setTrack] = useState(DEFAULTS.track);
  const [drop, setDrop] = useState(DEFAULTS.drop);
  const [headingId, setHeadingId] = useState(DEFAULTS.headingId);
  const [customFullness, setCustomFullness] = useState(DEFAULTS.customFullness);
  const [fullness, setFullness] = useState(DEFAULTS.fullness);
  const [isPair, setIsPair] = useState(DEFAULTS.isPair);
  const [fabricWidth, setFabricWidth] = useState(DEFAULTS.fabricWidth);
  const [repeat, setRepeat] = useState(DEFAULTS.repeat);
  const [hem, setHem] = useState(DEFAULTS.hem);
  const [ret, setRet] = useState(DEFAULTS.ret);
  const [overlap, setOverlap] = useState(DEFAULTS.overlap);
  const [lined, setLined] = useState(DEFAULTS.lined);
  const [price, setPrice] = useState(DEFAULTS.price);
  const [liningPrice, setLiningPrice] = useState(DEFAULTS.liningPrice);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      calculateCurtainFabric({
        trackWidth: toNumber(track),
        finishedDrop: toNumber(drop),
        unit,
        headingId,
        fullnessOverride: customFullness ? toNumber(fullness) : undefined,
        isPair,
        fabricWidthCm: toNumber(fabricWidth),
        patternRepeatCm: toNumber(repeat),
        hemAllowanceCm: toNumber(hem),
        returnCm: toNumber(ret),
        overlapCm: toNumber(overlap),
        lined,
        fabricPricePerMetre: toNumber(price),
        liningPricePerMetre: toNumber(liningPrice),
      }),
    [
      track,
      drop,
      unit,
      headingId,
      customFullness,
      fullness,
      isPair,
      fabricWidth,
      repeat,
      hem,
      ret,
      overlap,
      lined,
      price,
      liningPrice,
    ],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Curtain fabric take-off",
      `${result.panels === 2 ? "Pair" : "Single curtain"} on a ${num(result.trackCm)} cm track, ${num(result.dropCm)} cm finished drop`,
      `Heading: ${result.headingLabel} at ${num(result.fullness)}x fullness`,
      `Gathered width needed: ${num(result.gatheredWidthCm)} cm plus ${num(result.sideTurningsCm)} cm of side turnings`,
      `Widths to cut: ${result.drops} (${num(result.dropsPerPanel)} per curtain)`,
      `Cut length: ${num(result.cutLengthCm)} cm each${result.patternRepeatCm > 0 ? ` (rounded up to a ${num(result.patternRepeatCm)} cm repeat)` : ""}`,
      `Face fabric: ${num(result.totalFabricM)} m`,
      result.lined ? `Lining: ${num(result.totalLiningM)} m` : "No lining",
      `Heading tape: ${num(result.tapeMetres)} m · Hooks: ${result.hooks}`,
      `Cost: ${money(result.totalCost)}`,
    ].join("\n");
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
    if (
      typeof window !== "undefined" &&
      !window.confirm("Reset all curtain measurements, fabric and pricing to the defaults?")
    ) {
      return;
    }
    setUnit(DEFAULTS.unit);
    setTrack(DEFAULTS.track);
    setDrop(DEFAULTS.drop);
    setHeadingId(DEFAULTS.headingId);
    setCustomFullness(DEFAULTS.customFullness);
    setFullness(DEFAULTS.fullness);
    setIsPair(DEFAULTS.isPair);
    setFabricWidth(DEFAULTS.fabricWidth);
    setRepeat(DEFAULTS.repeat);
    setHem(DEFAULTS.hem);
    setRet(DEFAULTS.ret);
    setOverlap(DEFAULTS.overlap);
    setLined(DEFAULTS.lined);
    setPrice(DEFAULTS.price);
    setLiningPrice(DEFAULTS.liningPrice);
    setCopied(false);
  };

  const rows = [
    ["Track width", failed ? DASH : `${num(result.trackCm)} cm`],
    ["Finished drop", failed ? DASH : `${num(result.dropCm)} cm`],
    ["Returns at the ends", failed ? DASH : `${num(result.returnsCm)} cm`],
    ["Centre overlap", failed ? DASH : `${num(result.overlapTotalCm)} cm`],
    ["Width to gather over", failed ? DASH : `${num(result.baseWidthCm)} cm`],
    ["Fullness specified", failed ? DASH : `${num(result.fullness)}x`],
    ["Gathered width needed", failed ? DASH : `${num(result.gatheredWidthCm)} cm`],
    ["Side turnings", failed ? DASH : `${num(result.sideTurningsCm)} cm`],
    ["Total flat width to cut", failed ? DASH : `${num(result.widthToCutCm)} cm`],
    ["Usable width of the roll", failed ? DASH : `${num(result.usableWidthCm)} cm`],
    ["Widths (drops) to cut", failed ? DASH : `${result.drops}`],
    [
      "Per curtain",
      failed
        ? DASH
        : `${num(result.dropsPerPanel)} width${result.halfWidthNeeded ? " — one width splits in half" : ""}`,
    ],
    ["Fullness you actually get", failed ? DASH : `${num(result.actualFullness)}x`],
    ["Heading allowance", failed ? DASH : `${num(result.headingAllowanceCm)} cm`],
    ["Hem allowance", failed ? DASH : `${num(result.hemAllowanceCm)} cm`],
    ["Cut length before repeat", failed ? DASH : `${num(result.rawCutLengthCm)} cm`],
    ["Cut length to use", failed ? DASH : `${num(result.cutLengthCm)} cm`],
    ["Lost to pattern matching", failed ? DASH : `${num(result.repeatWasteTotalM)} m`],
    ["Face fabric to buy", failed ? DASH : `${num(result.totalFabricM)} m`],
    ["Lining to buy", failed || !result.lined ? DASH : `${num(result.totalLiningM)} m`],
    ["Heading tape", failed ? DASH : `${num(result.tapeMetres)} m`],
    ["Curtain hooks", failed ? DASH : `${result.hooks}`],
    ["Fabric cost", failed ? DASH : money(result.fabricCost)],
    ["Lining cost", failed || !result.lined ? DASH : money(result.liningCost)],
    ["Total", failed ? DASH : money(result.totalCost)],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Rows3 className="h-4 w-4" aria-hidden="true" />
          Furnishing
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Curtain Fabric Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work in widths the way a curtain maker does: gathered width across, cut length down, pattern
          repeat rounded up, and the metres, lining, tape and hooks that come out of it.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Window</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { id: "cm", label: "Centimetres" },
            { id: "in", label: "Inches" },
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
            <label className={LABEL} htmlFor="cf-track">
              Track or pole width ({unit})
            </label>
            <input
              id="cf-track"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={track}
              onChange={(event) => setTrack(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="cf-drop">
              Finished drop ({unit})
            </label>
            <input
              id="cf-drop"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={drop}
              onChange={(event) => setDrop(event.target.value)}
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { id: true, label: "A pair that meets in the middle" },
            { id: false, label: "One single curtain" },
          ].map((option) => (
            <button
              key={String(option.id)}
              type="button"
              aria-pressed={isPair === option.id}
              className={isPair === option.id ? CHIP_ON : CHIP}
              onClick={() => setIsPair(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <h2 className="mt-6 text-base font-semibold">Heading and fabric</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="cf-heading">
              Heading type
            </label>
            <select
              id="cf-heading"
              className={FIELD}
              value={headingId}
              onChange={(event) => setHeadingId(event.target.value)}
            >
              {HEADING_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} · {item.fullness}x
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mt-2 flex min-h-11 items-center gap-3 text-sm font-semibold sm:mt-8">
              <input
                id="cf-custom-fullness"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                checked={customFullness}
                onChange={(event) => setCustomFullness(event.target.checked)}
              />
              Use a custom fullness instead
            </label>
            {customFullness ? (
              <input
                id="cf-fullness"
                aria-label="Custom fullness ratio"
                className={`${FIELD} mt-2`}
                type="number"
                inputMode="decimal"
                min="1"
                max="4"
                step="0.05"
                value={fullness}
                onChange={(event) => setFullness(event.target.value)}
              />
            ) : null}
          </div>
          <div>
            <label className={LABEL} htmlFor="cf-fabricwidth">
              Fabric roll width (cm)
            </label>
            <input
              id="cf-fabricwidth"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="20"
              step="1"
              value={fabricWidth}
              onChange={(event) => setFabricWidth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="cf-repeat">
              Pattern repeat (cm, 0 if plain)
            </label>
            <input
              id="cf-repeat"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={repeat}
              onChange={(event) => setRepeat(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="cf-hem">
              Hem allowance (cm)
            </label>
            <input
              id="cf-hem"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={hem}
              onChange={(event) => setHem(event.target.value)}
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {FABRIC_WIDTHS.map((item) => (
            <button
              key={item.cm}
              type="button"
              className={CHIP}
              onClick={() => setFabricWidth(String(item.cm))}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {HEM_ALLOWANCES.map((item) => (
            <button key={item.id} type="button" className={CHIP} onClick={() => setHem(String(item.cm))}>
              {item.label}
            </button>
          ))}
        </div>

        <h2 className="mt-6 text-base font-semibold">Allowances and cost</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="cf-return">
              Return at each end (cm)
            </label>
            <input
              id="cf-return"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={ret}
              onChange={(event) => setRet(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="cf-overlap">
              Centre overlap (cm)
            </label>
            <input
              id="cf-overlap"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={overlap}
              onChange={(event) => setOverlap(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="cf-price">
              Fabric price per metre (INR)
            </label>
            <input
              id="cf-price"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0"
              step="25"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="cf-liningprice">
              Lining price per metre (INR)
            </label>
            <input
              id="cf-liningprice"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={liningPrice}
              onChange={(event) => setLiningPrice(event.target.value)}
            />
          </div>
        </div>
        <label className="mt-3 flex min-h-11 items-center gap-3 text-sm font-semibold">
          <input
            id="cf-lined"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={lined}
            onChange={(event) => setLined(event.target.checked)}
          />
          Lined curtains
        </label>
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
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-live="polite"
        role="status"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Face fabric to buy
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${num(result.totalFabricM)} m`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the highlighted input to see a cutting plan."
                : `${result.drops} widths cut at ${num(result.cutLengthCm)} cm each`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy the curtain fabric take-off"
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

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Buy all the fabric in one go from a single dye lot — a metre bought later almost never matches.
        Measure the track, not the window, and take the drop from the track to the exact finished point:
        sill, below sill or floor with a 1 cm clearance.
      </p>
    </main>
  );
}
