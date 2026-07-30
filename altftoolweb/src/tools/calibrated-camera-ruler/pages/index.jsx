"use client";

import { useMemo, useRef, useState } from "react";
import { Check, Copy, Ruler, RotateCcw } from "lucide-react";

import {
  accuracyNotes,
  allUnits,
  findReference,
  formatLength,
  measureScene,
  pixelDistance,
  REFERENCE_OBJECTS,
  toImagePoint,
  UNITS,
} from "../lib";

const DEFAULTS = {
  referenceId: "id1-long",
  customMm: "85.6",
  referencePixels: "420",
  widthPixels: "968",
  heightPixels: "500",
  markErrorPx: "2",
  referenceDistance: "",
  objectDistance: "",
  tiltDegrees: "0",
  unit: "cm",
};

const SEGMENTS = [
  { key: "reference", label: "Reference edge", field: "referencePixels" },
  { key: "width", label: "Object length / width", field: "widthPixels" },
  { key: "height", label: "Object height (optional)", field: "heightPixels" },
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const DASH = "—";

const emptyPoints = { reference: [], width: [], height: [] };

export default function ToolHome() {
  const [referenceId, setReferenceId] = useState(DEFAULTS.referenceId);
  const [customMm, setCustomMm] = useState(DEFAULTS.customMm);
  const [referencePixels, setReferencePixels] = useState(DEFAULTS.referencePixels);
  const [widthPixels, setWidthPixels] = useState(DEFAULTS.widthPixels);
  const [heightPixels, setHeightPixels] = useState(DEFAULTS.heightPixels);
  const [markErrorPx, setMarkErrorPx] = useState(DEFAULTS.markErrorPx);
  const [referenceDistance, setReferenceDistance] = useState(DEFAULTS.referenceDistance);
  const [objectDistance, setObjectDistance] = useState(DEFAULTS.objectDistance);
  const [tiltDegrees, setTiltDegrees] = useState(DEFAULTS.tiltDegrees);
  const [unit, setUnit] = useState(DEFAULTS.unit);

  const [photo, setPhoto] = useState(null);
  const [natural, setNatural] = useState({ width: 0, height: 0 });
  const [points, setPoints] = useState(emptyPoints);
  const [activeSegment, setActiveSegment] = useState("reference");
  const [copied, setCopied] = useState(false);
  const imageRef = useRef(null);

  const reference = findReference(referenceId);
  const referenceMm = referenceId === "custom" ? Number(customMm) : reference?.mm;

  const setters = {
    referencePixels: setReferencePixels,
    widthPixels: setWidthPixels,
    heightPixels: setHeightPixels,
  };

  const result = useMemo(
    () =>
      measureScene({
        referencePixels: Number(referencePixels),
        referenceMm,
        widthPixels: Number(widthPixels),
        heightPixels: heightPixels === "" ? "" : Number(heightPixels),
        markErrorPx: Number(markErrorPx),
        referenceDistance: referenceDistance === "" ? null : Number(referenceDistance),
        objectDistance: objectDistance === "" ? null : Number(objectDistance),
        tiltDegrees: Number(tiltDegrees),
      }),
    [
      referencePixels,
      referenceMm,
      widthPixels,
      heightPixels,
      markErrorPx,
      referenceDistance,
      objectDistance,
      tiltDegrees,
    ],
  );

  const hasError = Boolean(result.error);
  const notes = useMemo(() => (hasError ? [] : accuracyNotes(result)), [hasError, result]);

  const onPhoto = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (photo) URL.revokeObjectURL(photo);
    setPhoto(URL.createObjectURL(file));
    setPoints(emptyPoints);
    setActiveSegment("reference");
  };

  const onImageLoad = (event) => {
    setNatural({ width: event.target.naturalWidth, height: event.target.naturalHeight });
  };

  const onImageClick = (event) => {
    const element = imageRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const point = toImagePoint({
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      displayedWidth: rect.width,
      displayedHeight: rect.height,
      naturalWidth: natural.width,
      naturalHeight: natural.height,
    });
    if (point.error) return;

    setPoints((prev) => {
      const current = prev[activeSegment];
      const next = current.length >= 2 ? [point] : [...current, point];
      if (next.length === 2) {
        const distance = pixelDistance(next[0], next[1]);
        const segment = SEGMENTS.find((item) => item.key === activeSegment);
        if (distance !== null && segment) setters[segment.field](distance.toFixed(1));
      }
      return { ...prev, [activeSegment]: next };
    });
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Calibrated Camera Ruler",
      `Reference: ${reference ? reference.label : "custom"} = ${result.referenceMm} mm across ${result.referencePixels} px`,
      `Scale: ${result.mmPerPixel.toFixed(5)} mm per pixel (${result.pixelsPerMm.toFixed(3)} px per mm)`,
      `Length: ${formatLength(result.width.mm, unit)}${
        result.width.low !== null
          ? ` (between ${formatLength(result.width.low, unit)} and ${formatLength(result.width.high, unit)})`
          : ""
      }`,
    ];
    if (result.height) {
      lines.push(
        `Height: ${formatLength(result.height.mm, unit)}${
          result.height.low !== null
            ? ` (between ${formatLength(result.height.low, unit)} and ${formatLength(result.height.high, unit)})`
            : ""
        }`,
      );
      lines.push(`Diagonal: ${formatLength(result.diagonal, unit)}`);
      lines.push(`Area: ${result.area.cm2.toFixed(2)} cm² (${result.area.in2.toFixed(2)} sq in)`);
    }
    if (result.ratio !== 1) lines.push(`Depth correction applied: ×${result.ratio.toFixed(3)}`);
    if (result.tilt.angleDeg > 0) lines.push(`Tilt correction applied: ×${result.tilt.factor.toFixed(3)}`);
    lines.push("Estimate from a single photo — not a substitute for a tape or caliper.");
    return lines.join("\n");
  }, [hasError, result, reference, unit]);

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
    setReferenceId(DEFAULTS.referenceId);
    setCustomMm(DEFAULTS.customMm);
    setReferencePixels(DEFAULTS.referencePixels);
    setWidthPixels(DEFAULTS.widthPixels);
    setHeightPixels(DEFAULTS.heightPixels);
    setMarkErrorPx(DEFAULTS.markErrorPx);
    setReferenceDistance(DEFAULTS.referenceDistance);
    setObjectDistance(DEFAULTS.objectDistance);
    setTiltDegrees(DEFAULTS.tiltDegrees);
    setUnit(DEFAULTS.unit);
    if (photo) URL.revokeObjectURL(photo);
    setPhoto(null);
    setPoints(emptyPoints);
    setActiveSegment("reference");
    setCopied(false);
  };

  const overlay = SEGMENTS.map((segment) => ({
    key: segment.key,
    label: segment.label,
    marks: points[segment.key],
  }));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Ruler className="h-4 w-4" aria-hidden="true" />
          Photo measurement
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Calibrated Camera Ruler</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Put something of known size next to the object, photograph both, and this converts image
          pixels into millimetres: <strong>mm per pixel = reference size ÷ reference pixels</strong>.
          The reading comes with the range your mark placement allows, so you can see how much to
          trust it. Everything runs in this browser; the photo is never uploaded.
        </p>
      </header>

      <section className={CARD}>
        <h2 className="text-base font-semibold">1 · Calibrate</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className={referenceId === "custom" ? "" : "sm:col-span-2"}>
            <label className={LABEL_CLASS} htmlFor="reference-object">
              Reference object in the photo
            </label>
            <select
              id="reference-object"
              className={`mt-2 ${INPUT_CLASS}`}
              value={referenceId}
              onChange={(event) => setReferenceId(event.target.value)}
            >
              {REFERENCE_OBJECTS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                  {item.mm !== null ? ` — ${item.mm} mm` : ""}
                </option>
              ))}
            </select>
            {reference && reference.mm !== null && (
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">{reference.source}</p>
            )}
          </div>

          {referenceId === "custom" && (
            <div>
              <label className={LABEL_CLASS} htmlFor="custom-mm">
                Its real size (mm)
              </label>
              <input
                id="custom-mm"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                value={customMm}
                onChange={(event) => setCustomMm(event.target.value)}
              />
            </div>
          )}

          <div>
            <label className={LABEL_CLASS} htmlFor="reference-pixels">
              Reference length in the image (pixels)
            </label>
            <input
              id="reference-pixels"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={referencePixels}
              onChange={(event) => setReferencePixels(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="mark-error">
              Mark placement slip at each end (pixels)
            </label>
            <input
              id="mark-error"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={markErrorPx}
              onChange={(event) => setMarkErrorPx(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">2 · Measure</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="width-pixels">
              Object length in the image (pixels)
            </label>
            <input
              id="width-pixels"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={widthPixels}
              onChange={(event) => setWidthPixels(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="height-pixels">
              Object height in the image (pixels, optional)
            </label>
            <input
              id="height-pixels"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={heightPixels}
              onChange={(event) => setHeightPixels(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="unit">
              Show results in
            </label>
            <select
              id="unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              {Object.entries(UNITS).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tilt-degrees">
              Surface tilt away from the camera (degrees)
            </label>
            <input
              id="tilt-degrees"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="80"
              step="1"
              value={tiltDegrees}
              onChange={(event) => setTiltDegrees(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="reference-distance">
              Camera to reference (optional, any unit)
            </label>
            <input
              id="reference-distance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              placeholder="same plane"
              value={referenceDistance}
              onChange={(event) => setReferenceDistance(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="object-distance">
              Camera to object (same unit as above)
            </label>
            <input
              id="object-distance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              placeholder="same plane"
              value={objectDistance}
              onChange={(event) => setObjectDistance(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-base font-semibold">Optional · measure by clicking on a photo</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Load a photo, pick which length you are marking, then tap its two ends. The pixel distance
          is written straight into the field above.
        </p>
        <div className="mt-3">
          <label className={LABEL_CLASS} htmlFor="photo">
            Photo
          </label>
          <input
            id="photo"
            type="file"
            accept="image/*"
            onChange={onPhoto}
            className={`mt-2 ${INPUT_CLASS} file:mr-3 file:h-8 file:rounded-md file:border-0 file:bg-[var(--muted)] file:px-3 file:text-sm file:font-semibold file:text-[var(--foreground)] py-2`}
          />
        </div>

        {photo && (
          <>
            <fieldset className="mt-4">
              <legend className={LABEL_CLASS}>I am marking</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {SEGMENTS.map((segment) => (
                  <label
                    key={segment.key}
                    htmlFor={`seg-${segment.key}`}
                    className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-semibold transition ${
                      activeSegment === segment.key
                        ? "border-[var(--primary)] bg-[var(--muted)] text-[var(--foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                    }`}
                  >
                    <input
                      id={`seg-${segment.key}`}
                      type="radio"
                      name="segment"
                      className="h-4 w-4 accent-[var(--primary)]"
                      value={segment.key}
                      checked={activeSegment === segment.key}
                      onChange={(event) => setActiveSegment(event.target.value)}
                    />
                    {segment.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="relative mt-4 overflow-hidden rounded-lg border border-[var(--border)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imageRef}
                src={photo}
                alt="Photo being measured"
                onLoad={onImageLoad}
                onClick={onImageClick}
                className="block w-full cursor-crosshair"
              />
              {natural.width > 0 && (
                <svg
                  viewBox={`0 0 ${natural.width} ${natural.height}`}
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  aria-hidden="true"
                >
                  {overlay.map((segment) => (
                    <g key={segment.key}>
                      {segment.marks.length === 2 && (
                        <line
                          x1={segment.marks[0].x}
                          y1={segment.marks[0].y}
                          x2={segment.marks[1].x}
                          y2={segment.marks[1].y}
                          stroke={
                            segment.key === "reference" ? "var(--success)" : "var(--primary)"
                          }
                          strokeWidth={Math.max(natural.width / 300, 2)}
                        />
                      )}
                      {segment.marks.map((mark, index) => (
                        <circle
                          key={`${segment.key}-${index}`}
                          cx={mark.x}
                          cy={mark.y}
                          r={Math.max(natural.width / 150, 4)}
                          fill={segment.key === "reference" ? "var(--success)" : "var(--primary)"}
                        />
                      ))}
                    </g>
                  ))}
                </svg>
              )}
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Image is {natural.width}×{natural.height} px. Marks are stored in original image
              pixels, so zooming the page does not change the answer.
            </p>
          </>
        )}
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      {!hasError && (
        <>
          <section className={`mt-6 ${CARD}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                  Estimated length
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {formatLength(result.width.mm, unit)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {result.width.low !== null
                    ? `somewhere between ${formatLength(result.width.low, unit)} and ${formatLength(
                        result.width.high,
                        unit,
                      )} given ±${result.markErrorPx} px marks`
                    : "no interval available for these inputs"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy the measurement to the clipboard"
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
                ["Scale", `${result.mmPerPixel.toFixed(5)} mm per pixel`],
                ["Pixels per millimetre", result.pixelsPerMm.toFixed(3)],
                ["Length", formatLength(result.width.mm, unit)],
                ["Height", result.height ? formatLength(result.height.mm, unit) : DASH],
                ["Diagonal", result.diagonal !== null ? formatLength(result.diagonal, unit) : DASH],
                [
                  "Area",
                  result.area ? `${result.area.cm2.toFixed(2)} cm² · ${result.area.in2.toFixed(2)} sq in` : DASH,
                ],
                [
                  "Reading spread",
                  result.width.spreadPercent !== null
                    ? `${result.width.spreadPercent.toFixed(2)}% of the reading`
                    : DASH,
                ],
                [
                  "Depth correction",
                  result.ratio === 1 ? "none (same plane assumed)" : `×${result.ratio.toFixed(3)}`,
                ],
                [
                  "Tilt correction",
                  result.tilt.angleDeg === 0
                    ? "none (surface square to the camera)"
                    : `×${result.tilt.factor.toFixed(3)} for ${result.tilt.angleDeg}°`,
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={`mt-6 ${CARD}`}>
            <h2 className="text-base font-semibold">The same length in every unit</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Unit
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Length
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Height
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allUnits(result.width.mm).map((row, index) => (
                    <tr key={row.unit} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{row.label}</td>
                      <td className="py-2 pr-3 text-right">{row.text}</td>
                      <td className="py-2 text-right text-[var(--muted-foreground)]">
                        {result.height ? allUnits(result.height.mm)[index].text : DASH}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={`mt-6 ${CARD}`}>
            <h2 className="text-base font-semibold">How far to trust this reading</h2>
            <ul className="mt-3 space-y-3 text-sm">
              {notes.map((note) => (
                <li key={note.text} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      note.level === "warn" ? "bg-[var(--danger)]" : "bg-[var(--primary)]"
                    }`}
                  />
                  <span className={note.level === "warn" ? "text-[var(--danger)]" : ""}>
                    {note.text}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        This is a single-photo estimate, not a survey instrument. It assumes the camera looks
        straight at the plane you are measuring and that the reference sits in that same plane. Do
        not use it for anything that has to fit, be cut, or be certified — reach for a tape, a rule
        or a caliper for that.
      </p>
    </main>
  );
}
