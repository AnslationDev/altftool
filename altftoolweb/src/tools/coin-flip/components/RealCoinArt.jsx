"use client";

import React, { useState } from "react";

export default function RealCoinArt({ type, side }) {
  const isHeads = side === "heads";

  let imgSrc = isHeads ? "/images/coin/ruble_heads.png" : "/images/coin/ruble_tails.png";
  let altText = isHeads ? "Heads (Obverse)" : "Tails (Reverse)";
  let imgScale = "scale-[1.04]";

  if (type === "usdollar" || type === "usd") {
    imgSrc = isHeads ? "/images/coin/usdollar_heads.jpg" : "/images/coin/usdollar_tails.jpg";
    altText = isHeads ? "US Dollar Heads" : "US Dollar Tails";
    imgScale = isHeads ? "scale-[1.06]" : "scale-[1.18]";
  } else if (type === "euro") {
    imgSrc = "/images/coin/euro_heads.png";
    altText = "2 Euro Coin";
  } else if (type === "cricket") {
    imgSrc = "/images/coin/cricket_heads.png";
    altText = "Cricket Toss Coin";
  } else if (type === "olympics") {
    imgSrc = "/images/coin/olympics_heads.png";
    altText = "Olympics Gold Medal";
  } else if (type === "gold") {
    imgSrc = "/images/coin/gold_heads.png";
    altText = "24K Gold Bullion";
  } else if (type === "silver") {
    imgSrc = "/images/coin/silver_heads.png";
    altText = "999 Fine Silver";
  } else if (type === "bitcoin") {
    imgSrc = "/images/coin/bitcoin_heads.png";
    altText = "Bitcoin BTC Token";
  }

  const [hasError, setHasError] = useState(false);

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
