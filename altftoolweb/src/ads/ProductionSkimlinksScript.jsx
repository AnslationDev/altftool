"use client";

import Script from "next/script";
import { useProductionSite } from "./useProductionSite";

export default function ProductionSkimlinksScript({ enabled = false }) {
  const isProductionSite = useProductionSite(enabled);

  if (!isProductionSite) return null;

  return (
    <Script
      id="skimlinks"
      src="https://s.skimresources.com/js/306210X1794449.skimlinks.js"
      strategy="afterInteractive"
    />
  );
}
