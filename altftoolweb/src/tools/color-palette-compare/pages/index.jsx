"use client";

import { useState } from "react";
import { Palette, Columns, Shuffle, Copy, Check } from "lucide-react";
import { Button } from "@altftool/ui";
import { toast } from "react-hot-toast";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

// Helper for contrast ratio. Returns null for a color that hexToRgb can't
// parse, instead of silently treating it as pure black (luminance 0) — a
// caller that ignores the null and feeds it into a ratio would get a
// misleadingly wrong number, so getContrast below refuses to compute at all
// when either side is unparseable.
const getLuminance = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const a = [rgb.r, rgb.g, rgb.b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

// Raw numeric ratio — NOT rounded. Rounding here (e.g. via toFixed) before
// comparing against the WCAG cutoffs in getContrastRating would misgrade
// anything that rounds up across a threshold (4.4962 rounds to "4.50", which
// reads as passing AA even though the true ratio fails it). Round only at
// the point of display.
const getContrast = (hex1, hex2) => {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  if (l1 === null || l2 === null) return null;
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

// Accepts both #RGB shorthand and #RRGGBB. A hex field that's mid-typing
// (e.g. "#12") or otherwise not a complete color intentionally returns null
// rather than guessing.
const hexToRgb = (hex) => {
  const value = String(hex ?? "").trim();
  const shortMatch = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(value);
  if (shortMatch) {
    return {
      r: parseInt(shortMatch[1] + shortMatch[1], 16),
      g: parseInt(shortMatch[2] + shortMatch[2], 16),
      b: parseInt(shortMatch[3] + shortMatch[3], 16),
    };
  }
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

// `ratio` is the raw number from getContrast, or null when unparseable.
const getContrastRating = (ratio) => {
  if (ratio === null || !Number.isFinite(ratio)) return { label: "—", color: "text-muted-foreground" };
  if (ratio >= 7) return { label: "AAA", color: "text-success" };
  if (ratio >= 4.5) return { label: "AA", color: "text-success" };
  if (ratio >= 3) return { label: "AA (Large Text)", color: "text-warning" };
  return { label: "Fail", color: "text-danger" };
};

const generateRandomHex = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');

const handleRandomize = (title, palette, setPalette) => {
  if (
    !window.confirm(
      `Randomize all five colors in ${title}? This replaces the colors you've set and can't be undone.`
    )
  ) {
    return;
  }
  setPalette({
    primary: generateRandomHex(),
    secondary: generateRandomHex(),
    background: generateRandomHex(),
    surface: generateRandomHex(),
    text: generateRandomHex(),
  });
};

// One editable swatch row. Kept as its own component (rather than inlined in
// PaletteEditor's .map) so it can hold local draft text state: the hex text
// field needs to show whatever the user is mid-typing (e.g. "#12") without
// committing that incomplete value into the palette, where it would fail to
// parse and get treated as pure black by the contrast math below.
function PaletteColorRow({ title, id, keyName, value, onChange, isCopied, onCopy }) {
  const [draft, setDraft] = useState(value.toUpperCase());
  // Resync the draft when `value` changes for a reason other than this
  // row's own onChange (color picker, Randomize) — adjusted during render
  // rather than in an effect, per React's guidance for deriving state from a
  // prop change, so it doesn't cost an extra commit.
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setDraft(value.toUpperCase());
  }

  const colorInputId = `${id}-${keyName}-color`;
  const hexInputId = `${id}-${keyName}-hex`;
  const fieldKey = `${id}-${keyName}`;
  const copied = isCopied(fieldKey);

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden border border-[var(--border)] shadow-inner has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--primary)] has-[:focus-visible]:ring-offset-2">
        <input
          id={colorInputId}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute -top-2 -left-2 h-16 w-16 cursor-pointer opacity-0"
          aria-label={`${title} ${keyName} color picker`}
        />
        <div className="h-full w-full pointer-events-none" style={{ backgroundColor: value }} />
      </div>
      <div className="flex-1">
        <label
          htmlFor={hexInputId}
          className="text-xs font-semibold uppercase text-[var(--muted-foreground)]"
        >
          {keyName}
        </label>
        <div className="flex items-center gap-2">
          <input
            id={hexInputId}
            type="text"
            value={draft}
            onChange={(e) => {
              // Strip everything but hex digits and re-prepend "#" unconditionally,
              // rather than requiring the raw event value to already start with
              // "#". A native select-all-then-type replacement drops the leading
              // "#" from e.target.value entirely, so requiring it here rejected
              // every keystroke of that edit and snapped the field back to the
              // stale value.
              const raw = e.target.value.toUpperCase().replace(/[^0-9A-F]/g, "").slice(0, 6);
              const val = `#${raw}`;
              setDraft(val);
              // Commit to the palette only once a full #RRGGBB value has been
              // typed. A 3-char value is ambiguous while the field still has
              // focus -- it's either a deliberate #RGB shorthand or the first
              // half of an in-progress #RRGGBB -- so it is never auto-committed
              // here; a complete 3-digit shorthand commits on blur instead (see
              // onBlur below), once the user is done editing.
              if (/^#[0-9A-F]{6}$/.test(val)) {
                onChange(val);
              }
            }}
            onBlur={() => {
              if (/^#[0-9A-F]{3}$/.test(draft)) {
                onChange(draft);
              }
            }}
            aria-label={`${title} ${keyName} hex value`}
            className="w-24 bg-transparent text-sm font-mono font-medium outline-none focus:text-[var(--primary)]"
          />
          <button
            type="button"
            onClick={() => onCopy(fieldKey, value)}
            aria-label={copied ? `Copied ${keyName} hex value` : `Copy ${keyName} hex value`}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// Module-scope component: must NOT be defined inside ColorPaletteCompare's
// render body, otherwise React sees a new component type on every keystroke
// (via setPalette -> re-render) and remounts this whole subtree, dropping
// focus from the hex text input after every character.
function PaletteEditor({ title, palette, setPalette, id, isCopied, onCopy }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--border)]">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleRandomize(title, palette, setPalette)}
          className="h-8 gap-2"
        >
          <Shuffle className="h-3.5 w-3.5" /> Randomize
        </Button>
      </div>

      <div className="grid gap-4">
        {Object.entries(palette).map(([key, value]) => (
          <PaletteColorRow
            key={`${id}-${key}`}
            title={title}
            id={id}
            keyName={key}
            value={value}
            onChange={(next) => setPalette({ ...palette, [key]: next })}
            isCopied={isCopied}
            onCopy={onCopy}
          />
        ))}
      </div>
    </div>
  );
}

