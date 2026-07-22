// Centralized link helper for the TripFindBox app.
//
// TripFindBox is integrated into AltFTool as a sub-route under "/business-ops/tripfindbox".
// Internally it was built as a standalone app, so many links/redirects use
// root-relative paths like "/blogs/x", "/flights-to-bali" or "/privacy-policy".
// On the live site those resolve to the MAIN AltFTool site (404 / wrong page).
//
// tfbPath() rewrites internal absolute paths to live under /business-ops/tripfindbox, while
// leaving external URLs, anchors, tel/mailto and already-prefixed paths alone.
// Use it for every internal href and router.push inside the TripFindBox app.

export const TFB_BASE = "/business-ops/tripfindbox";

export function tfbPath(href) {
  if (typeof href !== "string" || href.length === 0) return href;

  // Absolute or protocol-relative external URLs → leave untouched.
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(href) || href.startsWith("//")) return href;

  // Non-navigational / in-page links → leave untouched.
  if (/^(tel:|mailto:|#|\?)/.test(href)) return href;

  // Already inside the TripFindBox app → leave untouched.
  if (href === TFB_BASE || href.startsWith(`${TFB_BASE}/`) || href.startsWith(`${TFB_BASE}#`)) {
    return href;
  }

  // Internal absolute path → prefix with the TripFindBox base.
  if (href.startsWith("/")) return `${TFB_BASE}${href}`;

  // Relative or unknown → leave as-is.
  return href;
}
