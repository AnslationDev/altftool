"use client";

import React, { useState } from "react";

// Only these skin "type"s ship a distinct photographic image for both faces
// (see public/images/coin/*_heads.* and *_tails.*). Every other skin only has
// a "<type>_heads" photo, so those skins render their own symbol/sub-text
// identity (already defined per-skin in coinSkins.js) for whichever side has
// no photo, instead of silently reusing the heads photo or a different
// skin's ruble art for the tails face.
const PHOTO_TYPES = new Set(["usdollar", "usd", "ruble"]);

export default function RealCoinArt({ skin, side }) {
  const isHeads = side === "heads";
  const type = skin?.type || skin?.id;

  const [hasError, setHasError] = useState(false);

  if (PHOTO_TYPES.has(type)) {
    let imgSrc = isHeads ? "/images/coin/ruble_heads.png" : "/images/coin/ruble_tails.png";
    let altText = isHeads ? "Heads (Obverse)" : "Tails (Reverse)";
    let imgScale = "scale-[1.04]";

    if (type === "usdollar" || type === "usd") {
      imgSrc = isHeads ? "/images/coin/usdollar_heads.jpg" : "/images/coin/usdollar_tails.jpg";
      altText = isHeads ? "US Dollar Heads" : "US Dollar Tails";
      imgScale = isHeads ? "scale-[1.06]" : "scale-[1.18]";
    }

    return (
      <div className="relative h-full w-full rounded-full overflow-hidden select-none bg-gradient-to-br from-gray-200 via-gray-400 to-gray-600">
        {!hasError ? (
          <img
            src={imgSrc}
            alt={altText}
            onError={() => setHasError(true)}
            className={`h-full w-full object-cover rounded-full ${imgScale}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-black text-2xl text-white drop-shadow">
            {isHeads ? "H" : "T"}
          </div>
        )}
        {/* Specular Light Reflection Sweep */}
        <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/20 to-transparent" />
      </div>
    );
  }

  // No photo exists for this skin on either face — render the skin's own
  // symbol/sub-text (from coinSkins.js) so heads and tails are visually
  // distinct and always match the currently selected skin.
  const symbol = (isHeads ? skin?.headsSymbol : skin?.tailsSymbol) || (isHeads ? "H" : "T");
  const sub = isHeads ? skin?.headsSub : skin?.tailsSub;
  const background =
    (isHeads ? skin?.bgGradientHeads : skin?.bgGradientTails) ||
    "linear-gradient(135deg, #E5E7EB, #6B7280)";

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center gap-1 rounded-full overflow-hidden select-none px-3 text-center"
      style={{ background, color: skin?.textColor }}
    >
      <span className="sr-only">
        {`${skin?.name || "Coin"} — ${isHeads ? "heads" : "tails"} side`}
      </span>
      <span className="text-4xl font-black leading-none drop-shadow-sm" aria-hidden="true">
        {symbol}
      </span>
      {sub ? (
        <span
          className="text-[10px] font-bold uppercase tracking-wide opacity-80"
          aria-hidden="true"
        >
          {sub}
        </span>
      ) : null}
      {/* Specular Light Reflection Sweep */}
      <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/20 to-transparent" />
    </div>
  );
}
