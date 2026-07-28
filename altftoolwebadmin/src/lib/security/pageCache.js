// Module-level cache for the Security screen (src/app/(protected)/security/page.jsx):
// data survives tab switches within the SPA session, so re-opening the tab
// renders instantly instead of refetching. Lives in its own tiny module
// (rather than inline in the page) so AuthContext can clear it on logout
// without pulling that page's much heavier import graph (ansets, icons,
// DataTable, ...) into every route's bundle.
export const pageCache = new Map();

export function clearSecurityCache() {
  pageCache.clear();
}
