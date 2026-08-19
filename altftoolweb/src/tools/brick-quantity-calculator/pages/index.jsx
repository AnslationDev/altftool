"use client";

import { useMemo, useState } from "react";
import { BrickWall, Check, Copy, RotateCcw } from "lucide-react";

import {
  BRICK_PRESETS,
  MORTAR_DRY_FACTOR,
  MORTAR_MIXES,
  WALL_THICKNESS_PRESETS,
  computeBrickwork,
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
  preset: "in-traditional",
  brickLengthMm: "230",
  brickWidthMm: "110",
  brickHeightMm: "70",
  wallLengthM: "10",
  wallHeightM: "3",
  wallThicknessMm: "230",
  jointMm: "10",
  openingAreaM2: "0",
  wastagePct: "5",
  mortarMix: "1:6",
  brickRate: "0",
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
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const applyPreset = (event) => {
    const id = event.target.value;
    const preset = BRICK_PRESETS.find((entry) => entry.id === id);
    setForm((prev) => ({
      ...prev,
      preset: id,
      brickLengthMm: preset ? String(preset.length) : prev.brickLengthMm,
      brickWidthMm: preset ? String(preset.width) : prev.brickWidthMm,
      brickHeightMm: preset ? String(preset.height) : prev.brickHeightMm,
    }));
  };

  const result = useMemo(() => computeBrickwork(form), [form]);
  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Brick Quantity Calculator",
      `Wall: ${form.wallLengthM} m x ${form.wallHeightM} m x ${form.wallThicknessMm} mm`,
      `Net wall area: ${n2(result.netArea)} m2 (${n0(result.netAreaSqft)} sqft)`,
      `Brickwork volume: ${n3(result.wallVolume)} m3`,
      `Bricks needed: ${n0(result.bricksToBuy)} incl. ${n0(result.wastagePct)}% wastage`,
      `Bricks per m3: ${n0(result.bricksPerM3)}`,
      `Wet mortar: ${n3(result.wetMortar)} m3 (${n0(result.mortarSharePct)}% of the wall)`,
      `Cement: ${n2(result.cementBags)} bags (${n0(result.cementKg)} kg) at ${result.mortarMix}`,
      `Sand: ${n3(result.sandVolume)} m3 (${n0(result.sandCft)} cft)`,
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
          <BrickWall className="h-4 w-4" aria-hidden="true" />
          Construction materials
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Brick Quantity Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Count the bricks, mortar, cement bags and sand for any wall. The brick count comes from the
          nominal cell each brick fills — its own size plus one mortar joint in all three directions —
          so joint thickness and brick size both change the answer.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Wall</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bq-length">
              Wall length (m)
            </label>
            <input
              id="bq-length"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={form.wallLengthM}
              onChange={set("wallLengthM")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bq-height">
              Wall height (m)
            </label>
            <input
              id="bq-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={form.wallHeightM}
              onChange={set("wallHeightM")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bq-thickness">
              Wall thickness (mm)
            </label>
            <input
              id="bq-thickness"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={form.wallThicknessMm}
              onChange={set("wallThicknessMm")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bq-openings">
              Doors and windows to deduct (m²)
            </label>
            <input
              id="bq-openings"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={form.openingAreaM2}
              onChange={set("openingAreaM2")}
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {WALL_THICKNESS_PRESETS.map((preset) => (
            <button
              key={preset.mm}
              type="button"
              className={CHIP_BTN}
              onClick={() => setForm((prev) => ({ ...prev, wallThicknessMm: String(preset.mm) }))}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Brick and mortar</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bq-preset">
              Brick size
            </label>
            <select id="bq-preset" className={`mt-2 ${INPUT_CLASS}`} value={form.preset} onChange={applyPreset}>
              {BRICK_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bq-bl">
              Brick length (mm)
            </label>
            <input
              id="bq-bl"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={form.brickLengthMm}
              onChange={set("brickLengthMm")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bq-bw">
              Brick width (mm)
            </label>
            <input
              id="bq-bw"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={form.brickWidthMm}
              onChange={set("brickWidthMm")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bq-bh">
              Brick height (mm)
            </label>
            <input
              id="bq-bh"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={form.brickHeightMm}
              onChange={set("brickHeightMm")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bq-joint">
              Mortar joint (mm)
            </label>
            <input
              id="bq-joint"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              step="1"
              value={form.jointMm}
              onChange={set("jointMm")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bq-mix">
              Mortar mix (cement : sand)
            </label>
            <select id="bq-mix" className={`mt-2 ${INPUT_CLASS}`} value={form.mortarMix} onChange={set("mortarMix")}>
              {MORTAR_MIXES.map((mix) => (
                <option key={mix.id} value={mix.id}>
                  {mix.id} — {mix.use}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bq-waste">
              Breakage / wastage (%)
            </label>
            <input
              id="bq-waste"
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
            <label className={LABEL_CLASS} htmlFor="bq-rate">
              Price per brick (INR, optional)
            </label>
            <input
              id="bq-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={form.brickRate}
              onChange={set("brickRate")}
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

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-live="polite"
        role="status"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Bricks to buy
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? n0(result.bricksToBuy) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${n0(result.bricksExact)} in the wall plus ${n0(result.wastagePct)}% for breakage`
                : "Fix the inputs above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy brick quantity result"
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
            ["Net wall area", ok ? `${n2(result.netArea)} m² · ${n0(result.netAreaSqft)} sqft` : "—"],
            ["Brickwork volume", ok ? `${n3(result.wallVolume)} m³` : "—"],
            ["Bricks per m³ of brickwork", ok ? n0(result.bricksPerM3) : "—"],
            ["Bricks per m² of wall face", ok ? `${n1Safe(result.bricksPerM2)} (${n1Safe(result.bricksPerSqft)} per sqft)` : "—"],
            ["Wet mortar volume", ok ? `${n3(result.wetMortar)} m³ · ${n0(result.mortarSharePct)}% of the wall` : "—"],
            [`Dry mortar volume (x ${MORTAR_DRY_FACTOR})`, ok ? `${n3(result.dryMortar)} m³` : "—"],
            ["Cement bags (50 kg)", ok ? `${n2(result.cementBags)} → buy ${n0(result.cementBagsToBuy)}` : "—"],
            ["Cement by weight", ok ? `${n0(result.cementKg)} kg` : "—"],
            ["Sand", ok ? `${n3(result.sandVolume)} m³ · ${n0(result.sandCft)} cft · ${n0(result.sandKg)} kg` : "—"],
            ["Water for the mortar", ok ? `${n0(result.waterLitres)} litres` : "—"],
            ["Brick cost", ok && result.brickCost > 0 ? INR.format(result.brickCost) : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates for ordering only. Bond pattern, closers at reveals, sand bulking and the mason&apos;s
        joint discipline all shift the real consumption, so check the first course on site against
        this figure before ordering the full load.
      </p>
    </main>
  );
}

function n1Safe(value) {
  return Number.isFinite(value)
    ? new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 }).format(value)
    : "—";
}
