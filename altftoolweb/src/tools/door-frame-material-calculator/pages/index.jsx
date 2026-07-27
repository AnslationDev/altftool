"use client";

import { useMemo, useState } from "react";
import { Check, Copy, DoorOpen, RotateCcw } from "lucide-react";

import {
  DEFAULT_REBATE_MM,
  HINGE_HEIGHT_THRESHOLD_MM,
  SECTION_PRESETS,
  TIMBER_SPECIES,
  computeDoorFrame,
} from "../lib";

const NUM3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const n3 = (v) => (Number.isFinite(v) ? NUM3.format(v) : "—");
const n2 = (v) => (Number.isFinite(v) ? NUM2.format(v) : "—");
const n0 = (v) => (Number.isFinite(v) ? NUM0.format(v) : "—");

const DEFAULTS = {
  preset: "100x65",
  outerHeightMm: "2100",
  outerWidthMm: "900",
  sectionWidthMm: "100",
  sectionThicknessMm: "65",
  includeSill: false,
  rebateMm: String(DEFAULT_REBATE_MM),
  doors: "1",
  wastagePct: "8",
  species: "sal",
  timberRatePerCft: "0",
  shutterRatePerSqft: "0",
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

  const applySection = (event) => {
    const id = event.target.value;
    const preset = SECTION_PRESETS.find((entry) => entry.id === id);
    setForm((prev) => ({
      ...prev,
      preset: id,
      sectionWidthMm: preset ? String(preset.width) : prev.sectionWidthMm,
      sectionThicknessMm: preset ? String(preset.thickness) : prev.sectionThicknessMm,
    }));
  };

  const result = useMemo(
    () =>
      computeDoorFrame({
        outerHeightMm: form.outerHeightMm,
        outerWidthMm: form.outerWidthMm,
        sectionWidthMm: form.sectionWidthMm,
        sectionThicknessMm: form.sectionThicknessMm,
        includeSill: form.includeSill,
        rebateMm: form.rebateMm,
        doors: Number(form.doors),
        wastagePct: form.wastagePct,
        species: form.species,
        timberRatePerCft: form.timberRatePerCft,
        shutterRatePerSqft: form.shutterRatePerSqft,
      }),
    [form],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Door Frame Material Calculator",
      `Frame: ${form.outerHeightMm} x ${form.outerWidthMm} mm outer, section ${result.sectionWidthMm} x ${result.sectionThicknessMm} mm`,
      `Members per frame: ${result.membersPerFrame}`,
      `Running length: ${n2(result.runningLengthM)} m per frame (${n2(result.totalRunningLengthFt)} ft for ${result.doors})`,
      `Timber: ${n3(result.volumePerFrameCft)} cft per frame, order ${n2(result.orderVolumeCft)} cft incl. ${n0(result.wastagePct)}% wastage`,
      `Clear opening: ${n0(result.clearWidthMm)} x ${n0(result.clearHeightMm)} mm`,
      `Shutter: ${n0(result.shutterWidthMm)} x ${n0(result.shutterHeightMm)} mm = ${n2(result.shutterAreaSqft)} sqft`,
      `Hinges: ${result.hingesPerDoor} per door (${result.totalHinges} total)`,
      `Holdfasts: ${result.totalHoldfasts} total`,
    ].join("\n");
  }, [ok, result, form]);

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
          <DoorOpen className="h-4 w-4" aria-hidden="true" />
          Carpentry &amp; woodwork
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Door Frame Material Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Give the opening size and the frame section, and get the running length of timber, its
          volume in cubic feet, the clear opening left inside, the shutter size once the rebate is
          allowed for, and the hinges and holdfasts to order.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Opening and frame</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="df-height">
              Frame outer height (mm)
            </label>
            <input
              id="df-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="5"
              value={form.outerHeightMm}
              onChange={set("outerHeightMm")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="df-width">
              Frame outer width (mm)
            </label>
            <input
              id="df-width"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="5"
              value={form.outerWidthMm}
              onChange={set("outerWidthMm")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="df-preset">
              Frame section
            </label>
            <select id="df-preset" className={`mt-2 ${INPUT_CLASS}`} value={form.preset} onChange={applySection}>
              {SECTION_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="df-sw">
              Section width (mm)
            </label>
            <input
              id="df-sw"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="5"
              value={form.sectionWidthMm}
              onChange={set("sectionWidthMm")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="df-st">
              Section thickness (mm)
            </label>
            <input
              id="df-st"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="5"
              value={form.sectionThicknessMm}
              onChange={set("sectionThicknessMm")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="df-rebate">
              Rebate depth (mm)
            </label>
            <input
              id="df-rebate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="40"
              step="1"
              value={form.rebateMm}
              onChange={set("rebateMm")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="df-doors">
              Number of identical frames
            </label>
            <input
              id="df-doors"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={form.doors}
              onChange={set("doors")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="df-sill">
              <input
                id="df-sill"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                checked={form.includeSill}
                onChange={set("includeSill")}
              />
              Include a bottom sill (four-sided frame)
            </label>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Timber and rates</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="df-species">
              Timber species
            </label>
            <select id="df-species" className={`mt-2 ${INPUT_CLASS}`} value={form.species} onChange={set("species")}>
              {TIMBER_SPECIES.map((wood) => (
                <option key={wood.id} value={wood.id}>
                  {wood.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="df-waste">
              Cutting and planing wastage (%)
            </label>
            <input
              id="df-waste"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              step="1"
              value={form.wastagePct}
              onChange={set("wastagePct")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="df-timber-rate">
              Timber rate (INR per cft, optional)
            </label>
            <input
              id="df-timber-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={form.timberRatePerCft}
              onChange={set("timberRatePerCft")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="df-shutter-rate">
              Shutter rate (INR per sqft, optional)
            </label>
            <input
              id="df-shutter-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={form.shutterRatePerSqft}
              onChange={set("shutterRatePerSqft")}
            />
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
              Timber to order
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${n2(result.orderVolumeCft)} cft` : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${n3(result.orderVolumeM3)} m³ · ${n2(result.totalRunningLengthM)} m of ${result.sectionWidthMm} × ${result.sectionThicknessMm} mm section`
                : "Fix the inputs above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy door frame take-off"
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
            ["Members per frame", ok ? `${result.membersPerFrame} (${result.hasSill ? "2 jambs, head and sill" : "2 jambs and a head"})` : "—"],
            ["Running length per frame", ok ? `${n2(result.runningLengthM)} m · ${n2(result.runningLengthFt)} ft` : "—"],
            ["Running length for all frames", ok ? `${n2(result.totalRunningLengthM)} m · ${n2(result.totalRunningLengthFt)} ft` : "—"],
            ["Timber per frame", ok ? `${n3(result.volumePerFrameCft)} cft` : "—"],
            ["Approximate weight", ok ? `${n0(result.timberWeightKg)} kg of ${result.species.toLowerCase()}` : "—"],
            ["Clear opening", ok ? `${n0(result.clearWidthMm)} × ${n0(result.clearHeightMm)} mm` : "—"],
            ["Shutter size", ok ? `${n0(result.shutterWidthMm)} × ${n0(result.shutterHeightMm)} mm` : "—"],
            ["Shutter area", ok ? `${n2(result.shutterAreaSqft)} sqft each · ${n2(result.totalShutterAreaSqft)} sqft total` : "—"],
            ["Butt hinges", ok ? `${result.hingesPerDoor} per door · ${result.totalHinges} total` : "—"],
            ["Holdfasts / MS clamps", ok ? `${result.holdfastsPerDoor} per frame · ${result.totalHoldfasts} total` : "—"],
            ["Architrave / beading length", ok ? `${n2(result.architraveLengthM)} m` : "—"],
            ["Timber cost", ok && result.timberCost > 0 ? INR.format(result.timberCost) : "—"],
            ["Shutter cost", ok && result.shutterCost > 0 ? INR.format(result.shutterCost) : "—"],
            ["Total", ok && result.totalCost > 0 ? INR.format(result.totalCost) : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
          Three butt hinges are assumed up to a {n0(HINGE_HEIGHT_THRESHOLD_MM)} mm shutter and four
          above it, with three holdfasts built into the masonry on each jamb.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Quantities for ordering and costing. Timber is sold in sawn sizes that shrink on planing, so
        buy against the nominal section and confirm the finished size, and set the shutter clearance
        with your carpenter before cutting — floor finish and weatherstripping both change the gap at
        the bottom.
      </p>
    </main>
  );
}
