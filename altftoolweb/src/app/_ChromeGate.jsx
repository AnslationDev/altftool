"use client";

import { usePathname } from "next/navigation";

// Hides AltFTool site chrome (header, footer, cookie banner, chatbot) for routes
// that render their own full-page shell — e.g. the integrated /tripfindbox app.
export default function ChromeGate({ children }) {
  const pathname = usePathname();
  if (pathname && pathname.startsWith("/tripfindbox")) return null;
  return children;
}
