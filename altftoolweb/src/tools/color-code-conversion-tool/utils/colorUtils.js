export const STORAGE_KEY = "color_code_conversion_tool_v1";
export const HISTORY_LIMIT = 14;

const NAMED_COLORS = {
  black: "#000000",
  white: "#ffffff",
  red: "#ff0000",
  green: "#008000",
  blue: "#0000ff",
  transparent: "#00000000",
  rebeccapurple: "#663399",
  cyan: "#00ffff",
  magenta: "#ff00ff",
  yellow: "#ffff00",
  orange: "#ffa500",
  purple: "#800080",
  pink: "#ffc0cb",
  gray: "#808080",
  grey: "#808080",
};

const clamp = (value, min, max) => Math.min(Math.max(Number(value), min), max);
const round = (value, places = 0) => Number(Number(value).toFixed(places));
const pct = (value) => `${round(value, 1)}%`;
const hex2 = (value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0").toUpperCase();

export function rgbToHex({ r, g, b, a = 1 }, includeAlpha = false) {
  return `#${hex2(r)}${hex2(g)}${hex2(b)}${includeAlpha && a < 1 ? hex2(a * 255) : ""}`;
}

export function rgbToHsl({ r, g, b, a = 1 }) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    if (max === g) h = (b - r) / d + 2;
    if (max === b) h = (r - g) / d + 4;
    h *= 60;
  }

  return { h: round(h), s: round(s * 100, 1), l: round(l * 100, 1), a };
}

export function hslToRgb({ h, s, l, a = 1 }) {
  h = ((Number(h) % 360) + 360) % 360;
  s = clamp(s, 0, 100) / 100;
  l = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rgb = [0, 0, 0];

  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];

  return {
    r: Math.round((rgb[0] + m) * 255),
    g: Math.round((rgb[1] + m) * 255),
    b: Math.round((rgb[2] + m) * 255),
    a: clamp(a, 0, 1),
  };
}

export function rgbToCmyk({ r, g, b }) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const k = 1 - Math.max(rn, gn, bn);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: round(((1 - rn - k) / (1 - k)) * 100, 1),
    m: round(((1 - gn - k) / (1 - k)) * 100, 1),
    y: round(((1 - bn - k) / (1 - k)) * 100, 1),
    k: round(k * 100, 1),
  };
}

export function cmykToRgb({ c, m, y, k }) {
  c = clamp(c, 0, 100) / 100;
  m = clamp(m, 0, 100) / 100;
  y = clamp(y, 0, 100) / 100;
  k = clamp(k, 0, 100) / 100;
  return {
    r: Math.round(255 * (1 - c) * (1 - k)),
    g: Math.round(255 * (1 - m) * (1 - k)),
    b: Math.round(255 * (1 - y) * (1 - k)),
    a: 1,
  };
}

function parseNumbers(source) {
  return source.match(/-?\d*\.?\d+%?/g)?.map((item) => ({
    value: Number(item.replace("%", "")),
    percent: item.includes("%"),
  })) || [];
}

export function parseColor(input) {
  const raw = String(input || "").trim();
  if (!raw) return { ok: false, error: "Paste or pick a color to begin.", format: "Waiting" };
  const lower = raw.toLowerCase();
  const named = NAMED_COLORS[lower];
  if (named) return parseColor(named);

  const hex = lower.match(/^(?:#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|([0-9a-f]{6}|[0-9a-f]{8}))$/i);
  if (hex) {
    let value = hex[1] || hex[2];
    if (value.length === 3 || value.length === 4) value = value.split("").map((x) => x + x).join("");
    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);
    const a = value.length === 8 ? round(parseInt(value.slice(6, 8), 16) / 255, 3) : 1;
    return { ok: true, format: a < 1 ? "HEXA" : "HEX", rgba: { r, g, b, a } };
  }

  if (/^rgba?\(/i.test(lower) || /^(\d+\s*,\s*){2}\d+/i.test(lower)) {
    const nums = parseNumbers(lower);
    if (nums.length >= 3) {
      const [r, g, b] = nums.slice(0, 3).map((n) => (n.percent ? (n.value / 100) * 255 : n.value));
      const a = nums[3] ? (nums[3].percent ? nums[3].value / 100 : nums[3].value) : 1;
      if ([r, g, b].every((v) => v >= 0 && v <= 255) && a >= 0 && a <= 1) {
        return { ok: true, format: nums.length > 3 ? "RGBA" : "RGB", rgba: { r: round(r), g: round(g), b: round(b), a: round(a, 3) } };
      }
    }
  }

  if (/^hsla?\(/i.test(lower)) {
    const nums = parseNumbers(lower);
    if (nums.length >= 3) {
      const [h, s, l] = nums;
      const a = nums[3] ? (nums[3].percent ? nums[3].value / 100 : nums[3].value) : 1;
      if (s.value >= 0 && s.value <= 100 && l.value >= 0 && l.value <= 100 && a >= 0 && a <= 1) {
        return { ok: true, format: nums.length > 3 ? "HSLA" : "HSL", rgba: hslToRgb({ h: h.value, s: s.value, l: l.value, a }) };
      }
    }
  }

  if (/^cmyk\(/i.test(lower)) {
    const nums = parseNumbers(lower);
    if (nums.length === 4 && nums.every((n) => n.value >= 0 && n.value <= 100)) {
      return { ok: true, format: "CMYK", rgba: cmykToRgb({ c: nums[0].value, m: nums[1].value, y: nums[2].value, k: nums[3].value }) };
    }
  }

  return { ok: false, error: "Use HEX, RGB, RGBA, HSL, HSLA, CMYK, or a common named color.", format: "Invalid" };
}

export function convertColor(input) {
  const parsed = parseColor(input);
  if (!parsed.ok) return { ...parsed, values: {}, preview: "#000000" };
  const rgba = parsed.rgba;
  const hsl = rgbToHsl(rgba);
  const cmyk = rgbToCmyk(rgba);
  const alpha = round(rgba.a, 3);
  const values = {
    HEX: rgbToHex(rgba),
    RGBA_HEX: rgbToHex(rgba, true),
    RGB: `rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`,
    RGBA: `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${alpha})`,
    HSL: `hsl(${hsl.h}, ${pct(hsl.s)}, ${pct(hsl.l)})`,
    HSLA: `hsla(${hsl.h}, ${pct(hsl.s)}, ${pct(hsl.l)}, ${alpha})`,
    CMYK: `cmyk(${pct(cmyk.c)}, ${pct(cmyk.m)}, ${pct(cmyk.y)}, ${pct(cmyk.k)})`,
  };
  return { ok: true, format: parsed.format, rgba, hsl, cmyk, values, preview: values.RGBA, picker: values.HEX };
}

export function safeReadState() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function downloadText(filename, content, type = "application/json;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
