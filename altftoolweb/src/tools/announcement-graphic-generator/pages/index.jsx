"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, Megaphone, RotateCcw } from "lucide-react";

import { CANVAS_PRESETS, PALETTES, TEMPLATES, TYPE_SCALE_RATIOS, buildAnnouncement, findTemplate, hslToHex } from "../lib";

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
  templateId: "launch",
  headline: "Nimbus 3.0 is live",
  eyebrow: "Now live",
  subhead: "Live ledger connectors, figures that trace back to their source row, and a close checklist your team can actually finish.",
  ctaLabel: "nimbus.app/whats-new",
  dateIso: "2026-08-14",
  todayIso: "2026-07-28",
  presetId: "ig-square",
  paletteId: "ink",
  scaleId: "perfect-fourth",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [drawn, setDrawn] = useState(null);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const chooseTemplate = (id) => setForm((current) => ({ ...current, templateId: id, eyebrow: findTemplate(id).eyebrow }));

  const request = useMemo(() => ({ ...form }), [form]);
  const estimate = useMemo(() => buildAnnouncement(request), [request]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const measure = (chunk, fontSize) => {
      ctx.font = `800 ${fontSize}px ${FONT_STACK}`;
      return ctx.measureText(chunk).width;
    };

    const spec = buildAnnouncement({ ...request, measure });
    if (spec.error) {
      setDrawn(null);
      return;
    }

    canvas.width = spec.width;
    canvas.height = spec.height;
    ctx.fillStyle = spec.background;
    ctx.fillRect(0, 0, spec.width, spec.height);

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    ctx.fillStyle = spec.accent;
    ctx.fillRect(0, 0, Math.max(6, Math.round(spec.width * 0.012)), spec.height);

    if (spec.eyebrow) {
      ctx.fillStyle = spec.accent;
      ctx.font = `700 ${spec.eyebrow.size}px ${FONT_STACK}`;
      ctx.fillText(spec.eyebrow.text, spec.eyebrow.x, spec.eyebrow.y);
    }

    ctx.fillStyle = spec.foreground;
    ctx.font = `800 ${spec.headline.fontSize}px ${FONT_STACK}`;
    spec.headline.lines.forEach((line, index) => {
      ctx.fillText(line, spec.headline.x, spec.headline.top + spec.headline.lineHeight * (index + 0.82));
    });

    if (spec.subhead) {
      ctx.save();
      ctx.globalAlpha = 0.78;
      ctx.fillStyle = spec.foreground;
      ctx.font = `400 ${spec.subhead.fontSize}px ${FONT_STACK}`;
      spec.subhead.lines.forEach((line, index) => {
        ctx.fillText(line, spec.subhead.x, spec.subhead.top + spec.subhead.lineHeight * (index + 0.82));
      });
      ctx.restore();
    }

    if (spec.date) {
      ctx.fillStyle = spec.accent;
      ctx.font = `600 ${spec.date.size}px ${FONT_STACK}`;
      const line = spec.countdown ? `${spec.date.text}  ·  ${spec.countdown}` : spec.date.text;
      ctx.fillText(line, spec.date.x, spec.date.y);
    }

    if (spec.cta) {
      ctx.fillStyle = spec.accent;
      ctx.beginPath();
      ctx.roundRect(spec.cta.x, spec.cta.y, spec.cta.width, spec.cta.height, spec.cta.radius);
      ctx.fill();
      ctx.fillStyle = spec.background;
      ctx.font = `700 ${spec.cta.size}px ${FONT_STACK}`;
      ctx.textBaseline = "middle";
      ctx.fillText(spec.cta.text, spec.cta.x + spec.cta.height * 0.5, spec.cta.y + spec.cta.height / 2);
      ctx.textBaseline = "alphabetic";
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
      link.download = `announcement-${drawn.template.id}-${drawn.width}x${drawn.height}.png`;
      link.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  const copyDetails = async () => {
    if (!drawn) return;
    const text = [
      `${drawn.template.label} announcement — ${drawn.preset.label} ${drawn.width}x${drawn.height}`,
      drawn.eyebrow ? drawn.eyebrow.text : "",
      form.headline.trim(),
      form.subhead.trim(),
      drawn.date ? `${drawn.date.text}${drawn.countdown ? ` (${drawn.countdown})` : ""}` : "",
      drawn.cta ? drawn.cta.text : "",
      `Type scale ${drawn.scale.label}: headline ${drawn.typeScale.headline}px, subhead ${drawn.typeScale.subhead}px`,
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
    setForm(DEFAULTS);
    setCopied(false);
  };

  const spec = drawn || (estimate.error ? null : estimate);
  const template = findTemplate(form.templateId);
  const dash = "—";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Megaphone className="h-4 w-4" aria-hidden="true" />
          Social graphics
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Announcement Graphic Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Six templates — launch, product update, event, hiring, milestone and maintenance — laid out
          on a modular type scale so the headline, subhead and call to action always sit in a clear
          hierarchy. Give a date and the graphic can carry a countdown line.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <fieldset>
          <legend className={LABEL_CLASS}>Template</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {TEMPLATES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => chooseTemplate(item.id)}
                aria-pressed={form.templateId === item.id}
                className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none ${
                  form.templateId === item.id
                    ? "border-[var(--primary)] text-[var(--foreground)]"
                    : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="an-headline">
              Headline
            </label>
            <input id="an-headline" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.headline} onChange={(e) => setField("headline", e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="an-eyebrow">
              Eyebrow
            </label>
            <input id="an-eyebrow" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.eyebrow} onChange={(e) => setField("eyebrow", e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="an-subhead">
              Subhead
            </label>
            <textarea id="an-subhead" className={`mt-2 ${TEXTAREA_CLASS}`} rows={3} value={form.subhead} onChange={(e) => setField("subhead", e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {template.showCta ? (
              <div>
                <label className={LABEL_CLASS} htmlFor="an-cta">
                  Call to action
                </label>
                <input id="an-cta" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.ctaLabel} onChange={(e) => setField("ctaLabel", e.target.value)} />
              </div>
            ) : null}
            {template.showDate ? (
              <>
                <div>
                  <label className={LABEL_CLASS} htmlFor="an-date">
                    {template.dateLabel}
                  </label>
                  <input id="an-date" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.dateIso} onChange={(e) => setField("dateIso", e.target.value)} />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor="an-today">
                    Countdown measured from
                  </label>
                  <input id="an-today" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.todayIso} onChange={(e) => setField("todayIso", e.target.value)} />
                </div>
              </>
            ) : null}
            <div>
              <label className={LABEL_CLASS} htmlFor="an-preset">
                Placement size
              </label>
              <select id="an-preset" className={`mt-2 ${INPUT_CLASS}`} value={form.presetId} onChange={(e) => setField("presetId", e.target.value)}>
                {CANVAS_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label} — {preset.width}x{preset.height}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="an-palette">
                Palette
              </label>
              <select id="an-palette" className={`mt-2 ${INPUT_CLASS}`} value={form.paletteId} onChange={(e) => setField("paletteId", e.target.value)}>
                {PALETTES.map((palette) => (
                  <option key={palette.id} value={palette.id}>
                    {palette.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="an-scale">
                Type scale ratio
              </label>
              <select id="an-scale" className={`mt-2 ${INPUT_CLASS}`} value={form.scaleId} onChange={(e) => setField("scaleId", e.target.value)}>
                {TYPE_SCALE_RATIOS.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {PALETTES.map((palette) => (
            <span key={palette.id} className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted-foreground)]">
              <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: hslToHex(palette.accent) }} />
              {palette.label}
            </span>
          ))}
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
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">Headline set at</p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{spec ? `${spec.typeScale.headline}px` : dash}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {spec ? `${spec.stats.headlineLines} line${spec.stats.headlineLines > 1 ? "s" : ""} on a ${spec.width}×${spec.height} canvas` : dash}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyDetails} aria-label="Copy the announcement details" className={GHOST_BTN} disabled={!spec}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy details"}
            </button>
            <button type="button" onClick={download} aria-label="Download the announcement graphic as PNG" className={PRIMARY_BTN} disabled={!spec}>
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
            aria-label={spec ? `Preview of the announcement graphic at ${spec.width} by ${spec.height} pixels` : "Announcement graphic preview"}
          />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Export size", spec ? `${spec.width}×${spec.height} (${spec.preset.note})` : dash],
            ["Type scale", spec ? spec.scale.label : dash],
            ["Headline / subhead sizes", spec ? `${spec.typeScale.headline}px / ${spec.typeScale.subhead}px` : dash],
            ["Hierarchy ratio", spec ? (spec.typeScale.hierarchyRatio === null ? "No subhead" : `${spec.typeScale.hierarchyRatio}×`) : dash],
            ["Countdown", spec ? spec.countdown || "Not shown" : dash],
            ["Text contrast", spec ? `${spec.contrast.ratio}:1 — ${spec.contrast.verdict.label}` : dash],
            ["Story safe area", spec ? (spec.safeArea ? `${spec.safeArea.top}px top, ${spec.safeArea.bottom}px bottom kept clear` : "Not applicable") : dash],
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
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The countdown is measured between the two dates you enter, in whole days and in UTC, so the
        graphic says the same thing wherever it is generated. Set the &quot;measured from&quot; date to the
        day you intend to post.
      </p>
    </main>
  );
}
