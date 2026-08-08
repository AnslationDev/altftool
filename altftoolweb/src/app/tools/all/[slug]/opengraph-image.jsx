import { ImageResponse } from "next/og";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";

/**
 * Per-tool share card.
 *
 * Every one of the ~3,800 tool pages fell back to /assets/og-default.png,
 * because tool records carry `icon` and `iconColor` but no image and this route
 * passed none to createPageMetadata. A link to the JSON formatter and a link to
 * the BMI calculator therefore looked identical everywhere they were shared —
 * X, LinkedIn, Slack, WhatsApp, Discord — and an identical card is one nobody
 * clicks. Shares that are not clicked do not become links.
 *
 * Same next/og pattern as blogs/[slug]/opengraph-image.jsx. Generated on
 * request rather than at build time: 3,800 prerendered PNGs would cost more
 * Amplify artifact than the whole of the rest of this branch.
 *
 * toolMetaMap is safe to import from a server module — sitemap.js already does.
 * The build guard that stops server code reading the stubbed-out runtime map
 * does a plain substring match over the whole file, comments included, so do
 * not name the guarded modules here: writing them in a comment fails the build
 * even when nothing imports them. (That is how this file first failed.)
 */
export const runtime = "nodejs";
export const alt = "AltFTool tool";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** A tool's category may be a string or an array; take the first real one. */
function firstCategory(tool) {
  const raw = Array.isArray(tool?.category) ? tool.category : [tool?.category];
  return raw.map((value) => String(value || "").trim()).filter(Boolean)[0] || "Free tool";
}

function trim(value = "", maxLength = 120) {
  const text = String(value).replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).replace(/\s+\S*$/, "")}…`;
}

function titleFromSlug(slug = "") {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/**
 * The catalog's `iconColor` is a Tailwind *class* ("text-teal-600",
 * "text-[var(--primary)]"), never a colour. Handing it straight to satori threw
 * `Failed to parse declaration "border: 1px solid text-teal-600"` and returned
 * 500 for all ~3,800 tools, so no card rendered at all.
 *
 * Two things are fixed by resolving the class here. The class has to become a
 * real colour, and it has to become a colour that is legible on #070D18: the
 * catalog picked its shades for white page backgrounds, so the popular ones are
 * far too dark on the card (blue-600 is 3.7:1 across 98 tools, indigo-600 3.0:1,
 * violet-600 3.3:1, slate-800 1.3:1 — all below AA's 4.5:1).
 *
 * So each hue maps to its 400 shade, which is the same hue the catalog asked for
 * — cards stay distinguishable — at a lightness that clears AA on navy. Every
 * entry below is >=6.2:1. Teal and cyan use the brand ramp values rather than
 * Tailwind's, per master.md: on dark surfaces primary brightens to Teal-400 and
 * secondary is Cyan-400.
 */
const ACCENT_BY_HUE = {
  // Brand.
  primary: "#2DD4BF",
  secondary: "#22D3EE",
  teal: "#2DD4BF",
  cyan: "#22D3EE",
  // Status roles, lifted to the same readable band as the hues above.
  success: "#05DF72",
  warning: "#FFB900",
  danger: "#FF6467",
  error: "#FF6467",
  info: "#00BCFF",
  // Neutrals — "text-muted-foreground" and friends.
  muted: "#90A1B9",
  foreground: "#90A1B9",
  slate: "#90A1B9",
  gray: "#99A1AF",
  grey: "#99A1AF",
  zinc: "#9F9FA9",
  neutral: "#A1A1A1",
  stone: "#A6A09B",
  // Chromatic families.
  red: "#FF6467",
  orange: "#FF8904",
  amber: "#FFB900",
  yellow: "#FDC700",
  lime: "#9AE600",
  green: "#05DF72",
  emerald: "#00D492",
  sky: "#00BCFF",
  blue: "#51A2FF",
  indigo: "#7C86FF",
  violet: "#A684FF",
  purple: "#C27AFF",
  fuchsia: "#ED6AFF",
  pink: "#FB64B6",
  rose: "#FF637E",
};

const CARD_BACKGROUND_RGB = [0x07, 0x0d, 0x18];
const MIN_CONTRAST = 4.5;

function toRgb(hex) {
  const value = hex.replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((character) => character + character)
          .join("")
      : value.slice(0, 6);
  return [0, 2, 4].map((offset) => parseInt(full.slice(offset, offset + 2), 16) || 0);
}

function relativeLuminance(rgb) {
  const [r, g, b] = rgb.map((channel) => {
    const ratio = channel / 255;
    return ratio <= 0.03928 ? ratio / 12.92 : ((ratio + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastOnCard(rgb) {
  const a = relativeLuminance(rgb);
  const b = relativeLuminance(CARD_BACKGROUND_RGB);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** Mix toward white until the colour clears AA, so the hue survives. */
function lightenUntilLegible(hex) {
  let rgb = toRgb(hex);
  for (let step = 0; step < 12 && contrastOnCard(rgb) < MIN_CONTRAST; step += 1) {
    rgb = rgb.map((channel) => Math.round(channel + (255 - channel) * 0.18));
  }
  return `#${rgb.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * "text-[var(--primary)]", "text-(--primary)", "text-primary", "text-teal-600"
 * and the catalog's two typos ("text-blue--500", "text-black-600") all have to
 * land on something renderable, so reduce each to its hue word and look it up.
 */
