"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, Frame, RotateCcw } from "lucide-react";

import { POLYGON_PRESETS, SHAPE_MODES, UNITS, computeFrame } from "../lib";

const NUM3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const n3 = (v) => (Number.isFinite(v) ? NUM3.format(v) : "—");
const n2 = (v) => (Number.isFinite(v) ? NUM2.format(v) : "—");

const DEFAULTS = {
  unit: "mm",
  mode: "rectangle",
  sides: "6",
  artWidth: "300",
  artHeight: "400",
  artSide: "150",
  clearance: "3",
  mouldingWidth: "40",
  kerf: "3",
  wastePct: "10",
  stockLength: "2400",
  rabbetDepth: "10",
  stackThickness: "8",
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

  const applyUnit = (event) => {
    const id = event.target.value;
    const unit = UNITS.find((entry) => entry.id === id);
    setForm((prev) => ({
      ...prev,
      unit: id,
      clearance: unit ? String(unit.defaultClearance) : prev.clearance,
      kerf: unit ? String(unit.defaultKerf) : prev.kerf,
      stockLength: unit ? String(unit.defaultStock) : prev.stockLength,
    }));
  };

  const result = useMemo(
    () =>
      computeFrame({
        mode: form.mode,
        sides: Number(form.sides),
        artWidth: form.artWidth,
        artHeight: form.artHeight,
        artSide: form.artSide,
        clearance: form.clearance,
        mouldingWidth: form.mouldingWidth,
        kerf: form.kerf,
        wastePct: form.wastePct,
        stockLength: form.stockLength,
        rabbetDepth: form.rabbetDepth,
        stackThickness: form.stackThickness,
      }),
    [form],
  );

  const ok = !result.error;
  const u = form.unit;

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      "Picture Frame Miter Calculator",
      `${result.sides} sides · miter saw setting ${n2(result.miterAngle)}° · corner angle ${n2(result.cornerAngle)}°`,
      ...result.rails.map(
        (rail) =>
          `${rail.quantity} x ${rail.label}: long point ${n2(rail.longPoint)} ${u}, short point ${n2(rail.shortPoint)} ${u}`,
      ),
      `Moulding in the frame: ${n2(result.railLength)} ${u}`,
      `Order with kerf and ${n2(result.wastePct)}% waste: ${n2(result.orderLength)} ${u}`,
    ];
    if (result.sticksNeeded) lines.push(`Sticks of ${n2(result.stockLength)} ${u}: ${result.sticksNeeded}`);
    return lines.join("\n");
  }, [ok, result, u]);

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
          <Frame className="h-4 w-4" aria-hidden="true" />
          Carpentry &amp; woodwork
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Picture Frame Miter Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The saw setting for any closed frame is 180 ÷ the number of sides — 45° for a square, 30°
          for a hexagon, 22.5° for an octagon. This works that out and gives the long point and short
          point of every rail, plus the moulding to buy once kerf and waste are counted.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pf-mode">
              Frame shape
            </label>
            <select id="pf-mode" className={`mt-2 ${INPUT_CLASS}`} value={form.mode} onChange={set("mode")}>
              {SHAPE_MODES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pf-unit">
              Units
            </label>
            <select id="pf-unit" className={`mt-2 ${INPUT_CLASS}`} value={form.unit} onChange={applyUnit}>
              {UNITS.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>

          {form.mode === "rectangle" ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="pf-w">
                  Artwork width ({u})
                </label>
                <input
                  id="pf-w"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  value={form.artWidth}
                  onChange={set("artWidth")}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="pf-h">
                  Artwork height ({u})
                </label>
                <input
                  id="pf-h"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  value={form.artHeight}
                  onChange={set("artHeight")}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="pf-sides">
                  Number of sides
                </label>
                <input
                  id="pf-sides"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="3"
                  max="24"
                  step="1"
                  value={form.sides}
                  onChange={set("sides")}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="pf-side">
                  Opening side length ({u})
                </label>
                <input
                  id="pf-side"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  value={form.artSide}
                  onChange={set("artSide")}
                />
              </div>
            </>
          )}

          <div>
            <label className={LABEL_CLASS} htmlFor="pf-moulding">
              Moulding face width ({u})
            </label>
            <input
              id="pf-moulding"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={form.mouldingWidth}
              onChange={set("mouldingWidth")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pf-clearance">
              Clearance added to the artwork ({u})
            </label>
            <input
              id="pf-clearance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={form.clearance}
              onChange={set("clearance")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pf-kerf">
              Blade kerf per cut ({u})
            </label>
            <input
              id="pf-kerf"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={form.kerf}
              onChange={set("kerf")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pf-waste">
              Waste allowance (%)
            </label>
            <input
              id="pf-waste"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={form.wastePct}
              onChange={set("wastePct")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pf-stock">
              Stock stick length ({u}, 0 to skip)
            </label>
            <input
              id="pf-stock"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={form.stockLength}
              onChange={set("stockLength")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pf-depth">
              Rabbet depth ({u})
            </label>
            <input
              id="pf-depth"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={form.rabbetDepth}
              onChange={set("rabbetDepth")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pf-stack">
              Glass + mat + art + backing ({u})
            </label>
            <input
              id="pf-stack"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={form.stackThickness}
              onChange={set("stackThickness")}
            />
          </div>
        </div>

        {form.mode === "polygon" ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {POLYGON_PRESETS.map((preset) => (
              <button
                key={preset.sides}
                type="button"
                className={CHIP_BTN}
                onClick={() => setForm((prev) => ({ ...prev, sides: String(preset.sides) }))}
              >
                {preset.label}
              </button>
            ))}
          </div>
        ) : null}
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
              Miter saw setting
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${n2(result.miterAngle)}°` : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.sides} sides · ${result.pieces} pieces · ${result.cuts} cuts · corner closes at ${n2(result.cornerAngle)}°`
                : "Fix the inputs above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy frame cutting list"
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

        {ok ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[380px] text-left text-sm">
              <caption className="sr-only">Cutting list</caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Piece</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Qty</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Long point</th>
                  <th scope="col" className="py-2 text-right font-semibold">Short point</th>
                </tr>
              </thead>
              <tbody>
                {result.rails.map((rail) => (
                  <tr key={rail.label} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{rail.label}</td>
                    <td className="py-2 pr-3 text-right">{rail.quantity}</td>
                    <td className="py-2 pr-3 text-right">
                      {n2(rail.longPoint)} {u}
                    </td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {n2(rail.shortPoint)} {u}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Blade angle measured off the edge", ok ? `${n2(result.bladeAngleFromEdge)}°` : "—"],
            ["Extra length each miter adds", ok ? `${n3(result.overhangPerEnd)} ${u} per end` : "—"],
            ["Moulding in the finished frame", ok ? `${n2(result.railLength)} ${u}` : "—"],
            ["Lost to the blade kerf", ok ? `${n2(result.kerfLoss)} ${u}` : "—"],
            ["Moulding to buy", ok ? `${n2(result.orderLength)} ${u}` : "—"],
            ["Sticks needed", ok && result.sticksNeeded ? result.sticksNeeded : "—"],
            [
              "Rabbet opening",
              ok
                ? result.mode === "rectangle"
                  ? `${n2(result.rabbetWidth)} × ${n2(result.rabbetHeight)} ${u}`
                  : `${n2(result.rabbetSide)} ${u} per side`
                : "—",
            ],
            [
              "Glass / backing size",
              ok
                ? result.mode === "rectangle"
                  ? `${n2(result.glassWidth)} × ${n2(result.glassHeight)} ${u}`
                  : `${n2(result.glassSide)} ${u} per side`
                : "—",
            ],
            [
              "Outside size of the frame",
              ok && result.outerWidth !== null ? `${n2(result.outerWidth)} × ${n2(result.outerHeight)} ${u}` : "—",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && result.depthWarning ? (
          <p className="mt-3 flex items-start gap-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{result.depthWarning}</span>
          </p>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Cut one test corner before committing the whole stick — a saw that is half a degree out shows
        up as a visible gap once four or eight corners accumulate the error, and moulding that is
        bowed or twisted needs to be cut long and trimmed to fit.
      </p>
    </main>
  );
}
