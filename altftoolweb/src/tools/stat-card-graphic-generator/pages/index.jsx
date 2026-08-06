"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChartColumn, Copy, Download, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  CARD_PRESETS,
  LABEL_TEXT_OPACITY,
  MAX_STATS,
  PALETTES,
  SOURCE_TEXT_OPACITY,
  VALUE_FORMATS,
  buildStatCard,
  hslToHex,
} from "../lib";

const FONT_STACK = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const blankStat = (seq) => ({
  id: `stat-${seq}`,
  value: "",
  previous: "",
  format: "number",
  decimals: "0",
  currency: "USD",
  prefix: "",
  suffix: "",
  label: "",
  isPercentMetric: false,
});

const DEFAULT_STATS = [
  { id: "stat-1", value: "6", previous: "4", format: "percent", decimals: "1", currency: "USD", prefix: "", suffix: "", label: "Checkout conversion", isPercentMetric: true },
  { id: "stat-2", value: "1240000", previous: "980000", format: "compact", decimals: "1", currency: "USD", prefix: "", suffix: "", label: "Monthly sessions", isPercentMetric: false },
];

const DEFAULTS = {
  headline: "Q2 2026 in two numbers",
  source: "Internal analytics, 1 Apr – 30 Jun 2026",
  presetId: "ig-square",
  paletteId: "ink",
};

