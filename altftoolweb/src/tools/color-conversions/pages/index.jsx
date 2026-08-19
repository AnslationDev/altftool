"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import {
  Palette,
  Copy,
  RotateCcw,
  Pipette,
  Check,
  Eye,
  Sliders,
  Sparkles,
  Info,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

/* ============================================================
   COLOR CONVERSION HELPERS
   ============================================================ */

function parseHex(hex) {
  const c = hex.replace(/^#/, "").trim();
  if (c.length === 3) {
    const [r, g, b] = c.split("").map((x) => parseInt(x + x, 16));
    if ([r, g, b].some(isNaN)) return null;
    return { r, g, b, a: 1 };
  }
  if (c.length === 6) {
    const r = parseInt(c.slice(0, 2), 16);
    const g = parseInt(c.slice(2, 4), 16);
    const b = parseInt(c.slice(4, 6), 16);
    if ([r, g, b].some(isNaN)) return null;
    return { r, g, b, a: 1 };
  }
  if (c.length === 8) {
    const r = parseInt(c.slice(0, 2), 16);
    const g = parseInt(c.slice(2, 4), 16);
    const b = parseInt(c.slice(4, 6), 16);
    const a = Math.round((parseInt(c.slice(6, 8), 16) / 255) * 100) / 100;
    if ([r, g, b, a].some(isNaN)) return null;
    return { r, g, b, a };
  }
  return null;
}

function toHex(r, g, b) {
  const hr = Math.max(0, Math.min(255, Math.round(r))).toString(16).padStart(2, "0");
  const hg = Math.max(0, Math.min(255, Math.round(g))).toString(16).padStart(2, "0");
  const hb = Math.max(0, Math.min(255, Math.round(b))).toString(16).padStart(2, "0");
  return `#${hr}${hg}${hb}`.toUpperCase();
}

function toHexA(r, g, b, a) {
  const hex = toHex(r, g, b);
  const alpha = Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, "0").toUpperCase();
  return `${hex}${alpha}`;
}

function parseRgb(str) {
  const m = str.trim().match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)$/i);
  if (!m) return null;
  const r = parseInt(m[1]);
  const g = parseInt(m[2]);
  const b = parseInt(m[3]);
  const a = m[4] !== undefined ? Math.min(1, Math.max(0, parseFloat(m[4]))) : 1;
  if ([r, g, b].some((v) => isNaN(v) || v < 0 || v > 255)) return null;
  return { r, g, b, a };
}

