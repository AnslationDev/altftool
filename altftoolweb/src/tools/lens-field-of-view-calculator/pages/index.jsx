"use client";

import { useMemo, useState } from "react";
import { Camera, Check, Copy, RotateCcw } from "lucide-react";

import {
  buildLensComparison,
  calculateFieldOfView,
  distanceToFrameSubject,
  SENSOR_PRESETS,
} from "../lib";

const DEFAULTS = {
  sensorId: "full-frame",
  focalLength: "50",
  distance: "3",
  aperture: "8",
  subjectHeight: "1.8",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-60";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const fmt = (digits) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits });
const deg = (value) => (Number.isFinite(value) ? `${fmt(1).format(value)}°` : DASH);
const metres = (value) => (Number.isFinite(value) ? `${fmt(2).format(value)} m` : DASH);
const mm = (value) => (Number.isFinite(value) ? `${fmt(1).format(value)} mm` : DASH);

const toNumber = (raw) => {
  const cleaned = String(raw).replace(/,/g, "").trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

function Row({ label, value }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--border)] py-2 last:border-b-0">
      <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
      <dd className="text-sm font-semibold text-[var(--foreground)]">{value}</dd>
    </div>
  );
}

export default function ToolHome() {
  const [sensorId, setSensorId] = useState(DEFAULTS.sensorId);
  const [focalLength, setFocalLength] = useState(DEFAULTS.focalLength);
  const [distance, setDistance] = useState(DEFAULTS.distance);
  const [aperture, setAperture] = useState(DEFAULTS.aperture);
  const [subjectHeight, setSubjectHeight] = useState(DEFAULTS.subjectHeight);
  const [copied, setCopied] = useState(false);

  const sensor = useMemo(
    () => SENSOR_PRESETS.find((preset) => preset.id === sensorId) ?? SENSOR_PRESETS[1],
    [sensorId],
  );

  const result = useMemo(
    () =>
      calculateFieldOfView({
        focalLength: toNumber(focalLength),
        sensorWidth: sensor.width,
        sensorHeight: sensor.height,
        distance: toNumber(distance),
        aperture: toNumber(aperture),
      }),
    [focalLength, sensor, distance, aperture],
  );

  const hasError = Boolean(result.error);

  const framing = useMemo(
    () => distanceToFrameSubject(toNumber(subjectHeight), toNumber(focalLength), sensor.height),
    [subjectHeight, focalLength, sensor],
  );

  const comparison = useMemo(
    () =>
      buildLensComparison({
        sensorWidth: sensor.width,
        sensorHeight: sensor.height,
        distance: toNumber(distance),
        aperture: toNumber(aperture),
      }),
    [sensor, distance, aperture],
  );

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Lens Field of View",
      `Sensor: ${sensor.label}`,
      `Lens: ${result.focalLength} mm at f/${result.aperture}`,
      `Angle of view: ${deg(result.horizontalAov)} horizontal, ${deg(result.verticalAov)} vertical, ${deg(result.diagonalAov)} diagonal`,
      `Crop factor: ${fmt(2).format(result.cropFactor)}× (35 mm equivalent ${fmt(0).format(result.equivalentFocalLength)} mm)`,
      `Coverage at ${metres(result.distance)}: ${metres(result.coverageWidth)} wide × ${metres(result.coverageHeight)} tall`,
      `Hyperfocal distance: ${metres(result.hyperfocalM)}`,
      `Depth of field: ${metres(result.nearLimitM)} to ${result.farLimitM === null ? "infinity" : metres(result.farLimitM)}`,
    ].join("\n");
  }, [hasError, sensor, result]);

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
    setSensorId(DEFAULTS.sensorId);
    setFocalLength(DEFAULTS.focalLength);
    setDistance(DEFAULTS.distance);
    setAperture(DEFAULTS.aperture);
    setSubjectHeight(DEFAULTS.subjectHeight);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Camera className="h-4 w-4" aria-hidden="true" />
          Camera optics
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Lens Field of View Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Angle of view, crop factor, scene coverage and depth of field for any focal length on any
          sensor, using the thin-lens formula AOV = 2·arctan(sensor ÷ 2f).
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={LABEL_CLASS} htmlFor="fov-sensor">
            Sensor / format
          </label>
          <select
            id="fov-sensor"
            className={`${INPUT_CLASS} mt-1`}
            value={sensorId}
            onChange={(event) => setSensorId(event.target.value)}
          >
            {SENSOR_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="fov-focal">
            Focal length (mm)
          </label>
          <input
            id="fov-focal"
            className={`${INPUT_CLASS} mt-1`}
            value={focalLength}
            onChange={(event) => setFocalLength(event.target.value)}
            type="number"
            min="1"
            step="1"
            inputMode="decimal"
          />
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="fov-distance">
            Subject distance (m)
          </label>
          <input
            id="fov-distance"
            className={`${INPUT_CLASS} mt-1`}
            value={distance}
            onChange={(event) => setDistance(event.target.value)}
            type="number"
            min="0.05"
            step="0.1"
            inputMode="decimal"
          />
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="fov-aperture">
            Aperture (f-number)
          </label>
          <input
            id="fov-aperture"
            className={`${INPUT_CLASS} mt-1`}
            value={aperture}
            onChange={(event) => setAperture(event.target.value)}
            type="number"
            min="0.7"
            step="0.1"
            inputMode="decimal"
          />
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="fov-subject">
            Subject height to frame (m)
          </label>
          <input
            id="fov-subject"
            className={`${INPUT_CLASS} mt-1`}
            value={subjectHeight}
            onChange={(event) => setSubjectHeight(event.target.value)}
            type="number"
            min="0.01"
            step="0.1"
            inputMode="decimal"
          />
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        {hasError ? (
          <p role="alert" className="mb-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            {result.error}
          </p>
        ) : null}

        <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
          Diagonal angle of view
        </p>
        <p className="mt-1 text-4xl leading-none font-bold">
          {hasError ? DASH : deg(result.diagonalAov)}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {hasError
            ? DASH
            : `${sensor.label.split(" (")[0]} · ${result.focalLength} mm · 35 mm equivalent ${fmt(0).format(result.equivalentFocalLength)} mm`}
        </p>

        <dl className="mt-4">
          <Row label="Horizontal angle of view" value={hasError ? DASH : deg(result.horizontalAov)} />
          <Row label="Vertical angle of view" value={hasError ? DASH : deg(result.verticalAov)} />
          <Row label="Crop factor" value={hasError ? DASH : `${fmt(2).format(result.cropFactor)}×`} />
          <Row
            label="Sensor diagonal"
            value={hasError ? DASH : mm(result.sensorDiagonal)}
          />
          <Row
            label={`Scene width at ${hasError ? DASH : metres(result.distance)}`}
            value={hasError ? DASH : metres(result.coverageWidth)}
          />
          <Row
            label="Scene height at that distance"
            value={hasError ? DASH : metres(result.coverageHeight)}
          />
          <Row
            label="Magnification"
            value={hasError || result.magnification === null ? DASH : `${fmt(3).format(result.magnification)}×`}
          />
          <Row label="Circle of confusion" value={hasError ? DASH : `${fmt(3).format(result.circleOfConfusion)} mm`} />
          <Row label="Hyperfocal distance" value={hasError ? DASH : metres(result.hyperfocalM)} />
          <Row
            label="Depth of field"
            value={
              hasError
                ? DASH
                : `${metres(result.nearLimitM)} → ${result.farLimitM === null ? "infinity" : metres(result.farLimitM)}`
            }
          />
          <Row
            label={`Distance to frame a ${subjectHeight || "0"} m subject`}
            value={framing.error ? DASH : metres(framing.distance)}
          />
        </dl>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            className={PRIMARY_BTN}
            onClick={copyResult}
            aria-label="Copy the field of view result to the clipboard"
            disabled={hasError}
          >
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy result"}
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-lg font-semibold">Common focal lengths on this sensor</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-md border-collapse text-sm">
            <thead>
              <tr className="text-left text-[var(--muted-foreground)]">
                <th scope="col" className="border-b border-[var(--border)] py-2 pr-3 font-medium">Focal</th>
                <th scope="col" className="border-b border-[var(--border)] py-2 pr-3 font-medium">Diagonal AOV</th>
                <th scope="col" className="border-b border-[var(--border)] py-2 pr-3 font-medium">Horizontal AOV</th>
                <th scope="col" className="border-b border-[var(--border)] py-2 pr-3 font-medium">Scene width</th>
                <th scope="col" className="border-b border-[var(--border)] py-2 font-medium">35 mm equiv.</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr key={row.focalLength}>
                  <td className="border-b border-[var(--border)] py-2 pr-3 font-semibold">{row.focalLength} mm</td>
                  <td className="border-b border-[var(--border)] py-2 pr-3">{deg(row.diagonalAov)}</td>
                  <td className="border-b border-[var(--border)] py-2 pr-3">{deg(row.horizontalAov)}</td>
                  <td className="border-b border-[var(--border)] py-2 pr-3">{metres(row.coverageWidth)}</td>
                  <td className="border-b border-[var(--border)] py-2">{fmt(0).format(row.equivalentFocalLength)} mm</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {comparison.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            Enter a valid distance and aperture to see the comparison.
          </p>
        ) : null}
      </section>

      <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
        Depth of field uses a circle of confusion of sensor diagonal ÷ 1500 (0.029 mm on full
        frame), the convention behind most published DoF tables. Real lenses breathe, so a marked
        50 mm may behave like 47 mm at close focus.
      </p>
    </main>
  );
}