export default function ToolHome() {
  const [meta, setMeta] = useState(DEFAULTS);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [drawn, setDrawn] = useState(null);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  const setMetaField = (key, value) => setMeta((current) => ({ ...current, [key]: value }));
  const setStatField = (id, key, value) =>
    setStats((current) => current.map((stat) => (stat.id === id ? { ...stat, [key]: value } : stat)));

  const addStat = () =>
    setStats((current) => {
      if (current.length >= MAX_STATS) return current;
      // Derive the next id from existing state, never from a ref.
      const maxSeq = current.reduce((max, stat) => Math.max(max, Number(String(stat.id).split("-")[1]) || 0), 0);
      return [...current, blankStat(maxSeq + 1)];
    });

  const removeStat = (id) => setStats((current) => (current.length <= 1 ? current : current.filter((stat) => stat.id !== id)));

  const request = useMemo(
    () => ({
      headline: meta.headline,
      source: meta.source,
      presetId: meta.presetId,
      paletteId: meta.paletteId,
      stats: stats.map((stat) => ({
        value: stat.value,
        previous: stat.previous,
        format: stat.format,
        decimals: Number(stat.decimals),
        currency: stat.currency,
        prefix: stat.prefix,
        suffix: stat.suffix,
        label: stat.label,
        isPercentMetric: stat.isPercentMetric,
      })),
    }),
    [meta, stats],
  );

  const estimate = useMemo(() => buildStatCard(request), [request]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const measure = (chunk, fontSize) => {
      ctx.font = `800 ${fontSize}px ${FONT_STACK}`;
      return ctx.measureText(chunk).width;
    };

    const spec = buildStatCard({ ...request, measure });
    if (spec.error) {
      setDrawn(null);
      return;
    }

    canvas.width = spec.width;
    canvas.height = spec.height;
    ctx.fillStyle = spec.background;
    ctx.fillRect(0, 0, spec.width, spec.height);

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    if (spec.headline) {
      ctx.fillStyle = spec.accent;
      ctx.font = `700 ${spec.headline.size}px ${FONT_STACK}`;
      ctx.fillText(spec.headline.text, spec.headline.x, spec.headline.y);
    }

    spec.items.forEach((item) => {
      ctx.fillStyle = spec.foreground;
      ctx.font = `800 ${item.numberSize}px ${FONT_STACK}`;
      ctx.fillText(item.valueText, item.centreX, item.numberY);

      if (item.label) {
        ctx.fillStyle = spec.foreground;
        ctx.save();
        ctx.globalAlpha = LABEL_TEXT_OPACITY;
        ctx.font = `600 ${item.labelSize}px ${FONT_STACK}`;
        ctx.fillText(item.label, item.centreX, item.labelY);
        ctx.restore();
      }

      if (item.deltaText) {
        ctx.fillStyle = item.deltaColour;
        ctx.font = `700 ${item.deltaSize}px ${FONT_STACK}`;
        ctx.fillText(item.deltaText, item.centreX, item.deltaY);
      }
    });

    if (spec.source) {
      ctx.save();
      ctx.globalAlpha = SOURCE_TEXT_OPACITY;
      ctx.fillStyle = spec.foreground;
      ctx.font = `500 ${spec.source.size}px ${FONT_STACK}`;
      ctx.fillText(spec.source.text, spec.source.x, spec.source.y);
      ctx.restore();
    }

    setDrawn(spec);
  }, [request]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas || !drawn) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `stat-card-${drawn.preset.id}-${drawn.width}x${drawn.height}.png`;
      link.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  const copyDetails = async () => {
    if (!drawn) return;
    const text = [
      `Stat card — ${drawn.preset.label} ${drawn.width}x${drawn.height}`,
      meta.headline ? `Headline: ${meta.headline}` : "",
      ...drawn.items.map((item) => `${item.label || "Stat"}: ${item.valueText}${item.deltaText ? ` (${item.deltaText})` : ""}`),
      meta.source ? `Source: ${meta.source}` : "",
      `Contrast ${drawn.contrast.ratio}:1 — ${drawn.contrast.verdict.label}`,
    ]
      .filter(Boolean)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset all inputs? This clears the headline, source line and every stat you have entered and cannot be undone.",
      )
    ) {
      return;
    }
    setMeta(DEFAULTS);
    setStats(DEFAULT_STATS);
    setCopied(false);
  };

  const spec = drawn || (estimate.error ? null : estimate);
  const dash = "—";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ChartColumn className="h-4 w-4" aria-hidden="true" />
          Social graphics
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Stat Card Graphic Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set one to four numbers as a carousel slide or report graphic. Give a previous value and the
          card shows the relative change — and, for a metric that is itself a percentage, the change
          in percentage points as well.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sc-headline">
              Headline
            </label>
            <input id="sc-headline" className={`mt-2 ${INPUT_CLASS}`} type="text" value={meta.headline} onChange={(e) => setMetaField("headline", e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sc-source">
              Source line
            </label>
            <input id="sc-source" className={`mt-2 ${INPUT_CLASS}`} type="text" value={meta.source} onChange={(e) => setMetaField("source", e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sc-preset">
              Placement size
            </label>
            <select id="sc-preset" className={`mt-2 ${INPUT_CLASS}`} value={meta.presetId} onChange={(e) => setMetaField("presetId", e.target.value)}>
              {CARD_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label} — {preset.width}x{preset.height}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sc-palette">
              Palette
            </label>
            <select id="sc-palette" className={`mt-2 ${INPUT_CLASS}`} value={meta.paletteId} onChange={(e) => setMetaField("paletteId", e.target.value)}>
              {PALETTES.map((palette) => (
                <option key={palette.id} value={palette.id}>
                  {palette.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {stats.map((stat, index) => (
        <section key={stat.id} className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Stat {index + 1}</h2>
            {stats.length > 1 ? (
              <button type="button" onClick={() => removeStat(stat.id)} aria-label={`Remove stat ${index + 1}`} className={GHOST_BTN}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            ) : null}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor={`${stat.id}-value`}>
                Value
              </label>
              <input id={`${stat.id}-value`} className={`mt-2 ${INPUT_CLASS}`} type="text" inputMode="decimal" value={stat.value} onChange={(e) => setStatField(stat.id, "value", e.target.value)} />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor={`${stat.id}-label`}>
                Caption
              </label>
              <input id={`${stat.id}-label`} className={`mt-2 ${INPUT_CLASS}`} type="text" value={stat.label} onChange={(e) => setStatField(stat.id, "label", e.target.value)} />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor={`${stat.id}-format`}>
                Format
              </label>
              <select id={`${stat.id}-format`} className={`mt-2 ${INPUT_CLASS}`} value={stat.format} onChange={(e) => setStatField(stat.id, "format", e.target.value)}>
                {VALUE_FORMATS.map((format) => (
                  <option key={format.id} value={format.id}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor={`${stat.id}-decimals`}>
                Decimal places
              </label>
              <input id={`${stat.id}-decimals`} className={`mt-2 ${INPUT_CLASS}`} type="number" min="0" max="4" step="1" value={stat.decimals} onChange={(e) => setStatField(stat.id, "decimals", e.target.value)} />
            </div>
            {stat.format === "currency" ? (
              <div>
                <label className={LABEL_CLASS} htmlFor={`${stat.id}-currency`}>
                  Currency code
                </label>
                <input id={`${stat.id}-currency`} className={`mt-2 ${INPUT_CLASS}`} type="text" value={stat.currency} onChange={(e) => setStatField(stat.id, "currency", e.target.value.toUpperCase())} />
              </div>
            ) : null}
            <div>
              <label className={LABEL_CLASS} htmlFor={`${stat.id}-previous`}>
                Previous value (optional)
              </label>
              <input id={`${stat.id}-previous`} className={`mt-2 ${INPUT_CLASS}`} type="text" inputMode="decimal" value={stat.previous} onChange={(e) => setStatField(stat.id, "previous", e.target.value)} />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor={`${stat.id}-suffix`}>
                Suffix (optional)
              </label>
              <input id={`${stat.id}-suffix`} className={`mt-2 ${INPUT_CLASS}`} type="text" value={stat.suffix} onChange={(e) => setStatField(stat.id, "suffix", e.target.value)} />
            </div>
          </div>
          <label className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold" htmlFor={`${stat.id}-pp`}>
            <input id={`${stat.id}-pp`} type="checkbox" className="h-4 w-4" checked={stat.isPercentMetric} onChange={(e) => setStatField(stat.id, "isPercentMetric", e.target.checked)} />
            This metric is itself a percentage — also show percentage points
          </label>
        </section>
      ))}

      {stats.length < MAX_STATS ? (
        <button type="button" onClick={addStat} className={`mt-4 ${GHOST_BTN}`} aria-label="Add another stat">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add stat
        </button>
      ) : null}

      {estimate.error ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {estimate.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">Headline number</p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{spec ? spec.items[0].valueText : dash}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {spec ? `${spec.stats.count} stat${spec.stats.count > 1 ? "s" : ""} on a ${spec.columns}×${spec.rows} grid` : dash}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyDetails} aria-label="Copy the stat card details" className={GHOST_BTN} disabled={!spec}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy details"}
            </button>
            <button type="button" onClick={download} aria-label="Download the stat card as PNG" className={PRIMARY_BTN} disabled={!spec}>
              <Download className="h-4 w-4" aria-hidden="true" />
              PNG
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <canvas
            ref={canvasRef}
            className="mx-auto block h-auto max-h-[70vh] w-auto max-w-full rounded-lg ring-1 ring-[var(--border)]"
            role="img"
            aria-label={spec ? `Preview of the stat card at ${spec.width} by ${spec.height} pixels` : "Stat card preview"}
          />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Export size", spec ? `${spec.width}×${spec.height} (${spec.preset.note})` : dash],
            ["Largest number set at", spec ? `${spec.stats.largestNumberSize}px` : dash],
            ["Change shown", spec ? spec.items.map((item) => item.deltaText || "none").join(" · ") : dash],
            ["Number contrast", spec ? `${spec.contrast.ratio}:1 — ${spec.contrast.verdict.label}` : dash],
            ["Caption contrast", spec ? `${spec.contrast.labelRatio}:1 — ${spec.contrast.labelVerdict.label}` : dash],
            ["Source line contrast", spec ? `${spec.contrast.sourceRatio}:1 — ${spec.contrast.sourceVerdict.label}` : dash],
            [
              "Trend colour contrast",
              spec
                ? `▲ ${spec.contrast.positiveRatio}:1 (${spec.contrast.positiveVerdict.label}) · ▼ ${spec.contrast.negativeRatio}:1 (${spec.contrast.negativeVerdict.label})`
                : dash,
            ],
            ["Headline contrast", spec ? `${spec.contrast.accentRatio}:1` : dash],
            ["Story safe area", spec ? (spec.safeArea ? `${spec.safeArea.top}px top, ${spec.safeArea.bottom}px bottom kept clear` : "Not applicable") : dash],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A number on a graphic carries more weight than the same number in a sentence, so keep the
        source line filled in and state the period it covers. A zero baseline has no percentage
        change — the card says so rather than printing an infinite figure.
      </p>
    </main>
  );
}
