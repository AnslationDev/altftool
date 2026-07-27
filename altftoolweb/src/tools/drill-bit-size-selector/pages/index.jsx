"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Drill, RotateCcw } from "lucide-react";

import {
  ISO_273_CLEARANCE,
  METRIC_COARSE,
  PILOT_FACTORS,
  WALL_PLUGS,
  gaugeToMm,
  selectDrillBit,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const mm1 = (v) => (Number.isFinite(v) ? `${NUM1.format(v)} mm` : DASH);
const mm2 = (v) => (Number.isFinite(v) ? `${NUM2.format(v)} mm` : DASH);

const MODES = [
  { id: "wood", label: "Wood screw — pilot and clearance" },
  { id: "tap", label: "Metric thread — tap and clearance" },
  { id: "plug", label: "Wall plug or anchor" },
];

const FITS = [
  { id: "close", label: "Close fit — located, no adjustment" },
  { id: "medium", label: "Medium fit — the normal choice" },
  { id: "free", label: "Free fit — allows for misalignment" },
];

const DEFAULTS = {
  mode: "wood",
  screwDia: "4.2",
  screwLen: "50",
  material: "softwood",
  thread: "M6",
  fit: "medium",
  plugDia: "6",
  plugLen: "30",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

const GAUGE_OPTIONS = [4, 6, 8, 10, 12, 14];

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [screwDia, setScrewDia] = useState(DEFAULTS.screwDia);
  const [screwLen, setScrewLen] = useState(DEFAULTS.screwLen);
  const [material, setMaterial] = useState(DEFAULTS.material);
  const [thread, setThread] = useState(DEFAULTS.thread);
  const [fit, setFit] = useState(DEFAULTS.fit);
  const [plugDia, setPlugDia] = useState(DEFAULTS.plugDia);
  const [plugLen, setPlugLen] = useState(DEFAULTS.plugLen);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      selectDrillBit({
        mode,
        screwDiameterMm: toNumber(screwDia),
        screwLengthMm: toNumber(screwLen),
        material,
        threadSize: thread,
        fit,
        plugDrillMm: toNumber(plugDia),
        plugLengthMm: toNumber(plugLen),
      }),
    [mode, screwDia, screwLen, material, thread, fit, plugDia, plugLen],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    if (result.mode === "wood") {
      return [
        "Drill Bit Selector — wood screw",
        `Screw: ${screwDia} mm outer diameter (about gauge ${result.gauge}), ${screwLen} mm long`,
        `Material: ${result.material.label}`,
        `Pilot hole: ${result.pilotBit} mm (${result.pilotBitInch?.text ?? ""}), calculated ${NUM2.format(result.pilotMm)} mm`,
        `Clearance hole in the top piece: ${result.clearanceBit} mm`,
        `Countersink to about ${NUM1.format(result.countersinkMm)} mm`,
        `Drill depth: ${result.depthMm} mm`,
      ].join("\n");
    }
    if (result.mode === "tap") {
      return [
        "Drill Bit Selector — metric thread",
        `${result.thread.size} coarse, pitch ${result.thread.pitch} mm`,
        `Tap drill: ${NUM2.format(result.tapDrillMm)} mm (D − P), about ${result.engagementPct.toFixed(0)}% thread`,
        `Nearest standard bit: ${result.tapBit} mm`,
        `Clearance hole (${result.fit} fit, ISO 273): ${result.clearanceMm} mm`,
      ].join("\n");
    }
    return [
      "Drill Bit Selector — wall plug",
      `Plug: ${plugDia} mm diameter, ${plugLen} mm long`,
      `Masonry bit: ${result.plugBit} mm (${result.plugBitInch?.text ?? ""})`,
      `Drill depth: ${result.depthMm} mm`,
      result.matchedPlug ? `Matches a ${result.matchedPlug.colour.toLowerCase()} plug — ${result.matchedPlug.screws}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [failed, result, screwDia, screwLen, plugDia, plugLen]);

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
    setMode(DEFAULTS.mode);
    setScrewDia(DEFAULTS.screwDia);
    setScrewLen(DEFAULTS.screwLen);
    setMaterial(DEFAULTS.material);
    setThread(DEFAULTS.thread);
    setFit(DEFAULTS.fit);
    setPlugDia(DEFAULTS.plugDia);
    setPlugLen(DEFAULTS.plugLen);
    setCopied(false);
  };

  const rows = failed
    ? []
    : result.mode === "wood"
      ? [
          ["Calculated pilot diameter", mm2(result.pilotMm)],
          [
            "Nearest bits either side",
            `${result.pilotAlternatives.under ?? DASH} mm / ${result.pilotAlternatives.over ?? DASH} mm`,
          ],
          ["Pilot in inches", result.pilotBitInch?.text ?? DASH],
          ["Clearance hole (top piece)", mm1(result.clearanceBit)],
          ["Countersink diameter", mm1(result.countersinkMm)],
          ["Drill depth", mm1(result.depthMm)],
          ["Screw gauge equivalent", result.gauge > 0 ? `#${result.gauge}` : DASH],
        ]
      : result.mode === "tap"
        ? [
            ["Thread pitch", mm2(result.thread.pitch)],
            ["Tap drill, D − P", mm2(result.tapDrillMm)],
            ["Nearest standard bit", mm1(result.tapBit)],
            ["In inches", result.tapBitInch?.text ?? DASH],
            ["Thread engagement", `${result.engagementPct.toFixed(0)} %`],
            ["Basic minor diameter (100% thread)", mm2(result.minorBasicMm)],
            ["Clearance hole, ISO 273", mm1(result.clearanceMm)],
            [
              "Close / medium / free",
              `${result.clearanceSet.close} / ${result.clearanceSet.medium} / ${result.clearanceSet.free} mm`,
            ],
          ]
        : [
            ["Masonry bit", mm1(result.plugBit)],
            ["In inches", result.plugBitInch?.text ?? DASH],
            ["Drill depth", mm1(result.depthMm)],
            [
              "Matching plug",
              result.matchedPlug ? `${result.matchedPlug.colour} — ${result.matchedPlug.screws}` : DASH,
            ],
          ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Drill className="h-4 w-4" aria-hidden="true" />
          Workshop
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Drill Bit Size Selector</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A pilot hole, a clearance hole, a tapped hole and a plug hole are four different
          calculations from the same fastener. Pick the job and this gives the exact size, the
          nearest bit you can actually buy, and how deep to go.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="db-mode">
              What are you drilling for?
            </label>
            <select
              id="db-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              {MODES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>

          {mode === "wood" && (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="db-dia">
                  Screw outer diameter (mm)
                </label>
                <input
                  id="db-dia"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  value={screwDia}
                  onChange={(event) => setScrewDia(event.target.value)}
                />
                <p className={HINT_CLASS}>
                  By gauge:{" "}
                  {GAUGE_OPTIONS.map((g) => `#${g} = ${NUM1.format(gaugeToMm(g))} mm`).join(", ")}.
                </p>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="db-len">
                  Screw length (mm)
                </label>
                <input
                  id="db-len"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="1"
                  step="1"
                  value={screwLen}
                  onChange={(event) => setScrewLen(event.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS} htmlFor="db-material">
                  Material
                </label>
                <select
                  id="db-material"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={material}
                  onChange={(event) => setMaterial(event.target.value)}
                >
                  {Object.entries(PILOT_FACTORS).map(([key, spec]) => (
                    <option key={key} value={key}>
                      {spec.label}
                    </option>
                  ))}
                </select>
                <p className={HINT_CLASS}>
                  Pilot is {Math.round(PILOT_FACTORS[material].pilot * 100)}% of the screw&apos;s
                  outer diameter here.
                </p>
              </div>
            </>
          )}

          {mode === "tap" && (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="db-thread">
                  Thread size (ISO metric coarse)
                </label>
                <select
                  id="db-thread"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={thread}
                  onChange={(event) => setThread(event.target.value)}
                >
                  {METRIC_COARSE.map((entry) => (
                    <option key={entry.size} value={entry.size}>
                      {entry.size} × {entry.pitch}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="db-fit">
                  Clearance fit
                </label>
                <select
                  id="db-fit"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={fit}
                  onChange={(event) => setFit(event.target.value)}
                >
                  {FITS.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.label}
                    </option>
                  ))}
                </select>
                <p className={HINT_CLASS}>Clearance sizes are the ISO 273 series.</p>
              </div>
            </>
          )}

          {mode === "plug" && (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="db-plugdia">
                  Plug diameter (mm)
                </label>
                <input
                  id="db-plugdia"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={plugDia}
                  onChange={(event) => setPlugDia(event.target.value)}
                />
                <p className={HINT_CLASS}>
                  The number printed on the plug is the drill size, not the screw size.
                </p>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="db-pluglen">
                  Plug length (mm)
                </label>
                <input
                  id="db-pluglen"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="1"
                  step="1"
                  value={plugLen}
                  onChange={(event) => setPlugLen(event.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Bit to use
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : result.headline}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the inputs above."
                : Number.isFinite(result.depthMm)
                  ? `Drill ${mm1(result.depthMm)} deep`
                  : "Through-hole — tap to the depth the fastener needs"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy the drill sizes"
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

        {!failed && (
          <p className="mt-4 rounded-md bg-[var(--success-soft)] px-3 py-2 text-sm font-medium text-[var(--success)]">
            {result.verdict}
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(failed ? [["Result", DASH]] : rows).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Metric tap and clearance chart</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Tap drill is the nominal diameter minus the pitch, which leaves about 77% of a full
          thread — nearly all the strength for a third of the tapping torque.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[460px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Thread
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Pitch
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Tap drill
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Close
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Medium
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Free
                </th>
              </tr>
            </thead>
            <tbody>
              {METRIC_COARSE.map((entry) => (
                <tr key={entry.size} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{entry.size}</td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{entry.pitch}</td>
                  <td className="py-2 pr-3">{NUM2.format(entry.d - entry.pitch)}</td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                    {ISO_273_CLEARANCE[entry.size].close}
                  </td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                    {ISO_273_CLEARANCE[entry.size].medium}
                  </td>
                  <td className="py-2 text-[var(--muted-foreground)]">
                    {ISO_273_CLEARANCE[entry.size].free}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Wall plug colours</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Plug
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Drill
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Length
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Screw
                </th>
              </tr>
            </thead>
            <tbody>
              {WALL_PLUGS.map((plug) => (
                <tr key={plug.colour} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{plug.colour}</td>
                  <td className="py-2 pr-3">{plug.drillMm} mm</td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                    {plug.plugLengthMm} mm
                  </td>
                  <td className="py-2 text-[var(--muted-foreground)]">{plug.screws}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Pilot factors come from published pilot-hole charts and describe general timber behaviour,
        not a specific species — in very dense hardwood, drill a test hole in offcut first. Always
        check what is behind a wall before drilling into it, and use hammer action only in solid
        brick or concrete, never in tile or hollow block where it shatters the material around the
        hole.
      </p>
    </main>
  );
}