function resolveAccent(iconColor) {
  const token = String(iconColor || "").trim().toLowerCase();
  if (!token) return "#22D3EE";
  // A literal colour is honoured, only lightened if it would be unreadable.
  if (/^#[0-9a-f]{3,8}$/.test(token)) return lightenUntilLegible(token);

  const hue = token
    .replace(/^text-/, "")
    .replace(/[[\]()]/g, "")
    .replace(/^var/, "")
    .replace(/^-+/, "")
    .match(/^[a-z]+/)?.[0];

  // Brand cyan for anything unrecognised ("text-black-600" has no Tailwind hue).
  return ACCENT_BY_HUE[hue] || "#22D3EE";
}

/**
 * Hues to spread categories across, in the same readable band as ACCENT_BY_HUE.
 * Teal is absent on purpose: it is the brand colour every logo already carries,
 * so reserving it keeps the category accents distinct from the mark.
 */
const CATEGORY_ACCENTS = [
  "#22D3EE", // cyan
  "#51A2FF", // blue
  "#A684FF", // violet
  "#FB64B6", // pink
  "#FF8904", // orange
  "#05DF72", // green
  "#FDC700", // yellow
  "#00D492", // emerald
  "#C27AFF", // purple
  "#FF637E", // rose
];

/**
 * The accent that actually differentiates one card from the next.
 *
 * 2,888 of the 3,816 tools carry `text-primary` or `text-[var(--primary)]`, so
 * honouring iconColor alone paints 76% of cards the same teal and the whole
 * point of a per-tool card — that two shares look different in a feed — is lost
 * on three quarters of them.
 *
 * So a tool with its own deliberate colour keeps it, and the majority that just
 * inherit the brand primary take a colour derived from their category instead.
 * Same category always yields the same hue, which reads as deliberate rather
 * than random, and spreads the catalog across ten hues instead of one.
 */
function resolveCardAccent(tool, category) {
  const token = String(tool?.iconColor || "").trim().toLowerCase();
  const inheritsBrandPrimary = !token || /primary/.test(token);
  if (!inheritsBrandPrimary) return resolveAccent(tool?.iconColor);

  let hash = 0;
  for (const character of String(category)) {
    hash = (hash * 31 + character.charCodeAt(0)) % 100000;
  }
  return CATEGORY_ACCENTS[hash % CATEGORY_ACCENTS.length];
}

export default async function Image({ params }) {
  const { slug } = await params;
  const tool = toolMetaMap[slug];

  const name = trim(tool?.name || titleFromSlug(slug), 62);
  const description = trim(tool?.description || "A free browser tool on AltFTool.", 140);
  const category = trim(firstCategory(tool), 28);
  const accent = resolveCardAccent(tool, category);
  const topics = Array.isArray(tool?.topics)
    ? tool.topics.filter(Boolean).slice(0, 3).map((topic) => trim(topic, 22))
    : [];
  const nameFontSize = name.length > 44 ? 56 : name.length > 30 ? 66 : 76;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#070D18",
          color: "#F8FAFC",
          fontFamily: "Arial",
          padding: 56,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            border: "1px solid rgba(148,163,184,0.22)",
            borderRadius: 32,
            background: "linear-gradient(135deg, rgba(20,184,166,0.12), rgba(7,13,24,0) 55%)",
            padding: 52,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 28, fontWeight: 900 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: "#14B8A6",
                  color: "#070D18",
                }}
              >
                A
              </div>
              AltFTool
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                borderRadius: 999,
                border: `1px solid ${accent}`,
                padding: "12px 22px",
                fontSize: 22,
                fontWeight: 800,
                color: accent,
              }}
            >
              {category}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
            <div style={{ display: "flex", width: 120, height: 8, borderRadius: 999, background: accent }} />
            <div
              style={{
                display: "flex",
                fontSize: nameFontSize,
                lineHeight: 1.04,
                fontWeight: 900,
                maxWidth: 960,
              }}
            >
              {name}
            </div>
            <div style={{ display: "flex", fontSize: 28, lineHeight: 1.36, color: "#94A3B8", maxWidth: 940 }}>
              {description}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
            <div style={{ display: "flex", gap: 12 }}>
              {topics.map((topic) => (
                <div
                  key={topic}
                  style={{
                    display: "flex",
                    border: "1px solid rgba(148,163,184,0.3)",
                    borderRadius: 999,
                    padding: "10px 18px",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#CBD5E1",
                  }}
                >
                  {topic}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", fontSize: 24, fontWeight: 900, color: "#F8FAFC" }}>
              altftool.com
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
