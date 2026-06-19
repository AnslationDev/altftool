"use client";

import { usePathname } from "next/navigation";

/**
 * Hides the global AltFTool header/footer on sections that ship their own
 * chrome (e.g. /altfloveimg). Wrap <Header/> and <Footer/> with this.
 */
const SELF_CHROME_PREFIXES = ["/altfloveimg", "/altflovepdf"];

export default function GlobalChromeGate({ children }) {
  const pathname = usePathname() || "";
  const hidden = SELF_CHROME_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  if (hidden) return null;
  return children;
}