function toRgbStr(r, g, b) {
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

function toRgbaStr(r, g, b, a) {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${Number(a).toFixed(2)})`;
}

function parseHsl(str) {
  const m = str.trim().match(/^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?(?:\s*,\s*([\d.]+))?\s*\)$/i);
  if (!m) return null;
  const h = parseFloat(m[1]);
  const s = parseFloat(m[2]);
  const l = parseFloat(m[3]);
  const a = m[4] !== undefined ? Math.min(1, Math.max(0, parseFloat(m[4]))) : 1;
  if ([h, s, l].some(isNaN)) return null;
  return { h: ((h % 360) + 360) % 360, s: Math.min(100, Math.max(0, s)), l: Math.min(100, Math.max(0, l)), a };
}

function hslToRgb(h, s, l) {
  const s2 = s / 100;
  const l2 = l / 100;
  const c = (1 - Math.abs(2 * l2 - 1)) * s2;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m2 = l2 - c / 2;
  let r1 = 0, g1 = 0, b1 = 0;
  if (h < 60) { r1 = c; g1 = x; b1 = 0; }
  else if (h < 120) { r1 = x; g1 = c; b1 = 0; }
  else if (h < 180) { r1 = 0; g1 = c; b1 = x; }
  else if (h < 240) { r1 = 0; g1 = x; b1 = c; }
  else if (h < 300) { r1 = x; g1 = 0; b1 = c; }
  else { r1 = c; g1 = 0; b1 = x; }
  return {
    r: Math.round((r1 + m2) * 255),
    g: Math.round((g1 + m2) * 255),
    b: Math.round((b1 + m2) * 255),
  };
}

function rgbToHsl(r, g, b) {
  const r2 = r / 255, g2 = g / 255, b2 = b / 255;
  const max = Math.max(r2, g2, b2), min = Math.min(r2, g2, b2);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r2) h = ((g2 - b2) / d + (g2 < b2 ? 6 : 0)) * 60;
  else if (max === g2) h = ((b2 - r2) / d + 2) * 60;
  else h = ((r2 - g2) / d + 4) * 60;
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function parseHsv(str) {
  const m = str.trim().match(/^hsv\(\s*([\d.]+)\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?\s*\)$/i);
  if (!m) return null;
  const h = parseFloat(m[1]);
  const s = parseFloat(m[2]);
  const v = parseFloat(m[3]);
  if ([h, s, v].some(isNaN)) return null;
  return { h: ((h % 360) + 360) % 360, s: Math.min(100, Math.max(0, s)), v: Math.min(100, Math.max(0, v)) };
}

// HSV conversion support
function hsvToRgb(h, s, v) {
  const s2 = s / 100, v2 = v / 100;
  const c = v2 * s2;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m2 = v2 - c;
  let r1 = 0, g1 = 0, b1 = 0;
  if (h < 60) { r1 = c; g1 = x; }
  else if (h < 120) { r1 = x; g1 = c; }
  else if (h < 180) { g1 = c; b1 = x; }
  else if (h < 240) { g1 = x; b1 = c; }
  else if (h < 300) { r1 = x; b1 = c; }
  else { r1 = c; b1 = x; }
  return {
    r: Math.round((r1 + m2) * 255),
    g: Math.round((g1 + m2) * 255),
    b: Math.round((b1 + m2) * 255),
  };
}

function rgbToHsv(r, g, b) {
  const r2 = r / 255, g2 = g / 255, b2 = b / 255;
  const max = Math.max(r2, g2, b2), min = Math.min(r2, g2, b2);
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (max !== min) {
    if (max === r2) h = ((g2 - b2) / d + (g2 < b2 ? 6 : 0)) * 60;
    else if (max === g2) h = ((b2 - r2) / d + 2) * 60;
    else h = ((r2 - g2) / d + 4) * 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), v: Math.round(v * 100) };
}

function parseCmyk(str) {
  const m = str.trim().match(/^cmyk\(\s*([\d.]+)%?\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?\s*\)$/i);
  if (!m) return null;
  const c = parseFloat(m[1]);
  const m2 = parseFloat(m[2]);
  const y = parseFloat(m[3]);
  const k = parseFloat(m[4]);
  if ([c, m2, y, k].some(isNaN)) return null;
  return { c: Math.min(100, Math.max(0, c)), m: Math.min(100, Math.max(0, m2)), y: Math.min(100, Math.max(0, y)), k: Math.min(100, Math.max(0, k)) };
}

function cmykToRgb(c, m, y, k) {
  const c2 = c / 100, m2 = m / 100, y2 = y / 100, k2 = k / 100;
  return {
    r: Math.round(255 * (1 - c2) * (1 - k2)),
    g: Math.round(255 * (1 - m2) * (1 - k2)),
    b: Math.round(255 * (1 - y2) * (1 - k2)),
  };
}

function rgbToCmyk(r, g, b) {
  const r2 = r / 255, g2 = g / 255, b2 = b / 255;
  const k = 1 - Math.max(r2, g2, b2);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round(((1 - r2 - k) / (1 - k)) * 100),
    m: Math.round(((1 - g2 - k) / (1 - k)) * 100),
    y: Math.round(((1 - b2 - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}

function luminance(r, g, b) {
  const [rs, gs, bs] = [r / 255, g / 255, b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(lum1, lum2) {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getWcagRating(ratio) {
  if (ratio >= 7.0) return { score: "AAA Pass", desc: "Excellent readability on any sizes.", color: "text-emerald-600" };
  if (ratio >= 4.5) return { score: "AA Pass", desc: "Good readability on body sizes.", color: "text-teal-600" };
  if (ratio >= 3.0) return { score: "Large Text AA", desc: "Readable only on heading/large text.", color: "text-amber-600" };
  return { score: "Fail", desc: "Poor readability. Avoid for page texts.", color: "text-red-500" };
}

function toHslStr(h, s, l) {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function toHslaStr(h, s, l, a) {
  return `hsla(${h}, ${s}%, ${l}%, ${Number(a).toFixed(2)})`;
}

function toHsvStr(h, s, v) {
  return `hsv(${h}, ${s}%, ${v}%)`;
}

function toCmykStr(c, m, y, k) {
  return `cmyk(${c}%, ${m}%, ${y}%, ${k}%)`;
}

function isValidColor(str) {
  if (!str || !str.trim()) return false;
  const s = str.trim();
  if (/^#?[0-9a-fA-F]{3,8}$/.test(s)) return parseHex(s) !== null;
  if (/^rgba?\(/i.test(s)) return parseRgb(s) !== null;
  if (/^hsla?\(/i.test(s)) return parseHsl(s) !== null;
  if (/^hsv\(/i.test(s)) return parseHsv(s) !== null;
  if (/^cmyk\(/i.test(s)) return parseCmyk(s) !== null;
  return false;
}

// Format-aware validation: checks the string against the wrapper syntax for
// the SPECIFIC field being edited, instead of sniffing the format from the
// string's own shape. This stops a bare digit string typed into a non-hex
// field (e.g. "500" in the HSV field) from being silently reinterpreted as
// a HEX color just because it happens to match the hex character class.
function isValidColorForFormat(str, formatId) {
  if (!str || !str.trim()) return false;
  const s = str.trim();
  switch (formatId) {
    case "hex":
      return /^#?[0-9a-fA-F]{3,8}$/.test(s) && parseHex(s) !== null;
    case "rgb":
    case "rgba":
      return /^rgba?\(/i.test(s) && parseRgb(s) !== null;
    case "hsl":
    case "hsla":
      return /^hsla?\(/i.test(s) && parseHsl(s) !== null;
    case "hsv":
      return /^hsv\(/i.test(s) && parseHsv(s) !== null;
    case "cmyk":
      return /^cmyk\(/i.test(s) && parseCmyk(s) !== null;
    default:
      return false;
  }
}

function autoParse(str) {
  if (!str || !str.trim()) return null;
  const s = str.trim();
  let result = null;
  if (/^#?[0-9a-fA-F]{3,8}$/.test(s)) result = parseHex(s);
  else if (/^rgba?\(/i.test(s)) result = parseRgb(s);
  else if (/^hsla?\(/i.test(s)) {
    const p = parseHsl(s);
    if (p) result = { ...hslToRgb(p.h, p.s, p.l), a: p.a };
  } else if (/^hsv\(/i.test(s)) {
    const p = parseHsv(s);
    if (p) result = { ...hsvToRgb(p.h, p.s, p.v), a: 1 };
  } else if (/^cmyk\(/i.test(s)) {
    const p = parseCmyk(s);
    if (p) result = { ...cmykToRgb(p.c, p.m, p.y, p.k), a: 1 };
  }
  if (result && [result.r, result.g, result.b].every((v) => !isNaN(v))) {
    return { r: result.r, g: result.g, b: result.b, a: result.a ?? 1 };
  }
  return null;
}

function toName(r, g, b) {
  const named = {
    "#FF0000": "Red", "#00FF00": "Lime", "#0000FF": "Blue",
    "#FFFF00": "Yellow", "#00FFFF": "Cyan", "#FF00FF": "Magenta",
    "#000000": "Black", "#FFFFFF": "White", "#808080": "Gray",
    "#C0C0C0": "Silver", "#800000": "Maroon", "#808000": "Olive",
    "#008000": "Green", "#800080": "Purple", "#008080": "Teal",
    "#000080": "Navy", "#FFA500": "Orange", "#FFC0CB": "Pink",
    "#A52A2A": "Brown", "#F0F8FF": "AliceBlue", "#FAEBD7": "AntiqueWhite",
    "#7FFFD4": "Aquamarine", "#F5F5DC": "Beige", "#FFE4C4": "Bisque",
    "#8A2BE2": "BlueViolet", "#DEB887": "BurlyWood", "#5F9EA0": "CadetBlue",
    "#7FFF00": "Chartreuse", "#D2691E": "Chocolate", "#FF7F50": "Coral",
    "#6495ED": "CornflowerBlue", "#FFF8DC": "Cornsilk", "#DC143C": "Crimson",
    "#00BFFF": "DeepSkyBlue", "#696969": "DimGray", "#B22222": "FireBrick",
    "#FF69B4": "HotPink", "#F0E68C": "Khaki", "#FFE4E1": "MistyRose",
    "#FFD700": "Gold", "#DDA0DD": "Plum", "#FF6347": "Tomato",
    "#EE82EE": "Violet", "#4169E1": "RoyalBlue", "#FA8072": "Salmon",
    "#2E8B57": "SeaGreen", "#87CEEB": "SkyBlue", "#6A5ACD": "SlateBlue",
    "#DAA520": "Goldenrod", "#B0C4DE": "LightSteelBlue", "#E6E6FA": "Lavender",
    "#F08080": "LightCoral", "#90EE90": "LightGreen", "#FFB6C1": "LightPink",
    "#FFFFE0": "LightYellow", "#32CD32": "LimeGreen", "#FFD700": "Gold",
  };
  return named[toHex(r, g, b).toUpperCase()] || null;
}

const FORMATS = [
  { id: "hex",  label: "HEX",      get: (r, g, b, a) => a < 1 ? toHexA(r, g, b, a) : toHex(r, g, b), color: "text-fuchsia-600 dark:text-fuchsia-400" },
  { id: "rgb",  label: "RGB",      get: (r, g, b) => toRgbStr(r, g, b), color: "text-red-600 dark:text-red-400" },
  { id: "rgba", label: "RGBA",     get: (r, g, b, a) => toRgbaStr(r, g, b, a), color: "text-orange-600 dark:text-orange-400" },
  { id: "hsl",  label: "HSL",      get: (r, g, b) => { const h = rgbToHsl(r, g, b); return toHslStr(h.h, h.s, h.l); }, color: "text-emerald-600 dark:text-emerald-400" },
  { id: "hsla", label: "HSLA",     get: (r, g, b, a) => { const h = rgbToHsl(r, g, b); return toHslaStr(h.h, h.s, h.l, a); }, color: "text-teal-600 dark:text-teal-400" },
  { id: "hsv",  label: "HSV",      get: (r, g, b) => { const h = rgbToHsv(r, g, b); return toHsvStr(h.h, h.s, h.v); }, color: "text-blue-600 dark:text-blue-400" },
  { id: "cmyk", label: "CMYK",     get: (r, g, b) => { const c = rgbToCmyk(r, g, b); return toCmykStr(c.c, c.m, c.y, c.k); }, color: "text-purple-600 dark:text-purple-400" },
];

function getHarmonies(r, g, b) {
  const hsl = rgbToHsl(r, g, b);
  const comp = { ...hsl, h: (hsl.h + 180) % 360 };
  const anal1 = { ...hsl, h: ((hsl.h - 30) % 360 + 360) % 360 };
  const anal2 = { ...hsl, h: (hsl.h + 30) % 360 };
  const tri1 = { ...hsl, h: ((hsl.h - 120) % 360 + 360) % 360 };
  const tri2 = { ...hsl, h: (hsl.h + 120) % 360 };
  const tet1 = { ...hsl, h: ((hsl.h - 60) % 360 + 360) % 360 };
  const tet2 = { ...hsl, h: (hsl.h + 180) % 360 };
  const tet3 = { ...hsl, h: (hsl.h + 60) % 360 };
  const shade = (f) => ({ ...hsl, l: Math.max(0, Math.min(100, hsl.l * f)) });

  const toSwatch = (c) => hslToRgb(c.h, c.s, c.l);

  return {
    complementary: toSwatch(comp),
    analogous: [toSwatch(anal1), toSwatch(anal2)],
    triadic: [toSwatch(tri1), toSwatch(tri2)],
    tetradic: [toSwatch(tet1), toSwatch(tet2), toSwatch(tet3)],
    shades: [0.2, 0.4, 0.6, 0.8, 1].map((f) => toSwatch(shade(f))),
  };
}

function SwatchPreview({ r, g, b, a }) {
  const hex = toHex(r, g, b);
  const lum = luminance(r, g, b);
  const textColor = lum > 0.5 ? "#000000" : "#FFFFFF";
  const colorName = toName(r, g, b);

  // Compute WCAG stats
  const whiteContrast = getContrastRatio(lum, 1.0);
  const blackContrast = getContrastRatio(lum, 0.0);
  const whiteRating = getWcagRating(whiteContrast);
  const blackRating = getWcagRating(blackContrast);

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] shadow-[var(--anslation-ds-shadow-sm)] grid grid-cols-1 md:grid-cols-12">
      
      {/* Visual swatch panel (7/12 cols) */}
      <div
        className="md:col-span-7 flex h-52 items-end justify-center p-5 relative"
        style={{ backgroundColor: `rgba(${r}, ${g}, ${b}, ${a})` }}
      >
        <div
          className="rounded-lg px-4 py-2 text-center text-lg font-bold shadow-lg backdrop-blur-sm"
          style={{ backgroundColor: textColor === "#000000" ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.65)", color: textColor }}
        >
          {hex}
          {colorName && <span className="mt-0.5 block text-xs font-semibold opacity-80">{colorName}</span>}
        </div>
      </div>

      {/* WCAG Readability checker (5/12 cols) */}
      <div className="md:col-span-5 border-t md:border-t-0 md:border-l border-[var(--border)] bg-[var(--card)] p-5 flex flex-col justify-center space-y-4">
        <h4 className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-1">
          <Eye className="h-3.5 w-3.5 text-teal-500" /> Readability Contrast (WCAG)
        </h4>

        {/* White text */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--foreground)]">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-white border border-(--border)"></span> On White Text</span>
            <span className={whiteRating.color}>{whiteRating.score} ({whiteContrast.toFixed(1)}:1)</span>
          </div>
          <p className="text-[10px] text-slate-500">{whiteRating.desc}</p>
        </div>

        {/* Black text */}
        <div className="space-y-1 pt-2 border-t border-[var(--border)]">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--foreground)]">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-black"></span> On Black Text</span>
            <span className={blackRating.color}>{blackRating.score} ({blackContrast.toFixed(1)}:1)</span>
          </div>
          <p className="text-[10px] text-slate-500">{blackRating.desc}</p>
        </div>
      </div>

    </div>
  );
}

function FormatCard({ format, r, g, b, a, activeId, onEdit, copiedId, onCopy }) {
  const value = format.get(r, g, b, a);
  const isActive = activeId === format.id;

  return (
    <div
      className={`group rounded-xl border p-4 transition-all duration-150 ${
        isActive
          ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-[var(--anslation-ds-shadow-sm)]"
          : "border-[var(--border)] bg-[var(--card)] hover:shadow-[var(--anslation-ds-shadow-md)]"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`rounded-md p-1 ${format.color.replace("text", "bg")}/10`}>
            <Pipette className={`h-3.5 w-3.5 ${format.color}`} />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">{format.label}</span>
        </div>
        <button
          type="button"
          onClick={() => onCopy(value, format.id)}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-[var(--muted-foreground)] opacity-0 transition-all hover:bg-[var(--muted)] hover:text-[var(--foreground)] group-hover:opacity-100 cursor-pointer"
        >
          <Copy className="h-3 w-3" />
          {copiedId === format.id ? "Copied" : "Copy"}
        </button>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onEdit(e.target.value, format.id)}
        aria-label={`${format.label} color value`}
        className={`h-10 w-full rounded-lg border bg-[var(--background)] px-3 font-mono text-sm outline-none transition-colors focus:shadow-[var(--anslation-ds-focus-ring)] ${
          isActive
            ? "border-[var(--primary)]"
            : "border-[var(--border)] focus:border-[var(--primary)]"
        }`}
        spellCheck={false}
      />
      {format.id === "hex" && a < 1 && (
        <p className="mt-1 text-[10px] text-[var(--muted-foreground)]">8-digit hex with alpha</p>
      )}
    </div>
  );
}

