"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Download,
  ExternalLink,
  Hand,
  Map,
  RotateCcw,
  Ruler,
  ScanLine,
  ShieldCheck,
} from "lucide-react";

import {
  analyzeTargets,
  buildTargetReport,
} from "../lib/analyzeTargets.mjs";

const SAMPLE_TARGETS = JSON.stringify(
  [
    { label: "Menu", x: 16, y: 16, width: 44, height: 44 },
    { label: "Small icon", x: 312, y: 20, width: 18, height: 18 },
    { label: "Primary action", x: 240, y: 720, width: 104, height: 48 },
    {
      label: "Inline help link",
      x: 24,
      y: 400,
      width: 38,
      height: 18,
      exception: "inline",
    },
  ],
  null,
  2,
);

const STATUS_META = {
  "enhanced-size": {
    label: "44 px enhanced size",
    className: "border-[var(--success)] bg-[var(--success-soft)]",
  },
  "minimum-size": {
    label: "24 px minimum size",
    className: "border-[var(--primary)] bg-[var(--primary-soft)]",
  },
  "spacing-candidate": {
    label: "Spacing candidate",
    className: "border-[var(--warning)] bg-[var(--warning-soft)]",
  },
  "below-minimum": {
    label: "Below supplied geometry check",
    className: "border-[var(--danger)] bg-[var(--danger-soft)]",
  },
  "exception-review": {
    label: "Exception needs evidence",
    className: "border-[var(--warning)] bg-[var(--warning-soft)]",
  },
};

const MAP_STATUS_CLASSES = {
  "enhanced-size": "border-[var(--success)] bg-[var(--success-soft)]",
  "minimum-size": "border-[var(--primary)] bg-[var(--primary-soft)]",
  "spacing-candidate": "border-[var(--warning)] bg-[var(--warning-soft)]",
  "below-minimum": "border-[var(--danger)] bg-[var(--danger-soft)]",
  "exception-review": "border-[var(--warning)] bg-[var(--warning-soft)]",
};

const OFFICIAL_SOURCES = [
  {
    title: "WCAG 2.2 — Target Size (Minimum), Level AA",
    href: "https://www.w3.org/TR/WCAG22/#target-size-minimum",
  },
  {
    title: "Understanding Target Size (Minimum)",
    href: "https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum",
  },
  {
    title: "Understanding Target Size (Enhanced), Level AAA",
    href: "https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced",
  },
];