// Module-scope for the same reason as PaletteEditor above.
function UIMockup({ palette }) {
  const textOnPrimary = (getContrast(palette.primary, "#FFFFFF") ?? 0) > 4.5 ? "#FFFFFF" : "#000000";
  const textOnSecondary = (getContrast(palette.secondary, "#FFFFFF") ?? 0) > 4.5 ? "#FFFFFF" : "#000000";

  const contrastRatio = getContrast(palette.background, palette.text);
  const rating = getContrastRating(contrastRatio);
  const contrastLabel = contrastRatio === null ? "—" : contrastRatio.toFixed(2);

  return (
    <div
      className="rounded-xl border border-[var(--border)] overflow-hidden transition-all duration-300"
      style={{ backgroundColor: palette.background }}
    >
      {/* Mockup Header */}
      <div className="p-6 border-b border-black/5 dark:border-white/5">
        <h3 className="text-2xl font-bold mb-2" style={{ color: palette.text }}>
          Design Preview
        </h3>
        <p className="text-sm opacity-80" style={{ color: palette.text }}>
          See how your colors perform in a real interface. Good contrast is essential for accessibility.
        </p>
      </div>

      {/* Mockup Body */}
      <div className="p-6 space-y-6">
        {/* Surface Card */}
        <div
          className="p-5 rounded-lg shadow-sm border border-black/5 dark:border-white/5"
          style={{ backgroundColor: palette.surface }}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-lg" style={{ color: palette.text }}>Dashboard Metrics</h4>
            <div className="h-6 w-16 rounded-full opacity-20" style={{ backgroundColor: palette.text }} />
          </div>

          <div className="space-y-3 mb-6">
            <div className="h-2 w-full rounded-full opacity-10" style={{ backgroundColor: palette.text }} />
            <div className="h-2 w-5/6 rounded-full opacity-10" style={{ backgroundColor: palette.text }} />
            <div className="h-2 w-4/6 rounded-full opacity-10" style={{ backgroundColor: palette.text }} />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="px-4 py-2 rounded-md font-semibold text-sm shadow-sm transition-transform hover:scale-105"
              style={{ backgroundColor: palette.primary, color: textOnPrimary }}
            >
              Primary Action
            </button>
            <button
              className="px-4 py-2 rounded-md font-semibold text-sm shadow-sm transition-transform hover:scale-105"
              style={{ backgroundColor: palette.secondary, color: textOnSecondary }}
            >
              Secondary
            </button>
          </div>
        </div>

        {/* Contrast Stats Panel */}
        <div
          className="bg-black/5 dark:bg-white/5 rounded-lg p-4 flex items-center justify-between"
          aria-live="polite"
          role="status"
        >
          <div>
            <p className="text-xs font-semibold uppercase opacity-60 mb-1" style={{ color: palette.text }}>
              Bg vs Text Contrast
            </p>
            <p className="font-mono font-medium text-lg" style={{ color: palette.text }}>
              {contrastLabel}:1
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full font-bold text-sm bg-white/10 ${rating.color}`}>
            {rating.label}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ColorPaletteCompare() {
  // Keyed by field id (e.g. "A-primary"), not by color value — two fields
  // holding the same hex, or copying two different fields in quick
  // succession, used to share one un-keyed "copied" flag and show the
  // checkmark on the wrong swatch. The hook also only flips the flag once
  // the clipboard write actually succeeds, and manages its own timer per key.
  const { copy: copyToClipboard, isCopied } = useCopyToClipboard();

  const [paletteA, setPaletteA] = useState({
    primary: "#3B82F6",
    secondary: "#10B981",
    background: "#F8FAFC",
    surface: "#FFFFFF",
    text: "#0F172A",
  });

  const [paletteB, setPaletteB] = useState({
    primary: "#8B5CF6",
    secondary: "#F43F5E",
    background: "#0F172A",
    surface: "#1E293B",
    text: "#F8FAFC",
  });

  const handleCopy = async (fieldKey, color) => {
    const label = color.toUpperCase();
    const copied = await copyToClipboard(fieldKey, label, { label: `${label} color value` });
    if (copied) {
      toast.success(`Copied ${label}`);
    } else {
      toast.error(`Could not copy ${label}`);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Columns className="h-4 w-4" />
            Design Tools
          </div>
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--muted)] shadow-sm">
            <Palette className="h-7 w-7 text-[var(--primary)]" />
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">
            Color Palette Compare
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Design with confidence. Compare two color palettes side-by-side in realistic UI layouts to visualize contrast, harmony, and accessibility.
          </p>
        </section>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-start">

          {/* Palette A Column */}
          <div className="space-y-6">
            <PaletteEditor
              title="Palette A"
              id="A"
              palette={paletteA}
              setPalette={setPaletteA}
              isCopied={isCopied}
              onCopy={handleCopy}
            />
            <UIMockup palette={paletteA} />
          </div>

          {/* Palette B Column */}
          <div className="space-y-6">
            <PaletteEditor
              title="Palette B"
              id="B"
              palette={paletteB}
              setPalette={setPaletteB}
              isCopied={isCopied}
              onCopy={handleCopy}
            />
            <UIMockup palette={paletteB} />
          </div>

        </div>
      </div>
    </main>
  );
}
