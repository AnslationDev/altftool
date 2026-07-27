"use client";

import { useMemo, useState } from "react";
import { Check, CircleDot, Copy, RotateCcw } from "lucide-react";

import { SAFE_DIAMETER_TOLERANCE_PCT, convertTyreSize, parseTyreSize } from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";

const DEFAULTS = {
  mode: "metric",
  widthMm: "205",
  aspectRatio: "55",
  rimInch: "16",
  diameterInch: "31",
  widthInch: "10.5",
  inchRimInch: "15",
  compare: true,
  stockWidthMm: "205",
  stockAspect: "55",
  stockRim: "16",
  indicatedSpeed: "100",
  paste: "",
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
  const [pasteMessage, setPasteMessage] = useState("");

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));
  const toggle = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.checked }));

  const applyPaste = () => {
    const parsed = parseTyreSize(form.paste);
    if (parsed.error) {
      setPasteMessage(parsed.error);
      return;
    }
    setPasteMessage("");
    if (parsed.system === "metric") {
      setForm((prev) => ({
        ...prev,
        mode: "metric",
        widthMm: String(parsed.widthMm),
        aspectRatio: String(parsed.aspectRatio),
        rimInch: String(parsed.rimInch),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        mode: "inch",
        diameterInch: String(parsed.diameterInch),
        widthInch: String(parsed.widthInch),
        inchRimInch: String(parsed.rimInch),
      }));
    }
  };

  const result = useMemo(
    () =>
      convertTyreSize({
        mode: form.mode,
        tyre:
          form.mode === "metric"
            ? { widthMm: form.widthMm, aspectRatio: form.aspectRatio, rimInch: form.rimInch }
            : { diameterInch: form.diameterInch, widthInch: form.widthInch, rimInch: form.inchRimInch },
        stock: form.compare
          ? { widthMm: form.stockWidthMm, aspectRatio: form.stockAspect, rimInch: form.stockRim }
          : null,
        indicatedSpeed: form.indicatedSpeed,
      }),
    [form],
  );

  const hasError = Boolean(result.error);
  const spec = hasError ? null : result.spec;
  const comparison = hasError ? null : result.comparison;

  const summary = useMemo(() => {
    if (!spec) return "";
    const lines = [
      "Tyre Size Converter",
      `Metric: ${spec.metricLabel}`,
      `Inch / flotation: ${spec.inchLabel}`,
      `Section width: ${NUM1.format(spec.widthMm)} mm (${NUM2.format(spec.widthInch)} in)`,
      `Sidewall height: ${NUM1.format(spec.sidewallMm)} mm (${NUM2.format(spec.sidewallInch)} in)`,
      `Overall diameter: ${NUM1.format(spec.overallMm)} mm (${NUM2.format(spec.overallInch)} in)`,
      `Circumference: ${NUM1.format(spec.circumferenceMm)} mm`,
      `Revolutions: ${NUM1.format(spec.revsPerKm)} per km, ${NUM1.format(spec.revsPerMile)} per mile`,
    ];
    if (comparison) {
      lines.push(
        `Vs stock: ${comparison.diffMm > 0 ? "+" : ""}${NUM1.format(comparison.diffMm)} mm (${NUM2.format(comparison.diffPct)}%)`,
        `At ${NUM1.format(comparison.indicatedSpeed)} km/h indicated you are actually doing ${NUM1.format(comparison.trueSpeed)} km/h`,
      );
    }
    return lines.join("\n");
  }, [spec, comparison]);

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
    setPasteMessage("");
  };

  const specRows = [
    ["Metric designation", spec ? spec.metricLabel : DASH],
    ["Inch / flotation designation", spec ? spec.inchLabel : DASH],
    ["Section width", spec ? `${NUM1.format(spec.widthMm)} mm · ${NUM2.format(spec.widthInch)} in` : DASH],
    ["Aspect ratio", spec ? `${NUM1.format(spec.aspectRatio)}%` : DASH],
    ["Sidewall height", spec ? `${NUM1.format(spec.sidewallMm)} mm · ${NUM2.format(spec.sidewallInch)} in` : DASH],
    ["Rim diameter", spec ? `${NUM1.format(spec.rimInch)} in · ${NUM1.format(spec.rimMm)} mm` : DASH],
    ["Overall diameter", spec ? `${NUM1.format(spec.overallMm)} mm · ${NUM2.format(spec.overallInch)} in` : DASH],
    ["Rolling circumference", spec ? `${NUM1.format(spec.circumferenceMm)} mm · ${NUM2.format(spec.circumferenceInch)} in` : DASH],
    ["Revolutions per km", spec ? NUM1.format(spec.revsPerKm) : DASH],
    ["Revolutions per mile", spec ? NUM1.format(spec.revsPerMile) : DASH],
  ];

  const compareRows = [
    ["Diameter change", comparison ? `${comparison.diffMm > 0 ? "+" : ""}${NUM1.format(comparison.diffMm)} mm` : DASH],
    ["Percentage change", comparison ? `${comparison.diffPct > 0 ? "+" : ""}${NUM2.format(comparison.diffPct)}%` : DASH],
    [
      `Within the ±${SAFE_DIAMETER_TOLERANCE_PCT}% fitment window`,
      comparison ? (comparison.withinTolerance ? "Yes" : "No — outside the safe range") : DASH,
    ],
    ["Ride height change", comparison ? `${comparison.groundClearanceChangeMm > 0 ? "+" : ""}${NUM1.format(comparison.groundClearanceChangeMm)} mm` : DASH],
    [
      "True speed at the indicated reading",
      comparison ? `${NUM1.format(comparison.trueSpeed)} km/h when the dial shows ${NUM1.format(comparison.indicatedSpeed)}` : DASH,
    ],
    ["Speedometer error", comparison ? `${comparison.speedErrorKmph > 0 ? "+" : ""}${NUM1.format(comparison.speedErrorKmph)} km/h` : DASH],
    ["Odometer over 100 real km", comparison ? `${NUM1.format(comparison.odometerPer100Km)} km displayed` : DASH],
  ];

  const field = (id, label, key, step, min, max, hint) => (
    <div>
      <label className={LABEL_CLASS} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`mt-2 ${INPUT_CLASS}`}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={form[key]}
        onChange={set(key)}
      />
      {hint ? <p className="mt-1 text-xs text-[var(--muted-foreground)]">{hint}</p> : null}
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <CircleDot className="h-4 w-4" aria-hidden="true" />
          Tyres &amp; wheels
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Tyre Size Metric to Inch Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Converts 205/55R16 style metric sizes to 31x10.50R15 inch flotation sizes and back, then
          shows how far a change moves your speedometer and ride height.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <label className={LABEL_CLASS} htmlFor="tyre-paste">
          Paste a size from the sidewall
        </label>
        <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
          <input
            id="tyre-paste"
            className={INPUT_CLASS}
            type="text"
            placeholder="205/55R16 or 31x10.50R15"
            value={form.paste}
            onChange={(event) => {
              setPasteMessage("");
              setForm((prev) => ({ ...prev, paste: event.target.value }));
            }}
          />
          <button type="button" onClick={applyPaste} className={PRIMARY_BTN}>
            Read size
          </button>
        </div>
        {pasteMessage ? (
          <p role="alert" className="mt-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {pasteMessage}
          </p>
        ) : null}
      </section>

      <section className="mt-4 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <fieldset>
          <legend className="text-base font-semibold">Enter the tyre</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              ["metric", "Metric (205/55R16)"],
              ["inch", "Inch / flotation (31x10.50R15)"],
            ].map(([value, label]) => (
              <label
                key={value}
                className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-semibold transition ${
                  form.mode === value
                    ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                }`}
                htmlFor={`tyre-mode-${value}`}
              >
                <input
                  id={`tyre-mode-${value}`}
                  type="radio"
                  name="tyre-mode"
                  className="h-4 w-4 accent-[var(--primary)]"
                  value={value}
                  checked={form.mode === value}
                  onChange={set("mode")}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        {form.mode === "metric" ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {field("tyre-width", "Section width (mm)", "widthMm", "5", "100", "500")}
            {field("tyre-aspect", "Aspect ratio (%)", "aspectRatio", "5", "20", "95")}
            {field("tyre-rim", "Rim diameter (in)", "rimInch", "0.5", "8", "30")}
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {field("tyre-od", "Overall diameter (in)", "diameterInch", "0.5", "8", "60")}
            {field("tyre-width-in", "Section width (in)", "widthInch", "0.25", "4", "20")}
            {field("tyre-rim-in", "Rim diameter (in)", "inchRimInch", "0.5", "8", "30")}
          </div>
        )}
      </section>

      <section className="mt-4 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <label className="flex min-h-11 items-center gap-3 text-base font-semibold text-[var(--foreground)]" htmlFor="tyre-compare">
          <input
            id="tyre-compare"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={form.compare}
            onChange={toggle("compare")}
          />
          Compare against the factory size
        </label>
        {form.compare && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {field("tyre-stock-width", "Stock section width (mm)", "stockWidthMm", "5", "100", "500")}
            {field("tyre-stock-aspect", "Stock aspect ratio (%)", "stockAspect", "5", "20", "95")}
            {field("tyre-stock-rim", "Stock rim diameter (in)", "stockRim", "0.5", "8", "30")}
            {field("tyre-speed", "Speedometer reading to convert (km/h)", "indicatedSpeed", "5", "0", "400")}
          </div>
        )}
        {!hasError && result.stockError ? (
          <p role="alert" className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {result.stockError}
          </p>
        ) : null}
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              {form.mode === "metric" ? "Inch / flotation equivalent" : "Metric equivalent"}
            </p>
            <p className="mt-1 text-4xl font-semibold break-words text-[var(--primary)]">
              {spec ? (form.mode === "metric" ? spec.inchLabel : spec.metricLabel) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {spec
                ? `Overall diameter ${NUM1.format(spec.overallMm)} mm (${NUM2.format(spec.overallInch)} in)`
                : "Fix the input above to see a conversion."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!spec}
              aria-label="Copy tyre size conversion"
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
          {specRows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {form.compare && (
          <>
            <h2 className="mt-6 text-sm font-semibold">Against the factory size</h2>
            {comparison && !comparison.withinTolerance ? (
              <p className="mt-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
                This size is {NUM2.format(Math.abs(comparison.diffPct))}% off the factory diameter, beyond the
                ±{SAFE_DIAMETER_TOLERANCE_PCT}% window. Speedometer, odometer, ABS and stability control all read off it.
              </p>
            ) : null}
            <dl className="mt-2 divide-y divide-[var(--border)] text-sm">
              {compareRows.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Dimensions are calculated from the size code, which is nominal — a real tyre's moulded width
        and diameter vary by a few millimetres between makes and with inflation pressure. Always
        check load index, speed rating and wheel-arch clearance before changing size.
      </p>
    </main>
  );
}