function downloadReport(report) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "touch-target-summary.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function TouchTargetThumbReachMap() {
  const [source, setSource] = useState("");
  const [viewportWidth, setViewportWidth] = useState("360");
  const [viewportHeight, setViewportHeight] = useState("800");
  const [hand, setHand] = useState("right");
  const [result, setResult] = useState(null);
  const report = useMemo(
    () => (result?.ok ? buildTargetReport(result) : null),
    [result],
  );

  const invalidate = () => setResult(null);
  const reset = () => {
    setSource("");
    setViewportWidth("360");
    setViewportHeight("800");
    setHand("right");
    setResult(null);
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold text-[var(--primary)]">
              <ScanLine className="h-4 w-4" aria-hidden="true" />
              Supplied CSS-pixel geometry
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[var(--foreground)] sm:text-4xl">
              Touch-Target Thumb-Reach Map
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted-foreground)]">
              Review exported target rectangles against transparent 24 px and 44 px size checks,
              spacing geometry, and an approximate one-handed reach map.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-4 lg:max-w-sm">
            <p className="font-bold text-[var(--foreground)]">Not conformance or ergonomic proof</p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              Exceptions need manual evidence, and reach depends on the person, device, grip,
              posture, orientation, and interaction context.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-[var(--foreground)]">
            <Ruler className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
            Viewport and targets
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
                Width (CSS px)
              </span>
              <input
                className="input-field min-h-11 w-full"
                type="number"
                min="1"
                max="10000"
                value={viewportWidth}
                onChange={(event) => {
                  setViewportWidth(event.target.value);
                  invalidate();
                }}
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
                Height (CSS px)
              </span>
              <input
                className="input-field min-h-11 w-full"
                type="number"
                min="1"
                max="10000"
                value={viewportHeight}
                onChange={(event) => {
                  setViewportHeight(event.target.value);
                  invalidate();
                }}
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
                Thumb origin
              </span>
              <select
                className="input-field min-h-11 w-full"
                value={hand}
                onChange={(event) => {
                  setHand(event.target.value);
                  invalidate();
                }}
              >
                <option value="right">Right hand</option>
                <option value="left">Left hand</option>
              </select>
            </label>
          </div>
          <label className="mt-5 block">
            <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
              Target JSON or CSV
            </span>
            <textarea
              className="input-field min-h-96 w-full resize-y font-mono text-xs"
              value={source}
              onChange={(event) => {
                setSource(event.target.value.slice(0, 200_000));
                invalidate();
              }}
              placeholder='[{"label":"Menu","x":16,"y":16,"width":44,"height":44}]'
              spellCheck="false"
            />
          </label>
          <div className="mt-4 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              className="btn-secondary min-h-10 px-4"
              onClick={() => {
                setSource(SAMPLE_TARGETS);
                invalidate();
              }}
            >
              Load safe example
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-[var(--foreground)]">
            <ShieldCheck className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
            Input format and limits
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted-foreground)]">
            <li className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4">
              JSON fields: label, x, y, width, height, and optional exception.
            </li>
            <li className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4">
              CSV uses the same headers. Coordinates are top-left CSS pixels in the supplied
              viewport.
            </li>
            <li className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4">
              Allowed exception values: none, equivalent, inline, user-agent, or essential. The
              tool records these for review instead of automatically passing them.
            </li>
          </ul>

          <div className="mt-5">
            <h3 className="text-sm font-bold text-[var(--foreground)]">
              Official W3C references
            </h3>
            <ul className="mt-3 space-y-2">
              {OFFICIAL_SOURCES.map((sourceItem) => (
                <li key={sourceItem.href}>
                  <a
                    className="inline-flex items-start gap-2 text-sm font-semibold text-[var(--primary)] underline-offset-4 hover:underline"
                    href={sourceItem.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {sourceItem.title}
                    <ExternalLink className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">
              Official material reviewed 24 July 2026.
            </p>
          </div>
        </section>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="btn-primary min-h-11 px-5"
          onClick={() =>
            setResult(
              analyzeTargets(source, {
                viewportWidth,
                viewportHeight,
                hand,
              }),
            )
          }
        >
          <Map className="h-4 w-4" aria-hidden="true" />
          Analyze geometry
        </button>
        <button type="button" className="btn-secondary min-h-11 px-5" onClick={reset}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
        {report ? (
          <button
            type="button"
            className="btn-secondary min-h-11 px-5"
            onClick={() => downloadReport(report)}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download counts-only summary
          </button>
        ) : null}
      </div>

      {result && !result.ok ? (
        <section
          className="rounded-lg border border-[var(--danger)] bg-[var(--danger-soft)] p-5"
          role="alert"
        >
          <h2 className="font-bold text-[var(--foreground)]">Check these inputs</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
            {result.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {result?.ok ? (
        <section className="space-y-6" aria-live="polite">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Targets", result.counts.targets],
              ["44 px size", result.counts.enhancedSize],
              ["24 px size", result.counts.minimumSize],
              ["Below geometry check", result.counts.belowMinimum],
              ["Spacing candidates", result.counts.spacingCandidates],
              ["Exception review", result.counts.exceptionReview],
              ["Outside viewport", result.counts.outsideViewport],
              ["Far reach heuristic", result.counts.farReach],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {label}
                </p>
                <p className="mt-2 text-3xl font-black text-[var(--foreground)]">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
              <h2 className="flex items-center gap-2 text-xl font-bold text-[var(--foreground)]">
                <Hand className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
                Geometry map
              </h2>
              <div className="mt-5 flex justify-center overflow-auto rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4">
                <div
                  className="relative w-full max-w-sm overflow-hidden border border-[var(--border-strong)] bg-[var(--background)] shadow-sm"
                  style={{
                    aspectRatio: `${result.viewport.width} / ${result.viewport.height}`,
                  }}
                >
                  {result.targets.map((target) => (
                    <div
                      key={target.index}
                      className={`absolute overflow-hidden border text-[var(--foreground)] ${MAP_STATUS_CLASSES[target.status]}`}
                      style={{
                        left: `${(target.x / result.viewport.width) * 100}%`,
                        top: `${(target.y / result.viewport.height) * 100}%`,
                        width: `${(target.width / result.viewport.width) * 100}%`,
                        height: `${(target.height / result.viewport.height) * 100}%`,
                      }}
                      title={`${target.label}: ${target.width} × ${target.height} CSS px`}
                    />
                  ))}
                  <span
                    className={`absolute bottom-2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] ${
                      result.hand === "left" ? "left-2" : "right-2"
                    }`}
                    title={`${result.hand} thumb origin heuristic`}
                  >
                    <Hand className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-bold text-[var(--foreground)]">Target review</h2>
              <div className="mt-4 max-h-screen space-y-3 overflow-y-auto">
                {result.targets.map((target) => {
                  const meta = STATUS_META[target.status];
                  return (
                    <article
                      key={target.index}
                      className={`rounded-lg border p-4 ${meta.className}`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="break-words font-bold text-[var(--foreground)]">
                          {target.label}
                        </h3>
                        <span className="text-xs font-bold text-[var(--muted-foreground)]">
                          {meta.label}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                        {target.width} × {target.height} CSS px at ({target.x}, {target.y}).{" "}
                        {target.message}
                      </p>
                      <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                        {target.reach.label}
                        {target.outsideViewport ? " · Extends outside supplied viewport" : ""}
                      </p>
                    </article>
                  );
                })}
              </div>
            </section>
          </div>

          <section className="rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <div>
                <h2 className="font-bold text-[var(--foreground)]">Manual review remains required</h2>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
                  {result.limitations.map((limit) => (
                    <li key={limit}>{limit}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </section>
      ) : null}
    </main>
  );
}
