"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Triangle } from "lucide-react";

import {
  ASSET_CLASSES,
  DEFAULT_VERTEX_DUPLICATION,
  THROUGHPUT_TIERS,
  planTriangleBudget,
  shareFromPercent,
} from "../lib";

const INT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const DEC = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const int = (value) => INT.format(Number.isFinite(value) ? value : 0);
const dec = (value) => DEC.format(Number.isFinite(value) ? value : 0);

const DASH = "—";

const DEFAULTS = {
  triRate: "100",
  fps: "60",
  geometryPercent: "50",
  duplication: String(DEFAULT_VERTEX_DUPLICATION),
  classes: ASSET_CLASSES.map((item) => ({ ...item })),
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [triRate, setTriRate] = useState(DEFAULTS.triRate);
  const [fps, setFps] = useState(DEFAULTS.fps);
  const [geometryPercent, setGeometryPercent] = useState(DEFAULTS.geometryPercent);
  const [duplication, setDuplication] = useState(DEFAULTS.duplication);
  const [classes, setClasses] = useState(DEFAULTS.classes);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      planTriangleBudget({
        triRateMillionPerSec: Number(triRate),
        targetFps: Number(fps),
        geometryShare: shareFromPercent(geometryPercent),
        classes,
        duplication: Number(duplication),
      }),
    [triRate, fps, geometryPercent, duplication, classes],
  );

  const failed = Boolean(plan.error);

  const updateClass = (id, field, value) => {
    setClasses((current) =>
      current.map((item) => (item.id === id ? { ...item, [field]: Number(value) } : item)),
    );
  };

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Low poly triangle budget",
      `Frame time: ${dec(plan.frameTimeMs)} ms · geometry slice ${dec(plan.geometryBudgetMs)} ms`,
      `On-screen triangle budget: ${int(plan.triangleBudget)}`,
      `Buffer memory: ${dec(plan.totalMemoryMb)} MB across ${int(plan.totalInstances)} instances`,
      "",
      ...plan.rows.map(
        (row) =>
          `${row.label}: ${int(row.classBudget)} tris total, ${int(row.instances)} visible, ${int(row.perInstance)} per instance (LODs ${row.lods
            .map((lod) => int(lod.triangles))
            .join(" / ")})`,
      ),
    ].join("\n");
  }, [plan, failed]);

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
    setTriRate(DEFAULTS.triRate);
    setFps(DEFAULTS.fps);
    setGeometryPercent(DEFAULTS.geometryPercent);
    setDuplication(DEFAULTS.duplication);
    setClasses(ASSET_CLASSES.map((item) => ({ ...item })));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Triangle className="h-4 w-4" aria-hidden="true" />
          Real-time art budget
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Low Poly Budget Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn measured geometry throughput and a frame-rate target into an on-screen triangle
          budget, then split it across asset classes with LOD chains and buffer memory per mesh.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lpb-rate">
              Geometry throughput (million tris/sec)
            </label>
            <input
              id="lpb-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="10"
              value={triRate}
              onChange={(event) => setTriRate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lpb-fps">
              Target frame rate (fps)
            </label>
            <input
              id="lpb-fps"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="1000"
              step="1"
              value={fps}
              onChange={(event) => setFps(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lpb-share">
              Share of the frame geometry may use (%)
            </label>
            <input
              id="lpb-share"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="5"
              value={geometryPercent}
              onChange={(event) => setGeometryPercent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lpb-dup">
              Vertex duplication factor (seams & hard edges)
            </label>
            <input
              id="lpb-dup"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="4"
              step="0.1"
              value={duplication}
              onChange={(event) => setDuplication(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {THROUGHPUT_TIERS.map((tier) => (
            <button
              key={tier.id}
              type="button"
              className={CHIP_BTN}
              onClick={() => setTriRate(String(tier.triRateMillionPerSec))}
            >
              {tier.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Tiers are broad starting points, not vendor specifications. Profile one representative
          scene on your own target device and replace the number.
        </p>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Asset classes</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Set each class&apos;s share of the budget and how many are visible at once.
        </p>
        <div className="mt-4 space-y-4">
          {classes.map((item) => (
            <div key={item.id} className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm text-[var(--muted-foreground)]" htmlFor={`lpb-w-${item.id}`}>
                  {item.label} — share
                </label>
                <input
                  id={`lpb-w-${item.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="100"
                  step="1"
                  value={item.weight}
                  onChange={(event) => updateClass(item.id, "weight", event.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--muted-foreground)]" htmlFor={`lpb-i-${item.id}`}>
                  {item.label} — visible at once
                </label>
                <input
                  id={`lpb-i-${item.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  value={item.instances}
                  onChange={(event) => updateClass(item.id, "instances", event.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              On-screen triangle budget
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : int(plan.triangleBudget)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the inputs above to get a budget."
                : `per frame at ${fps} fps · ${dec(plan.geometryBudgetMs)} ms of a ${dec(plan.frameTimeMs)} ms frame`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the triangle budget plan"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy budget"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Frame time", failed ? DASH : `${dec(plan.frameTimeMs)} ms`],
            ["Geometry slice of the frame", failed ? DASH : `${dec(plan.geometryBudgetMs)} ms`],
            ["Triangles allocated", failed ? DASH : int(plan.allocatedTriangles)],
            ["Triangles left unallocated", failed ? DASH : int(plan.unallocatedTriangles)],
            ["Visible instances", failed ? DASH : int(plan.totalInstances)],
            ["Vertex + index buffer memory", failed ? DASH : `${dec(plan.totalMemoryMb)} MB`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Per-asset budgets and LOD chain</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Asset class</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Class total</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Per instance</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">LOD1 / 2 / 3</th>
                  <th scope="col" className="py-2 text-right font-semibold">Verts · index</th>
                </tr>
              </thead>
              <tbody>
                {plan.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{row.label}</span>
                      <span className="block text-xs text-[var(--muted-foreground)]">
                        {dec(row.share)}% · {int(row.instances)} visible
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right">{int(row.classBudget)}</td>
                    <td className="py-2 pr-3 text-right font-semibold">{int(row.perInstance)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {row.lods
                        .slice(1)
                        .map((lod) => int(lod.triangles))
                        .join(" / ")}
                    </td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {int(row.gpuVertices)} · {row.indexWidth}-bit
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Triangle count is only one cost. Draw calls, overdraw, shader complexity and texture
        bandwidth often bite first — use this as a starting allocation, then profile the real frame.
      </p>
    </main>
  );
}
