"use client";

import { useState } from "react";

/**
 * Favicon-based tool logo with a gradient letter tile fallback, so a card
 * never renders a broken image regardless of what the favicon service returns.
 */
export default function ToolLogo({ name, domain, hue = ["#8b5cf6", "#22d3ee"], size = 56, className = "" }) {
  const [failed, setFailed] = useState(false);

  if (failed || !domain) {
    return (
      <span
        aria-hidden="true"
        className={`flex items-center justify-center rounded-xl font-bold text-white ${className}`}
        style={{
          width: size,
          height: size,
          fontSize: size * 0.42,
          backgroundImage: `linear-gradient(135deg, ${hue[0]}, ${hue[1]})`,
        }}
      >
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`rounded-xl object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
