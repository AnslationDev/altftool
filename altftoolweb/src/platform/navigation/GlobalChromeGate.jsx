"use client";

import { usePathname } from "next/navigation";

/**
 * Shows the landing AltFTool header/footer only on routes that use the
 * landing chrome. Sections with custom chrome stay isolated.
 */
const LANDING_CHROME_PREFIXES = [
  "/",
  "/tools",
];

const SELF_CHROME_PREFIXES = [
  // microsites with their own header/footer
  "/altfloveimg",
  "/altflovepdf",
  "/apps",
  "/tripfindbox",
  "/homeserv",
  // immersive / experiential apps (no global chrome)
  "/flightradar",
  "/live-activity-simulation",
  "/soft-murmur",
  "/prank-socialmedia",
  "/fact-net",
  "/patatap",
  "/radio-garden",
  "/windowswap",
  "/pixel-thought",
  "/sketchflow",
  "/playbuzz",
  "/pranx",
  "/bharat-virasat",
];

export default function GlobalChromeGate({ children }) {
  const pathname = usePathname() || "";
  const hasSelfChrome = SELF_CHROME_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  const usesLandingChrome = LANDING_CHROME_PREFIXES.some((p) =>
    p === "/" ? pathname === "/" : pathname === p || pathname.startsWith(`${p}/`)
  );

  if (hasSelfChrome || !usesLandingChrome) return null;
  return children;
}
