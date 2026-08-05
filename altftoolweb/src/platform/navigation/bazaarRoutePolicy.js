const BAZAAR_ROUTE_PREFIX = "/bazaar";

export function isBazaarRouteBlocked(
  pathname,
  enabledValue = process.env.ALTFT_BAZAAR_ENABLED,
) {
  const isBazaarRoute =
    pathname === BAZAAR_ROUTE_PREFIX ||
    pathname.startsWith(`${BAZAAR_ROUTE_PREFIX}/`);

  return isBazaarRoute && enabledValue !== "true";
}
