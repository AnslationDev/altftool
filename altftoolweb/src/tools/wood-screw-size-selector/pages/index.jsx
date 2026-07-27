"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, RotateCcw, Wrench } from "lucide-react";

import {
  BASE_MATERIALS,
  EMBEDMENT_MULTIPLIER,
  JOINT_TYPES,
  TIP_CLEARANCE_MM,
  pilotChart,
  selectWoodScrew,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const n1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : "—");

const LOADS = [
  { id: "light", label: "Light (trim, beading, small panels)" },
  { id: "normal", label: "Normal (carcase, shelves, frames)" },
  { id: "heavy", label: "Heavy (worktops, structural, load bearing)" },
];

const DEFAULTS = {
  topThicknessMm: "18",
  baseThicknessMm: "44",
  baseMaterial: "softwood",
  jointType: "face",
  load: "normal",
  throughFixing: false,
  predrilled: true,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const result = useMemo(() => selectWoodScrew(form), [form]);
  const chart = useMemo(() => pilotChart(), []);
  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Wood Screw Size Selector",
      `Screw: ${result.gauge} x ${result.lengthMm} mm (${result.lengthInch}), major diameter ${n1(result.majorMm)} mm`,
      `Embedment in the base board: ${n1(result.embedmentMm)} mm`,
      `Pilot hole: ${n1(result.pilotMm)} mm`,
      `Clearance hole in the top board: ${n1(result.clearanceMm)} mm`,
      `Countersink to: ${n1(result.countersinkMm)} mm`,
      `Keep ${n1(result.endDistanceMm)} mm from an end and ${n1(result.edgeDistanceMm)} mm from an edge`,
    ].join("\n");
  }, [ok, result]);

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
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Wrench className="h-4 w-4" aria-hidden="true" />
          Carpentry &amp; woodwork
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Wood Screw Size Selector</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the two board thicknesses and the joint you are making. The gauge follows the
          thickness of the board being screwed into, the length follows the rule that a screw should
          bury about twice the top board&apos;s thickness, and the pilot hole is sized as a fraction of
          the screw&apos;s major diameter for the material you name.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ws-top">
              Top board thickness (mm)
            </label>
            <input
              id="ws-top"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={form.topThicknessMm}
              onChange={set("topThicknessMm")}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">The board the screw passes through.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ws-base">
              Base board thickness (mm)
            </label>
            <input
              id="ws-base"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={form.baseThicknessMm}
              onChange={set("baseThicknessMm")}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">The board the thread bites into.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ws-material">
              Base material
            </label>
            <select
              id="ws-material"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.baseMaterial}
              onChange={set("baseMaterial")}
            >
              {BASE_MATERIALS.map((material) => (
                <option key={material.id} value={material.id}>
                  {material.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ws-joint">
              Joint type
            </label>
            <select id="ws-joint" className={`mt-2 ${INPUT_CLASS}`} value={form.jointType} onChange={set("jointType")}>
              {JOINT_TYPES.map((joint) => (
                <option key={joint.id} value={joint.id}>
                  {joint.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ws-load">
              Load on the joint
            </label>
            <select id="ws-load" className={`mt-2 ${INPUT_CLASS}`} value={form.load} onChange={set("load")}>
              {LOADS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col justify-center gap-3">
            <label className="flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="ws-predrill">
              <input
                id="ws-predrill"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                checked={form.predrilled}
                onChange={set("predrilled")}
              />
              I will drill a pilot hole
            </label>
            <label className="flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="ws-through">
              <input
                id="ws-through"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                checked={form.throughFixing}
                onChange={set("throughFixing")}
              />
              The tip may break through the far face
            </label>
          </div>
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Use this screw
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${result.gauge} × ${result.lengthMm} mm` : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.lengthInch} · ${n1(result.majorMm)} mm shank · ${n1(result.embedmentMm)} mm of thread in the base board`
                : "Fix the inputs above to see a recommendation"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy screw size recommendation"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
            ["Pilot hole in the base board", ok ? `${n1(result.pilotMm)} mm` : "—"],
            ["Clearance hole in the top board", ok ? `${n1(result.clearanceMm)} mm` : "—"],
            ["Countersink diameter", ok ? `${n1(result.countersinkMm)} mm` : "—"],
            ["Ideal length before rounding", ok ? `${n1(result.idealLengthMm)} mm` : "—"],
            ["Longest screw that still fits", ok ? `${n1(result.maxEmbedmentMm)} mm of thread` : "—"],
            [
              "Next size down / up",
              ok
                ? `${result.shorterOption ? `${result.shorterOption.mm} mm` : "none"} / ${result.longerOption ? `${result.longerOption.mm} mm` : "none"}`
                : "—",
            ],
            ["Minimum distance from an end", ok ? `${n1(result.endDistanceMm)} mm` : "—"],
            ["Minimum distance from an edge", ok ? `${n1(result.edgeDistanceMm)} mm` : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {result.materialNote}
          </p>
        ) : null}

        {ok && result.warnings.length > 0 ? (
          <ul className="mt-3 grid gap-2">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="flex items-start gap-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Gauge, pilot and countersink chart</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[400px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Gauge</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Shank</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Pilot softwood</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Pilot hardwood</th>
                <th scope="col" className="py-2 text-right font-semibold">Countersink</th>
              </tr>
            </thead>
            <tbody>
              {chart.map((entry) => (
                <tr key={entry.gauge} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{entry.gauge}</td>
                  <td className="py-2 pr-3 text-right">{n1(entry.majorMm)} mm</td>
                  <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                    {n1(entry.pilotSoftwoodMm)} mm
                  </td>
                  <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                    {n1(entry.pilotHardwoodMm)} mm
                  </td>
                  <td className="py-2 text-right">{n1(entry.countersinkMm)} mm</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Length target = top board thickness plus {EMBEDMENT_MULTIPLIER} × that thickness of
          embedment, capped so the tip stops at least {TIP_CLEARANCE_MM} mm short of the far face on
          a blind joint.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Workshop guidance for general joinery, not a structural design. Anything carrying people or
        significant load — stair treads, wall-hung cabinets, decking, timber frames — should follow
        the fixing schedule from the manufacturer or a structural engineer.
      </p>
    </main>
  );
}
