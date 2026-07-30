import ToolCatalogClient from "./ToolCatalogClient";

// This page is registered `superadminOnly: true` in adminRoutes.js. It used to
// import TOOL_CATALOG directly and pass the full 3,900+ item catalog as a
// server-rendered prop, so the data shipped in the server response to anyone
// who requested the page — before any client-side auth check had a chance to
// run. There's no session cookie / middleware in this app for a Server
// Component to check identity against, so the fix mirrors the pattern every
// other superadminOnly page in this console already uses (e.g. /analytics):
// the page renders no data itself, and ToolCatalogClient fetches it from
// /api/tools/catalog, which requires a verified superadmin Bearer token.
export default function ToolCatalogPage() {
  return <ToolCatalogClient />;
}
