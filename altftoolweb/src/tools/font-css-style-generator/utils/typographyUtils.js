export const STORAGE_KEY = "font-css-style-generator-state";
export const HISTORY_KEY = "font-css-style-generator-history";

export const fontFamilies = [
  { name: "Inter", css: "'Inter', system-ui, sans-serif", google: true },
  { name: "Poppins", css: "'Poppins', system-ui, sans-serif", google: true },
  { name: "Roboto", css: "'Roboto', Arial, sans-serif", google: true },
  { name: "Montserrat", css: "'Montserrat', system-ui, sans-serif", google: true },
  { name: "Open Sans", css: "'Open Sans', Arial, sans-serif", google: true },
  { name: "Arial", css: "Arial, Helvetica, sans-serif", google: false },
  { name: "Georgia", css: "Georgia, 'Times New Roman', serif", google: false },
  { name: "Courier New", css: "'Courier New', monospace", google: false },
];

export const defaultSettings = {
  text: "Design the future with precise, production-ready typography.",
  fontFamily: "Inter",
  fontSize: 48,
  fontSizeUnit: "px",
  responsive: true,
  minFontSize: 24,
  maxFontSize: 72,
  fontWeight: 800,
  fontStyle: "normal",
  textTransform: "none",
  letterSpacing: 0,
  lineHeight: 1.12,
  textAlign: "center",
  color: "#f8fafc",
  colorMode: "hex",
  gradientEnabled: true,
  gradientFrom: "#22d3ee",
  gradientTo: "#a855f7",
  gradientAngle: 120,
  shadowEnabled: true,
  shadowX: 0,
  shadowY: 10,
  shadowBlur: 26,
  shadowColor: "#0f172a",
};

export const presets = [
  {
    name: "Hero",
    settings: { fontFamily: "Inter", fontSize: 64, fontWeight: 900, lineHeight: 1, letterSpacing: -1, responsive: true, gradientEnabled: true, shadowEnabled: true },
  },
  {
    name: "Heading",
    settings: { fontFamily: "Montserrat", fontSize: 42, fontWeight: 800, lineHeight: 1.15, letterSpacing: 0, gradientEnabled: false, shadowEnabled: false, color: "#2563eb" },
  },
  {
    name: "Minimal",
    settings: { fontFamily: "Open Sans", fontSize: 20, fontWeight: 400, lineHeight: 1.7, letterSpacing: 0, textAlign: "left", gradientEnabled: false, shadowEnabled: false, color: "#e5e7eb" },
  },
  {
    name: "Modern",
    settings: { fontFamily: "Poppins", fontSize: 34, fontWeight: 700, lineHeight: 1.22, letterSpacing: 1, gradientEnabled: true, gradientFrom: "#14b8a6", gradientTo: "#f97316" },
  },
  {
    name: "Neon",
    settings: { fontFamily: "Roboto", fontSize: 44, fontWeight: 900, letterSpacing: 2, color: "#67e8f9", gradientEnabled: false, shadowEnabled: true, shadowX: 0, shadowY: 0, shadowBlur: 18, shadowColor: "#22d3ee" },
  },
  {
    name: "Elegant",
    settings: { fontFamily: "Georgia", fontSize: 38, fontWeight: 400, fontStyle: "italic", lineHeight: 1.25, letterSpacing: 0, color: "#f8fafc", gradientEnabled: false, shadowEnabled: true },
  },
  {
    name: "Button Text",
    settings: { fontFamily: "Inter", fontSize: 14, fontWeight: 800, lineHeight: 1, letterSpacing: 1.4, textTransform: "uppercase", gradientEnabled: false, shadowEnabled: false, color: "#ffffff" },
  },
];

export function getFontCss(name) {
  return fontFamilies.find((font) => font.name === name)?.css || fontFamilies[0].css;
}

export function getGoogleFontUrl(settings) {
  const font = fontFamilies.find((item) => item.name === settings.fontFamily);
  if (!font?.google) return "";
  const family = settings.fontFamily.replace(/\s+/g, "+");
  return `https://fonts.googleapis.com/css2?family=${family}:ital,wght@0,100..900;1,100..900&display=swap`;
}

export function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

export function hexToHsl(hex) {
  const { r, g, b } = hexToRgb(hex);
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === rn ? (gn - bn) / d + (gn < bn ? 6 : 0) : max === gn ? (bn - rn) / d + 2 : (rn - gn) / d + 4;
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function formatColor(hex, mode) {
  if (mode === "rgb") {
    const { r, g, b } = hexToRgb(hex);
    return `rgb(${r}, ${g}, ${b})`;
  }
  if (mode === "hsl") {
    const { h, s, l } = hexToHsl(hex);
    return `hsl(${h}, ${s}%, ${l}%)`;
  }
  return hex;
}

export function buildTypography(settings) {
  const fontSize = settings.responsive
    ? `clamp(${settings.minFontSize}px, ${Math.max(1, settings.fontSize / 16).toFixed(2)}vw, ${settings.maxFontSize}px)`
    : `${settings.fontSize}${settings.fontSizeUnit}`;
  const gradient = `linear-gradient(${settings.gradientAngle}deg, ${settings.gradientFrom}, ${settings.gradientTo})`;
  const textShadow = settings.shadowEnabled
    ? `${settings.shadowX}px ${settings.shadowY}px ${settings.shadowBlur}px ${settings.shadowColor}`
    : "none";

  const style = {
    fontFamily: getFontCss(settings.fontFamily),
    fontSize,
    fontWeight: settings.fontWeight,
    fontStyle: settings.fontStyle,
    textTransform: settings.textTransform,
    letterSpacing: `${settings.letterSpacing}px`,
    lineHeight: settings.lineHeight,
    textAlign: settings.textAlign,
    color: settings.gradientEnabled ? "transparent" : formatColor(settings.color, settings.colorMode),
    textShadow,
    overflowWrap: "anywhere",
    wordBreak: "break-word",
  };

  if (settings.gradientEnabled) {
    style.backgroundImage = gradient;
    style.WebkitBackgroundClip = "text";
    style.backgroundClip = "text";
  }

  return { style, fontSize, gradient, textShadow };
}

export function generateCss(settings) {
  const { fontSize, gradient, textShadow } = buildTypography(settings);
  const fontUrl = getGoogleFontUrl(settings);
  const lines = [];
  if (fontUrl) {
    lines.push(`@import url("${fontUrl}");`, "");
  }
  lines.push(
    ".generated-font-style {",
    `  font-family: ${getFontCss(settings.fontFamily)};`,
    `  font-size: ${fontSize};`,
    `  font-weight: ${settings.fontWeight};`,
    `  font-style: ${settings.fontStyle};`,
    `  text-transform: ${settings.textTransform};`,
    `  letter-spacing: ${settings.letterSpacing}px;`,
    `  line-height: ${settings.lineHeight};`,
    `  text-align: ${settings.textAlign};`,
  );

  if (settings.gradientEnabled) {
    lines.push(`  background-image: ${gradient};`, "  -webkit-background-clip: text;", "  background-clip: text;", "  color: transparent;");
  } else {
    lines.push(`  color: ${formatColor(settings.color, settings.colorMode)};`);
  }

  if (settings.shadowEnabled) lines.push(`  text-shadow: ${textShadow};`);
  lines.push("}");
  return lines.join("\n");
}

export function countCssProperties(css) {
  return css.split("\n").filter((line) => line.trim().includes(":")).length;
}
