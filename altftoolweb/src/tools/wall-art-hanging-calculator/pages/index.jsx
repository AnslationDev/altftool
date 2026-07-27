"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Frame, RotateCcw } from "lucide-react";

import {
  FRAME_GAP_DEFAULT_CM,
  FURNITURE_GAP_DEFAULT_CM,
  GALLERY_CENTRE_CM,
  HOOK_SAFETY_FACTOR,
  hangSingle,
  layoutRow,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";
const cm = (value) => (Number.isFinite(value) ? `${NUM.format(value)} cm` : DASH);

const DEFAULTS = {
  frameHeight: "60",
  frameWidth: "45",
  wireDrop: "8",
  centre: String(GALLERY_CENTRE_CM),
  weight: "3",
  useFurniture: false,
  furnitureTop: "85",
  furnitureGap: String(FURNITURE_GAP_DEFAULT_CM),
  count: "3",
  gap: String(FRAME_GAP_DEFAULT_CM),
  wallWidth: "300",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const ALERT_CLASS =
  "mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]";

export default function ToolHome() {
  const [frameHeight, setFrameHeight] = useState(DEFAULTS.frameHeight);
  const [frameWidth, setFrameWidth] = useState(DEFAULTS.frameWidth);
  const [wireDrop, setWireDrop] = useState(DEFAULTS.wireDrop);
  const [centre, setCentre] = useState(DEFAULTS.centre);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [useFurniture, setUseFurniture] = useState(DEFAULTS.useFurniture);
  const [furnitureTop, setFurnitureTop] = useState(DEFAULTS.furnitureTop);
  const [furnitureGap, setFurnitureGap] = useState(DEFAULTS.furnitureGap);
  const [count, setCount] = useState(DEFAULTS.count);
  const [gap, setGap] = useState(DEFAULTS.gap);
  const [wallWidth, setWallWidth] = useState(DEFAULTS.wallWidth);
  const [copied, setCopied] = useState(false);

  const single = useMemo(
    () =>
      hangSingle({
        frameHeightCm: frameHeight.trim() === "" ? NaN : Number(frameHeight),
        frameWidthCm: frameWidth.trim() === "" ? NaN : Number(frameWidth),
        wireDropCm: wireDrop.trim() === "" ? NaN : Number(wireDrop),
        centreHeightCm: centre.trim() === "" ? NaN : Number(centre),
        weightKg: weight.trim() === "" ? NaN : Number(weight),
        furnitureTopCm: useFurniture ? (furnitureTop.trim() === "" ? NaN : Number(furnitureTop)) : null,
        furnitureGapCm: furnitureGap.trim() === "" ? NaN : Number(furnitureGap),
      }),
    [frameHeight, frameWidth, wireDrop, centre, weight, useFurniture, furnitureTop, furnitureGap],
  );

  const row = useMemo(
    () =>
      layoutRow({
        count: count.trim() === "" ? NaN : Number(count),
        frameWidthCm: frameWidth.trim() === "" ? NaN : Number(frameWidth),
        gapCm: gap.trim() === "" ? NaN : Number(gap),
        wallWidthCm: wallWidth.trim() === "" ? NaN : Number(wallWidth),
      }),
    [count, frameWidth, gap, wallWidth],
  );

  const singleError = single.error || null;
  const rowError = row.error || null;

  const summary = useMemo(() => {
    if (singleError) return "";
    const lines = [
      "Wall Art Hanging",
      `Frame: ${frameWidth} × ${frameHeight} cm, wire drop ${wireDrop} cm`,
      `Nail / hook height: ${NUM.format(single.hookHeightCm)} cm above the floor`,
      `Artwork centre: ${NUM.format(single.centreHeightCm)} cm`,
      `Top edge ${NUM.format(single.topCm)} cm, bottom edge ${NUM.format(single.bottomCm)} cm`,
      `Hooks: ${single.hookCount}${single.needsTwoHooks ? `, ${NUM.format(single.hookSpacingCm)} cm apart` : ""}`,
      single.hookRatingKg
        ? `Hook rating needed: ${single.hookRatingKg} kg each (${HOOK_SAFETY_FACTOR}× safety factor)`
        : "Hook rating needed: above 50 kg — use a wall anchor rated by the manufacturer",
    ];
    if (!rowError && row.fits) {
      lines.push(
        `Gallery row of ${row.count}: total ${NUM.format(row.totalWidthCm)} cm, first frame starts at ${NUM.format(row.leftMarginCm)} cm from the left wall`,
        ...row.positions.map((item) => `  Frame ${item.index} centre at ${NUM.format(item.centreCm)} cm`),
      );
    }
    return lines.join("\n");
  }, [singleError, single, row, rowError, frameWidth, frameHeight, wireDrop]);

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
    setFrameHeight(DEFAULTS.frameHeight);
    setFrameWidth(DEFAULTS.frameWidth);
    setWireDrop(DEFAULTS.wireDrop);
    setCentre(DEFAULTS.centre);
    setWeight(DEFAULTS.weight);
    setUseFurniture(DEFAULTS.useFurniture);
    setFurnitureTop(DEFAULTS.furnitureTop);
    setFurnitureGap(DEFAULTS.furnitureGap);
    setCount(DEFAULTS.count);
    setGap(DEFAULTS.gap);
    setWallWidth(DEFAULTS.wallWidth);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Frame className="h-4 w-4" aria-hidden="true" />
          Hanging guide
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Wall Art Hanging Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Gives the exact height to put the nail so the artwork centre lands on the {GALLERY_CENTRE_CM} cm
          gallery line, plus hook rating and the spacing marks for a row of frames.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The frame</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="wa-width">
              Frame width (cm)
            </label>
            <input
              id="wa-width"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={frameWidth}
              onChange={(event) => setFrameWidth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wa-height">
              Frame height (cm)
            </label>
            <input
              id="wa-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={frameHeight}
              onChange={(event) => setFrameHeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wa-drop">
              Wire drop below top edge (cm)
            </label>
            <input
              id="wa-drop"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={wireDrop}
              onChange={(event) => setWireDrop(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wa-weight">
              Artwork weight (kg)
            </label>
            <input
              id="wa-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="wa-centre">
              Target centre height above floor (cm)
            </label>
            <input
              id="wa-centre"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={centre}
              onChange={(event) => setCentre(event.target.value)}
            />
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 items-center gap-3 text-sm font-medium text-[var(--foreground)]"
          htmlFor="wa-use-furniture"
        >
          <input
            id="wa-use-furniture"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={useFurniture}
            onChange={(event) => setUseFurniture(event.target.checked)}
          />
          Hanging above a sofa, console or headboard
        </label>

        {useFurniture ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="wa-furniture-top">
                Furniture top height (cm)
              </label>
              <input
                id="wa-furniture-top"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={furnitureTop}
                onChange={(event) => setFurnitureTop(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="wa-furniture-gap">
                Clear gap above it (cm)
              </label>
              <input
                id="wa-furniture-gap"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={furnitureGap}
                onChange={(event) => setFurnitureGap(event.target.value)}
              />
            </div>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Mark the nail at
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {singleError ? DASH : cm(single.hookHeightCm)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              measured up from the finished floor
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy hanging measurements"
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

        {singleError ? <p role="alert" className={ALERT_CLASS}>{singleError}</p> : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Artwork centre height", singleError ? DASH : cm(single.centreHeightCm)],
            ["Top edge of frame", singleError ? DASH : cm(single.topCm)],
            ["Bottom edge of frame", singleError ? DASH : cm(single.bottomCm)],
            [
              "Hooks needed",
              singleError
                ? DASH
                : single.needsTwoHooks
                  ? `2, spaced ${NUM.format(single.hookSpacingCm)} cm apart (${NUM.format(single.hookInsetCm)} cm in from each edge)`
                  : "1, centred",
            ],
            ["Load per hook", singleError ? DASH : `${NUM.format(single.perHookLoadKg)} kg`],
            [
              "Minimum hook rating",
              singleError
                ? DASH
                : single.hookRatingKg
                  ? `${single.hookRatingKg} kg each`
                  : "Over 50 kg — use a rated wall anchor",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!singleError && single.furnitureNote ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {single.furnitureNote}
          </p>
        ) : null}

        {!singleError && single.bottomBelowFloor ? (
          <p role="alert" className={ALERT_CLASS}>
            With this centre height the bottom of the frame would sit below floor level. Raise the
            centre height or use a shorter frame.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Gallery row spacing</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className={LABEL_CLASS} htmlFor="wa-count">
              Number of frames
            </label>
            <input
              id="wa-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="12"
              step="1"
              value={count}
              onChange={(event) => setCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wa-gap">
              Gap between frames (cm)
            </label>
            <input
              id="wa-gap"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={gap}
              onChange={(event) => setGap(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wa-wall">
              Wall width available (cm)
            </label>
            <input
              id="wa-wall"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="5"
              value={wallWidth}
              onChange={(event) => setWallWidth(event.target.value)}
            />
          </div>
        </div>

        {rowError ? (
          <p role="alert" className={ALERT_CLASS}>
            {rowError}
          </p>
        ) : !row.fits ? (
          <p role="alert" className={ALERT_CLASS}>
            The row needs {NUM.format(row.totalWidthCm)} cm but the wall is only {NUM.format(Number(wallWidth))} cm.
            Reduce the frame count, the frame width or the gap.
          </p>
        ) : (
          <>
            <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
              {[
                ["Total width of the group", cm(row.totalWidthCm)],
                ["Margin at each end", cm(row.leftMarginCm)],
                ["Share of the wall covered", `${NUM.format(row.wallCoveragePct)}%`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Frame</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Left edge</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Centre / nail</th>
                    <th scope="col" className="py-2 text-right font-semibold">Right edge</th>
                  </tr>
                </thead>
                <tbody>
                  {row.positions.map((item) => (
                    <tr key={item.index} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{item.index}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{cm(item.leftCm)}</td>
                      <td className="py-2 pr-3 text-right font-semibold">{cm(item.centreCm)}</td>
                      <td className="py-2 text-right text-[var(--muted-foreground)]">{cm(item.rightCm)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
              All distances are measured from the left edge of the wall section. Every nail goes at
              the same height you calculated above.
            </p>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Hook ratings here apply a {HOOK_SAFETY_FACTOR}× safety factor to the artwork weight and assume a
        sound wall. Hollow drywall, false ceilings and cladding need their own anchors — check the
        anchor manufacturer's rating for the wall type before drilling.
      </p>
    </main>
  );
}
