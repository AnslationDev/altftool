"use client";

import NextTopLoader from "nextjs-toploader";

export default function GlobalNavigationLoader() {
  return (
    <NextTopLoader
      color="linear-gradient(90deg, var(--primary), var(--secondary))"
      crawl
      crawlSpeed={160}
      easing="ease"
      height={3}
      initialPosition={0.08}
      showSpinner={false}
      shadow="0 0 12px color-mix(in srgb, var(--primary) 30%, transparent), 0 0 18px color-mix(in srgb, var(--secondary) 24%, transparent)"
      speed={220}
      zIndex={9999}
    />
  );
}