function HarmonySwatch({ rgb, label }) {
  if (!rgb) return null;
  const hex = toHex(rgb.r, rgb.g, rgb.b);
  return (
    <div className="text-center">
      <div
        className="mx-auto h-10 w-full rounded-lg border border-[var(--border)] sm:h-14"
        style={{ backgroundColor: hex }}
      />
      {label && <p className="mt-1 text-[10px] font-semibold text-[var(--muted-foreground)]">{label}</p>}
      <p className="font-mono text-[10px] text-[var(--muted-foreground)]">{hex}</p>
    </div>
  );
}

export default function ToolHome() {
  const [input, setInput] = useState("#14B8A6");
  const [activeFormat, setActiveFormat] = useState("hex");
  const [copiedId, setCopiedId] = useState(null);
  const [formatError, setFormatError] = useState(null);

  // Decoded RGB/A states representing parsed model
  const [r, setR] = useState(20);
  const [g, setG] = useState(184);
  const [b, setB] = useState(166);
  const [a, setA] = useState(1);

  // Sync color values from the parsed text input
  const parsed = useMemo(() => {
    const p = autoParse(input);
    if (!p) return null;
    return { r: p.r, g: p.g, b: p.b, a: p.a };
  }, [input]);

  // Update slider variables if parsed inputs change externally
  useEffect(() => {
    if (parsed) {
      setR(parsed.r);
      setG(parsed.g);
      setB(parsed.b);
      setA(parsed.a);
    }
  }, [parsed]);

  // Triggers conversion update when sliders are edited
  const updateFromRGB = useCallback((newR, newG, newB, newA = a) => {
    setR(newR);
    setG(newG);
    setB(newB);
    setA(newA);
    const hex = newA < 1 ? toHexA(newR, newG, newB, newA) : toHex(newR, newG, newB);
    setInput(hex);
  }, [a]);

  const updateFromHSL = useCallback((h, s, l) => {
    const rgb = hslToRgb(h, s, l);
    updateFromRGB(rgb.r, rgb.g, rgb.b);
  }, [updateFromRGB]);

  // Derived HSL calculations
  const hslValues = useMemo(() => {
    return rgbToHsl(r, g, b);
  }, [r, g, b]);

  const harmonies = useMemo(() => {
    return getHarmonies(r, g, b);
  }, [r, g, b]);

  const handleEdit = useCallback((val, formatId) => {
    setActiveFormat(formatId);
    if (!val || !val.trim()) {
      setFormatError(null);
      return;
    }
    if (isValidColorForFormat(val, formatId)) {
      setFormatError(null);
      setInput(val);
    } else {
      // Invalid for the format the user is actually editing — do not fall
      // through and reinterpret it as a different format (e.g. hex).
      setFormatError(val);
    }
  }, []);

  const handleCopy = useCallback(async (text, id) => {
    const ok = await safeCopyText(text);
    if (ok) { setCopiedId(id); setTimeout(() => setCopiedId(null), 1200); }
  }, []);

  const handleReset = useCallback(() => {
    setInput("#14B8A6");
    setActiveFormat("hex");
    setFormatError(null);
  }, []);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6 lg:py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        
        {/* Centered Green Title Banner */}
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-teal-600 dark:text-teal-400 mx-auto">
            <Palette className="h-4 w-4" />
            Design &amp; Development Utility
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 mb-2">
            Color Conversions
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)] mx-auto">
            Convert colors between HEX, RGB, RGBA, HSL, HSLA, HSV, and CMYK with responsive sliders, live contrast checkers, and color harmonies.
          </p>
        </section>

        {/* Live Swatch & Readability */}
        <SwatchPreview r={r} g={g} b={b} a={a} />

        {/* Interactive Parameter Sliders Card */}
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] space-y-6">
          <h3 className="text-sm font-semibold text-[var(--foreground)] border-b border-[var(--border)] pb-3 flex items-center gap-2">
            <Sliders className="h-4 w-4 text-teal-500" /> Interactive Color Sliders
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* RGB Sliders */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">RGB Parameters</h4>
              
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-red-500">Red</span>
                  <span>{r}</span>
                </div>
                <input
                  type="range" min="0" max="255" value={r}
                  onChange={(e) => updateFromRGB(Number(e.target.value), g, b)}
                  aria-label="Red"
                  className="w-full h-1 bg-(--border) rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-green-500">Green</span>
                  <span>{g}</span>
                </div>
                <input
                  type="range" min="0" max="255" value={g}
                  onChange={(e) => updateFromRGB(r, Number(e.target.value), b)}
                  aria-label="Green"
                  className="w-full h-1 bg-(--border) rounded-lg appearance-none cursor-pointer accent-green-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-blue-500">Blue</span>
                  <span>{b}</span>
                </div>
                <input
                  type="range" min="0" max="255" value={b}
                  onChange={(e) => updateFromRGB(r, g, Number(e.target.value))}
                  aria-label="Blue"
                  className="w-full h-1 bg-(--border) rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>

            {/* HSL & Alpha Sliders */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">HSL &amp; Transparency</h4>
              
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-teal-500">Hue</span>
                  <span>{hslValues.h}°</span>
                </div>
                <input
                  type="range" min="0" max="360" value={hslValues.h}
                  onChange={(e) => updateFromHSL(Number(e.target.value), hslValues.s, hslValues.l)}
                  aria-label="Hue"
                  className="w-full h-1 bg-(--border) rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-teal-500">Saturation</span>
                  <span>{hslValues.s}%</span>
                </div>
                <input
                  type="range" min="0" max="100" value={hslValues.s}
                  onChange={(e) => updateFromHSL(hslValues.h, Number(e.target.value), hslValues.l)}
                  aria-label="Saturation"
                  className="w-full h-1 bg-(--border) rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-teal-500">Lightness</span>
                  <span>{hslValues.l}%</span>
                </div>
                <input
                  type="range" min="0" max="100" value={hslValues.l}
                  onChange={(e) => updateFromHSL(hslValues.h, hslValues.s, Number(e.target.value))}
                  aria-label="Lightness"
                  className="w-full h-1 bg-(--border) rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-teal-500">Alpha / Opacity</span>
                  <span>{Math.round(a * 100)}%</span>
                </div>
                <input
                  type="range" min="0" max="1" step="0.01" value={a}
                  onChange={(e) => updateFromRGB(r, g, b, Number(e.target.value))}
                  aria-label="Alpha / Opacity"
                  className="w-full h-1 bg-(--border) rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
              </div>
            </div>

          </div>
        </section>

        {/* Input parse error alert */}
        {((!parsed && input) || formatError) && (
          <section
            role="alert"
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]"
          >
            <p className="text-center text-sm font-medium text-[var(--anslation-ds-danger,#EF4444)]">
              Could not parse &ldquo;{formatError ?? input}&rdquo;. Try a format like #FF0000, rgb(255, 0, 0), hsl(0, 100%, 50%), or hsv(0, 100%, 100%).
            </p>
          </section>
        )}

        {/* Formats Grid */}
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--foreground)]">All formats</span>
            <div className="flex items-center gap-3">
              {/* Native color picker hook */}
              <div className="relative inline-flex items-center">
                <input
                  type="color"
                  value={toHex(r, g, b)}
                  onChange={(e) => {
                    const parsedHex = parseHex(e.target.value);
                    if (parsedHex) updateFromRGB(parsedHex.r, parsedHex.g, parsedHex.b);
                  }}
                  className="w-8 h-8 rounded border border-(--border) bg-transparent cursor-pointer p-0 opacity-0 absolute inset-0"
                />
                <button
                  type="button"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-(--border) hover:border-teal-500 rounded text-xs font-semibold text-teal-600 dark:text-teal-400 bg-(--page) transition-colors cursor-pointer"
                >
                  <Palette className="h-3.5 w-3.5" /> Color Wheel
                </button>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {FORMATS.map((fmt) => (
              <FormatCard
                key={fmt.id}
                format={fmt}
                r={r}
                g={g}
                b={b}
                a={a}
                activeId={activeFormat}
                onEdit={handleEdit}
                copiedId={copiedId}
                onCopy={handleCopy}
              />
            ))}
          </div>
        </section>

        {/* Color Harmonies */}
        {harmonies && (
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <p className="mb-4 text-sm font-semibold text-[var(--foreground)]">Color harmonies</p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Complementary</p>
                <HarmonySwatch rgb={harmonies.complementary} label="180° away" />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Analogous</p>
                <div className="grid grid-cols-2 gap-2">
                  {harmonies.analogous.map((c, i) => (
                    <HarmonySwatch key={i} rgb={c} label={i === 0 ? "-30°" : "+30°"} />
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Triadic</p>
                <div className="grid grid-cols-2 gap-2">
                  {harmonies.triadic.map((c, i) => (
                    <HarmonySwatch key={i} rgb={c} label={i === 0 ? "-120°" : "+120°"} />
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Tetradic</p>
                <div className="grid grid-cols-3 gap-2">
                  {harmonies.tetradic.map((c, i) => (
                    <HarmonySwatch key={i} rgb={c} label={["-60°", "+180°", "+60°"][i]} />
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Shades</p>
              <div className="grid grid-cols-5 gap-2">
                {harmonies.shades.map((c, i) => (
                  <HarmonySwatch key={i} rgb={c} label={`${Math.round((i + 1) * 20)}%`} />
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
