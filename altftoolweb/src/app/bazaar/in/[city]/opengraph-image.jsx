import { ImageResponse } from "next/og";

import { getCity } from "../../data/cities";
import { getCityCounts } from "../../data/listings";

/**
 * Share preview for a city directory — /bazaar/in/<city>/opengraph-image
 *
 * Same visual system as the listing and category cards: ink background, teal
 * ramp, one enormous number, no chrome. A forwarded city link answers one
 * question — "is there anything near me?" — so the ad count is the headline
 * and the state is the disambiguator (there is more than one Hyderabad-shaped
 * argument in India's city list).
 *
 * Follows `src/app/blogs/[slug]/opengraph-image.jsx` for structure and exports.
 *
 * ⚠️ RAW HEX IS CORRECT HERE. satori has no CSS variables, no cascade and no
 * stylesheet, so the design-system teal ramp (`--anslation-ds-brand-*`) is
 * written out literally. This is the one place the "never raw hex" rule is off.
 */

export const runtime = "nodejs";
export const alt = "AltF Bazaar city directory";
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
  const { city: slug } = await params;
  const city = getCity(slug);

  // A GEO place Bazaar does not serve still gets a branded card rather than a
  // 500 — the route is only ever hit after the link is already in a chat.
  const name = city ? city.name : "AltF Bazaar";
  const count = city ? getCityCounts().get(city.slug) || 0 : 0;
  const localities = city ? city.localities.slice(0, 3).join(" · ") : "";
  const subtitle = city
    ? localities || city.stateName
    : "Buy and sell locally across 24 categories and 50 Indian cities.";
  const nameFontSize = name.length > 18 ? 82 : name.length > 12 ? 96 : 110;

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
            {city ? trimText(city.stateName.toUpperCase(), 24) : "INDIA"}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", width: 140, height: 10, borderRadius: 999, background: TEAL }} />
          <div style={{ display: "flex", marginTop: 26, fontSize: 36, fontWeight: 700, color: TEAL_SOFT }}>
            {city ? "For sale in" : "Local classifieds"}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 6,
              maxWidth: 1050,
              fontSize: nameFontSize,
              fontWeight: 900,
              lineHeight: 1.02,
              letterSpacing: -2,
              color: WHITE,
            }}
          >
            {trimText(name, 34)}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 18,
              maxWidth: 1000,
              fontSize: 30,
              lineHeight: 1.25,
              color: MUTED,
            }}
          >
            {trimText(subtitle, 96)}
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
