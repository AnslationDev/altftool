"use client";

import { usePathname } from "next/navigation";
import { EXPERIENCE_CATALOG } from "@altftool/core/experiences";
import { isPublicShellHidden } from "./siteRoutes";

/**
 * Shows the global AltFTool header/footer on standard public routes.
 * Sections with custom chrome stay isolated.
 */
export const SELF_CHROME_PREFIXES = [
  // Chrome-free iframe widget shells for third-party sites (the /embed hub
  // itself keeps the normal site chrome).
  "/embed/widget",
  // microsites with their own header/footer
  "/altfloveimg",
  "/altflovepdf",
  "/altpintrest",
  "/apps",
  "/tripfindbox",
  "/homeserv",
  "/bops",
  "/housingneeds",
  "/tradeon",
  "/altfcalculators",
  // Top11 ships its own header, footer and mobile bar (app/top11/components/layout).
  "/top11",
  "/top8",
  "/imgprompt/studio",
  // The Labs hub has its own focused header.
  "/labs",
  // Immersive experiences declare their chrome behavior in one catalog.
  ...EXPERIENCE_CATALOG.filter((experience) => experience.selfChrome).map(
    (experience) => experience.href,
  ),
];

export function isSelfChromePath(pathname = "") {
  return SELF_CHROME_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export default function GlobalChromeGate({ children }) {
  const pathname = usePathname() || "";
  const hasSelfChrome = isSelfChromePath(pathname);

  if (hasSelfChrome || isPublicShellHidden(pathname)) return null;
  return children;
}
