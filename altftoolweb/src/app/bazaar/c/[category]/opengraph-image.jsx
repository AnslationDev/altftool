import { ImageResponse } from "next/og";

import { getCategory } from "../../data/categories";
import { getCategoryCounts } from "../../data/listings";

/**
 * Share preview for a category — /bazaar/c/<category>/opengraph-image
 *
 * Same visual system as the listing card (`item/[slug]/opengraph-image.jsx`):
 * ink background, teal ramp, one enormous number, no chrome. Where the listing
 * shouts a price, a category shouts its live ad count — that is the only fact
 * that makes someone tap a category link they were forwarded.
 *
 * Follows `src/app/blogs/[slug]/opengraph-image.jsx` for structure and exports.
 *
 * ⚠️ RAW HEX IS CORRECT HERE. satori has no CSS variables, no cascade and no
 * stylesheet, so the design-system teal ramp (`--anslation-ds-brand-*`) is
 * written out literally. This is the one place the "never raw hex" rule is off.
 */

export const runtime = "nodejs";
export const alt = "AltF Bazaar category";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const INK = "#08211f";
const TEAL = "#2dd4bf";
const TEAL_DEEP = "#0d9488";
const TEAL_SOFT = "#99f6e4";
const WHITE = "#ffffff";
const MUTED = "#cbead9";

function trimText(value = "", maxLength = 80) {
  const text = String(value).replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).replace(/\s+\S*$/, "")}…`;
}

function BrandLockup() {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 62,
          height: 62,
          borderRadius: 16,
          background: TEAL,
          color: INK,
          fontSize: 36,
          fontWeight: 900,
        }}
      >
        AB
      </div>
      <div style={{ display: "flex", flexDirection: "column", marginLeft: 18 }}>
        <div style={{ display: "flex", fontSize: 32, fontWeight: 900, color: WHITE }}>
          AltF Bazaar
        </div>
        <div style={{ display: "flex", fontSize: 20, fontWeight: 700, color: TEAL_SOFT }}>
          Buy. Sell. Nearby.
        </div>
      </div>
    </div>
  );
}

export default async function Image({ params }) {
  const { category: slug } = await params;
  const category = getCategory(slug);

  // An unknown slug must render a generic branded card, never throw: a 500 on
  // this route is invisible until the link is already out in a chat thread.
  const name = category ? category.name : "AltF Bazaar";
  const tagline = category
    ? trimText(category.tagline || category.description, 92)
    : "Buy and sell locally across 24 categories and 50 Indian cities.";
  const count = category ? getCategoryCounts().get(category.slug) || 0 : 0;
  const nameFontSize = name.length > 26 ? 74 : name.length > 18 ? 88 : 100;

  return new ImageResponse(
    (
      <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            background: INK,
            color: WHITE,
            fontFamily: "Arial",
            padding: 56,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <BrandLockup />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                borderRadius: 999,
                padding: "10px 22px",
                background: TEAL_DEEP,
                color: WHITE,
                fontSize: 24,
                fontWeight: 900,
                letterSpacing: 0.4,
              }}
            >
              CATEGORY
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", width: 140, height: 10, borderRadius: 999, background: TEAL }} />
            <div
              style={{
                display: "flex",
                marginTop: 26,
                maxWidth: 1050,
                fontSize: nameFontSize,
                fontWeight: 900,
                lineHeight: 1.02,
                letterSpacing: -2,
                color: WHITE,
              }}
            >
              {trimText(name, 46)}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 20,
                maxWidth: 1000,
                fontSize: 32,
                lineHeight: 1.25,
                color: MUTED,
              }}
            >
              {tagline}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", width: "100%", height: 4, background: TEAL_DEEP }} />
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                width: "100%",
                marginTop: 26,
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline" }}>
                <div
                  style={{
                    display: "flex",
                    fontSize: 76,
                    fontWeight: 900,
                    lineHeight: 1,
                    letterSpacing: -1,
                    color: TEAL,
                  }}
                >
                  {count.toLocaleString("en-IN")}
                </div>
                <div
                  style={{
                    display: "flex",
                    marginLeft: 16,
                    fontSize: 32,
                    fontWeight: 800,
                    color: TEAL_SOFT,
                  }}
                >
                  live ads
                </div>
              </div>
              <div style={{ display: "flex", fontSize: 26, fontWeight: 800, color: TEAL_SOFT }}>
                altftool.com/bazaar
              </div>
            </div>
          </div>
      </div>
    ),
    size,
  );
}
