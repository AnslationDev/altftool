"use client";

import { usePathname } from "next/navigation";
import { isPublicShellHidden } from "./siteRoutes";

/**
 * Shows the global AltFTool header/footer on standard public routes.
 * Sections with custom chrome stay isolated.
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

  if (hasSelfChrome || isPublicShellHidden(pathname)) return null;
  return children;
}
