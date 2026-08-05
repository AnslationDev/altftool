"use client";

import { useState } from "react";
import { motion } from "framer-motion";

/**
 * Favicon-based tool logo with a gradient letter tile fallback, so a card
 * never renders a broken image regardless of what the favicon service returns.
 * Fades in once the favicon actually loads instead of popping in abruptly.
 */
export default function ToolLogo({ name, domain, hue = ["#8b5cf6", "#22d3ee"], size = 56, className = "" }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (failed || !domain) {
    return (
      <motion.span
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={`flex items-center justify-center rounded-xl font-bold text-white ${className}`}
        style={{
          width: size,
          height: size,
          fontSize: size * 0.42,
          backgroundImage: `linear-gradient(135deg, ${hue[0]}, ${hue[1]})`,
        }}
      >
        {name.charAt(0).toUpperCase()}
      </motion.span>
    );
  }

  return (
    <motion.img
      src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      onLoad={() => setLoaded(true)}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={loaded ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-xl object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
