"use client";

import { useMemo, useState } from "react";
import { Boxes, Check, Copy, Download, RotateCcw } from "lucide-react";

import {
  FACE_OPACITY,
  ISOMETRIC_AZIMUTH_DEG,
  ISOMETRIC_ELEVATION_DEG,
  MAX_SIZE,
  OBJECT_KINDS,
  STAIRCASE_RISE_OPTIONS,
  buildScene,
  toPolygonPoints,
  toSvgMarkup,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const RANGE_CLASS = "mt-2 h-11 w-full accent-[var(--primary)]";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const DEFAULTS = {
  kind: "penrose-triangle",
  size: 4,
  height: 7,
  stepsPerRise: 4,
  azimuthDeg: ISOMETRIC_AZIMUTH_DEG,
  elevationDeg: Math.round(ISOMETRIC_ELEVATION_DEG * 100) / 100,
  cubeSize: 30,
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  // Impossible-rectangle needs height strictly greater than size (see lib.js buildScene).
  // Cross-clamp both directions so no reachable slider position blanks the figure:
  // bumping size up past the stored height pulls height up with it, and the height
  // slider's own min (form.size + 1, set on its <input> below) stops it being dragged
  // at or below the current size.
  const setSize = (value) =>
    setForm((current) => {
      if (current.kind === "impossible-rectangle" && value >= current.height) {
        return { ...current, size: value, height: Math.min(MAX_SIZE * 2, value + 1) };
      }
      return { ...current, size: value };
    });

  const setKind = (value) =>
    setForm((current) => {
      if (value === "impossible-rectangle" && current.height <= current.size) {
        return { ...current, kind: value, height: Math.min(MAX_SIZE * 2, current.size + 1) };
      }
      return { ...current, kind: value };
    });

  const scene = useMemo(() => buildScene(form), [form]);
  const hasError = Boolean(scene.error);

  const svgMarkup = useMemo(() => (hasError ? "" : toSvgMarkup(scene)), [hasError, scene]);

  const copyResult = async () => {
    if (!svgMarkup) return;
    try {
      await navigator.clipboard.writeText(svgMarkup);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const download = () => {
    if (!svgMarkup) return;
    const blob = new Blob([svgMarkup], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${form.kind}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  const snapToIsometric = () =>
    setForm((current) => ({
      ...current,
      azimuthDeg: DEFAULTS.azimuthDeg,
      elevationDeg: DEFAULTS.elevationDeg,
    }));

  const activeKind = OBJECT_KINDS.find((item) => item.id === form.kind);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Boxes className="h-4 w-4" aria-hidden="true" />
          Optical illusion
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Impossible Object Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Builds Penrose-style figures from unit cubes on a 3D lattice. They only work because an
          isometric projection collapses the whole line t(1,&nbsp;1,&nbsp;1) onto one screen point —
          move the camera off 45° / 35.26° and the join visibly falls apart.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="kind">
              Object
            </label>
            <select
              id="kind"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.kind}
              onChange={(event) => setKind(event.target.value)}
            >
              {OBJECT_KINDS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            {activeKind && (
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">{activeKind.blurb}</p>
            )}
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="size">
              {form.kind === "impossible-staircase" ? "Short side" : "Arm length"}: {form.size} cells
            </label>
            <input
              id="size"
              className={RANGE_CLASS}
              type="range"
              min="1"
              max={MAX_SIZE}
              step="1"
              value={form.size}
              onChange={(event) => setSize(Number(event.target.value))}
            />
          </div>

          {form.kind === "impossible-rectangle" && (
            <div>
              <label className={LABEL_CLASS} htmlFor="height">
                Upright height: {form.height} cells
              </label>
              <input
                id="height"
                className={RANGE_CLASS}
                type="range"
                min={form.size + 1}
                max={MAX_SIZE * 2}
                step="1"
                value={form.height}
                onChange={(event) => setField("height", Number(event.target.value))}
              />
            </div>
          )}

          {form.kind === "impossible-staircase" && (
            <div>
              <label className={LABEL_CLASS} htmlFor="steps-per-rise">
                Cells per one-cell rise
              </label>
              <select
                id="steps-per-rise"
                className={`mt-2 ${INPUT_CLASS}`}
                value={form.stepsPerRise}
                onChange={(event) => setField("stepsPerRise", Number(event.target.value))}
              >
                {STAIRCASE_RISE_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    every {value} cells
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className={LABEL_CLASS} htmlFor="cube-size">
              Cell size: {form.cubeSize} units
            </label>
            <input
              id="cube-size"
              className={RANGE_CLASS}
              type="range"
              min="8"
              max="60"
              step="1"
              value={form.cubeSize}
              onChange={(event) => setField("cubeSize", Number(event.target.value))}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="azimuth">
              Azimuth: {NUM.format(form.azimuthDeg)}°
            </label>
            <input
              id="azimuth"
              className={RANGE_CLASS}
              type="range"
              min="5"
              max="85"
              step="0.5"
              value={form.azimuthDeg}
              onChange={(event) => setField("azimuthDeg", Number(event.target.value))}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="elevation">
              Elevation: {NUM.format(form.elevationDeg)}°
            </label>
            <input
              id="elevation"
              className={RANGE_CLASS}
              type="range"
              min="5"
              max="80"
              step="0.5"
              value={form.elevationDeg}
              onChange={(event) => setField("elevationDeg", Number(event.target.value))}
            />
          </div>

          <div className="sm:col-span-2">
            <button type="button" className={GHOST_BTN} onClick={snapToIsometric}>
              Snap camera back to true isometric
            </button>
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {scene.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Projection gap
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]" aria-live="polite">
              {hasError ? DASH : `${NUM.format(scene.projectionGap)} px`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]" aria-live="polite">
              {hasError
                ? "Fix the settings above to build the figure."
                : scene.isImpossible
                  ? "Zero: the two ends of the circuit land on the same screen point, so the figure reads as closed."
                  : "Not zero: the camera is off true isometric, so you can see where the circuit really breaks."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the SVG markup to clipboard"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy SVG"}
            </button>
            <button
              type="button"
              onClick={download}
              aria-label="Download the figure as an SVG file"
              className={GHOST_BTN}
              disabled={hasError}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download
            </button>
            <button type="button" onClick={reset} aria-label="Reset all settings" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm" aria-live="polite" role="status">
          {[
            ["Cubes drawn", hasError ? DASH : NUM.format(scene.cellCount)],
            ["Faces painted", hasError ? DASH : NUM.format(scene.faceCount)],
            ...(form.kind === "impossible-staircase"
              ? [
                  [
                    "Long side",
                    hasError || typeof scene.longSide !== "number"
                      ? DASH
                      : `${NUM.format(scene.longSide)} cells`,
                  ],
                ]
              : []),
            [
              "Net 3D displacement",
              hasError
                ? DASH
                : `(${scene.netDisplacement.x}, ${scene.netDisplacement.y}, ${scene.netDisplacement.z})`,
            ],
            [
              "On the (1, 1, 1) line?",
              hasError
                ? DASH
                : scene.netDisplacement.x === scene.netDisplacement.y &&
                    scene.netDisplacement.y === scene.netDisplacement.z
                  ? "Yes — the circuit can close in projection"
                  : "No",
            ],
            ["Camera azimuth", hasError ? DASH : `${NUM.format(scene.azimuthDeg)}°`],
            ["Camera elevation", hasError ? DASH : `${NUM.format(scene.elevationDeg)}°`],
            [
              "True isometric?",
              hasError
                ? DASH
                : scene.isImpossible
                  ? `Yes (${NUM.format(ISOMETRIC_AZIMUTH_DEG)}° / ${NUM.format(ISOMETRIC_ELEVATION_DEG)}°)`
                  : "No — illusion broken",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
          {hasError ? (
            <p className="text-center text-sm text-[var(--muted-foreground)]">{DASH}</p>
          ) : (
            <svg
              viewBox={scene.viewBox}
              className="mx-auto block h-auto w-full max-w-[520px] text-[var(--primary)]"
              role="img"
              aria-label={`${activeKind ? activeKind.label : "Impossible object"} drawn in axonometric projection`}
            >
              {scene.faces.map((face, index) => (
                <polygon
                  key={`${face.role}-${index}`}
                  points={toPolygonPoints(face.points)}
                  fill="currentColor"
                  fillOpacity={FACE_OPACITY[face.role]}
                  stroke="var(--foreground)"
                  strokeOpacity={0.35}
                  strokeWidth={1}
                  strokeLinejoin="round"
                />
              ))}
            </svg>
          )}
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Nothing here is a rendering trick: every cube is a real lattice cell painted back to front.
        The impossibility lives entirely in the projection, which is why nudging the azimuth slider
        a few degrees is enough to give the game away.
      </p>
    </main>
  );
}
