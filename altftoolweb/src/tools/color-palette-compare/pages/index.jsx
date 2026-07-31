"use client";

import { useState } from "react";
import { Palette, Columns, Shuffle, Copy, Check } from "lucide-react";
import { Button } from "@altftool/ui";
import { toast } from "react-hot-toast";

// Helper for contrast ratio
const getLuminance = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const a = [rgb.r, rgb.g, rgb.b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

const getContrast = (hex1, hex2) => {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  return ratio.toFixed(2);
};

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const getContrastRating = (ratio) => {
  if (ratio >= 7) return { label: "AAA", color: "text-success" };
  if (ratio >= 4.5) return { label: "AA", color: "text-success" };
  if (ratio >= 3) return { label: "AA (Large Text)", color: "text-warning" };
  return { label: "Fail", color: "text-danger" };
};

const generateRandomHex = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');

const handleRandomize = (palette, setPalette) => {
  setPalette({
    primary: generateRandomHex(),
    secondary: generateRandomHex(),
    background: generateRandomHex(),
    surface: generateRandomHex(),
    text: generateRandomHex(),
  });
};

// Module-scope component: must NOT be defined inside ColorPaletteCompare's
// render body, otherwise React sees a new component type on every keystroke
// (via setPalette -> re-render) and remounts this whole subtree, dropping
// focus from the hex text input after every character.
function PaletteEditor({ title, palette, setPalette, id, copiedColor, onCopy }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--border)]">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Button variant="ghost" size="sm" onClick={() => handleRandomize(palette, setPalette)} className="h-8 gap-2">
          <Shuffle className="h-3.5 w-3.5" /> Randomize
        </Button>
      </div>

      <div className="grid gap-4">
        {Object.entries(palette).map(([key, value]) => {
          const colorInputId = `${id}-${key}-color`;
          const hexInputId = `${id}-${key}-hex`;
          return (
            <div key={`${id}-${key}`} className="flex items-center gap-3">
              <div className="relative h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden border border-[var(--border)] shadow-inner">
                <input
                  id={colorInputId}
                  type="color"
                  value={value}
                  onChange={(e) => setPalette({ ...palette, [key]: e.target.value })}
                  className="absolute -top-2 -left-2 h-16 w-16 cursor-pointer opacity-0"
                  aria-label={`${title} ${key} color picker`}
                />
                <div className="h-full w-full pointer-events-none" style={{ backgroundColor: value }} />
              </div>
              <div className="flex-1">
                <label
                  htmlFor={hexInputId}
                  className="text-xs font-semibold uppercase text-[var(--muted-foreground)]"
                >
                  {key}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id={hexInputId}
                    type="text"
                    value={value.toUpperCase()}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^#[0-9A-F]{0,6}$/i.test(val)) {
                        setPalette({ ...palette, [key]: val });
                      }
                    }}
                    aria-label={`${title} ${key} hex value`}
                    className="w-24 bg-transparent text-sm font-mono font-medium outline-none focus:text-[var(--primary)]"
                  />
                  <button
                    onClick={() => onCopy(value)}
                    aria-label={`Copy ${key} hex value`}
                    className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    {copiedColor === value ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Module-scope for the same reason as PaletteEditor above.
function UIMockup({ palette }) {
  const textOnPrimary = getContrast(palette.primary, "#FFFFFF") > 4.5 ? "#FFFFFF" : "#000000";
  const textOnSecondary = getContrast(palette.secondary, "#FFFFFF") > 4.5 ? "#FFFFFF" : "#000000";

  const contrastRatio = getContrast(palette.background, palette.text);
  const rating = getContrastRating(contrastRatio);

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
        <div className="bg-black/5 dark:bg-white/5 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase opacity-60 mb-1" style={{ color: palette.text }}>
              Bg vs Text Contrast
            </p>
            <p className="font-mono font-medium text-lg" style={{ color: palette.text }}>
              {contrastRatio}:1
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
  const [copiedColor, setCopiedColor] = useState(null);

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

  const handleCopy = (color) => {
    navigator.clipboard.writeText(color.toUpperCase());
    setCopiedColor(color);
    toast.success(`Copied ${color.toUpperCase()}`);
    setTimeout(() => setCopiedColor(null), 2000);
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
              copiedColor={copiedColor}
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
              copiedColor={copiedColor}
              onCopy={handleCopy}
            />
            <UIMockup palette={paletteB} />
          </div>

        </div>
      </div>
    </main>
  );
}
