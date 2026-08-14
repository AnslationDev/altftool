// Product families retained in Git for remediation, but kept unreachable until
// their rankings and other credibility claims are backed by verifiable sources.
const QUARANTINED_ROUTE_PREFIXES = Object.freeze([
  "/ai-explore",
  "/animalhub",
  "/top3",
  "/top8",
  "/top11",
  "/tradeon",
]);

export function isQuarantinedRoute(pathname = "/") {
  return QUARANTINED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export { QUARANTINED_ROUTE_PREFIXES };
