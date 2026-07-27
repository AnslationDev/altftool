"use client";

import { useMemo, useRef, useState } from "react";
import { Check, Copy, Download, Flame, RotateCcw } from "lucide-react";

import {
  AA_LARGE_TEXT,
  AA_NORMAL_TEXT,
  MOTIFS,
  PALETTES,
  POSTER_TYPES,
  SIZES,
  buildPoster,
  formatInr,
} from "../lib";

const DEFAULTS = {
  posterType: "sale",
  brand: "Sharma Electronics",
  headline: "",
  subline: "On all LED lights, lamps and home decor",
  mrp: "2499",
  discountPercent: "40",
  maxSaving: "",
  validity: "Offer valid 18-24 October",
  contact: "MG Road, Indiranagar · 98765 43210",
  paletteId: PALETTES[0].id,
  motifId: MOTIFS[0].id,
  sizeId: SIZES[0].id,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const FONT_STACK = "ui-sans-serif, system-ui, 'Segoe UI', Roboto, Arial, sans-serif";
const DASH = "—";
const RATIO = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

function Shape({ shape }) {
  if (shape.type === "circle") {
    return <circle cx={shape.cx} cy={shape.cy} r={shape.r} fill={shape.fill} opacity={shape.opacity ?? 1} />;
  }
  if (shape.type === "ellipse") {
    return (
      <ellipse cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry} fill={shape.fill} opacity={shape.opacity ?? 1} />
    );
  }
  if (shape.type === "polygon") {
    return <polygon points={shape.points} fill={shape.fill} opacity={shape.opacity ?? 1} />;
  }
  if (shape.type === "line") {
    return (
      <line
        x1={shape.x1}
        y1={shape.y1}
        x2={shape.x2}
        y2={shape.y2}
        stroke={shape.stroke}
        strokeWidth={shape.strokeWidth}
        strokeLinecap="round"
        opacity={shape.opacity ?? 1}
      />
    );
  }
  return null;
}

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);
  const svgRef = useRef(null);

  const poster = useMemo(() => buildPoster(form), [form]);
  const failed = Boolean(poster.error);
  const isSale = form.posterType === "sale";

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [key]: value }));
  };

  const copyText = async () => {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(poster.plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const serialiseSvg = () => {
    const node = svgRef.current;
    if (!node) return "";
    const clone = node.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.removeAttribute("class");
    clone.setAttribute("width", String(poster.width));
    clone.setAttribute("height", String(poster.height));
    return new XMLSerializer().serializeToString(clone);
  };

  const downloadSvg = () => {
    const markup = serialiseSvg();
    if (!markup) return;
    const blob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `diwali-poster-${form.sizeId}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPng = () => {
    const markup = serialiseSvg();
    if (!markup) return;
    const blob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = poster.width;
      canvas.height = poster.height;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, poster.width, poster.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((pngBlob) => {
        if (!pngBlob) return;
        const pngUrl = URL.createObjectURL(pngBlob);
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = `diwali-poster-${form.sizeId}.png`;
        link.click();
        URL.revokeObjectURL(pngUrl);
      }, "image/png");
    };
    image.onerror = () => URL.revokeObjectURL(url);
    image.src = url;
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  const offer = failed ? null : poster.offer;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Flame className="h-4 w-4" aria-hidden="true" />
          Diwali posters
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Diwali Poster Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a Diwali sale or greeting poster in warm festive colours. The discount maths is worked
          out for you — including what an &quot;up to&quot; cap does to the real saving — and every
          palette is checked against WCAG contrast minimums.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Poster content</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="poster-type">
              Poster type
            </label>
            <select
              id="poster-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.posterType}
              onChange={set("posterType")}
            >
              {POSTER_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="poster-brand">
              Shop or brand name
            </label>
            <input id="poster-brand" className={`mt-2 ${INPUT_CLASS}`} value={form.brand} onChange={set("brand")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="poster-headline">
              Headline (leave blank for an automatic one)
            </label>
            <input
              id="poster-headline"
              className={`mt-2 ${INPUT_CLASS}`}
              placeholder={isSale ? "FLAT 40% OFF" : "Happy Diwali"}
              value={form.headline}
              onChange={set("headline")}
            />
          </div>

          {isSale && (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="poster-mrp">
                  List price / MRP (INR)
                </label>
                <input
                  id="poster-mrp"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="1"
                  step="1"
                  value={form.mrp}
                  onChange={set("mrp")}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="poster-discount">
                  Discount (%)
                </label>
                <input
                  id="poster-discount"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="95"
                  step="1"
                  value={form.discountPercent}
                  onChange={set("discountPercent")}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS} htmlFor="poster-cap">
                  Maximum saving cap in INR (optional — the &quot;up to&quot; part)
                </label>
                <input
                  id="poster-cap"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="50"
                  value={form.maxSaving}
                  onChange={set("maxSaving")}
                />
              </div>
            </>
          )}

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="poster-subline">
              Supporting line
            </label>
            <input
              id="poster-subline"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.subline}
              onChange={set("subline")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="poster-validity">
              Validity line
            </label>
            <input
              id="poster-validity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.validity}
              onChange={set("validity")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="poster-contact">
              Address or contact
            </label>
            <input
              id="poster-contact"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.contact}
              onChange={set("contact")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="poster-palette">
              Palette
            </label>
            <select
              id="poster-palette"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.paletteId}
              onChange={set("paletteId")}
            >
              {PALETTES.map((palette) => (
                <option key={palette.id} value={palette.id}>
                  {palette.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="poster-motif">
              Motif
            </label>
            <select id="poster-motif" className={`mt-2 ${INPUT_CLASS}`} value={form.motifId} onChange={set("motifId")}>
              {MOTIFS.map((motif) => (
                <option key={motif.id} value={motif.id}>
                  {motif.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="poster-size">
              Size
            </label>
            <select id="poster-size" className={`mt-2 ${INPUT_CLASS}`} value={form.sizeId} onChange={set("sizeId")}>
              {SIZES.map((size) => (
                <option key={size.id} value={size.id}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {poster.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              {isSale ? "Price after discount" : "Headline"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : isSale ? formatInr(Math.round(offer.price)) : poster.headlineText}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed ? DASH : `${poster.paletteLabel} · ${poster.motifLabel} · ${poster.sizeLabel}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyText}
              disabled={failed}
              aria-label="Copy poster text"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy text"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset poster settings" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {failed ? (
          <p className="mt-5 text-sm text-[var(--muted-foreground)]">
            Fix the highlighted field to render the poster.
          </p>
        ) : (
          <>
            <div className="mt-5 overflow-x-auto">
              <div className="mx-auto w-full max-w-[420px]">
                <svg
                  ref={svgRef}
                  viewBox={`0 0 ${poster.width} ${poster.height}`}
                  className="h-auto w-full rounded-lg ring-1 ring-[var(--border)]"
                  role="img"
                  aria-label={`Diwali poster for ${form.brand}: ${poster.headlineText}`}
                >
                  <rect x="0" y="0" width={poster.width} height={poster.height} fill={poster.colors.bg} />
                  {poster.motif.map((shape) => (
                    <Shape key={shape.id} shape={shape} />
                  ))}
                  <rect
                    x={poster.panel.x}
                    y={poster.panel.y}
                    width={poster.panel.width}
                    height={poster.panel.height}
                    rx={poster.panel.radius}
                    fill={poster.colors.panel}
                    opacity="0.95"
                  />
                  {poster.blocks.map((block) =>
                    block.kind === "rule" ? (
                      <line
                        key={block.id}
                        x1={block.x1}
                        x2={block.x2}
                        y1={block.y}
                        y2={block.y}
                        stroke={block.stroke}
                        strokeWidth={block.strokeWidth}
                        strokeLinecap="round"
                      />
                    ) : (
                      <text
                        key={block.id}
                        x={block.x}
                        y={block.y}
                        fill={block.fill}
                        fontFamily={FONT_STACK}
                        fontSize={block.size}
                        fontWeight={block.weight}
                        letterSpacing={block.letterSpacing}
                        textAnchor="middle"
                        dominantBaseline="hanging"
                      >
                        {block.upper ? block.text.toUpperCase() : block.text}
                      </text>
                    ),
                  )}
                </svg>
              </div>
            </div>

            {poster.warning && (
              <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
                {poster.warning}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={downloadPng} aria-label="Download poster as PNG" className={PRIMARY_BTN}>
                <Download className="h-4 w-4" aria-hidden="true" />
                Download PNG
              </button>
              <button type="button" onClick={downloadSvg} aria-label="Download poster as SVG" className={GHOST_BTN}>
                <Download className="h-4 w-4" aria-hidden="true" />
                Download SVG
              </button>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {(isSale
                ? [
                    ["Headline", poster.headlineText],
                    ["List price", formatInr(Math.round(offer.mrp))],
                    ["Customer saves", formatInr(Math.round(offer.saving))],
                    ["Price after discount", formatInr(Math.round(offer.price))],
                    [
                      "Effective discount",
                      `${PCT.format(offer.effectivePercent)}%${offer.capApplied ? " (cap applied)" : ""}`,
                    ],
                  ]
                : [["Headline", poster.headlineText]]
              )
                .concat([
                  ["Canvas", `${poster.width} × ${poster.height} px`],
                  [
                    "Headline contrast",
                    `${RATIO.format(poster.contrast.headline)}:1 (${
                      poster.contrast.headlinePasses ? "passes" : "fails"
                    } ${AA_LARGE_TEXT}:1)`,
                  ],
                  [
                    "Body-text contrast",
                    `${RATIO.format(poster.contrast.support)}:1 (${
                      poster.contrast.supportPasses ? "passes" : "fails"
                    } ${AA_NORMAL_TEXT}:1)`,
                  ],
                ])
                .map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                    <dt className="text-[var(--muted-foreground)]">{label}</dt>
                    <dd className="text-right font-semibold">{value}</dd>
                  </div>
                ))}
            </dl>

            {isSale && offer.capApplied && (
              <p className="mt-4 text-sm text-[var(--muted-foreground)]">
                The cap means shoppers save {formatInr(Math.round(offer.saving))} — an effective{" "}
                {PCT.format(offer.effectivePercent)}%, not {PCT.format(offer.discountPercent)}%. Print
                the cap on the poster so the claim matches the bill.
              </p>
            )}
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Advertised discounts have to match what a customer is actually charged; price claims in India
        sit under the Consumer Protection Act 2019 and the CCPA guidelines on misleading
        advertisements. Show the cap and the validity dates on the poster, and confirm GST-inclusive
        pricing with your accountant.
      </p>
    </main>
  );
}
