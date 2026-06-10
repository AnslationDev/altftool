"use client";

import NextTopLoader from "nextjs-toploader";

export default function GlobalNavigationLoader() {
  return (
    <NextTopLoader
      color="var(--primary)"
      crawl
      crawlSpeed={160}
      easing="ease"
      height={3}
      initialPosition={0.08}
      showSpinner={false}
      shadow="0 0 12px color-mix(in srgb, var(--primary) 38%, transparent)"
      speed={220}
      zIndex={9999}
    />
  );
}
