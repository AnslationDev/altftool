/**
 * Stable, human-readable id for a tool — used as the Firestore doc key for
 * click counters and as the value stored in a user's saved-tools list.
 * Slugified from the name rather than the domain, since several tools in
 * our data share a domain (e.g. multiple Adobe products on adobe.com).
 */
export function toolId(tool) {
  return tool.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
