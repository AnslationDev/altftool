"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Download, LayoutGrid, RotateCcw, TriangleAlert } from "lucide-react";

import { HUE_PRESETS, ICON_STYLES, KEY_SIZES, LABEL_POSITIONS, buildKeyIcon } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const RANGE_CLASS = "mt-2 h-11 w-full accent-[var(--primary)] focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  label: "Mute Mic",
  glyph: "",
  size: 144,
  hue: 174,
  saturation: 65,
  lightness: 42,
  radiusPercent: 16,
  style: "solid",
  labelPosition: "bottom",
};

const DASH = "—";

const slug = (value) =>
  String(value || "key-icon")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "key-icon";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setText = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const setNumber = (key) => (event) => {
    const value = Number(event.target.value);
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const icon = useMemo(() => buildKeyIcon(form), [form]);

  const copySvg = async () => {
    if (icon.error) return;
    try {
      await navigator.clipboard.writeText(icon.svg);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const downloadSvg = () => {
    if (icon.error) return;
    const blob = new Blob([icon.svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${slug(form.label || form.glyph)}-${icon.size}.svg`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const downloadPng = () => {
    if (icon.error) return;
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = icon.size;
      canvas.height = icon.size;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.drawImage(image, 0, 0, icon.size, icon.size);
      const anchor = document.createElement("a");
      anchor.href = canvas.toDataURL("image/png");
      anchor.download = `${slug(form.label || form.glyph)}-${icon.size}.png`;
      anchor.click();
    };
    image.src = icon.dataUri;
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <LayoutGrid className="h-4 w-4" aria-hidden="true" />
          Control surface
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Stream Deck Icon Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build square key icons at 72, 144 or 288 px with a glyph and a label, check the
          label contrast against the WCAG AA threshold, and export SVG or PNG. Everything happens
          in your browser.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sd-label">
              Key label
            </label>
            <input
              id="sd-label"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.label}
              onChange={setText("label")}
              placeholder="Mute Mic"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sd-glyph">
              Glyph (1-3 characters, blank = initials)
            </label>
            <input
              id="sd-glyph"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.glyph}
              onChange={setText("glyph")}
              placeholder="MM"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sd-size">
              Export size
            </label>
            <select id="sd-size" className={`mt-2 ${INPUT_CLASS}`} value={form.size} onChange={setNumber("size")}>
              {KEY_SIZES.map((option) => (
                <option key={option.px} value={option.px}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sd-style">
              Style
            </label>
            <select id="sd-style" className={`mt-2 ${INPUT_CLASS}`} value={form.style} onChange={setText("style")}>
              {Object.entries(ICON_STYLES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sd-labelpos">
              Layout
            </label>
            <select
              id="sd-labelpos"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.labelPosition}
              onChange={setText("labelPosition")}
            >
              {Object.entries(LABEL_POSITIONS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sd-radius">
              Corner radius: {form.radiusPercent}%
            </label>
            <input
              id="sd-radius"
              className={RANGE_CLASS}
              type="range"
              min="0"
              max="50"
              step="1"
              value={form.radiusPercent}
              onChange={setNumber("radiusPercent")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sd-hue">
              Hue: {form.hue}&deg;
            </label>
            <input
              id="sd-hue"
              className={RANGE_CLASS}
              type="range"
              min="0"
              max="359"
              step="1"
              value={form.hue}
              onChange={setNumber("hue")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sd-sat">
              Saturation: {form.saturation}%
            </label>
            <input
              id="sd-sat"
              className={RANGE_CLASS}
              type="range"
              min="0"
              max="100"
              step="1"
              value={form.saturation}
              onChange={setNumber("saturation")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sd-light">
              Lightness: {form.lightness}%
            </label>
            <input
              id="sd-light"
              className={RANGE_CLASS}
              type="range"
              min="0"
              max="100"
              step="1"
              value={form.lightness}
              onChange={setNumber("lightness")}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {HUE_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => {
                setForm((prev) => ({ ...prev, hue: preset.hue }));
                setCopied(false);
              }}
              aria-pressed={form.hue === preset.hue}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </section>

      {icon.error ? (
        <>
          <p
            role="alert"
            className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {icon.error}
          </p>
          <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Label contrast
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--muted-foreground)]">{DASH}</p>
            <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
              {["Export size", "Background", "Text colour"].map((label) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold text-[var(--muted-foreground)]">{DASH}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Label contrast
                </p>
                <p
                  className={`mt-1 text-4xl font-semibold ${icon.meetsAa ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
                >
                  {icon.contrast.toFixed(2)}
                  <span className="text-xl text-[var(--muted-foreground)]">:1</span>
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {icon.meetsAa ? "Passes" : "Fails"} the WCAG AA large-text threshold of 3:1
                </p>
              </div>
              <div className="flex items-end gap-4">
                <figure className="text-center">
                  <img
                    src={icon.dataUri}
                    alt={`Key icon preview, ${icon.label || icon.glyph}`}
                    width={144}
                    height={144}
                    className="h-[144px] w-[144px] rounded-lg"
                  />
                  <figcaption className="mt-1 text-xs text-[var(--muted-foreground)]">144 px</figcaption>
                </figure>
                <figure className="text-center">
                  <img
                    src={icon.dataUri}
                    alt=""
                    aria-hidden="true"
                    width={72}
                    height={72}
                    className="h-[72px] w-[72px] rounded-md"
                  />
                  <figcaption className="mt-1 text-xs text-[var(--muted-foreground)]">72 px</figcaption>
                </figure>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={copySvg} aria-label="Copy the SVG markup" className={GHOST_BTN}>
                {copied ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                {copied ? "Copied!" : "Copy result"}
              </button>
              <button type="button" onClick={downloadPng} aria-label="Download the icon as PNG" className={PRIMARY_BTN}>
                <Download className="h-4 w-4" aria-hidden="true" />
                PNG
              </button>
              <button type="button" onClick={downloadSvg} aria-label="Download the icon as SVG" className={GHOST_BTN}>
                <Download className="h-4 w-4" aria-hidden="true" />
                SVG
              </button>
              <button type="button" onClick={reset} aria-label="Reset all settings" className={GHOST_BTN}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Export size", `${icon.size} x ${icon.size} px`],
                ["Background", icon.background],
                ["Accent", icon.accent],
                ["Text colour", icon.textColor],
                ["Glyph", icon.glyph || "None"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {icon.warnings.length > 0 && (
            <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">Before you export</h2>
              <ul className="mt-3 space-y-2 text-sm leading-6">
                {icon.warnings.map((warning) => (
                  <li
                    key={warning}
                    className="flex items-start gap-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-[var(--danger)]"
                  >
                    <TriangleAlert className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">SVG markup</h2>
            <label className="sr-only" htmlFor="sd-svg">
              Generated SVG markup
            </label>
            <textarea
              id="sd-svg"
              readOnly
              rows={5}
              value={icon.svg}
              className="mt-3 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            />
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Keep one hue per function group across the whole deck — scene switches in one colour,
        audio in another — so you can find a key by colour before you read the label.
      </p>
    </main>
  );
}
