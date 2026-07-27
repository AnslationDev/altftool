"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sofa } from "lucide-react";

import {
  GLASS_TYPES,
  HUMIDITY_LEVELS,
  INFILTRATION_LEVELS,
  ORIENTATIONS,
  ROOF_TYPES,
  SHADING_OPTIONS,
  WALL_TYPES,
  computeLivingRoomLoad,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const DEFAULTS = {
  length: "16",
  width: "14",
  ceiling: "12",
  exposedWalls: "2",
  glass: "40",
  orientation: "west",
  shading: "curtains",
  glassType: "single",
  wallType: "brick",
  roofType: "exposed",
  occupants: "5",
  lighting: "150",
  appliances: "200",
  infiltration: "average",
  humidity: "composite",
  outdoor: "43",
  indoor: "25",
};

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNum = (raw) => (String(raw).trim() === "" ? Number.NaN : Number(String(raw).trim()));

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      computeLivingRoomLoad({
        lengthFt: toNum(form.length),
        widthFt: toNum(form.width),
        ceilingFt: toNum(form.ceiling),
        exposedWalls: toNum(form.exposedWalls),
        glassSqft: toNum(form.glass),
        orientation: form.orientation,
        shading: form.shading,
        glassType: form.glassType,
        wallType: form.wallType,
        roofType: form.roofType,
        occupants: toNum(form.occupants),
        lightingWatts: toNum(form.lighting),
        applianceWatts: toNum(form.appliances),
        infiltration: form.infiltration,
        humidity: form.humidity,
        outdoorTempC: toNum(form.outdoor),
        indoorTempC: toNum(form.indoor),
      }),
    [form],
  );

  const ok = !result.error;

  const summary = ok
    ? [
        "Living Room AC Tonnage Calculator",
        `Room: ${form.length} x ${form.width} ft, ${form.ceiling} ft ceiling (${NUM.format(result.floorAreaSqft)} sq ft)`,
        `Design condition: ${form.outdoor} C outdoors to ${form.indoor} C indoors (dT ${NUM.format(result.deltaT)} C)`,
        ...result.components.map((c) => `${c.label}: ${NUM.format(c.watts)} W`),
        `Design margin: ${NUM.format(result.marginW)} W`,
        `Total load: ${NUM.format(result.totalW)} W = ${NUM.format(result.totalBtu)} BTU/hr = ${NUM2.format(result.exactTons)} ton`,
        result.recommendedTons
          ? `Recommended AC: ${NUM2.format(result.recommendedTons)} ton`
          : `Recommended: ${result.unitsNeeded} units`,
      ].join("\n")
    : "";

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
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Sofa className="h-4 w-4" aria-hidden="true" />
          Cooling and HVAC
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Living Room AC Tonnage Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Open halls with double-height ceilings and big west-facing windows break the
          per-square-foot rule of thumb. This adds up each heat gain separately — walls, roof,
          glazing, people, lights and air changes — so you can see which one is actually driving
          the size.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Room</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="lr-length">
              Length (ft)
            </label>
            <input id="lr-length" className={INPUT} type="number" inputMode="decimal" min="5" step="0.5" value={form.length} onChange={set("length")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="lr-width">
              Width (ft)
            </label>
            <input id="lr-width" className={INPUT} type="number" inputMode="decimal" min="5" step="0.5" value={form.width} onChange={set("width")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="lr-ceiling">
              Ceiling height (ft)
            </label>
            <input id="lr-ceiling" className={INPUT} type="number" inputMode="decimal" min="7" max="30" step="0.5" value={form.ceiling} onChange={set("ceiling")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="lr-walls">
              Walls exposed to outside air (0-4)
            </label>
            <input id="lr-walls" className={INPUT} type="number" inputMode="numeric" min="0" max="4" step="1" value={form.exposedWalls} onChange={set("exposedWalls")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="lr-walltype">
              Wall construction
            </label>
            <select id="lr-walltype" className={INPUT} value={form.wallType} onChange={set("wallType")}>
              {WALL_TYPES.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="lr-rooftype">
              Roof above the room
            </label>
            <select id="lr-rooftype" className={INPUT} value={form.roofType} onChange={set("roofType")}>
              {ROOF_TYPES.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Glazing</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="lr-glass">
              Total window / glass door area (sq ft)
            </label>
            <input id="lr-glass" className={INPUT} type="number" inputMode="decimal" min="0" step="5" value={form.glass} onChange={set("glass")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="lr-orientation">
              Which way the glass faces
            </label>
            <select id="lr-orientation" className={INPUT} value={form.orientation} onChange={set("orientation")}>
              {ORIENTATIONS.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="lr-glasstype">
              Glass type
            </label>
            <select id="lr-glasstype" className={INPUT} value={form.glassType} onChange={set("glassType")}>
              {GLASS_TYPES.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="lr-shading">
              Shading
            </label>
            <select id="lr-shading" className={INPUT} value={form.shading} onChange={set("shading")}>
              {SHADING_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Internal gains and design conditions</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="lr-occupants">
              People in the room at peak
            </label>
            <input id="lr-occupants" className={INPUT} type="number" inputMode="numeric" min="0" max="60" step="1" value={form.occupants} onChange={set("occupants")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="lr-lighting">
              Lighting load (W)
            </label>
            <input id="lr-lighting" className={INPUT} type="number" inputMode="decimal" min="0" step="10" value={form.lighting} onChange={set("lighting")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="lr-appliances">
              TV, set-top box, router and so on (W)
            </label>
            <input id="lr-appliances" className={INPUT} type="number" inputMode="decimal" min="0" step="10" value={form.appliances} onChange={set("appliances")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="lr-infiltration">
              Air tightness
            </label>
            <select id="lr-infiltration" className={INPUT} value={form.infiltration} onChange={set("infiltration")}>
              {INFILTRATION_LEVELS.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="lr-humidity">
              Outdoor humidity
            </label>
            <select id="lr-humidity" className={INPUT} value={form.humidity} onChange={set("humidity")}>
              {HUMIDITY_LEVELS.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL} htmlFor="lr-outdoor">
                Outdoor design (C)
              </label>
              <input id="lr-outdoor" className={INPUT} type="number" inputMode="decimal" min="25" max="55" step="1" value={form.outdoor} onChange={set("outdoor")} />
            </div>
            <div>
              <label className={LABEL} htmlFor="lr-indoor">
                Setpoint (C)
              </label>
              <input id="lr-indoor" className={INPUT} type="number" inputMode="decimal" min="16" max="32" step="1" value={form.indoor} onChange={set("indoor")} />
            </div>
          </div>
        </div>
      </section>

      {result.error ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Recommended AC size
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? (result.recommendedTons ? `${NUM2.format(result.recommendedTons)} ton` : `${result.unitsNeeded} units`) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${NUM.format(result.totalW)} W = ${NUM.format(result.totalBtu)} BTU/hr = ${NUM2.format(result.exactTons)} ton`
                : "Fix the inputs above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the living room load result" className={GHOST_BTN} disabled={!ok}>
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
          {ok
            ? [
                ...result.components.map((c) => [c.label, `${NUM.format(c.watts)} W`]),
                ["Design margin (10%)", `${NUM.format(result.marginW)} W`],
                ["Total cooling load", `${NUM.format(result.totalW)} W`],
                ["Load intensity", `${NUM1.format(result.wattsPerSqft)} W per sq ft`],
                ["Room volume", `${NUM.format(result.volumeM3)} m3`],
                ["Glass as share of exposed wall", `${NUM.format(result.glassSharePct)}%`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))
            : ["Walls", "Roof / ceiling", "Solar gain through glass", "Total cooling load"].map((label) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{DASH}</dd>
                </div>
              ))}
        </dl>

        {ok ? (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Where the heat comes from
            </p>
            <div className="mt-2 space-y-2">
              {result.components
                .filter((c) => c.watts > 0)
                .map((c) => (
                  <div key={c.id}>
                    <div className="flex justify-between gap-3 text-xs">
                      <span className="text-[var(--muted-foreground)]">{c.label}</span>
                      <span className="font-semibold">{NUM.format(c.sharePct)}%</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                      <span
                        className="block h-full bg-[var(--primary)]"
                        style={{ width: `${Math.min(100, c.sharePct)}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">
              Biggest single gain: {result.biggestComponent.label} at{" "}
              {NUM.format(result.biggestComponent.watts)} W. Cut that one and the whole size drops.
            </p>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates for planning only, using standard U-values and peak solar heat gain factors for
        Indian conditions. A ducted or multi-zone system, an atrium, or a room with heavy kitchen
        adjacency needs a full ISHRAE heat load survey by an HVAC engineer.
      </p>
    </main>
  );
}
