"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, RotateCcw, Ticket } from "lucide-react";

import { CANVAS_PRESETS, DISCOUNT_TYPES, PALETTES, buildCoupon, hslToHex } from "../lib";

const FONT_STACK = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const MONO_STACK = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace';

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  code: "SUMMER26",
  eyebrow: "Summer sale",
  type: "percent",
  value: "20",
  basketValue: "80",
  buyQty: "2",
  getQty: "1",
  minSpend: "50",
  maxDiscount: "",
  currency: "USD",
  expiryIso: "2026-08-31",
  todayIso: "2026-07-28",
  exclusions: "Excludes sale items",
  oneUsePerCustomer: true,
  combinable: false,
  presetId: "ig-square",
  paletteId: "signal",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [drawn, setDrawn] = useState(null);
  const [copied, setCopied] = useState("");
  const canvasRef = useRef(null);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const request = useMemo(
    () => ({
      code: form.code,
      eyebrow: form.eyebrow,
      type: form.type,
      value: Number(form.value),
      basketValue: Number(form.basketValue),
      buyQty: Number(form.buyQty),
      getQty: Number(form.getQty),
      minSpend: Number(form.minSpend),
      maxDiscount: Number(form.maxDiscount),
      currency: form.currency,
      expiryIso: form.expiryIso,
      todayIso: form.todayIso,
      exclusions: form.exclusions,
      oneUsePerCustomer: form.oneUsePerCustomer,
      combinable: form.combinable,
      presetId: form.presetId,
      paletteId: form.paletteId,
    }),
    [form],
  );

  const estimate = useMemo(() => buildCoupon(request), [request]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const measure = (chunk, fontSize) => {
      ctx.font = `800 ${fontSize}px ${FONT_STACK}`;
      return ctx.measureText(chunk).width;
    };

    const spec = buildCoupon({ ...request, measure });
    if (spec.error) {
      setDrawn(null);
      return;
    }

    canvas.width = spec.width;
    canvas.height = spec.height;
    ctx.fillStyle = spec.background;
    ctx.fillRect(0, 0, spec.width, spec.height);

    // Ticket body with a dashed outline and two punched notches.
    ctx.save();
    ctx.strokeStyle = spec.foreground;
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = Math.max(2, Math.round(spec.width * 0.003));
    ctx.setLineDash([ctx.lineWidth * 5, ctx.lineWidth * 4]);
    ctx.beginPath();
    ctx.roundRect(spec.card.x, spec.card.y, spec.card.width, spec.card.height, spec.card.radius);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = spec.background;
    [spec.card.x, spec.card.x + spec.card.width].forEach((x) => {
      ctx.beginPath();
      ctx.arc(x, spec.perforation.y, spec.perforation.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    if (spec.eyebrow) {
      ctx.fillStyle = spec.accent;
      ctx.font = `700 ${spec.eyebrow.size}px ${FONT_STACK}`;
      ctx.fillText(spec.eyebrow.text, spec.eyebrow.x, spec.eyebrow.y);
    }

    ctx.fillStyle = spec.foreground;
    ctx.font = `800 ${spec.headline.size}px ${FONT_STACK}`;
    ctx.fillText(spec.headline.text, spec.headline.x, spec.headline.y);

    ctx.fillStyle = spec.accent;
    ctx.beginPath();
    ctx.roundRect(spec.codeBox.x, spec.codeBox.y, spec.codeBox.width, spec.codeBox.height, spec.codeBox.radius);
    ctx.fill();
    ctx.fillStyle = spec.background;
    ctx.font = `700 ${spec.codeBox.textSize}px ${MONO_STACK}`;
    ctx.textBaseline = "middle";
    ctx.fillText(spec.code, spec.codeBox.centreX, spec.codeBox.textY);
    ctx.textBaseline = "alphabetic";

    if (spec.expiry.text) {
      ctx.fillStyle = spec.foreground;
      ctx.font = `600 ${spec.expiry.size}px ${FONT_STACK}`;
      ctx.fillText(spec.expiry.text, spec.expiry.x, spec.expiry.y);
    }

    if (spec.terms.lines.length) {
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = spec.foreground;
      ctx.font = `400 ${spec.terms.size}px ${FONT_STACK}`;
      spec.terms.lines.forEach((line, index) => {
        ctx.fillText(line, spec.terms.x, spec.terms.top + spec.terms.size * 1.35 * (index + 0.8));
      });
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
      link.download = `coupon-${drawn.code}-${drawn.width}x${drawn.height}.png`;
      link.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  const copyText = async (what, value) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(what);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied("");
  };

  const spec = drawn || (estimate.error ? null : estimate);
  const dash = "—";
  const typeMeta = DISCOUNT_TYPES.find((entry) => entry.id === form.type) || DISCOUNT_TYPES[0];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Ticket className="h-4 w-4" aria-hidden="true" />
          Social graphics
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Coupon Graphic Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a discount code graphic and see what the offer is really worth. Percent off, amount
          off, buy-X-get-Y and free shipping are each calculated properly — a buy 2 get 1 free is a
          33.3% saving, not 50% — and the terms line is assembled for you.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cp-code">
              Promo code
            </label>
            <input id="cp-code" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.code} onChange={(e) => setField("code", e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cp-eyebrow">
              Eyebrow
            </label>
            <input id="cp-eyebrow" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.eyebrow} onChange={(e) => setField("eyebrow", e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cp-type">
              Offer type
            </label>
            <select id="cp-type" className={`mt-2 ${INPUT_CLASS}`} value={form.type} onChange={(e) => setField("type", e.target.value)}>
              {DISCOUNT_TYPES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cp-value">
              {typeMeta.valueLabel}
            </label>
            <input id="cp-value" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.01" value={form.value} onChange={(e) => setField("value", e.target.value)} />
          </div>
          {form.type === "bogo" ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="cp-buy">
                  Buy quantity
                </label>
                <input id="cp-buy" className={`mt-2 ${INPUT_CLASS}`} type="number" min="1" step="1" value={form.buyQty} onChange={(e) => setField("buyQty", e.target.value)} />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="cp-get">
                  Get free quantity
                </label>
                <input id="cp-get" className={`mt-2 ${INPUT_CLASS}`} type="number" min="1" step="1" value={form.getQty} onChange={(e) => setField("getQty", e.target.value)} />
              </div>
            </>
          ) : (
            <div>
              <label className={LABEL_CLASS} htmlFor="cp-basket">
                Example order value
              </label>
              <input id="cp-basket" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.01" value={form.basketValue} onChange={(e) => setField("basketValue", e.target.value)} />
            </div>
          )}
          <div>
            <label className={LABEL_CLASS} htmlFor="cp-min">
              Minimum spend (0 for none)
            </label>
            <input id="cp-min" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.01" value={form.minSpend} onChange={(e) => setField("minSpend", e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cp-cap">
              Maximum discount (blank for none)
            </label>
            <input id="cp-cap" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.01" value={form.maxDiscount} onChange={(e) => setField("maxDiscount", e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cp-currency">
              Currency code
            </label>
            <input id="cp-currency" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.currency} onChange={(e) => setField("currency", e.target.value.toUpperCase())} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cp-expiry">
              Expires
            </label>
            <input id="cp-expiry" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.expiryIso} onChange={(e) => setField("expiryIso", e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cp-today">
              Countdown measured from
            </label>
            <input id="cp-today" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.todayIso} onChange={(e) => setField("todayIso", e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cp-exclusions">
              Extra terms
            </label>
            <input id="cp-exclusions" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.exclusions} onChange={(e) => setField("exclusions", e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cp-preset">
              Placement size
            </label>
            <select id="cp-preset" className={`mt-2 ${INPUT_CLASS}`} value={form.presetId} onChange={(e) => setField("presetId", e.target.value)}>
              {CANVAS_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label} — {preset.width}x{preset.height}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cp-palette">
              Palette
            </label>
            <select id="cp-palette" className={`mt-2 ${INPUT_CLASS}`} value={form.paletteId} onChange={(e) => setField("paletteId", e.target.value)}>
              {PALETTES.map((palette) => (
                <option key={palette.id} value={palette.id}>
                  {palette.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <label className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold" htmlFor="cp-oneuse">
            <input id="cp-oneuse" type="checkbox" className="h-4 w-4" checked={form.oneUsePerCustomer} onChange={(e) => setField("oneUsePerCustomer", e.target.checked)} />
            One use per customer
          </label>
          <label className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold" htmlFor="cp-combine">
            <input id="cp-combine" type="checkbox" className="h-4 w-4" checked={form.combinable} onChange={(e) => setField("combinable", e.target.checked)} />
            Can be combined with other offers
          </label>
          <span className="inline-flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
            <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: hslToHex((PALETTES.find((p) => p.id === form.paletteId) || PALETTES[0]).accent) }} />
            Accent preview
          </span>
        </div>
      </section>

      {estimate.error ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {estimate.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">Real saving</p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{spec ? spec.money.discount : dash}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {spec ? `${spec.offer.effectivePercent}% off ${spec.money.before} — pay ${spec.money.final}` : dash}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => copyText("terms", spec ? spec.terms.text : "")} aria-label="Copy the terms line" className={GHOST_BTN} disabled={!spec}>
              {copied === "terms" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied === "terms" ? "Copied!" : "Copy terms"}
            </button>
            <button type="button" onClick={download} aria-label="Download the coupon graphic as PNG" className={PRIMARY_BTN} disabled={!spec}>
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
            aria-label={spec ? `Preview of the coupon graphic at ${spec.width} by ${spec.height} pixels` : "Coupon graphic preview"}
          />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Code on the graphic", spec ? spec.code : dash],
            ["Headline", spec ? spec.headline.text : dash],
            ["Order value before / after", spec ? `${spec.money.before} → ${spec.money.final}` : dash],
            ["Effective discount", spec ? `${spec.offer.effectivePercent}%` : dash],
            ["Expiry", spec ? spec.expiry.text || "No expiry set" : dash],
            ["Days remaining", spec ? (spec.expiry.days === null ? "Not calculated" : String(spec.expiry.days)) : dash],
            ["Text contrast", spec ? `${spec.contrast.ratio}:1 — ${spec.contrast.verdict.label}` : dash],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {spec && spec.warnings.length > 0 ? (
          <ul className="mt-4 grid gap-2">
            {spec.warnings.map((warning) => (
              <li key={warning} className="rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
                {warning}
              </li>
            ))}
          </ul>
        ) : null}

        {spec && spec.terms.text ? (
          <p className="mt-4 rounded-md border border-[var(--border)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">{spec.terms.text}</p>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Advertising rules in most markets require the material conditions of an offer — expiry,
        minimum spend, exclusions and any usage limit — to appear with the offer itself. This tool
        assembles that line, but it is not legal advice; check the wording against the rules that
        apply where you trade.
      </p>
    </main>
  );
}
