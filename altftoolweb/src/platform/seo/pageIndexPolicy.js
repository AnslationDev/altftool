/**
 * Central indexing policy for product previews with generated catalogue data.
 */
const NOINDEX_ROUTE_PREFIXES = Object.freeze([
  "/animalhub",
  "/bazaar",
  "/altfworld",
  "/buzzfeed",
  "/lookouts",
  "/top3",
  "/top5",
  "/top8",
  "/top49",
]);

function normalizePath(value = "/") {
  const raw = String(value || "/").trim();
  if (!raw) return "/";
  try {
    return new URL(raw, "https://altftool.com").pathname.replace(/\/+$/, "") || "/";
  } catch {
    return raw.split(/[?#]/, 1)[0].replace(/\/+$/, "") || "/";
  }
}

export function shouldNoindexPagePath(value = "/") {
  const pathname = normalizePath(value);
  return NOINDEX_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export { NOINDEX_ROUTE_PREFIXES };
