"use client";

import { usePathname } from "next/navigation";

/**
 * Hides the global AltFTool header/footer on sections that ship their own
 * chrome (e.g. /altfloveimg). Wrap <Header/> and <Footer/> with this.
 */
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
  "/kym",
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
  const hidden = SELF_CHROME_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  if (hidden) return null;
  return children;
}
