"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, MessageSquareQuote, RotateCcw } from "lucide-react";

import { CARD_PRESETS, PALETTES, buildTestimonialCard, findPalette, hslToHex, starPolygon } from "../lib";

const FONT_STACK = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  quote: "We closed the month two days early for the first time in three years, and nobody had to rebuild the reconciliation sheet.",
  name: "Priya Raman",
  role: "Head of Finance",
  company: "Northwind Logistics",
  source: "Verified review, March 2026",
  rating: "5",
  showRating: true,
  presetId: "ig-portrait",
  paletteId: "paper",
};

function tracePolygon(ctx, vertices) {
  vertices.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.closePath();
}

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [drawn, setDrawn] = useState(null);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const request = useMemo(
    () => ({
      quote: form.quote,
      name: form.name,
      role: form.role,
      company: form.company,
      source: form.source,
      rating: form.rating,
      showRating: form.showRating,
      presetId: form.presetId,
      paletteId: form.paletteId,
    }),
    [form],
  );

  const estimate = useMemo(() => buildTestimonialCard(request), [request]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const measure = (chunk, fontSize) => {
      ctx.font = `500 ${fontSize}px ${FONT_STACK}`;
      return ctx.measureText(chunk).width;
    };

    const spec = buildTestimonialCard({ ...request, measure });
    if (spec.error) {
      setDrawn(null);
      return;
    }

    canvas.width = spec.width;
    canvas.height = spec.height;

    ctx.fillStyle = spec.background;
    ctx.fillRect(0, 0, spec.width, spec.height);

    const box = spec.cardBox;
    ctx.fillStyle = spec.card;
    ctx.beginPath();
    ctx.roundRect(box.x, box.y, box.width, box.height, box.radius);
    ctx.fill();

    spec.stars.forEach((star) => {
      const vertices = starPolygon({ cx: star.cx, cy: star.cy, outerRadius: star.radius });
      ctx.save();
      ctx.beginPath();
      tracePolygon(ctx, vertices);
      ctx.fillStyle = spec.foreground;
      ctx.globalAlpha = 0.18;
      ctx.fill();
      ctx.restore();

      if (star.fill > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(star.cx - star.radius, star.cy - star.radius, star.radius * 2 * star.fill, star.radius * 2);
        ctx.clip();
        ctx.beginPath();
        tracePolygon(ctx, vertices);
        ctx.fillStyle = spec.accent;
        ctx.fill();
        ctx.restore();
      }
    });

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = spec.foreground;
    ctx.font = `500 ${spec.quote.fontSize}px ${FONT_STACK}`;
    spec.quote.lines.forEach((line, index) => {
      ctx.fillText(line, spec.quote.x, spec.quote.top + spec.quote.lineHeight * (index + 0.8));
    });

    const id = spec.identity;
    if (id.name || id.role || id.company) {
      ctx.beginPath();
      ctx.arc(id.avatarCx, id.avatarCy, id.avatarRadius, 0, Math.PI * 2);
      ctx.fillStyle = hslToHex({ h: id.avatarHue, s: 62, l: 45 });
      ctx.fill();

      if (id.initials) {
        ctx.fillStyle = hslToHex({ h: id.avatarHue, s: 60, l: 98 });
        ctx.font = `700 ${Math.round(id.avatarRadius * 0.9)}px ${FONT_STACK}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(id.initials, id.avatarCx, id.avatarCy + id.avatarRadius * 0.04);
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
      }

      if (id.name) {
        ctx.fillStyle = spec.foreground;
        ctx.font = `700 ${id.nameSize}px ${FONT_STACK}`;
        ctx.fillText(id.name, id.textX, id.avatarCy - id.roleSize * 0.15);
      }
      const secondLine = [id.role, id.company].filter(Boolean).join(", ");
      if (secondLine) {
        ctx.fillStyle = spec.accent;
        ctx.font = `500 ${id.roleSize}px ${FONT_STACK}`;
        ctx.fillText(secondLine, id.textX, id.avatarCy + id.roleSize * 1.15);
      }
    }

    if (spec.source) {
      ctx.save();
      ctx.globalAlpha = 0.65;
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
      link.download = `testimonial-${drawn.preset.id}-${drawn.width}x${drawn.height}.png`;
      link.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  const copyDetails = async () => {
    if (!drawn) return;
    const text = [
      `Testimonial card — ${drawn.preset.label} ${drawn.width}x${drawn.height}`,
      `"${form.quote.trim()}"`,
      [form.name, form.role, form.company].filter(Boolean).join(" · "),
      drawn.showRating ? `Rating: ${drawn.rating} of 5` : "",
      `Attribution strength: ${drawn.credibility.score}%`,
      `Quote contrast: ${drawn.contrast.quote}:1 — ${drawn.contrast.verdict.label}`,
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
    setForm(DEFAULTS);
    setCopied(false);
  };

  const spec = drawn || (estimate.error ? null : estimate);
  const dash = "—";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <MessageSquareQuote className="h-4 w-4" aria-hidden="true" />
          Social graphics
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Testimonial Graphic Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a testimonial card with a star rating, an initials avatar and a name row, exported at
          the exact size each placement wants. The tool also scores how complete the attribution is
          and checks the quote&apos;s contrast against the card.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="tg-quote">
              Testimonial
            </label>
            <textarea id="tg-quote" className={`mt-2 ${TEXTAREA_CLASS}`} rows={3} value={form.quote} onChange={(e) => setField("quote", e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="tg-name">
                Name
              </label>
              <input id="tg-name" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.name} onChange={(e) => setField("name", e.target.value)} />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="tg-role">
                Job title
              </label>
              <input id="tg-role" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.role} onChange={(e) => setField("role", e.target.value)} />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="tg-company">
                Company
              </label>
              <input id="tg-company" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.company} onChange={(e) => setField("company", e.target.value)} />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="tg-source">
                Source or date
              </label>
              <input id="tg-source" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.source} onChange={(e) => setField("source", e.target.value)} />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="tg-rating">
                Star rating (0–5, halves allowed)
              </label>
              <input
                id="tg-rating"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="5"
                step="0.5"
                value={form.rating}
                onChange={(e) => setField("rating", e.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="tg-preset">
                Placement size
              </label>
              <select id="tg-preset" className={`mt-2 ${INPUT_CLASS}`} value={form.presetId} onChange={(e) => setField("presetId", e.target.value)}>
                {CARD_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label} — {preset.width}x{preset.height}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <fieldset>
            <legend className={LABEL_CLASS}>Palette</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {PALETTES.map((palette) => (
                <button
                  key={palette.id}
                  type="button"
                  onClick={() => setField("paletteId", palette.id)}
                  aria-pressed={form.paletteId === palette.id}
                  className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none ${
                    form.paletteId === palette.id
                      ? "border-[var(--primary)] text-[var(--foreground)]"
                      : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  <span className="mr-2 inline-block h-3 w-3 rounded-full align-middle" style={{ backgroundColor: hslToHex(findPalette(palette.id).bg) }} />
                  {palette.label}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold" htmlFor="tg-show-rating">
            <input id="tg-show-rating" type="checkbox" className="h-4 w-4" checked={form.showRating} onChange={(e) => setField("showRating", e.target.checked)} />
            Show the star rating
          </label>
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
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">Attribution strength</p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{spec ? `${spec.credibility.score}%` : dash}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {spec
                ? spec.credibility.missing.length
                  ? `Missing: ${spec.credibility.missing.join(", ")}`
                  : "Name, role, company, rating and source all present"
                : dash}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyDetails} aria-label="Copy the testimonial card details" className={GHOST_BTN} disabled={!spec}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy details"}
            </button>
            <button type="button" onClick={download} aria-label="Download the testimonial card as PNG" className={PRIMARY_BTN} disabled={!spec}>
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
            aria-label={spec ? `Preview of the testimonial card at ${spec.width} by ${spec.height} pixels` : "Testimonial card preview"}
          />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Export size", spec ? `${spec.width}×${spec.height} (${spec.preset.note})` : dash],
            ["Rating shown", spec ? (spec.showRating ? `${spec.rating} of 5` : "Hidden") : dash],
            ["Quote type size", spec ? `${spec.quote.fontSize}px, ${spec.quote.lines.length} lines` : dash],
            ["Quote contrast on card", spec ? `${spec.contrast.quote}:1 — ${spec.contrast.verdict.label}` : dash],
            ["Card against background", spec ? `${spec.contrast.card}:1` : dash],
            ["Characters / words", spec ? `${spec.stats.characters} / ${spec.stats.words}` : dash],
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
        Publish a customer&apos;s words, name or job title only with their permission. The attribution
        score measures what is filled in, not whether the review is genuine.
      </p>
    </main>
  );
}
