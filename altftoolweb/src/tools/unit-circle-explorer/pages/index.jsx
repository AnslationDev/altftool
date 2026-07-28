"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, CircleDot, Copy, RotateCcw } from "lucide-react";
import {
  SPECIAL_ANGLES,
  degreesToRadians,
  describeAngle,
  formatAsPiMultiple,
} from "../lib";

const DASH = "—";

const ratioFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});
const angleFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 });

const DEFAULT_ANGLE = 30;

/** SVG canvas geometry (view units, not CSS pixels). */
const VIEW = 320;
const CENTER = VIEW / 2;
const RADIUS = 128;

export default function UnitCircleExplorer() {
  const [unit, setUnit] = useState("degrees");
  const [angleText, setAngleText] = useState(String(DEFAULT_ANGLE));
  const [copied, setCopied] = useState(false);

  const parsed = angleText.trim() === "" ? Number.NaN : Number(angleText);
  const result = useMemo(() => describeAngle(parsed, unit), [parsed, unit]);
  const figures = result.error ? null : result;

  const setDegrees = useCallback(
    (degrees) => {
      if (unit === "degrees") {
        setAngleText(String(degrees));
      } else {
        const radians = degreesToRadians(degrees);
        setAngleText(radians === null ? "" : radians.toFixed(6));
      }
      setCopied(false);
    },
    [unit],
  );

  const reset = useCallback(() => {
    setUnit("degrees");
    setAngleText(String(DEFAULT_ANGLE));
    setCopied(false);
  }, []);

  const summary = useMemo(() => {
    if (!figures) return "";
    const lines = [
      `Angle: ${angleFormat.format(figures.degrees)}° = ${angleFormat.format(figures.radians)} rad (${formatAsPiMultiple(figures.radians)})`,
      `Point on unit circle: (${ratioFormat.format(figures.x)}, ${ratioFormat.format(figures.y)})`,
      `${figures.quadrantLabel} — reference angle ${angleFormat.format(figures.referenceDegrees)}°`,
    ];
    for (const ratio of figures.ratios) {
      lines.push(
        `${ratio.key} θ = ${ratio.value === null ? "undefined" : ratioFormat.format(ratio.value)}`,
      );
    }
    return lines.join("\n");
  }, [figures]);

  const copyResult = useCallback(async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }, [summary]);

  const pointX = figures ? CENTER + figures.x * RADIUS : CENTER + RADIUS;
  const pointY = figures ? CENTER - figures.y * RADIUS : CENTER;
  const sweepLarge = figures && figures.normalizedDegrees > 180 ? 1 : 0;
  const arcRadius = RADIUS * 0.28;
  const arcPath = figures
    ? `M ${CENTER + arcRadius} ${CENTER} A ${arcRadius} ${arcRadius} 0 ${sweepLarge} 0 ${
        CENTER + figures.x * arcRadius
      } ${CENTER - figures.y * arcRadius}`
    : "";

  const sliderDegrees = figures ? figures.normalizedDegrees : 0;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <header className="mb-6 flex items-start gap-3">
        <CircleDot aria-hidden="true" className="mt-1 h-6 w-6 text-[var(--primary)]" />
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Unit Circle Explorer</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Any angle θ meets the unit circle at (cos θ, sin θ). Move the angle and watch the
            coordinates, quadrant, reference angle and all six ratios update.
          </p>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="uce-angle" className="text-sm font-medium text-[var(--foreground)]">
            Angle
          </label>
          <input
            id="uce-angle"
            type="number"
            step={unit === "degrees" ? 1 : 0.01}
            value={angleText}
            onChange={(event) => {
              setAngleText(event.target.value);
              setCopied(false);
            }}
            className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="uce-unit" className="text-sm font-medium text-[var(--foreground)]">
            Angle unit
          </label>
          <select
            id="uce-unit"
            value={unit}
            onChange={(event) => {
              setUnit(event.target.value);
              setCopied(false);
            }}
            className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
          >
            <option value="degrees">Degrees</option>
            <option value="radians">Radians</option>
          </select>
        </div>
      </section>

      <div className="mt-4 flex flex-col gap-1.5">
        <label htmlFor="uce-slider" className="text-sm font-medium text-[var(--foreground)]">
          Drag around the circle (0° to 360°)
        </label>
        <input
          id="uce-slider"
          type="range"
          min={0}
          max={360}
          step={1}
          value={sliderDegrees}
          onChange={(event) => setDegrees(Number(event.target.value))}
          className="h-11 w-full accent-[var(--primary)] focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {SPECIAL_ANGLES.map((entry) => (
          <button
            key={entry.degrees}
            type="button"
            onClick={() => setDegrees(entry.degrees)}
            className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-medium text-[var(--foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
          >
            {entry.degrees}°
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-[var(--card)] p-4 ring-1 ring-[var(--border)]">
          <svg
            viewBox={`0 0 ${VIEW} ${VIEW}`}
            role="img"
            aria-label={
              figures
                ? `Unit circle with the terminal point at ${angleFormat.format(figures.normalizedDegrees)} degrees`
                : "Unit circle"
            }
            className="mx-auto block h-auto w-full max-w-[320px]"
          >
            <line
              x1={CENTER - RADIUS - 20}
              y1={CENTER}
              x2={CENTER + RADIUS + 20}
              y2={CENTER}
              stroke="var(--border)"
              strokeWidth="1.5"
            />
            <line
              x1={CENTER}
              y1={CENTER - RADIUS - 20}
              x2={CENTER}
              y2={CENTER + RADIUS + 20}
              stroke="var(--border)"
              strokeWidth="1.5"
            />
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke="var(--border)"
              strokeWidth="2"
            />
            {figures ? (
              <>
                <path d={arcPath} fill="none" stroke="var(--primary)" strokeWidth="2" />
                <line
                  x1={CENTER}
                  y1={CENTER}
                  x2={pointX}
                  y2={pointY}
                  stroke="var(--primary)"
                  strokeWidth="2.5"
                />
                <line
                  x1={pointX}
                  y1={pointY}
                  x2={pointX}
                  y2={CENTER}
                  stroke="var(--success)"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />
                <line
                  x1={pointX}
                  y1={CENTER}
                  x2={CENTER}
                  y2={CENTER}
                  stroke="var(--muted-foreground)"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />
                <circle cx={pointX} cy={pointY} r="6" fill="var(--primary)" />
              </>
            ) : null}
          </svg>
          <p className="mt-3 text-center text-sm text-[var(--muted-foreground)]">
            Solid line is the radius, dashed vertical is sin θ, dashed horizontal is cos θ.
          </p>
        </div>

        <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <p className="text-sm text-[var(--muted-foreground)]">Point on the unit circle</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight break-words text-[var(--foreground)] sm:text-4xl">
            {figures
              ? `(${ratioFormat.format(figures.x)}, ${ratioFormat.format(figures.y)})`
              : DASH}
          </p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {figures ? `${figures.quadrantLabel} · ${figures.quadrantNote}` : "Enter an angle"}
          </p>

          {result.error ? (
            <p
              role="alert"
              className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
            >
              {result.error}
            </p>
          ) : null}

          <dl className="mt-5 grid gap-3">
            <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-sm text-[var(--muted-foreground)]">Angle in degrees</dt>
              <dd className="font-medium text-[var(--foreground)]">
                {figures ? `${angleFormat.format(figures.degrees)}°` : DASH}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-sm text-[var(--muted-foreground)]">Angle in radians</dt>
              <dd className="font-medium text-[var(--foreground)]">
                {figures
                  ? `${angleFormat.format(figures.radians)} (${formatAsPiMultiple(figures.radians)})`
                  : DASH}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-sm text-[var(--muted-foreground)]">Coterminal angle 0–360°</dt>
              <dd className="font-medium text-[var(--foreground)]">
                {figures ? `${angleFormat.format(figures.normalizedDegrees)}°` : DASH}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-sm text-[var(--muted-foreground)]">Reference angle</dt>
              <dd className="font-medium text-[var(--foreground)]">
                {figures ? `${angleFormat.format(figures.referenceDegrees)}°` : DASH}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-sm text-[var(--muted-foreground)]">Arc length from (1, 0)</dt>
              <dd className="font-medium text-[var(--foreground)]">
                {figures ? angleFormat.format(figures.arcLength) : DASH}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
              <dt className="text-sm text-[var(--muted-foreground)]">Full turns</dt>
              <dd className="font-medium text-[var(--foreground)]">
                {figures ? angleFormat.format(figures.turns) : DASH}
              </dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={copyResult}
              disabled={!figures}
              aria-label="Copy unit circle result to clipboard"
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] transition active:scale-[0.98] disabled:opacity-50 motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
            >
              {copied ? (
                <Check aria-hidden="true" className="h-4 w-4" />
              ) : (
                <Copy aria-hidden="true" className="h-4 w-4" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-medium text-[var(--foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
            >
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
              Reset
            </button>
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">All six ratios</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th scope="col" className="py-2 pr-4 font-medium text-[var(--muted-foreground)]">
                  Ratio
                </th>
                <th scope="col" className="py-2 pr-4 font-medium text-[var(--muted-foreground)]">
                  Value
                </th>
                <th scope="col" className="py-2 font-medium text-[var(--muted-foreground)]">
                  Note
                </th>
              </tr>
            </thead>
            <tbody>
              {(figures ? figures.ratios : []).map((ratio) => (
                <tr key={ratio.key} className="border-b border-[var(--border)]">
                  <td className="py-2 pr-4 font-mono text-[var(--foreground)]">{ratio.label}</td>
                  <td className="py-2 pr-4 font-medium text-[var(--foreground)]">
                    {ratio.value === null ? "undefined" : ratioFormat.format(ratio.value)}
                  </td>
                  <td className="py-2 text-[var(--muted-foreground)]">{ratio.note || "—"}</td>
                </tr>
              ))}
              {figures ? null : (
                <tr>
                  <td colSpan={3} className="py-3 text-[var(--muted-foreground)]">
                    {DASH}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {figures && figures.exact ? (
          <p className="mt-4 rounded-md bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]">
            Exact values at {angleFormat.format(figures.normalizedDegrees)}° ({figures.exact.radianLabel}):
            {" "}sin = {figures.exact.sin}, cos = {figures.exact.cos}, tan = {figures.exact.tan}.
          </p>
        ) : null}
      </section>
    </div>
  );
}
