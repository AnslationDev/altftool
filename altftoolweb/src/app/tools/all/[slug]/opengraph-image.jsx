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

export default async function Image({ params }) {
  const { slug } = await params;
  const tool = toolMetaMap[slug];

  const name = trim(tool?.name || titleFromSlug(slug), 62);
  const description = trim(tool?.description || "A free browser tool on AltFTool.", 140);
  const category = trim(firstCategory(tool), 28);
  // iconColor is the tool's own accent in the catalog, so one card differs from
  // its neighbour before anyone reads the title. Brand cyan when a record has
  // none.
  const accent = String(tool?.iconColor || "").trim() || "#22D3EE";
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
