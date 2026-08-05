import { ImageResponse } from "next/og";

import { formatPrice, getListing } from "../../data/listings";

/**
 * Share preview for a single ad — /bazaar/item/<slug>/opengraph-image
 *
 * In Indian classifieds an ad is forwarded on WhatsApp far more often than it
 * is linked anywhere else, so this image *is* the product surface for most of
 * the traffic a listing ever sees. It is designed to survive being scaled to a
 * ~200px chat thumbnail: the price is enormous, the contrast is high, and
 * there is no decorative chrome competing with it.
 *
 * Follows `src/app/blogs/[slug]/opengraph-image.jsx` exactly — same imports,
 * same ImageResponse call, same runtime/size/contentType/alt exports.
 *
 * ⚠️ RAW HEX IS CORRECT HERE. Everywhere else in this codebase colours come
 * from CSS variables, but ImageResponse renders through satori in an edge-ish
 * runtime with a restricted CSS subset: no custom properties, no cascade, no
 * stylesheet at all. Inline hex is the only thing that works. The values below
 * are the design-system teal ramp (`--anslation-ds-brand-*`) written out
 * literally: 400 #2dd4bf, 500 #14b8a6, 600 #0d9488, 900 #134e4a.
 *
 * There is deliberately NO remote image fetch. Listing photos point at
 * picsum.photos and a failed fetch inside ImageResponse throws, which turns
 * the whole route into a 500 — an error nobody sees until an ad is shared and
 * the preview comes back blank. A generated design cannot fail.
 */

export const runtime = "nodejs";
export const alt = "AltF Bazaar listing";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const INK = "#08211f";
const INK_PANEL = "#0d302c";
const TEAL = "#2dd4bf";
const TEAL_DEEP = "#0d9488";
const TEAL_SOFT = "#99f6e4";
const WHITE = "#ffffff";
const MUTED = "#cbead9";
const AMBER = "#fbbf24";
const GREEN = "#4ade80";

/** Hard character clamp — satori has no reliable line-clamp, so clamp the text. */
function trimText(value = "", maxLength = 80) {
  const text = String(value).replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).replace(/\s+\S*$/, "")}…`;
}

/** The brand lockup, reused by the real and the fallback image. */
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

function Badge({ label, background, color }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginLeft: 12,
        borderRadius: 999,
        padding: "10px 22px",
        background,
        color,
        fontSize: 24,
        fontWeight: 900,
        letterSpacing: 0.4,
      }}
    >
      {label}
    </div>
  );
}

/** Generic branded card — served when the slug does not resolve, never a 500. */
function fallbackImage() {
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
          padding: 64,
        }}
      >
        <BrandLockup />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", width: 140, height: 10, borderRadius: 999, background: TEAL }} />
          <div
            style={{
              display: "flex",
              marginTop: 26,
              fontSize: 76,
              fontWeight: 900,
              lineHeight: 1.05,
              color: WHITE,
            }}
          >
            Buy and sell locally
          </div>
          <div style={{ display: "flex", marginTop: 18, fontSize: 34, color: MUTED }}>
            24 categories · 50 Indian cities · free to post
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 26, fontWeight: 800, color: TEAL_SOFT }}>
          altftool.com/bazaar
        </div>
      </div>
    ),
    size,
  );
}

export default async function Image({ params }) {
  const { slug } = await params;
  const listing = getListing(slug);

  if (!listing) return fallbackImage();

  const free = listing.price === 0;
  const price = formatPrice(listing.price);
  const title = trimText(listing.title, 76);
  // The price is the whole point of the image, so it gets the largest type the
  // widest realistic value ("₹1,25,00,000") can carry without wrapping.
  const priceFontSize = price.length > 11 ? 96 : price.length > 8 ? 116 : 132;
  const titleFontSize = title.length > 56 ? 42 : 48;
  const place = trimText(`${listing.locality}, ${listing.cityName}`, 46);
  const taxonomy = trimText(`${listing.categoryName} · ${listing.subcategoryName}`, 52);

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
        {/* Header: brand left, promotion state right */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <BrandLockup />
          <div style={{ display: "flex", alignItems: "center" }}>
            {free ? <Badge label="FREE" background={GREEN} color={INK} /> : null}
            {listing.spotlight ? (
              <Badge label="SPOTLIGHT" background={AMBER} color={INK} />
            ) : listing.featured ? (
              <Badge label="FEATURED" background={AMBER} color={INK} />
            ) : null}
            {listing.negotiable && !free ? (
              <Badge label="NEGOTIABLE" background={INK_PANEL} color={TEAL_SOFT} />
            ) : null}
          </div>
        </div>

        {/* The money shot */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <div
              style={{
                display: "flex",
                fontSize: priceFontSize,
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: -2,
                color: free ? GREEN : TEAL,
              }}
            >
              {price}
            </div>
            {listing.pricePeriod ? (
              <div
                style={{
                  display: "flex",
                  marginLeft: 16,
                  marginBottom: 14,
                  fontSize: 38,
                  fontWeight: 800,
                  color: TEAL_SOFT,
                }}
              >
                {listing.pricePeriod}
              </div>
            ) : null}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 24,
              maxWidth: 1000,
              fontSize: titleFontSize,
              fontWeight: 700,
              lineHeight: 1.18,
              color: WHITE,
            }}
          >
            {title}
          </div>
        </div>

        {/* Footer: where it is, and who is hosting it */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", width: "100%", height: 4, background: TEAL_DEEP }} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginTop: 26,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 34, fontWeight: 800, color: WHITE }}>
                {place}
              </div>
              <div style={{ display: "flex", marginTop: 8, fontSize: 27, color: MUTED }}>
                {taxonomy}
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
